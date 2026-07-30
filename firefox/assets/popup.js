// ReelSlider — Popup Script (Firefox Version)
// by sumedh | https://github.com/Sumedhvats/

if (typeof chrome === 'undefined' && typeof browser !== 'undefined') {
  globalThis.chrome = browser;
}

const STORAGE_KEY_ENABLED = 'reels_scrubber_enabled';
const STORAGE_KEY_SPEED   = 'reels_scrubber_speed_pref';
const STORAGE_KEY_VOLUME  = 'reels_scrubber_volume_pref';
const STORAGE_KEY_MUTED   = 'reels_scrubber_feed_muted_pref';

const STORAGE_KEY_LIMIT_ENABLED  = 'reels_limit_enabled';
const STORAGE_KEY_LIMIT_MINUTES  = 'reels_limit_minutes';
const STORAGE_KEY_TODAY_SECONDS  = 'reels_timer_today_seconds';
const STORAGE_KEY_SNOOZE_SECONDS = 'reels_limit_snooze_seconds';

// Matches constants-nW6bUIy2.js → G_ENABLED & TOGGLE_EVT
const G_ENABLED  = '__IG_REELS_SCRUBBER_ENABLED__';
const TOGGLE_EVT = 'ig-reels-scrubber-toggle';

const SPEED_STEPS  = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
const VOLUME_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const LIMIT_STEPS  = [15, 30, 45, 60, 90, 120, 180, 240];

let state = {
  enabled: true,
  speedIdx: SPEED_STEPS.indexOf(1.0),
  volIdx:   VOLUME_STEPS.indexOf(80),
  muted:    false,
  limitEnabled: false,
  limitIdx: LIMIT_STEPS.indexOf(60),
  todaySeconds: 0,
  snoozeSeconds: 0,
};

// ── DOM refs ──────────────────────────────────────────────
const mainToggle    = document.getElementById('main-toggle');
const toggleStatus  = document.getElementById('toggle-status');
const speedVal      = document.getElementById('speed-val');
const volVal        = document.getElementById('vol-val');
const muteToggle    = document.getElementById('mute-toggle');
const settingsSec   = document.getElementById('settings-section');
const shortcutsSec  = document.getElementById('shortcuts-section');

const limitSec          = document.getElementById('limit-section');
const limitToggle       = document.getElementById('limit-toggle');
const limitStatus       = document.getElementById('limit-status');
const limitVal          = document.getElementById('limit-val');
const limitTimeLabel    = document.getElementById('limit-time-label');
const limitControlsRow  = document.getElementById('limit-controls-row');
const limitProgressWrap = document.getElementById('limit-progress-wrap');
const limitUsageText    = document.getElementById('limit-usage-text');
const limitRemainingText = document.getElementById('limit-remaining-text');
const limitProgressFill = document.getElementById('limit-progress-fill');

// ── Helpers ───────────────────────────────────────────────
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

function formatDuration(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h 00m`;
  return `${mins}m`;
}

function formatDurationShort(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

function formatTimeShort(seconds) {
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs > 0) {
    return `${hrs}h ${remMins}m`;
  }
  return `${mins}m`;
}

function render() {
  const { enabled, speedIdx, volIdx, muted, limitEnabled, limitIdx, todaySeconds, snoozeSeconds } = state;

  // main toggle
  mainToggle.classList.toggle('on', enabled);
  mainToggle.setAttribute('aria-pressed', String(enabled));
  toggleStatus.textContent = enabled ? 'Enabled' : 'Disabled';
  toggleStatus.classList.toggle('on', enabled);

  // dim sections when disabled
  settingsSec.classList.toggle('disabled-overlay', !enabled);
  shortcutsSec.classList.toggle('disabled-overlay', !enabled);
  limitSec.classList.toggle('disabled-overlay', !enabled);

  // speed
  const sp = SPEED_STEPS[speedIdx];
  speedVal.textContent = sp.toFixed(sp % 1 === 0 ? 1 : 2) + '×';

  // volume
  const vol = VOLUME_STEPS[volIdx];
  volVal.textContent = vol + '%';

  // mute toggle
  muteToggle.classList.toggle('on', muted);
  muteToggle.setAttribute('aria-pressed', String(muted));

  // daily limit
  limitToggle.classList.toggle('on', limitEnabled);
  limitToggle.setAttribute('aria-pressed', String(limitEnabled));
  limitStatus.textContent = limitEnabled ? 'Enabled' : 'Disabled';
  limitStatus.classList.toggle('on', limitEnabled);

  limitControlsRow.style.display = limitEnabled ? 'flex' : 'none';
  limitProgressWrap.style.display = limitEnabled ? 'block' : 'none';

  const limitMins = LIMIT_STEPS[limitIdx];
  const maxSec = (limitMins * 60) + snoozeSeconds;
  limitVal.textContent = formatDurationShort(limitMins);
  limitTimeLabel.textContent = formatDuration(limitMins) + ' / day';

  const usedMins = formatTimeShort(todaySeconds);
  const totalMinsLabel = formatDuration(limitMins);
  limitUsageText.textContent = `${usedMins} / ${totalMinsLabel} used`;

  const remainingSec = Math.max(0, maxSec - todaySeconds);
  const remMinsLabel = formatTimeShort(remainingSec);
  limitRemainingText.textContent = remainingSec <= 0 ? 'Limit reached' : `${remMinsLabel} left`;

  const pct = Math.min(100, Math.round((todaySeconds / Math.max(1, maxSec)) * 100));
  limitProgressFill.style.width = pct + '%';
  limitProgressFill.classList.toggle('warning', pct >= 90);
}

function save() {
  chrome.storage.local.set({
    [STORAGE_KEY_ENABLED]:       state.enabled,
    [STORAGE_KEY_SPEED]:         SPEED_STEPS[state.speedIdx],
    [STORAGE_KEY_VOLUME]:        VOLUME_STEPS[state.volIdx] / 100,
    [STORAGE_KEY_MUTED]:         state.muted,
    [STORAGE_KEY_LIMIT_ENABLED]: state.limitEnabled,
    [STORAGE_KEY_LIMIT_MINUTES]: LIMIT_STEPS[state.limitIdx],
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
  [
    STORAGE_KEY_ENABLED,
    STORAGE_KEY_SPEED,
    STORAGE_KEY_VOLUME,
    STORAGE_KEY_MUTED,
    STORAGE_KEY_LIMIT_ENABLED,
    STORAGE_KEY_LIMIT_MINUTES,
    STORAGE_KEY_TODAY_SECONDS,
    STORAGE_KEY_SNOOZE_SECONDS
  ],
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
    if (typeof data[STORAGE_KEY_LIMIT_ENABLED] === 'boolean') {
      state.limitEnabled = data[STORAGE_KEY_LIMIT_ENABLED];
    }
    if (typeof data[STORAGE_KEY_LIMIT_MINUTES] === 'number') {
      const idx = LIMIT_STEPS.indexOf(data[STORAGE_KEY_LIMIT_MINUTES]);
      if (idx !== -1) state.limitIdx = idx;
    }
    if (typeof data[STORAGE_KEY_TODAY_SECONDS] === 'number') {
      state.todaySeconds = data[STORAGE_KEY_TODAY_SECONDS];
    }
    if (typeof data[STORAGE_KEY_SNOOZE_SECONDS] === 'number') {
      state.snoozeSeconds = data[STORAGE_KEY_SNOOZE_SECONDS];
    }
    render();
  }
);

// Listen for storage changes while popup is open to update live progress
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes[STORAGE_KEY_TODAY_SECONDS]) {
      state.todaySeconds = changes[STORAGE_KEY_TODAY_SECONDS].newValue || 0;
      render();
    }
    if (changes[STORAGE_KEY_SNOOZE_SECONDS]) {
      state.snoozeSeconds = changes[STORAGE_KEY_SNOOZE_SECONDS].newValue || 0;
      render();
    }
  }
});

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

limitToggle.addEventListener('click', () => {
  state.limitEnabled = !state.limitEnabled;
  render(); save();
});

document.getElementById('limit-dec').addEventListener('click', () => {
  state.limitIdx = clamp(state.limitIdx - 1, 0, LIMIT_STEPS.length - 1);
  render(); save();
});
document.getElementById('limit-inc').addEventListener('click', () => {
  state.limitIdx = clamp(state.limitIdx + 1, 0, LIMIT_STEPS.length - 1);
  render(); save();
});

