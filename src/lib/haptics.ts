// Centralised haptics. POLICY (o1): the app buzzes ONLY for the rest countdown.
// Every method here except `countdownPulse` and `timerDone` is a no-op, and the
// scattered raw `navigator.vibrate(...)` calls across the UI are neutralised
// globally in main.tsx. So the only haptics left are the last-five-seconds
// pulse and the buzz at zero, both on the rest timer. On device these use
// Capacitor Haptics; the web Vibration API is intentionally off.
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

const canVibrate = () => typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

async function impact(style: ImpactStyle, fallbackMs: number) {
  try {
    await Haptics.impact({ style });
  } catch {
    if (canVibrate()) navigator.vibrate(fallbackMs);
  }
}

async function notify(type: NotificationType, fallback: number | number[]) {
  try {
    await Haptics.notification({ type });
  } catch {
    if (canVibrate()) navigator.vibrate(fallback);
  }
}

const noop = () => {};

export const haptics = {
  /** Rest countdown — a tick each of the last five seconds. (kept) */
  countdownPulse: () => impact(ImpactStyle.Medium, 120),
  /** Rest countdown — the buzz at zero. (kept) */
  timerDone: () => notify(NotificationType.Warning, [400, 100, 400]),

  // Everything below is intentionally silent (o1). Call sites stay so the
  // intent is documented; the effect is gone. Re-enable a line to bring one back.
  pageCommit: noop,
  swipeThreshold: noop,
  deleteCommit: noop,
  setComplete: noop,
  setTypeCycle: noop,
  finishWorkout: noop,
  discardConfirm: noop,
};

export type Haptics = typeof haptics;
