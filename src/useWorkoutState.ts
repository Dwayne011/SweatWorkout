// Author: Google AI Studio Coding Agent
// OS support: All (Web, Android, iOS)
// Description: Custom React hook managing complete workout logic, user weights, sheets syncing, and database state.

import { useState, useEffect, useCallback } from "react";
import {
  Exercise,
  WorkoutSession,
  WorkoutSet,
  WorkoutExercise,
  ChatMessage,
  SetType,
  AIAction,
  UserProfile,
} from "./types";
import { defaultExercises } from "./defaultExercises";
import { specialRoutinesExercises, DEFAULT_ROUTINES } from "./specialExercises";
import { db, auth, isFirebaseReady, handleFirestoreError, OperationType } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

// Helper to generate a friendly tracking ID
export const generateId = () => Math.random().toString(36).substring(2, 11);

// Helper to recursively strip undefined fields from objects before writing to Firestore
function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined) as unknown as T;
  }
  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        cleaned[key] = cleanUndefined(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

export function useWorkoutState() {
  const [exercises, setExercises] = useState<Exercise[]>([...defaultExercises, ...specialRoutinesExercises]);
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<WorkoutSession[]>([]);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem("sw3at_user_profile");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Google Sheets Sync Configuration
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  const updateUserProfile = useCallback((profile: UserProfile) => {
    try {
      localStorage.setItem("sw3at_user_profile", JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save user profile:", e);
    }
    setUserProfile(profile);
  }, []);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem("sw3at_spreadsheet_id");
  });
  const [isSheetsSyncEnabled, setIsSheetsSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem("sw3at_sheets_sync_enabled") === "true";
  });

  // Monitor Auth Changes
  useEffect(() => {
    if (isFirebaseReady && auth) {
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  // Load from local storage initially
  useEffect(() => {
    const localEx = localStorage.getItem("workout_tracker_custom_exercises");
    const localTemplates = localStorage.getItem("workout_tracker_templates");
    const localHistory = localStorage.getItem("workout_tracker_history");
    const localActive = localStorage.getItem("workout_tracker_active_workout");
    const localNotes = localStorage.getItem("workout_tracker_exercise_notes");

    if (localEx) {
      try {
        const parsed = JSON.parse(localEx);
        const customFiltered = parsed.filter(
          (cx: any) => !specialRoutinesExercises.some((sx) => sx.id === cx.id)
        );
        setExercises([...defaultExercises, ...specialRoutinesExercises, ...customFiltered]);
      } catch (e) {
        console.error(e);
      }
    } else {
      setExercises([...defaultExercises, ...specialRoutinesExercises]);
    }
    if (localTemplates) {
      try {
        const parsed = JSON.parse(localTemplates);
        const merged = [...parsed];
        DEFAULT_ROUTINES.forEach((defR) => {
          if (!merged.some((t) => t.name.toLowerCase() === defR.name.toLowerCase() || t.id === defR.id)) {
            merged.push(defR);
          }
        });
        setTemplates(merged);
        saveToLocal("workout_tracker_templates", merged);
      } catch (e) {
        console.error(e);
      }
    } else {
      setTemplates(DEFAULT_ROUTINES);
      saveToLocal("workout_tracker_templates", DEFAULT_ROUTINES);
    }
    if (localHistory) {
      try {
        setHistory(JSON.parse(localHistory));
      } catch (e) {
        console.error(e);
      }
    }
    if (localActive) {
      try {
        setActiveWorkout(JSON.parse(localActive));
      } catch (e) {
        console.error(e);
      }
    }
    if (localNotes) {
      try {
        setExerciseNotes(JSON.parse(localNotes));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save changes locally
  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Live Sync to/from Firestore if user is authenticated
  useEffect(() => {
    if (!isFirebaseReady || !db || !user) {
      // If signed out, keep standard local storage. Refresh standard states.
      return;
    }

    setIsSyncing(true);

    // Sync Custom Exercises
    const qExercises = query(collection(db, "custom_exercises"), where("userId", "==", user.uid));
    const unsubEx = onSnapshot(
      qExercises,
      (snapshot) => {
        const customEx: Exercise[] = [];
        snapshot.forEach((doc) => {
          customEx.push(doc.data() as Exercise);
        });
        setExercises([...defaultExercises, ...specialRoutinesExercises, ...customEx]);
        setIsSyncing(false);
      },
      (error) => {
        console.error("Exercises sync error:", error);
        setIsSyncing(false);
        handleFirestoreError(error, OperationType.LIST, "custom_exercises");
      }
    );

    // Sync Templates
    const qTemplates = query(collection(db, "templates"), where("userId", "==", user.uid));
    const unsubTemplates = onSnapshot(
      qTemplates,
      (snapshot) => {
        const tps: WorkoutSession[] = [];
        snapshot.forEach((doc) => {
          tps.push(doc.data() as WorkoutSession);
        });
        const merged = [...tps];
        let hasNew = false;
        DEFAULT_ROUTINES.forEach((defR) => {
          if (!merged.some((t) => t.name.toLowerCase() === defR.name.toLowerCase() || t.id === defR.id)) {
            merged.push(defR);
            hasNew = true;
          }
        });
        setTemplates(merged);
        if (hasNew) {
          DEFAULT_ROUTINES.forEach(async (defR) => {
            if (!tps.some((t) => t.name.toLowerCase() === defR.name.toLowerCase() || t.id === defR.id)) {
              try {
                await setDoc(doc(db, "templates", defR.id), cleanUndefined({
                  ...defR,
                  userId: user.uid
                }));
              } catch (e) {
                console.error("Failed to upload default template:", e);
              }
            }
          });
        }
      },
      (error) => {
        console.error("Templates sync error:", error);
        handleFirestoreError(error, OperationType.LIST, "templates");
      }
    );

    // Sync Completed History
    const qHistory = query(collection(db, "workouts"), where("userId", "==", user.uid));
    const unsubHistory = onSnapshot(
      qHistory,
      (snapshot) => {
        const hts: WorkoutSession[] = [];
        snapshot.forEach((doc) => {
          hts.push(doc.data() as WorkoutSession);
        });
        // Sort history by date descending
        const sorted = hts.sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setHistory(sorted);
      },
      (error) => {
        console.error("History sync error:", error);
        handleFirestoreError(error, OperationType.LIST, "workouts");
      }
    );

    // Sync Exercise Notes
    const qNotes = query(collection(db, "exercise_notes"), where("userId", "==", user.uid));
    const unsubNotes = onSnapshot(
      qNotes,
      (snapshot) => {
        const notesMap: Record<string, string> = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.exerciseId && data.notes !== undefined) {
            notesMap[data.exerciseId] = data.notes;
          }
        });
        setExerciseNotes(notesMap);
        saveToLocal("workout_tracker_exercise_notes", notesMap);
      },
      (error) => {
        console.error("Exercise notes sync error:", error);
        handleFirestoreError(error, OperationType.LIST, "exercise_notes");
      }
    );

    // Sync Spreadsheet ID from Cloud
    const unsubSheets = onSnapshot(
      doc(db, "user_sheets", user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          const cloudSpreadsheetId = docSnap.data().spreadsheetId;
          if (cloudSpreadsheetId) {
            setSpreadsheetId(cloudSpreadsheetId);
            localStorage.setItem("sw3at_spreadsheet_id", cloudSpreadsheetId);
          }
        }
      },
      (error) => {
        console.error("Sheets ID cloud sync error:", error);
        handleFirestoreError(error, OperationType.GET, `user_sheets/${user.uid}`);
      }
    );

    return () => {
      unsubEx();
      unsubTemplates();
      unsubHistory();
      unsubNotes();
      unsubSheets();
    };
  }, [user]);

  // Synchronize Active Workout updates locally
  const updateActiveSessionState = useCallback((session: WorkoutSession | null) => {
    setActiveWorkout(session);
    if (session) {
      saveToLocal("workout_tracker_active_workout", session);
    } else {
      localStorage.removeItem("workout_tracker_active_workout");
    }
  }, []);

  // --- MUTATION OPERATIONS ---

  // Custom Exercise Creation
  const addCustomExercise = useCallback(async (name: string, category: string, equipment: string) => {
    const newEx: Exercise = {
      id: "custom-" + generateId(),
      name,
      category,
      equipment,
      isCustom: true,
    };

    // 1. Speculatively update local storage & state so it works instantly!
    const localEx = localStorage.getItem("workout_tracker_custom_exercises");
    const currentList = localEx ? JSON.parse(localEx) : [];
    const updated = [...currentList, newEx];
    saveToLocal("workout_tracker_custom_exercises", updated);
    
    setExercises((prev) => {
      if (prev.some((ex) => ex.id === newEx.id)) return prev;
      return [...prev, newEx];
    });

    // 2. Safely sync to Firestore in background/authenticated
    if (isFirebaseReady && db && user) {
      try {
        await setDoc(doc(db, "custom_exercises", newEx.id), cleanUndefined({
          ...newEx,
          userId: user.uid,
        }));
      } catch (error) {
        console.error("Firestore custom exercise sync error:", error);
        handleFirestoreError(error, OperationType.WRITE, `custom_exercises/${newEx.id}`);
      }
    }
    return newEx;
  }, [user]);

  // Custom Exercise Modification
  const updateCustomExercise = useCallback(async (updatedEx: Exercise) => {
    // 1. Update local storage & state so it works instantly!
    const localEx = localStorage.getItem("workout_tracker_custom_exercises");
    const currentList: Exercise[] = localEx ? JSON.parse(localEx) : [];
    const updatedList = currentList.map((ex) => (ex.id === updatedEx.id ? updatedEx : ex));
    if (!currentList.some((ex) => ex.id === updatedEx.id)) {
      updatedList.push(updatedEx);
    }
    saveToLocal("workout_tracker_custom_exercises", updatedList);

    setExercises((prev) => {
      return prev.map((ex) => (ex.id === updatedEx.id ? updatedEx : ex));
    });

    // 2. Safely sync to Firestore in background/authenticated
    if (isFirebaseReady && db && user) {
      try {
        await setDoc(doc(db, "custom_exercises", updatedEx.id), cleanUndefined({
          ...updatedEx,
          userId: user.uid,
        }));
      } catch (error) {
        console.error("Firestore custom exercise update error:", error);
        handleFirestoreError(error, OperationType.WRITE, `custom_exercises/${updatedEx.id}`);
      }
    }
  }, [user]);

  // Bulk Import of Custom Exercises
  const importCustomExercises = useCallback(async (imported: Exercise[]) => {
    const localEx = localStorage.getItem("workout_tracker_custom_exercises");
    const currentList: Exercise[] = localEx ? JSON.parse(localEx) : [];
    
    // Merge without duplicating IDs
    const mergedList = [...currentList];
    const incomingValid = imported.map(ex => ({
      ...ex,
      id: ex.id && ex.id.startsWith("custom-") ? ex.id : "custom-" + generateId(),
      isCustom: true
    }));

    incomingValid.forEach((ex) => {
      const idx = mergedList.findIndex((item) => item.id === ex.id || item.name.toLowerCase() === ex.name.toLowerCase());
      if (idx > -1) {
        mergedList[idx] = { ...mergedList[idx], ...ex };
      } else {
        mergedList.push(ex);
      }
    });

    saveToLocal("workout_tracker_custom_exercises", mergedList);

    setExercises((prev) => {
      const basic = prev.filter(ex => !ex.isCustom);
      return [...basic, ...mergedList];
    });

    // Upload to Firestore if logged in
    if (isFirebaseReady && db && user) {
      try {
        for (const ex of incomingValid) {
          await setDoc(doc(db, "custom_exercises", ex.id), cleanUndefined({
            ...ex,
            userId: user.uid,
          }));
        }
      } catch (error) {
        console.error("Firestore custom exercises import error:", error);
      }
    }
  }, [user]);

  // Start a new Workout Session (Active)
  const startWorkout = useCallback((name: string, templateId?: string, presetExercises?: { exerciseId: string; sets: { weight: number; reps: number; type: SetType }[] }[]) => {
    // If workout already in progress, don't override unilaterally without saving
    let initialExercises: WorkoutExercise[] = [];

    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        initialExercises = template.exercises.map((ex) => {
          let bWeight = ex.barWeight;
          if (bWeight === undefined) {
            const exerciseDef = exercises.find((v) => v.id === ex.exerciseId);
            if (exerciseDef) {
              const equip = (exerciseDef.equipment || "").toLowerCase();
              if (equip.includes("barbell")) {
                bWeight = 20;
              } else if (equip.includes("ez-bar") || equip.includes("ez bar")) {
                bWeight = 10;
              } else if (equip.includes("smith")) {
                bWeight = 15;
              }
            }
          }
          return {
            ...ex,
            id: generateId(),
            barWeight: bWeight,
            sets: ex.sets.map((s) => ({ ...s, id: generateId(), isCompleted: false })),
          };
        });
        name = template.name;
      }
    } else if (presetExercises) {
      initialExercises = presetExercises.map((ex) => {
        const exerciseDef = exercises.find((v) => v.id === ex.exerciseId);
        let defaultBarWeight = 0;
        if (exerciseDef) {
          const equip = (exerciseDef.equipment || "").toLowerCase();
          if (equip.includes("barbell")) {
            defaultBarWeight = 20;
          } else if (equip.includes("ez-bar") || equip.includes("ez bar")) {
            defaultBarWeight = 10;
          } else if (equip.includes("smith")) {
            defaultBarWeight = 15;
          }
        }
        return {
          id: generateId(),
          exerciseId: ex.exerciseId,
          barWeight: defaultBarWeight,
          sets: ex.sets.map((s) => ({
            id: generateId(),
            weight: s.weight,
            reps: s.reps,
            type: s.type,
            isCompleted: false,
          })),
        };
      });
    }

    const newSession: WorkoutSession = {
      id: generateId(),
      name: name || "Empty Workout",
      startTime: new Date().toISOString(),
      exercises: initialExercises,
    };

    updateActiveSessionState(newSession);
  }, [templates, updateActiveSessionState]);

  // Cancel/Discard active workout
  const discardWorkout = useCallback(() => {
    updateActiveSessionState(null);
  }, [updateActiveSessionState]);

  // Save/Log current active workout to completed history
  const finishWorkout = useCallback(async () => {
    if (!activeWorkout) return;

    const completedSession: WorkoutSession = {
      ...activeWorkout,
      exercises: (activeWorkout.exercises || [])
        .map((ex) => {
          const finishedSets = (ex.sets || []).filter((s) => s.isCompleted);
          return {
            ...ex,
            sets: finishedSets.map((s) => ({
              ...s,
              type: s.type || "normal",
            })),
          };
        })
        .filter((ex) => ex.sets.length > 0),
      endTime: new Date().toISOString(),
    };

    if (isFirebaseReady && db && user) {
      try {
        await setDoc(doc(db, "workouts", completedSession.id), cleanUndefined({
          ...completedSession,
          userId: user.uid,
        }));
      } catch (error) {
        console.error("Firestore save workout error, falling back to local storage:", error);
      }
    }

    // Always update local history so the user has immediate access to their completed log
    // and as an offline/failure fallback
    const updatedHistory = [completedSession, ...history.filter(h => h.id !== completedSession.id)];
    setHistory(updatedHistory);
    saveToLocal("workout_tracker_history", updatedHistory);

    // Google Sheets Auto Sync
    if (isSheetsSyncEnabled && googleAccessToken && spreadsheetId) {
      import("./googleSheetsService").then((module) => {
        module.appendWorkoutToSheet(googleAccessToken, spreadsheetId, completedSession, exercises);
      }).catch(err => {
        console.error("Failed to append completed workout to Google Sheet automatically:", err);
      });
    }

    updateActiveSessionState(null);
  }, [activeWorkout, history, user, updateActiveSessionState, isSheetsSyncEnabled, googleAccessToken, spreadsheetId, exercises]);

  // Log a raw completed workout directly (e.g. historical log via Gemini command)
  const logWorkoutDirectly = useCallback(async (params: {
    name: string;
    date?: string;
    exercises: { exerciseId: string; sets: { weight: number; reps: number; type: SetType; isCompleted: boolean }[] }[];
    notes?: string;
  }) => {
    const sessionDate = params.date ? new Date(params.date).toISOString() : new Date().toISOString();
    
    // Create detailed WorkoutExercises
    const parsedOps: WorkoutExercise[] = params.exercises.map((ex) => ({
      id: generateId(),
      exerciseId: ex.exerciseId,
      sets: ex.sets.map((s) => ({
        id: generateId(),
        weight: s.weight,
        reps: s.reps,
        type: s.type || "normal",
        isCompleted: s.isCompleted !== undefined ? s.isCompleted : true,
      })),
    }));

    const session: WorkoutSession = {
      id: generateId(),
      name: params.name,
      startTime: sessionDate,
      endTime: new Date(new Date(sessionDate).getTime() + 45 * 60 * 1000).toISOString(), // mock 45m length
      exercises: parsedOps,
      notes: params.notes,
    };

    if (isFirebaseReady && db && user) {
      try {
        await setDoc(doc(db, "workouts", session.id), cleanUndefined({
          ...session,
          userId: user.uid,
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `workouts/${session.id}`);
      }
    } else {
      const updated = [session, ...history];
      setHistory(updated);
      saveToLocal("workout_tracker_history", updated);
    }

    // Google Sheets Sync for directly logged workouts (e.g. via AI)
    if (isSheetsSyncEnabled && googleAccessToken && spreadsheetId) {
      import("./googleSheetsService").then((module) => {
        module.appendWorkoutToSheet(googleAccessToken, spreadsheetId, session, exercises);
      }).catch(err => {
        console.error("Failed to append directly logged workout to Google Sheet automatically:", err);
      });
    }
  }, [history, user, isSheetsSyncEnabled, googleAccessToken, spreadsheetId, exercises]);

  const createTemplate = useCallback(async (name: string, routineExercises: { exerciseId: string; sets: { weight: number; reps: number; type: SetType }[] }[], notes?: string) => {
    const newTemplate: WorkoutSession = {
      id: "template-" + generateId(),
      name,
      startTime: new Date().toISOString(),
      notes,
      exercises: routineExercises.map((e) => ({
        id: generateId(),
        exerciseId: e.exerciseId,
        sets: e.sets.map((s) => ({
          id: generateId(),
          weight: s.weight,
          reps: s.reps,
          type: s.type,
          isCompleted: false,
        })),
      })),
      isTemplate: true,
    };

    const updated = [...templates.filter(t => t.id !== newTemplate.id), newTemplate];
    setTemplates(updated);
    saveToLocal("workout_tracker_templates", updated);

    if (isFirebaseReady && db && user) {
      try {
        await setDoc(doc(db, "templates", newTemplate.id), cleanUndefined({
          ...newTemplate,
          userId: user.uid,
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `templates/${newTemplate.id}`);
      }
    }
    return newTemplate;
  }, [templates, user]);

  // Delete Template
  const deleteTemplate = useCallback(async (templateId: string) => {
    if (isFirebaseReady && db && user) {
      try {
        await deleteDoc(doc(db, "templates", templateId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `templates/${templateId}`);
      }
    } else {
      const updated = templates.filter((t) => t.id !== templateId);
      setTemplates(updated);
      saveToLocal("workout_tracker_templates", updated);
    }
  }, [templates, user]);

  // Delete Logged History Workout
  const deleteHistoryLog = useCallback(async (logId: string) => {
    if (isFirebaseReady && db && user) {
      try {
        await deleteDoc(doc(db, "workouts", logId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `workouts/${logId}`);
      }
    } else {
      const updated = history.filter((h) => h.id !== logId);
      setHistory(updated);
      saveToLocal("workout_tracker_history", updated);
    }
  }, [history, user]);

  // Adding single Exercise instance to active session
  const addExerciseToActiveWorkout = useCallback((exerciseId: string) => {
    if (!activeWorkout) return;

    // Check if exercise already present to avoid duplication noise
    if (activeWorkout.exercises.some((ex) => ex.exerciseId === exerciseId)) {
      return;
    }

    // Attempt to recover weight/reps memory from last logged occurrence of this exercise
    let lastLoggedWeight = 0;
    let lastLoggedReps = 0;
    let lastLoggedType: SetType = "normal";
    let foundMemory = false;

    for (const session of history) {
      const match = session.exercises.find((e) => e.exerciseId === exerciseId);
      if (match && match.sets.length > 0) {
        const completedSet = match.sets.find((s) => s.isCompleted);
        const refSet = completedSet || match.sets[match.sets.length - 1];
        if (refSet) {
          lastLoggedWeight = refSet.weight;
          lastLoggedReps = refSet.reps;
          lastLoggedType = refSet.type;
          foundMemory = true;
          break;
        }
      }
    }

    const exerciseDef = exercises.find((ex) => ex.id === exerciseId);
    let defaultBarWeight = 0;
    if (exerciseDef) {
      const equip = (exerciseDef.equipment || "").toLowerCase();
      if (equip.includes("barbell")) {
        defaultBarWeight = 20;
      } else if (equip.includes("ez-bar") || equip.includes("ez bar")) {
        defaultBarWeight = 10;
      } else if (equip.includes("smith")) {
        defaultBarWeight = 15;
      }
    }

    const newEx: WorkoutExercise = {
      id: generateId(),
      exerciseId,
      barWeight: defaultBarWeight,
      sets: [
        {
          id: generateId(),
          weight: lastLoggedWeight,
          reps: lastLoggedReps,
          isCompleted: false,
          type: lastLoggedType,
        },
      ],
    };

    const updated = {
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newEx],
    };

    updateActiveSessionState(updated);
  }, [activeWorkout, history, updateActiveSessionState]);

  // Remove exercise from active session
  const removeExerciseFromActiveWorkout = useCallback((exerciseId: string) => {
    if (!activeWorkout) return;

    const updated = {
      ...activeWorkout,
      exercises: activeWorkout.exercises.filter((ex) => ex.exerciseId !== exerciseId),
    };

    updateActiveSessionState(updated);
  }, [activeWorkout, updateActiveSessionState]);

  // Add set to active workout exercise
  const addSetToExercise = useCallback((exerciseId: string, weight = 0, reps = 0, type: SetType = "normal") => {
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.exerciseId === exerciseId) {
        // Carry over previous set's weight and reps or load from history memory!
        const lastSet = ex.sets[ex.sets.length - 1];
        
        let targetWeight = weight;
        let targetReps = reps;
        let targetType = type;
        let targetDuration;
        let targetRpe;

        if (lastSet) {
          targetWeight = targetWeight || lastSet.weight;
          targetReps = targetReps || lastSet.reps;
          targetType = targetType || lastSet.type;
          targetDuration = lastSet.duration;
          targetRpe = lastSet.rpe;
        } else {
          for (const session of history) {
            const match = session.exercises.find((e) => e.exerciseId === exerciseId);
            if (match && match.sets.length > 0) {
              const completedSet = match.sets.find((s) => s.isCompleted);
              const refSet = completedSet || match.sets[match.sets.length - 1];
              if (refSet) {
                targetWeight = targetWeight || refSet.weight;
                targetReps = targetReps || refSet.reps;
                targetType = targetType || refSet.type;
                targetDuration = refSet.duration;
                targetRpe = refSet.rpe;
                break;
              }
            }
          }
        }

        const newSet: WorkoutSet = {
          id: generateId(),
          weight: targetWeight,
          reps: targetReps,
          isCompleted: false,
          type: targetType || "normal",
          duration: targetDuration,
          rpe: targetRpe,
        };
        return {
          ...ex,
          sets: [...ex.sets, newSet],
        };
      }
      return ex;
    });

    const updated = {
      ...activeWorkout,
      exercises: updatedExercises,
    };

    updateActiveSessionState(updated);
  }, [activeWorkout, history, updateActiveSessionState]);

  // Edit fields of a specific set in active workout
  const updateSetInExercise = useCallback((exerciseId: string, setIndex: number, fields: Partial<WorkoutSet>) => {
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.exerciseId === exerciseId) {
        const updatedSets = ex.sets.map((set, idx) => {
          if (idx === setIndex) {
            return { ...set, ...fields };
          }
          return set;
        });
        return { ...ex, sets: updatedSets };
      }
      return ex;
    });

    const updated = {
      ...activeWorkout,
      exercises: updatedExercises,
    };

    updateActiveSessionState(updated);
  }, [activeWorkout, updateActiveSessionState]);

  // Remove set from active workout exercise
  const removeSetFromExercise = useCallback((exerciseId: string, setIndex: number) => {
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.exerciseId === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter((_, idx) => idx !== setIndex),
        };
      }
      return ex;
    });

    const updated = {
      ...activeWorkout,
      exercises: updatedExercises,
    };

    updateActiveSessionState(updated);
  }, [activeWorkout, updateActiveSessionState]);

  // Update active workout general notes
  const updateActiveNotes = useCallback((notes: string) => {
    if (!activeWorkout) return;

    const updated = {
      ...activeWorkout,
      notes,
    };

    updateActiveSessionState(updated);
  }, [activeWorkout, updateActiveSessionState]);

  // Update/Save Custom persistent Notes for an Exercise ID
  const updateExerciseNotes = useCallback(async (exerciseId: string, notes: string) => {
    const updated = {
      ...exerciseNotes,
      [exerciseId]: notes,
    };
    setExerciseNotes(updated);
    saveToLocal("workout_tracker_exercise_notes", updated);

    if (isFirebaseReady && db && user) {
      try {
        const noteId = `${user.uid}_${exerciseId}`;
        await setDoc(doc(db, "exercise_notes", noteId), cleanUndefined({
          userId: user.uid,
          exerciseId,
          notes,
          updatedAt: new Date().toISOString(),
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `exercise_notes/${user.uid}_${exerciseId}`);
      }
    }
  }, [exerciseNotes, user]);

  // Update bar weight for an active session exercise
  const updateExerciseBarWeight = useCallback((exerciseId: string, barWeight: number) => {
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.exerciseId === exerciseId) {
        return {
          ...ex,
          barWeight,
        };
      }
      return ex;
    });

    const updated = {
      ...activeWorkout,
      exercises: updatedExercises,
    };

    updateActiveSessionState(updated);
  }, [activeWorkout, updateActiveSessionState]);

  // Save analysis to a history log
  const saveWorkoutAnalysis = useCallback(async (sessionId: string, analysis: any) => {
    const isLocal = !isFirebaseReady || !db || !user;
    if (!isLocal && db && user) {
      try {
        const docRef = doc(db, "workouts", sessionId);
        const workoutMatch = history.find((h) => h.id === sessionId);
        if (workoutMatch) {
          const updatedSession = { ...workoutMatch, analysis };
          await setDoc(docRef, cleanUndefined({ ...updatedSession, userId: user.uid }));
        }
      } catch (error) {
        console.error("Failed to save workout analysis to Firestore:", error);
      }
    } else {
      const updatedHistory = history.map((w) => {
        if (w.id === sessionId) {
          return { ...w, analysis };
        }
        return w;
      });
      setHistory(updatedHistory);
      saveToLocal("workout_tracker_history", updatedHistory);
    }
  }, [history, user]);

  // --- GEMINI MUTATION BRIDGE ---
  // Coordinates structured mutations requested by Gemini server parsing.
  const handleAIActions = useCallback(async (actions: AIAction[]) => {
    console.log("Applying AI-orchestrated workout mutations:", actions);
    
    // Create working mutable copies of current states to resolve state-lag / async render updates
    let localActiveWorkout = activeWorkout ? JSON.parse(JSON.stringify(activeWorkout)) : null;
    let localHistory = [...history];
    let localTemplates = [...templates];

    const resolveExId = (inputVal: string): string => {
      if (!inputVal) return "";
      const cleanedInput = inputVal.trim().toLowerCase();
      
      // 1. Direct match check
      const exact = exercises.find(e => {
        const eId = (e && typeof e.id === "string") ? e.id.toLowerCase() : "";
        const eName = (e && typeof e.name === "string") ? e.name.toLowerCase() : "";
        return eId === cleanedInput || eName === cleanedInput;
      });
      if (exact) return exact.id;

      // Helper to strip common plural endings or suffixes
      const stem = (word: any) => {
        if (!word || typeof word !== "string") return "";
        let w = word.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
        if (w.endsWith("ies")) w = w.slice(0, -3) + "y";
        else if (w.endsWith("es")) w = w.slice(0, -2);
        else if (w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
        if (w.endsWith("ing")) w = w.slice(0, -3);
        return w;
      };

      // 2. Exact match using stem
      const stemmedInput = stem(cleanedInput);
      const exactStemmed = exercises.find(e => {
        const eId = (e && typeof e.id === "string") ? e.id : "";
        const eName = (e && typeof e.name === "string") ? e.name : "";
        return stem(eId) === stemmedInput || stem(eName) === stemmedInput;
      });
      if (exactStemmed) return exactStemmed.id;

      // 3. Token-based overlap matching
      // Split into word tokens, stem them
      const inputTokens = cleanedInput
        .split(/[\s-_]+/)
        .map(t => stem(t))
        .filter(t => t.length > 1);

      let bestMatch: { exercise: typeof exercises[0]; score: number } | null = null;

      for (const ex of exercises) {
        if (!ex) continue;
        const eId = typeof ex.id === "string" ? ex.id : "";
        const eName = typeof ex.name === "string" ? ex.name : "";

        const idTokens = eId.split(/[\s-_]+/).map(t => stem(t)).filter(t => t.length > 1);
        const nameTokens = eName.split(/[\s-_]+/).map(t => stem(t)).filter(t => t.length > 1);
        
        let score = 0;
        for (const inputTok of inputTokens) {
          if (idTokens.includes(inputTok) || nameTokens.includes(inputTok)) {
            score += 2; // high score for direct word match
          } else if (idTokens.some(tok => tok.includes(inputTok) || inputTok.includes(tok)) || 
                     nameTokens.some(tok => tok.includes(inputTok) || inputTok.includes(tok))) {
            score += 1; // partial word overlap
          }
        }
        
        if (score > 0) {
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { exercise: ex, score };
          }
        }
      }

      if (bestMatch && bestMatch.score >= 1) {
        return bestMatch.exercise.id;
      }

      // 4. Default fuzzy match fallback
      const normInput = cleanedInput.replace(/[^a-z0-9]/g, "");
      const fuzzy = exercises.find(e => {
        if (!e) return false;
        const eId = typeof e.id === "string" ? e.id : "";
        const eName = typeof e.name === "string" ? e.name : "";
        const normId = eId.toLowerCase().replace(/[^a-z0-9]/g, "");
        const normName = eName.toLowerCase().replace(/[^a-z0-9]/g, "");
        return normId.includes(normInput) || normInput.includes(normId) || normName.includes(normInput) || normInput.includes(normName);
      });
      if (fuzzy) return fuzzy.id;

      return inputVal;
    };

    const parseWeight = (val: any): number => {
      if (val === undefined || val === null) return 0;
      if (typeof val === "number") return val;
      const cleaned = String(val).replace(/[^0-9.]/g, "");
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const parseReps = (val: any): number => {
      if (val === undefined || val === null) return 0;
      if (typeof val === "number") return val;
      const cleaned = String(val).replace(/[^0-9]/g, "");
      const num = parseInt(cleaned, 10);
      return isNaN(num) ? 0 : num;
    };

    for (const action of actions) {
      if (!action || !action.type || !action.payload) continue;

      switch (action.type) {
        case "START_WORKOUT": {
          let initialExercises: WorkoutExercise[] = [];
          const nameInput = action.payload.name || "AI Workout";
          let templateName = nameInput;

          if (action.payload.templateId) {
            const template = localTemplates.find((t) => t.id === action.payload.templateId);
            if (template) {
              initialExercises = template.exercises.map((ex) => ({
                ...ex,
                id: generateId(),
                sets: ex.sets.map((s) => ({ ...s, id: generateId(), isCompleted: false })),
              }));
              templateName = template.name;
            }
          } else if (action.payload.exercises) {
            initialExercises = action.payload.exercises.map((ex: any) => ({
              id: generateId(),
              exerciseId: resolveExId(ex.exerciseId),
              sets: (ex.sets || []).map((s: any) => ({
                id: generateId(),
                weight: parseWeight(s.weight),
                reps: parseReps(s.reps),
                type: s.type || "normal",
                isCompleted: s.isCompleted !== undefined ? s.isCompleted : false,
              })),
            }));
          }

          localActiveWorkout = {
            id: generateId(),
            name: templateName,
            startTime: new Date().toISOString(),
            exercises: initialExercises,
            notes: (action.payload as any).notes || "",
          };
          break;
        }

        case "ADD_EXERCISE": {
          if (!localActiveWorkout) {
            localActiveWorkout = {
              id: generateId(),
              name: "AI Workout",
              startTime: new Date().toISOString(),
              exercises: [],
            };
          }
          const exerciseId = resolveExId(action.payload.exerciseId);
          if (!localActiveWorkout.exercises.some((e: any) => e.exerciseId === exerciseId)) {
            // Find memory
            let lastLoggedWeight = 0;
            let lastLoggedReps = 0;
            let lastLoggedType: SetType = "normal";
            for (const session of localHistory) {
              const match = session.exercises.find((e) => e.exerciseId === exerciseId);
              if (match && match.sets.length > 0) {
                const completedSet = match.sets.find((s) => s.isCompleted);
                const refSet = completedSet || match.sets[match.sets.length - 1];
                if (refSet) {
                  lastLoggedWeight = refSet.weight;
                  lastLoggedReps = refSet.reps;
                  lastLoggedType = refSet.type;
                  break;
                }
              }
            }

            localActiveWorkout.exercises.push({
              id: generateId(),
              exerciseId,
              sets: [
                {
                  id: generateId(),
                  weight: lastLoggedWeight,
                  reps: lastLoggedReps,
                  isCompleted: false,
                  type: lastLoggedType,
                },
              ],
            });
          }
          break;
        }

        case "REMOVE_EXERCISE": {
          if (localActiveWorkout) {
            const exerciseId = resolveExId(action.payload.exerciseId);
            localActiveWorkout.exercises = localActiveWorkout.exercises.filter(
              (ex: any) => ex.exerciseId !== exerciseId
            );
          }
          break;
        }

        case "ADD_SET": {
          if (!localActiveWorkout) {
            localActiveWorkout = {
              id: generateId(),
              name: "AI Workout",
              startTime: new Date().toISOString(),
              exercises: [],
            };
          }
          const exerciseId = resolveExId(action.payload.exerciseId);
          let ex = localActiveWorkout.exercises.find((e: any) => e.exerciseId === exerciseId);
          if (!ex) {
            let lastLoggedWeight = 0;
            let lastLoggedReps = 0;
            let lastLoggedType: SetType = "normal";
            for (const session of localHistory) {
              const match = session.exercises.find((e) => e.exerciseId === exerciseId);
              if (match && match.sets.length > 0) {
                const completedSet = match.sets.find((s) => s.isCompleted);
                const refSet = completedSet || match.sets[match.sets.length - 1];
                if (refSet) {
                  lastLoggedWeight = refSet.weight;
                  lastLoggedReps = refSet.reps;
                  lastLoggedType = refSet.type;
                  break;
                }
              }
            }

            ex = {
              id: generateId(),
              exerciseId,
              sets: [],
            };
            localActiveWorkout.exercises.push(ex);
          }

          const lastSet = ex.sets[ex.sets.length - 1];
          let targetWeight = action.payload.weight !== undefined ? parseWeight(action.payload.weight) : undefined;
          let targetReps = action.payload.reps !== undefined ? parseReps(action.payload.reps) : undefined;
          let targetType = action.payload.type || "normal";

          if (lastSet) {
            targetWeight = targetWeight ?? lastSet.weight;
            targetReps = targetReps ?? lastSet.reps;
            targetType = targetType ?? lastSet.type;
          } else {
            for (const session of localHistory) {
              const match = session.exercises.find((e) => e.exerciseId === exerciseId);
              if (match && match.sets.length > 0) {
                const completedSet = match.sets.find((s) => s.isCompleted);
                const refSet = completedSet || match.sets[match.sets.length - 1];
                if (refSet) {
                  targetWeight = targetWeight ?? refSet.weight;
                  targetReps = targetReps ?? refSet.reps;
                  targetType = targetType ?? refSet.type;
                  break;
                }
              }
            }
          }

          const calculatedWeight = targetWeight || 0;
          const calculatedReps = targetReps || 0;

          // If tracking specific non-zero weights/reps, default to completed: true
          const defaultCompleted = (action.payload.weight !== undefined && calculatedWeight > 0) || 
                                   (action.payload.reps !== undefined && calculatedReps > 0);

          ex.sets.push({
            id: generateId(),
            weight: calculatedWeight,
            reps: calculatedReps,
            isCompleted: (action.payload as any).isCompleted !== undefined 
              ? (action.payload as any).isCompleted 
              : defaultCompleted,
            type: targetType || "normal",
          });
          break;
        }

        case "UPDATE_SET": {
          if (localActiveWorkout) {
            const exerciseId = resolveExId(action.payload.exerciseId);
            const ex = localActiveWorkout.exercises.find((e: any) => e.exerciseId === exerciseId);
            if (ex && ex.sets[action.payload.setIndex]) {
              const set = ex.sets[action.payload.setIndex];
              if (action.payload.fields) {
                const fieldsCopy = { ...action.payload.fields };
                if (fieldsCopy.weight !== undefined) fieldsCopy.weight = parseWeight(fieldsCopy.weight);
                if (fieldsCopy.reps !== undefined) fieldsCopy.reps = parseReps(fieldsCopy.reps);
                Object.assign(set, fieldsCopy);
              }
            }
          }
          break;
        }

        case "REMOVE_SET": {
          if (localActiveWorkout) {
            const exerciseId = resolveExId(action.payload.exerciseId);
            const ex = localActiveWorkout.exercises.find((e: any) => e.exerciseId === exerciseId);
            if (ex && ex.sets[action.payload.setIndex]) {
              ex.sets.splice(action.payload.setIndex, 1);
            }
          }
          break;
        }

        case "LOG_WORKOUT": {
          let sessionDate = new Date().toISOString();
          if (action.payload.date) {
            try {
              const parsedDate = new Date(action.payload.date);
              if (!isNaN(parsedDate.getTime())) {
                sessionDate = parsedDate.toISOString();
              }
            } catch (e) {
              console.warn("Invalid date in AI LOG_WORKOUT payload, using current time", action.payload.date);
            }
          }

          const parsedOps: WorkoutExercise[] = (action.payload.exercises || []).map((ex: any) => ({
            id: generateId(),
            exerciseId: resolveExId(ex.exerciseId),
            sets: (ex.sets || []).map((s: any) => ({
              id: generateId(),
              weight: parseWeight(s.weight),
              reps: parseReps(s.reps),
              type: s.type || "normal",
              isCompleted: s.isCompleted !== undefined ? s.isCompleted : true,
            })),
          }));

          const durationMin = action.payload.duration !== undefined ? Number(action.payload.duration) : 45;
          const parsedDuration = isNaN(durationMin) ? 45 : durationMin;

          const loggedSession: WorkoutSession = {
            id: generateId(),
            name: action.payload.name || "Completed Workout",
            startTime: sessionDate,
            endTime: new Date(new Date(sessionDate).getTime() + parsedDuration * 60 * 1000).toISOString(),
            exercises: parsedOps,
            notes: action.payload.notes || "",
          };

          localHistory = [loggedSession, ...localHistory];
          if (isFirebaseReady && db && user) {
            try {
              await setDoc(doc(db, "workouts", loggedSession.id), cleanUndefined({
                ...loggedSession,
                userId: user.uid,
              }));
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, `workouts/${loggedSession.id}`);
            }
          }
          break;
        }

        case "CREATE_TEMPLATE": {
          const newTemplate: WorkoutSession = {
            id: "template-" + generateId(),
            name: action.payload.name || "New Template",
            startTime: new Date().toISOString(),
            notes: action.payload.notes || "",
            exercises: (action.payload.exercises || []).map((e: any) => ({
              id: generateId(),
              exerciseId: resolveExId(e.exerciseId),
              sets: (e.sets || []).map((s: any) => ({
                id: generateId(),
                weight: parseWeight(s.weight),
                reps: parseReps(s.reps),
                type: s.type || "normal",
                isCompleted: false,
              })),
            })),
          };

          localTemplates = [...localTemplates, newTemplate];
          if (isFirebaseReady && db && user) {
            try {
              await setDoc(doc(db, "templates", newTemplate.id), cleanUndefined({
                ...newTemplate,
                userId: user.uid,
              }));
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, `templates/${newTemplate.id}`);
            }
          }
          break;
        }

        case "DELETE_LOG": {
          const logId = action.payload.logId;
          localHistory = localHistory.filter((w) => w.id !== logId);
          if (isFirebaseReady && db && user) {
            try {
              await deleteDoc(doc(db, "workouts", logId));
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, `workouts/${logId}`);
            }
          }
          break;
        }

        case "UPDATE_ACTIVE_NOTES": {
          if (localActiveWorkout) {
            localActiveWorkout.notes = action.payload.notes || "";
          }
          break;
        }

        case "FINISH_WORKOUT": {
          if (localActiveWorkout) {
            const completedSession: WorkoutSession = {
              ...localActiveWorkout,
              exercises: localActiveWorkout.exercises.map((ex: any) => ({
                ...ex,
                sets: ex.sets.map((s: any) => ({
                  ...s,
                  isCompleted: true,
                })),
              })),
              endTime: new Date().toISOString(),
            };
            localHistory = [completedSession, ...localHistory];
            if (isFirebaseReady && db && user) {
              try {
                await setDoc(doc(db, "workouts", completedSession.id), cleanUndefined({
                  ...completedSession,
                  userId: user.uid,
                }));
              } catch (error) {
                handleFirestoreError(error, OperationType.WRITE, `workouts/${completedSession.id}`);
              }
            }
            localActiveWorkout = null;
          }
          break;
        }

        default:
          console.warn("Unresolved action dispatched from Gemini instruction:", action);
      }
    }

    // Apply all changes to React State at once
    setActiveWorkout(localActiveWorkout);
    setHistory(localHistory);
    setTemplates(localTemplates);

    // Save to local storage
    if (localActiveWorkout) {
      saveToLocal("workout_tracker_active_workout", localActiveWorkout);
    } else {
      localStorage.removeItem("workout_tracker_active_workout");
    }
    saveToLocal("workout_tracker_history", localHistory);
    saveToLocal("workout_tracker_templates", localTemplates);

  }, [activeWorkout, history, templates, exercises, user]);

  return {
    exercises,
    templates,
    history,
    activeWorkout,
    userProfile,
    updateUserProfile,
    user,
    isSyncing,
    exerciseNotes,
    updateExerciseNotes,
    updateExerciseBarWeight,
    addCustomExercise,
    updateCustomExercise,
    importCustomExercises,
    startWorkout,
    discardWorkout,
    finishWorkout,
    logWorkoutDirectly,
    createTemplate,
    deleteTemplate,
    deleteHistoryLog,
    addExerciseToActiveWorkout,
    removeExerciseFromActiveWorkout,
    addSetToExercise,
    updateSetInExercise,
    removeSetFromExercise,
    updateActiveNotes,
    updateActiveWorkout: updateActiveSessionState,
    handleAIActions,
    saveWorkoutAnalysis,
    // Google Sheets integration hooks
    googleAccessToken,
    setGoogleAccessToken,
    spreadsheetId,
    setSpreadsheetId,
    isSheetsSyncEnabled,
    setIsSheetsSyncEnabled,
  };
}

// --- End of useWorkoutState.ts ---
