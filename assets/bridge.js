// ReelSlider — Bridge (content script, isolated world)
// by sumedh | https://github.com/Sumedhvats/
// Forwards messages from the MAIN world to the background worker.
(function () {
  window.addEventListener('message', (e) => {
    if (e.source !== window) return;
    if (e.data?.type === '__REELSLIDER_TELEMETRY__') {
      // no-op: telemetry not used in ReelSlider
    }
  });
})();
