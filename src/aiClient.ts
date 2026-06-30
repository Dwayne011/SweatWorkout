/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Single place every AI call goes through. Holds the absolute backend base URL,
 * attaches the Firebase ID token, and never runs response.json() on an HTML
 * body. The Gemini key lives only on the server; the client never sees it.
 *
 * The coach request/response shapes live here too, so they are easy to change
 * once the backend lands.
 */
import { auth } from "./firebase";

// Absolute backend base URL. On the web the app and the API share an origin, so
// a relative path works and an empty base is fine. In the Capacitor (native)
// build the WebView origin is the bundled app, so a relative `/api/...` path
// resolves to index.html and returns HTML, not JSON ("Unexpected token '<'").
// Native builds MUST set VITE_API_BASE_URL to the deployed backend URL.
export const API_BASE_URL: string = ((import.meta as any).env?.VITE_API_BASE_URL || "").trim();

export function isNativeApp(): boolean {
  return typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform?.() === true;
}

export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  return base ? `${base}${path}` : path;
}

/** Bearer header for the current user, or {} when signed out. */
export async function getAuthHeader(): Promise<Record<string, string>> {
  const user = auth?.currentUser;
  if (!user) return {};
  try {
    return { Authorization: `Bearer ${await user.getIdToken()}` };
  } catch {
    return {};
  }
}

export type AiErrorCode = "not_configured" | "auth_required" | "network" | "error";

export class AiError extends Error {
  code: AiErrorCode;
  constructor(code: AiErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

/** POST JSON to an AI endpoint with the ID token, returning parsed JSON or throwing AiError. */
export async function aiFetch<T = any>(path: string, body: unknown): Promise<T> {
  // Native build with no absolute base -> the relative path hits the SPA shell.
  if (isNativeApp() && !API_BASE_URL) {
    throw new AiError("not_configured", "The coach backend URL is not set for this build yet.");
  }
  const user = auth?.currentUser;
  if (!user) throw new AiError("auth_required", "Sign in to use the coach features.");

  let token: string;
  try {
    token = await user.getIdToken();
  } catch {
    throw new AiError("auth_required", "Sign in to use the coach features.");
  }

  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new AiError("network", "Could not reach the coach. Check your connection.");
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // The static host returned HTML (the SPA shell), not the backend JSON.
    throw new AiError("not_configured", "The coach backend is not reachable from this build.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const code = (data && data.error) || "error";
    const message = (data && (data.message || data.error)) || "The coach request failed.";
    if (res.status === 503 || code === "not_configured") throw new AiError("not_configured", message);
    if (res.status === 401 || code === "auth_required" || code === "auth_invalid") throw new AiError("auth_required", message);
    throw new AiError("error", String(message));
  }
  return data as T;
}

// ---- Coach request/response shapes (the one shared place) ----
// TODO(data-model): the request payloads carry the deterministic metrics the
// client already computes (set counts, group intensities, previous bests,
// volume, durations). The model only interprets them, it never recomputes.
export interface CoachWorkoutResp { summary: string }
export interface CoachAlltimeResp { readout: string }
export interface CoachNotesResp { notes: { title: string; body: string }[] }

// (o8a) The coach reads the athlete profile. Inject it centrally here so every
// coach call (CoachAnalysis, WorkoutOverviewPopout, InsightsTrends) carries it
// without each caller threading it through. Snapshot from the same localStorage
// key useWorkoutState persists to.
function storedProfile(): unknown {
  try {
    const s = localStorage.getItem("projectpb_user_profile");
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export const coachWorkout = (payload: unknown) => aiFetch<CoachWorkoutResp>("/api/ai/coach", { kind: "workout", payload, profile: storedProfile() });
export const coachAlltime = (payload: unknown) => aiFetch<CoachAlltimeResp>("/api/ai/coach", { kind: "alltime", payload, profile: storedProfile() });
export const coachNotes = (payload: unknown) => aiFetch<CoachNotesResp>("/api/ai/coach", { kind: "notes", payload, profile: storedProfile() });
