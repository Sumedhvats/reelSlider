import { config } from "./constants";
import { APP_VERSION } from "./links";

export function createTelemetryPayload(data: Record<string, any>) {
  return { v: 1, extensionVersion: APP_VERSION, ...data };
}

export function notifyTelemetryClient(data: Record<string, any>) {
  if (config.telemetryUrl) {
    window.postMessage(
      { type: `__REELS_SCRUBBER_TELEMETRY__`, payload: createTelemetryPayload(data) },
      window.location.origin,
    );
  }
}

export function notifyTelemetryBackground(data: Record<string, any>) {
  if (config.telemetryUrl) {
    try {
      chrome.runtime.sendMessage(
        { type: `telemetry`, payload: createTelemetryPayload(data) },
        () => void chrome.runtime.lastError,
      );
    } catch {}
  }
}
