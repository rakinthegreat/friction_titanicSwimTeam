package com.waitless.app;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.util.Log;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import com.google.android.gms.location.ActivityRecognition;
import com.google.android.gms.location.ActivityRecognitionClient;


@CapacitorPlugin(name = "WaitLessSensors")
public class WaitLessSensorsPlugin extends Plugin implements SensorEventListener {
    private SensorManager sensorManager;
    private Sensor accelerometer;
    private ActivityRecognitionClient activityRecognitionClient;
    private PendingIntent activityPendingIntent;
    private boolean isStationary = true;
    private long lastMoveTime = 0;
    private static final float MOVE_THRESHOLD = 0.5f; // Lowered from 2.0f for sensitive detection
    private static final String TAG = "WaitLessSensors";


    @Override
    public void load() {
        sensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_NORMAL);

        createNotificationChannel();
        setupActivityRecognition();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    "waitless_alerts",
                    "WaitLess Alerts",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Notifications for safety and activity detection");
            NotificationManager manager = getContext().getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private void setupActivityRecognition() {
        activityRecognitionClient = ActivityRecognition.getClient(getContext());
        Intent intent = new Intent(getContext(), WaitLessActivityReceiver.class);
        
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        
        activityPendingIntent = PendingIntent.getBroadcast(getContext(), 0, intent, flags);
        
        try {
            activityRecognitionClient.requestActivityUpdates(3000, activityPendingIntent)
                .addOnSuccessListener(aVoid -> Log.d(TAG, "Successfully requested activity updates"))
                .addOnFailureListener(e -> Log.e(TAG, "Failed to request activity updates", e));
        } catch (SecurityException e) {
            Log.e(TAG, "Activity Recognition permission not granted", e);
        }
    }


    @PluginMethod
    public void getStationaryStatus(PluginCall call) {
        long currentTime = System.currentTimeMillis();
        // If no significant movement in the last 30 seconds
        isStationary = (currentTime - lastMoveTime) > 30000;

        JSObject ret = new JSObject();
        ret.put("isStationary", isStationary);
        ret.put("lastMoveTime", lastMoveTime);
        call.resolve(ret);
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            float x = event.values[0];
            float y = event.values[1];
            float z = event.values[2];

            double acceleration = Math.sqrt(x * x + y * y + z * z) - SensorManager.GRAVITY_EARTH;
            if (Math.abs(acceleration) > MOVE_THRESHOLD) {
                lastMoveTime = System.currentTimeMillis();
                // Log.d(TAG, "Movement detected! Acceleration: " + acceleration);
            }
        }

    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}
}
