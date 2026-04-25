package com.waitless.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.google.android.gms.location.ActivityRecognitionResult;
import com.google.android.gms.location.DetectedActivity;
import java.util.List;

public class WaitLessActivityReceiver extends BroadcastReceiver {
    private static final String TAG = "WaitLessActivity";
    private static final String CHANNEL_ID = "waitless_alerts";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (ActivityRecognitionResult.hasResult(intent)) {
            ActivityRecognitionResult result = ActivityRecognitionResult.extractResult(intent);
            handleDetectedActivities(context, result.getProbableActivities());
        }
    }

    private void handleDetectedActivities(Context context, List<DetectedActivity> probableActivities) {
        for (DetectedActivity activity : probableActivities) {
            switch (activity.getType()) {
                case DetectedActivity.WALKING: {
                    if (activity.getConfidence() >= 75) {
                        // Log.d(TAG, "WALKING detected with confidence: " + activity.getConfidence());
                        sendNotification(context, "Focus on the road", "Walking detected. Stay safe while using your phone!");
                    }
                    break;
                }
                case DetectedActivity.IN_VEHICLE: {
                    if (activity.getConfidence() >= 75) {
                        // Log.d(TAG, "IN_VEHICLE detected with confidence: " + activity.getConfidence());
                    }
                    break;
                }
            }
        }
    }

    private void sendNotification(Context context, String title, String message) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle(title)
                .setContentText(message)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        // Note: In a real app, you'd check for POST_NOTIFICATIONS permission here for Android 13+
        try {
            notificationManager.notify(1001, builder.build());
        } catch (SecurityException e) {
            Log.e(TAG, "Notification permission missing", e);
        }
    }
}
