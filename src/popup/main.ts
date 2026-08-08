import { PREF_KEYS, DOM_ATTRIBUTES, DOM_CLASSES } from '../utils/constants';

interface PopupState {
  enabled: boolean;
  speedIdx: number;
  volIdx: number;
  muted: boolean;
  autoScroll: boolean;
  limitEnabled: boolean;
  limitIdx: number;
  todaySeconds: number;
  snoozeSeconds: number;
}

const SPEED_STEPS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
const VOLUME_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const LIMIT_STEPS = [15, 30, 45, 60, 90, 120, 180, 240];

const STORAGE_KEY_LIMIT_ENABLED = 'reels_limit_enabled';
const STORAGE_KEY_LIMIT_MINUTES = 'reels_limit_minutes';
const STORAGE_KEY_TODAY_SECONDS = 'reels_timer_today_seconds';
const STORAGE_KEY_SNOOZE_SECONDS = 'reels_limit_snooze_seconds';

let state: PopupState = {
  enabled: true,
  speedIdx: SPEED_STEPS.indexOf(1.0),
  volIdx: VOLUME_STEPS.indexOf(80),
  muted: false,
  autoScroll: true,
  limitEnabled: false,
  limitIdx: LIMIT_STEPS.indexOf(60),
  todaySeconds: 0,
  snoozeSeconds: 0,
};

// DOM refs
const ui = {
  powerToggle: document.getElementById('main-toggle') as HTMLButtonElement,
  muteToggle: document.getElementById('mute-toggle') as HTMLButtonElement,
  autoscrollToggle: document.getElementById('autoscroll-toggle') as HTMLButtonElement,
};
const toggleStatus = document.getElementById('toggle-status') as HTMLElement;
const speedVal = document.getElementById('speed-val') as HTMLElement;
const volVal = document.getElementById('vol-val') as HTMLElement;
const settingsSec = document.getElementById('settings-section') as HTMLElement;
const shortcutsSec = document.getElementById('shortcuts-section') as HTMLElement;
const limitSec = document.getElementById('limit-section') as HTMLElement;
const limitToggle = document.getElementById('limit-toggle') as HTMLElement;
const limitStatus = document.getElementById('limit-status') as HTMLElement;
const limitVal = document.getElementById('limit-val') as HTMLElement;
const limitTimeLabel = document.getElementById('limit-time-label') as HTMLElement;
const limitControlsRow = document.getElementById('limit-controls-row') as HTMLElement;
const limitUsageText = document.getElementById('limit-usage-text') as HTMLElement;
const limitRemainingText = document.getElementById('limit-remaining-text') as HTMLElement;

// Helpers
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h 00m`;
  return `${mins}m`;
}

function formatDurationShort(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

function formatTimeShort(seconds: number): string {
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

  ui.powerToggle.classList.toggle('on', enabled);
  ui.powerToggle.setAttribute('aria-pressed', String(enabled));
  toggleStatus.textContent = enabled ? 'Enabled' : 'Disabled';
  toggleStatus.classList.toggle('on', enabled);

  settingsSec.classList.toggle('disabled-overlay', !enabled);
  shortcutsSec.classList.toggle('disabled-overlay', !enabled);
  limitSec.classList.toggle('disabled-overlay', !enabled);

  const sp = SPEED_STEPS[speedIdx];
  speedVal.textContent = sp.toFixed(sp % 1 === 0 ? 1 : 2) + '×';

  const vol = VOLUME_STEPS[volIdx];
  volVal.textContent = vol + '%';

  ui.muteToggle.classList.toggle('on', muted);
  ui.muteToggle.setAttribute('aria-pressed', String(muted));

  ui.autoscrollToggle.classList.toggle('on', state.autoScroll);
  ui.autoscrollToggle.setAttribute('aria-pressed', String(state.autoScroll));


  limitToggle.classList.toggle('on', limitEnabled);
  limitToggle.setAttribute('aria-pressed', String(limitEnabled));
  limitStatus.textContent = limitEnabled ? 'Enabled' : 'Disabled';
  limitStatus.classList.toggle('on', limitEnabled);

  limitControlsRow.style.display = limitEnabled ? 'flex' : 'none';

  const limitMins = LIMIT_STEPS[limitIdx];
  const maxSec = limitMins * 60 + snoozeSeconds;
  limitVal.textContent = formatDurationShort(limitMins);
  limitTimeLabel.textContent = formatDuration(limitMins) + ' / day';

  const usedMins = formatTimeShort(todaySeconds);
  const totalMinsLabel = formatDuration(limitMins);
  limitUsageText.textContent = `${usedMins} / ${totalMinsLabel} used`;

  const remainingSec = Math.max(0, maxSec - todaySeconds);
  const remMinsLabel = formatTimeShort(remainingSec);
  limitRemainingText.textContent = remainingSec <= 0 ? 'Limit reached' : `${remMinsLabel} left`;
}

function save() {
  chrome.storage.local.set({
    [PREF_KEYS.SCRUBBER_ENABLED]: state.enabled,
    [PREF_KEYS.SPEED]: SPEED_STEPS[state.speedIdx],
    [PREF_KEYS.VOLUME]: VOLUME_STEPS[state.volIdx] / 100,
    [PREF_KEYS.FEED_MUTED]: state.muted,
    [PREF_KEYS.AUTO_SCROLL]: state.autoScroll,
    [STORAGE_KEY_LIMIT_ENABLED]: state.limitEnabled,
    [STORAGE_KEY_LIMIT_MINUTES]: LIMIT_STEPS[state.limitIdx],
  }, () => render());
}

function broadcastEnabled(val: boolean) {
  chrome.tabs.query({ url: ['*://www.instagram.com/*'] }, (tabs) => {
    tabs.forEach((tab) => {
      if (!tab.id) return;
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          world: 'MAIN',
          func: (enabled, gEnabled, toggleEvt) => {
            (window as any)[gEnabled as string] = enabled;
            window.dispatchEvent(
              new CustomEvent(toggleEvt as string, { detail: { enabled } })
            );
          },
          args: [val, DOM_ATTRIBUTES.REELS_SCRUBBER_ENABLED, DOM_CLASSES.TOGGLE],
        })
        .catch(() => {});
    });
  });
}

chrome.storage.local.get(
  [
    PREF_KEYS.SCRUBBER_ENABLED,
    PREF_KEYS.SPEED,
    PREF_KEYS.VOLUME,
    PREF_KEYS.FEED_MUTED,
    PREF_KEYS.AUTO_SCROLL,
    STORAGE_KEY_LIMIT_ENABLED,
    STORAGE_KEY_LIMIT_MINUTES,
    STORAGE_KEY_TODAY_SECONDS,
    STORAGE_KEY_SNOOZE_SECONDS,
  ],
  (data) => {
    if (typeof data[PREF_KEYS.SCRUBBER_ENABLED] === 'boolean') {
      state.enabled = data[PREF_KEYS.SCRUBBER_ENABLED] as boolean;
    }
    if (typeof data[PREF_KEYS.SPEED] === 'number') {
      const idx = SPEED_STEPS.indexOf(data[PREF_KEYS.SPEED] as number);
      if (idx !== -1) state.speedIdx = idx;
    }
    if (typeof data[PREF_KEYS.VOLUME] === 'number') {
      const vol = Math.round((data[PREF_KEYS.VOLUME] as number) * 100);
      const idx = VOLUME_STEPS.indexOf(vol);
      if (idx !== -1) state.volIdx = idx;
    }
    if (typeof data[PREF_KEYS.FEED_MUTED] === 'boolean') {
      state.muted = data[PREF_KEYS.FEED_MUTED] as boolean;
    }
    if (typeof data[PREF_KEYS.AUTO_SCROLL] === 'boolean') {
      state.autoScroll = data[PREF_KEYS.AUTO_SCROLL] as boolean;
    }
    if (typeof data[STORAGE_KEY_LIMIT_ENABLED] === 'boolean') {
      state.limitEnabled = data[STORAGE_KEY_LIMIT_ENABLED] as boolean;
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

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    let shouldRender = false;
    if (changes[STORAGE_KEY_TODAY_SECONDS]) {
      state.todaySeconds = (changes[STORAGE_KEY_TODAY_SECONDS].newValue as number) || 0;
      shouldRender = true;
    }
    if (changes[STORAGE_KEY_SNOOZE_SECONDS]) {
      state.snoozeSeconds = (changes[STORAGE_KEY_SNOOZE_SECONDS].newValue as number) || 0;
      shouldRender = true;
    }
    if (changes[PREF_KEYS.SPEED]) {
      const idx = SPEED_STEPS.indexOf(changes[PREF_KEYS.SPEED].newValue as number);
      if (idx !== -1) {
        state.speedIdx = idx;
        shouldRender = true;
      }
    }
    if (shouldRender) render();
  }
});

ui.powerToggle.addEventListener('click', () => {
  state.enabled = !state.enabled;
  render();
  save();
  broadcastEnabled(state.enabled);
});

document.getElementById('speed-dec')!.addEventListener('click', () => {
  state.speedIdx = clamp(state.speedIdx - 1, 0, SPEED_STEPS.length - 1);
  render();
  save();
});
document.getElementById('speed-inc')!.addEventListener('click', () => {
  state.speedIdx = clamp(state.speedIdx + 1, 0, SPEED_STEPS.length - 1);
  render();
  save();
});

document.getElementById('vol-dec')!.addEventListener('click', () => {
  state.volIdx = clamp(state.volIdx - 1, 0, VOLUME_STEPS.length - 1);
  render();
  save();
});
document.getElementById('vol-inc')!.addEventListener('click', () => {
  state.volIdx = clamp(state.volIdx + 1, 0, VOLUME_STEPS.length - 1);
  render();
  save();
});

ui.muteToggle.addEventListener('click', () => {
  state.muted = !state.muted;
  render();
  save();
});

ui.autoscrollToggle.addEventListener('click', () => {
  state.autoScroll = !state.autoScroll;
  render();
  save();
});


limitToggle.addEventListener('click', () => {
  state.limitEnabled = !state.limitEnabled;
  render();
  save();
});

document.getElementById('limit-dec')!.addEventListener('click', () => {
  state.limitIdx = clamp(state.limitIdx - 1, 0, LIMIT_STEPS.length - 1);
  render();
  save();
});
document.getElementById('limit-inc')!.addEventListener('click', () => {
  state.limitIdx = clamp(state.limitIdx + 1, 0, LIMIT_STEPS.length - 1);
  render();
  save();
});
