package com.waitless.app;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingEvent;
import java.util.List;

public class WaitLessGeofenceReceiver extends BroadcastReceiver {
    private static final String TAG = "WaitLessGeofence";
    private static final String CHANNEL_ID = "waitless_alerts";

    @Override
    public void onReceive(Context context, Intent intent) {
        GeofencingEvent geofencingEvent = GeofencingEvent.fromIntent(intent);
        if (geofencingEvent == null || geofencingEvent.hasError()) {
            Log.e(TAG, "Geofencing error");
            return;
        }

        int geofenceTransition = geofencingEvent.getGeofenceTransition();

        if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_DWELL) {
            List<Geofence> triggeringGeofences = geofencingEvent.getTriggeringGeofences();
            if (triggeringGeofences != null && !triggeringGeofences.isEmpty()) {
                String stationName = triggeringGeofences.get(0).getRequestId();
                Log.d(TAG, "Dwell transition detected at: " + stationName);

                android.content.SharedPreferences prefs = context.getSharedPreferences("WaitLessGeofencePrefs", Context.MODE_PRIVATE);
                long lastGeofenceNotify = prefs.getLong("last_geofence_notify", 0);
                
                if (System.currentTimeMillis() - lastGeofenceNotify > 1800000) { // 30 mins cooldown
                    sendNotification(context, "Waiting at " + stationName + "?", "Long wait ahead? Try WaitLess to pass the time!");
                    prefs.edit().putLong("last_geofence_notify", System.currentTimeMillis()).apply();
                }
            }
        }
    }

    private void sendNotification(Context context, String title, String message) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, flags);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(message)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        try {
            notificationManager.notify(1002, builder.build());
        } catch (SecurityException e) {
            Log.e(TAG, "Notification permission missing", e);
        }
    }
}
