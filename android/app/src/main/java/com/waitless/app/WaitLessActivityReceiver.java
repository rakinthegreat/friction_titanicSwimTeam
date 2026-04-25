package com.waitless.app;

import android.app.PendingIntent;
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
        
        checkDoomscrolling(context);
    }

    private void checkDoomscrolling(Context context) {
        android.content.SharedPreferences prefs = context.getSharedPreferences("WaitLessDoomPrefs", Context.MODE_PRIVATE);
        long lastDoomNotify = prefs.getLong("last_doom_notify", 0);
        
        // 2-hour cooldown
        if (System.currentTimeMillis() - lastDoomNotify < 7200000) {
            return;
        }

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP_MR1) {
            android.app.usage.UsageStatsManager usm = (android.app.usage.UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
            long endTime = System.currentTimeMillis();
            long startTime = endTime - (40 * 60 * 1000); // 40 minutes window

            android.app.usage.UsageEvents events = usm.queryEvents(startTime, endTime);
            if (events != null) {
                java.util.Map<String, Long> appUsage = new java.util.HashMap<>();
                java.util.Map<String, Long> lastEventTime = new java.util.HashMap<>();
                
                String[] socialApps = {
                    "com.facebook.katana", "com.instagram.android", "com.twitter.android",
                    "com.zhiliaoapp.musically", "com.snapchat.android", "com.ss.android.ugc.trill", 
                    "com.x.android", "com.google.android.youtube"
                };
                java.util.Set<String> socialSet = new java.util.HashSet<>(java.util.Arrays.asList(socialApps));

                android.app.usage.UsageEvents.Event event = new android.app.usage.UsageEvents.Event();
                while (events.hasNextEvent()) {
                    events.getNextEvent(event);
                    String pkg = event.getPackageName();
                    if (socialSet.contains(pkg)) {
                        if (event.getEventType() == android.app.usage.UsageEvents.Event.MOVE_TO_FOREGROUND) {
                            lastEventTime.put(pkg, event.getTimeStamp());
                        } else if (event.getEventType() == android.app.usage.UsageEvents.Event.MOVE_TO_BACKGROUND) {
                            Long start = lastEventTime.get(pkg);
                            if (start != null) {
                                long duration = event.getTimeStamp() - start;
                                appUsage.put(pkg, appUsage.getOrDefault(pkg, 0L) + duration);
                                lastEventTime.remove(pkg);
                            }
                        }
                    }
                }

                // Add time for apps still in foreground
                for (String pkg : lastEventTime.keySet()) {
                    long duration = endTime - lastEventTime.get(pkg);
                    appUsage.put(pkg, appUsage.getOrDefault(pkg, 0L) + duration);
                }

                long totalSocialTime = 0;
                for (long time : appUsage.values()) {
                    totalSocialTime += time;
                }

                if (totalSocialTime > (30 * 60 * 1000)) {
                    sendNotification(context, "Doomscrolling Alert!", "You've been on social media for over 30 mins recently. Take a break and try a WaitLess activity!");
                    prefs.edit().putLong("last_doom_notify", System.currentTimeMillis()).apply();
                }
            }
        }
    }

    private void handleDetectedActivities(Context context, List<DetectedActivity> probableActivities) {
        android.content.SharedPreferences prefs = context.getSharedPreferences("WaitLessActivityPrefs", Context.MODE_PRIVATE);
        long walkingStartTime = prefs.getLong("walking_start_time", 0);
        boolean isCurrentlyWalking = false;

        for (DetectedActivity activity : probableActivities) {
            int type = activity.getType();
            int confidence = activity.getConfidence();

            if (type == DetectedActivity.WALKING && confidence >= 75) {
                isCurrentlyWalking = true;
            } else if (type == DetectedActivity.IN_VEHICLE && confidence >= 75) {
                handleVehicleMovement(context, prefs);
            }
        }

        if (isCurrentlyWalking) {
            if (walkingStartTime == 0) {
                walkingStartTime = System.currentTimeMillis();
                prefs.edit().putLong("walking_start_time", walkingStartTime).apply();
            } else {
                long duration = System.currentTimeMillis() - walkingStartTime;
                if (duration >= 120000) { // 2 minutes
                    android.os.PowerManager pm = (android.os.PowerManager) context.getSystemService(Context.POWER_SERVICE);
                    if (pm.isInteractive()) {
                        long lastWalkingNotify = prefs.getLong("last_walking_notify", 0);
                        if (System.currentTimeMillis() - lastWalkingNotify > 1800000) { // 30 mins cooldown
                            sendNotification(context, "Safety First!", "You've been walking for 2 mins while using your phone. Please look up and stay safe!");
                            prefs.edit().putLong("last_walking_notify", System.currentTimeMillis()).apply();
                        }
                        // Reset to avoid spamming the duration check immediately
                        prefs.edit().putLong("walking_start_time", System.currentTimeMillis()).apply();
                    }
                }
            }
        } else {
            // Not walking, reset timer
            prefs.edit().putLong("walking_start_time", 0).apply();
        }
    }

    private void handleVehicleMovement(Context context, android.content.SharedPreferences prefs) {
        long vehicleStartTime = prefs.getLong("vehicle_start_time", 0);
        if (vehicleStartTime == 0) {
            prefs.edit().putLong("vehicle_start_time", System.currentTimeMillis()).apply();
        } else {
            long duration = System.currentTimeMillis() - vehicleStartTime;
            if (duration >= 60000) { // 1 minute of vehicle movement
                // Only notify once per trip (reset after 30 mins or when trip ends)
                long lastVehicleNotify = prefs.getLong("last_vehicle_notify", 0);
                if (System.currentTimeMillis() - lastVehicleNotify > 1800000) { // 30 mins cooldown
                    sendNotification(context, "On the move?", "Commuting? Check out our activities to make your trip WaitLess!");
                    prefs.edit().putLong("last_vehicle_notify", System.currentTimeMillis()).apply();
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
        // Note: In a real app, you'd check for POST_NOTIFICATIONS permission here for Android 13+
        try {
            notificationManager.notify(1001, builder.build());
        } catch (SecurityException e) {
            Log.e(TAG, "Notification permission missing", e);
        }
    }
}
