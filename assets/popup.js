// ReelSlider — Popup Script
// by sumedh | https://github.com/Sumedhvats/

const STORAGE_KEY_ENABLED = 'reels_scrubber_enabled';
const STORAGE_KEY_SPEED   = 'reels_scrubber_speed_pref';
const STORAGE_KEY_VOLUME  = 'reels_scrubber_volume_pref';
const STORAGE_KEY_MUTED   = 'reels_scrubber_feed_muted_pref';

// Matches constants-nW6bUIy2.js → G_ENABLED & TOGGLE_EVT
const G_ENABLED  = '__IG_REELS_SCRUBBER_ENABLED__';
const TOGGLE_EVT = 'ig-reels-scrubber-toggle';

const SPEED_STEPS  = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
const VOLUME_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

let state = {
  enabled: true,
  speedIdx: SPEED_STEPS.indexOf(1.0),
  volIdx:   VOLUME_STEPS.indexOf(80),
  muted:    false,
};

// ── DOM refs ──────────────────────────────────────────────
const mainToggle    = document.getElementById('main-toggle');
const toggleStatus  = document.getElementById('toggle-status');
const speedVal      = document.getElementById('speed-val');
const volVal        = document.getElementById('vol-val');
const muteToggle    = document.getElementById('mute-toggle');
const settingsSec   = document.getElementById('settings-section');
const shortcutsSec  = document.getElementById('shortcuts-section');

// ── Helpers ───────────────────────────────────────────────
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

function render() {
  const { enabled, speedIdx, volIdx, muted } = state;

  // main toggle
  mainToggle.classList.toggle('on', enabled);
  mainToggle.setAttribute('aria-pressed', String(enabled));
  toggleStatus.textContent = enabled ? 'Enabled' : 'Disabled';
  toggleStatus.classList.toggle('on', enabled);

  // dim sections when disabled
  settingsSec.classList.toggle('disabled-overlay', !enabled);
  shortcutsSec.classList.toggle('disabled-overlay', !enabled);

  // speed
  const sp = SPEED_STEPS[speedIdx];
  speedVal.textContent = sp.toFixed(sp % 1 === 0 ? 1 : 2) + '×';

  // volume
  const vol = VOLUME_STEPS[volIdx];
  volVal.textContent = vol + '%';

  // mute toggle
  muteToggle.classList.toggle('on', muted);
  muteToggle.setAttribute('aria-pressed', String(muted));
}

function save() {
  chrome.storage.local.set({
    [STORAGE_KEY_ENABLED]: state.enabled,
    [STORAGE_KEY_SPEED]:   SPEED_STEPS[state.speedIdx],
    [STORAGE_KEY_VOLUME]:  VOLUME_STEPS[state.volIdx] / 100,
    [STORAGE_KEY_MUTED]:   state.muted,
  });
}

function broadcastEnabled(val) {
  chrome.tabs.query({ url: ['*://www.instagram.com/*'] }, tabs => {
    tabs.forEach(tab => {
      if (!tab.id) return;
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: (enabled, gEnabled, toggleEvt) => {
          window[gEnabled] = enabled;
          window.dispatchEvent(new CustomEvent(toggleEvt, { detail: { enabled } }));
        },
        args: [val, G_ENABLED, TOGGLE_EVT],
      }).catch(() => {});
    });
  });
}

// ── Load state ────────────────────────────────────────────
chrome.storage.local.get(
  [STORAGE_KEY_ENABLED, STORAGE_KEY_SPEED, STORAGE_KEY_VOLUME, STORAGE_KEY_MUTED],
  (data) => {
    if (typeof data[STORAGE_KEY_ENABLED] === 'boolean') {
      state.enabled = data[STORAGE_KEY_ENABLED];
    }
    if (typeof data[STORAGE_KEY_SPEED] === 'number') {
      const idx = SPEED_STEPS.indexOf(data[STORAGE_KEY_SPEED]);
      if (idx !== -1) state.speedIdx = idx;
    }
    if (typeof data[STORAGE_KEY_VOLUME] === 'number') {
      const vol = Math.round(data[STORAGE_KEY_VOLUME] * 100);
      const idx = VOLUME_STEPS.indexOf(vol);
      if (idx !== -1) state.volIdx = idx;
    }
    if (typeof data[STORAGE_KEY_MUTED] === 'boolean') {
      state.muted = data[STORAGE_KEY_MUTED];
    }
    render();
  }
);

// ── Event listeners ───────────────────────────────────────
mainToggle.addEventListener('click', () => {
  state.enabled = !state.enabled;
  render();
  save();
  broadcastEnabled(state.enabled);
});

document.getElementById('speed-dec').addEventListener('click', () => {
  state.speedIdx = clamp(state.speedIdx - 1, 0, SPEED_STEPS.length - 1);
  render(); save();
});
document.getElementById('speed-inc').addEventListener('click', () => {
  state.speedIdx = clamp(state.speedIdx + 1, 0, SPEED_STEPS.length - 1);
  render(); save();
});

document.getElementById('vol-dec').addEventListener('click', () => {
  state.volIdx = clamp(state.volIdx - 1, 0, VOLUME_STEPS.length - 1);
  render(); save();
});
document.getElementById('vol-inc').addEventListener('click', () => {
  state.volIdx = clamp(state.volIdx + 1, 0, VOLUME_STEPS.length - 1);
  render(); save();
});

muteToggle.addEventListener('click', () => {
  state.muted = !state.muted;
  render(); save();
});
