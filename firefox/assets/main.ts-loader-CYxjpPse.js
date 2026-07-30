(function () {
  'use strict';

  const getRuntime = () => (typeof browser !== 'undefined' && browser.runtime) ? browser.runtime : (typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null);
  const runtime = getRuntime();

  if (runtime && runtime.getURL) {
    const targetUrl = runtime.getURL('assets/main.ts-CrHNQyXz.js');
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      const injectTime = performance.now();
      import('${targetUrl}').then(({ onExecute }) => {
        onExecute?.({ perf: { injectTime, loadTime: performance.now() - injectTime } });
      }).catch(console.error);
    `;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  } else {
    const injectTime = performance.now();
    (async () => {
      const { onExecute } = await import(
        /* @vite-ignore */
        "./main.ts-CrHNQyXz.js"
      );
      onExecute?.({ perf: { injectTime, loadTime: performance.now() - injectTime } });
    })().catch(console.error);
  }
})();

