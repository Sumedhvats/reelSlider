(() => {
  console.info("[ReelSlider] main-bundle.js executing in MAIN world");
  try {
  // firefox/assets/constants-nW6bUIy2.js
  var e = { remoteConfigUrl: ``, telemetryUrl: `` };
  var r = `__IG_REELS_SCRUBBER_ENABLED__`;
  var i = `ig-reels-scrubber-toggle`;
  var a = `data-reels-scrubber-active`;
  var o = `data-reels-scrubber-prev-style`;
  var s = `data-reels-scrubber-style-touched`;
  var c = `reels_scrubber_patched_count`;
  var l = `reels_scrubber_feed_muted_pref`;
  var u = `reels_scrubber_speed_pref`;
  var d = `reels_scrubber_volume_pref`;
  var f = `reels_scrubber_support_banner_dismissed`;
  var p = `reels_scrubber_support_snoozed_milestone`;
  var h = `reels_scrubber_last_failure_report_at`;
  var g = ``;
  var _ = ``;
  var y = ``;
  var w = `__IG_REELS_SCRUBBER_PRO__`;
  var T = `__IG_REELS_SCRUBBER_PRO_FEATURES__`;
  var E = `__IG_REELS_SCRUBBER_INSTANCE__`;
  var O = `reels_scrubber_pro_preview_baseline`;
  var k = `reels_scrubber_pro_preview_notice_shown`;
  var A = `reels_scrubber_pro_preview_welcome_shown`;
  var M = `reels_scrubber_pro_preview_prefs_reset`;
  var N = `reels_scrubber_pro_ever_licensed`;
  var P = `reels_scrubber_pro_announce_dismissed`;
  var F = `reels_scrubber_pro_announce_impressions`;
  var I = `reels_scrubber_pro_announce_snoozed_at`;
  var L = `reels_scrubber_last_card_at`;

  // firefox/assets/links-CpSuQi2Z.js
  var e2 = `1.0.0`;
  var t = { name: `ReelSlider`, fullName: `ReelSlider \u2014 Instagram Video Controls`, tagline: `Real Video Controls for Instagram`, description: `Real video controls on Instagram. Seek, volume & speed on reels, stories, feed & posts.`, version: e2, logPrefix: `[ReelSlider]` };
  var i2 = `https://github.com/Sumedhvats/`;
  var s2 = `https://github.com/Sumedhvats/`;

  // firefox/assets/featureFlags-BduP1muU.js
  var e3 = { enableAudioLock: true, enableShieldRemoval: true, enableRemoteConfig: false, enableProAnnounce: false };

  // firefox/assets/telemetry-BwuTmC1U.js
  function n(e4) {
    return { v: 1, extensionVersion: e2, ...e4 };
  }
  function r2(t2) {
    e.telemetryUrl && window.postMessage({ type: `__REELS_SCRUBBER_TELEMETRY__`, payload: n(t2) }, window.location.origin);
  }

  // firefox/assets/main.ts-CrHNQyXz.js
  var S = t.logPrefix;
  function C(e4, t2, n2) {
    let r3 = n2 ?? ``;
    switch (e4) {
      case `debug`:
        console.debug(S, t2, r3);
        break;
      case `info`:
        console.info(S, t2, r3);
        break;
      case `warn`:
        console.warn(S, t2, r3);
        break;
      case `error`:
        console.error(S, t2, r3);
        break;
      default:
        break;
    }
  }
  var w2 = { HOME_FEED: /^\/$/, REELS_VIEWER: /^\/reels\/[^/]+\/?$/, REEL_VIEWER: /^\/reel\/[^/]+\/?$/, USER_REEL_VIEWER: /^\/[^/]+\/reel\/[^/]+\/?$/, POST: /^\/p\/[^/]+\/?$/, PROFILE_REELS_TAB: /^\/[^/]+\/reels\/?$/, STORIES: /^\/stories\/[^/]+\/[^/]+\/?$/, STORIES_FALLBACK: /^\/stories\/[^/]+\/?$/ };
  function T2(e4) {
    return w2.REELS_VIEWER.test(e4) || w2.REEL_VIEWER.test(e4) || w2.USER_REEL_VIEWER.test(e4) || w2.POST.test(e4);
  }
  function E2(e4) {
    return w2.STORIES.test(e4) || w2.STORIES_FALLBACK.test(e4);
  }
  function de(e4) {
    return w2.HOME_FEED.test(e4) || T2(e4) || w2.PROFILE_REELS_TAB.test(e4) || E2(e4);
  }
  function fe(e4) {
    return w2.POST.test(e4);
  }
  function pe(e4) {
    return w2.HOME_FEED.test(e4) || T2(e4) || w2.PROFILE_REELS_TAB.test(e4);
  }
  function me(e4) {
    return { parent: e4.parentElement, nextSibling: e4.nextSibling, inlineStyle: e4.getAttribute(`style`) ?? ``, controls: e4.controls, muted: e4.muted };
  }
  function he(e4, t2) {
    t2.parent && (t2.nextSibling !== null && t2.nextSibling.parentNode === t2.parent ? t2.parent.insertBefore(e4, t2.nextSibling) : t2.parent.appendChild(e4)), t2.inlineStyle.length > 0 ? e4.setAttribute(`style`, t2.inlineStyle) : e4.removeAttribute(`style`), e4.controls = t2.controls, e4.muted = t2.muted;
  }
  function ge() {
    return { state: `idle`, attempts: 0, updatedAt: Date.now() };
  }
  var _e = class {
    store = /* @__PURE__ */ new WeakMap();
    get(e4) {
      let t2 = this.store.get(e4);
      if (t2) return t2;
      let n2 = ge();
      return this.store.set(e4, n2), n2;
    }
    markPatching(e4, t2) {
      let n2 = this.get(e4), r3 = { ...n2, state: `patching`, attempts: n2.attempts + 1, updatedAt: Date.now(), snapshot: t2, reason: void 0, errorMessage: void 0 };
      return this.store.set(e4, r3), r3;
    }
    markPatched(e4) {
      let t2 = { ...this.get(e4), state: `patched`, updatedAt: Date.now(), reason: void 0, errorMessage: void 0 };
      return this.store.set(e4, t2), t2;
    }
    markSkipped(e4, t2) {
      let n2 = { ...this.get(e4), state: `skipped`, updatedAt: Date.now(), reason: t2 };
      return this.store.set(e4, n2), n2;
    }
    markFailed(e4, t2, n2) {
      let r3 = { ...this.get(e4), state: `failed`, updatedAt: Date.now(), reason: t2, errorMessage: n2 };
      return this.store.set(e4, r3), r3;
    }
    markRollbackInProgress(e4) {
      let t2 = { ...this.get(e4), state: `rollback_in_progress`, updatedAt: Date.now() };
      return this.store.set(e4, t2), t2;
    }
    markRolledBack(e4) {
      let t2 = { ...this.get(e4), state: `rolled_back`, updatedAt: Date.now() };
      return this.store.set(e4, t2), t2;
    }
  };
  var ve = `[aria-label="Video player"], [data-instancekey]`;
  var ye = 55;
  var be = `reels-scrubber-story-controls`;
  var D = `data-reels-scrubber-story-layout`;
  var xe = 10;
  var Se = 10001;
  var Ce = `data-reels-scrubber-story-audio-syncing`;
  var we = 9999;
  var Te = `button:has(svg[aria-label="Tags"])`;
  var Ee = 3;
  var De = 55;
  var Oe = `data-reels-scrubber-tags-lift`;
  var ke = `data-reels-scrubber-tags-scope`;
  var Ae = `reels-scrubber-tags-lift-style`;
  function je(e4) {
    return E2(location.pathname) ? `story-viewer` : T2(location.pathname) ? `reel-viewer` : e4.closest(`li[style*="translateX("]`) ? `feed-carousel` : e4.closest(`article`) ? `feed-inline` : `unknown`;
  }
  function Me(e4) {
    if (fe(location.pathname) && e4.parentElement instanceof HTMLElement) return e4.parentElement;
    let t2 = [e4.closest(`[style*='--x-height']`), e4.closest(`article`), e4.parentElement];
    for (let e5 of t2) if (e5 instanceof HTMLElement) return e5;
    return null;
  }
  function Ne(e4, t2, n2) {
    if (n2 === `story-viewer`) return;
    let r3 = e4.closest(`[style*="--x-height"]`) ?? e4.closest(`article`) ?? e4.parentElement;
    if (!r3) return;
    let i3 = r3.querySelectorAll(ve);
    i3.length !== 0 && i3.forEach((e5) => {
      if (O2(e5), t2 === `disable`) {
        e5.style.setProperty(`pointer-events`, `none`, `important`);
        return;
      }
      if (t2 === `hide`) {
        e5.style.setProperty(`visibility`, `hidden`, `important`), e5.style.setProperty(`pointer-events`, `none`, `important`);
        return;
      }
      e5.style.setProperty(`pointer-events`, `none`, `important`), e5.style.setProperty(`visibility`, `hidden`, `important`);
    });
  }
  function Pe(e4, t2) {
    let n2 = t2 === `story-viewer` ? `[aria-label="Press to play"]` : `[aria-label="Press to play"], [aria-label="Play"], [aria-label="Toggle audio"], [aria-label="Adjust volume"]`;
    e4.querySelectorAll(n2).forEach((e5) => {
      t2 === `story-viewer` && (e5.closest(`[aria-label="Previous"]`) || e5.closest(`[aria-label="Next"]`)) || (O2(e5), e5.style.setProperty(`pointer-events`, `none`, `important`));
    });
  }
  function Fe(e4) {
    window.getComputedStyle(e4).position === `static` && (e4.style.position = `relative`);
  }
  function Ie(e4) {
    let t2 = e4.getBoundingClientRect();
    return t2.width <= 0 || t2.height <= 0;
  }
  function Le(e4) {
    let t2 = Re();
    return t2 ? t2 === e4 || t2.contains(e4) : false;
  }
  function Re() {
    let e4 = document;
    return document.fullscreenElement ?? e4.webkitFullscreenElement ?? null;
  }
  function ze(e4) {
    O2(e4), e4.style.setProperty(`pointer-events`, `auto`, `important`), e4.style.setProperty(`z-index`, String(Se), `important`), window.getComputedStyle(e4).position === `static` && e4.style.setProperty(`position`, `relative`, `important`);
  }
  function Be(e4) {
    let t2 = e4.closest(`button`) ?? e4.closest(`[role="button"]`) ?? e4;
    ze(t2);
    let n2 = t2.parentElement;
    n2 instanceof HTMLElement && !n2.querySelector(`video`) && ze(n2);
  }
  function Ve(e4) {
    let t2 = Ye(e4);
    t2 && (t2.querySelectorAll(`[data-instancekey] > [aria-label="Video player"], [aria-label="Video player"][data-visualcompletion="ignore"]`).forEach((e5) => {
      O2(e5), e5.style.setProperty(`pointer-events`, `none`, `important`);
    }), t2.querySelectorAll(`[aria-label="Toggle audio"], [aria-label="Audio is muted"], [aria-label="Audio is playing"], [aria-label="Adjust volume"], [aria-label="Pause"], [aria-label="Play"], [aria-label="Menu"], [aria-label="Next"], [aria-label="Previous"], textarea, [placeholder^="Reply to "]`).forEach((e5) => Be(e5)));
  }
  function He(e4) {
    e4.querySelectorAll(`button[aria-label="Toggle audio"], [aria-label="Audio is muted"], [aria-label="Audio is playing"], [aria-label="Adjust volume"]`).forEach((e5) => {
      let t2 = e5.closest(`button`) ?? e5.closest(`[role="button"]`) ?? e5;
      O2(t2), t2.style.setProperty(`display`, `none`, `important`), t2.style.setProperty(`pointer-events`, `none`, `important`);
    });
  }
  function Ue(e4, t2) {
    let n2 = t2 === `story-viewer` ? `[aria-label="Press to play"]` : `[aria-label="Press to play"], [data-visualcompletion="ignore"]`;
    e4.querySelectorAll(n2).forEach((e5) => {
      e5.querySelector(`a[href]`) || (O2(e5), e5.style.removeProperty(`opacity`), e5.style.setProperty(`pointer-events`, `none`, `important`));
    });
  }
  function We() {
    if (document.getElementById(Ae)) return;
    let e4 = document.createElement(`style`);
    e4.id = Ae, e4.textContent = `[${Oe}]{transition:transform 1.2s ease-in-out 2s;}[${ke}]:has(video[${a}]:hover) [${Oe}],[${ke}]:has(video[${a}]) [${Oe}]:hover{transform:translate(-${Ee}px,-${De}px) !important;transition:transform 0.2s ease 0s;}`, document.head.appendChild(e4);
  }
  function Ge(e4, t2) {
    if (t2 === `story-viewer`) return;
    let n2 = e4.closest(`[style*="--x-height"]`) ?? e4.closest(`article`) ?? e4.parentElement;
    n2 && (We(), n2.setAttribute(ke, `true`), n2.querySelectorAll(Te).forEach((e5) => {
      let t3 = e5.parentElement instanceof HTMLElement ? e5.parentElement : e5;
      O2(t3), t3.style.setProperty(`visibility`, `visible`, `important`), t3.style.setProperty(`pointer-events`, `auto`, `important`), t3.style.removeProperty(`transform`), t3.setAttribute(Oe, `true`);
    }));
  }
  function Ke(e4, t2) {
    let n2 = je(e4);
    if (e4.controls = true, (n2 === `feed-inline` || n2 === `feed-carousel`) && at(e4), Ne(e4, `remove`, n2), Pe(t2, n2), He(t2), Ue(t2, n2), et(e4, n2), rt(e4, n2), Ge(e4, n2), n2 === `story-viewer`) {
      Ve(e4);
      let t3 = Ye(e4);
      t3 && He(t3);
    }
  }
  function qe(e4) {
    e4.removeAttribute(a), e4.controls = false, e4.style.removeProperty(`position`), e4.style.removeProperty(`top`), e4.style.removeProperty(`left`), e4.style.removeProperty(`width`), e4.style.removeProperty(`height`), e4.style.removeProperty(`z-index`), e4.style.removeProperty(`pointer-events`), e4.style.removeProperty(`object-fit`), e4.style.removeProperty(`display`), e4.style.removeProperty(`max-width`), e4.style.removeProperty(`max-height`), e4.style.removeProperty(`padding-bottom`), e4.style.removeProperty(`box-sizing`), e4.style.removeProperty(`overflow`), e4.removeAttribute(D), document.getElementById(be)?.remove();
  }
  function O2(t2) {
    if (!t2.hasAttribute(`data-reels-scrubber-style-touched`)) {
      let n2 = t2.getAttribute(`style`);
      n2 === null ? t2.removeAttribute(o) : t2.setAttribute(o, n2), t2.setAttribute(s, `true`);
    }
  }
  function Je(t2) {
    let n2 = t2.closest(`[style*="--x-height"]`) ?? t2.closest(`article`) ?? t2.parentElement;
    n2 && n2.querySelectorAll(`[${s}]`).forEach((t3) => {
      let n3 = t3.getAttribute(o);
      n3 === null ? t3.removeAttribute(`style`) : t3.setAttribute(`style`, n3), t3.removeAttribute(o), t3.removeAttribute(s);
    });
  }
  function Ye(e4) {
    let t2 = e4.closest(`[data-instancekey]`);
    if (t2?.parentElement instanceof HTMLElement) return t2.parentElement;
    let n2 = e4.parentElement;
    for (; n2 && n2.tagName !== `BODY`; ) {
      if (n2.querySelector(`[data-instancekey]`) && n2.querySelector(`[aria-label="Toggle audio"], [aria-label="Adjust volume"], [aria-label="Audio is muted"], [aria-label="Audio is playing"]`) || n2.tagName === `SECTION` || n2.tagName === `ARTICLE`) return n2;
      n2 = n2.parentElement;
    }
    return e4.closest(`[style*="position: absolute"]`) ?? e4.parentElement;
  }
  function Xe(e4, t2) {
    if (t2 === false && navigator.userActivation && !navigator.userActivation.hasBeenActive) t2 = true;
    if (e4.muted === t2) return;
    let n2 = window;
    n2.__REELS_SCRUBBER_APPLYING_MUTE__ || (n2.__REELS_SCRUBBER_APPLYING_MUTE__ = true, e4.defaultMuted = t2, e4.muted = t2, queueMicrotask(() => {
      n2.__REELS_SCRUBBER_APPLYING_MUTE__ = false;
    }));
  }
  function Ze(e4) {
    let t2 = e4.querySelector(`[aria-label="Audio is muted"], [aria-label="Audio is playing"]`);
    if (!t2) return null;
    let n2 = t2.getAttribute(`aria-label`) ?? ``;
    return /muted/i.test(n2);
  }
  var Qe = /* @__PURE__ */ new WeakMap();
  function $e(e4, t2) {
    if (t2) e4.volume > 0 && Qe.set(e4, e4.volume), e4.volume !== 0 && (e4.volume = 0);
    else {
      let t3 = Qe.get(e4) ?? 1;
      Qe.delete(e4), e4.volume !== t3 && (e4.volume = t3);
    }
  }
  function k2(e4, t2) {
    if (e4.hasAttribute(Ce) || window.__REELS_SCRUBBER_APPLYING_MUTE__) return;
    let n2 = Ye(e4);
    if (!n2) {
      Xe(e4, t2);
      return;
    }
    let r3 = n2.querySelector(`[aria-label="Toggle audio"], [aria-label="Audio is muted"], [aria-label="Audio is playing"]`), i3 = r3 ? r3.closest(`[role="button"]`) ?? r3.closest(`button`) ?? r3 : null, a2 = Ze(n2);
    if (a2 === null || !i3) {
      Xe(e4, t2);
      return;
    }
    if (a2 !== t2) {
      if (t2 === false && navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
      e4.setAttribute(Ce, `true`), i3.click(), $e(e4, t2), queueMicrotask(() => {
        e4.removeAttribute(Ce);
      });
      return;
    }
    Xe(e4, t2);
  }
  function et(e4, t2) {
    let n2 = window.__REELS_SCRUBBER_FEED_MUTED__ ?? true;
    if (t2 === `story-viewer`) {
      k2(e4, n2);
      return;
    }
    Xe(e4, n2);
  }
  function tt() {
    if (document.getElementById(be)) return;
    let e4 = document.createElement(`style`);
    e4.id = be, e4.textContent = `
    video[${a}][${D}]::-webkit-media-controls-enclosure {
      transform: translateY(-${ye}px);
      background: transparent !important;
    }
    video[${a}][${D}]::-webkit-media-controls-panel {
      background: transparent !important;
    }
  `, document.head.appendChild(e4);
  }
  function nt(e4, t2) {
    tt(), t2 ? e4.removeAttribute(D) : e4.setAttribute(D, `true`), e4.style.setProperty(`object-fit`, t2 ? `contain` : `cover`, `important`), e4.style.setProperty(`display`, `block`, `important`), e4.style.setProperty(`pointer-events`, `auto`, `important`), e4.style.removeProperty(`padding-bottom`), e4.style.removeProperty(`box-sizing`), e4.style.removeProperty(`width`), e4.style.removeProperty(`height`), e4.style.removeProperty(`position`), e4.style.removeProperty(`top`), e4.style.removeProperty(`left`), t2 ? e4.style.removeProperty(`z-index`) : e4.style.setProperty(`z-index`, String(xe), `important`);
  }
  function rt(e4, t2) {
    let n2 = Le(e4);
    if (t2 === `story-viewer`) {
      e4.removeAttribute(D), nt(e4, n2);
      return;
    }
    e4.removeAttribute(D), e4.style.setProperty(`position`, `relative`), e4.style.removeProperty(`top`), e4.style.removeProperty(`left`), e4.style.setProperty(`width`, `100%`), e4.style.setProperty(`height`, `100%`), e4.style.setProperty(`pointer-events`, `auto`, `important`), e4.style.setProperty(`display`, `block`), e4.style.removeProperty(`padding-bottom`), e4.style.removeProperty(`box-sizing`);
    let r3 = t2 === `feed-inline` || t2 === `feed-carousel`;
    e4.style.setProperty(`object-fit`, !n2 && r3 ? `cover` : `contain`, `important`), n2 ? e4.style.removeProperty(`z-index`) : e4.style.setProperty(`z-index`, String(we), `important`);
  }
  var it = /* @__PURE__ */ new WeakMap();
  function at(e4) {
    if (it.has(e4)) return;
    let t2 = e4.closest(`a[href]`);
    if (!t2) return;
    let n2 = (e5) => e5.preventDefault(), r3 = (n3) => {
      let r4 = n3.target;
      if (!(r4 instanceof Node) || r4 !== e4 && !e4.contains(r4)) return;
      n3.preventDefault();
      let i3 = t2.querySelector(`[data-interactable*="|click|"]`);
      if (i3) {
        i3.click();
        return;
      }
      setTimeout(() => {
        let e5 = (t2.closest(`article`) ?? t2).querySelector(`[data-interactable*="|click|"]`);
        e5 && e5.click();
      }, 200);
    };
    t2.addEventListener(`dragstart`, n2), t2.addEventListener(`click`, r3), it.set(e4, { link: t2, dragListener: n2, clickListener: r3 });
  }
  function ot(e4) {
    let t2 = it.get(e4);
    t2 && (t2.link.removeEventListener(`dragstart`, t2.dragListener), t2.link.removeEventListener(`click`, t2.clickListener), it.delete(e4));
  }
  var st = class {
    stateMachine = new _e();
    patch(e4) {
      if (e4.hasAttribute(`data-reels-scrubber-active`)) {
        let t3 = Me(e4);
        return t3 ? (Ke(e4, t3), this.stateMachine.markPatched(e4)) : this.stateMachine.markSkipped(e4, `already_patched`);
      }
      let t2 = me(e4);
      this.stateMachine.markPatching(e4, t2);
      try {
        let t3 = Me(e4);
        if (!t3) return this.stateMachine.markFailed(e4, `container_not_found`);
        Fe(t3);
        let n2 = je(e4);
        if (e4.controls = true, (n2 === `feed-inline` || n2 === `feed-carousel`) && at(e4), et(e4, n2), Ne(e4, `remove`, n2), Pe(t3, n2), He(t3), Ue(t3, n2), rt(e4, n2), Ge(e4, n2), t3.style.setProperty(`pointer-events`, `auto`, `important`), Ie(e4)) throw Error(`Video size is invalid after patch`);
        if (n2 === `story-viewer`) {
          Ve(e4);
          let t4 = Ye(e4);
          t4 && He(t4);
        }
        return e4.setAttribute(a, `true`), C(`info`, `Video patched`), this.stateMachine.markPatched(e4);
      } catch (t3) {
        let n2 = t3 instanceof Error ? t3.message : `Unknown error`;
        return this.stateMachine.markFailed(e4, `dom_error`, n2), this.rollback(e4);
      }
    }
    rollback(e4) {
      let t2 = this.stateMachine.get(e4).snapshot;
      if (!t2) return ot(e4), Je(e4), qe(e4), C(`warn`, `Patch force-reset without snapshot`), this.stateMachine.markRolledBack(e4);
      this.stateMachine.markRollbackInProgress(e4);
      try {
        return ot(e4), Je(e4), he(e4, t2), e4.removeAttribute(a), C(`warn`, `Patch rolled back`), this.stateMachine.markRolledBack(e4);
      } catch (t3) {
        let n2 = t3 instanceof Error ? t3.message : `Unknown error`;
        return this.stateMachine.markFailed(e4, `unknown`, n2);
      }
    }
    getState(e4) {
      return this.stateMachine.get(e4);
    }
  };
  function ct() {
    return new st();
  }
  var lt = `data:image/png;base64,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`;
  var ut = `reels-scrubber-toast-stack`;
  var dt = 1440 * 60 * 1e3;
  function A2() {
    let e4 = document.getElementById(ut);
    return e4 || (e4 = document.createElement(`div`), e4.id = ut, document.body.appendChild(e4)), e4;
  }
  function ft() {
    try {
      let e4 = parseInt(localStorage.getItem(`reels_scrubber_last_card_at`) ?? `0`, 10) || 0;
      return Date.now() - e4 < dt;
    } catch {
      return false;
    }
  }
  function pt() {
    try {
      localStorage.setItem(L, String(Date.now()));
    } catch {
    }
  }
  var mt = 1080 * 60 * 60 * 1e3;
  var ht = `reels-scrubber-support-widget`;
  function j() {
    try {
      return parseInt(localStorage.getItem(`reels_scrubber_patched_count`) ?? `0`, 10) || 0;
    } catch {
      return 0;
    }
  }
  function gt() {
    try {
      let e4 = j() + 1;
      localStorage.setItem(c, String(e4));
    } catch {
    }
  }
  function _t() {
    if (document.getElementById(ht) || ft()) return;
    let e4 = (() => {
      try {
        let e5 = localStorage.getItem(f);
        if (e5 !== null) {
          let t4 = parseInt(e5, 10) || 0;
          if (e5 === `true` && (t4 = Date.now(), localStorage.setItem(f, String(t4))), Date.now() - t4 < mt) return null;
        }
        let t3 = j();
        if (t3 < 100) return null;
        let n3 = Math.floor(t3 / 100) * 100;
        return n3 <= (parseInt(localStorage.getItem(`reels_scrubber_support_snoozed_milestone`) ?? `0`, 10) || 0) ? null : { patchedCount: t3, currentMilestone: n3 };
      } catch {
        return null;
      }
    })();
    if (!e4) return;
    let { patchedCount: t2, currentMilestone: n2 } = e4, r3 = document.createElement(`div`);
    r3.id = ht;
    let i3 = document.createElement(`div`);
    i3.className = `rs-top-row`;
    let s3 = document.createElement(`div`);
    s3.className = `rs-label-wrap`;
    let c2 = document.createElement(`span`);
    c2.className = `rs-headline`, c2.textContent = `\u{1F389} Reels Scrubber patched ${t2} videos for you!`;
    let l2 = document.createElement(`span`);
    l2.className = `rs-sub`, l2.textContent = `Instagram changes things constantly. Reels Scrubber is built and maintained solo. If it's been useful to you, a coffee goes a long way toward keeping it alive and improving it.`, s3.append(c2, l2);
    let u2 = document.createElement(`button`);
    u2.className = `rs-dismiss`, u2.textContent = `\u2715`, u2.setAttribute(`aria-label`, `Dismiss`), i3.append(s3, u2);
    let d2 = document.createElement(`a`);
    d2.className = `rs-kofi-btn`, d2.href = i2, d2.target = `_blank`, d2.rel = `noopener noreferrer`;
    let f2 = document.createElement(`img`);
    f2.className = `rs-kofi-cup`, f2.src = lt, f2.alt = ``;
    let p2 = document.createElement(`span`);
    p2.className = `rs-kofi-text`, p2.textContent = `Buy me a coffee`;
    let m = document.createElement(`span`);
    m.className = `rs-kofi-face`, m.append(f2, p2), d2.append(m);
    let h2 = document.createElement(`a`);
    h2.className = `rs-already-donated`, h2.textContent = `Already donated \u{1F9E1}`, h2.href = `#`;
    function ee() {
      r3.classList.remove(`rs-visible`), setTimeout(() => r3.remove(), 350);
    }
    function g2() {
      try {
        localStorage.setItem(p, String(n2));
      } catch {
      }
    }
    function _2() {
      try {
        localStorage.setItem(f, String(Date.now()));
      } catch {
      }
    }
    u2.onclick = () => {
      ee(), g2();
    }, d2.onclick = () => {
      g2();
    }, h2.onclick = (e5) => {
      e5.preventDefault(), ee(), _2();
    }, r3.append(i3, d2, h2), A2().appendChild(r3), pt(), requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        r3.classList.add(`rs-visible`);
      });
    });
  }
  var M2 = null;
  function vt() {
    try {
      let e4 = localStorage.getItem(O);
      if (e4 === null) return null;
      let t2 = parseInt(e4, 10);
      return Number.isNaN(t2) ? null : t2;
    } catch {
      return null;
    }
  }
  function yt() {
    if (M2 !== null) return M2;
    let e4 = vt();
    if (e4 !== null) return M2 = e4, e4;
    let t2 = j();
    M2 = t2;
    try {
      localStorage.setItem(O, String(t2));
    } catch {
    }
    return t2;
  }
  function bt() {
    let e4 = yt() + 50 - j();
    return Math.min(50, Math.max(0, e4));
  }
  function xt() {
    return bt() > 0;
  }
  var St = false;
  function Ct() {
    if (St) return true;
    try {
      return St = localStorage.getItem(k) === `true`, St;
    } catch {
      return true;
    }
  }
  function wt() {
    St = true;
    try {
      localStorage.setItem(k, `true`);
    } catch {
    }
  }
  var N2 = false;
  function Tt() {
    if (N2) return true;
    try {
      return N2 = localStorage.getItem(N) === `true`, N2;
    } catch {
      return false;
    }
  }
  function Et() {
    if (!N2) {
      N2 = true;
      try {
        localStorage.setItem(N, `true`);
      } catch {
      }
    }
  }
  var Dt = false;
  function Ot() {
    if (Dt) return true;
    try {
      return Dt = localStorage.getItem(A) === `true`, Dt;
    } catch {
      return true;
    }
  }
  function kt() {
    Dt = true;
    try {
      localStorage.setItem(A, `true`);
    } catch {
    }
  }
  var At = false;
  function jt() {
    if (At) return true;
    try {
      return At = localStorage.getItem(M) === `true`, At;
    } catch {
      return true;
    }
  }
  function Mt() {
    At = true;
    try {
      localStorage.setItem(M, `true`);
    } catch {
    }
  }
  var Nt = null;
  function Pt() {
    let e4 = bt();
    e4 !== Nt && (Nt = e4, window.postMessage({ type: `__REELS_SCRUBBER_PREVIEW_STATE__`, payload: { remaining: e4, limit: 50, exhausted: e4 === 0, updatedAt: Date.now() } }, window.location.origin));
  }
  var Ft = `data:image/png;base64,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`;
  var It = `reels-scrubber-pro-announce`;
  var Lt = `We wanted you to feel Pro before asking \u2014 everything you already use stays free, forever. If it's not for you, no problem.`;
  var Rt = [{ icon: `\u{1F50A}`, label: `Volume level memory` }, { icon: `\u26A1`, label: `Playback speed memory` }, { icon: `\u2328\uFE0F`, label: `Keyboard shortcuts`, keys: [{ combo: `A`, action: `Back 5 seconds` }, { combo: `S`, action: `Play / Pause` }, { combo: `D`, action: `Forward 5 seconds` }, { combo: `M`, action: `Mute / Unmute` }, { combo: `F`, action: `Fullscreen` }] }, { icon: `\u23ED\uFE0F`, label: `Auto-scroll Reels` }, { icon: `\u{1F501}`, label: `Loop sections`, keys: [{ combo: `[`, action: `Set loop start` }, { combo: `]`, action: `Set loop end` }, { combo: `\\`, action: `Clear loop (or click \u2715 on the bar)` }] }, { icon: `\u2728`, label: `And more coming soon` }];
  var zt = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M2.5 1.5 5.5 4 2.5 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  function Bt() {
    let e4 = document.createElement(`ul`);
    return e4.className = `rs-pro-list`, Rt.forEach(({ icon: t2, label: n2, keys: r3 }) => {
      let i3 = document.createElement(`li`), a2 = document.createElement(`div`);
      a2.className = `rs-pro-item-head`;
      let o2 = document.createElement(`span`);
      o2.className = `rs-pro-item-icon`, o2.textContent = t2;
      let s3 = document.createElement(`span`);
      if (s3.className = `rs-pro-item-label`, s3.textContent = n2, a2.append(o2, s3), i3.appendChild(a2), r3) {
        i3.classList.add(`rs-pro-item-expandable`);
        let e5 = document.createElement(`span`);
        e5.className = `rs-pro-chevron`, e5.innerHTML = zt;
        let t3 = document.createElement(`ul`);
        t3.className = `rs-pro-item-keys`, r3.forEach(({ combo: e6, action: n3 }) => {
          let r4 = document.createElement(`li`), i4 = document.createElement(`kbd`);
          i4.textContent = e6;
          let a3 = document.createElement(`span`);
          a3.textContent = n3, r4.append(i4, a3), t3.appendChild(r4);
        }), a2.appendChild(e5), i3.appendChild(t3), a2.onclick = () => {
          let n3 = t3.classList.toggle(`rs-expanded`);
          e5.classList.toggle(`rs-open`, n3);
        };
      }
      e4.appendChild(i3);
    }), e4;
  }
  var Vt = `M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z`;
  function P2(e4) {
    let t2 = window[E];
    return typeof t2 != `string` || t2 === `` ? e4 : `${e4}${e4.includes(`?`) ? `&` : `?`}client_reference_id=${encodeURIComponent(t2)}`;
  }
  var Ht = 7200 * 60 * 1e3;
  function Ut() {
    let e4 = window.__IG_REELS_SCRUBBER_FLAGS__;
    return { ...e3, ...e4 ?? {} }.enableProAnnounce;
  }
  function Wt() {
    if (document.getElementById(It) || !Ut() || j() < 50 || ft()) return false;
    let e4 = 0;
    try {
      if (localStorage.getItem(`reels_scrubber_pro_announce_dismissed`) === `true`) return false;
      let t3 = parseInt(localStorage.getItem(`reels_scrubber_pro_announce_snoozed_at`) ?? `0`, 10) || 0;
      if (Date.now() - t3 < Ht || (e4 = (parseInt(localStorage.getItem(`reels_scrubber_pro_announce_impressions`) ?? `0`, 10) || 0) + 1, e4 > 3)) return false;
      localStorage.setItem(F, String(e4));
    } catch {
      return false;
    }
    pt(), r2({ event: `pro_announce`, action: `impression`, impression: e4 });
    let t2 = document.createElement(`div`);
    t2.id = It, t2.className = `rs-pro-card`;
    let r3 = document.createElement(`div`);
    r3.className = `rs-pro-top-row`;
    let i3 = document.createElement(`div`);
    i3.className = `rs-pro-label-wrap`;
    let a2 = document.createElement(`span`);
    a2.className = `rs-pro-headline`, a2.textContent = `\u2728 Enjoyed the Pro preview?`;
    let o2 = document.createElement(`button`);
    o2.className = `rs-pro-sub-toggle`, o2.type = `button`, o2.setAttribute(`aria-expanded`, `false`);
    let s3 = document.createElement(`span`);
    s3.className = `rs-pro-sub`, s3.textContent = `Everything you tried`;
    let l2 = document.createElement(`span`);
    l2.className = `rs-pro-chevron`, l2.innerHTML = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M2.5 1.5 5.5 4 2.5 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`, o2.append(s3, l2), i3.append(a2, o2);
    let u2 = document.createElement(`button`);
    u2.className = `rs-pro-dismiss`, u2.textContent = `\u2715`, u2.setAttribute(`aria-label`, `Dismiss`), r3.append(i3, u2);
    let f2 = Bt();
    o2.onclick = () => {
      let e5 = f2.classList.toggle(`rs-expanded`);
      l2.classList.toggle(`rs-open`, e5), o2.setAttribute(`aria-expanded`, String(e5));
    };
    let p2 = e4 >= 3, m = document.createElement(`span`);
    m.className = `rs-pro-free-note`, m.textContent = p2 ? `${Lt} This is our last ask \u2014 we won't show this card again.` : Lt;
    let h2 = document.createElement(`a`);
    h2.className = `rs-pro-cta`, h2.href = P2(i2), h2.target = `_blank`, h2.rel = `noopener noreferrer`, h2.innerHTML = `<span class="rs-pro-cta-face"><img class="rs-pro-cta-icon" src="${Ft}" alt=""><span>Keep Pro \u2014 ${g}/mo</span>${[1, 2, 3, 4, 5, 6].map((e5) => `<div class="rs-star-${e5}" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53"><path class="rs-fil0" d="${Vt}"/></svg></div>`).join(``)}</span>`;
    let g2 = document.createElement(`a`);
    g2.className = `rs-pro-yearly`, g2.textContent = `Yearly ${_} \u2014 ${y}`, g2.href = P2(s2), g2.target = `_blank`, g2.rel = `noopener noreferrer`;
    let _2 = document.createElement(`a`);
    _2.className = `rs-pro-later`, _2.textContent = p2 ? `No thanks` : `Maybe later`, _2.href = `#`;
    function v() {
      t2.classList.remove(`rs-visible`), setTimeout(() => t2.remove(), 350);
    }
    function y2() {
      try {
        localStorage.setItem(P, `true`);
      } catch {
      }
    }
    function te() {
      try {
        localStorage.setItem(I, String(Date.now()));
      } catch {
      }
    }
    function b(t3) {
      r2({ event: `pro_announce`, action: t3, impression: e4 });
    }
    return u2.onclick = () => {
      v(), y2(), b(`dismiss`);
    }, h2.onclick = () => {
      y2(), b(`cta_click`);
    }, g2.onclick = () => {
      y2(), b(`yearly_click`);
    }, _2.onclick = (e5) => {
      e5.preventDefault(), v(), te(), b(`later`);
    }, t2.append(r3, f2, m, h2, g2, _2), A2().prepend(t2), requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        t2.classList.add(`rs-visible`);
      });
    }), true;
  }
  var Gt = `reels-scrubber-pro-preview-notice`;
  var F2 = `reels-scrubber-pro-preview-welcome`;
  function Kt() {
    if (document.getElementById(Gt) || !Ut() || Ct()) return;
    document.getElementById(F2)?.remove(), wt(), pt(), r2({ event: `pro_preview`, action: `exhausted` });
    let e4 = document.createElement(`div`);
    e4.id = Gt, e4.className = `rs-pro-card`;
    let t2 = document.createElement(`div`);
    t2.className = `rs-pro-top-row`;
    let r3 = document.createElement(`div`);
    r3.className = `rs-pro-label-wrap`;
    let i3 = document.createElement(`span`);
    i3.className = `rs-pro-headline`, i3.textContent = `\u2728 Your free Pro preview has ended`;
    let a2 = document.createElement(`span`);
    a2.className = `rs-pro-sub`, a2.textContent = `That was 50 videos with keyboard shortcuts, speed & volume memory, auto-scroll, and loops.`, r3.append(i3, a2);
    let o2 = document.createElement(`button`);
    o2.className = `rs-pro-dismiss`, o2.textContent = `\u2715`, o2.setAttribute(`aria-label`, `Dismiss`), t2.append(r3, o2);
    let s3 = document.createElement(`span`);
    s3.className = `rs-pro-free-note`, s3.textContent = Lt;
    let l2 = document.createElement(`a`);
    l2.className = `rs-pro-cta`, l2.href = P2(i2), l2.target = `_blank`, l2.rel = `noopener noreferrer`, l2.innerHTML = `<span class="rs-pro-cta-face"><img class="rs-pro-cta-icon" src="${Ft}" alt=""><span>Keep Pro \u2014 ${g}/mo</span>${[1, 2, 3, 4, 5, 6].map((e5) => `<div class="rs-star-${e5}" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53"><path class="rs-fil0" d="${Vt}"/></svg></div>`).join(``)}</span>`;
    let u2 = document.createElement(`a`);
    u2.className = `rs-pro-yearly`, u2.textContent = `Yearly ${_} \u2014 ${y}`, u2.href = P2(s2), u2.target = `_blank`, u2.rel = `noopener noreferrer`;
    function d2() {
      e4.classList.remove(`rs-visible`), setTimeout(() => e4.remove(), 350);
    }
    o2.onclick = () => {
      d2();
    }, l2.onclick = () => {
      r2({ event: `pro_preview`, action: `cta_click` });
    }, u2.onclick = () => {
      r2({ event: `pro_preview`, action: `yearly_click` });
    }, e4.append(t2, s3, l2, u2), A2().prepend(e4), requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        e4.classList.add(`rs-visible`);
      });
    });
  }
  var qt = false;
  function Jt() {
    qt || document.getElementById(F2) || Ut() && (Ot() || (qt = true, window.setTimeout(() => {
      if (qt = false, document.getElementById(F2)) return;
      kt(), pt(), r2({ event: `pro_preview`, action: `welcome` });
      let e4 = document.createElement(`div`);
      e4.id = F2, e4.className = `rs-pro-card`;
      let t2 = document.createElement(`div`);
      t2.className = `rs-pro-top-row`;
      let n2 = document.createElement(`div`);
      n2.className = `rs-pro-label-wrap`;
      let r3 = document.createElement(`span`);
      r3.className = `rs-pro-headline`, r3.textContent = `\u{1F381} Pro is on us for your next\xA050\xA0videos`;
      let i3 = document.createElement(`button`);
      i3.className = `rs-pro-sub-toggle`, i3.type = `button`, i3.setAttribute(`aria-expanded`, `false`);
      let a2 = document.createElement(`span`);
      a2.className = `rs-pro-sub`, a2.textContent = `See what you can do`;
      let o2 = document.createElement(`span`);
      o2.className = `rs-pro-chevron`, o2.innerHTML = zt, i3.append(a2, o2), n2.append(r3, i3);
      let s3 = document.createElement(`button`);
      s3.className = `rs-pro-dismiss`, s3.textContent = `\u2715`, s3.setAttribute(`aria-label`, `Dismiss`), t2.append(n2, s3);
      let c2 = Bt();
      i3.onclick = () => {
        let e5 = c2.classList.toggle(`rs-expanded`);
        o2.classList.toggle(`rs-open`, e5), i3.setAttribute(`aria-expanded`, String(e5));
      };
      let l2 = document.createElement(`span`);
      l2.className = `rs-pro-free-note`, l2.textContent = `No card, no signup \u2014 and when the preview ends, everything you already use (core features) stays free, forever.`;
      let u2 = document.createElement(`a`);
      u2.className = `rs-pro-later`, u2.textContent = `Got it`, u2.href = `#`;
      function d2() {
        e4.classList.remove(`rs-visible`), setTimeout(() => e4.remove(), 350);
      }
      s3.onclick = () => {
        d2();
      }, u2.onclick = (e5) => {
        e5.preventDefault(), d2();
      }, e4.append(t2, c2, l2, u2), A2().prepend(e4), requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          e4.classList.add(`rs-visible`);
        });
      });
    }, 1500)));
  }
  var Yt = [0, 90, 260, 700];
  var Xt = 1800;
  var Zt = 1800 * 1e3;
  function Qt() {
    try {
      let e4 = parseInt(window.localStorage.getItem(`reels_scrubber_last_failure_report_at`) ?? `0`, 10) || 0;
      return Date.now() - e4 < Zt;
    } catch {
      return false;
    }
  }
  function $t() {
    try {
      window.localStorage.setItem(h, String(Date.now()));
    } catch {
    }
  }
  var I2 = null;
  var L2 = false;
  var en = [];
  var tn = null;
  var R = false;
  var z = true;
  var B = null;
  var V = false;
  var nn = false;
  var H = {};
  var U = null;
  var W = null;
  var G = null;
  var K = null;
  var q = /* @__PURE__ */ new WeakSet();
  var J = /* @__PURE__ */ new WeakSet();
  var rn = /* @__PURE__ */ new WeakMap();
  var an = /* @__PURE__ */ new WeakMap();
  var on = null;
  var sn = false;
  var cn = 0;
  var ln = /* @__PURE__ */ new Set();
  var Y = ct();
  function un() {
    V = nn || xt();
  }
  function dn() {
    let e4 = window;
    nn = e4[w] === true, nn && Et(), yt(), un();
    let t2 = e4[T];
    H = typeof t2 == `object` && t2 ? t2 : {};
  }
  function fn() {
    try {
      let e4 = window.localStorage.getItem(u);
      if (e4 !== null) {
        let t2 = parseFloat(e4);
        if (!isNaN(t2) && t2 >= 0.25 && t2 <= 4) return t2;
      }
    } catch {
    }
    return 1;
  }
  function pn(e4) {
    if (!(e4 < 0.25 || e4 > 4)) try {
      window.localStorage.setItem(u, String(e4));
    } catch {
    }
  }
  function mn(e4) {
    return !(e4.readyState < 3 || e4.currentTime < 1 || Date.now() - cn < 1e3);
  }
  function hn(e4, t2) {
    q.add(e4), e4.playbackRate = t2, queueMicrotask(() => q.delete(e4));
  }
  function gn() {
    try {
      let e4 = window.localStorage.getItem(d);
      if (e4 !== null) {
        let t2 = parseFloat(e4);
        if (!isNaN(t2) && t2 > 0 && t2 <= 1) return t2;
      }
    } catch {
    }
    return null;
  }
  function _n(e4) {
    if (!(e4 <= 0 || e4 > 1)) try {
      window.localStorage.setItem(d, String(e4));
    } catch {
    }
  }
  function vn(e4, t2) {
    J.add(e4), sn = true, e4.volume = t2, sn = false, rn.set(e4, t2), queueMicrotask(() => J.delete(e4));
  }
  function yn() {
    if (on) return;
    let e4 = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, `volume`);
    !e4 || !e4.configurable || !e4.get || !e4.set || (on = e4, Object.defineProperty(HTMLMediaElement.prototype, `volume`, { get() {
      return e4.get.call(this);
    }, set(t2) {
      if (!sn && V && H.volume !== false && this instanceof HTMLVideoElement && this.hasAttribute(`data-reels-scrubber-active`)) {
        if (gn() !== null) return;
        an.set(this, t2);
      }
      e4.set.call(this, t2);
    }, configurable: true }), C(`info`, `Volume prototype lock enabled`));
  }
  function bn(e4) {
    if (!(e4 instanceof HTMLElement)) return false;
    let t2 = e4.tagName;
    return t2 === `INPUT` || t2 === `TEXTAREA` || e4.isContentEditable;
  }
  function xn() {
    let e4 = Array.from(document.querySelectorAll(`video[${a}]`));
    return e4.length === 0 ? null : Xn(e4) ?? e4[0];
  }
  function X() {
    U = null, W = null, G = null, wn();
  }
  var Sn = 80;
  function Cn() {
    if (document.getElementById(`reels-scrubber-loop-style`)) return;
    let e4 = document.createElement(`style`);
    e4.id = `reels-scrubber-loop-style`, e4.textContent = `[data-reels-scrubber-loop-markers]{opacity:0;pointer-events:none;transition:opacity .15s ease;}*:hover>[data-reels-scrubber-loop-markers]{opacity:1;pointer-events:auto;}`, document.head.appendChild(e4);
  }
  function wn() {
    let e4 = G?.deref() ?? null, t2 = U !== null || W !== null;
    if (!e4 || !e4.isConnected || !t2 || !e4.duration) {
      K?.remove(), K = null;
      return;
    }
    let n2 = e4.parentElement;
    if (!n2) return;
    K || (Cn(), K = document.createElement(`div`), K.setAttribute(`data-reels-scrubber-loop-markers`, `true`), K.title = `Loop section \u2014 click to clear`, K.style.cssText = `position:absolute;height:14px;z-index:2147483647;cursor:pointer;`, K.addEventListener(`click`, (e5) => {
      e5.stopPropagation(), e5.preventDefault(), X();
    }));
    let r3 = n2.getBoundingClientRect(), i3 = e4.getBoundingClientRect();
    K.style.left = `${i3.left - r3.left}px`, K.style.width = `${i3.width}px`, K.style.top = `${i3.bottom - r3.top - Sn}px`;
    let a2 = (t3) => Math.min(100, Math.max(0, t3 / e4.duration * 100)), o2 = (e5) => `<div style="position:absolute;top:0;height:14px;width:4px;border-radius:2px;background:#ff5d22;left:calc(${e5}% - 2px);box-shadow:0 0 0 1.5px rgba(255,255,255,0.9),0 1px 5px rgba(0,0,0,0.6);"></div>`, s3 = U === null ? null : a2(U), c2 = W === null ? null : a2(W), l2 = [];
    s3 !== null && c2 !== null && l2.push(`<div style="position:absolute;top:4px;height:6px;border-radius:3px;left:${s3}%;width:${c2 - s3}%;background:rgba(255,93,34,0.95);box-shadow:0 0 0 1px rgba(255,255,255,0.55),0 1px 4px rgba(0,0,0,0.45);"></div>`), s3 !== null && l2.push(o2(s3)), c2 !== null && l2.push(o2(c2));
    let u2 = Math.min(Math.max(s3 ?? 0, c2 ?? 0), 93);
    l2.push(`<div style="position:absolute;top:-3px;left:calc(${u2}% + 10px);width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.75);color:#fff;font-size:11px;line-height:20px;text-align:center;box-shadow:0 0 4px rgba(0,0,0,0.5);">\u2715</div>`), K.innerHTML = l2.join(``), K.parentElement !== n2 && n2.appendChild(K);
  }
  function Tn() {
    try {
      let e4 = window.localStorage.getItem(l);
      if (e4 === `true`) return true;
      if (e4 === `false`) return false;
    } catch {
    }
    try {
      let e4 = window.sessionStorage.getItem(l);
      if (e4 === `true`) return true;
      if (e4 === `false`) return false;
    } catch {
    }
    return true;
  }
  function En() {
    let e4 = window.__REELS_SCRUBBER_FEED_MUTED__;
    return typeof e4 == `boolean` ? e4 : z;
  }
  function Dn(e4) {
    let t2 = En();
    if (e4.muted === t2) return;
    let n2 = window;
    n2.__REELS_SCRUBBER_APPLYING_MUTE__ = true, e4.defaultMuted = t2, e4.muted = t2, queueMicrotask(() => {
      n2.__REELS_SCRUBBER_APPLYING_MUTE__ = false;
    });
  }
  function On(e4) {
    z = e4, window.__REELS_SCRUBBER_FEED_MUTED__ = z;
    try {
      window.localStorage.setItem(l, String(z));
    } catch {
    }
    try {
      window.sessionStorage.setItem(l, String(z));
    } catch {
    }
  }
  function Z(e4) {
    return E2(location.pathname) ? `story-viewer` : T2(location.pathname) ? `reel-viewer` : e4.closest(`li[style*="translateX("]`) ? `feed-carousel` : e4.closest(`article`) ? `feed-inline` : `unknown`;
  }
  function kn() {
    let e4 = window;
    return { ...e3, ...e4.__IG_REELS_SCRUBBER_FLAGS__ ?? {} };
  }
  function An() {
    if (!kn().enableAudioLock || L2) return;
    let e4 = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, `muted`);
    !e4 || !e4.configurable || !e4.get || !e4.set || (tn = e4, Object.defineProperty(HTMLMediaElement.prototype, `muted`, { get() {
      return e4.get.call(this);
    }, set(t2) {
      if (t2 === false && navigator.userActivation && !navigator.userActivation.hasBeenActive) t2 = true;
      let n2 = window.__REELS_SCRUBBER_FEED_MUTED__;
      typeof n2 == `boolean` && t2 !== n2 || e4.set.call(this, t2);
    }, configurable: true }), L2 = true, C(`info`, `Audio prototype lock enabled`));
  }
  function jn() {
    !L2 || !tn || (Object.defineProperty(HTMLMediaElement.prototype, `muted`, tn), L2 = false, C(`info`, `Audio prototype lock disabled`));
  }
  function Mn() {
    try {
      window.localStorage.removeItem(u), window.localStorage.removeItem(d);
    } catch {
    }
    document.querySelectorAll(`video[${a}]`).forEach((e4) => {
      e4.playbackRate !== 1 && (e4.playbackRate = 1);
    });
  }
  function Nn() {
    if (!R) return;
    un(), Pt(), Tt() || (V ? nn || Jt() : (jt() || (Mn(), Mt()), Kt()));
    let e4 = Yn(Array.from(document.querySelectorAll(`video`)));
    e4.length !== 0 && (e4.forEach((e5) => {
      let t2 = Y.getState(e5).state !== `patched`, n2 = performance.now(), r3 = Y.patch(e5), i3 = Math.round(performance.now() - n2), a2 = Z(e5);
      if (t2 && r3.state === `patched`) {
        if (V && H.speed !== false && hn(e5, fn()), V && H.volume !== false) {
          let t3 = gn();
          t3 === null ? rn.set(e5, e5.volume) : vn(e5, t3);
        }
        gt();
      } else if (t2 && r3.state === `failed`) {
        let e6 = `${a2}:failure`;
        !ln.has(e6) && !Qt() && (ln.add(e6), $t(), r2({ event: `patch_result`, context: a2, result: `failure`, reason: r3.reason, latencyMs: i3 }));
      }
    }), Jn(e4));
  }
  function Pn() {
    en.forEach((e4) => {
      window.clearTimeout(e4);
    }), en = [];
  }
  function Fn(e4) {
    return e4 === `/` ? [...Yt, Xt] : Yt;
  }
  function In() {
    Pn(), performance.now(), Fn(location.pathname).forEach((e4) => {
      let t2 = window.setTimeout(() => {
        de(location.pathname) && (Nn(), qn());
      }, e4);
      en.push(t2);
    });
  }
  function Ln() {
    I2 || (I2 = new MutationObserver(() => {
      Nn(), qn();
    }), I2.observe(document.documentElement, { childList: true, subtree: true }));
  }
  function Rn() {
    I2 &&= (I2.disconnect(), null);
  }
  function Q() {
    let e4 = window;
    if (!R) {
      Pn(), Gn(), Rn(), jn(), delete e4.__REELS_SCRUBBER_FEED_MUTED__;
      return;
    }
    if (e4.__REELS_SCRUBBER_FEED_MUTED__ = z, !de(location.pathname)) {
      Pn(), Gn(), Rn(), jn();
      return;
    }
    pe(location.pathname) ? An() : jn(), In(), Ln();
  }
  var zn = /* @__PURE__ */ new Set([`explore`, `direct`, `accounts`, `reels`, `stories`, `p`, `reel`]);
  function Bn(e4) {
    if (e4 === `/`) return `home`;
    if (E2(e4)) return `stories`;
    if (T2(e4)) return `reels`;
    if (/^\/[^/]+\/?$/.test(e4)) {
      let t2 = e4.replaceAll(`/`, ``);
      if (!zn.has(t2)) return `profile`;
    }
    return `other`;
  }
  var Vn = location.pathname;
  function Hn() {
    let e4 = Vn;
    if (Vn = location.pathname, !R || V) return;
    let t2 = Bn(e4), n2 = Bn(location.pathname);
    t2 !== n2 && (n2 !== `home` && n2 !== `profile` && n2 !== `reels` || window.setTimeout(() => {
      !Wt() && n2 !== `reels` && _t();
    }, 1500));
  }
  function Un() {
    document.addEventListener(`pause`, (e4) => {
      if (!R || V) return;
      let t2 = e4.target;
      t2 instanceof HTMLVideoElement && t2.hasAttribute(`data-reels-scrubber-active`) && (t2.ended || window.setTimeout(() => {
        if (!t2.isConnected || !t2.paused || t2.ended) return;
        let e5 = t2.getBoundingClientRect();
        e5.top < window.innerHeight * 0.75 && e5.bottom > window.innerHeight * 0.25 && _t();
      }, 1200));
    }, true);
  }
  function Wn() {
    let e4 = history.pushState;
    history.pushState = function(...t3) {
      e4.apply(this, t3), cn = Date.now(), X(), Hn(), queueMicrotask(Q);
    };
    let t2 = history.replaceState;
    history.replaceState = function(...e5) {
      t2.apply(this, e5), cn = Date.now(), X(), Hn(), queueMicrotask(Q);
    }, window.addEventListener(`popstate`, () => {
      cn = Date.now(), X(), Hn(), Q();
    });
  }
  function Gn() {
    document.querySelectorAll(`video[${a}]`).forEach((e4) => {
      Y.rollback(e4);
    });
  }
  function Kn(e4) {
    let t2 = new Set(e4);
    return location.pathname === `/` && document.querySelectorAll(`video[${a}]`).forEach((e5) => {
      er(e5) && t2.add(e5);
    }), Array.from(t2);
  }
  function qn() {
    if (!R) {
      Gn();
      return;
    }
    let e4 = Yn(Array.from(document.querySelectorAll(`video`)));
    if (e4.length === 0) {
      Gn();
      return;
    }
    Kn(e4).forEach((e5) => {
      Y.patch(e5);
    }), Jn(e4);
  }
  function Jn(e4) {
    let t2 = new Set(e4);
    document.querySelectorAll(`video[${a}]`).forEach((e5) => {
      !t2.has(e5) && !er(e5) && Y.rollback(e5);
    });
  }
  function Yn(e4) {
    let t2 = Xn(e4);
    if (!t2) return [];
    if (location.pathname !== `/`) return [t2];
    let n2 = null, r3 = -1, i3 = Qn(t2, Z(t2));
    for (let i4 of e4) {
      if (i4 === t2) continue;
      let e5 = Z(i4);
      if (e5 !== `feed-inline` && e5 !== `feed-carousel` || !Zn(i4, e5)) continue;
      let a3 = Qn(i4, e5);
      a3 > r3 && (r3 = a3, n2 = i4);
    }
    let a2 = /* @__PURE__ */ new Set([t2]);
    n2 && r3 >= i3 * 0.55 && a2.add(n2);
    for (let t3 of e4) {
      if (a2.has(t3)) continue;
      let e5 = Z(t3);
      e5 !== `feed-inline` && e5 !== `feed-carousel` || rr(t3) && Zn(t3, e5) && a2.add(t3);
    }
    return Array.from(a2);
  }
  function Xn(e4) {
    let t2 = null, n2 = -1;
    for (let r3 of e4) {
      let e5 = Z(r3);
      if (!Zn(r3, e5)) continue;
      let i3 = Qn(r3, e5);
      i3 > n2 && (n2 = i3, t2 = r3);
    }
    if (location.pathname === `/`) {
      let e5 = tr(t2, n2);
      return B = e5, e5;
    }
    return t2;
  }
  function Zn(e4, t2) {
    if (!e4.isConnected) return false;
    let n2 = e4.getBoundingClientRect(), r3 = $(n2), i3 = window.innerWidth * window.innerHeight;
    return t2 === `story-viewer` ? n2.width < 180 || n2.height < 280 ? false : r3 >= i3 * 0.08 : t2 === `reel-viewer` ? n2.width < 120 || n2.height < 120 ? false : r3 >= i3 * 0.02 : t2 === `feed-carousel` || t2 === `feed-inline` ? n2.width < 180 || n2.height < 180 ? false : r3 >= i3 * 0.03 : false;
  }
  function Qn(e4, t2) {
    let n2 = e4.getBoundingClientRect(), r3 = $(n2), i3 = $n(n2), a2 = n2.left + n2.width / 2, o2 = n2.top + n2.height / 2, s3 = a2 - window.innerWidth / 2, c2 = o2 - window.innerHeight / 2, l2 = Math.hypot(s3, c2), u2 = t2 === `feed-inline` || t2 === `feed-carousel`, d2 = !u2 && !e4.paused ? 15e4 : 0, f2 = t2 === `story-viewer` ? 12e4 : t2 === `reel-viewer` ? 8e4 : 0;
    if (u2) {
      let t3 = nr(e4) ?? n2, a3 = t3.top + t3.height / 2, o3 = Math.abs(a3 - window.innerHeight / 2), s4 = t3.top < window.innerHeight * 0.78 && t3.bottom > window.innerHeight * 0.22 ? 65e3 : 0, c3 = rr(e4) ? 35e3 : 0, u3 = e4.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ? 25e3 : 0;
      return r3 * 0.45 + i3 * 35e4 + s4 + c3 + u3 - l2 * 1.4 - o3 * 1.2;
    }
    return r3 + d2 + f2 - l2;
  }
  function $(e4) {
    let t2 = Math.min(e4.right, window.innerWidth) - Math.max(e4.left, 0), n2 = Math.min(e4.bottom, window.innerHeight) - Math.max(e4.top, 0);
    return Math.max(0, t2) * Math.max(0, n2);
  }
  function $n(e4) {
    let t2 = Math.max(1, e4.width * e4.height);
    return Math.min(1, $(e4) / t2);
  }
  function er(e4) {
    if (location.pathname !== `/`) return false;
    let t2 = Z(e4);
    return t2 !== `feed-inline` && t2 !== `feed-carousel` ? false : $n(e4.getBoundingClientRect()) >= 0.12;
  }
  function tr(e4, t2) {
    if (!B || !B.isConnected) return e4;
    let n2 = Z(B);
    if (!Zn(B, n2)) return e4;
    let r3 = Qn(B, n2);
    return e4 ? e4 === B ? e4 : t2 < r3 * 1.2 ? B : e4 : B;
  }
  function nr(e4) {
    let t2 = e4.closest(`article`);
    return t2 instanceof HTMLElement ? t2.getBoundingClientRect() : null;
  }
  function rr(e4) {
    let t2 = e4.closest(`article`);
    if (!(t2 instanceof HTMLElement)) return false;
    let n2 = t2.textContent?.toLowerCase() ?? ``;
    return n2.includes(`suggested for you`) || n2.includes(`sponsored`);
  }
  function ir() {
    let e4 = window[r];
    typeof e4 == `boolean` && (R = e4), dn(), Q();
  }
  function ar() {
    window.addEventListener(i, (e4) => {
      let t2 = e4;
      if (dn(), typeof t2.detail?.enabled == `boolean`) {
        R = t2.detail.enabled, Q();
        return;
      }
      ir();
    });
  }
  function or() {
    let e4 = () => {
      R && qn();
    };
    document.addEventListener(`fullscreenchange`, e4), document.addEventListener(`webkitfullscreenchange`, e4);
  }
  function sr() {
    document.addEventListener(`volumechange`, (e4) => {
      if (!R) return;
      let t2 = e4.target;
      if (!(t2 instanceof HTMLVideoElement) || !t2.hasAttribute(`data-reels-scrubber-active`) || window.__REELS_SCRUBBER_APPLYING_MUTE__) return;
      let n2 = Z(t2);
      if (!e4.isTrusted) {
        n2 === `story-viewer` ? k2(t2, En()) : Dn(t2);
        return;
      }
      On(t2.muted), n2 === `story-viewer` && k2(t2, t2.muted);
    }, true), document.addEventListener(`seeked`, (e4) => {
      if (!R || location.pathname !== `/`) return;
      let t2 = e4.target;
      t2 instanceof HTMLVideoElement && t2.hasAttribute(`data-reels-scrubber-active`) && Dn(t2);
    }, true);
  }
  function cr() {
    document.addEventListener(`click`, (e4) => {
      if (!R || !e4.isTrusted) return;
      let t2 = e4.target;
      if (!(t2 instanceof Element)) return;
      let n2 = t2.closest(`[aria-label="Toggle audio"]`) ?? (() => {
        let e5 = t2.closest(`[role="button"]`);
        return e5 && e5.querySelector(`[aria-label="Audio is muted"], [aria-label="Audio is playing"]`) ? e5 : null;
      })();
      if (!n2) return;
      let r3 = n2.closest(`section`) ?? n2.closest(`article`) ?? document.documentElement, i3 = Array.from(r3.querySelectorAll(`video`)), a2 = Xn(i3), o2 = lr(i3), s3 = Xn(Array.from(document.querySelectorAll(`video`))), c2 = a2 ?? o2 ?? s3;
      c2 && On(!c2.muted);
    }, true);
  }
  function lr(e4) {
    let t2 = null, n2 = 0;
    for (let r3 of e4) {
      if (!r3.isConnected) continue;
      let e5 = $(r3.getBoundingClientRect());
      e5 > n2 && (n2 = e5, t2 = r3);
    }
    return t2;
  }
  function ur() {
    document.addEventListener(`emptied`, (e4) => {
      let t2 = e4.target;
      t2 instanceof HTMLVideoElement && t2.hasAttribute(`data-reels-scrubber-active`) && (q.add(t2), J.add(t2), t2.addEventListener(`canplay`, () => {
        if (q.delete(t2), J.delete(t2), !(!t2.hasAttribute(`data-reels-scrubber-active`) || !V)) {
          if (H.speed !== false) {
            let e5 = fn();
            Math.abs(t2.playbackRate - e5) > 1e-3 && hn(t2, e5);
          }
          if (H.volume !== false) {
            let e5 = gn();
            e5 !== null && Math.abs(t2.volume - e5) > 1e-3 && vn(t2, e5);
          }
        }
      }, { once: true }));
    }, true), document.addEventListener(`ratechange`, (e4) => {
      if (!V || H.speed === false) return;
      let t2 = e4.target;
      t2 instanceof HTMLVideoElement && t2.hasAttribute(`data-reels-scrubber-active`) && t2.isConnected && (q.has(t2) || t2.playbackRate === 1 && !mn(t2) || pn(t2.playbackRate));
    }, true), document.addEventListener(`timeupdate`, (e4) => {
      if (!V || !R) return;
      let t2 = e4.target;
      if (t2 instanceof HTMLVideoElement && t2.hasAttribute(`data-reels-scrubber-active`)) {
        if (H.speed !== false) {
          let e5 = fn();
          Math.abs(t2.playbackRate - e5) > 1e-3 && hn(t2, e5);
        }
        if (H.volume !== false) {
          let e5 = gn();
          e5 !== null && Math.abs(t2.volume - e5) > 1e-3 && vn(t2, e5);
        }
      }
    }, true);
  }
  function dr() {
    yn(), document.addEventListener(`volumechange`, (e4) => {
      if (!V || H.volume === false) return;
      let t2 = e4.target;
      if (!(t2 instanceof HTMLVideoElement)) return;
      let n2 = rn.get(t2);
      if (!t2.hasAttribute(`data-reels-scrubber-active`) || !t2.isConnected || (rn.set(t2, t2.volume), J.has(t2)) || n2 !== void 0 && Math.abs(n2 - t2.volume) < 1e-3) return;
      let r3 = an.get(t2);
      if (r3 !== void 0 && Math.abs(r3 - t2.volume) < 1e-3) {
        an.delete(t2);
        return;
      }
      _n(t2.volume);
    }, true);
  }
  function fr() {
    document.addEventListener(`keydown`, (e4) => {
      if (!V || !R || bn(e4.target)) return;
      let t2 = e4.key.toLowerCase(), n2 = t2 === `a` || t2 === `s` || t2 === `d` || t2 === `m` || t2 === `f`, r3 = t2 === `[` || t2 === `]` || t2 === `\\`;
      if (!n2 && !r3) return;
      let i3 = xn();
      if (i3) {
        if (n2 && H.shortcuts !== false) if (e4.stopPropagation(), t2 === `a`) i3.currentTime = Math.max(0, i3.currentTime - 5);
        else if (t2 === `s`) i3.paused ? i3.play().catch(() => {
        }) : i3.pause();
        else if (t2 === `d`) i3.currentTime = Math.min(i3.duration || 1 / 0, i3.currentTime + 5);
        else if (t2 === `m`) {
          let e5 = !i3.muted;
          On(e5), Dn(i3), Z(i3) === `story-viewer` && k2(i3, e5);
        } else document.fullscreenElement ? document.exitFullscreen().catch(() => {
        }) : i3.requestFullscreen().catch(() => {
        });
        if (r3 && H.loop !== false) {
          if (e4.stopPropagation(), t2 === `\\`) {
            X();
            return;
          }
          t2 === `[` ? (U = i3.currentTime, G = new WeakRef(i3), W !== null && W <= U && (W = null)) : (W = i3.currentTime, G = new WeakRef(i3), U !== null && W <= U && (U = null)), wn();
        }
      }
    }, true);
  }
  function pr(e4) {
    let t2 = e4.getBoundingClientRect(), n2 = { bubbles: true, cancelable: true, view: window, clientX: t2.left + t2.width / 2, clientY: t2.top + t2.height / 2 };
    e4.dispatchEvent(new PointerEvent(`pointerdown`, n2)), e4.dispatchEvent(new MouseEvent(`mousedown`, n2)), e4.dispatchEvent(new PointerEvent(`pointerup`, n2)), e4.dispatchEvent(new MouseEvent(`mouseup`, n2)), e4.dispatchEvent(new MouseEvent(`click`, n2));
  }
  function mr(e4) {
    let t2 = e4.parentElement;
    for (; t2; ) {
      let e5 = getComputedStyle(t2);
      if (t2.scrollHeight > t2.clientHeight + 1 && (e5.overflowY === `auto` || e5.overflowY === `scroll`)) return t2;
      t2 = t2.parentElement;
    }
    return null;
  }
  function hr() {
    document.addEventListener(`timeupdate`, (e4) => {
      if (!V || H.autoScroll === false || !R) return;
      let t2 = e4.target;
      t2 instanceof HTMLVideoElement && t2.hasAttribute(`data-reels-scrubber-active`) && T2(location.pathname) && (t2.loop &&= false);
    }, true), document.addEventListener(`ended`, (e4) => {
      if (!V || H.autoScroll === false || !R) return;
      let t2 = e4.target;
      if (!(t2 instanceof HTMLVideoElement) || !t2.hasAttribute(`data-reels-scrubber-active`) || !T2(location.pathname)) return;
      let n2 = mr(t2);
      if (n2) {
        n2.scrollBy({ top: n2.clientHeight, behavior: `smooth` });
        return;
      }
      let r3 = document.scrollingElement;
      if (r3 && r3.scrollHeight > r3.clientHeight + 1) {
        window.scrollBy({ top: window.innerHeight, behavior: `smooth` });
        return;
      }
      let i3 = document.querySelector(`[aria-label="Navigate to next Reel"], [aria-label="Next"]`);
      if (!i3) return;
      let a2 = i3.closest(`button`) ?? i3.closest(`[role="button"]`) ?? i3;
      a2 instanceof HTMLElement && pr(a2);
    }, true);
  }
  function gr() {
    document.addEventListener(`timeupdate`, (e4) => {
      if (!V || H.loop === false || U === null || W === null || G === null) return;
      let t2 = e4.target;
      t2 instanceof HTMLVideoElement && t2 === G.deref() && t2.hasAttribute(`data-reels-scrubber-active`) && t2.currentTime >= W && (t2.currentTime = U);
    }, true);
  }
  function vr() {
    let e4 = () => {
      document.removeEventListener("click", e4, true), document.removeEventListener("keydown", e4, true), document.removeEventListener("mousedown", e4, true), document.removeEventListener("pointerdown", e4, true), window.__REELS_SCRUBBER_FEED_MUTED__ === false && setTimeout(() => {
        let e5 = xn();
        e5 && e5.muted && k2(e5, false);
      }, 50);
    };
    document.addEventListener("click", e4, true), document.addEventListener("keydown", e4, true), document.addEventListener("mousedown", e4, true), document.addEventListener("pointerdown", e4, true);
  }
  Wn(), ar(), or(), sr(), cr(), ur(), dr(), Un(), fr(), hr(), gr(), vr(), z = Tn(), window.__REELS_SCRUBBER_FEED_MUTED__ = z, ir();
  console.info("[ReelSlider] main-bundle.js initialization complete");
  } catch(__rs_err) { console.error("[ReelSlider] main-bundle.js CRASHED:", __rs_err); }
})();
