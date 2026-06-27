package com.projectpb.workouts;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * JS bridge for the native workout timer. Forwards commands to
 * WorkoutTimerService and relays native events (button taps, rest finished)
 * back to JS via the "workoutTimerEvent" listener.
 */
@CapacitorPlugin(
    name = "WorkoutTimer",
    permissions = {
        @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
    }
)
public class WorkoutTimerPlugin extends Plugin {

    private static WorkoutTimerPlugin instance;

    @Override
    public void load() {
        instance = this;
    }

    /** Called from the service (any thread) to push an event to JS. */
    public static void emit(String event, JSObject extra, long endTime, int totalSeconds) {
        WorkoutTimerPlugin p = instance;
        if (p == null) return;
        JSObject data = extra != null ? extra : new JSObject();
        data.put("type", event);
        if (endTime > 0) data.put("endTime", endTime);
        if (totalSeconds > 0) data.put("totalSeconds", totalSeconds);
        p.notifyListeners("workoutTimerEvent", data);
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "permsCallback");
        } else {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
        }
    }

    @PermissionCallback
    private void permsCallback(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", getPermissionState("notifications") == com.getcapacitor.PermissionState.GRANTED);
        call.resolve(ret);
    }

    @PluginMethod
    public void showTracking(PluginCall call) {
        // Epoch-ms fields are passed as strings — Capacitor's number marshalling
        // drops large integer values (returns 0), but strings round-trip cleanly.
        Intent i = new Intent(getContext(), WorkoutTimerService.class)
            .setAction(WorkoutTimerService.ACTION_SHOW_TRACKING)
            .putExtra("workoutStartTime", parseLong(call.getString("workoutStartTime", "0")))
            .putExtra("exerciseName", call.getString("exerciseName", ""))
            .putExtra("setLabel", call.getString("setLabel", ""));
        startService(i);
        call.resolve();
    }

    @PluginMethod
    public void startRest(PluginCall call) {
        Intent i = new Intent(getContext(), WorkoutTimerService.class)
            .setAction(WorkoutTimerService.ACTION_START_REST)
            .putExtra("endTime", parseLong(call.getString("endTime", "0")))
            .putExtra("totalSeconds", asInt(call.getInt("totalSeconds", 90)))
            .putExtra("exerciseName", call.getString("exerciseName", ""))
            .putExtra("setLabel", call.getString("setLabel", ""));
        startService(i);
        call.resolve();
    }

    private static long parseLong(String s) {
        try { return Long.parseLong(s.trim()); } catch (Exception e) { return 0L; }
    }
    private static int asInt(Integer i) { return i == null ? 0 : i; }

    @PluginMethod
    public void endSession(PluginCall call) {
        Intent i = new Intent(getContext(), WorkoutTimerService.class)
            .setAction(WorkoutTimerService.ACTION_END_SESSION);
        startService(i);
        call.resolve();
    }

    @PluginMethod
    public void setAppVisibility(PluginCall call) {
        // The native service ticks regardless of foreground state, so nothing to
        // do here today; kept for interface parity with the web implementation.
        call.resolve();
    }

    @PluginMethod
    public void getActiveRest(PluginCall call) {
        JSObject ret = new JSObject();
        if ("resting".equals(WorkoutTimerService.mode)
                && WorkoutTimerService.restEndTime > System.currentTimeMillis()) {
            ret.put("active", true);
            ret.put("endTime", WorkoutTimerService.restEndTime);
            ret.put("totalSeconds", WorkoutTimerService.restTotalSeconds);
            ret.put("exerciseName", WorkoutTimerService.exerciseName);
            ret.put("setLabel", WorkoutTimerService.setLabel);
        } else {
            ret.put("active", false);
        }
        call.resolve(ret);
    }

    private void startService(Intent i) {
        Log.d("WorkoutTimer", "plugin -> service action=" + i.getAction());
        try {
            ContextCompat.startForegroundService(getContext(), i);
        } catch (Exception e) {
            // Starting a foreground service can be blocked from the background;
            // fall back to a normal start so commands still reach the service.
            Log.w("WorkoutTimer", "startForegroundService failed, trying startService", e);
            try { getContext().startService(i); } catch (Exception ignored) {}
        }
    }
}
