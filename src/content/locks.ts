const DOM_ATTRIBUTES_SCRUBBER_ACTIVE = 'data-reels-scrubber-active';

// Set up global flags for our extension to bypass the locks
(window as any).__REELSLIDER_SETTING_SPEED__ = false;
(window as any).__REELSLIDER_SETTING_VOLUME__ = false;
(window as any).__REELSLIDER_SETTING_MUTE__ = false;

// 1. PlaybackRate Lock
const speedDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'playbackRate');
if (speedDesc && speedDesc.configurable && speedDesc.get && speedDesc.set) {
  Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
    get() { return speedDesc.get!.call(this); },
    set(val: number) {
      console.log('[ReelSlider Lock] set playbackRate to', val, 'bypass flag:', (window as any).__REELSLIDER_SETTING_SPEED__);
      if (!(window as any).__REELSLIDER_SETTING_SPEED__ && this instanceof HTMLVideoElement && this.hasAttribute(DOM_ATTRIBUTES_SCRUBBER_ACTIVE)) {
        console.log('[ReelSlider Lock] BLOCKED Instagram from overwriting speed to', val);
        return; // Block Instagram from overwriting our speed
      }
      speedDesc.set!.call(this, val);
      console.log('[ReelSlider Lock] Applied speed', val);
    },
    configurable: true
  });
}

const defaultSpeedDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'defaultPlaybackRate');
if (defaultSpeedDesc && defaultSpeedDesc.configurable && defaultSpeedDesc.get && defaultSpeedDesc.set) {
  Object.defineProperty(HTMLMediaElement.prototype, 'defaultPlaybackRate', {
    get() { return defaultSpeedDesc.get!.call(this); },
    set(val: number) {
      if (!(window as any).__REELSLIDER_SETTING_SPEED__ && this instanceof HTMLVideoElement && this.hasAttribute(DOM_ATTRIBUTES_SCRUBBER_ACTIVE)) {
        return; // Block Instagram from overwriting our speed
      }
      defaultSpeedDesc.set!.call(this, val);
    },
    configurable: true
  });
}


// 2. Volume Lock
const volDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');
if (volDesc && volDesc.configurable && volDesc.get && volDesc.set) {
  Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
    get() { return volDesc.get!.call(this); },
    set(val: number) {
      if (!(window as any).__REELSLIDER_SETTING_VOLUME__ && this instanceof HTMLVideoElement && this.hasAttribute(DOM_ATTRIBUTES_SCRUBBER_ACTIVE)) {
        // We could also store userVolumeMap here if needed, but for now just pass it through if we are setting it
      }
      volDesc.set!.call(this, val);
    },
    configurable: true
  });
}

// 3. Mute Lock (Only blocks IG if we aren't bypassing, and globalFeedMuted respects it)
const muteDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted');
if (muteDesc && muteDesc.configurable && muteDesc.get && muteDesc.set) {
  Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
    get() { return muteDesc.get!.call(this); },
    set(val: boolean) {
      let m = val;
      if (m === false && navigator.userActivation && !navigator.userActivation.hasBeenActive) {
        m = true;
      }
      const feedMuted = (window as any).__REELS_SCRUBBER_FEED_MUTED__;
      if (!(window as any).__REELSLIDER_SETTING_MUTE__ && typeof feedMuted === 'boolean' && m !== feedMuted) {
        // Ignored to respect global state
      } else {
        muteDesc.set!.call(this, m);
      }
    },
    configurable: true
  });
}

console.info('[ReelSlider] Synchronous Media prototype locks installed.');
