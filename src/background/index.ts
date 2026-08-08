import { PREF_KEYS, DOM_ATTRIBUTES, DOM_CLASSES, MATCH_PATTERN_INSTAGRAM } from '../utils/constants';
import { featureFlags } from '../utils/featureFlags';

const LOG = '[ReelSlider]';
const G_FLAGS = '__REELSLIDER_FLAGS__';

interface UserPrefs {
  enabled: boolean;
  speed: number;
  volume: number;
  muted: boolean;
  autoScroll: boolean;
}

function isInstagramTab(url?: string): boolean {
  return typeof url === 'string' && url.includes('://www.instagram.com/');
}

function getPrefs(): Promise<UserPrefs> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      [
        PREF_KEYS.SCRUBBER_ENABLED,
        PREF_KEYS.SPEED,
        PREF_KEYS.VOLUME,
        PREF_KEYS.FEED_MUTED,
        PREF_KEYS.AUTO_SCROLL
      ],
      (data) => {
        resolve({
          enabled: typeof data[PREF_KEYS.SCRUBBER_ENABLED] === 'boolean' ? (data[PREF_KEYS.SCRUBBER_ENABLED] as boolean) : true,
          speed: typeof data[PREF_KEYS.SPEED] === 'number' ? (data[PREF_KEYS.SPEED] as number) : 1.0,
          volume: typeof data[PREF_KEYS.VOLUME] === 'number' ? (data[PREF_KEYS.VOLUME] as number) : 0.8,
          muted: typeof data[PREF_KEYS.FEED_MUTED] === 'boolean' ? (data[PREF_KEYS.FEED_MUTED] as boolean) : false,
          autoScroll: typeof data[PREF_KEYS.AUTO_SCROLL] === 'boolean' ? (data[PREF_KEYS.AUTO_SCROLL] as boolean) : true,
        });
      }
    );
  });
}

function injectPrefs(tabId: number, prefs: UserPrefs, force: boolean = false) {
  const { enabled, muted, speed, volume, autoScroll } = prefs;

  chrome.scripting
    .executeScript({
      target: { tabId },
      world: 'MAIN',
      func: (
        enabled: boolean,
        flags: Record<string, boolean>,
        feedMuted: boolean,
        speedPref: number,
        volumePref: number,
        autoScrollPref: boolean,
        forceOverwrite: boolean,
        gEnabled: string,
        gFlags: string,
        toggleEventName: string
      ) => {
        // Standard globals read via constants imports
        (window as any)[gEnabled] = enabled;
        (window as any)[gFlags] = flags;

        // Sync the mute state with localStorage / sessionStorage in MAIN world
        let currentStoredMute: string | null = null;
        try {
          currentStoredMute =
            window.localStorage.getItem('reels_scrubber_feed_muted_pref') ||
            window.sessionStorage.getItem('reels_scrubber_feed_muted_pref');
        } catch (e) {}

        if (forceOverwrite || currentStoredMute === null) {
          (window as any).__REELS_SCRUBBER_FEED_MUTED__ = feedMuted;
          try {
            window.localStorage.setItem('reels_scrubber_feed_muted_pref', String(feedMuted));
            window.sessionStorage.setItem('reels_scrubber_feed_muted_pref', String(feedMuted));
          } catch (e) {}
        } else {
          (window as any).__REELS_SCRUBBER_FEED_MUTED__ = currentStoredMute === 'true';
        }

        // Sync the default playback speed preference
        let currentStoredSpeed: string | null = null;
        try {
          currentStoredSpeed = window.localStorage.getItem('reels_scrubber_speed_pref');
        } catch (e) {}

        if (forceOverwrite || currentStoredSpeed === null) {
          try {
            window.localStorage.setItem('reels_scrubber_speed_pref', String(speedPref));
          } catch (e) {}
        }

        // Sync the default volume preference
        let currentStoredVolume: string | null = null;
        try {
          currentStoredVolume = window.localStorage.getItem('reels_scrubber_volume_pref');
        } catch (e) {}

        if (forceOverwrite || currentStoredVolume === null) {
          try {
            window.localStorage.setItem('reels_scrubber_volume_pref', String(volumePref));
          } catch (e) {}
        }

        // Sync the auto-scroll preference
        let currentStoredAutoScroll: string | null = null;
        try {
          currentStoredAutoScroll = window.localStorage.getItem('reels_scrubber_auto_scroll_pref');
        } catch (e) {}

        if (forceOverwrite || currentStoredAutoScroll === null) {
          try {
            window.localStorage.setItem('reels_scrubber_auto_scroll_pref', String(autoScrollPref));
          } catch (e) {}
        }

        // If forcing an update (changed via popup), dispatch an event so the ES module context can apply it securely
        if (forceOverwrite) {
          window.dispatchEvent(
            new CustomEvent('ig-reels-scrubber-force-update', {
              detail: { speedPref, volumePref, autoScrollPref }
            })
          );
        }

        if (typeof (window as any).__REELS_SCRUBBER_APPLYING_MUTE__ === 'undefined') {
          (window as any).__REELS_SCRUBBER_APPLYING_MUTE__ = false;
        }

        window.dispatchEvent(
          new CustomEvent(toggleEventName, {
            detail: { enabled },
          })
        );
      },
      args: [
        enabled,
        featureFlags,
        muted,
        speed,
        volume,
        autoScroll,
        force,
        DOM_ATTRIBUTES.REELS_SCRUBBER_ENABLED,
        G_FLAGS,
        DOM_CLASSES.TOGGLE,
      ],
    })
    .catch(() => {});
}

async function injectAll(force: boolean = false) {
  const prefs = await getPrefs();
  chrome.tabs.query({ url: [MATCH_PATTERN_INSTAGRAM] }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id && isInstagramTab(tab.url)) {
        injectPrefs(tab.id, prefs, force);
      }
    });
  });
}

function initDefaults() {
  chrome.storage.local.get([PREF_KEYS.SCRUBBER_ENABLED], (data) => {
    if (typeof data[PREF_KEYS.SCRUBBER_ENABLED] !== 'boolean') {
      chrome.storage.local.set({ [PREF_KEYS.SCRUBBER_ENABLED]: true });
    }
  });
}

// Lifecycle
chrome.runtime.onInstalled.addListener((details) => {
  console.info(LOG, 'installed', details.reason);
  initDefaults();
  injectAll(true);

  if (details.reason === 'install') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/support/index.html'),
    });
  }
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

// Re-inject all tabs when prefs change
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    const shouldForce =
      changes[PREF_KEYS.FEED_MUTED] !== undefined ||
      changes[PREF_KEYS.SCRUBBER_ENABLED] !== undefined ||
      changes[PREF_KEYS.SPEED] !== undefined ||
      changes[PREF_KEYS.VOLUME] !== undefined ||
      changes[PREF_KEYS.AUTO_SCROLL] !== undefined;
    if (shouldForce) {
      injectAll(true);
    }
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'healthcheck') {
    sendResponse({ ok: true, source: 'ReelSlider background' });
    return true;
  }
  if (msg?.type === 'download-video') {
    const { url, filename } = msg.payload || {};
    if (url && typeof url === 'string') {
      chrome.downloads.download(
        {
          url,
          filename: filename || `instagram_video_${Date.now()}.mp4`,
          conflictAction: 'uniquify',
        },
        (downloadId) => {
          if (chrome.runtime.lastError) {
            console.warn(LOG, 'Download failed:', chrome.runtime.lastError.message);
            sendResponse({ ok: false, error: chrome.runtime.lastError.message });
          } else {
            console.info(LOG, 'Download started, id:', downloadId);
            sendResponse({ ok: true, downloadId });
          }
        }
      );
    } else {
      sendResponse({ ok: false, error: 'Missing URL' });
    }
    return true; // keep the message channel open for async sendResponse
  }
  return false;
});
