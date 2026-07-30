// ReelSlider — Daily Instagram Usage Limit & Digital Wellbeing Tracker (Firefox Version)
// by sumedh | https://github.com/Sumedhvats/

if (typeof chrome === 'undefined' && typeof browser !== 'undefined') {
  globalThis.chrome = browser;
}

(function () {
  'use strict';

  // ── Storage Keys ──
  const KEY_ENABLED        = 'reels_limit_enabled';
  const KEY_MINUTES        = 'reels_limit_minutes';
  const KEY_TODAY_SECONDS  = 'reels_timer_today_seconds';
  const KEY_DATE           = 'reels_timer_date';
  const KEY_SNOOZE_SECONDS = 'reels_limit_snooze_seconds';

  const OVERLAY_ID = 'reelslider-limit-overlay';

  let state = {
    enabled: false,
    limitMinutes: 60,
    todaySeconds: 0,
    snoozeSeconds: 0,
    dateStr: ''
  };

  let timerInterval = null;

  function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function isInstagramPage() {
    return window.location.hostname.includes('instagram.com');
  }

  function formatTime(totalSec) {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}h ${String(mins).padStart(2, '0')}m`;
    }
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  }

  function formatDurationShort(minutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h 00m`;
    return `${mins}m`;
  }

  // ── Sync State from Storage ──
  function syncStorage(callback) {
    chrome.storage.local.get(
      [KEY_ENABLED, KEY_MINUTES, KEY_TODAY_SECONDS, KEY_DATE, KEY_SNOOZE_SECONDS],
      (data) => {
        const today = getTodayString();

        state.enabled = typeof data[KEY_ENABLED] === 'boolean' ? data[KEY_ENABLED] : false;
        state.limitMinutes = typeof data[KEY_MINUTES] === 'number' ? data[KEY_MINUTES] : 60;
        state.snoozeSeconds = typeof data[KEY_SNOOZE_SECONDS] === 'number' ? data[KEY_SNOOZE_SECONDS] : 0;

        const storedDate = data[KEY_DATE] || '';
        if (storedDate !== today) {
          // New day reset
          state.dateStr = today;
          state.todaySeconds = 0;
          state.snoozeSeconds = 0;
          chrome.storage.local.set({
            [KEY_DATE]: today,
            [KEY_TODAY_SECONDS]: 0,
            [KEY_SNOOZE_SECONDS]: 0
          });
        } else {
          state.dateStr = storedDate;
          state.todaySeconds = typeof data[KEY_TODAY_SECONDS] === 'number' ? data[KEY_TODAY_SECONDS] : 0;
        }

        if (callback) callback();
        checkLimit();
      }
    );
  }

  // ── Limit Overlay ──
  function injectStyles() {
    if (document.getElementById('reelslider-limit-style')) return;
    const style = document.createElement('style');
    style.id = 'reelslider-limit-style';
    style.textContent = `
      #${OVERLAY_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: rgba(5, 5, 5, 0.94);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #ffffff;
        padding: 24px;
        box-sizing: border-box;
      }
      #${OVERLAY_ID} .rs-limit-card {
        background: #111111;
        border: 1px solid #262626;
        border-radius: 20px;
        padding: 32px 28px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        animation: rsLimitPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes rsLimitPop {
        from { transform: scale(0.94); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      #${OVERLAY_ID} .rs-limit-icon {
        font-size: 44px;
        margin-bottom: 16px;
        display: inline-block;
      }
      #${OVERLAY_ID} .rs-limit-title {
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-bottom: 8px;
        color: #ffffff;
      }
      #${OVERLAY_ID} .rs-limit-sub {
        font-size: 13px;
        color: #888888;
        line-height: 1.5;
        margin-bottom: 24px;
      }
      #${OVERLAY_ID} .rs-limit-badge {
        background: rgba(255, 94, 91, 0.12);
        border: 1px solid rgba(255, 94, 91, 0.3);
        color: #ff5e5b;
        font-size: 12px;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: 20px;
        display: inline-block;
        margin-bottom: 24px;
      }
      #${OVERLAY_ID} .rs-limit-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      #${OVERLAY_ID} .rs-btn-snooze {
        background: #ffffff;
        color: #000000;
        border: none;
        border-radius: 10px;
        padding: 12px 18px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: opacity 0.15s, transform 0.15s;
      }
      #${OVERLAY_ID} .rs-btn-snooze:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      #${OVERLAY_ID} .rs-btn-feed {
        background: transparent;
        color: #888888;
        border: 1px solid #2a2a2a;
        border-radius: 10px;
        padding: 11px 18px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        font-family: inherit;
        transition: color 0.15s, border-color 0.15s;
      }
      #${OVERLAY_ID} .rs-btn-feed:hover {
        color: #ffffff;
        border-color: #555555;
      }
    `;
    document.head.appendChild(style);
  }

  function pauseAllVideos() {
    document.querySelectorAll('video').forEach(v => {
      try { v.pause(); } catch (e) {}
    });
  }

  function isLimitReached() {
    if (!state.enabled) return false;
    const maxSeconds = (state.limitMinutes * 60) + state.snoozeSeconds;
    return state.todaySeconds >= maxSeconds;
  }

  function showOverlay() {
    if (!isInstagramPage()) return;
    injectStyles();
    pauseAllVideos();

    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay) return; // Already showing, do not re-create DOM or re-trigger animation

    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;

    const limitLabel = formatDurationShort(state.limitMinutes);
    const watchedLabel = formatTime(state.todaySeconds);

    overlay.innerHTML = `
      <div class="rs-limit-card">
        <div class="rs-limit-icon">⏳</div>
        <div class="rs-limit-title">Daily Instagram Limit Reached</div>
        <div class="rs-limit-sub">
          You've used ${watchedLabel} of Instagram today. Take a breather or extend your limit.
        </div>
        <div class="rs-limit-badge">Limit: ${limitLabel} / day</div>
        <div class="rs-limit-actions">
          <button class="rs-btn-snooze" id="rs-snooze-15">+15 Min Snooze</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('rs-snooze-15').onclick = () => {
      const newSnooze = state.snoozeSeconds + (15 * 60);
      chrome.storage.local.set({ [KEY_SNOOZE_SECONDS]: newSnooze }, () => {
        state.snoozeSeconds = newSnooze;
        hideOverlay();
      });
    };
  }

  function hideOverlay() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
  }

  function checkLimit() {
    if (isInstagramPage() && isLimitReached()) {
      showOverlay();
    } else {
      hideOverlay();
    }
  }

  // ── Timer Loop ──
  function tick() {
    if (!state.enabled || !isInstagramPage() || document.visibilityState !== 'visible') {
      return;
    }

    if (isLimitReached()) {
      checkLimit();
      return;
    }

    const today = getTodayString();
    if (state.dateStr !== today) {
      state.dateStr = today;
      state.todaySeconds = 0;
      state.snoozeSeconds = 0;
      chrome.storage.local.set({
        [KEY_DATE]: today,
        [KEY_TODAY_SECONDS]: 0,
        [KEY_SNOOZE_SECONDS]: 0
      });
    } else {
      state.todaySeconds += 1;
      chrome.storage.local.set({ [KEY_TODAY_SECONDS]: state.todaySeconds });
    }

    checkLimit();
  }

  function initTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(tick, 1000);
  }

  // ── Event Listeners ──
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      if (changes[KEY_ENABLED] || changes[KEY_MINUTES] || changes[KEY_TODAY_SECONDS] || changes[KEY_SNOOZE_SECONDS]) {
        syncStorage();
      }
    }
  });

  // Block video playback when limit is reached
  document.addEventListener('play', (e) => {
    if (isInstagramPage() && isLimitReached() && e.target instanceof HTMLVideoElement) {
      e.target.pause();
      showOverlay();
    }
  }, true);

  // Monitor SPA navigation
  let lastUrl = location.href;
  const navObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      checkLimit();
    }
  });
  navObserver.observe(document, { subtree: true, childList: true });

  // Init
  syncStorage(() => {
    initTimer();
  });

})();
