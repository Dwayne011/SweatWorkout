/**
 * Web (service-worker) implementation of NotificationService.
 *
 * Responsibilities:
 *  - Translate the high-level contract into postMessage commands for sw.js.
 *  - Surface notification-originated events (rest finished / skipped / adjusted)
 *    via a BroadcastChannel back to the app.
 *
 * It deliberately knows nothing about workout/set progression — it only renders
 * tracking vs. resting notifications and relays rest-timer events. All workout
 * advancement stays in the React layer.
 */

import type {
  NotificationService,
  NotificationEvent,
  NotificationPermissionState,
  RestInfo,
  RestSnapshot,
  TrackingInfo,
} from "./types";

/** Shared name for the SW <-> app event channel. Must match sw.js. */
export const TIMER_SYNC_CHANNEL = "sw3at-timer-sync";

// IndexedDB coordinates — must match the persistence in sw.js.
const DB_NAME = "WorkoutTimerDB";
const STORE_NAME = "workoutState";
const STATE_KEY = "notif-engine-state";

/** Read the service worker's persisted engine state directly from IndexedDB. */
function readEngineState(): Promise<any | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      };
      req.onsuccess = (e: any) => {
        const db = e.target.result;
        try {
          const tx = db.transaction(STORE_NAME, "readonly");
          const getReq = tx.objectStore(STORE_NAME).get(STATE_KEY);
          getReq.onsuccess = () => resolve(getReq.result ? getReq.result.value : null);
          getReq.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function detectPlatform(): "ios" | "android" {
  if (typeof navigator === "undefined") return "android";
  const ua = navigator.userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS reports as MacIntel but has touch points
    ((navigator as any).platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
  return isIOS ? "ios" : "android";
}

export class WebNotificationService implements NotificationService {
  private channel: BroadcastChannel | null = null;
  private handlers = new Set<(event: NotificationEvent) => void>();
  private platform = detectPlatform();

  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator
    );
  }

  getPermission(): NotificationPermissionState {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    return Notification.permission;
  }

  async requestPermission(): Promise<NotificationPermissionState> {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    if (Notification.permission !== "default") return Notification.permission;
    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  }

  /** Lazily open the broadcast channel and start relaying SW events. */
  private ensureChannel() {
    if (this.channel || typeof BroadcastChannel === "undefined") return;
    this.channel = new BroadcastChannel(TIMER_SYNC_CHANNEL);
    this.channel.onmessage = (event) => {
      const data = event.data as NotificationEvent | { type?: string } | null;
      if (!data || typeof data.type !== "string") return;
      if (
        data.type === "rest_finished" ||
        data.type === "rest_skipped" ||
        data.type === "rest_adjusted"
      ) {
        for (const handler of this.handlers) handler(data as NotificationEvent);
      }
    };
  }

  /** Post a command to the active service worker (no-op if SW unavailable). */
  private async post(message: Record<string, unknown>): Promise<void> {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg.active) {
        reg.active.postMessage({ ...message, platform: this.platform });
      }
    } catch (err) {
      console.warn("[notifications] service worker command failed:", err);
    }
  }

  async showTracking(info: TrackingInfo): Promise<void> {
    this.ensureChannel();
    await this.post({
      type: "SHOW_TRACKING",
      workoutStartTime: info.workoutStartTime,
      exerciseName: info.exerciseName,
      setLabel: info.setLabel,
    });
  }

  async startRest(info: RestInfo): Promise<void> {
    this.ensureChannel();
    await this.post({
      type: "START_REST",
      endTime: info.endTime,
      totalSeconds: info.totalSeconds,
      exerciseName: info.exerciseName,
      setLabel: info.setLabel,
    });
  }

  async endSession(): Promise<void> {
    await this.post({ type: "END_SESSION" });
  }

  setAppVisibility(visible: boolean): void {
    // Fire-and-forget; the SW persists this so it survives a worker restart.
    void this.post({ type: "APP_VISIBILITY", visible });
  }

  async getActiveRest(): Promise<RestSnapshot | null> {
    const state = await readEngineState();
    if (!state || state.mode !== "resting") return null;
    const endTime = Number(state.restEndTime);
    if (!endTime || endTime <= Date.now()) return null;
    return {
      endTime,
      totalSeconds: Number(state.restTotalSeconds) || 90,
      exerciseName: state.exerciseName || "",
      setLabel: state.setLabel || "",
    };
  }

  onEvent(handler: (event: NotificationEvent) => void): () => void {
    this.ensureChannel();
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }
}
