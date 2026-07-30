import { DOM_ATTRIBUTES } from '../../utils/constants';
import type { VideoContext } from './types';
import { StateMachine } from './stateMachine';
import { log } from './logger';
import {
  getContainer, getVideoContext, saveOriginalStyles, restoreOriginalStyles,
  isSizeInvalid, fixPosition, getSnapshot, applySnapshot, isFullscreenElement
} from './dom';
import { setMutedWithoutLock, syncStoryMute, loadGlobalFeedMuted } from './audio';
import { injectStoryControlsCSS, injectTagsLiftCSS } from './ui';

export const stateMachine = new StateMachine();

const clickBlockers = new WeakMap<HTMLElement, any>();

function enableClickBlocker(video: HTMLElement) {
  if (clickBlockers.has(video)) return;
  const link = video.closest('a[href]') as HTMLAnchorElement | null;
  if (!link) return;
  const preventDrag = (e: Event) => e.preventDefault();
  const interceptClick = (e: MouseEvent) => {
    const t = e.target as Node;
    if (t !== video && !video.contains(t)) return;
    e.preventDefault();
    const interactable = link.querySelector('[data-interactable*="|click|"]') as HTMLElement;
    if (interactable) {
      interactable.click();
      return;
    }
    setTimeout(() => {
      const parent = link.closest('article') ?? link;
      const inter = parent.querySelector('[data-interactable*="|click|"]') as HTMLElement;
      if (inter) inter.click();
    }, 200);
  };
  link.addEventListener('dragstart', preventDrag);
  link.addEventListener('click', interceptClick);
  clickBlockers.set(video, { link, preventDrag, interceptClick });
}

function disableClickBlocker(video: HTMLElement) {
  const t = clickBlockers.get(video);
  if (t) {
    t.link.removeEventListener('dragstart', t.preventDrag);
    t.link.removeEventListener('click', t.interceptClick);
    clickBlockers.delete(video);
  }
}

function hideSiblings(video: HTMLElement, context: VideoContext) {
  if (context === 'story-viewer') return;
  const c = video.closest('[style*="--x-height"]') ?? video.closest('article') ?? video.parentElement;
  if (!c) return;
  c.querySelectorAll('[aria-label="Video player"], [data-instancekey]').forEach((e) => {
    const el = e as HTMLElement;
    saveOriginalStyles(el);
    el.style.setProperty('pointer-events', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
  });
}

function hidePlayButtons(container: HTMLElement, context: VideoContext) {
  const sel = context === 'story-viewer'
    ? '[aria-label="Press to play"]'
    : '[aria-label="Press to play"], [aria-label="Play"], [aria-label="Toggle audio"], [aria-label="Adjust volume"]';
  container.querySelectorAll(sel).forEach((e) => {
    const el = e as HTMLElement;
    if (context === 'story-viewer' && (el.closest('[aria-label="Previous"]') || el.closest('[aria-label="Next"]'))) return;
    saveOriginalStyles(el);
    el.style.setProperty('pointer-events', 'none', 'important');
  });
}

function hideVolumeButtons(container: HTMLElement) {
  container.querySelectorAll('button[aria-label="Toggle audio"], [aria-label="Audio is muted"], [aria-label="Audio is playing"], [aria-label="Adjust volume"]').forEach((e) => {
    let btn = e.closest('button') ?? e.closest('[role="button"]') ?? e;
    const el = btn as HTMLElement;
    saveOriginalStyles(el);
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('pointer-events', 'none', 'important');
  });
}

function hideOverlays(container: HTMLElement, context: VideoContext) {
  const sel = context === 'story-viewer' ? '[aria-label="Press to play"]' : '[aria-label="Press to play"], [data-visualcompletion="ignore"]';
  container.querySelectorAll(sel).forEach((e) => {
    const el = e as HTMLElement;
    if (!el.querySelector('a[href]')) {
      saveOriginalStyles(el);
      el.style.removeProperty('opacity');
      el.style.setProperty('pointer-events', 'none', 'important');
    }
  });
}

function applyVideoSizing(video: HTMLVideoElement, context: VideoContext) {
  const isFullscreen = isFullscreenElement(video);
  if (context === 'story-viewer') {
    injectStoryControlsCSS();
    video.removeAttribute('data-reels-scrubber-story-layout');
    video.style.setProperty('object-fit', isFullscreen ? 'contain' : 'cover', 'important');
    video.style.setProperty('display', 'block', 'important');
    video.style.setProperty('pointer-events', 'auto', 'important');
    video.style.removeProperty('padding-bottom');
    video.style.removeProperty('box-sizing');
    video.style.removeProperty('width');
    video.style.removeProperty('height');
    video.style.removeProperty('position');
    video.style.removeProperty('top');
    video.style.removeProperty('left');
    if (isFullscreen) {
      video.style.removeProperty('z-index');
    } else {
      video.style.setProperty('z-index', '10', 'important');
    }
    return;
  }
  
  video.removeAttribute('data-reels-scrubber-story-layout');
  video.style.setProperty('position', 'absolute', 'important');
  video.style.setProperty('top', '0', 'important');
  video.style.setProperty('left', '0', 'important');
  video.style.setProperty('width', '100%', 'important');
  video.style.setProperty('height', '100%', 'important');
  video.style.setProperty('pointer-events', 'auto', 'important');
  video.style.setProperty('display', 'block');
  video.style.removeProperty('padding-bottom');
  video.style.removeProperty('box-sizing');
  
  const isFeed = context === 'feed-inline' || context === 'feed-carousel';
  video.style.setProperty('object-fit', !isFullscreen && isFeed ? 'cover' : 'contain', 'important');
  if (isFullscreen) {
    video.style.removeProperty('z-index');
  } else {
    video.style.setProperty('z-index', '9999', 'important');
  }
}

function showHiddenTags(video: HTMLVideoElement, context: VideoContext) {
  if (context === 'story-viewer') return;
  const c = video.closest('[style*="--x-height"]') ?? video.closest('article') ?? video.parentElement;
  if (!c) return;
  injectTagsLiftCSS();
  c.setAttribute('data-reels-scrubber-tags-scope', 'true');
  c.querySelectorAll('button:has(svg[aria-label="Tags"])').forEach((e) => {
    let t = e.parentElement instanceof HTMLElement ? e.parentElement : e;
    const el = t as HTMLElement;
    saveOriginalStyles(el);
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.style.removeProperty('transform');
    el.setAttribute('data-reels-scrubber-tags-lift', 'true');
  });
}

function cleanupStorySpecific(video: HTMLVideoElement) {
  const getTopLayer = (v: HTMLElement) => {
    let t = v.closest('[data-instancekey]');
    if (t?.parentElement instanceof HTMLElement) return t.parentElement;
    let n = v.parentElement;
    while (n && n.tagName !== 'BODY') {
      if ((n.querySelector('[data-instancekey]') && n.querySelector('[aria-label="Toggle audio"], [aria-label="Adjust volume"], [aria-label="Audio is muted"], [aria-label="Audio is playing"]')) || n.tagName === 'SECTION' || n.tagName === 'ARTICLE') return n;
      n = n.parentElement;
    }
    return v.closest('[style*="position: absolute"]') ?? v.parentElement;
  };
  
  const layer = getTopLayer(video);
  if (!layer) return;
  
  layer.querySelectorAll('[data-instancekey] > [aria-label="Video player"], [aria-label="Video player"][data-visualcompletion="ignore"]').forEach((e) => {
    const el = e as HTMLElement;
    saveOriginalStyles(el);
    el.style.setProperty('pointer-events', 'none', 'important');
  });
  
  layer.querySelectorAll('[aria-label="Toggle audio"], [aria-label="Audio is muted"], [aria-label="Audio is playing"], [aria-label="Adjust volume"], [aria-label="Pause"], [aria-label="Play"], [aria-label="Menu"], [aria-label="Next"], [aria-label="Previous"], textarea, [placeholder^="Reply to "]').forEach((e) => {
    let t = e.closest('button') ?? e.closest('[role="button"]') ?? e;
    const el = t as HTMLElement;
    saveOriginalStyles(el);
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.style.setProperty('z-index', '10001', 'important');
    if (window.getComputedStyle(el).position === 'static') {
      el.style.setProperty('position', 'relative', 'important');
    }
  });
  
  hideVolumeButtons(layer as HTMLElement);
}

function applyStyles(video: HTMLVideoElement, container: HTMLElement, context: VideoContext) {
  video.controls = true;
  if (context === 'feed-inline' || context === 'feed-carousel') enableClickBlocker(video);

  const globalMuted = loadGlobalFeedMuted();
  if (context === 'story-viewer') syncStoryMute(video, globalMuted);
  else setMutedWithoutLock(video, globalMuted);

  hideSiblings(video, context);
  hidePlayButtons(container, context);
  hideVolumeButtons(container);
  hideOverlays(container, context);
  
  applyVideoSizing(video, context);
  showHiddenTags(video, context);
  
  if (context === 'story-viewer') {
    cleanupStorySpecific(video);
  }
}

function resetVideoAttributes(video: HTMLVideoElement) {
  video.removeAttribute(DOM_ATTRIBUTES.SCRUBBER_ACTIVE);
  video.controls = false;
  video.style.removeProperty('position');
  video.style.removeProperty('top');
  video.style.removeProperty('left');
  video.style.removeProperty('width');
  video.style.removeProperty('height');
  video.style.removeProperty('z-index');
  video.style.removeProperty('pointer-events');
  video.style.removeProperty('object-fit');
  video.style.removeProperty('display');
  video.style.removeProperty('max-width');
  video.style.removeProperty('max-height');
  video.style.removeProperty('padding-bottom');
  video.style.removeProperty('box-sizing');
  video.style.removeProperty('overflow');
  video.removeAttribute('data-reels-scrubber-story-layout');
  document.getElementById('reels-scrubber-story-controls')?.remove();
}

export function patchVideo(video: HTMLVideoElement) {
  if (video.hasAttribute(DOM_ATTRIBUTES.SCRUBBER_ACTIVE)) {
    const container = getContainer(video);
    if (container) {
      applyStyles(video, container, getVideoContext(video));
      return stateMachine.markPatched(video);
    }
    return stateMachine.markSkipped(video, 'already_patched');
  }
  const snapshot = getSnapshot(video);
  stateMachine.markPatching(video, snapshot);
  try {
    const container = getContainer(video);
    if (!container) return stateMachine.markFailed(video, 'container_not_found');
    fixPosition(container);
    
    applyStyles(video, container, getVideoContext(video));
    container.style.setProperty('pointer-events', 'auto', 'important');
    
    if (isSizeInvalid(video)) {
      throw new Error('Video size is invalid after patch');
    }
    
    video.setAttribute(DOM_ATTRIBUTES.SCRUBBER_ACTIVE, 'true');
    log('info', 'Video patched');
    return stateMachine.markPatched(video);
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    stateMachine.markFailed(video, 'dom_error', msg);
    return rollbackVideo(video);
  }
}

export function rollbackVideo(video: HTMLVideoElement) {
  const snapshot = stateMachine.get(video).snapshot;
  if (!snapshot) {
    disableClickBlocker(video);
    restoreOriginalStyles(video);
    resetVideoAttributes(video);
    log('warn', 'Patch force-reset without snapshot');
    return stateMachine.markRolledBack(video);
  }
  stateMachine.markRollbackInProgress(video);
  try {
    disableClickBlocker(video);
    restoreOriginalStyles(video);
    applySnapshot(video, snapshot);
    video.removeAttribute(DOM_ATTRIBUTES.SCRUBBER_ACTIVE);
    log('warn', 'Patch rolled back');
    return stateMachine.markRolledBack(video);
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return stateMachine.markFailed(video, 'unknown', msg);
  }
}
