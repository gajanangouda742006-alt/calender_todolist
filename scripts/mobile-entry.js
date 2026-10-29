import './startup-intro.js';
import './mobile-auth-storage.js';
import './mobile-notifications.js';
import '../app.js';
import { App } from '@capacitor/app';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

// The web app reads this bridge at mic-button press time, after Capacitor is ready.
window.SAHRA_SPEECH_RECOGNITION = SpeechRecognition;

async function configureNativeShell() {
  const capacitor = window.Capacitor;  
  if (!capacitor?.isNativePlatform()) return;

  const platform = capacitor.getPlatform();
  try {
    const applyNativeStatusBarTheme = async (theme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'dark') => {
      const lightApp = theme === 'light';
      await StatusBar.setStyle({ style: lightApp ? Style.Dark : Style.Light });
      if (platform === 'android') await StatusBar.setBackgroundColor({ color: lightApp ? '#f8faff' : '#071126' });
    };
    await applyNativeStatusBarTheme();
    window.addEventListener('daysync:theme-changed', (event) => { void applyNativeStatusBarTheme(event.detail?.theme).catch((error) => console.warn('Status bar theme update failed:', error)); });
    await StatusBar.setOverlaysWebView({ overlay: false });
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body });

    await App.addListener('backButton', ({ canGoBack }) => {
      if (window.sahraHandleNativeBack?.()) return;
      // Home is the app's root; do not follow stale WebView history into Login.
      if (platform === 'android' && (window.sahraIsHome?.() || !canGoBack)) {
        void App.exitApp();
      }
    });
  } catch (error) {
    console.error('Native shell configuration failed:', error);
  }
}

void configureNativeShell();
