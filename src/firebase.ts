/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

let app;
export let db: Firestore | null = null;
export let auth: Auth | null = null;
export let isFirebaseReady = false;

if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "") {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    isFirebaseReady = true;
    console.log("Firebase initialized successfully with dynamic config.");
  } catch (error) {
    console.error("Failed to initialize Firebase", error);
  }
} else {
  console.log("No Firebase config detected. Operating in safe client-side Offline/LocalStorage fallback mode.");
}

// Error handling helper as mandated by the Firebase skill
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function buildFirestoreErrorInfo(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  return {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = buildFirestoreErrorInfo(error, operationType, path);
  console.error("Firestore Exception Details: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Non-throwing variant for live onSnapshot error callbacks. Those fire
// asynchronously, so throwing there becomes an UNCAUGHT error that disrupts the
// app — when a collection is denied or unavailable, live sync should just
// degrade to local-only, not crash. Logs the same diagnostics without throwing.
export function logFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = buildFirestoreErrorInfo(error, operationType, path);
  console.warn("Firestore live sync degraded to local-only: ", JSON.stringify(errInfo));
}
