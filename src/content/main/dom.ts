import type { VideoContext, PatchSnapshot } from './types';
import { isStory, isReelOrPost, isPost } from './routes';
import { DOM_ATTRIBUTES } from '../../utils/constants';

export function getVideoContext(video: HTMLElement): VideoContext {
  if (isStory(location.pathname)) return 'story-viewer';
  if (isReelOrPost(location.pathname)) return 'reel-viewer';
  if (video.closest('li[style*="translateX("]')) return 'feed-carousel';
  if (video.closest('article')) return 'feed-inline';
  
  // Fallback for delayed URL updates (e.g. clicking a Story from the home feed).
  // On the home feed, all regular posts/reels are wrapped in <article>.
  // If a video appears without an <article>, it is a Story modal.
  if (!video.closest('article') && (location.pathname === '/' || video.closest('[role="dialog"]'))) {
    return 'story-viewer';
  }

  return 'unknown';
}

export function getContainer(video: HTMLElement): HTMLElement | null {
  if (isPost(location.pathname) && video.parentElement instanceof HTMLElement) {
    return video.parentElement;
  }
  const parents = [
    video.closest('[style*="--x-height"]'),
    video.closest('article'),
    video.parentElement
  ];
  for (const p of parents) {
    if (p instanceof HTMLElement) return p;
  }
  return null;
}

export function isSizeInvalid(video: HTMLElement): boolean {
  const rect = video.getBoundingClientRect();
  return rect.width <= 0 || rect.height <= 0;
}

export function fixPosition(el: HTMLElement) {
  if (window.getComputedStyle(el).position === 'static') {
    el.style.position = 'relative';
  }
}

export function isFullscreenElement(el: HTMLElement): boolean {
  const f = document.fullscreenElement ?? (document as any).webkitFullscreenElement ?? null;
  return f ? f === el || f.contains(el) : false;
}

export function saveOriginalStyles(el: HTMLElement) {
  if (!el.hasAttribute('data-reels-scrubber-style-touched')) {
    const s = el.getAttribute('style');
    if (s === null) el.removeAttribute(DOM_ATTRIBUTES.SCRUBBER_PREV_STYLE);
    else el.setAttribute(DOM_ATTRIBUTES.SCRUBBER_PREV_STYLE, s);
    el.setAttribute(DOM_ATTRIBUTES.SCRUBBER_STYLE_TOUCHED, 'true');
  }
}

export function restoreOriginalStyles(el: HTMLElement) {
  const container = el.closest('[style*="--x-height"]') ?? el.closest('article') ?? el.parentElement;
  if (container) {
    container.querySelectorAll(`[${DOM_ATTRIBUTES.SCRUBBER_STYLE_TOUCHED}]`).forEach((t) => {
      const s = t.getAttribute(DOM_ATTRIBUTES.SCRUBBER_PREV_STYLE);
      if (s === null) t.removeAttribute('style');
      else t.setAttribute('style', s);
      t.removeAttribute(DOM_ATTRIBUTES.SCRUBBER_PREV_STYLE);
      t.removeAttribute(DOM_ATTRIBUTES.SCRUBBER_STYLE_TOUCHED);
    });
  }
}

export function getSnapshot(video: HTMLVideoElement): PatchSnapshot {
  return {
    parent: video.parentElement,
    nextSibling: video.nextSibling,
    inlineStyle: video.getAttribute('style') ?? '',
    controls: video.controls,
    muted: video.muted,
  };
}

export function applySnapshot(video: HTMLVideoElement, snapshot: PatchSnapshot) {
  if (snapshot.parent) {
    if (snapshot.nextSibling !== null && snapshot.nextSibling.parentNode === snapshot.parent) {
      snapshot.parent.insertBefore(video, snapshot.nextSibling);
    } else {
      snapshot.parent.appendChild(video);
    }
  }
  if (snapshot.inlineStyle.length > 0) {
    video.setAttribute('style', snapshot.inlineStyle);
  } else {
    video.removeAttribute('style');
  }
  video.controls = snapshot.controls;
  video.muted = snapshot.muted;
}

export function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
}
