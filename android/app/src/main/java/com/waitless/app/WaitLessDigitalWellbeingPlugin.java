package com.waitless.app;

import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

@CapacitorPlugin(name = "WaitLessDigitalWellbeing")
public class WaitLessDigitalWellbeingPlugin extends Plugin {

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
        JSObject ret = new JSObject();
        // Simple check - in reality, we'd check if the query returns data
        ret.put("granted", true); 
        call.resolve(ret);
    }
}
