import { CapacitorUpdater } from '@capgo/capacitor-updater';

let readyNotified = false;

export async function markSahraOtaReady() {
  if (readyNotified || !window.Capacitor?.isNativePlatform()) return;

  readyNotified = true;
  try {
    await CapacitorUpdater.notifyAppReady();
    console.info('Sahra OTA: app marked ready.');
  } catch (error) {
    readyNotified = false;
    console.error('Sahra OTA: readiness notification failed.', error);
  }
}
