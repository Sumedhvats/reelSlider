<div align="center">
  <img src="icons/icon128.png" width="80" height="80" alt="ReelSlider" />
  <h1>ReelSlider</h1>
  <p><strong>Real video controls for Instagram</strong></p>
  <p>Seek, volume &amp; playback speed on Reels, Stories, Feed &amp; Posts.</p>

  <br />

  <img src="https://img.shields.io/badge/manifest-v3-1a1a1a?style=flat-square&labelColor=000" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/chrome-extension-1a1a1a?style=flat-square&logo=googlechrome&logoColor=fff&labelColor=000" alt="Chrome Extension" />
  <img src="https://img.shields.io/badge/firefox-extension-1a1a1a?style=flat-square&logo=firefoxbrowser&logoColor=fff&labelColor=000" alt="Firefox Extension" />
  <img src="https://img.shields.io/badge/license-MIT-1a1a1a?style=flat-square&labelColor=000" alt="MIT License" />
  <img src="https://img.shields.io/badge/version-1.3.5-1a1a1a?style=flat-square&labelColor=000" alt="Version 1.3.5" />
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
| **Daily Instagram Limit** | Digital Wellbeing cap (e.g. 1h/day) with auto-pause & break screen |
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

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (v9 or higher)

### Build Instructions

1. **Clone** this repository:
   ```bash
   git clone https://github.com/Sumedhvats/reelSlider.git
   cd reelSlider
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build           # Builds the Chrome extension into dist/
   npm run build:firefox   # Builds the Firefox extension into firefox/
   ```

### Loading in Google Chrome

1. Open **Chrome** and navigate to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select the `dist` folder inside the cloned directory

### Loading in Mozilla Firefox

1. Open **Firefox** and navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select the `manifest.json` file inside the `firefox/` directory

<br />

## Project Structure

```
reelSlider/
├── src/                       # TypeScript source code
│   ├── background/            # Background service worker
│   ├── content/               # Content scripts injected into Instagram
│   │   ├── main/              # Core video patching & logic (MAIN world)
│   │   ├── bridge.ts          # ISOLATED ↔ MAIN world bridge
│   │   ├── locks.ts           # Prototype locks for media elements
│   │   ├── mute-fix.ts        # Enforces mute state
│   │   └── reels-timer.ts     # Digital Wellbeing tracker
│   ├── popup/                 # Popup UI interface
│   ├── support/               # Options/Support page
│   └── utils/                 # Shared constants & helpers
├── _locales/                  # Internationalization (i18n)
├── icons/                     # Extension icons
├── dist/                      # Compiled Chrome extension (created after build)
├── firefox/                   # Compiled Firefox extension (created after build)
├── manifest.json              # Chrome extension manifest (MV3)
├── package.json               # Build dependencies & scripts
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite bundler configuration
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
