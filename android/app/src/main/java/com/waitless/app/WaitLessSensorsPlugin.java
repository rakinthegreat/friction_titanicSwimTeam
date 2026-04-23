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

@CapacitorPlugin(name = "WaitLessSensors")
public class WaitLessSensorsPlugin extends Plugin implements SensorEventListener {
    private SensorManager sensorManager;
    private Sensor accelerometer;
    private boolean isStationary = true;
    private long lastMoveTime = 0;
    private static final float MOVE_THRESHOLD = 2.0f; // Adjust based on testing

    @Override
    public void load() {
        sensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_NORMAL);
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
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}
}
