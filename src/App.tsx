// Author: Google AI Studio Coding Agent
// OS support: All (Web, Android, iOS)
// Description: Main React App component providing routing tabs, sheets/auth popups, and layout structures.

import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useWorkoutState } from "./useWorkoutState";
import AIAssistant from "./components/AIAssistant";
import TabSkeleton from "./components/TabSkeleton";
import { haptics } from "./lib/haptics";
// Phase 1A: code-split the main tab views — each becomes its own chunk loaded
// on first visit. ActiveWorkout (the largest) only downloads once a workout starts.
const ActiveWorkout = lazy(() => import("./components/ActiveWorkout"));
const TemplatesList = lazy(() => import("./components/TemplatesList"));
const HistoryLogs = lazy(() => import("./components/HistoryLogs"));
const ExerciseLibrary = lazy(() => import("./components/ExerciseLibrary"));
const AccountSettings = lazy(() => import("./components/AccountSettings"));
import WorkoutSplashScene from "./components/WorkoutSplashScene";
import IntroSplash from "./components/IntroSplash";
import OnboardingProfile from "./components/OnboardingProfile";
import { WorkoutSession, UserProfile } from "./types";
import { getNotificationService } from "./services/notifications";
import { isFirebaseReady, auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  Dumbbell,
  History,
  Calendar,
  Layers,
  Sparkles,
  CloudLightning,
  CheckCircle,
  Clock,
  LogIn,
  LogOut,
  User,
  Info,
  ExternalLink,
  Check,
  Loader2,
  RefreshCw,
  Plus,
  Bell,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence, useIsPresent } from "motion/react";

import FlexingArm from "./components/FlexingArm";
import ExerciseGuideModal from "./components/ExerciseGuideModal";

function WorkoutBanner({ activeWorkout, setActiveTab, activeTab, exercises, restTimerTarget, showSwipeUpInfo, setShowSwipeUpInfo }: any) {
  const [elapsed, setElapsed] = React.useState(0);
  const [restSecondsLeft, setRestSecondsLeft] = React.useState<number | null>(null);
  
  React.useEffect(() => {
    if (!activeWorkout) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((new Date().getTime() - new Date(activeWorkout.startTime).getTime()) / 1000));
    }, 1000);
    setElapsed(Math.floor((new Date().getTime() - new Date(activeWorkout.startTime).getTime()) / 1000));
    return () => clearInterval(interval);
  }, [activeWorkout]);

  React.useEffect(() => {
    if (!restTimerTarget) {
      setRestSecondsLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const diff = Math.ceil((restTimerTarget.endTime - Date.now()) / 1000);
      return Math.max(0, diff);
    };

    setRestSecondsLeft(calculateTimeLeft());

    const intervalId = setInterval(() => {
      const left = calculateTimeLeft();
      setRestSecondsLeft(left);
      if (left <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [restTimerTarget]);

  if (!activeWorkout || activeTab === "workouts") return null;

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const hStr = h > 0 ? h + ":" : "";
  const mStr = m.toString().padStart(h > 0 ? 2 : 1, "0");
  const sStr = s.toString().padStart(2, "0");
  const timeStr = hStr + mStr + ":" + sStr;

  let currentDetail = "";
  let exerciseName = "";

  const currentEx = activeWorkout && activeWorkout.exercises && activeWorkout.exercises.length > 0
    ? (activeWorkout.exercises.find((ex: any) => ex.sets.some((set: any) => !set.isCompleted)) || activeWorkout.exercises[activeWorkout.exercises.length - 1])
    : null;
  const exDef = currentEx ? exercises?.find((e: any) => e.id === currentEx.exerciseId) : null;

  if (currentEx) {
    exerciseName = exDef ? exDef.name : "Exercise";
    const unfinishedSet = currentEx.sets.find((set: any) => !set.isCompleted) || currentEx.sets[currentEx.sets.length - 1];
    if (unfinishedSet) {
      currentDetail = unfinishedSet.weight + " kg × " + unfinishedSet.reps + " reps";
    }
  }

  // Determine progress of the retracting red layer
  const isTimerRunning = restTimerTarget && restSecondsLeft !== null;
  const progressPercent = isTimerRunning
    ? Math.max(15, (restSecondsLeft / restTimerTarget.total) * 100)
    : 100;

  const textOutlineStyle = {
    textShadow: "-1px -1px 0 rgba(0,0,0,0.85), 1px -1px 0 rgba(0,0,0,0.85), -1px 1px 0 rgba(0,0,0,0.85), 1px 1px 0 rgba(0,0,0,0.85), 0px 2px 4px rgba(0,0,0,0.6)"
  };

  return (
    <div className="relative w-full z-40 select-none">
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.2, bottom: 0 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 26 }}
        onDragEnd={(e, info) => {
          if (info.offset.y < -15) {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(12);
            }
            setShowSwipeUpInfo(true);
          }
        }}
        onTap={() => {
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
          setActiveTab("workouts");
        }}
        style={{ background: "var(--m3-err-solid)" }}
        className={`${isTimerRunning ? "pbw-breathe " : ""}p-3 pt-4 flex items-center justify-between cursor-pointer relative overflow-hidden shrink-0 touch-none`}
      >
        {/* Visual pull drag-up indicator bar */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
          <div className="w-[46px] h-[4px] bg-white/50 rounded-full" />
        </div>

        {/* Thin progress line at the seam with the nav — drains as rest counts down */}
        {isTimerRunning && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/25 z-20">
            <motion.div
              className="h-full origin-left"
              style={{ background: "rgba(255,255,255,.9)", transformOrigin: "left" }}
              animate={{ scaleX: Math.max(0, Math.min(1, (restSecondsLeft || 0) / (restTimerTarget?.total || 90))) }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 relative z-10 w-full min-w-0 pr-2">
          <div className="flex items-center gap-3 w-full min-w-0">
            <div className="w-10 h-10 rounded-full bg-black/20 dark:bg-white/20 flex items-center justify-center border border-black/15 dark:border-white/20 shrink-0 shadow-inner ring-1 ring-black/5">
              <Clock className="w-5 h-5 text-white animate-pulse filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <div className="flex items-baseline gap-2">
                <h5 
                  className="font-extrabold text-white text-sm leading-tight whitespace-nowrap"
                  style={textOutlineStyle}
                >
                  {isTimerRunning ? "Rest Timer Active" : "Workout in Progress"}
                </h5>
                <span className="text-xs font-mono font-bold text-red-100 bg-black/40 px-1.5 py-0.5 rounded shadow-inner ring-1 ring-black/10">
                  {isTimerRunning ? `${restSecondsLeft}s Left` : timeStr}
                </span>
              </div>
              
              {exerciseName ? (
                <div className="flex items-center gap-2 mt-0.5 min-w-0">
                  <p 
                    className="text-[10px] font-bold text-white/95 truncate uppercase tracking-wide pb-0.5"
                    style={textOutlineStyle}
                  >
                    {exerciseName} {currentDetail && `• ${currentDetail}`}
                  </p>
                  <span className="text-[8px] font-extrabold text-white bg-black/40 border border-black/25 dark:bg-white/15 dark:border-white/10 px-1 rounded whitespace-nowrap uppercase tracking-wider font-mono">Swipe Up</span>
                </div>
              ) : (
                <p 
                  className="text-[10px] font-bold text-white/95 uppercase tracking-widest font-mono mt-0.5"
                  style={textOutlineStyle}
                >
                  Tap to return • Swipe up to view
                </p>
              )}
            </div>
          </div>
          <div className="bg-black/20 dark:bg-white/20 p-2 rounded-xl shrink-0 shadow-md ring-1 ring-black/15 dark:ring-white/20">
            <Dumbbell className="w-4 h-4 text-white filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function WorkoutTabSegment({ activeTab, children }: { activeTab: string; children: React.ReactNode }) {
  const isPresent = useIsPresent();
  const isVisible = activeTab === "workouts" || !isPresent;
  return (
    <div className={isVisible ? "block space-y-6" : "hidden space-y-6"}>
      {children}
    </div>
  );
}

export default function App() {
  const state = useWorkoutState();
  const [restTimerTarget, setRestTimerTarget] = useState<{ endTime: number; total: number; exerciseName: string } | null>(null);

  // Tear down all workout notifications (tracking + rest). Used when a session
  // starts, finishes, or is discarded so no stale lock-screen timer lingers.
  const cancelServiceWorkerTimer = () => {
    getNotificationService().endSession();
  };
  const [showSwipeUpInfo, setShowSwipeUpInfo] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem("projectpb_intro_played");
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("projectpb_user_profile");
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof localStorage !== "undefined") {
      return (localStorage.getItem("app-theme") as "dark" | "light") || "dark";
    }
    return "dark";
  });

  const [activeTab, setActiveTab] = useState<"workouts" | "history" | "templates" | "exercises" | "account">("workouts");
  // Page-transition direction: tracks which way the slide goes so the incoming
  // page enters from the correct side. Tap-driven nav routes through goToTab.
  const TAB_ORDER = ["workouts", "history", "templates", "exercises", "account"] as const;
  const navDir = useRef(0);
  const goToTab = (key: typeof activeTab) => {
    if (key === activeTab) return;
    navDir.current = TAB_ORDER.indexOf(key) > TAB_ORDER.indexOf(activeTab) ? 1 : -1;
    haptics.pageCommit();
    setActiveTab(key);
  };
  const [latestCompletedWorkout, setLatestCompletedWorkout] = useState<WorkoutSession | null>(null);
  const aiAssistantRef = useRef<any>(null);
  const isDraggingInfoRef = useRef(false);

  useEffect(() => {
    let themeColor = "#ffffff";
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      themeColor = "#ffffff";
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.setAttribute("data-theme", "dark");
      themeColor = "#000000";
    }

    // Dynamic update of theme-color meta tag to force system status bar and navigation trays to pure black/white
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor);
    } else {
      const meta = document.createComment("") as any;
      const themeMeta = document.createElement("meta");
      themeMeta.name = "theme-color";
      themeMeta.content = themeColor;
      document.head.appendChild(themeMeta);
    }

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("app-theme", theme);
    }
  }, [theme]);

  // Global button haptic feedback listener
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.cta-text') || target.closest('a')) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Track the last non-workout tab to switch back to it when swiping down from active workouts view
  const lastNonWorkoutTab = useRef<"history" | "templates" | "exercises" | "account">("templates");
  useEffect(() => {
    if (activeTab !== "workouts") {
      lastNonWorkoutTab.current = activeTab;
    }
  }, [activeTab]);

  // Intercept native hardware back key navigation controls
  useEffect(() => {
    if (window.history.state === null || !window.history.state.root) {
      window.history.replaceState({ activeTab, root: true }, "");
    }

    const handlePopState = (event: PopStateEvent) => {
      // Re-push a history entry so physical back button click is intercepted next cycle
      window.history.pushState({ activeTab }, "");

      // Move backward to primary layouts workflows
      if (activeTab !== "workouts") {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(10);
        }
        setActiveTab("workouts");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [activeTab]);

  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSyncingAllHistory, setIsSyncingAllHistory] = useState(false);
  const [sheetsSyncMessage, setSheetsSyncMessage] = useState<{ text: string; error: boolean } | null>(null);

  const [hasDismissedGate, setHasDismissedGate] = useState(() => {
    return sessionStorage.getItem("projectpb_dismissed_gate") === "true";
  });
  
  const [notificationPermission, setNotificationPermission] = useState<"default" | "granted" | "denied" | "unsupported">(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    return Notification.permission as "default" | "granted" | "denied";
  });

  const [dismissedNotificationBanner, setDismissedNotificationBanner] = useState(() => {
    return sessionStorage.getItem("projectpb_dismissed_noti_banner") === "true";
  });
  
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [activeAIPrompt, setActiveAIPrompt] = useState<string | null>(null);
  const [showAiOverlay, setShowAiOverlay] = useState(false);

  useEffect(() => {
    // Elegant, smooth programmatic scroll to top upon switching tabs to avoid harsh layout snapping
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [activeTab]);

  useEffect(() => {
    const handleOpenDrawer = () => {
      setIsAiExpanded(true);
      setShowAiOverlay(true);
    };

    window.addEventListener("open-gemini-drawer", handleOpenDrawer);

    return () => {
      window.removeEventListener("open-gemini-drawer", handleOpenDrawer);
    };
  }, []);

  const handleFinishWorkout = async () => {
    if (state.activeWorkout) {
      const completed: WorkoutSession = {
        ...state.activeWorkout,
        endTime: new Date().toISOString()
      };
      setLatestCompletedWorkout(completed);
      await state.finishWorkout();
    }
  };

  // Quick navigation bridge: Let history analytic components prompt queries directly in Gemini Chat 
  const handlePropagatePromptToGemini = (prompt: string) => {
    setActiveAIPrompt(prompt);
    setShowAiOverlay(true);
  };

  const handleGoogleLogin = async () => {
    if (!isFirebaseReady || !auth) return;
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/spreadsheets");
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        state.setGoogleAccessToken(credential.accessToken);
      }
    } catch (err) {
      console.error("Popup login failed:", err);
      alert("Authentication popup failed. Check that third-party cookies or browser popups are allowed for the AI Studio framed preview.");
    }
  };

  const handleGoogleLogout = async () => {
    if (!isFirebaseReady || !auth) return;
    try {
      await signOut(auth);
      state.setGoogleAccessToken(null);
    } catch (err) {
      console.error("Signout failed:", err);
    }
  };

  const handleCreateSpreadsheet = async () => {
    if (!state.googleAccessToken) {
      setSheetsSyncMessage({ text: "Please authorize Google Sheets sync first.", error: true });
      return;
    }
    setIsCreatingSheet(true);
    setSheetsSyncMessage(null);
    try {
      const { createWorkoutSpreadsheet } = await import("./googleSheetsService");
      const sheetId = await createWorkoutSpreadsheet(state.googleAccessToken);
      
      state.setSpreadsheetId(sheetId);
      localStorage.setItem("projectpb_spreadsheet_id", sheetId);
      
      if (isFirebaseReady && auth && auth.currentUser) {
        const { doc, setDoc } = await import("firebase/firestore");
        const { db } = await import("./firebase");
        if (db) {
          await setDoc(doc(db, "user_sheets", auth.currentUser.uid), {
            spreadsheetId: sheetId,
          });
        }
      }
      setSheetsSyncMessage({ text: "Spreadsheet created successfully! Active hot link established.", error: false });
    } catch (err: any) {
      console.error("Failed creating spreadsheet:", err);
      setSheetsSyncMessage({ text: `Failed to create spreadsheet: ${err.message || err}`, error: true });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSyncAllHistory = async () => {
    if (!state.googleAccessToken || !state.spreadsheetId) {
      setSheetsSyncMessage({ text: "Please authorize and link a spreadsheet before syncing.", error: true });
      return;
    }
    setIsSyncingAllHistory(true);
    setSheetsSyncMessage(null);
    try {
      const { syncAllHistoryToSheet } = await import("./googleSheetsService");
      const success = await syncAllHistoryToSheet(
        state.googleAccessToken,
        state.spreadsheetId,
        state.history,
        state.exercises
      );
      if (success) {
        setSheetsSyncMessage({ text: "Successfully synchronized full history! Google sheet is perfectly matching.", error: false });
      } else {
        setSheetsSyncMessage({ text: "Failed to push sheets updates. Try re-authorizing Google Sheets.", error: true });
      }
    } catch (err: any) {
      console.error("Failed history sync:", err);
      setSheetsSyncMessage({ text: `Sync process failed: ${err.message || err}`, error: true });
    } finally {
      setIsSyncingAllHistory(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden max-w-[100vw] bg-white dark:bg-[#0b0910] text-gray-900 dark:text-gray-100 font-sans leading-normal antialiased relative flex flex-col">
      {/* Intro Splash Entry Screen */}
      {showIntro && (
        <IntroSplash
          onComplete={() => {
            sessionStorage.setItem("projectpb_intro_played", "true");
            setShowIntro(false);
          }}
        />
      )}

      {/* Onboarding Profile Screen */}
      {!showIntro && showOnboarding && (
        <div className="fixed inset-0 z-[60000] flex items-start justify-center p-4 overflow-y-auto" style={{ background: "var(--m3-bg)", paddingTop: "calc(env(safe-area-inset-top) + 14px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)" }}>
          <OnboardingProfile
            initialProfile={state.userProfile}
            onComplete={(profile: UserProfile) => {
              state.updateUserProfile(profile);
              setShowOnboarding(false);
            }}
          />
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[60000] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto" style={{ paddingTop: "calc(env(safe-area-inset-top) + 56px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}>
          <div className="relative w-full max-w-md overflow-hidden" style={{ background: "var(--m3-surface)", borderRadius: "28px", border: "1px solid var(--m3-outline-q)" }}>
            <button 
              onClick={() => setIsEditingProfile(false)}
              className="absolute -top-12 right-0 text-white hover:text-indigo-400 font-bold p-2"
            >
              Close
            </button>
            <OnboardingProfile
              initialProfile={state.userProfile}
              onComplete={(profile: UserProfile) => {
                state.updateUserProfile(profile);
                setIsEditingProfile(false);
              }}
            />
          </div>
        </div>
      )}
      {/* Dynamic Neural Expressive Breathing Background Glow (dark at top, beautifully blending to a gorgeous glowing hue at the bottom) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle breathing depth */}
        <motion.div
          animate={{
            opacity: [0.25, 0.40, 0.25],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0e112c]/40 to-[#1b1c4b]/55"
        />
        {/* Deep, rich purple and indigo auroral core light nodes */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.35, 0.55, 0.35],
            y: [0, -15, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[-15%] left-[15%] w-[70vw] h-[55vh] rounded-full bg-indigo-600/20 blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 30, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-[-10%] right-[10%] w-[65vw] h-[50vh] rounded-full bg-purple-500/15 blur-[130px]"
        />
        {/* Solid baseline transition reflecting the neural design style */}
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-indigo-500/10 via-slate-900/10 to-transparent opacity-90" />
      </div>

      {/* 1. INITIAL GOOGLE LOGIN WELCOME GREETING GATE */}
      {!state.user && !hasDismissedGate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto" style={{ background: "var(--m3-bg)" }}>
          {/* Interactive ambient lights */}
          <div className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute bottom-[20%] right-[20%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-3xl" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-3xl p-6 md:p-8 text-center space-y-7 relative overflow-hidden"
            style={{ background: "var(--m3-sc-low)", border: "1px solid var(--m3-outline-q)" }}
          >
            {/* Logo details */}
            <div className="space-y-2 relative">
              <img src="/pb-icon.png" alt="Project PB" className="w-20 h-20 rounded-2xl mx-auto" />
              <div className="flex justify-center" style={{ color: "var(--m3-on)" }}>
                <div className="pb-logo hero" style={{ color: "currentColor" }}>
                  <span>PROJECT</span><span className="dot" /><span className="pb">PB</span>
                </div>
              </div>
              <p className="pb-sub" style={{ marginTop: 6 }}>Your personal strength companion</p>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <h2 className="m3-h center" style={{ fontSize: "var(--m3-title-lg)", margin: 0 }}>Let's build your strength journey together</h2>
              <p className="m3-body center">Keep track of exercises, monitor sets and weight, view progressive statistics, and save custom routines.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--m3-sc)", borderRadius: 14, padding: "12px 14px", textAlign: "left" }}>
                <CheckCircle style={{ width: 20, height: 20, color: "var(--m3-success)", flex: "none" }} />
                <span style={{ fontFamily: "var(--m3-mono-font)", fontSize: "var(--m3-body-md)", fontWeight: 500, color: "var(--m3-on-var)" }}>Save and restore your workouts across any device</span>
              </div>
            </div>

            {/* Triggers */}
            <div className="m3-stack" style={{ paddingTop: 2 }}>
              <button onClick={handleGoogleLogin} className="m3-btn fill">
                <LogIn className="w-[18px] h-[18px]" />
                <span>Sync with Google Account</span>
              </button>

              {window.self !== window.top && (
                <p style={{ fontFamily: "var(--m3-mono-font)", fontSize: 11, lineHeight: 1.5, color: "#d9920a", background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.18)", padding: 12, borderRadius: 14, maxWidth: 360, margin: "0 auto", textAlign: "left" }}>
                  ⚠️ <strong>Framed preview hint:</strong> Google login popups are blocked inside iframes. Click <strong>"Open in a new tab"</strong> at the top-right to log in safely.
                </p>
              )}

              <button
                onClick={() => {
                  sessionStorage.setItem("projectpb_dismissed_gate", "true");
                  setHasDismissedGate(true);
                }}
                className="pb-skip"
              >
                Continue offline sandbox
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 0. GLOWING NEURAL BACKDROP SPHERES */}
      <div className="absolute top-[10%] left-[-10%] w-[60vw] h-[60vw] max-w-[600px] rounded-full gemini-bg-glow-1 pointer-events-none z-0 opacity-80" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50vw] h-[50vw] max-w-[500px] rounded-full gemini-bg-glow-2 pointer-events-none z-0 opacity-80" />

      {/* 1. TOP HEADER NAVIGATION BLOCK */}
      <header className="fixed top-0 left-0 right-0 z-40" style={{ background: "var(--m3-bg)", paddingTop: "env(safe-area-inset-top)", borderBottom: "1px solid var(--m3-outline-q)" }}>
        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-3 pb-4 m3-appbar">
          {/* Brand */}
          <div className="m3-brand">
            <img src="/pb-icon.png" alt="Project PB" className="w-10 h-10 rounded-xl shrink-0" />
            <div>
              <div className="pb-logo"><span>PROJECT</span><span className="dot" /><span className="pb">PB</span></div>
              <div className="pb-sub">Neural Hypertrophy Engine</div>
            </div>
          </div>

          {/* Sync controls */}
          <div className="flex items-center gap-2">
            {isFirebaseReady && auth ? (
              state.user ? (
                <button onClick={handleGoogleLogout} title="Log out" className="m3-gsync">
                  {state.user.photoURL ? (
                    <img src={state.user.photoURL} alt="avatar" referrerPolicy="no-referrer" className="w-5 h-5 rounded-full" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{state.user.displayName?.split(" ")[0] || "Synced"}</span>
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button onClick={handleGoogleLogin} className="m3-gsync">
                  <LogIn className="w-4 h-4" />
                  Sync
                </button>
              )
            ) : (
              <div className="m3-gsync" title="Local-only cache">
                <CloudLightning className="w-4 h-4" />
                <span className="hidden sm:inline">Local</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN BENTO GRID FRAMEWORK */}
      <main className="w-full max-w-4xl mx-auto px-4 md:px-6 relative z-10 min-h-[82vh]" style={{ paddingTop: "calc(env(safe-area-inset-top) + 88px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 108px)" }}>
        <div className="w-full">

          {/* ADVANCE NOTIFICATION PERMISSIONS PRIMING CARD */}
          <AnimatePresence>
            {!dismissedNotificationBanner && notificationPermission === "default" && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="mb-6 bg-gradient-to-r from-indigo-950/45 via-purple-950/35 to-[#16122d]/60 border border-indigo-500/30 rounded-2xl p-5 shadow-[0_0_25px_rgba(99,102,241,0.15)] relative overflow-hidden"
              >
                {/* Background light glow decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl shrink-0 shadow-lg animate-bounce" style={{ animationDuration: "3s" }}>
                      <Bell className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="text-left space-y-1">
                      <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm md:text-base leading-snug">Enable Lock-Screen Alerts & Rest Cues</h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-normal max-w-xl">
                        To guarantee reliable lock-screen updates, vibration alerts during rest intervals, and metabolic pacing cues on your Android home screen even with display sleep, authorize system notifications in advance.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col lg:flex-row items-center sm:items-stretch lg:items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => {
                        if (typeof window !== "undefined" && "Notification" in window) {
                          Notification.requestPermission().then((perm) => {
                            setNotificationPermission(perm);
                            if (perm === "granted") {
                              try {
                                new Notification("Alerts Configured! ⚡", {
                                  body: "Project PB will deliver persistent timer counters and set summaries.",
                                  icon: "/logo.svg"
                                });
                              } catch (e) {
                                console.warn("Fallback system notification error:", e);
                              }
                            }
                          });
                        }
                      }}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center"
                    >
                      Enable Alerts
                    </button>
                    <button
                      onClick={() => {
                        sessionStorage.setItem("projectpb_dismissed_noti_banner", "true");
                        setDismissedNotificationBanner(true);
                      }}
                      className="flex-1 sm:flex-initial px-3 py-2 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-white/10 hover:text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-white/5 text-gray-500 dark:text-slate-400 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* TAB SECTOR CONTROLS (Full symmetric width block) */}
          <section className="space-y-6">

            {/* TAB SCREENS CONDITIONAL PRESENTATION */}
            <AnimatePresence mode="wait" custom={navDir.current}>
              <motion.div
                key={activeTab}
                custom={navDir.current}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d >= 0 ? 40 : -40 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d: number) => ({ opacity: 0, x: d >= 0 ? -40 : 40 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 360, damping: 34, mass: 0.85 }}
              >
                {/* Always render ActiveWorkout so background timers and service worker listeners continue */}
                <WorkoutTabSegment activeTab={activeTab}>
                  {state.activeWorkout ? (
                    <Suspense fallback={<TabSkeleton />}>
                    <ActiveWorkout
                      session={state.activeWorkout}
                      exercisesList={state.exercises}
                      history={state.history}
                      onAddSet={state.addSetToExercise}
                      onUpdateSet={state.updateSetInExercise}
                      onRemoveSet={state.removeSetFromExercise}
                      onAddExercise={state.addExerciseToActiveWorkout}
                      onRemoveExercise={state.removeExerciseFromActiveWorkout}
                      onUpdateNotes={state.updateActiveNotes}
                      onFinish={() => {
                        setRestTimerTarget(null);
                        cancelServiceWorkerTimer();
                        handleFinishWorkout();
                      }}
                      onDiscard={() => {
                        setRestTimerTarget(null);
                        cancelServiceWorkerTimer();
                        state.discardWorkout();
                      }}
                      onAddCustomExercise={state.addCustomExercise}
                      exerciseNotes={state.exerciseNotes}
                      onUpdateExerciseNotes={state.updateExerciseNotes}
                      onUpdateExerciseBarWeight={state.updateExerciseBarWeight}
                      onUpdateWorkout={state.updateActiveWorkout}
                      restTimerTarget={restTimerTarget}
                      setRestTimerTarget={setRestTimerTarget}
                      activeTab={activeTab}
                    />
                    </Suspense>
                  ) : activeTab === "workouts" ? (
                    // Launching screen if no session active yet
                    <div className="space-y-4">
                      {/* Cloud backup card */}
                      {!state.user && isFirebaseReady && auth && (
                        <div className="m3-card">
                          <span className="m3-eyebrow primary">
                            <LogIn className="w-3.5 h-3.5" />
                            Cloud backup
                          </span>
                          <h2 className="m3-h">Sync your metrics across devices</h2>
                          <p className="m3-body">Connect Google to preserve completed sets, strength milestones, and custom templates on secure cloud.</p>
                          <div style={{ height: "16px" }} />
                          <button onClick={handleGoogleLogin} className="m3-btn tonal-primary">
                            <LogIn className="w-5 h-5" />
                            Log in with Google
                          </button>
                        </div>
                      )}

                      {/* Start a new session card */}
                      <div className="m3-card hi" style={{ textAlign: "center" }}>
                        <div className="m3-shape lg center">
                          <svg className="sf" viewBox="0 0 100 100"><use href="#shape-sunny" fill="var(--m3-primary-cont)" /></svg>
                          <span className="si"><Dumbbell size={36} style={{ color: "var(--m3-primary)" }} /></span>
                        </div>
                        <h2 className="m3-h center">Start a new lifting session</h2>
                        <p className="m3-body center">Track weights, reps and warm-ups. In-depth exercise counts and history, backed up automatically.</p>
                        <div style={{ height: "16px" }} />
                        <div className="m3-stack">
                          <button
                            onClick={() => { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10); setRestTimerTarget(null); cancelServiceWorkerTimer(); state.startWorkout("Blank Routine"); }}
                            className="m3-btn accent"
                          >
                            <Sparkles className="w-5 h-5" />
                            Quick empty session
                          </button>
                          <button
                            onClick={() => { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10); setActiveTab("templates"); }}
                            className="m3-btn tonal"
                          >
                            Browse routines
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </WorkoutTabSegment>

                {activeTab === "history" && (
                  <Suspense fallback={<TabSkeleton />}>
                    <HistoryLogs
                      history={state.history}
                      exercisesList={state.exercises}
                      onDeleteLog={state.deleteHistoryLog}
                      onAskGemini={handlePropagatePromptToGemini}
                      onViewAnalysis={(session) => setLatestCompletedWorkout(session)}
                    />
                  </Suspense>
                )}

                {activeTab === "templates" && (
                  <Suspense fallback={<TabSkeleton />}>
                  <TemplatesList
                    templates={state.templates}
                    exercisesList={state.exercises}
                    historyList={state.history}
                    userProfile={state.userProfile}
                    onStartBlank={() => {
                      setRestTimerTarget(null);
                      cancelServiceWorkerTimer();
                      state.startWorkout("Blank Routine");
                      setActiveTab("workouts");
                    }}
                    onStartFromTemplate={(tid) => {
                      setRestTimerTarget(null);
                      cancelServiceWorkerTimer();
                      state.startWorkout("", tid);
                      setActiveTab("workouts");
                    }}
                    onCreateTemplate={state.createTemplate}
                    onDeleteTemplate={state.deleteTemplate}
                  />
                  </Suspense>
                )}

                {activeTab === "exercises" && (
                  <Suspense fallback={<TabSkeleton />}>
                    <ExerciseLibrary
                      exercises={state.exercises}
                      onAddCustomExercise={state.addCustomExercise}
                      onUpdateCustomExercise={state.updateCustomExercise}
                      onImportCustomExercises={state.importCustomExercises}
                    />
                  </Suspense>
                )}

                {activeTab === "account" && (
                  <Suspense fallback={<TabSkeleton />}>
                    <AccountSettings
                      state={state}
                      theme={theme}
                      setTheme={setTheme}
                      isFirebaseReady={isFirebaseReady}
                      auth={auth}
                      handleGoogleLogin={handleGoogleLogin}
                      handleGoogleLogout={handleGoogleLogout}
                      handleCreateSpreadsheet={handleCreateSpreadsheet}
                      handleSyncAllHistory={handleSyncAllHistory}
                      isSyncingAllHistory={isSyncingAllHistory}
                      isCreatingSheet={isCreatingSheet}
                      sheetsSyncMessage={sheetsSyncMessage}
                      setSheetsSyncMessage={setSheetsSyncMessage}
                      isEditingProfile={isEditingProfile}
                      setIsEditingProfile={setIsEditingProfile}
                    />
                  </Suspense>
                )}
              </motion.div>
            </AnimatePresence>
          </section>

        </div>


      </main>

      {/* UNIFIED PREMIUM FLOATING BOTTOM CONSOLE & NAVIGATION DOCK WITH BREATHING GLOW */}
      {/* Floating bottom nav + active-workout banner */}
      <div className="fixed left-0 right-0 bottom-0 z-45">
        <AnimatePresence>
          <WorkoutBanner activeWorkout={state.activeWorkout} setActiveTab={setActiveTab} activeTab={activeTab} exercises={state.exercises} restTimerTarget={restTimerTarget} showSwipeUpInfo={showSwipeUpInfo} setShowSwipeUpInfo={setShowSwipeUpInfo} />
        </AnimatePresence>
        <nav className="m3-nav">
          {[
            { key: "workouts", label: "Workout", Icon: Dumbbell },
            { key: "history", label: "History", Icon: History },
            { key: "templates", label: "Routines", Icon: Layers },
            { key: "exercises", label: "Library", Icon: Info },
            { key: "account", label: state.user ? "Account" : "Login", Icon: User },
          ].map(({ key, label, Icon }) => (
            <a
              key={key}
              className={activeTab === key ? "on" : ""}
              onClick={() => goToTab(key as typeof activeTab)}
            >
              <span className="pill"><Icon className="w-5 h-5" /></span>
              <span className="lbl">{label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* DETAILED WORKOUT COMPLETED SPLASH CONGRATULATIONS SCENE */}
      {latestCompletedWorkout && (
        <WorkoutSplashScene
          completedWorkout={latestCompletedWorkout}
          history={state.history}
          exercisesList={state.exercises}
          onClose={() => setLatestCompletedWorkout(null)}
          onSaveAnalysis={(ans) => {
            state.saveWorkoutAnalysis(latestCompletedWorkout.id, ans);
            setLatestCompletedWorkout((prev) => prev ? ({ ...prev, analysis: ans }) : null);
          }}
        />
      )}

      {/* GLOBAL INTERACTIVE EXERCISE DEMONSTRATION & FORMGUIDE SCREEN */}
      <AnimatePresence>
        {showSwipeUpInfo && state.activeWorkout && (
          <>
            {/* Backdrop click barrier to prevent background touches, tapping backdrop-blur dismisses */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5);
                setShowSwipeUpInfo(false);
              }}
              className="fixed inset-0 z-48 bg-black/40 dark:bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              drag="y"
              dragConstraints={{ top: -250, bottom: 250 }}
              dragElastic={{ top: 0.5, bottom: 0.5 }}
              onDragStart={() => {
                isDraggingInfoRef.current = true;
              }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 60 || info.velocity.y > 100) {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5);
                  setShowSwipeUpInfo(false);
                } else if (info.offset.y < -60 || info.velocity.y < -100) {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                  setActiveTab("workouts");
                  setShowSwipeUpInfo(false);
                }
                setTimeout(() => {
                  isDraggingInfoRef.current = false;
                }, 100);
              }}
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "110%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              style={{ background: "var(--m3-sc)", border: "1px solid var(--m3-outline-q)" }}
              className="fixed bottom-28 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-md z-49 text-gray-900 dark:text-white p-4 pt-2 shadow-2xl rounded-[28px] cursor-pointer text-left select-none"
              onTap={() => {
                if (!isDraggingInfoRef.current) {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                  setActiveTab("workouts");
                  setShowSwipeUpInfo(false);
                }
              }}
            >
              {/* Drag Indicator Top Handle */}
              <div className="flex justify-center pb-2.5 pointer-events-none">
                <div className="w-12 h-1 rounded-full bg-gray-300 dark:bg-zinc-700/80" />
              </div>

              {/* Header with pill indicators */}
              <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 dark:border-white/10 pb-2">
                <div className="flex items-center space-x-2">
                  <Dumbbell className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  <span className="font-mono font-black text-[10px] tracking-wider text-indigo-650 dark:text-indigo-300 uppercase">Set Intelligence</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[7.5px] uppercase font-mono font-black text-gray-400 dark:text-gray-500 animate-pulse">
                    Swipe Up or Down
                  </span>
                </div>
              </div>

              {/* Workout Details */}
              {(() => {
                const currentEx = state.activeWorkout && state.activeWorkout.exercises && state.activeWorkout.exercises.length > 0
                  ? (state.activeWorkout.exercises.find((ex: any) => ex.sets.some((set: any) => !set.isCompleted)) || state.activeWorkout.exercises[state.activeWorkout.exercises.length - 1])
                  : null;
                const exDef = currentEx ? state.exercises?.find((e: any) => e.id === currentEx.exerciseId) : null;

                if (!currentEx || !exDef) {
                  return <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400 italic">No exercise notes or set details are currently loaded.</p>;
                }

                return (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-black text-sm text-gray-900 dark:text-white leading-tight">
                        {exDef.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[9px] text-gray-500 dark:text-gray-300 mt-1 uppercase font-bold font-mono">
                        <span className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">{exDef.category}</span>
                        <span>•</span>
                        <span className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">{exDef.equipment}</span>
                        {currentEx.barWeight !== undefined && currentEx.barWeight > 0 && (
                          <>
                            <span>•</span>
                            <span className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">{currentEx.barWeight}kg Bar</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Vertical sets listing */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-mono">Sets Progress</span>
                      <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1">
                        {currentEx.sets.map((set: any, idx: number) => {
                          const isCurrent = !set.isCompleted && (idx === 0 || currentEx.sets[idx - 1]?.isCompleted);
                          return (
                            <div 
                              key={set.id}
                              className={`flex items-center justify-between p-2 rounded-lg text-xs leading-none border transition-all ${
                                set.isCompleted 
                                  ? "bg-emerald-500/10 dark:bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                                  : isCurrent
                                  ? "bg-indigo-500/5 dark:bg-indigo-500/20 border-indigo-500/30 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-extrabold shadow-sm"
                                  : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  set.isCompleted
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                    : isCurrent
                                    ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
                                    : "bg-gray-200/60 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                                }`}>
                                  Set {idx + 1}
                                </span>
                                {set.type !== "normal" && (
                                  <span className="text-[8px] font-mono font-black tracking-wider uppercase px-1 rounded bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                    {set.type}
                                  </span>
                                )}
                                <span className="font-semibold text-[11px] text-gray-800 dark:text-gray-200">{set.weight} kg × {set.reps} reps</span>
                              </div>
                              
                              <div className="flex items-center">
                                {set.isCompleted ? (
                                  <span className="bg-emerald-600 dark:bg-emerald-500 text-white rounded-full p-0.5 flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </span>
                                ) : isCurrent ? (
                                  <span className="text-[8px] font-bold bg-indigo-600 dark:bg-indigo-550 text-white rounded px-1.5 py-0.5 font-mono animate-pulse">
                                    ACTIVE
                                  </span>
                                ) : (
                                  <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-white/15" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Coach Tip or Notes */}
                    {(exDef.coachTip || currentEx.notes) && (
                      <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 dark:border-amber-500/20 rounded-xl p-2 space-y-0.5">
                        <span className="text-[8px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block">💡 Advice / Coach Note</span>
                        <p className="text-[10px] text-gray-700 dark:text-gray-200 italic leading-snug">
                          {currentEx.notes || exDef.coachTip}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="text-center pt-2 mt-2 border-t border-gray-200/60 dark:border-white/10">
                <span className="text-[8.5px] font-extrabold text-gray-400 dark:text-gray-450 uppercase tracking-widest font-mono">
                  Tap / Drag Up to focus session • Drag Down to close
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ExerciseGuideModal />

      {/* GEMINI WORKOUT CLINICIAN GLOWING OVERLAY SCREEN */}
      <AnimatePresence>
        {showAiOverlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur with ease-out fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAiOverlay(false);
                setActiveAIPrompt(null);
              }}
              className="absolute inset-0 bg-white dark:bg-black backdrop-blur-md"
            />

            {/* Backlight Ambient Glow Aura */}
            <div className="absolute w-[95%] max-w-2xl md:max-w-4xl lg:max-w-5xl h-[88vh] max-h-[760px] bg-gradient-to-r from-indigo-500/30 via-violet-500/25 to-purple-500/30 rounded-3xl blur-3xl opacity-80 pointer-events-none animate-pulse" />

            {/* Glowing Gemini Card Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                boxShadow: [
                  "0 0 25px rgba(99, 102, 241, 0.35), 0 0 12px rgba(168, 85, 247, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.1)",
                  "0 0 45px rgba(139, 92, 246, 0.65), 0 0 25px rgba(168, 85, 247, 0.50), 0 0 0 1.5px rgba(139, 92, 246, 0.35)",
                  "0 0 25px rgba(99, 102, 241, 0.35), 0 0 12px rgba(168, 85, 247, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.1)"
                ]
              }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{
                boxShadow: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                default: {
                  type: "spring",
                  damping: 24,
                  stiffness: 280
                }
              }}
              className="relative w-full max-w-2xl md:max-w-4xl lg:max-w-5xl h-[88vh] max-h-[760px] bg-white dark:bg-black rounded-3xl overflow-hidden flex flex-col border border-indigo-500/20 z-10"
            >
              {/* Header inside of Overlay with Gemini animation look */}
              <div className="p-4 bg-gradient-to-r from-indigo-950/20 via-[#101124] to-purple-950/20 border-b border-gray-200 dark:border-white/5 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white rounded-xl shadow-lg ring-1 ring-white/10">
                    <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm md:text-base text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-1.5 uppercase font-mono">
                      <span>Gemini Clinician</span>
                    </h3>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono leading-none mt-0.5">
                      Sports Science & Biomechanics Diagnostics
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setShowAiOverlay(false);
                      setActiveAIPrompt(null);
                    }}
                    className="p-1 px-3 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-gray-100 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-white/10 rounded-xl transition-all font-bold text-xs uppercase"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Chat feeds split viewport inside of Overlay */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10">
                
                {/* LEFT DATASET VISUALS PORTAL */}
                {(() => {
                  const historyList = [...(state.history || [])].reverse();
                  
                  // Workout analytics calculations
                  const totalCompletedCount = state.history?.length || 0;
                  let totalSetsCount = 0;
                  let maxEstimatedLoad = 0;
                  
                  const targetSlices: Record<string, number> = {
                    "Chest": 0,
                    "Back": 0,
                    "Legs": 0,
                    "Shoulders": 0,
                    "Arms": 0,
                    "Core": 0
                  };
                  
                  state.history?.forEach((session: any) => {
                    session.exercises?.forEach((ex: any) => {
                      const definition = state.exercises?.find((e: any) => e.id === ex.exerciseId);
                      const cat = definition?.category || "Other";
                      const checkedSets = ex.sets?.filter((s: any) => s.isCompleted);
                      const completedSetsCount = checkedSets?.length || 0;
                      
                      if (cat.toLowerCase().includes("chest")) targetSlices["Chest"] += completedSetsCount;
                      else if (cat.toLowerCase().includes("back")) targetSlices["Back"] += completedSetsCount;
                      else if (cat.toLowerCase().includes("leg")) targetSlices["Legs"] += completedSetsCount;
                      else if (cat.toLowerCase().includes("shoulder")) targetSlices["Shoulders"] += completedSetsCount;
                      else if (cat.toLowerCase().includes("arm") || cat.toLowerCase().includes("bicep") || cat.toLowerCase().includes("tricep")) targetSlices["Arms"] += completedSetsCount;
                      else if (cat.toLowerCase().includes("abs") || cat.toLowerCase().includes("core")) targetSlices["Core"] += completedSetsCount;
                      
                      totalSetsCount += completedSetsCount;
                      
                      ex.sets?.forEach((s: any) => {
                        if (s.isCompleted) {
                          const estVal = s.weight * (1 + (s.reps || 0) / 30);
                          if (estVal > maxEstimatedLoad) {
                            maxEstimatedLoad = estVal;
                          }
                        }
                      });
                    });
                  });

                  // Progression curves
                  const defaultWaveform = [
                    { marker: "W1", load: 2400 },
                    { marker: "W2", load: 2850 },
                    { marker: "W3", load: 3100 },
                    { marker: "W4", load: 3650 },
                    { marker: "W5", load: 4200 }
                  ];

                  const tonnageLogs = historyList.map((session: any, idx: number) => {
                    let volume = 0;
                    session.exercises?.forEach((ex: any) => {
                      ex.sets?.forEach((s: any) => {
                        if (s.isCompleted) {
                          volume += (s.weight || 0) * (s.reps || 0);
                        }
                      });
                    });
                    return {
                      marker: `S${idx + 1}`,
                      load: volume || 1900,
                    };
                  });

                  const finalOverloadCurve = tonnageLogs.length >= 3 
                    ? tonnageLogs.slice(-6) 
                    : defaultWaveform;

                  const widthSVG = 320;
                  const heightSVG = 110;
                  const loadArray = finalOverloadCurve.map(x => x.load);
                  const maxL = Math.max(...loadArray, 2000) || 5000;
                  const minL = Math.min(...loadArray, 500) || 1000;
                  const deltaL = (maxL - minL) || 1200;

                  const plottedPoints = finalOverloadCurve.map((item, index) => {
                    const xCoord = ((index) / (finalOverloadCurve.length - 1)) * (widthSVG - 30) + 15;
                    const yCoord = heightSVG - ((item.load - minL) / deltaL) * (heightSVG - 35) - 15;
                    return { x: xCoord, y: yCoord, load: item.load, marker: item.marker };
                  });

                  let pathDCoord = "";
                  let fillDCoord = "";
                  if (plottedPoints.length > 0) {
                    pathDCoord = `M ${plottedPoints[0].x} ${plottedPoints[0].y}`;
                    for (let i = 1; i < plottedPoints.length; i++) {
                      const prevPt = plottedPoints[i - 1];
                      const currPt = plottedPoints[i];
                      const cp1xCoord = prevPt.x + (currPt.x - prevPt.x) / 2;
                      const cp1yCoord = prevPt.y;
                      const cp2xCoord = prevPt.x + (currPt.x - prevPt.x) / 2;
                      const cp2yCoord = currPt.y;
                      pathDCoord += ` C ${cp1xCoord} ${cp1yCoord}, ${cp2xCoord} ${cp2yCoord}, ${currPt.x} ${currPt.y}`;
                    }
                    fillDCoord = `${pathDCoord} L ${plottedPoints[plottedPoints.length - 1].x} ${heightSVG} L ${plottedPoints[0].x} ${heightSVG} Z`;
                  }

                  return (
                    <div className="w-full md:w-[360px] h-[250px] md:h-full p-5 bg-white dark:bg-black flex flex-col space-y-4 overflow-y-auto shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/5">
                      <div className="space-y-1.5 flex-none">
                        <span className="text-[10px] text-indigo-400 font-extrabold tracking-widest uppercase font-mono">
                          Biometrics Telemetry Console
                        </span>
                        <h4 className="text-base font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-none">
                          Clinical Dataset Highlight
                        </h4>
                        <p className="text-[10px] text-slate-450 text-gray-500 dark:text-slate-400 font-normal">
                          Live sensory feedback aggregated across {totalCompletedCount} total logged physiological workouts.
                        </p>
                      </div>

                      {/* STATS BENTO ROW */}
                      <div className="grid grid-cols-2 gap-2.5 flex-none">
                        <div className="p-3 bg-white/2 border border-gray-200 dark:border-white/5 rounded-xl">
                          <span className="text-[9px] text-indigo-600 dark:text-indigo-300 font-bold font-mono tracking-wider uppercase block">Total Weight Logs</span>
                          <span className="text-lg font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mt-1 block font-mono">{totalSetsCount} <span className="text-[11px] text-gray-500 dark:text-slate-400 font-normal">sets</span></span>
                        </div>
                        <div className="p-3 bg-white/2 border border-gray-200 dark:border-white/5 rounded-xl">
                          <span className="text-[9px] text-indigo-600 dark:text-indigo-300 font-bold font-mono tracking-wider uppercase block">Estimated Peak 1RM</span>
                          <span className="text-lg font-extrabold text-emerald-400 tracking-tight mt-1 block font-mono">
                            {maxEstimatedLoad > 0 ? `${Math.round(maxEstimatedLoad)}kg` : "None"}
                          </span>
                        </div>
                      </div>

                      {/* TONNAGE VECTOR WAVEFORM GRAPH */}
                      <div className="p-4 bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl relative overflow-hidden space-y-2 flex-none">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
                            Tonnage progression
                          </span>
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-widest leading-none">
                            Overload curve
                          </span>
                        </div>

                        {/* RENDER CUSTOM SVG CURVE GRAPH */}
                        <div className="relative h-[110px] w-full mt-2">
                          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${widthSVG} ${heightSVG}`}>
                            <defs>
                              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            
                            {/* Grid background markers */}
                            <line x1="0" y1={heightSVG / 2} x2={widthSVG} y2={heightSVG / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3"/>
                            <line x1="0" y1={heightSVG - 2} x2={widthSVG} y2={heightSVG - 2} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>

                            {plottedPoints.length > 0 && (
                              <>
                                {/* Fill gradient under the path */}
                                <path d={fillDCoord} fill="url(#curveGradient)" />

                                {/* Glowing curve line */}
                                <path d={pathDCoord} fill="none" stroke="#6366f1" strokeWidth="2.5" className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />

                                {/* Interactive point indicators */}
                                {plottedPoints.map((pt, i) => (
                                  <g key={i}>
                                    <circle cx={pt.x} cy={pt.y} r="3" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />
                                    {/* Small numeric text on start & peak values */}
                                    {(i === 0 || i === plottedPoints.length - 1 || pt.load === maxL) && (
                                      <text x={pt.x} y={pt.y - 8} fill="#a5b4fc" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                                        {Math.round(pt.load)}kg
                                      </text>
                                    )}
                                    {/* Date/Marker tag underneath */}
                                    <text x={pt.x} y={heightSVG - 2} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle" alignmentBaseline="hanging">
                                      {pt.marker}
                                    </text>
                                  </g>
                                ))}
                              </>
                            )}
                          </svg>
                        </div>
                      </div>

                      {/* MUSCULAR LOAD STIMULATION SUMMARY BAR CHART */}
                      <div className="p-4 bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl space-y-3 flex-1 flex flex-col justify-between min-h-[200px]">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-gray-600 dark:text-slate-300 uppercase tracking-widest block">
                            Target stimulation index
                          </span>
                          <span className="text-[9px] text-slate-500 font-normal leading-normal">
                            Hypertrophy volume division tracked from exercises logged
                          </span>
                        </div>

                        <div className="space-y-2.5 pt-1 flex-1 flex flex-col justify-center">
                          {Object.keys(targetSlices).map(muscle => {
                            const valCount = targetSlices[muscle];
                            const maxVal = Math.max(...Object.values(targetSlices), 1);
                            const percent = Math.min(100, Math.round((valCount / maxVal) * 100));

                            return (
                              <div key={muscle} className="space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-extrabold text-gray-800 dark:text-slate-200">{muscle} Core</span>
                                  <span className="font-bold text-indigo-600 dark:text-indigo-300 font-mono">{valCount} sets</span>
                                </div>
                                <div className="h-1.5 w-full bg-white dark:bg-black dark:border-white/10 shadow-sm rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                                    style={{ width: `${valCount > 0 ? Math.max(10, percent) : 0}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* RIGHT CHAT EVALUATION FEED */}
                <div className="flex-1 h-full flex flex-col overflow-hidden bg-transparent">
                  <AIAssistant 
                    workoutState={state}
                    initialPrompt={activeAIPrompt}
                    evaluationOnly={true}
                  />
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- End of App.tsx ---
