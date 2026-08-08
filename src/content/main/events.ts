import { DOM_ATTRIBUTES } from '../../utils/constants';
import { getGlobalActiveVideo, getGroupToPatch, isHomeFeedMainVideo } from './videoSelector';
import { patchVideo, rollbackVideo, stateMachine } from './patcher';
import {
  isEnabled, setIsEnabled, enableAudioLock, disableAudioLock, updateGlobalFeedMuted,
  setSpeedWithLock, getStoredSpeed, setStoredSpeed, setVolumeWithLock, getStoredVolume,
  syncStoryMute, setMutedWithoutLock, globalFeedMuted, MUTE_APPLYING
} from './audio';
let tempSpeed: number | null = null;
import { DOM_CLASSES } from '../../utils/constants';
import { isSupportedPage, isFeedOrReels } from './routes';
import { getVideoContext, isEditable } from './dom';
import { injectPostDownloadButtons } from './download';
import { showToast } from './ui';
import { setupAutoScroll, loadAutoScrollPref, setAutoScrollEnabled, getAutoScrollEnabled } from './autoscroll';
let observer: MutationObserver | null = null;
let timeouts: number[] = [];

export function runPatchLoop() {
  if (!isEnabled) {
    rollbackAll();
    return;
  }
  
  const allVideos = Array.from(document.querySelectorAll('video'));
  if (allVideos.length === 0) {
    rollbackAll();
    injectPostDownloadButtons();
    return;
  }

  const group = getGroupToPatch(allVideos);
  group.forEach((v) => {
    const state = stateMachine.get(v).state !== 'patched';
    const res = patchVideo(v);
    
    if (state && res.state === 'patched') {
      const speed = tempSpeed !== null ? tempSpeed : getStoredSpeed();
      if (Math.abs(v.playbackRate - speed) > 0.001) setSpeedWithLock(v, speed);
      
      const vol = getStoredVolume();
      if (vol !== null && Math.abs(v.volume - vol) > 0.001) setVolumeWithLock(v, vol);
      
    }
  });

  const groupSet = new Set(group);
  document.querySelectorAll(`video[${DOM_ATTRIBUTES.SCRUBBER_ACTIVE}]`).forEach((v) => {
    const el = v as HTMLVideoElement;
    if (!groupSet.has(el) && !isHomeFeedMainVideo(el)) {
      rollbackVideo(el);
    }
  });

  injectPostDownloadButtons();
}

function rollbackAll() {
  document.querySelectorAll(`video[${DOM_ATTRIBUTES.SCRUBBER_ACTIVE}]`).forEach((v) => {
    rollbackVideo(v as HTMLVideoElement);
  });
}

function scheduleLoops() {
  timeouts.forEach(clearTimeout);
  timeouts = [];
  const delays = location.pathname === '/' ? [0, 90, 260, 700, 1800] : [0, 90, 260, 700];
  delays.forEach((d) => {
    timeouts.push(window.setTimeout(() => {
      if (isSupportedPage(location.pathname)) runPatchLoop();
    }, d));
  });
}

export function startObserver() {
  if (!observer) {
    observer = new MutationObserver(() => runPatchLoop());
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}

export function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

export function checkAndInitialize() {
  if (!isEnabled) {
    timeouts.forEach(clearTimeout);
    rollbackAll();
    stopObserver();
    disableAudioLock();
    return;
  }
  if (!isSupportedPage(location.pathname)) {
    timeouts.forEach(clearTimeout);
    rollbackAll();
    stopObserver();
    disableAudioLock();
    return;
  }
  if (isFeedOrReels(location.pathname)) {
    enableAudioLock(true);
  } else {
    disableAudioLock();
  }
  scheduleLoops();
  startObserver();
}

export function setupListeners() {
  const pushState = history.pushState;
  history.pushState = function (...args) {
    pushState.apply(this, args);
    queueMicrotask(checkAndInitialize);
  };
  const replaceState = history.replaceState;
  history.replaceState = function (...args) {
    replaceState.apply(this, args);
    queueMicrotask(checkAndInitialize);
  };
  window.addEventListener('popstate', () => checkAndInitialize());

  window.addEventListener(DOM_CLASSES.TOGGLE, (e: any) => {
    if (e.detail && typeof e.detail.enabled === 'boolean') {
      setIsEnabled(e.detail.enabled);
    } else {
      setIsEnabled((window as any)[DOM_ATTRIBUTES.REELS_SCRUBBER_ENABLED] !== false);
    }
    checkAndInitialize();
  });

  window.addEventListener('ig-reels-scrubber-force-update', (e: any) => {
    if (!isEnabled) return;
    const detail = e.detail;
    if (!detail) return;
    if (typeof detail.autoScrollPref === 'boolean') {
      setAutoScrollEnabled(detail.autoScrollPref);
    }
    const active = getGlobalActiveVideo();
    if (active) {
      if (typeof detail.speedPref === 'number') {
        setSpeedWithLock(active, detail.speedPref);
      }
      if (typeof detail.volumePref === 'number') setVolumeWithLock(active, detail.volumePref);
    }
  });

  const enforceMediaPrefs = (e: Event) => {
    if (!isEnabled) return;
    const t = e.target as HTMLVideoElement;
    if (t && t.tagName === 'VIDEO' && t.hasAttribute(DOM_ATTRIBUTES.SCRUBBER_ACTIVE)) {
      const speed = getStoredSpeed();
      if (Math.abs(t.playbackRate - speed) > 0.001) {
        setSpeedWithLock(t, speed);
        e.stopImmediatePropagation();
        e.stopPropagation();
      }
      const vol = getStoredVolume();
      if (vol !== null && Math.abs(t.volume - vol) > 0.001) setVolumeWithLock(t, vol);
    }
  };

  window.addEventListener('loadedmetadata', enforceMediaPrefs, true);
  window.addEventListener('play', enforceMediaPrefs, true);
  window.addEventListener('ratechange', enforceMediaPrefs, true);



  const handleFullscreen = () => { if (isEnabled) runPatchLoop(); };
  document.addEventListener('fullscreenchange', handleFullscreen);
  document.addEventListener('webkitfullscreenchange', handleFullscreen);

  document.addEventListener('volumechange', (e) => {
    if (!isEnabled) return;
    const t = e.target;
    if (!(t instanceof HTMLVideoElement) || !t.hasAttribute(DOM_ATTRIBUTES.SCRUBBER_ACTIVE)) return;
    if ((window as any)[MUTE_APPLYING]) return;
    
    const ctx = getVideoContext(t);
    if (!e.isTrusted) {
      if (ctx === 'story-viewer') syncStoryMute(t, globalFeedMuted);
      else setMutedWithoutLock(t, globalFeedMuted);
      return;
    }
    updateGlobalFeedMuted(t.muted);
    if (ctx === 'story-viewer') syncStoryMute(t, t.muted);
  }, true);

  document.addEventListener('keydown', (e) => {
    if (!isEnabled || isEditable(e.target)) return;
    const k = e.key.toLowerCase();
    const isControl = ['a', 'd', 's', 'w', 'm', 'f', 'g', ' ', 'arrowleft', 'arrowright'].includes(k);
    if (!isControl) return;
    
    const active = getGlobalActiveVideo();
    if (active) {
      if (k === 'w' || k === 's' || k === ' ' || k === 'a' || k === 'd' || k === 'arrowleft' || k === 'arrowright') {
        e.preventDefault();
      }
      e.stopPropagation();
      
      if (k === 'a' || k === 'arrowleft') active.currentTime = Math.max(0, active.currentTime - 3);
      else if (k === 'd' || k === 'arrowright') active.currentTime = Math.min(active.duration, active.currentTime + 3);
      else if (k === ' ' || (e.key === ' ' && e.code === 'Space')) active.paused ? active.play().catch(()=>{}) : active.pause();
      else if (k === 'w') {
        if (e.shiftKey) {
          if (tempSpeed !== 2.0) {
            tempSpeed = 2.0;
            setSpeedWithLock(active, tempSpeed);
            showToast('Speed: 2.0x (Temp)');
          }
        } else {
          const newSpeed = Math.min(2.0, getStoredSpeed() + 0.25);
          setStoredSpeed(newSpeed);
          setSpeedWithLock(active, newSpeed);
          showToast(`Speed: ${newSpeed.toFixed(2)}x`);
        }
      }
      else if (k === 's') {
        if (e.shiftKey) {
          if (tempSpeed !== 0.5) {
            tempSpeed = 0.5;
            setSpeedWithLock(active, tempSpeed);
            showToast('Speed: 0.5x (Temp)');
          }
        } else {
          const newSpeed = Math.max(0.25, getStoredSpeed() - 0.25);
          setStoredSpeed(newSpeed);
          setSpeedWithLock(active, newSpeed);
          showToast(`Speed: ${newSpeed.toFixed(2)}x`);
        }
      }
      else if (k === 'm') {
        const m = !active.muted;
        updateGlobalFeedMuted(m);
        setMutedWithoutLock(active, m);
        if (getVideoContext(active) === 'story-viewer') syncStoryMute(active, m);
      }
      else if (k === 'f') {
        if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
        else active.requestFullscreen().catch(()=>{});
      }
      else if (k === 'g') {
        const newVal = !getAutoScrollEnabled();
        setAutoScrollEnabled(newVal);
        showToast(newVal ? 'Auto-scroll: ON' : 'Auto-scroll: OFF');
      }
    }
  }, true);

  document.addEventListener('keyup', (e) => {
    if (!isEnabled || isEditable(e.target)) return;
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 's') {
      if (tempSpeed !== null) {
        tempSpeed = null;
        const active = getGlobalActiveVideo();
        if (active) {
          const sp = getStoredSpeed();
          setSpeedWithLock(active, sp);
          showToast(`Speed: ${sp.toFixed(2)}x`);
        }
      }
    }
  }, true);

  // Initialize autoscroll
  loadAutoScrollPref();
  setupAutoScroll();
}
