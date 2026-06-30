/**
 * Native (Capacitor) implementation of NotificationService.
 *
 * Talks to the custom `WorkoutTimer` plugin (android/.../WorkoutTimerPlugin.java),
 * which runs an Android foreground service that owns an ongoing notification and
 * ticks the rest countdown natively. Unlike the web version this supports a true
 * ongoing notification, 3 action buttons, and reliable background ticking.
 */

import { registerPlugin } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import type {
  NotificationService,
  NotificationEvent,
  NotificationPermissionState,
  RestInfo,
  RestSnapshot,
  TrackingInfo,
} from "./types";

interface WorkoutTimerPlugin {
  requestNotificationPermission(): Promise<{ granted: boolean }>;
  // Epoch-ms values are passed as strings (Capacitor drops large JS integers).
  showTracking(info: { workoutStartTime: string; exerciseName: string; setLabel: string }): Promise<void>;
  startRest(info: { endTime: string; totalSeconds: number; exerciseName: string; setLabel: string }): Promise<void>;
  endSession(): Promise<void>;
  setAppVisibility(options: { visible: boolean }): Promise<void>;
  getActiveRest(): Promise<{
    active: boolean;
    endTime?: number;
    totalSeconds?: number;
    exerciseName?: string;
    setLabel?: string;
  }>;
  addListener(
    eventName: "workoutTimerEvent",
    listener: (data: { type: string; endTime?: number; totalSeconds?: number }) => void
  ): Promise<PluginListenerHandle>;
}

const WorkoutTimer = registerPlugin<WorkoutTimerPlugin>("WorkoutTimer");

export class NativeNotificationService implements NotificationService {
  private handlers = new Set<(event: NotificationEvent) => void>();
  private listenerHandle: PluginListenerHandle | null = null;
  private granted = true;

  isSupported(): boolean {
    return true;
  }

  getPermission(): NotificationPermissionState {
    return this.granted ? "granted" : "denied";
  }

  async requestPermission(): Promise<NotificationPermissionState> {
    try {
      const res = await WorkoutTimer.requestNotificationPermission();
      this.granted = !!res.granted;
      return this.granted ? "granted" : "denied";
    } catch {
      return "denied";
    }
  }

  async showTracking(info: TrackingInfo): Promise<void> {
    await this.ensureListener();
    try {
      await WorkoutTimer.showTracking({
        workoutStartTime: String(info.workoutStartTime),
        exerciseName: info.exerciseName,
        setLabel: info.setLabel,
      });
    } catch (e) {
      console.warn("[notifications] native showTracking failed:", e);
    }
  }

  async startRest(info: RestInfo): Promise<void> {
    await this.ensureListener();
    try {
      await WorkoutTimer.startRest({
        endTime: String(info.endTime),
        totalSeconds: info.totalSeconds,
        exerciseName: info.exerciseName,
        setLabel: info.setLabel,
      });
    } catch (e) {
      console.warn("[notifications] native startRest failed:", e);
    }
  }

  async endSession(): Promise<void> {
    try {
      await WorkoutTimer.endSession();
    } catch (e) {
      console.warn("[notifications] native endSession failed:", e);
    }
  }

  setAppVisibility(visible: boolean): void {
    void WorkoutTimer.setAppVisibility({ visible }).catch(() => {});
  }

  async getActiveRest(): Promise<RestSnapshot | null> {
    try {
      const r = await WorkoutTimer.getActiveRest();
      if (!r || !r.active || !r.endTime || r.endTime <= Date.now()) return null;
      return {
        endTime: r.endTime,
        totalSeconds: r.totalSeconds || 90,
        exerciseName: r.exerciseName || "",
        setLabel: r.setLabel || "",
      };
    } catch {
      return null;
    }
  }

  onEvent(handler: (event: NotificationEvent) => void): () => void {
    this.handlers.add(handler);
    void this.ensureListener();
    return () => {
      this.handlers.delete(handler);
      // (o7) Tear the native plugin listener down once nobody's subscribed, so
      // it doesn't dangle for the app's lifetime; ensureListener re-arms it if a
      // new subscriber arrives.
      if (this.handlers.size === 0) void this.teardownListener();
    };
  }

  private async ensureListener(): Promise<void> {
    if (this.listenerHandle) return;
    try {
      this.listenerHandle = await WorkoutTimer.addListener("workoutTimerEvent", (data) => {
        const evt = this.toEvent(data);
        if (evt) for (const h of this.handlers) h(evt);
      });
    } catch (e) {
      console.warn("[notifications] native addListener failed:", e);
    }
  }

  private async teardownListener(): Promise<void> {
    const handle = this.listenerHandle;
    this.listenerHandle = undefined;
    if (handle) {
      try { await handle.remove(); } catch (e) { /* listener already gone */ }
    }
  }

  private toEvent(data: {
    type: string;
    endTime?: number;
    totalSeconds?: number;
  }): NotificationEvent | null {
    switch (data.type) {
      case "rest_finished":
        return { type: "rest_finished" };
      case "rest_skipped":
        return { type: "rest_skipped" };
      case "rest_adjusted":
        return {
          type: "rest_adjusted",
          endTime: Number(data.endTime) || Date.now(),
          totalSeconds: Number(data.totalSeconds) || 90,
        };
      case "set_completed":
        return { type: "set_completed" };
      case "end_workout":
        return { type: "end_workout" };
      default:
        return null;
    }
  }
}
