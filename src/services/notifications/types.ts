/**
 * Platform-agnostic workout notification contract.
 *
 * The active-workout UI talks to *this* interface, never to the service worker
 * (or, later, a native plugin) directly. Today the only implementation is the
 * web/service-worker backed one in `webNotificationService.ts`. When the app is
 * wrapped with Capacitor (step 2 of the native migration), a
 * `NativeNotificationService` can implement the same interface — backed by an
 * Android foreground service and an iOS Live Activity — and be swapped in via
 * `getNotificationService()` with zero changes to the React components.
 *
 * Core principle that this contract enforces:
 *   "set completed" (a user action) and "rest timer expired" (just an alert)
 *   are different events. Expiry NEVER advances the workout — it only alerts and
 *   returns to the tracking state. The app owns all workout/set progression.
 */

/** Permission status, with an extra value for platforms/browsers without the API. */
export type NotificationPermissionState = NotificationPermission | "unsupported";

/** Info shown while the user is working a set (the persistent "tracking" notification). */
export interface TrackingInfo {
  /** Epoch ms the workout session started — used to render elapsed duration. */
  workoutStartTime: number;
  /** Current exercise name, e.g. "Dumbbell Bench Press". */
  exerciseName: string;
  /** Human label for the set the user is on, e.g. "Set 2 of 4". */
  setLabel: string;
}

/** Info shown while a rest timer is counting down. */
export interface RestInfo {
  /** Absolute epoch ms when the rest period ends. */
  endTime: number;
  /** Total rest duration in seconds (for progress display). */
  totalSeconds: number;
  /** The exercise the user is resting before. */
  exerciseName: string;
  /** Label of the upcoming set, e.g. "Set 2 of 4". */
  setLabel: string;
}

/** Authoritative snapshot of an in-progress rest, read back from the renderer. */
export interface RestSnapshot extends RestInfo {}

/**
 * Actions that can originate *from* a notification (Android lock-screen buttons).
 * These only ever affect the rest timer — completing a set is done in-app, so
 * the notification layer never mutates workout/set state.
 */
export type NotificationActionType = "add_30" | "sub_30" | "skip_rest";

/** Events the notification layer emits back to the app. */
export type NotificationEvent =
  /** Rest countdown reached zero on its own. App should return to tracking. */
  | { type: "rest_finished" }
  /** User skipped rest (lock-screen "Skip" button). App should return to tracking. */
  | { type: "rest_skipped" }
  /** Rest length changed via a lock-screen +/- button. App should sync its timer. */
  | { type: "rest_adjusted"; endTime: number; totalSeconds: number };

export interface NotificationService {
  /** Whether notifications are available at all on this platform/browser. */
  isSupported(): boolean;

  /** Current permission state without prompting. */
  getPermission(): NotificationPermissionState;

  /** Prompt for permission if not already decided. Safe to call repeatedly. */
  requestPermission(): Promise<NotificationPermissionState>;

  /** Begin/refresh the persistent tracking notification (session start or between sets). */
  showTracking(info: TrackingInfo): Promise<void>;

  /** Switch to a live rest countdown (called when the user completes a set). */
  startRest(info: RestInfo): Promise<void>;

  /** Tear down all workout notifications (finish or discard). */
  endSession(): Promise<void>;

  /**
   * Tell the renderer whether the app is currently foreground/visible. While
   * visible, the renderer avoids per-second notification churn (the in-app UI
   * shows the live timer); while hidden it keeps the lock-screen notification
   * ticking.
   */
  setAppVisibility(visible: boolean): void;

  /**
   * Read the renderer's authoritative rest state (e.g. after the app was
   * backgrounded and a lock-screen +/- button changed the end-time). Returns
   * null if no rest is currently active. Used to reconcile the app's timer.
   */
  getActiveRest(): Promise<RestSnapshot | null>;

  /**
   * Subscribe to events coming back from the notification layer.
   * Returns an unsubscribe function.
   */
  onEvent(handler: (event: NotificationEvent) => void): () => void;
}
