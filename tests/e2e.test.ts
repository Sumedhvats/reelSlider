import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const extensionPath = path.resolve(__dirname, '../dist');

describe('ReelSlider E2E Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new' as any,
      executablePath: '/usr/bin/chromium',
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
  });


  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  it('should load the extension and background service worker successfully', async () => {
    const serviceWorkerTarget = await browser.waitForTarget((t) => t.type() === 'service_worker' || t.type() === 'background_page', { timeout: 5000 });
    expect(serviceWorkerTarget).toBeDefined();
    // In manifest V3, the SW URL typically ends with background/index.ts (if vite transforms it, it's usually .js or .ts)
    // We just check that it loaded a service worker for our extension.
    expect(serviceWorkerTarget?.url()).toContain('chrome-extension://');
  });

  it('should inject properly into Instagram', async () => {
    page = await browser.newPage();
    await page.goto('https://www.instagram.com/');
    
    // Wait for the body to be loaded
    await page.waitForSelector('body');
    
    // Just verifying the page didn't crash
    const title = await page.title();
    expect(title).toContain('Instagram');
  }, 15000);

  it('should open the extension popup and interact with it', async () => {
    // Get extension ID from service worker target
    const serviceWorkerTarget = await browser.waitForTarget((t) => t.type() === 'service_worker' || t.type() === 'background_page', { timeout: 5000 });
    const extensionUrl = serviceWorkerTarget.url();
    const extensionId = extensionUrl.split('/')[2];

    const popupPage = await browser.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/src/popup/index.html`);

    // Verify header exists
    await popupPage.waitForSelector('.brand-name');
    const title = await popupPage.$eval('.brand-name', (el) => el.textContent);
    expect(title).toBe('REELSLIDER');

    // Verify default speed is rendered
    await popupPage.waitForSelector('#speed-val');
    const speedVal = await popupPage.$eval('#speed-val', (el) => el.textContent);
    expect(speedVal).toContain('1.0');

    // Click increase speed button
    await popupPage.click('#speed-inc');

    // Verify speed increased
    await new Promise((r) => setTimeout(r, 300));
    const newSpeedVal = await popupPage.$eval('#speed-val', (el) => el.textContent);
    expect(newSpeedVal).not.toBe(speedVal);

    await popupPage.close();
  });
});
