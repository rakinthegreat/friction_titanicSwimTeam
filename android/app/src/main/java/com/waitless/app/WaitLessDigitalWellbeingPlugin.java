package com.waitless.app;

import android.Manifest;
import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingClient;
import com.google.android.gms.location.GeofencingRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import android.app.PendingIntent;
import java.util.ArrayList;
import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

@CapacitorPlugin(
    name = "WaitLessDigitalWellbeing",
    permissions = {
        @Permission(
            alias = "notifications",
            strings = { Manifest.permission.POST_NOTIFICATIONS }
        ),
        @Permission(
            alias = "physicalactivity",
            strings = { Manifest.permission.ACTIVITY_RECOGNITION }
        ),
        @Permission(
            alias = "location",
            strings = { Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION }
        ),
        @Permission(
            alias = "backgroundlocation",
            strings = { Manifest.permission.ACCESS_BACKGROUND_LOCATION }
        )
    }
)
public class WaitLessDigitalWellbeingPlugin extends Plugin {
    private static final String TAG = "WaitLessWellbeing";
    private GeofencingClient geofencingClient;
    private PendingIntent geofencePendingIntent;

    // Hardcoded station coordinates for Dhaka
    private static final Station[] STATIONS = {
        new Station("Uttara North Metro", 23.8812, 90.3908),
        new Station("Uttara Center Metro", 23.8732, 90.3920),
        new Station("Uttara South Metro", 23.8647, 90.3931),
        new Station("Pallabi Metro", 23.8340, 90.3701),
        new Station("Mirpur 11 Metro", 23.8248, 90.3713),
        new Station("Mirpur 10 Metro", 23.8066, 90.3688),
        new Station("Kazipara Metro", 23.7972, 90.3732),
        new Station("Shewrapara Metro", 23.7909, 90.3755),
        new Station("Agargaon Metro", 23.7784, 90.3801),
        new Station("Bijoy Sarani Metro", 23.7712, 90.3855),
        new Station("Farmgate Metro", 23.7578, 90.3897),
        new Station("Karwan Bazar Metro", 23.7513, 90.3919),
        new Station("Shahbagh Metro", 23.7388, 90.3951),
        new Station("Dhaka University Metro", 23.7335, 90.3958),
        new Station("Secretariat Metro", 23.7291, 90.4042),
        new Station("Motijheel Metro", 23.7302, 90.4140),
        new Station("Kamalapur Metro", 23.7315, 90.4225),
        new Station("Kamalapur Railway", 23.7319, 90.4263),
        new Station("Airport Railway", 23.8513, 90.4050),
        // new Station("My Home", 23.7859713, 90.3713612),
        new Station("Sadarghat Terminal", 23.7048, 90.4105)
    };

    private static class Station {
        String name;
        double lat;
        double lng;
        Station(String name, double lat, double lng) {
            this.name = name;
            this.lat = lat;
            this.lng = lng;
        }
    }

    @PluginMethod
    public void getForegroundApp(PluginCall call) {
        String currentApp = "NULL";
        UsageStatsManager usm = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        long time = System.currentTimeMillis();
        List<UsageStats> appList = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 1000 * 1000, time);
        
        if (appList != null && appList.size() > 0) {
            SortedMap<Long, UsageStats> mySortedMap = new TreeMap<Long, UsageStats>();
            for (UsageStats usageStats : appList) {
                mySortedMap.put(usageStats.getLastTimeUsed(), usageStats);
            }
            if (!mySortedMap.isEmpty()) {
                currentApp = mySortedMap.get(mySortedMap.lastKey()).getPackageName();
            }
        }

        JSObject ret = new JSObject();
        ret.put("packageName", currentApp);
        call.resolve(ret);
    }

    @PluginMethod
    public void hasUsageStatsPermission(PluginCall call) {
        AppOpsManager appOps = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, 
            android.os.Process.myUid(), getContext().getPackageName());
        boolean granted = (mode == AppOpsManager.MODE_ALLOWED);
        
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void openUsageSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        Uri uri = Uri.fromParts("package", getContext().getPackageName(), null);
        intent.setData(uri);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void hasNotificationPermission(PluginCall call) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            boolean granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
            ret.put("granted", granted);
        } else {
            ret.put("granted", true);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestPermissionForAlias("notifications", call, "notificationsPermissionCallback");
        } else {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void hasPhysicalActivityPermission(PluginCall call) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            boolean granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED;
            ret.put("granted", granted);
        } else {
            ret.put("granted", true);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPhysicalActivityPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            requestPermissionForAlias("physicalactivity", call, "physicalActivityPermissionCallback");
        } else {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
        }
    }

    @PermissionCallback
    private void notificationsPermissionCallback(PluginCall call) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            boolean granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
            ret.put("granted", granted);
        } else {
            ret.put("granted", true);
        }
        call.resolve(ret);
    }

    @PermissionCallback
    private void physicalActivityPermissionCallback(PluginCall call) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            boolean granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED;
            ret.put("granted", granted);
        } else {
            ret.put("granted", true);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void hasBatteryOptimizationPermission(PluginCall call) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            ret.put("granted", pm.isIgnoringBatteryOptimizations(getContext().getPackageName()));
        } else {
            ret.put("granted", true);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void requestBatteryOptimizationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            //intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            //intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    @Override
    public void load() {
        geofencingClient = LocationServices.getGeofencingClient(getContext());
    }

    @PluginMethod
    public void setupGeofencing(PluginCall call) {
        if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            call.reject("Location permission not granted");
            return;
        }

        List<Geofence> geofenceList = new ArrayList<>();
        for (Station station : STATIONS) {
            geofenceList.add(new Geofence.Builder()
                .setRequestId(station.name)
                .setCircularRegion(station.lat, station.lng, 500) // 500m radius
                .setExpirationDuration(Geofence.NEVER_EXPIRE)
                .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_DWELL)
                .setLoiteringDelay(15000) // 15 seconds as requested for testing
                .build());
        }

        GeofencingRequest request = new GeofencingRequest.Builder()
            .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_DWELL)
            .addGeofences(geofenceList)
            .build();

        geofencingClient.addGeofences(request, getGeofencePendingIntent())
            .addOnSuccessListener(new OnSuccessListener<Void>() {
                @Override
                public void onSuccess(Void aVoid) {
                    Log.d(TAG, "Geofences added successfully");
                    JSObject ret = new JSObject();
                    ret.put("status", "success");
                    call.resolve(ret);
                }
            })
            .addOnFailureListener(new OnFailureListener() {
                @Override
                public void onFailure(@NonNull Exception e) {
                    Log.e(TAG, "Failed to add geofences", e);
                    call.reject("Failed to add geofences: " + e.getMessage());
                }
            });
    }

    private PendingIntent getGeofencePendingIntent() {
        if (geofencePendingIntent != null) {
            return geofencePendingIntent;
        }
        Intent intent = new Intent(getContext(), WaitLessGeofenceReceiver.class);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_MUTABLE;
        }
        geofencePendingIntent = PendingIntent.getBroadcast(getContext(), 0, intent, flags);
        return geofencePendingIntent;
    }

    @PluginMethod
    public void hasBackgroundLocationPermission(PluginCall call) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            boolean granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED;
            ret.put("granted", granted);
        } else {
            ret.put("granted", true);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void requestBackgroundLocationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                requestPermissionForAlias("backgroundlocation", call, "backgroundLocationCallback");
            } else {
                // Request foreground first
                requestPermissionForAlias("location", call, "foregroundLocationCallback");
            }
        } else {
            call.resolve();
        }
    }

    @PermissionCallback
    private void foregroundLocationCallback(PluginCall call) {
        if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            // Foreground granted, now request background
            requestPermissionForAlias("backgroundlocation", call, "backgroundLocationCallback");
        } else {
            call.reject("Foreground location permission is required for background access");
        }
    }

    @PermissionCallback
    private void backgroundLocationCallback(PluginCall call) {
        hasBackgroundLocationPermission(call);
    }
}
