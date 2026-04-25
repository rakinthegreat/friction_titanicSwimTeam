package com.waitless.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WaitLessSensorsPlugin.class);
        registerPlugin(WaitLessDigitalWellbeingPlugin.class);
        super.onCreate(savedInstanceState);

        createNotificationChannels();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) return;

            // General — used for immediate/ad-hoc notifications
            NotificationChannel generalChannel = new NotificationChannel(
                "general",
                "General",
                NotificationManager.IMPORTANCE_HIGH
            );
            generalChannel.setDescription("General WaitLess notifications");
            manager.createNotificationChannel(generalChannel);

            // WaitLess Alerts — used by WaitLessActivityReceiver for activity recognition
            NotificationChannel waitlessAlerts = new NotificationChannel(
                "waitless_alerts",
                "Activity Alerts",
                NotificationManager.IMPORTANCE_HIGH
            );
            waitlessAlerts.setDescription("Notifications triggered by detected physical activity");
            waitlessAlerts.enableVibration(true);
            manager.createNotificationChannel(waitlessAlerts);
        }
    }
}
