<div align="center">
  <img src="icons/icon128.png" width="80" height="80" alt="ReelSlider" />
  <h1>ReelSlider</h1>
  <p><strong>Video Controls, Auto-Scroll, Speed &amp; Media Downloader for Instagram</strong></p>
  <p>Seek, volume memory, playback speed, auto-scroll reels, media downloader, and multi-language support for Reels, Stories, Feed &amp; Posts.</p>

  <br />

  <img src="https://img.shields.io/badge/manifest-v3-1a1a1a?style=flat-square&labelColor=000" alt="Manifest V3" />
  <a href="https://chromewebstore.google.com/detail/lganmccldjdmfolkijopflmepainfloc?utm_source=item-share-cb" target="_blank">
    <img src="https://img.shields.io/badge/chrome-extension-1a1a1a?style=flat-square&logo=googlechrome&logoColor=fff&labelColor=000" alt="Chrome Extension" />
  </a>
  <img src="https://img.shields.io/badge/firefox-extension-1a1a1a?style=flat-square&logo=firefoxbrowser&logoColor=fff&labelColor=000" alt="Firefox Extension" />
  <img src="https://img.shields.io/badge/license-MIT-1a1a1a?style=flat-square&labelColor=000" alt="MIT License" />
  <img src="https://img.shields.io/badge/version-1.5.0-1a1a1a?style=flat-square&labelColor=000" alt="Version 1.5.0" />
</div>

<br />

---

## Features

| Feature | Description |
|---|---|
| **Seek & Scrub** | Click or drag the timeline on any Instagram video |
| **1-Click Downloading** | Instantly download high-quality videos & photo posts directly to your device |
| **Auto-scroll Reels** | Automatically scroll to the next reel when the current video ends (ON by default) |
| **Multi-Language Support** | Full localization in 🇬🇧/🇺🇸 English, 🇩🇪 Deutsch, 🇪🇸 Español, 🇫🇷 Français, 🇧🇷 Português, and 🇹🇷 Türkçe |
| **Smart Language Auto-Detect** | Automatically matches active Instagram tab language or allows manual language selection |
| **Volume Control** | Set custom default volume — persists across sessions |
| **Playback Speed** | 0.25× to 2.0× — remembered automatically for all videos |
| **On-Screen Speed UI** | See playback speed toasts in a sleek popup when using keyboard shortcuts |
| **Mute Memory** | Mute preference carries over smoothly while scrolling Reels |
| **Daily Instagram Limit** | Digital Wellbeing cap (e.g. 1h/day) with auto-pause & break screen |
| **Keyboard Shortcuts** | Seek (`A`/`D` or `←`/`→`), Speed (`W`/`S`), Mute (`M`), Fullscreen (`F`), Auto-scroll (`G`) |
| **Works Everywhere** | Reels, Stories, Feed, Posts, and Profile reels tab |

<br />

## 🌐 Supported Languages

ReelSlider automatically detects the language of your Instagram page or system, with an in-popup selector:

- 🇺🇸 / 🇬🇧 **English**
- 🇩🇪 **Deutsch** (German)
- 🇪🇸 **Español** (Spanish)
- 🇫🇷 **Français** (French)
- 🇧🇷 **Português** (Portuguese)
- 🇹🇷 **Türkçe** (Turkish)

<br />

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `A` or `←` | Seek backward 3 seconds |
| `Space` | Play / Pause |
| `D` or `→` | Seek forward 3 seconds |
| `W` | Increase playback speed (+0.25x) |
| `S` | Decrease playback speed (-0.25x) |
| `Shift`+`W` | Hold for temporary max speed (2.0x) |
| `Shift`+`S` | Hold for temporary slow speed (0.5x) |
| `M` | Mute / Unmute |
| `F` | Toggle fullscreen |
| `G` | Toggle auto-scroll (ON / OFF) |

<br />

## Installation

### Chrome Web Store (Recommended)

You can install ReelSlider directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/lganmccldjdmfolkijopflmepainfloc?utm_source=item-share-cb).

### Method 1: Download Pre-built Release
1. Go to the [Releases page](https://github.com/Sumedhvats/reelSlider/releases).
2. Download the `.zip` file for your browser (`reelslider-v1.5.0-chrome.zip` or `reelslider-v1.5.0-firefox.zip`).
3. Extract the `.zip` file.
4. Follow the loading instructions below based on your browser.

### Method 2: Build from Source

**Prerequisites:** [Node.js](https://nodejs.org/) (v18+) and npm (v9+)

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
3. Click **Load unpacked** and select the extracted folder (or the `dist` folder if building from source)

### Loading in Mozilla Firefox

1. Open **Firefox** and navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select the `manifest.json` file inside the extracted folder (or the `firefox/` directory if building from source)

<br />

## Project Structure

```
reelSlider/
├── src/                       # TypeScript source code
│   ├── background/            # Background service worker
│   ├── content/               # Content scripts injected into Instagram
│   │   ├── main/              # Core video patching, download & auto-scroll logic
│   │   ├── bridge.ts          # ISOLATED ↔ MAIN world bridge
│   │   ├── locks.ts           # Prototype locks for media elements
│   │   ├── mute-fix.ts        # Enforces mute state
│   │   └── reels-timer.ts     # Digital Wellbeing tracker
│   ├── popup/                 # Popup UI interface & language selector
│   ├── support/               # Options & Support page
│   └── utils/                 # Multi-language i18n & shared helpers
├── store-assets/              # Store listings & localized assets (en, de, es, fr, pt, pt_BR, tr)
├── _locales/                  # Locale JSON messages (en, de, es, fr, pt, pt_BR, tr)
├── icons/                     # Extension icons
├── dist/                      # Compiled Chrome extension
├── firefox/                   # Compiled Firefox extension
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
6. **Injects high-resolution download buttons** into post & reel action bars in a language-agnostic way
7. **Auto-scrolls Reels** seamlessly when videos end
8. **Listens for keyboard shortcuts** and translates them into video commands

<br />

## Contributing

Contributions are welcome! Feel free to:

- [Report bugs](https://github.com/Sumedhvats/reelSlider/issues)
- [Request features](https://github.com/Sumedhvats/reelSlider/issues)
- [Submit pull requests](https://github.com/Sumedhvats/reelSlider/pulls)

<br />

## License

MIT © [Sumedh Vats](https://github.com/Sumedhvats/)

---

<div align="center">
  <p>
    <sub>Built by <a href="https://github.com/Sumedhvats/">Sumedh Vats</a></sub>
  </p>
</div>

