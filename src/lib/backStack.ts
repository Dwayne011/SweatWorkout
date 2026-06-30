/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * A small LIFO registry of "back" interceptors (o4). Any dismissible overlay or
 * sheet registers a handler while it is open; the global back action — Android
 * hardware back (@capacitor/app) and the web popstate sentinel, both wired in
 * App.tsx — runs the topmost interceptor first. An interceptor that handles the
 * back returns true (or nothing) and navigation stops there; returning false
 * passes the back down to the next one, and finally to the tab back-stack.
 */
import { useEffect, useRef } from "react";

type BackHandler = () => boolean | void;

const handlers: BackHandler[] = [];

/** Register a back interceptor. Returns an unregister function. */
export function pushBackHandler(handler: BackHandler): () => void {
  handlers.push(handler);
  return () => {
    const i = handlers.lastIndexOf(handler);
    if (i >= 0) handlers.splice(i, 1);
  };
}

/** Run the topmost interceptor that claims the back. Returns true if one did. */
export function runTopBackHandler(): boolean {
  for (let i = handlers.length - 1; i >= 0; i--) {
    if (handlers[i]() !== false) return true;
  }
  return false;
}

/**
 * Register `onBack` as a back interceptor while `active` is true. The latest
 * `onBack` is always used, so callers don't need to memoise it.
 */
export function useBackHandler(active: boolean, onBack: () => void): void {
  const ref = useRef(onBack);
  ref.current = onBack;
  useEffect(() => {
    if (!active) return;
    return pushBackHandler(() => {
      ref.current();
    });
  }, [active]);
}
