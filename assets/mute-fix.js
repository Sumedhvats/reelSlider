// ReelSlider — Mute Preference Fix
// Fixes: "start muted not working when I reload page"
//
// APPROACH:
//   1. On first user interaction, synchronously unmute the active video
//   2. Also watch for new videos playing — if user has interacted, auto-unmute
//   3. Bypass the old code's prototype lock by using the saved native setter

(function () {
  'use strict';

  const MUTE_PREF_KEY = 'reels_scrubber_feed_muted_pref';
  const ACTIVE_ATTR = 'data-reels-scrubber-active';
  const LOG = '[ReelSlider:mute-fix]';

  // ── Read user preference ─────────────────────────────────
  function userWantsUnmuted() {
    // Window global (set by worker.js or content script)
    if (typeof window.__REELS_SCRUBBER_FEED_MUTED__ === 'boolean') {
      return window.__REELS_SCRUBBER_FEED_MUTED__ === false;
    }
    // Fallback: localStorage
    try {
      return window.localStorage.getItem(MUTE_PREF_KEY) === 'false';
    } catch (e) {
      return false;
    }
  }

  // ── Find the best active video ───────────────────────────
  function findActiveVideo() {
    const videos = document.querySelectorAll('video[' + ACTIVE_ATTR + ']');
    if (videos.length === 0) return null;

    let best = null;
    let bestArea = -1;
    for (const v of videos) {
      if (!v.isConnected) continue;
      const r = v.getBoundingClientRect();
      const vw = Math.min(r.right, window.innerWidth) - Math.max(r.left, 0);
      const vh = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      const area = Math.max(0, vw) * Math.max(0, vh);
      if (area > bestArea) { bestArea = area; best = v; }
    }
    return best;
  }

  // ── Get native muted setter (bypass prototype lock) ──────
  let nativeMutedSetter = null;
  function getNativeSetter() {
    if (nativeMutedSetter) return nativeMutedSetter;
    // The prototype lock saves the original descriptor, but we can
    // grab our own copy from a fresh prototype chain
    const desc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted');
    if (desc && desc.set) {
      // If it's the lock's wrapper, we need the original.
      // The lock stores it in a closure we can't access, but we CAN
      // create a temporary <audio> and grab the setter from its __proto__
      // Actually — the simplest approach: just use the current setter
      // but set the APPLYING_MUTE flag so the volumechange handler ignores it
      nativeMutedSetter = desc.set;
    }
    return nativeMutedSetter;
  }

  // ── Unmute a video ───────────────────────────────────────
  function unmuteVideo(video) {
    if (!video || !video.muted) return false;

    console.info(LOG, 'Unmuting video');
    const setter = getNativeSetter();
    if (!setter) return false;

    try {
      window.__REELS_SCRUBBER_APPLYING_MUTE__ = true;
      video.defaultMuted = false;
      setter.call(video, false);  // bypass any wrapper
    } catch (e) {
      console.warn(LOG, 'Unmute failed:', e);
      return false;
    } finally {
      queueMicrotask(function () {
        window.__REELS_SCRUBBER_APPLYING_MUTE__ = false;
      });
    }
    return true;
  }

  // ── First-interaction handler (synchronous!) ─────────────
  let interactionDone = false;

  function onInteraction() {
    if (!userWantsUnmuted()) {
      cleanup();
      return;
    }

    const video = findActiveVideo();
    if (!video) {
      // No patched video yet — keep listening
      return;
    }

    if (video.muted) {
      unmuteVideo(video);
    }

    interactionDone = true;
    cleanup();
  }

  function cleanup() {
    document.removeEventListener('click', onInteraction, true);
    document.removeEventListener('keydown', onInteraction, true);
    document.removeEventListener('mousedown', onInteraction, true);
    document.removeEventListener('pointerdown', onInteraction, true);
  }

  function installListeners() {
    document.addEventListener('click', onInteraction, true);
    document.addEventListener('keydown', onInteraction, true);
    document.addEventListener('mousedown', onInteraction, true);
    document.addEventListener('pointerdown', onInteraction, true);
  }

  // ── Video play watcher ───────────────────────────────────
  // After the user has interacted, watch for new videos that start
  // playing muted and unmute them immediately.
  function watchVideos() {
    document.addEventListener('play', function (e) {
      if (!userWantsUnmuted()) return;
      const video = e.target;
      if (!(video instanceof HTMLVideoElement)) return;
      if (!video.hasAttribute(ACTIVE_ATTR)) return;
      if (!video.muted) return;

      // Only unmute if user has interacted with the page
      if (navigator.userActivation && navigator.userActivation.hasBeenActive) {
        // Small delay to let the main script's patch complete first
        Promise.resolve().then(function () {
          if (video.muted && userWantsUnmuted()) {
            unmuteVideo(video);
          }
        });
      }
    }, true);
  }

  // ── Init ─────────────────────────────────────────────────
  if (userWantsUnmuted()) {
    console.info(LOG, 'User wants unmuted — installing first-interaction listener');
    installListeners();
  }

  watchVideos();

  // Re-check on toggle event (user changes pref via popup)
  window.addEventListener('ig-reels-scrubber-toggle', function () {
    if (userWantsUnmuted() && !interactionDone) {
      installListeners();
    }
  });
})();
