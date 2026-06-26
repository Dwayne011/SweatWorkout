package com.sw3at.workouts;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import androidx.core.app.NotificationCompat;

/**
 * Foreground service that owns the single workout notification and ticks the
 * rest countdown natively, so it keeps running and updating on the lock screen
 * while the app is backgrounded. Two visual states:
 *   - tracking: ongoing notification with workout duration + current set,
 *     actions [Done, End]
 *   - resting:  live mm:ss countdown, actions [+30s, Skip, -30s]
 *
 * Button taps and the JS commands both arrive through onStartCommand (the
 * action buttons are PendingIntents that re-start this service with an action).
 * State changes are mirrored to JS via WorkoutTimerPlugin.emit().
 */
public class WorkoutTimerService extends Service {

    // Commands (from JS) and button actions (from the notification)
    public static final String ACTION_SHOW_TRACKING = "com.sw3at.workouts.SHOW_TRACKING";
    public static final String ACTION_START_REST = "com.sw3at.workouts.START_REST";
    public static final String ACTION_END_SESSION = "com.sw3at.workouts.END_SESSION";
    public static final String ACTION_ADD_30 = "com.sw3at.workouts.ADD_30";
    public static final String ACTION_SUB_30 = "com.sw3at.workouts.SUB_30";
    public static final String ACTION_SKIP = "com.sw3at.workouts.SKIP";
    public static final String ACTION_DONE = "com.sw3at.workouts.DONE";
    public static final String ACTION_END = "com.sw3at.workouts.END";

    private static final String TAG = "WorkoutTimer";
    // Single high-importance channel so the one notification can buzz on demand
    // (a v2 id forces a fresh channel even if an older low one already exists).
    private static final String CHANNEL_MAIN = "workout-timer-main-v2";
    private static final int NOTIF_ID = 4801;

    // Public mirror of state so the plugin can answer getActiveRest().
    public static volatile String mode = "idle"; // idle | tracking | resting
    public static volatile long restEndTime = 0L;
    public static volatile int restTotalSeconds = 0;
    public static volatile String exerciseName = "";
    public static volatile String setLabel = "";
    public static volatile long workoutStartTime = 0L;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable ticker;
    private boolean isForeground = false;
    // While now < restOverUntil the single notification shows the "Rest over!"
    // banner (it buzzes once when entered, then stays silent before reverting).
    private long restOverUntil = 0L;

    @Override
    public void onCreate() {
        super.onCreate();
        createChannels();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : null;
        Log.d(TAG, "onStartCommand action=" + action + " mode=" + mode);
        if (action == null) {
            return START_STICKY;
        }

        // Any delivery via startForegroundService() MUST call startForeground()
        // promptly, or Android kills the app (ForegroundServiceDidNotStartInTime).
        // Satisfy that for every action — including teardown — up front.
        ensureForeground();

        switch (action) {
            case ACTION_SHOW_TRACKING:
                workoutStartTime = intent.getLongExtra("workoutStartTime", workoutStartTime);
                exerciseName = orEmpty(intent.getStringExtra("exerciseName"));
                setLabel = orEmpty(intent.getStringExtra("setLabel"));
                mode = "tracking";
                restEndTime = 0L;
                pushNotification();
                startTicking();
                break;

            case ACTION_START_REST:
                restEndTime = intent.getLongExtra("endTime", 0L);
                restTotalSeconds = intent.getIntExtra("totalSeconds", 90);
                exerciseName = orEmpty(intent.getStringExtra("exerciseName"));
                setLabel = orEmpty(intent.getStringExtra("setLabel"));
                mode = "resting";
                Log.d(TAG, "START_REST endTime=" + restEndTime + " now=" + System.currentTimeMillis()
                        + " remainSec=" + ((restEndTime - System.currentTimeMillis()) / 1000)
                        + " total=" + restTotalSeconds);
                pushNotification();
                startTicking();
                break;

            case ACTION_ADD_30:
                if ("resting".equals(mode) && restEndTime > 0) {
                    restEndTime += 30000L;
                    restTotalSeconds += 30;
                    pushNotification();
                    emitRestAdjusted();
                }
                break;

            case ACTION_SUB_30:
                if ("resting".equals(mode) && restEndTime > 0) {
                    restEndTime -= 30000L;
                    restTotalSeconds = Math.max(1, restTotalSeconds - 30);
                    if (restEndTime <= System.currentTimeMillis()) {
                        finishRest();
                    } else {
                        pushNotification();
                        emitRestAdjusted();
                    }
                }
                break;

            case ACTION_SKIP:
                mode = "tracking";
                restEndTime = 0L;
                pushNotification();
                WorkoutTimerPlugin.emit("rest_skipped", null, 0L, 0);
                break;

            case ACTION_DONE:
                // Let JS mark the set complete and start the correct rest period.
                WorkoutTimerPlugin.emit("set_completed", null, 0L, 0);
                bringAppToForeground();
                break;

            case ACTION_END:
                WorkoutTimerPlugin.emit("end_workout", null, 0L, 0);
                bringAppToForeground();
                break;

            case ACTION_END_SESSION:
                stopEverything();
                return START_NOT_STICKY;
        }

        return START_STICKY;
    }

    // --- Ticking -------------------------------------------------------------
    private void startTicking() {
        if (ticker != null) return;
        ticker = new Runnable() {
            @Override
            public void run() {
                onTick();
                handler.postDelayed(this, 1000);
            }
        };
        handler.postDelayed(ticker, 1000);
    }

    private void stopTicking() {
        if (ticker != null) {
            handler.removeCallbacks(ticker);
            ticker = null;
        }
    }

    private void onTick() {
        if ("resting".equals(mode)) {
            long remaining = restEndTime - System.currentTimeMillis();
            if (remaining <= 0) {
                finishRest();
            } else {
                pushNotification();
            }
        } else if ("tracking".equals(mode)) {
            pushNotification();
        }
    }

    private void finishRest() {
        Log.d(TAG, "finishRest (rest over -> tracking)");
        mode = "tracking";
        restEndTime = 0L;
        // Show "Rest over!" on the SAME notification for a few seconds, buzzing
        // once; the next ticks keep it silent, then it reverts to tracking.
        restOverUntil = System.currentTimeMillis() + 6000L;
        pushNotification(true);
        WorkoutTimerPlugin.emit("rest_finished", null, 0L, 0);
    }

    // --- Notification building ----------------------------------------------
    /** Promote to a foreground service exactly once, satisfying the OS contract. */
    private void ensureForeground() {
        if (isForeground) return;
        try {
            Notification n = buildNotification(false);
            if (Build.VERSION.SDK_INT >= 29) {
                startForeground(NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
            } else {
                startForeground(NOTIF_ID, n);
            }
            isForeground = true;
            Log.d(TAG, "startForeground OK");
        } catch (Exception e) {
            Log.w(TAG, "startForeground failed", e);
        }
    }

    private void pushNotification() {
        pushNotification(false);
    }

    /** Update the single ongoing notification. alerting=true buzzes it once. */
    private void pushNotification(boolean alerting) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(NOTIF_ID, buildNotification(alerting));
    }

    private Notification buildNotification(boolean alerting) {
        NotificationCompat.Builder b = new NotificationCompat.Builder(this, CHANNEL_MAIN)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setOngoing(true)
                .setSilent(!alerting)               // silent except the one rest-over buzz
                .setOnlyAlertOnce(!alerting)
                .setPriority(alerting ? NotificationCompat.PRIORITY_HIGH : NotificationCompat.PRIORITY_LOW)
                .setContentIntent(contentIntent())
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);
        if (alerting) {
            b.setDefaults(NotificationCompat.DEFAULT_ALL);
        }

        if ("resting".equals(mode)) {
            long remaining = Math.max(0, restEndTime - System.currentTimeMillis());
            b.setContentTitle("⏳ Rest " + formatMMSS(remaining / 1000));
            b.setContentText("Up next: " + safe(exerciseName) + (setLabel.isEmpty() ? "" : " — " + setLabel));
            b.addAction(0, "+30s", actionIntent(ACTION_ADD_30));
            b.addAction(0, "Skip", actionIntent(ACTION_SKIP));
            b.addAction(0, "-30s", actionIntent(ACTION_SUB_30));
        } else if (System.currentTimeMillis() < restOverUntil) {
            b.setContentTitle("💪 Rest over!");
            b.setContentText("Time for " + (setLabel.isEmpty() ? "your next set" : setLabel)
                    + (exerciseName.isEmpty() ? "" : " — " + exerciseName));
            b.addAction(0, "Done", actionIntent(ACTION_DONE));
            b.addAction(0, "End", actionIntent(ACTION_END));
        } else {
            String elapsed = workoutStartTime > 0
                    ? formatElapsed((System.currentTimeMillis() - workoutStartTime) / 1000)
                    : "0:00";
            b.setContentTitle("🏋️ " + safe(exerciseName));
            b.setContentText((setLabel.isEmpty() ? "" : setLabel + " • ") + "Duration " + elapsed);
            b.addAction(0, "Done", actionIntent(ACTION_DONE));
            b.addAction(0, "End", actionIntent(ACTION_END));
        }
        return b.build();
    }

    private void stopEverything() {
        stopTicking();
        mode = "idle";
        restEndTime = 0L;
        restOverUntil = 0L;
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.cancel(NOTIF_ID);
        }
        if (Build.VERSION.SDK_INT >= 24) {
            stopForeground(Service.STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
        isForeground = false;
        stopSelf();
    }

    // --- Helpers -------------------------------------------------------------
    private PendingIntent actionIntent(String action) {
        Intent i = new Intent(this, WorkoutTimerService.class).setAction(action);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 31) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getService(this, action.hashCode(), i, flags);
    }

    private PendingIntent contentIntent() {
        Intent launch = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (launch == null) launch = new Intent();
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 31) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getActivity(this, 1, launch, flags);
    }

    private void bringAppToForeground() {
        Intent launch = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (launch != null) {
            launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            try { startActivity(launch); } catch (Exception ignored) {}
        }
    }

    private void emitRestAdjusted() {
        WorkoutTimerPlugin.emit("rest_adjusted", null, restEndTime, restTotalSeconds);
    }

    private void createChannels() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            // One HIGH-importance channel: it CAN buzz, but normal updates pass
            // setSilent(true) so only the rest-over moment makes noise.
            NotificationChannel main = new NotificationChannel(
                    CHANNEL_MAIN, "Workout timer", NotificationManager.IMPORTANCE_HIGH);
            main.setShowBadge(false);
            nm.createNotificationChannel(main);
        }
    }

    private static String formatMMSS(long totalSecs) {
        long s = Math.max(0, totalSecs);
        return String.format("%02d:%02d", s / 60, s % 60);
    }

    private static String formatElapsed(long totalSecs) {
        long s = Math.max(0, totalSecs);
        long h = s / 3600, m = (s % 3600) / 60, sec = s % 60;
        if (h > 0) return String.format("%d:%02d:%02d", h, m, sec);
        return String.format("%d:%02d", m, sec);
    }

    private static String orEmpty(String s) { return s == null ? "" : s; }
    private static String safe(String s) { return (s == null || s.isEmpty()) ? "Workout" : s; }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onDestroy() {
        stopTicking();
        super.onDestroy();
    }
}
