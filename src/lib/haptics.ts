// Centralised haptics. Every firing point in the app routes through a named
// method here, so the intensities live in exactly one place and are easy to
// audit. Restraint is the rule: a haptic marks a moment of consequence, never a
// routine tap (scrolling, opening menus/pickers, typing, ordinary buttons,
// expanding notes, or nav taps that don't change page must stay silent).
//
// Uses Capacitor Haptics on device; falls back to navigator.vibrate on the web.
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

export const haptics = {
  /** A single light tick the instant a swipe or tap commits to a new page. */
  pageCommit: () => impact(ImpactStyle.Light, 8),
  /** Light tick when a swipe row crosses the point where releasing will delete. */
  swipeThreshold: () => impact(ImpactStyle.Light, 10),
  /** Firmer tick on the actual delete. */
  deleteCommit: () => impact(ImpactStyle.Medium, 18),
  /** Confirm — checking the done-box on a set. */
  setComplete: () => impact(ImpactStyle.Light, 10),
  /** Success-style notification on finishing a workout. */
  finishWorkout: () => notify(NotificationType.Success, [12, 40, 18]),
  /** One medium tick confirming Discard in the dialog. */
  discardConfirm: () => impact(ImpactStyle.Medium, 16),
  /** Notification haptic when the rest timer hits zero. */
  timerDone: () => notify(NotificationType.Warning, [400, 100, 400]),
};

export type Haptics = typeof haptics;
