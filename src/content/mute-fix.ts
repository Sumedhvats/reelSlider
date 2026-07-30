(function () {
  "use strict";

  const MUTE_PREF_KEY = "reels_scrubber_feed_muted_pref";
  const ACTIVE_ATTR = "data-reels-scrubber-active";
  const LOG = "[ReelSlider:mute-fix]";

  function userWantsUnmuted(): boolean {
    if (typeof (window as any).__REELS_SCRUBBER_FEED_MUTED__ === "boolean") {
      return (window as any).__REELS_SCRUBBER_FEED_MUTED__ === false;
    }
    try {
      return window.localStorage.getItem(MUTE_PREF_KEY) === "false";
    } catch (e) {
      return false;
    }
  }

  function findActiveVideo(): HTMLVideoElement | null {
    const videos = document.querySelectorAll<HTMLVideoElement>("video[" + ACTIVE_ATTR + "]");
    if (videos.length === 0) return null;

    let best: HTMLVideoElement | null = null;
    let bestArea = -1;
    for (const v of Array.from(videos)) {
      if (!v.isConnected) continue;
      const r = v.getBoundingClientRect();
      const vw = Math.min(r.right, window.innerWidth) - Math.max(r.left, 0);
      const vh = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      const area = Math.max(0, vw) * Math.max(0, vh);
      if (area > bestArea) {
        bestArea = area;
        best = v;
      }
    }
    return best;
  }

  let nativeMutedSetter: ((v: boolean) => void) | null = null;
  function getNativeSetter(): ((v: boolean) => void) | null {
    if (nativeMutedSetter) return nativeMutedSetter;
    const desc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "muted");
    if (desc && desc.set) {
      nativeMutedSetter = desc.set;
    }
    return nativeMutedSetter;
  }

  function unmuteVideo(video: HTMLVideoElement | null): boolean {
    if (!video || !video.muted) return false;

    console.info(LOG, "Unmuting video");
    const setter = getNativeSetter();
    if (!setter) return false;

    try {
      (window as any).__REELS_SCRUBBER_APPLYING_MUTE__ = true;
      video.defaultMuted = false;
      setter.call(video, false);
    } catch (e) {
      console.warn(LOG, "Unmute failed:", e);
      return false;
    } finally {
      queueMicrotask(function () {
        (window as any).__REELS_SCRUBBER_APPLYING_MUTE__ = false;
      });
    }
    return true;
  }

  let interactionDone = false;

  function onInteraction() {
    if (!userWantsUnmuted()) {
      cleanup();
      return;
    }

    const video = findActiveVideo();
    if (!video) {
      return;
    }

    if (video.muted) {
      unmuteVideo(video);
    }

    interactionDone = true;
    cleanup();
  }

  function cleanup() {
    document.removeEventListener("click", onInteraction, true);
    document.removeEventListener("keydown", onInteraction, true);
    document.removeEventListener("mousedown", onInteraction, true);
    document.removeEventListener("pointerdown", onInteraction, true);
  }

  function installListeners() {
    document.addEventListener("click", onInteraction, true);
    document.addEventListener("keydown", onInteraction, true);
    document.addEventListener("mousedown", onInteraction, true);
    document.addEventListener("pointerdown", onInteraction, true);
  }

  function watchVideos() {
    document.addEventListener(
      "play",
      function (e) {
        if (!userWantsUnmuted()) return;
        const video = e.target as HTMLVideoElement;
        if (!(video instanceof HTMLVideoElement)) return;
        if (!video.hasAttribute(ACTIVE_ATTR)) return;
        if (!video.muted) return;

        if (navigator.userActivation && navigator.userActivation.hasBeenActive) {
          Promise.resolve().then(function () {
            if (video.muted && userWantsUnmuted()) {
              unmuteVideo(video);
            }
          });
        }
      },
      true
    );
  }

  if (userWantsUnmuted()) {
    console.info(LOG, "User wants unmuted — installing first-interaction listener");
    installListeners();
  }

  watchVideos();

  window.addEventListener("ig-reels-scrubber-toggle", function () {
    if (userWantsUnmuted() && !interactionDone) {
      installListeners();
    }
  });
})();
