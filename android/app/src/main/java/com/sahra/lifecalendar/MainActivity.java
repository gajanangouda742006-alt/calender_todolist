package com.sahra.lifecalendar;

import android.graphics.Color;
import android.view.Window;
import android.view.WindowManager;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(DaySyncSettingsPlugin.class);
        super.onCreate(savedInstanceState);

        // Keep Android's real status bar visible (time, signal, Wi-Fi and
        // battery). The Capacitor StatusBar plugin applies the active theme
        // color and icon contrast after the web app has initialized.
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        WindowCompat.setDecorFitsSystemWindows(window, true);
        window.setStatusBarColor(Color.rgb(7, 17, 38));

        // Match the dark launch background until DaySync's theme-aware
        // Capacitor StatusBar configuration applies light/dark preferences.
        WindowInsetsControllerCompat insetsController =
                WindowCompat.getInsetsController(window, window.getDecorView());
        insetsController.setAppearanceLightStatusBars(false);
    }
}
