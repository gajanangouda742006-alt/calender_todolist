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
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setOverlaysWebView({ overlay: false });
    if (platform === 'android') {
      await StatusBar.setBackgroundColor({ color: '#f8faff' });
    }
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body });

    await App.addListener('backButton', ({ canGoBack }) => {
      if (window.sahraHandleNativeBack?.()) return;
      if (platform === 'android' && !canGoBack) {
        void App.exitApp();
      }
    });
  } catch (error) {
    console.error('Native shell configuration failed:', error);
  }
}

void configureNativeShell();
