package com.sahra.lifecalendar;

import com.getcapacitor.BridgeActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import android.graphics.Color;
import android.view.Window;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(DaySyncSettingsPlugin.class);
        super.onCreate(savedInstanceState);

        // Keep Android's real status bar visible outside the WebView. Start in
        // the DaySync dark-theme state (white system icons); the existing
        // Capacitor StatusBar integration switches icon contrast at runtime
        // when the user selects Light mode.
        Window window = getWindow();
        window.clearFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
        WindowCompat.setDecorFitsSystemWindows(window, true);
        window.setStatusBarColor(Color.rgb(7, 17, 38));
        WindowInsetsControllerCompat insetsController =
            WindowCompat.getInsetsController(window, window.getDecorView());
        if (insetsController != null) {
            insetsController.setAppearanceLightStatusBars(false);
        }
    }
}
