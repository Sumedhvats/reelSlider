import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json' assert { type: 'json' };

const isFirefox = process.env.BROWSER === 'firefox';

if (isFirefox) {
  (manifest as any).browser_specific_settings = {
    gecko: {
      id: "reelslider@svats.me",
      strict_min_version: "109.0"
    }
  };
  (manifest as any).background = {
    scripts: [manifest.background.service_worker],
    type: "module"
  };
}

export default defineConfig({
  plugins: [crx({ 
    manifest
  })],
  build: {
    target: 'esnext',
    outDir: isFirefox ? 'firefox' : 'dist'
  }
});
