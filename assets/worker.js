// ReelSlider — Background Service Worker
// by sumedh | https://github.com/Sumedhvats/

// Storage keys — must match constants-nW6bUIy2.js
const KEY_ENABLED = 'reels_scrubber_enabled';
const KEY_SPEED   = 'reels_scrubber_speed_pref';
const KEY_VOLUME  = 'reels_scrubber_volume_pref';
const KEY_MUTED   = 'reels_scrubber_feed_muted_pref';
const KEY_PREFS   = 'reels_scrubber_pro_features';

// Globals injected into window (MAIN world) — match constants-nW6bUIy2.js
const G_ENABLED   = '__IG_REELS_SCRUBBER_ENABLED__';     // r→a in constants
const G_PRO       = '__IG_REELS_SCRUBBER_PRO__';          // w→v in constants
const G_PRO_FEAT  = '__IG_REELS_SCRUBBER_PRO_FEATURES__'; // T→p in constants
const G_INSTANCE  = '__IG_REELS_SCRUBBER_INSTANCE__';     // E→h in constants
const G_FLAGS     = '__REELSLIDER_FLAGS__';        // injected separately
const TOGGLE_EVT  = 'ig-reels-scrubber-toggle';   // i→o in constants (event name)

const IG_MATCH = 'https://www.instagram.com/*';
const LOG = '[ReelSlider]';

function isInstagramTab(url) {
  return typeof url === 'string' && url.includes('://www.instagram.com/');
}

function getPrefs() {
  return new Promise((resolve) => {
    chrome.storage.local.get([KEY_ENABLED, KEY_SPEED, KEY_VOLUME, KEY_MUTED, KEY_PREFS], (data) => {
      resolve({
        enabled:  typeof data[KEY_ENABLED] === 'boolean' ? data[KEY_ENABLED] : true,
        speed:    typeof data[KEY_SPEED]   === 'number'  ? data[KEY_SPEED]   : 1.0,
        volume:   typeof data[KEY_VOLUME]  === 'number'  ? data[KEY_VOLUME]  : 0.8,
        muted:    typeof data[KEY_MUTED]   === 'boolean' ? data[KEY_MUTED]   : false,
        proFeats: typeof data[KEY_PREFS]   === 'object'  ? data[KEY_PREFS]   : {},
      });
    });
  });
}

/**
 * Inject prefs into a tab's MAIN world.
 *
 * The content script (main.ts-CrHNQyXz.js) reads these on init via ir():
 *   window[l]  = ig-reels-scrubber-toggle  → the enabled value
 *   window[v]  = __REELSLIDER_PRO__        → isPro bool
 *   window[p]  = __REELSLIDER_PRO_FEATURES__
 *   window[h]  = __REELSLIDER_INSTANCE__
 *   window.__REELSLIDER_FLAGS__            → feature flags
 *
 * Then dispatches the toggle event so the content script re-reads state.
 */
function injectPrefs(tabId, prefs, force = false) {
  const { enabled, muted, speed, volume, proFeats } = prefs;

  chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: (enabled, isPro, proFeatures, proInstanceId, flags, feedMuted, speedPref, volumePref, forceOverwrite,
           gEnabled, gPro, gProFeat, gInstance, gFlags, toggleEventName) => {
      // Standard globals read via constants imports
      window[gEnabled]   = enabled;
      window[gPro]       = isPro;
      window[gProFeat]   = proFeatures;
      window[gInstance]  = proInstanceId;
      window[gFlags]     = flags;

      // Sync the mute state with localStorage / sessionStorage in MAIN world
      let currentStoredMute = null;
      try {
        currentStoredMute = window.localStorage.getItem('reels_scrubber_feed_muted_pref') || window.sessionStorage.getItem('reels_scrubber_feed_muted_pref');
      } catch (e) {}

      if (forceOverwrite || currentStoredMute === null) {
        window.__REELS_SCRUBBER_FEED_MUTED__ = feedMuted;
        try {
          window.localStorage.setItem('reels_scrubber_feed_muted_pref', String(feedMuted));
          window.sessionStorage.setItem('reels_scrubber_feed_muted_pref', String(feedMuted));
        } catch (e) {}
      } else {
        // If it already exists in storage, make sure the window global matches the stored state
        window.__REELS_SCRUBBER_FEED_MUTED__ = (currentStoredMute === 'true');
      }

      // Sync the default playback speed preference
      let currentStoredSpeed = null;
      try {
        currentStoredSpeed = window.localStorage.getItem('reels_scrubber_speed_pref');
      } catch (e) {}

      if (forceOverwrite || currentStoredSpeed === null) {
        try {
          window.localStorage.setItem('reels_scrubber_speed_pref', String(speedPref));
        } catch (e) {}
      }

      // Sync the default volume preference
      let currentStoredVolume = null;
      try {
        currentStoredVolume = window.localStorage.getItem('reels_scrubber_volume_pref');
      } catch (e) {}

      if (forceOverwrite || currentStoredVolume === null) {
        try {
          window.localStorage.setItem('reels_scrubber_volume_pref', String(volumePref));
        } catch (e) {}
      }

      // If forcing an update (changed via popup), apply speed and volume to active video immediately
      if (forceOverwrite) {
        try {
          const videos = Array.from(document.querySelectorAll('video[data-reels-scrubber-active]'));
          // 1. Find the video that is currently playing
          let activeVideo = videos.find(v => !v.paused && !v.ended);
          
          // 2. If all are paused, find the one most visible in the viewport
          if (!activeVideo) {
            let maxVisibleArea = 0;
            for (const v of videos) {
              const rect = v.getBoundingClientRect();
              const visibleWidth = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
              const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
              if (visibleWidth > 0 && visibleHeight > 0) {
                const area = visibleWidth * visibleHeight;
                if (area > maxVisibleArea) {
                  maxVisibleArea = area;
                  activeVideo = v;
                }
              }
            }
          }
          
          // 3. Fallback to the first video
          if (!activeVideo) {
            activeVideo = videos[0];
          }

          if (activeVideo) {
            activeVideo.playbackRate = speedPref;
            activeVideo.volume = volumePref;
          }
        } catch (e) {}
      }

      if (typeof window.__REELS_SCRUBBER_APPLYING_MUTE__ === 'undefined') {
        window.__REELS_SCRUBBER_APPLYING_MUTE__ = false;
      }

      window.dispatchEvent(new CustomEvent(toggleEventName, {
        detail: { enabled }
      }));
    },
    args: [
      enabled,
      true,          // isPro — always true (unlocks speed/volume defaults forever)
      proFeats,      // proFeatures
      '',            // proInstanceId — empty string
      {              // feature flags — all core features on, Pro upsell off
        enableAudioLock:     true,
        enableShieldRemoval: true,
        enableRemoteConfig:  false,
        enableProAnnounce:   false,
      },
      muted,         // feedMuted — user's mute preference from popup
      speed,         // speedPref
      volume,        // volumePref
      force,         // forceOverwrite
      G_ENABLED,
      G_PRO,
      G_PRO_FEAT,
      G_INSTANCE,
      G_FLAGS,
      TOGGLE_EVT,
    ],
  }).catch(() => {});
}

async function injectAll(force = false) {
  const prefs = await getPrefs();
  chrome.tabs.query({ url: [IG_MATCH] }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id && isInstagramTab(tab.url)) {
        injectPrefs(tab.id, prefs, force);
      }
    });
  });
}

function initDefaults() {
  chrome.storage.local.get([KEY_ENABLED], (data) => {
    if (typeof data[KEY_ENABLED] !== 'boolean') {
      chrome.storage.local.set({ [KEY_ENABLED]: true });
    }
  });
}

// ── Lifecycle ──────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  console.info(LOG, 'installed');
  initDefaults();
  injectAll(true);
});

chrome.runtime.onStartup.addListener(() => {
  console.info(LOG, 'startup');
  injectAll(true);
});

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status === 'loading' && isInstagramTab(tab.url)) {
    getPrefs().then((prefs) => injectPrefs(tabId, prefs, false));
  }
});

// Re-inject all tabs when prefs change (e.g. popup toggle)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    const shouldForce = changes[KEY_MUTED] !== undefined ||
                        changes[KEY_ENABLED] !== undefined ||
                        changes[KEY_SPEED] !== undefined ||
                        changes[KEY_VOLUME] !== undefined;
    injectAll(shouldForce);
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'healthcheck') {
    sendResponse({ ok: true, source: 'ReelSlider background' });
    return true;
  }
  return false;
});
