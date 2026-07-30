import { checkAndInitialize, setupListeners } from './main/events';
import { enableVolumeLock, enableSpeedLock } from './main/audio';

function main() {
  enableVolumeLock();
  enableSpeedLock();
  setupListeners();
  checkAndInitialize();
}

main();
