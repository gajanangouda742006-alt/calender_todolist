package com.sahra.lifecalendar;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(DaySyncSettingsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
