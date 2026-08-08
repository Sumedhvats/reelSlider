import { DOM_ATTRIBUTES, PREF_KEYS } from '../../utils/constants';
import { isReelOrPost } from './routes';
import { isEnabled } from './audio';

let autoScrollEnabled = false;

export function getAutoScrollEnabled(): boolean {
  return autoScrollEnabled;
}

export function setAutoScrollEnabled(val: boolean) {
  autoScrollEnabled = val;
  try {
    window.localStorage.setItem(PREF_KEYS.AUTO_SCROLL, String(val));
    window.postMessage({
      type: '__REELS_SCRUBBER_PREF_UPDATE__',
      payload: { key: PREF_KEYS.AUTO_SCROLL, value: val }
    }, '*');
  } catch {}
}

export function loadAutoScrollPref(): boolean {
  try {
    const val = window.localStorage.getItem(PREF_KEYS.AUTO_SCROLL);
    if (val === 'true') { autoScrollEnabled = true; return true; }
    if (val === 'false') { autoScrollEnabled = false; return false; }
  } catch {}
  autoScrollEnabled = false;
  return false;
}

function findScrollContainer(el: HTMLElement): HTMLElement | null {
  let parent = el.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    if (parent.scrollHeight > parent.clientHeight + 1 &&
        (style.overflowY === 'auto' || style.overflowY === 'scroll')) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

export function setupAutoScroll() {
  // Disable native loop on reel pages so the 'ended' event fires
  document.addEventListener('timeupdate', (e) => {
    if (!autoScrollEnabled || !isEnabled) return;
    const t = e.target;
    if (t instanceof HTMLVideoElement &&
        t.hasAttribute(DOM_ATTRIBUTES.SCRUBBER_ACTIVE) &&
        isReelOrPost(location.pathname)) {
      if (t.loop) t.loop = false;
    }
  }, true);

  // When video ends, scroll to next reel
  document.addEventListener('ended', (e) => {
    if (!autoScrollEnabled || !isEnabled) return;
    const video = e.target;
    if (!(video instanceof HTMLVideoElement) ||
        !video.hasAttribute(DOM_ATTRIBUTES.SCRUBBER_ACTIVE) ||
        !isReelOrPost(location.pathname)) return;

    // Strategy 1: find scrollable ancestor and scroll by its height
    const container = findScrollContainer(video);
    if (container) {
      container.scrollBy({ top: container.clientHeight, behavior: 'smooth' });
      return;
    }

    // Strategy 2: scroll the document
    const scrollEl = document.scrollingElement;
    if (scrollEl && scrollEl.scrollHeight > scrollEl.clientHeight + 1) {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      return;
    }

    // Strategy 3: click the "Next" button
    const nextBtn = document.querySelector(
      '[aria-label="Navigate to next Reel"], [aria-label="Next"]'
    );
    if (nextBtn) {
      const btn = nextBtn.closest('button') ??
                  nextBtn.closest('[role="button"]') ?? nextBtn;
      if (btn instanceof HTMLElement) btn.click();
    }
  }, true);
}
