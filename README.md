<div align="center">
  <img src="icons/icon128.png" width="80" height="80" alt="ReelSlider" />
  <h1>ReelSlider</h1>
  <p><strong>Real video controls for Instagram</strong></p>
  <p>Seek, volume &amp; playback speed on Reels, Stories, Feed &amp; Posts.</p>

  <br />

  <img src="https://img.shields.io/badge/manifest-v3-1a1a1a?style=flat-square&labelColor=000" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/chrome-extension-1a1a1a?style=flat-square&logo=googlechrome&logoColor=fff&labelColor=000" alt="Chrome Extension" />
  <img src="https://img.shields.io/badge/license-MIT-1a1a1a?style=flat-square&labelColor=000" alt="MIT License" />
  <img src="https://img.shields.io/badge/version-1.0.0-1a1a1a?style=flat-square&labelColor=000" alt="Version 1.0.0" />
</div>

<br />

---

## Features

| Feature | Description |
|---|---|
| **Seek & Scrub** | Click or drag the timeline on any Instagram video |
| **Volume Control** | Set default volume — persists across sessions |
| **Playback Speed** | 0.25× to 2.0× — remembered for all videos |
| **Mute Memory** | Mute preference sticks while scrolling through Reels |
| **Keyboard Shortcuts** | A/S/D for seek, M for mute, F for fullscreen |
| **Loop Sections** | Set loop start/end with `[` and `]` keys |
| **Works Everywhere** | Reels, Stories, Feed, Posts, Profile reels tab |

<br />

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `A` | Seek backward 5 seconds |
| `S` | Play / Pause |
| `D` | Seek forward 5 seconds |
| `M` | Mute / Unmute |
| `F` | Toggle fullscreen |
| `[` | Set loop start |
| `]` | Set loop end |
| `\` | Clear loop |

<br />

## Installation

### From Source (Developer Mode)

1. **Clone** this repository:
   ```bash
   git clone https://github.com/Sumedhvats/reelSlider.git
   ```

2. Open **Chrome** and navigate to:
   ```
   chrome://extensions
   ```

3. Enable **Developer mode** (top-right toggle)

4. Click **Load unpacked** and select the cloned `reelSlider` folder

5. Open [instagram.com](https://www.instagram.com) — controls appear automatically

<br />

## Project Structure

```
reelSlider/
├── manifest.json              # Extension manifest (MV3)
├── assets/
│   ├── worker.js              # Background service worker
│   ├── popup.js               # Popup UI logic
│   ├── mute-fix.js            # Mute preference fix
│   ├── main.ts-CrHNQyXz.js   # Content script (video patching)
│   ├── main.ts-loader-CYxjpPse.js
│   ├── constants-nW6bUIy2.js  # Storage keys & config
│   ├── links-CpSuQi2Z.js     # Extension metadata
│   ├── featureFlags-BduP1muU.js
│   ├── telemetry-BwuTmC1U.js  # Telemetry (no-op)
│   └── bridge.ts-Eb-5j8rm.js  # ISOLATED↔MAIN world bridge
├── src/
│   ├── popup/index.html       # Popup UI
│   ├── support/index.html     # Welcome / About page
│   └── content/toastStack.css # Toast notification styles
├── icons/                     # Extension icons (16/32/48/128)
└── _locales/                  # Internationalization
```

<br />

## Privacy

ReelSlider runs **entirely in your browser**. Zero data leaves your device.

- No accounts
- No telemetry or analytics
- No external network requests
- No subscriptions
- All preferences stored locally in `localStorage` and `chrome.storage.local`

<br />

## How It Works

ReelSlider injects a content script into Instagram pages that:

1. **Detects video elements** on Reels, Stories, Feed, and Posts pages
2. **Enables native browser controls** (`video.controls = true`)
3. **Hides Instagram's custom overlays** that block interaction
4. **Syncs mute/volume/speed preferences** via `localStorage` and `chrome.storage`
5. **Installs a prototype lock** on `HTMLMediaElement.prototype.muted` to prevent Instagram from overriding your audio preference
6. **Listens for keyboard shortcuts** and translates them into video commands

The background service worker (`worker.js`) handles:
- Injecting user preferences into new tabs via `chrome.scripting.executeScript`
- Syncing popup changes to all open Instagram tabs
- Persisting settings in `chrome.storage.local`

<br />

## Contributing

Contributions are welcome! Feel free to:

- [Report bugs](https://github.com/Sumedhvats/reelSlider/issues)
- [Request features](https://github.com/Sumedhvats/reelSlider/issues)
- [Submit pull requests](https://github.com/Sumedhvats/reelSlider/pulls)

<br />

## License

MIT © [sumedh](https://github.com/Sumedhvats/)

---

<div align="center">
  <p>
    <sub>Built by <a href="https://github.com/Sumedhvats/">sumedh</a></sub>
  </p>
</div>
