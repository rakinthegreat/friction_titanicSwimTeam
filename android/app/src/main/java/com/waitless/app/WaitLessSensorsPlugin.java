package com.waitless.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WaitLessSensors")
public class WaitLessSensorsPlugin extends Plugin {

    @PluginMethod
    public void getStationaryStatus(PluginCall call) {
        // Placeholder for now
        JSObject ret = new JSObject();
        ret.put("isStationary", true);
        call.resolve(ret);
    }
}
