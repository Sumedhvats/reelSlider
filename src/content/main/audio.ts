import { DOM_ATTRIBUTES, PREF_KEYS } from '../../utils/constants';
import { getContainer } from './dom';

export const MUTE_APPLYING = '__REELS_SCRUBBER_APPLYING_MUTE__';
export const FEED_MUTED = '__REELS_SCRUBBER_FEED_MUTED__';

export const volumeMap = new WeakMap<HTMLMediaElement, number>();
export const userVolumeMap = new WeakMap<HTMLMediaElement, number>();
export const rateQueue = new WeakSet<HTMLMediaElement>();
export const volumeQueue = new WeakSet<HTMLMediaElement>();
export let globalFeedMuted = true;
export let isEnabled = (window as any)[DOM_ATTRIBUTES.REELS_SCRUBBER_ENABLED] !== false;
export function setIsEnabled(val: boolean) { isEnabled = val; }

export function enableVolumeLock() {}
export function enableSpeedLock() {}
export function enableAudioLock(_shouldEnable: boolean) {}
export function disableAudioLock() {}

export function setMutedWithoutLock(video: HTMLMediaElement, muted: boolean) {
  if (muted === false && navigator.userActivation && !navigator.userActivation.hasBeenActive) muted = true;
  if (video.muted === muted) return;
  const w = window as any;
  if (!w[MUTE_APPLYING]) {
    w[MUTE_APPLYING] = true;
    w.__REELSLIDER_SETTING_MUTE__ = true;
    video.defaultMuted = muted;
    video.muted = muted;
    w.__REELSLIDER_SETTING_MUTE__ = false;
    queueMicrotask(() => { w[MUTE_APPLYING] = false; });
  }
}

export function syncStoryMute(video: HTMLMediaElement, muted: boolean) {
  if (video.hasAttribute('data-reels-scrubber-story-audio-syncing') || (window as any)[MUTE_APPLYING]) return;
  const container = getContainer(video);
  if (!container) {
    setMutedWithoutLock(video, muted);
    return;
  }
  const toggleBtn = container.querySelector('[aria-label="Toggle audio"], [aria-label="Audio is muted"], [aria-label="Audio is playing"]');
  const btn = toggleBtn ? (toggleBtn.closest('[role="button"]') ?? toggleBtn.closest('button') ?? toggleBtn) : null;
  const isMutedUI = (() => {
    if (!toggleBtn) return null;
    return /muted/i.test(toggleBtn.getAttribute('aria-label') ?? '');
  })();
  
  if (isMutedUI === null || !btn) {
    setMutedWithoutLock(video, muted);
    return;
  }
  if (isMutedUI !== muted) {
    if (muted === false && navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
    video.setAttribute('data-reels-scrubber-story-audio-syncing', 'true');
    (btn as HTMLElement).click();
    queueMicrotask(() => {
      video.removeAttribute('data-reels-scrubber-story-audio-syncing');
    });
    return;
  }
  setMutedWithoutLock(video, muted);
}

export function getStoredSpeed(): number {
  try {
    const speed = window.localStorage.getItem(PREF_KEYS.SPEED);
    if (speed !== null) {
      const parsed = parseFloat(speed);
      if (!isNaN(parsed) && parsed >= 0.25 && parsed <= 4) return parsed;
    }
  } catch {}
  return 1;
}

export function setStoredSpeed(speed: number) {
  if (speed < 0.25 || speed > 4) return;
  try {
    window.localStorage.setItem(PREF_KEYS.SPEED, String(speed));
    window.postMessage({ type: '__REELS_SCRUBBER_PREF_UPDATE__', payload: { key: PREF_KEYS.SPEED, value: speed } }, '*');
  } catch {}
}

export function setSpeedWithLock(video: HTMLMediaElement, speed: number) {
  const w = window as any;
  w.__REELSLIDER_SETTING_SPEED__ = true;
  video.playbackRate = speed;
  w.__REELSLIDER_SETTING_SPEED__ = false;
}

export function getStoredVolume(): number | null {
  try {
    const vol = window.localStorage.getItem(PREF_KEYS.VOLUME);
    if (vol !== null) {
      const parsed = parseFloat(vol);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 1) return parsed;
    }
  } catch {}
  return null;
}

export function setStoredVolume(vol: number) {
  if (vol <= 0 || vol > 1) return;
  try {
    window.localStorage.setItem(PREF_KEYS.VOLUME, String(vol));
  } catch {}
}

export function setVolumeWithLock(video: HTMLMediaElement, vol: number) {
  const w = window as any;
  w.__REELSLIDER_SETTING_VOLUME__ = true;
  video.volume = vol;
  w.__REELSLIDER_SETTING_VOLUME__ = false;
  volumeMap.set(video, vol);
}

export function updateGlobalFeedMuted(muted: boolean) {
  globalFeedMuted = muted;
  (window as any)[FEED_MUTED] = muted;
  try { window.localStorage.setItem('reels_scrubber_feed_muted', String(muted)); } catch {}
  try { window.sessionStorage.setItem('reels_scrubber_feed_muted', String(muted)); } catch {}
}

export function loadGlobalFeedMuted(): boolean {
  try {
    const l = window.localStorage.getItem('reels_scrubber_feed_muted');
    if (l === 'true') return true;
    if (l === 'false') return false;
  } catch {}
  try {
    const s = window.sessionStorage.getItem('reels_scrubber_feed_muted');
    if (s === 'true') return true;
    if (s === 'false') return false;
  } catch {}
  return true;
}
