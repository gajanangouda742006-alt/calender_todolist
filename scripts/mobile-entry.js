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

  // Register Android Back first and independently. A status-bar or keyboard
  // plugin failure must never prevent the native Back listener from working.
  try {
    await App.addListener('backButton', () => {
      // Ignore presses during the brief authentication/database bootstrap.
      if (window.SAHRA_APP_READY !== true) return;
      if (window.sahraHandleNativeBack?.()) return;
      // Home is the root. Never let stale WebView history navigate to Login.
      if (platform === 'android' && window.sahraIsHome?.()) {
        void App.exitApp();
      }
    });
  } catch (error) {
    console.error('Native Back listener registration failed:', error);
  }

  // Reserve the native status-bar area before sizing the web content. Keep the
  // bar visible, then apply the correct icon contrast for the active app theme.
  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.show();
  } catch (error) {
    console.warn('Native status-bar visibility configuration failed:', error);
  }

  try {
    const getEffectiveAppTheme = () => {
      const current = document.documentElement.getAttribute('data-theme');
      if (current === 'light' || current === 'dark') return current;
      return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    };
    const applyNativeStatusBarTheme = async (theme = getEffectiveAppTheme()) => {
      const lightApp = theme === 'light';
      // Capacitor Style.Dark means dark (black) status icons on a light bar;
      // Style.Light means white icons on a dark bar.
      await StatusBar.setStyle({ style: lightApp ? Style.Dark : Style.Light });
      if (platform === 'android') {
        await StatusBar.setBackgroundColor({ color: lightApp ? '#f8faff' : '#071126' });
      }
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', lightApp ? '#f8faff' : '#071126');
    };
    await applyNativeStatusBarTheme();
    window.addEventListener('daysync:theme-changed', (event) => {
      void applyNativeStatusBarTheme(event.detail?.theme || getEffectiveAppTheme())
        .catch((error) => console.warn('Status bar theme update failed:', error));
    });
    // Re-apply after the native app returns from the background in case the
    // phone's system appearance changed while DaySync was suspended.
    window.addEventListener('daysync:resume', () => {
      void applyNativeStatusBarTheme().catch((error) => console.warn('Status bar resume theme update failed:', error));
    });
  } catch (error) {
    console.warn('Native status-bar theme configuration failed:', error);
  }

  try {
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
  } catch (error) {
    console.warn('Native keyboard configuration failed:', error);
  }

  try {
    await App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) window.dispatchEvent(new Event('daysync:resume'));
    });
  } catch (error) {
    console.warn('Native app-resume listener registration failed:', error);
  }
}

void configureNativeShell();
