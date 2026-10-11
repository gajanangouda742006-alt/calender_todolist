import './mobile-auth-storage.js';
import { markSahraOtaReady } from './mobile-ota.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void markSahraOtaReady();
  }, { once: true });
} else {
  void markSahraOtaReady();
}
