/**
 * Entry point for the notification layer.
 *
 * Returns a singleton NotificationService for the current platform. Today that
 * is always the web/service-worker implementation. After the Capacitor
 * migration (step 2), this is the single place to branch:
 *
 *   import { Capacitor } from "@capacitor/core";
 *   if (Capacitor.isNativePlatform()) return new NativeNotificationService();
 *
 * Nothing else in the app needs to change to gain native notifications.
 */

import { Capacitor } from "@capacitor/core";
import type { NotificationService } from "./types";
import { WebNotificationService } from "./webNotificationService";
import { NativeNotificationService } from "./nativeNotificationService";

let instance: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!instance) {
    instance = Capacitor.isNativePlatform()
      ? new NativeNotificationService()
      : new WebNotificationService();
  }
  return instance;
}

export type {
  NotificationService,
  NotificationEvent,
  NotificationActionType,
  NotificationPermissionState,
  RestInfo,
  RestSnapshot,
  TrackingInfo,
} from "./types";
