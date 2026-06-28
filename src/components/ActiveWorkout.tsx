/**
 * Author: Google AI Studio Coding Agent
 * OS support: Linux, macOS, Windows
 * Description: Active Workout session manager with fine-tuned metrics and duration trackers.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { haptics } from "../lib/haptics";
import {
  Play,
  Check,
  Plus,
  Trash2,
  Pause,
  X,
  Timer,
  Clock,
  Dumbbell,
  CheckCircle2,
  ListFilter,
  Save,
  AlertTriangle,
  Sparkles,
  History,
  CheckCircle,
  Bell,
  ChevronRight,
  Search,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { WorkoutSession, WorkoutExercise, WorkoutSet, Exercise, SetType } from "../types";
import { motion, AnimatePresence, useMotionValue, useTransform, useDragControls } from "motion/react";
import { openExerciseGuide } from "./ExerciseGuideModal";
import { getNotificationService } from "../services/notifications";

// Shared notification layer. The web implementation talks to the service worker
// today; a Capacitor-backed native implementation can be swapped in later
// without touching this component (see src/services/notifications/index.ts).
const notificationService = getNotificationService();

interface ActiveWorkoutProps {
  session: WorkoutSession;
  exercisesList: Exercise[];
  history: WorkoutSession[];
  onAddSet: (exerciseId: string) => void;
  onUpdateSet: (exerciseId: string, setIndex: number, fields: Partial<WorkoutSet>) => void;
  onRemoveSet: (exerciseId: string, setIndex: number) => void;
  onAddExercise: (exerciseId: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateWorkout: (session: WorkoutSession) => void;
  onFinish: () => void;
  onDiscard: () => void;
  onAddCustomExercise?: (name: string, category: string, equipment: string) => Promise<Exercise>;
  exerciseNotes?: Record<string, string>;
  onUpdateExerciseNotes?: (exerciseId: string, notes: string) => Promise<void>;
  onUpdateExerciseBarWeight?: (exerciseId: string, barWeight: number) => void;
  restTimerTarget?: { endTime: number; total: number; exerciseName: string } | null;
  setRestTimerTarget?: React.Dispatch<React.SetStateAction<{ endTime: number; total: number; exerciseName: string } | null>>;
  activeTab?: string;
}

interface AnimatedTickButtonProps {
  isCompleted: boolean;
  onClick: () => void;
}

function AnimatedTickButton({ isCompleted, onClick }: AnimatedTickButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: 1.15 }}
      onClick={onClick}
      type="button"
      className="relative w-5.5 h-5.5 rounded-md flex items-center justify-center border-0 mx-auto cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
    >
      {/* Small surround glow layer when completed */}
      <motion.div
        initial={false}
        animate={
          isCompleted
            ? {
                scale: [1, 1.15, 1],
                boxShadow: [
                  "0 0 0px rgba(52, 211, 153, 0)",
                  "0 0 10px rgba(52, 211, 153, 0.85)",
                  "0 0 16px rgba(52, 211, 153, 0.5)",
                  "0 0 6px rgba(52, 211, 153, 0.3)",
                ],
                borderColor: ["rgba(255,255,255,0.2)", "#34d399", "#10b981", "#059669"],
              }
            : {
                scale: 1,
                boxShadow: "0 0 0px rgba(0,0,0,0)",
                borderColor: "rgba(39, 212, 136, 0.9)",
              }
        }
        transition={{
          duration: 0.55,
          times: [0, 0.3, 0.7, 1],
          ease: "easeInOut",
        }}
        className={`absolute inset-0 rounded-lg border-2 ${
          isCompleted ? "bg-emerald-600/90 border-emerald-500" : "border-emerald-500/80 hover:bg-emerald-500/10"
        } transition-colors duration-250`}
      />

      {/* Pop-in green tick check icon */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 480,
              damping: 14,
              delay: 0.18, // delay the checkmark popping in to let the border glow display first!
            }}
            className="relative z-10 text-gray-900 dark:text-gray-100 flex items-center justify-center"
          >
            <Check className="w-3.5 h-3.5 text-gray-900 dark:text-gray-100" strokeWidth={3.5} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

interface RestTimerOverlayProps {
  key?: React.Key;
  target: { endTime: number; total: number; exerciseName: string };
  onCancel: () => void;
  onReachedZero: () => void;
  onAddSeconds: (secs: number) => void;
  onSubtractSeconds: (secs: number) => void;
  session: any;
  exercisesList: any[];
  activeTab?: string;
}

function RestTimerOverlay({
  target,
  onCancel,
  onReachedZero,
  onAddSeconds,
  onSubtractSeconds,
  session,
  exercisesList,
  activeTab,
}: RestTimerOverlayProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    return Math.max(0, Math.ceil((target.endTime - Date.now()) / 1000));
  });
  const hasAlertedZeroRef = useRef<number | null>(null);

  const formatTimerTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 1. Screen Wake Lock API integration
  useEffect(() => {
    let wakeLock: any = null;
    const requestLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
        }
      } catch (err) {
        console.warn("Screen Wake Lock could not be held:", err);
      }
    };
    requestLock();

    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  // The lock-screen rest notification is driven by the parent through the
  // NotificationService (see the rest effect in ActiveWorkout). This overlay is
  // purely the in-app countdown + audio/haptic cue. Cancelling clears the shared
  // restTimerTarget, which the parent relays to the notification layer.
  const handleManualCancel = () => {
    onCancel();
  };

  // 3. Client-side Countdown, Sound, and Haptics loop
  useEffect(() => {
    const calculateRemaining = () => {
      return Math.max(0, Math.ceil((target.endTime - Date.now()) / 1000));
    };

    setSecondsLeft(calculateRemaining());

    const intervalId = setInterval(() => {
      const rem = calculateRemaining();
      setSecondsLeft(rem);

      if (rem !== null && rem <= 5 && rem > 0) {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(120);
        }
      }

      if (rem === 0) {
        if (hasAlertedZeroRef.current !== target.endTime) {
          hasAlertedZeroRef.current = target.endTime;

          // Triple-Beep intense audio cue using Web Audio API (totally offline & highly reliable!)
          try {
            const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtxClass) {
              const audioCtx = new AudioCtxClass();
              const playBeep = (delayMs: number, durSeconds: number, frequencyHz: number) => {
                setTimeout(() => {
                  try {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.frequency.setValueAtTime(frequencyHz, audioCtx.currentTime);
                    osc.type = "sine";
                    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + durSeconds);
                    osc.start();
                    osc.stop(audioCtx.currentTime + durSeconds);
                  } catch (err) {}
                }, delayMs);
              };

              // Play 3 high-intensity beeps
              playBeep(0, 0.2, 880);
              playBeep(240, 0.2, 880);
              playBeep(480, 0.4, 1200);
            }
          } catch (err) {}

          // Notification haptic when the rest timer hits zero
          haptics.timerDone();
        }
        clearInterval(intervalId);
        // Don't end on our own (possibly stale) clock — the rest may have been
        // extended from the lock screen. Ask the parent to reconcile against the
        // service worker's authoritative end-time, which either keeps the timer
        // running (if extended) or ends it (if truly over).
        onReachedZero();
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [target, onReachedZero]);

  void activeTab;
  const pctRemaining = Math.max(0, Math.min(100, (secondsLeft / (target.total || 90)) * 100));

  // Active-timer bar — layout B (exact port of project-pb-workout-page.html .rt).
  // Sits inside the session card while resting.
  return (
    <div className="pbw-rt">
      <div className="fill" style={{ width: `${pctRemaining}%`, transition: "width 1s linear" }} />
      <div className="inner">
        <div className="toprow">
          <span className="cd">{formatTimerTime(secondsLeft)}</span>
          <div className="lab">
            <div className="t">Rest</div>
            <div className="s">Running in background</div>
          </div>
        </div>
        <div className="ctls">
          <button className="ctlbtn" onClick={() => onAddSeconds(30)}>+30s</button>
          <button className="ctlbtn" onClick={() => onSubtractSeconds(30)}>&minus;30s</button>
          <button className="skip" onClick={() => handleManualCancel()}>Skip</button>
        </div>
      </div>
    </div>
  );
}

interface ActiveWorkoutDurationProps {
  startTime: string;
}

function ActiveWorkoutDuration({ startTime }: ActiveWorkoutDurationProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    setSeconds(Math.floor((Date.now() - start) / 1000));

    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatWorkoutTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return <span>{formatWorkoutTime(seconds)}</span>;
}

interface ActiveRestCountdownProps {
  target: { endTime: number; total: number; exerciseName: string };
}

// Display-only countdown text. It never ends the rest itself — the parent
// reconciles against the service worker (see RestTimerOverlay.onReachedZero).
function ActiveRestCountdown({ target }: ActiveRestCountdownProps) {
  const [seconds, setSeconds] = useState(() => {
    return Math.max(0, Math.ceil((target.endTime - Date.now()) / 1000));
  });

  useEffect(() => {
    setSeconds(Math.max(0, Math.ceil((target.endTime - Date.now()) / 1000)));

    const intervalId = setInterval(() => {
      const left = Math.max(0, Math.ceil((target.endTime - Date.now()) / 1000));
      setSeconds(left);
      if (left <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [target.endTime]);

  const formatTimerTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return <span className="font-extrabold">{formatTimerTime(seconds)}</span>;
}

interface DiscardSwipeSliderProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

function DiscardSwipeSlider({ onSwipeLeft, onSwipeRight }: DiscardSwipeSliderProps) {
  const x = useMotionValue(0);
  const lastVibratedRef = useRef<"left" | "right" | "neutral" | "none">("none");

  // Track actual dark mode state dynamically and subscribe to changes
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Transform ambient track background based on drag X coordinate
  const containerBg = useTransform(x, [-110, 0, 110], [
    "rgba(244, 63, 94, 0.14)",
    isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(161, 161, 170, 0.08)",
    "rgba(16, 185, 129, 0.14)"
  ]);

  // Transform tracking radial glow directly under the slider handle
  const radialGlow = useTransform(x, (val) => {
    const percent = 50 + (val / 220) * 100;
    let r = 99, g = 102, b = 241;
    let opacity = 0.22;
    if (val < 0) {
      const t = Math.min(1, Math.abs(val) / 100);
      r = Math.round(99 + (244 - 99) * t);
      g = Math.round(102 + (63 - 102) * t);
      b = Math.round(241 + (94 - 241) * t);
      opacity = 0.22 + 0.48 * t;
    } else if (val > 0) {
      const t = Math.min(1, val / 100);
      r = Math.round(99 + (16 - 99) * t);
      g = Math.round(102 + (185 - 102) * t);
      b = Math.round(241 + (129 - 241) * t);
      opacity = 0.22 + 0.48 * t;
    }
    return `radial-gradient(circle 130px at ${percent}% 50%, rgba(${r}, ${g}, ${b}, ${opacity}) 0%, rgba(${r}, ${g}, ${b}, 0) 100%)`;
  });

  // Transform handle capsule background, border and glow smoothly
  const handleBg = useTransform(x, (val) => {
    if (val === 0) {
      return isDarkMode ? "rgba(39, 39, 42, 0.92)" : "rgba(255, 255, 255, 0.96)";
    }
    let r = 99, g = 102, b = 241;
    if (val < 0) {
      const t = Math.min(1, Math.abs(val) / 100);
      r = Math.round(99 + (244 - 99) * t);
      g = Math.round(102 + (63 - 102) * t);
      b = Math.round(241 + (94 - 241) * t);
    } else {
      const t = Math.min(1, val / 100);
      r = Math.round(99 + (16 - 99) * t);
      g = Math.round(102 + (185 - 102) * t);
      b = Math.round(241 + (129 - 241) * t);
    }
    return `rgba(${r}, ${g}, ${b}, 0.22)`;
  });

  const handleBorder = useTransform(x, (val) => {
    if (val === 0) {
      return isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
    }
    let r = 99, g = 102, b = 241;
    let alpha = 0.15;
    if (val < 0) {
      const t = Math.min(1, Math.abs(val) / 100);
      r = Math.round(99 + (244 - 99) * t);
      g = Math.round(102 + (63 - 102) * t);
      b = Math.round(241 + (94 - 241) * t);
      alpha = 0.15 + 0.35 * t;
    } else if (val > 0) {
      const t = Math.min(1, val / 100);
      r = Math.round(99 + (16 - 99) * t);
      g = Math.round(102 + (185 - 102) * t);
      b = Math.round(241 + (129 - 241) * t);
      alpha = 0.15 + 0.35 * t;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  });

  const handleShadow = useTransform(x, (val) => {
    if (val === 0) return isDarkMode ? "0 4px 12px rgba(0, 0, 0, 0.5)" : "0 4px 6px -1px rgba(0, 0, 0, 0.08)";
    let r = 99, g = 102, b = 241;
    if (val < 0) {
      const t = Math.min(1, Math.abs(val) / 100);
      r = Math.round(99 + (244 - 99) * t);
      g = Math.round(102 + (63 - 102) * t);
      b = Math.round(241 + (94 - 241) * t);
    } else {
      const t = Math.min(1, val / 100);
      r = Math.round(99 + (16 - 99) * t);
      g = Math.round(102 + (185 - 102) * t);
      b = Math.round(241 + (129 - 241) * t);
    }
    const intensity = Math.min(0.45, Math.abs(val) / 110 * 0.5);
    return `0 0 16px rgba(${r}, ${g}, ${b}, ${intensity})`;
  });

  // Smooth responsive transforms for text opacity: fade opposite instantly and fade target before handle reaches it
  const leftOpacity = useTransform(x, [-50, -10, 0, 10], [0, 1, 1, 0]);
  const leftScale = useTransform(x, [-110, 0], [1.12, 1]);

  const rightOpacity = useTransform(x, [-10, 0, 10, 50], [0, 1, 1, 0]);
  const rightScale = useTransform(x, [0, 110], [1, 1.12]);

  // Pill index bar indicator background color transform inside key/discard
  const barColor0 = useTransform(x, (val) => {
    let r = 99, g = 102, b = 241;
    let alpha = 0.4;
    if (val < 0) {
      const t = Math.min(1, Math.abs(val) / 100);
      r = Math.round(99 + (244 - 99) * t);
      g = Math.round(102 + (63 - 102) * t);
      b = Math.round(241 + (94 - 241) * t);
      alpha = 0.4 + 0.6 * t;
    } else if (val > 0) {
      const t = Math.min(1, val / 100);
      r = Math.round(99 + (16 - 99) * t);
      g = Math.round(102 + (185 - 102) * t);
      b = Math.round(241 + (129 - 241) * t);
      alpha = 0.4 + 0.6 * t;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  });

  const barColor1 = useTransform(x, (val) => {
    let r = 99, g = 102, b = 241;
    if (val < 0) {
      const t = Math.min(1, Math.abs(val) / 100);
      r = Math.round(99 + (244 - 99) * t);
      g = Math.round(102 + (63 - 102) * t);
      b = Math.round(241 + (94 - 241) * t);
    } else if (val > 0) {
      const t = Math.min(1, val / 100);
      r = Math.round(99 + (16 - 99) * t);
      g = Math.round(102 + (185 - 102) * t);
      b = Math.round(241 + (129 - 241) * t);
    }
    return `rgb(${r}, ${g}, ${b})`;
  });

  return (
    <motion.div 
      className="w-full h-14 rounded-2xl relative flex items-center justify-between px-4 border border-gray-200/80 dark:border-white/5 overflow-hidden shadow-inner cursor-pointer select-none"
      style={{ backgroundColor: containerBg }}
    >
      {/* Centered organic color-shifting radial glow trailing/tracking under handle */}
      <motion.div 
        className="absolute inset-0 pointer-events-none opacity-50 mix-blend-color-dodge"
        style={{ background: radialGlow }}
      />

      {/* Swipe Left Hint (Discard) - Moved further left and shrunk font size slightly with extra tracking */}
      <motion.div 
        className="absolute left-[20px] flex items-center select-none z-10 pointer-events-none"
        style={{
          opacity: leftOpacity,
          scale: leftScale,
        }}
      >
        <span className="text-[9px] font-mono font-black tracking-[0.12em] text-rose-500/75 dark:text-rose-450/80 uppercase">
          ← Discard
        </span>
      </motion.div>
      
      {/* Swipe Right Hint (Continue Workout) - Moved further right and shrunk font size slightly with extra tracking */}
      <motion.div 
        className="absolute right-[11px] flex items-center select-none z-10 pointer-events-none"
        style={{
          opacity: rightOpacity,
          scale: rightScale,
        }}
      >
        <span className="text-[9px] font-mono font-black tracking-[0.12em] text-emerald-500/75 dark:text-emerald-400/80 uppercase">
          Continue →
        </span>
      </motion.div>

      {/* Centered Draggable Handle Capsule - Shrunk to w-14 and h-10 for superior breathing room */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          drag="x"
          dragConstraints={{ left: -110, right: 110 }}
          dragElastic={0.12}
          dragSnapToOrigin={true}
          style={{
            x,
            backgroundColor: handleBg,
            borderColor: handleBorder,
            boxShadow: handleShadow,
          }}
          onDrag={(e, info) => {
            const currentX = x.get();
            // Premium incremental haptic step-triggers as they slide closer to boundaries
            if (currentX <= -70) {
              if (lastVibratedRef.current !== "left") {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                lastVibratedRef.current = "left";
              }
            } else if (currentX >= 70) {
              if (lastVibratedRef.current !== "right") {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                lastVibratedRef.current = "right";
              }
            } else {
              if (Math.abs(currentX) < 15) {
                if (lastVibratedRef.current !== "neutral") {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(3);
                  lastVibratedRef.current = "neutral";
                }
              } else if (lastVibratedRef.current !== "none") {
                lastVibratedRef.current = "none";
              }
            }
          }}
          onDragEnd={(e, info) => {
            const currentX = x.get();
            lastVibratedRef.current = "none";
            
            if (currentX < -70) {
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([15, 55]);
              onSwipeLeft(); // Left boundary reached -> trigger Discard
            } else if (currentX > 70) {
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
              onSwipeRight(); // Right boundary reached -> trigger Keep
            }
          }}
          className="pointer-events-auto w-14 h-10 rounded-xl border flex items-center justify-center cursor-grab active:cursor-grabbing backdrop-blur-md select-none shadow-sm"
        >
          {/* Futuristic needle bar indicator pins */}
          <div className="flex items-center space-x-1 rounded-lg">
            <motion.span className="w-[3px] h-3 rounded-full" style={{ backgroundColor: barColor0 }} />
            <motion.span className="w-[3px] h-4.5 rounded-full" style={{ backgroundColor: barColor1 }} />
            <motion.span className="w-[3px] h-3 rounded-full" style={{ backgroundColor: barColor0 }} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function formatDurationMMSS(totalSeconds: number): string {
  if (!totalSeconds) return "";
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function parseDurationMMSS(val: string): number {
  const clean = val.replace(/[^\d:]/g, '');
  if (!clean) return 0;
  const parts = clean.split(':');
  if (parts.length === 1) {
    return parseInt(parts[0], 10) || 0;
  }
  const m = parseInt(parts[0], 10) || 0;
  const s = parseInt(parts[1], 10) || 0;
  return (m * 60) + s;
}

function getSliderColourTheme(rpe: number) {
  if (rpe <= 4) return { 
    accent: "accent-sky-400 dark:accent-sky-500", 
    text: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-200 dark:border-sky-500/30"
  };
  if (rpe <= 7) return { 
    accent: "accent-amber-400 dark:accent-amber-500", 
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30"
  };
  return { 
    accent: "accent-rose-500 dark:accent-rose-500", 
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200 dark:border-rose-500/30"
  };
}

function getRpeColor(rpe: number): string {
  if (rpe <= 3) return "rgb(16, 185, 129)";
  if (rpe <= 6) return "rgb(99, 102, 241)";
  if (rpe <= 8) return "rgb(245, 158, 11)";
  return "rgb(239, 68, 68)";
}

function getRpeBgColor(rpe: number): string {
  if (rpe <= 3) return "rgba(16, 185, 129, 0.12)";
  if (rpe <= 6) return "rgba(99, 102, 241, 0.12)";
  if (rpe <= 8) return "rgba(245, 158, 11, 0.12)";
  return "rgba(239, 68, 68, 0.12)";
}

function getRpeGlow(rpe: number): string {
  if (rpe <= 3) return "0 0 20px rgba(16, 185, 129, 0.4)";
  if (rpe <= 6) return "0 0 20px rgba(99, 102, 241, 0.45)";
  if (rpe <= 8) return "0 0 20px rgba(245, 158, 11, 0.45)";
  return "0 0 25px rgba(239, 68, 68, 0.55)";
}

function getRpeLabel(rpe: number): string {
  if (rpe <= 2) return "Very Light Effort";
  if (rpe <= 4) return "Light Warm-up Pace";
  if (rpe <= 6) return "Moderate Challenge";
  if (rpe <= 7) return "Hard & Strong Effort";
  if (rpe === 8) return "Very Hard (2 reps in reserve)";
  if (rpe === 9) return "Near Maximal (1 rep in reserve)";
  return "Maximal Exertion (Absolute limit)";
}

function getRpeLabelParts(rpe: number): { main: string; bracket?: string } {
  if (rpe <= 2) return { main: "Very Light Effort" };
  if (rpe <= 4) return { main: "Light Warm-up Pace" };
  if (rpe <= 6) return { main: "Moderate Challenge" };
  if (rpe <= 7) return { main: "Hard & Strong Effort" };
  if (rpe === 8) return { main: "Very Hard", bracket: "(2 reps in reserve)" };
  if (rpe === 9) return { main: "Near Maximal", bracket: "(1 rep in reserve)" };
  return { main: "Maximal Exertion", bracket: "(Absolute Limit)" };
}

export default function ActiveWorkout({
  session,
  exercisesList,
  history,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onAddExercise,
  onRemoveExercise,
  onUpdateNotes,
  onUpdateWorkout,
  onFinish,
  onDiscard,
  onAddCustomExercise,
  exerciseNotes = {},
  onUpdateExerciseNotes,
  onUpdateExerciseBarWeight,
  restTimerTarget: externalRestTimerTarget,
  setRestTimerTarget: externalSetRestTimerTarget,
  activeTab,
}: ActiveWorkoutProps) {
  const [showNoCompletedSetsModal, setShowNoCompletedSetsModal] = useState(false);
  const [emptyWorkoutAction, setEmptyWorkoutAction] = useState<"continue" | "discard">("continue");
  const [draggingSetId, setDraggingSetId] = useState<string | null>(null);
  // Tracks whether the current swipe is past the delete threshold, so the
  // threshold-cross haptic fires exactly once per crossing (not every frame).
  const swipeArmedRef = useRef(false);
  const [activeRpeSlide, setActiveRpeSlide] = useState<string | null>(null);
  const [draggingExerciseId, setDraggingExerciseId] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [showAddCustomInline, setShowAddCustomInline] = useState(false);
  const [inlineName, setInlineName] = useState("");
  const [inlineCategory, setInlineCategory] = useState("Arms");
  const [inlineEquipment, setInlineEquipment] = useState("Barbell");
  const [isSavingInline, setIsSavingInline] = useState(false);

  const [notesExerciseId, setNotesExerciseId] = useState<string | null>(null);
  const [notesInputText, setNotesInputText] = useState("");
  const [isNotesSaving, setIsNotesSaving] = useState(false);

  const dragControls = useDragControls();
  const [durationPickerState, setDurationPickerState] = useState<{ exerciseId: string; setIndex: number; initialSeconds: number } | null>(null);
  const [pickerHours, setPickerHours] = useState<number>(0);
  const [pickerMinutes, setPickerMinutes] = useState<number>(0);
  const [pickerSeconds, setPickerSeconds] = useState<number>(0);

  const hoursArray = Array.from({ length: 24 }, (_, i) => i);
  const minutesArray = Array.from({ length: 60 }, (_, i) => i);
  const secondsArray = Array.from({ length: 60 }, (_, i) => i);

  const hoursScrollRef = useRef<HTMLDivElement>(null);
  const minutesScrollRef = useRef<HTMLDivElement>(null);
  const secondsScrollRef = useRef<HTMLDivElement>(null);

  // Optimised scroll handler utilising UK English spelling standards
  const handleHoursScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const itemHeight = 40; // matches h-10 element height perfectly
    const index = Math.round(scrollTop / itemHeight);
    const val = Math.max(0, Math.min(23, index));
    if (val !== pickerHours) {
      setPickerHours(val);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(6); // precise, short tick for tactile wheel interaction
      }
    }
  };

  // Optimised scroll handler utilising UK English spelling standards
  const handleMinutesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const itemHeight = 40; // matches h-10 element height perfectly
    const index = Math.round(scrollTop / itemHeight);
    const val = Math.max(0, Math.min(59, index));
    if (val !== pickerMinutes) {
      setPickerMinutes(val);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(6); // precise, short tick for tactile wheel interaction
      }
    }
  };

  // Optimised scroll handler utilising UK English spelling standards
  const handleSecondsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const itemHeight = 40; // matches h-10 element height perfectly
    const index = Math.round(scrollTop / itemHeight);
    const val = Math.max(0, Math.min(59, index));
    if (val !== pickerSeconds) {
      setPickerSeconds(val);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(6); // precise, short tick for tactile wheel interaction
      }
    }
  };

  // Synchronisation of scrolling elements when initialised
  useEffect(() => {
    if (durationPickerState) {
      const totalSecs = durationPickerState.initialSeconds;
      const hrs = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;
      setPickerHours(hrs);
      setPickerMinutes(mins);
      setPickerSeconds(secs);
      
      // Delay to ensure DOM elements are fully positioned before scroll execution
      const timer = setTimeout(() => {
        if (hoursScrollRef.current) {
          hoursScrollRef.current.scrollTop = hrs * 40;
        }
        if (minutesScrollRef.current) {
          minutesScrollRef.current.scrollTop = mins * 40;
        }
        if (secondsScrollRef.current) {
          secondsScrollRef.current.scrollTop = secs * 40;
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [durationPickerState]);

  const handleDoneClick = () => {
    if (durationPickerState) {
      const { exerciseId, setIndex } = durationPickerState;
      // Convert selected wheel integers into raw total seconds for standard database state
      const totalSeconds = (pickerHours * 3600) + (pickerMinutes * 60) + pickerSeconds;
      
      onUpdateSet(exerciseId, setIndex, {
        duration: totalSeconds,
      });
      
      setDurationPickerState(null);
    }
  };

  const openDurationPicker = (exerciseId: string, setIndex: number, currentSeconds: number) => {
    setDurationPickerState({
      exerciseId,
      setIndex,
      initialSeconds: currentSeconds,
    });
  };

  // Human-friendly formatter optimised to display hours, minutes and seconds beautifully
  const formatHumanFriendlyDuration = (totalSeconds: number): string => {
    if (!totalSeconds || totalSeconds === 0) return "--:--";
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    let result = "";
    if (hrs > 0) {
      result += `${hrs}h`;
    }
    if (mins > 0 || hrs > 0) {
      result += ` ${mins}m`;
    }
    if (secs > 0 || (hrs === 0 && mins === 0)) {
      result += ` ${secs}s`;
    }
    return result.trim();
  };

  const handleOpenExerciseNotes = (exerciseId: string) => {
    setNotesExerciseId(exerciseId);
    setNotesInputText(exerciseNotes?.[exerciseId] || "");
  };

  const handleFinishClick = () => {
    const hasCompletedSet = session.exercises.some((ex) => ex.sets.some((s) => s.isCompleted));
    if (!hasCompletedSet) {
      setShowNoCompletedSetsModal(true);
    } else {
      haptics.finishWorkout();
      onFinish();
    }
  };

  const handleSaveCustomInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineName.trim() || !onAddCustomExercise) return;
    try {
      setIsSavingInline(true);
      const newEx = await onAddCustomExercise(inlineName.trim(), inlineCategory, inlineEquipment);
      onAddExercise(newEx.id);
      setInlineName("");
      setShowAddCustomInline(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingInline(false);
    }
  };

  const [pendingDiscard, setPendingDiscard] = useState(false);
  const [savedRecommendations, setSavedRecommendations] = useState<string | null>(null);
  const [pendingDeleteExerciseId, setPendingDeleteExerciseId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("projectpb_next_session_recommendations");
    if (stored) {
      setSavedRecommendations(stored);
    }
  }, []);

  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddModal]);

  // Swipe and collapsible notes states for sizing & swipe deletion
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [swipeSetId, setSwipeSetId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  const handleTouchStart = (e: React.TouchEvent, setId: string) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setSwipeSetId(setId);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = touchStartX - currentX;
    const diffY = Math.abs(currentY - touchStartY);

    if (diffX > 10 && diffX > diffY) {
      setSwipeOffset(Math.min(diffX, 120));
    }
  };

  const handleTouchEnd = (exerciseId: string, setIndex: number, setId: string) => {
    if (swipeSetId === setId) {
      if (swipeOffset > 85) {
        onRemoveSet(exerciseId, setIndex);
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
    setSwipeSetId(null);
    setSwipeOffset(0);
  };

  // Rest Timer State - tracked as a target timestamp to decouple secondary re-rendering
  const [localRestTimerTarget, setLocalRestTimerTarget] = useState<{ endTime: number; total: number; exerciseName: string } | null>(null);
  const restTimerTarget = externalRestTimerTarget !== undefined ? externalRestTimerTarget : localRestTimerTarget;
  const setRestTimerTarget = externalSetRestTimerTarget !== undefined ? externalSetRestTimerTarget : setLocalRestTimerTarget;

  // Request notification permission once when the active workout mounts.
  useEffect(() => {
    notificationService.requestPermission();
  }, []);

  const triggerRestTimer = useCallback((seconds: number, name: string) => {
    setRestTimerTarget({
      endTime: Date.now() + seconds * 1000,
      total: seconds,
      exerciseName: name,
    });
  }, [setRestTimerTarget]);

  const cancelRestTimer = useCallback(() => {
    setRestTimerTarget(null);
  }, [setRestTimerTarget]);

  // Complete the current (first uncompleted) set and start its rest timer.
  // Mirrors the in-app tick button; used by the native "Done" notification action.
  const completeCurrentSet = useCallback(() => {
    const exercises = session.exercises || [];
    for (const ex of exercises) {
      const idx = ex.sets.findIndex((s: any) => !s.isCompleted);
      if (idx !== -1) {
        onUpdateSet(ex.exerciseId, idx, { isCompleted: true });
        const restSec = ex.restTime !== undefined ? ex.restTime : 90;
        const exDef = exercisesList.find((e: any) => e.id === ex.exerciseId);
        triggerRestTimer(restSec, exDef?.name || "Exercise");
        return;
      }
    }
  }, [session.exercises, exercisesList, onUpdateSet, triggerRestTimer]);

  // Derive the current exercise + set label (the set the user is on, or — once
  // a set is completed — the set they are about to do). Shared by the tracking
  // notification and the rest "up next" text.
  const computeTrackingInfo = useCallback(() => {
    const exercises = session.exercises || [];
    let currentEx = exercises.find((ex: any) => ex.sets.some((s: any) => !s.isCompleted));
    if (!currentEx && exercises.length > 0) currentEx = exercises[exercises.length - 1];
    if (!currentEx) return { exerciseName: "Workout", setLabel: "" };

    const exDef = exercisesList.find((e: any) => e.id === currentEx.exerciseId);
    const exerciseName = exDef ? exDef.name : ((currentEx as any).name || "Exercise");
    const idx = currentEx.sets.findIndex((s: any) => !s.isCompleted);
    const setNum = idx !== -1 ? idx + 1 : currentEx.sets.length;
    let setLabel = currentEx.sets.length > 0 ? `Set ${setNum} of ${currentEx.sets.length}` : "";
    const activeSet = currentEx.sets[idx !== -1 ? idx : currentEx.sets.length - 1];
    if (activeSet) {
      const w = activeSet.weight || 0, r = activeSet.reps || 0;
      if (w > 0 && r > 0) setLabel += ` · ${w} kg × ${r} reps`;
      else if (r > 0) setLabel += ` · ${r} reps`;
      else if (w > 0) setLabel += ` · ${w} kg`;
    }
    return { exerciseName, setLabel };
  }, [session.exercises, exercisesList]);

  // Keep the latest tracking info in a ref so the rest effect can read it
  // without re-firing on unrelated session edits (e.g. typing a weight).
  const trackingInfoRef = useRef(computeTrackingInfo());
  trackingInfoRef.current = computeTrackingInfo();

  // Tracking notification: shown whenever a session is active and we are NOT
  // resting. The service worker ticks the elapsed duration itself, so there is
  // no per-second loop here.
  useEffect(() => {
    if (restTimerTarget !== null) return;
    const info = computeTrackingInfo();
    notificationService.showTracking({
      workoutStartTime: new Date(session.startTime).getTime(),
      exerciseName: info.exerciseName,
      setLabel: info.setLabel,
    });
  }, [restTimerTarget, computeTrackingInfo, session.startTime]);

  // Rest notification: when a rest timer is active, hand the absolute end-time
  // to the notification layer. Re-runs only when the timer itself changes
  // (start / +30 / -30), not on every session edit.
  useEffect(() => {
    if (restTimerTarget === null) return;
    const info = trackingInfoRef.current;
    notificationService.startRest({
      endTime: restTimerTarget.endTime,
      totalSeconds: restTimerTarget.total || 90,
      exerciseName: info.exerciseName,
      setLabel: info.setLabel,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restTimerTarget?.endTime, restTimerTarget?.total]);

  // Events coming back from the notification layer. Rest expiry / skip return us
  // to tracking; lock-screen +/- buttons adjust the shared timer. None of these
  // ever complete or advance a set — that only happens via the in-app tick.
  useEffect(() => {
    const unsubscribe = notificationService.onEvent((evt) => {
      if (evt.type === "rest_finished" || evt.type === "rest_skipped") {
        setRestTimerTarget(null);
      } else if (evt.type === "rest_adjusted") {
        setRestTimerTarget((prev) =>
          prev ? { ...prev, endTime: evt.endTime, total: evt.totalSeconds } : prev
        );
      } else if (evt.type === "set_completed") {
        // Native "Done" button: complete the current set and start its rest.
        completeCurrentSet();
      } else if (evt.type === "end_workout") {
        // Native "End" button already foregrounds the app; nothing else to do
        // here — the user finishes the workout from the in-app controls.
      }
    });
    return unsubscribe;
  }, [setRestTimerTarget, completeCurrentSet]);

  // Reconcile the app's rest timer against the service worker's authoritative
  // state. Used when the app regains focus (a lock-screen +/- may have changed
  // the end-time while we were backgrounded) and when the in-app countdown hits
  // zero (the rest may have been extended rather than finished).
  const reconcileRest = useCallback(async () => {
    const rest = await notificationService.getActiveRest();
    if (rest && rest.endTime > Date.now() + 250) {
      setRestTimerTarget({
        endTime: rest.endTime,
        total: rest.totalSeconds,
        exerciseName: rest.exerciseName || "Rest",
      });
    } else {
      setRestTimerTarget(null);
    }
  }, [setRestTimerTarget]);

  // Report foreground/background state to the notification layer so it only
  // ticks the lock-screen notification while we're hidden (avoids per-second
  // churn during active use). On *regaining* focus, reconcile the rest timer so
  // any lock-screen +/- change is picked up. We don't reconcile on the initial
  // mount to avoid racing a fresh session's END_SESSION cleanup.
  useEffect(() => {
    const report = (reconcile: boolean) => {
      const visible = typeof document !== "undefined" && document.visibilityState === "visible";
      notificationService.setAppVisibility(visible);
      if (visible && reconcile) reconcileRest();
    };
    report(false);
    const onChange = () => report(true);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, [reconcileRest]);

  // Drag and Drop States for Grouping Supersets
  const [draggedExerciseId, setDraggedExerciseId] = useState<string | null>(null);
  const [dragOverExId, setDragOverExId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedExerciseId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedExerciseId && draggedExerciseId !== id) {
      setDragOverExId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverExId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverExId(null);
    setDraggedExerciseId(null);
    const sourceId = e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) return;

    // sourceId = dragged exercise unique block ID, targetId = dropped targets
    const updatedExercises = [...session.exercises];
    const sourceEx = updatedExercises.find((ex) => ex.id === sourceId);
    const targetEx = updatedExercises.find((ex) => ex.id === targetId);

    if (sourceEx && targetEx) {
      const finalSupersetId = targetEx.supersetId || sourceEx.supersetId || `superset-${Math.random().toString(36).substring(2, 9)}`;
      sourceEx.supersetId = finalSupersetId;
      targetEx.supersetId = finalSupersetId;

      onUpdateWorkout({
        ...session,
        exercises: updatedExercises,
      });
    }
  };

  const handleRemoveFromSuperset = (exInstanceId: string) => {
    const updatedExercises = session.exercises.map((ex) => {
      if (ex.id === exInstanceId) {
        const copy = { ...ex };
        delete copy.supersetId;
        return copy;
      }
      return ex;
    });

    // Count superset occurrences
    const remainingSupersets: Record<string, number> = {};
    updatedExercises.forEach((ex) => {
      if (ex.supersetId) {
        remainingSupersets[ex.supersetId] = (remainingSupersets[ex.supersetId] || 0) + 1;
      }
    });

    // If only one remains, remove it too
    const finalExercises = updatedExercises.map((ex) => {
      if (ex.supersetId && remainingSupersets[ex.supersetId] < 2) {
        const copy = { ...ex };
        delete copy.supersetId;
        return copy;
      }
      return ex;
    });

    onUpdateWorkout({
      ...session,
      exercises: finalExercises,
    });
  };

  const getLastTimeDoneStr = (exerciseId: string) => {
    if (!history) return null;
    for (const h of history) {
      if (h.id === session.id) continue;
      const match = h.exercises.find((e) => e.exerciseId === exerciseId);
      if (match && match.sets.length > 0) {
        const completedSets = match.sets.filter((s) => s.isCompleted);
        const refSets = completedSets.length > 0 ? completedSets : match.sets;
        const setStrings = refSets.map((s) => `${s.weight}kg x ${s.reps}`).slice(0, 3).join(", ");
        const dateStr = new Date(h.startTime).toLocaleDateString([], { month: "short", day: "numeric" });
        return {
          setsStr: setStrings,
          dateStr
        };
      }
    }
    return null;
  };

  // Categories extracted from catalogue lists
  const uniqueCategories = Array.from(new Set(exercisesList.map((ex) => ex.category))).sort((a, b) => a.localeCompare(b));
  const categories = ["All", ...uniqueCategories];

  const filteredExercises = exercisesList
    .filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
      const matchesCategory = selectedCategory === "All" || ex.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="relative z-10 w-full max-w-full space-y-4">
      {/* Active-session card — exact port of project-pb-workout-page.html .sesscard */}
      <div className="pbw-sesscard">
        <div className="pbw-sesstop">
          <h3>{session.name}</h3>
          <span className="pbw-livedot" />
        </div>
        {restTimerTarget !== null ? (
          <RestTimerOverlay
            target={restTimerTarget}
            onCancel={cancelRestTimer}
            onReachedZero={reconcileRest}
            onAddSeconds={(secs) => {
              setRestTimerTarget((prev) => prev ? { ...prev, endTime: prev.endTime + secs * 1000, total: prev.total + secs } : null);
            }}
            onSubtractSeconds={(secs) => {
              setRestTimerTarget((prev) => prev ? { ...prev, endTime: Math.max(Date.now(), prev.endTime - secs * 1000) } : null);
            }}
            session={session}
            exercisesList={exercisesList}
            activeTab={activeTab}
          />
        ) : (
          <>
            <div className="m3-stat" style={{ marginBottom: "10px" }}>
              <span>Active session</span> · <b><ActiveWorkoutDuration startTime={session.startTime} /></b>
            </div>
            <svg className="m3-wave" viewBox="0 0 320 16" preserveAspectRatio="none" style={{ marginBottom: "12px" }}>
              <path d="M0 8 Q10 1 20 8 T40 8 T60 8 T80 8 T100 8 T120 8 T140 8 T160 8 T180 8 T200 8 T220 8 T240 8 T260 8 T280 8 T300 8 T320 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </>
        )}
        <div className="pbw-sessbtns">
          <button
            onClick={() => { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10); setShowDiscardConfirm(true); }}
            className="pbw-sbtn discard"
          >
            <Trash2 /> Discard
          </button>
          <button onClick={handleFinishClick} className="pbw-sbtn finish">
            <CheckCircle /> Finish
          </button>
        </div>
      </div>

      {/* Workout notes */}
      <div>
        <div className="m3-seclabel">
          <span className="l">Exercises</span>
          <button onClick={() => setIsNotesExpanded(!isNotesExpanded)} className="m3-txtbtn">
            {session.notes ? "Notes ✓" : "Notes"}
          </button>
        </div>
        {isNotesExpanded && (
          <textarea
            value={session.notes || ""}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder="Add comments, pre-workout details, or overall target motivation..."
            rows={2}
            className="w-full text-sm rounded-2xl p-3 focus:outline-none"
            style={{ background: "var(--m3-sc-low)", color: "var(--m3-on)", border: "1px solid var(--m3-outline-q)" }}
          />
        )}
      </div>

      {/* Exercises Added inside the Session */}
      <div className="space-y-5">
        {session.exercises.length === 0 ? (
          <div className="m3-empty">
            <div className="m3-shape lg center" style={{ marginBottom: "8px" }}>
              <svg className="sf" viewBox="0 0 100 100"><use href="#shape-sunny" fill="var(--m3-sc-high)" /></svg>
              <span className="si"><Dumbbell size={34} style={{ color: "var(--m3-primary)" }} /></span>
            </div>
            <h2 className="m3-h center" style={{ fontSize: "var(--m3-title-lg)" }}>No exercises added yet</h2>
            <p className="m3-body center">Add one below, or say to Gemini: "Add bench press, 3 sets of 100&nbsp;kg".</p>
            <div style={{ height: "14px" }} />
            <button onClick={() => setShowAddModal(true)} className="m3-btn fill" style={{ maxWidth: "260px", margin: "0 auto" }}>
              <Plus className="w-5 h-5" />
              Add exercise
            </button>
          </div>
        ) : (
          (() => {
            // Group the exercises array into displayable entities: single exercises or superset clusters
            const displayGroups: Array<{
              type: "single" | "superset";
              id: string; // exercise block id or supersetId
              exercises: WorkoutExercise[];
            }> = [];

            const visitedSupersets = new Set<string>();

            session.exercises.forEach((ex) => {
              if (ex.supersetId) {
                if (!visitedSupersets.has(ex.supersetId)) {
                  visitedSupersets.add(ex.supersetId);
                  const cluster = session.exercises.filter((item) => item.supersetId === ex.supersetId);
                  displayGroups.push({
                    type: "superset",
                    id: ex.supersetId,
                    exercises: cluster,
                  });
                }
              } else {
                displayGroups.push({
                  type: "single",
                  id: ex.id,
                  exercises: [ex],
                });
              }
            });

            return displayGroups.map((group) => {
              if (group.type === "superset") {
                return (
                  <div 
                    key={group.id} 
                    className="aw-card p-4 border-2 border-indigo-500/30 rounded-[22px] relative space-y-4 animate-fadeIn"
                    style={{ background: "var(--m3-sc-low)" }}
                  >
                    {/* Superset Group Indicator */}
                    <div className="flex items-center justify-between border-b border-indigo-550/20 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] bg-gradient-to-r from-indigo-550 via-violet-600 to-purple-600 px-2 py-0.5 rounded-md text-white font-extrabold font-mono uppercase tracking-widest leading-none">
                          ⚡ SUPERSET GROUP
                        </span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-mono">
                          ({group.exercises.length} Exercises)
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-slate-400 font-mono italic shrink-0 hidden sm:block">
                        Perform exercises back-to-back with minimal rest.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {group.exercises.map((workoutEx) => {
                        const exerciseDetails = exercisesList.find((ex) => ex.id === workoutEx.exerciseId);
                        const memory = getLastTimeDoneStr(workoutEx.exerciseId);
                        const isPendingDelete = pendingDeleteExerciseId === workoutEx.exerciseId;
                        const isOver = dragOverExId === workoutEx.id;
                        const isCardio = exerciseDetails?.category?.toLowerCase() === 'cardio';
                        const rawName = exerciseDetails?.name || "Unknown exercise";
                        const nameMatch = rawName.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
                        const mainTitle = nameMatch ? nameMatch[1].trim() : rawName;
                        const subtitleModifier = nameMatch ? nameMatch[2].trim() : null;

                        return (
                          <div
                            key={workoutEx.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, workoutEx.id)}
                            onDragOver={(e) => handleDragOver(e, workoutEx.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, workoutEx.id)}
                            style={{ background: "var(--m3-sc-low)", border: "1px solid var(--m3-outline-q)" }}
                            className={`relative overflow-hidden rounded-[22px] shadow-md group min-h-[140px] transition-all duration-300 ${
                              isOver ? "ring-2 ring-indigo-400 border-dashed scale-[1.015]" : ""
                            }`}
                          >
                            {/* Swipe delete hint underlay */}
                            {draggingExerciseId === workoutEx.id && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-rose-500/20 dark:to-rose-600/30 flex items-center justify-end px-6 rounded-xl pointer-events-none">
                                <div className="flex items-center space-x-1.5 text-rose-400 font-extrabold text-xs uppercase font-mono bg-white dark:bg-black px-2.5 py-1 rounded-xl border border-rose-500/20">
                                  <span>Release to Delete</span>
                                </div>
                              </div>
                            )}

                            <motion.div
                              layout="position"
                              drag="x"
                              dragDirectionLock
                              dragConstraints={{ left: -140, right: 0 }}
                              dragElastic={{ left: 0.15, right: 0 }}
                              onDragStart={() => {
                                setDraggingExerciseId(workoutEx.id);
                                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5);
                              }}
                              onDragEnd={(e, info) => {
                                setDraggingExerciseId(null);
                                if (info.offset.x < -80) {
                                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
                                  setPendingDeleteExerciseId(workoutEx.exerciseId);
                                }
                              }}
                              animate={{
                                x: isPendingDelete ? -120 : 0
                              }}
                              transition={{ type: "spring", stiffness: 350, damping: 28 }}
                              className="relative z-10 w-full h-full"
                            >
                              <div className="p-4 flex flex-col">
                                <div className="flex items-start justify-between w-full gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h4
                                      onClick={() => exerciseDetails && openExerciseGuide(exerciseDetails)}
                                      className="text-[18px] sm:text-[20px] font-bold text-[var(--m3-on)] leading-tight tracking-tight hover:underline transition-colors cursor-pointer select-text"
                                      title="Click to view setup and guide demonstration"
                                    >
                                      {mainTitle}
                                    </h4>
                                    {subtitleModifier && (
                                      <div className="text-[13px] font-semibold text-[var(--m3-primary)] mt-1 leading-snug">
                                        {subtitleModifier}
                                      </div>
                                    )}
                                    <div className="text-[11px] sm:text-[12px] font-mono tracking-wide font-bold text-[var(--m3-on-dim)] uppercase mt-1">
                                      {exerciseDetails?.category} &bull; {exerciseDetails?.equipment}
                                    </div>
                                  </div>
                                  <div 
                                    className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-indigo-505 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors shrink-0 mt-0.5" 
                                    title="Drag to re-superset"
                                  >
                                    <ListFilter className="w-5 h-5 text-indigo-405 shrink-0" />
                                  </div>
                                </div>

                                <div className="flex flex-row items-center justify-between w-full mt-3.5 pt-3 border-t border-gray-100 dark:border-white/5 gap-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      initial={{ scale: 0.95, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      type="button"
                                      onClick={() => {
                                        if (exerciseDetails) {
                                          handleOpenExerciseNotes(exerciseDetails.id);
                                        }
                                      }}
                                      className="inline-flex items-center space-x-1.5 px-3 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-550 hover:to-purple-550 border border-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm shadow-indigo-500/25 active:shadow-none transition-all cursor-pointer shrink-0 h-8"
                                    >
                                      <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                                      <span>{exerciseNotes?.[workoutEx.exerciseId] ? "Notes 📝" : "+ Note"}</span>
                                    </motion.button>
                                    {exerciseNotes?.[workoutEx.exerciseId] && (
                                      <span className="text-[10px] text-indigo-500 dark:text-indigo-200/65 font-medium italic truncate max-w-[100px] sm:max-w-[150px]" title={exerciseNotes[workoutEx.exerciseId]}>
                                        "{exerciseNotes[workoutEx.exerciseId]}"
                                      </span>
                                    )}

                                    <div className="flex items-center space-x-2 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/15 dark:border-indigo-500/10 text-indigo-700 dark:text-indigo-300 h-8 rounded-full px-3.5 text-xs font-mono shrink-0">
                                      <Timer className="w-4 h-4 text-indigo-400 shrink-0" />
                                      <span className="font-extrabold select-none whitespace-nowrap uppercase tracking-wider text-[10px]">Rest:</span>
                                      <input
                                        type="number"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        min="0"
                                        max="600"
                                        value={workoutEx.restTime !== undefined ? workoutEx.restTime : 90}
                                        onChange={(e) => {
                                          const parsedVal = parseInt(e.target.value);
                                          const newRest = isNaN(parsedVal) ? 90 : parsedVal;
                                          const updatedExercises = session.exercises.map((item) => {
                                            if (item.id === workoutEx.id) {
                                              return { ...item, restTime: newRest };
                                            }
                                            return item;
                                          });
                                          onUpdateWorkout({
                                            ...session,
                                            exercises: updatedExercises,
                                          });
                                        }}
                                        className="aw-bare w-10 text-[12px] font-mono font-bold text-center bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none p-0 text-indigo-805 dark:text-indigo-250 h-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        style={{ appearance: "none", MozAppearance: "textfield" }}
                                        title="Custom rest time in seconds"
                                      />
                                      <span className="text-indigo-500/80 dark:text-indigo-400/85 font-mono font-extrabold uppercase text-[10px]">s</span>
                                    </div>

                                    {exerciseDetails?.equipment === 'Barbell' && (
                                      <div className="flex items-center space-x-2 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/15 dark:border-indigo-500/10 text-indigo-700 dark:text-indigo-300 h-8 rounded-full px-3.5 text-xs font-mono shrink-0">
                                        <Dumbbell className="w-4 h-4 text-indigo-400 shrink-0" />
                                        <span className="font-extrabold select-none whitespace-nowrap uppercase tracking-wider text-[10px]" title="Set bar weight">Bar:</span>
                                        <input
                                          type="number"
                                          min="0"
                                          max="120"
                                          value={workoutEx.barWeight ?? 0}
                                          onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            onUpdateExerciseBarWeight?.(workoutEx.exerciseId, val);
                                          }}
                                          className="w-9 text-[12px] font-mono font-bold text-center bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none p-0 text-indigo-855 dark:text-indigo-250 h-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          style={{ appearance: "none", MozAppearance: "textfield" }}
                                          title="Weight of the bar separately from the KG plates"
                                        />
                                        <span className="text-indigo-500/80 dark:text-indigo-400/85 font-extrabold text-[10px]">kg</span>
                                      </div>
                                    )}

                                    {memory && (
                                      <span className="text-[10px] bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2.5 h-8 rounded-lg border border-indigo-500/15 dark:border-indigo-500/10 font-mono font-extrabold flex items-center gap-1 leading-none shrink-0 cursor-default">
                                        <History className="w-3 h-3 text-indigo-400 shrink-0" />
                                        <span className="uppercase tracking-wider text-[9px]">Last: {memory.setsStr}</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      onClick={() => handleRemoveFromSuperset(workoutEx.id)}
                                      title="Unlink from Superset"
                                      className="px-2 h-8 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-650 dark:text-indigo-300 rounded-lg text-[10px] font-bold font-mono border border-indigo-500/15 flex items-center space-x-1 transition-all"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                      <span className="hidden sm:inline">Unlink</span>
                                    </button>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono italic whitespace-nowrap select-none">
                                      Swipe to delete &rarr;
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Sets List (Flex Layout) */}
                              <div className="flex flex-col gap-1 mx-1 sm:mx-2 my-2">
                                {/* Sets Header */}
                                <div className="flex items-center text-[9px] sm:text-[10px] text-indigo-600 dark:text-indigo-300/60 uppercase tracking-widest font-extrabold pb-1.5 mb-1 sm:pb-2 border-b border-gray-200 dark:border-white/5 px-2">
                                  <div className="w-8 sm:w-12 text-center shrink-0">Set</div>
                                  <div className="w-[4.4rem] sm:w-20 shrink-0 px-0.5">Type</div>
                                  {isCardio ? (
                                    <div className="flex-1 px-1 text-center">Duration</div>
                                  ) : (
                                    <>
                                      <div className="flex-1 px-1 text-center">Weight</div>
                                      <div className="w-14 sm:w-16 px-1 text-center">Reps</div>
                                    </>
                                  )}
                                  <div className="w-10 sm:w-12 text-center shrink-0">Done</div>
                                </div>
                                
                                {workoutEx.sets.map((set, idx) => {
                                  const sliderTheme = getSliderColourTheme(set.rpe || 5);
                                  const rpePercentage = (((set.rpe || 5) - 1) / 9) * 100;

                                  return (
                                  <div key={set.id} className="relative rounded-xl overflow-hidden shrink-0">
                                    {/* Swipe delete hint underlay */}
                                    {draggingSetId === set.id && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-rose-500/20 dark:to-rose-600/30 flex items-center justify-end px-3 rounded-xl pointer-events-none">
                                        <div className="flex items-center justify-center bg-white dark:bg-black rounded-lg border border-rose-500/20 px-2 py-1 shadow-sm">
                                          <span className="text-rose-500 text-[10px] font-bold uppercase tracking-wider font-mono">Delete</span>
                                        </div>
                                      </div>
                                    )}

                                    <motion.div
                                      drag="x"
                                      dragDirectionLock
                                      dragConstraints={{ left: -100, right: 0 }}
                                      dragElastic={{ left: 0.15, right: 0 }}
                                      onDragStart={() => {
                                        setDraggingSetId(set.id);
                                        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5);
                                      }}
                                      onDragEnd={(e, info) => {
                                        setDraggingSetId(null);
                                        if (info.offset.x < -60) {
                                          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
                                          onRemoveSet(workoutEx.exerciseId, idx);
                                        }
                                      }}
                                      className={`flex flex-col relative z-10 w-full py-1.5 px-2 rounded-xl cursor-grab active:cursor-grabbing border transition-colors ${
                                        set.isCompleted 
                                          ? "bg-gray-100 dark:bg-zinc-950 text-slate-500 border-indigo-950/10 dark:border-white/5 saturate-[0.14]" 
                                          : "bg-white dark:bg-black border-transparent shadow-sm hover:border-gray-200 dark:hover:border-white/10"
                                      }`}
                                    >
                                      <div className="flex items-center w-full">
                                        {/* Inner fader wrapper for completed state */}
                                        <div className={`flex items-center flex-1 min-w-0 ${set.isCompleted ? "opacity-35" : ""}`}>
                                          {/* Set number */}
                                          <div className="w-8 sm:w-12 text-center text-xs font-bold text-indigo-400 font-mono shrink-0">
                                            {idx + 1}
                                          </div>

                                          {/* Type */}
                                          <div className="w-[4.4rem] sm:w-20 shrink-0 px-0.5">
                                            <select
                                              disabled={set.isCompleted}
                                              value={set.type}
                                              onChange={(e) =>
                                                onUpdateSet(workoutEx.exerciseId, idx, {
                                                  type: e.target.value as SetType,
                                                })
                                              }
                                              className="text-[10px] sm:text-xs border border-gray-250 dark:border-zinc-800 rounded-lg p-1 sm:p-1 pr-3 bg-white dark:bg-zinc-950 text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full disabled:opacity-40 font-semibold cursor-pointer"
                                            >
                                              <option value="normal" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-slate-200">Normal</option>
                                              <option value="warmup" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-slate-200">Warmup</option>
                                              <option value="drop" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-slate-200">Drop</option>
                                              <option value="failure" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-slate-200">Failure</option>
                                            </select>
                                          </div>

                                          {isCardio ? (
                                            <div className="flex-1 px-1 flex justify-center">
                                              <button
                                                 disabled={set.isCompleted}
                                                 type="button"
                                                 onClick={() => openDurationPicker(workoutEx.exerciseId, idx, set.duration || 0)}
                                                 className="w-full text-center max-w-[95px] border border-indigo-500/20 dark:border-indigo-500/10 rounded-xl py-1 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 shadow-sm active:scale-95 transition-all disabled:opacity-40 overflow-hidden flex items-center justify-center"
                                                 title="Set duration utilising wheel drums"
                                               >
                                                 <span style={{ fontSize: '12px', transform: 'scale(0.8)', transformOrigin: 'center', display: 'inline-block' }} className="font-mono font-bold whitespace-nowrap">
                                                   {formatHumanFriendlyDuration(set.duration || 0)}
                                                 </span>
                                               </button>
                                            </div>
                                          ) : (
                                            <>
                                          {/* Weight */}
                                          <div className="flex-1 px-1 flex flex-col gap-1 items-center justify-center">
                                            {exerciseDetails?.equipment === 'Barbell' ? (
                                                <>
                                                    {/* Disabled Total Weight */}
                                                    <div className="flex items-center space-x-1 justify-center w-full">
                                                      <input
                                                        disabled={true}
                                                        type="number"
                                                        value={set.weight === 0 ? "" : set.weight}
                                                        className="w-full text-center max-w-[50px] sm:max-w-20 text-[11px] sm:text-xs border border-gray-200 dark:border-white/10 rounded-lg p-1 bg-gray-50 dark:bg-black/60 shadow-inner text-gray-500 font-mono focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-70"
                                                        style={{ appearance: "none", MozAppearance: "textfield" }}
                                                        title="Total Weight (Bar + Plates)"
                                                      />
                                                      <span className="text-[9px] text-gray-500 font-mono select-none -ml-0.5">tot</span>
                                                    </div>

                                                    {/* Editable PLATES */}
                                                    {workoutEx.barWeight !== undefined && workoutEx.barWeight > 0 && (
                                                      <div className="flex flex-col space-y-0 w-full items-center">
                                                        <div className="flex items-center space-x-1 justify-center">
                                                          <input
                                                            disabled={set.isCompleted}
                                                            type="number"
                                                            value={set.weight - workoutEx.barWeight > 0 ? Number((set.weight - workoutEx.barWeight).toFixed(2)) : ""}
                                                            placeholder="Plts"
                                                            onChange={(e) => {
                                                              const plates = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                                                              onUpdateSet(workoutEx.exerciseId, idx, {
                                                                weight: plates + (workoutEx.barWeight || 0),
                                                              });
                                                            }}
                                                            className="w-full text-center max-w-[50px] sm:max-w-20 text-[10px] sm:text-xs border border-dashed border-indigo-400/40 dark:border-indigo-400/20 rounded-lg p-0.5 sm:p-1 bg-white dark:bg-black shadow-sm text-indigo-700 dark:text-indigo-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-40"
                                                            style={{ appearance: "none", MozAppearance: "textfield" }}
                                                            title="Input plates weight (total excluding bar)"
                                                          />
                                                          <span className="text-[9px] text-gray-500 font-mono select-none -ml-0.5">plt</span>
                                                        </div>
                                                      </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex items-center space-x-0.5 justify-center w-full">
                                                  <input
                                                    disabled={set.isCompleted}
                                                    type="number"
                                                    value={set.weight === 0 ? "" : set.weight}
                                                    placeholder="Wgt"
                                                    onChange={(e) =>
                                                      onUpdateSet(workoutEx.exerciseId, idx, {
                                                        weight: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0,
                                                      })
                                                    }
                                                    className="w-full text-center max-w-[52px] sm:max-w-[70px] text-[11px] sm:text-xs border border-gray-200 dark:border-white/10 rounded-lg p-1 bg-white dark:bg-black shadow-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-40"
                                                    style={{ appearance: "none", MozAppearance: "textfield" }}
                                                    title="Total Weight"
                                                  />
                                                  <span className="text-[9px] text-gray-500 font-mono select-none">kg</span>
                                                </div>
                                            )}
                                          </div>

                                          {/* Reps */}
                                          <div className="w-14 sm:w-16 shrink-0 px-1 text-center">
                                            <input
                                              disabled={set.isCompleted}
                                              type="number"
                                              value={set.reps === 0 ? "" : set.reps}
                                              placeholder="-"
                                              onChange={(e) =>
                                                onUpdateSet(workoutEx.exerciseId, idx, {
                                                  reps: e.target.value === "" ? 0 : parseInt(e.target.value) || 0,
                                                })
                                              }
                                              className="w-full text-center max-w-[44px] sm:max-w-[60px] mx-auto text-[11px] sm:text-xs border border-gray-200 dark:border-white/5 rounded-lg p-0.5 sm:p-1.5 bg-white dark:bg-black shadow-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-45"
                                              style={{ appearance: "none", MozAppearance: "textfield" }}
                                            />
                                          </div>
                                          </>
                                          )}
                                        </div>

                                        {/* Done */}
                                        <div className="w-10 sm:w-12 flex items-center justify-center shrink-0">
                                          <AnimatedTickButton
                                            isCompleted={set.isCompleted}
                                            onClick={() => {
                                              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                                              const nextState = !set.isCompleted;
                                              onUpdateSet(workoutEx.exerciseId, idx, { isCompleted: nextState });
                                              if (nextState) {
                                                const restSec = workoutEx.restTime !== undefined ? workoutEx.restTime : 90;
                                                triggerRestTimer(restSec, exerciseDetails?.name || "Exercise");
                                              } else {
                                                cancelRestTimer();
                                              }
                                            }}
                                          />
                                        </div>
                                      </div>
                                      
                                      {isCardio && (
                                        <div className={`w-full mt-2 pt-2 border-t border-gray-100 dark:border-white/5 flex flex-col transition-all duration-300 ${set.isCompleted ? "opacity-35" : ""} ${activeRpeSlide === `${workoutEx.exerciseId}-${idx}` ? "relative z-[52]" : ""}`}>
                                          <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-widest px-2 mb-2 pt-1">
                                            <span>RPE (Exertion)</span>
                                          </div>
                                          <div className="px-3 pb-3 relative">
                                            {activeRpeSlide === `${workoutEx.exerciseId}-${idx}` && (
                                              <div className="absolute -top-12 xs:-top-11 left-1/2 -translate-x-1/2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[8.5px] xs:text-[10px] uppercase px-3.5 py-1.5 xs:px-4 xs:py-2 rounded-full shadow-2xl border border-white/10 dark:border-black/10 z-[60] whitespace-normal sm:whitespace-nowrap w-[265px] xs:w-auto max-w-[calc(100vw-32px)] text-center flex items-center justify-center gap-2 animate-bounce">
                                                <div className="relative flex h-2 w-2 shrink-0 justify-center items-center">
                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: getRpeColor(set.rpe || 5) }} />
                                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: getRpeColor(set.rpe || 5) }} />
                                                </div>
                                                <div className="flex flex-col items-center leading-none py-0.5 select-none pointer-events-none">
                                                  <span className="font-extrabold font-mono tracking-wider">RPE {set.rpe || 5}: {getRpeLabelParts(set.rpe || 5).main}</span>
                                                  {getRpeLabelParts(set.rpe || 5).bracket && (
                                                    <span className="text-[7.5px] xs:text-[8px] font-black font-mono tracking-wider opacity-85 mt-0.5">
                                                      {getRpeLabelParts(set.rpe || 5).bracket}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                            <div 
                                              className={`relative w-full h-[38px] rounded-2xl overflow-hidden flex cursor-pointer transition-all duration-300 ${activeRpeSlide === `${workoutEx.exerciseId}-${idx}` ? "scale-[1.06] ring-2 ring-white dark:ring-zinc-900" : "hover:scale-[1.01]"}`}
                                              style={{ 
                                                backgroundColor: getRpeBgColor(set.rpe || 5),
                                                boxShadow: activeRpeSlide === `${workoutEx.exerciseId}-${idx}` ? getRpeGlow(set.rpe || 5) : "none"
                                              }}
                                            >
                                              <div 
                                                className="h-full flex items-center pl-3.5 border-r-[3.5px] border-white dark:border-zinc-950 transition-all duration-100 ease-out" 
                                                style={{ 
                                                  width: `${Math.max(12, rpePercentage)}%`,
                                                  backgroundColor: getRpeColor(set.rpe || 5)
                                                }}
                                              >
                                                <motion.span 
                                                  animate={{ scale: activeRpeSlide === `${workoutEx.exerciseId}-${idx}` ? 1.45 : 1 }}
                                                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                                  className="text-white font-black font-mono text-xs inline-block"
                                                >
                                                  {set.rpe || 5}
                                                </motion.span>
                                              </div>
                                              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-slate-400/40 pointer-events-none"></div>
                                              <input
                                                disabled={set.isCompleted}
                                                type="range"
                                                min="1"
                                                max="10"
                                                step="1"
                                                value={set.rpe || 5}
                                                onFocus={() => {
                                                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
                                                  setActiveRpeSlide(`${workoutEx.exerciseId}-${idx}`);
                                                }}
                                                onBlur={() => setActiveRpeSlide(null)}
                                                onMouseDown={() => {
                                                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
                                                  setActiveRpeSlide(`${workoutEx.exerciseId}-${idx}`);
                                                }}
                                                onMouseUp={() => setActiveRpeSlide(null)}
                                                onTouchStart={() => {
                                                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
                                                  setActiveRpeSlide(`${workoutEx.exerciseId}-${idx}`);
                                                }}
                                                onTouchEnd={() => setActiveRpeSlide(null)}
                                                onChange={(e) => {
                                                  const val = parseInt(e.target.value, 10);
                                                  if (val !== (set.rpe || 5)) {
                                                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                                                      navigator.vibrate(val === 10 ? [8, 5, 8] : 8);
                                                    }
                                                  }
                                                  onUpdateSet(workoutEx.exerciseId, idx, { rpe: val });
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                              />
                                            </div>
                                            <div className="flex justify-between text-[9px] text-gray-500 dark:text-gray-500 font-semibold font-mono mt-1.5 px-2 uppercase tracking-wide">
                                              <span>1 (Easy)</span>
                                              <span>10 (Hard)</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  </div>
                                  );
                                })}
                              </div>

                              {/* Adding Sets Footer */}
                              <div className="p-3 bg-white/3 flex justify-end">
                                <button
                                  onClick={() => onAddSet(workoutEx.exerciseId)}
                                  className="px-3 py-1 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-white/10 text-gray-800 dark:text-slate-200 text-xs font-bold rounded-lg border border-gray-200 dark:border-white/5 flex items-center space-x-1 transition-colors"
                                >
                                  <Plus className="w-3 h-3 text-indigo-400" />
                                  <span>Add Set</span>
                                </button>
                              </div>
                            </motion.div>

                            {/* Swipe delete confirmation overlay */}
                            <AnimatePresence>
                              {isPendingDelete && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute inset-0 bg-white dark:bg-black backdrop-blur-md z-20 flex flex-col items-center justify-center p-3 text-center rounded-xl border border-rose-500/30"
                                >
                                  <Trash2 className="w-8 h-8 text-rose-500 mb-1.5 animate-pulse" />
                                  <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-xs md:text-sm uppercase tracking-widest font-mono leading-none mb-1 text-rose-455">
                                    Confirm Deletion
                                  </h4>
                                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-slate-300 mb-3 max-w-[280px] leading-relaxed">
                                    Remove <strong className="text-gray-900 dark:text-gray-100 font-extrabold">{exerciseDetails?.name}</strong> from your active workout? All completed sets will be discarded.
                                  </p>
                                  
                                  <div className="flex items-center space-x-2.5 font-mono">
                                    <button
                                      onClick={() => {
                                        onRemoveExercise(workoutEx.exerciseId);
                                        setPendingDeleteExerciseId(null);
                                      }}
                                      className="px-4 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-[10px] md:text-xs uppercase tracking-wider rounded-lg shadow-lg cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                    <button
                                      onClick={() => {
                                        setPendingDeleteExerciseId(null);
                                      }}
                                      className="px-4 py-1.5 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-slate-200 font-extrabold text-[10px] md:text-xs uppercase tracking-wider rounded-lg cursor-pointer"
                                    >
                                      Keep
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              } else {
                // Render custom single exercise (standalone card block)
                const workoutEx = group.exercises[0];
                const exerciseDetails = exercisesList.find((ex) => ex.id === workoutEx.exerciseId);
                const memory = getLastTimeDoneStr(workoutEx.exerciseId);
                const isPendingDelete = pendingDeleteExerciseId === workoutEx.exerciseId;
                const isOver = dragOverExId === workoutEx.id;

                const isCardio = exerciseDetails?.category?.toLowerCase() === 'cardio';
                const rawName = exerciseDetails?.name || "Unknown exercise";
                const nameMatch = rawName.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
                const mainTitle = nameMatch ? nameMatch[1].trim() : rawName;
                const subtitleModifier = nameMatch ? nameMatch[2].trim() : null;

                return (
                  <div
                    key={workoutEx.id}
                    id={`exercise-card-${workoutEx.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, workoutEx.id)}
                    onDragOver={(e) => handleDragOver(e, workoutEx.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, workoutEx.id)}
                    style={{ background: "transparent" }}
                    className={`pbw-exswipe group min-h-[140px] transition-all duration-300 animate-fadeIn ${
                      isOver ? "ring-2 ring-indigo-400 scale-[1.015]" : ""
                    }`}
                  >
                    {/* Exercise swipe-to-delete reveal pane (Gmail-style) */}
                    {draggingExerciseId === workoutEx.id && (
                      <div className="pbw-delpane"><span className="rl">Release to delete</span><Trash2 /></div>
                    )}

                    <motion.div
                      layout="position"
                      drag="x"
                      dragDirectionLock
                      dragConstraints={{ left: -140, right: 0 }}
                      dragElastic={{ left: 0.15, right: 0 }}
                      onDragStart={() => { setDraggingExerciseId(workoutEx.id); }}
                      onDrag={(e, info) => {
                        const armed = info.offset.x < -80;
                        if (armed !== swipeArmedRef.current) {
                          swipeArmedRef.current = armed;
                          if (armed) haptics.swipeThreshold();
                        }
                      }}
                      onDragEnd={(e, info) => {
                        setDraggingExerciseId(null);
                        swipeArmedRef.current = false;
                        if (info.offset.x < -80) {
                          haptics.deleteCommit();
                          setPendingDeleteExerciseId(workoutEx.exerciseId);
                        }
                      }}
                      animate={{
                        x: isPendingDelete ? -120 : 0
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      style={{ background: "var(--m3-sc-low)", borderRadius: "22px", padding: "14px" }}
                      className="relative z-10 w-full h-full"
                    >
                      <div className="flex flex-col">
                        <div className="pbw-exhd">
                          <div className="flex-1 min-w-0">
                            <h4
                              onClick={() => exerciseDetails && openExerciseGuide(exerciseDetails)}
                              className="pbw-exnm cursor-pointer select-text"
                              title="Click to view setup and guide demonstration"
                            >
                              {mainTitle}
                            </h4>
                            {subtitleModifier && (
                              <div className="pbw-eqtype">{subtitleModifier}</div>
                            )}
                            <div className="pbw-exmeta">
                              {exerciseDetails?.category} · {exerciseDetails?.equipment}
                            </div>
                          </div>
                          <button
                            className="pbw-drag"
                            title="Drag and drop this onto another exercise to group as a Superset"
                          >
                            <ListFilter />
                          </button>
                        </div>

                        <div className="pbw-extools">
                          <button
                            type="button"
                            onClick={() => { if (exerciseDetails) { handleOpenExerciseNotes(exerciseDetails.id); } }}
                            className="pbw-notebtn"
                          >
                            <Sparkles /> {exerciseNotes?.[workoutEx.exerciseId] ? "Notes" : "+ Note"}
                          </button>
                          <span className="pbw-restpill">
                            <Timer /> Rest:&nbsp;
                            <input
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              min="0"
                              max="600"
                              value={workoutEx.restTime !== undefined ? workoutEx.restTime : 90}
                              onChange={(e) => {
                                const parsedVal = parseInt(e.target.value);
                                const newRest = isNaN(parsedVal) ? 90 : parsedVal;
                                const updatedExercises = session.exercises.map((item) => item.id === workoutEx.id ? { ...item, restTime: newRest } : item);
                                onUpdateWorkout({ ...session, exercises: updatedExercises });
                              }}
                              title="Custom rest time in seconds"
                            />
                            <b>s</b>
                          </span>
                          {exerciseDetails?.equipment === 'Barbell' && (
                            <span className="pbw-restpill">
                              <Dumbbell /> Bar:&nbsp;
                              <input
                                type="number"
                                min="0"
                                max="120"
                                value={workoutEx.barWeight ?? 0}
                                onChange={(e) => { const val = parseFloat(e.target.value) || 0; onUpdateExerciseBarWeight?.(workoutEx.exerciseId, val); }}
                                title="Weight of the bar separately from the KG plates"
                              />
                              <b>kg</b>
                            </span>
                          )}
                          <span className="pbw-swipehint">Swipe to delete &rarr;</span>
                        </div>
                      </div>

                      {/* Set grid — exact port of project-pb-workout-page.html .setgrid */}
                      <div className="pbw-setgrid">
                        <div className="pbw-gh">Set</div>
                        <div className="pbw-gh">Type</div>
                        <div className="pbw-gh">{isCardio ? "Duration" : "Weight"}</div>
                        <div className="pbw-gh">{isCardio ? "RPE" : "Reps"}</div>
                        <div className="pbw-gh" style={{ textAlign: "center" }}>Done</div>

                        {workoutEx.sets.map((set, idx) => {
                          const typeLabel = set.type.charAt(0).toUpperCase() + set.type.slice(1);
                          return (
                          <div key={set.id} className="pbw-setswipe">
                            {draggingSetId === set.id && (
                              <div className="pbw-delpane"><span className="rl">Release</span><Trash2 /></div>
                            )}
                            <motion.div
                              drag="x"
                              dragDirectionLock
                              dragConstraints={{ left: -86, right: 0 }}
                              dragElastic={{ left: 0.12, right: 0 }}
                              onDragStart={() => { setDraggingSetId(set.id); }}
                              onDrag={(e, info) => {
                                const armed = info.offset.x < -60;
                                if (armed !== swipeArmedRef.current) {
                                  swipeArmedRef.current = armed;
                                  if (armed) haptics.swipeThreshold();
                                }
                              }}
                              onDragEnd={(e, info) => {
                                setDraggingSetId(null);
                                swipeArmedRef.current = false;
                                if (info.offset.x < -60) {
                                  haptics.deleteCommit();
                                  onRemoveSet(workoutEx.exerciseId, idx);
                                }
                              }}
                              className={`pbw-setrow-inner ${set.isCompleted ? "done" : ""}`}
                            >
                              <span className="pbw-snum">{idx + 1}</span>
                              <select
                                className="pbw-typsel"
                                disabled={set.isCompleted}
                                value={set.type}
                                onChange={(e) => onUpdateSet(workoutEx.exerciseId, idx, { type: e.target.value as SetType })}
                              >
                                <option value="normal">Normal</option>
                                <option value="warmup">Warmup</option>
                                <option value="drop">Drop</option>
                                <option value="failure">Failure</option>
                              </select>
                              {isCardio ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={set.isCompleted}
                                    onClick={() => openDurationPicker(workoutEx.exerciseId, idx, set.duration || 0)}
                                    className="pbw-winput"
                                    style={{ cursor: "pointer" }}
                                    title="Set duration"
                                  >
                                    {formatHumanFriendlyDuration(set.duration || 0)}
                                  </button>
                                  <input
                                    className="pbw-winput"
                                    disabled={set.isCompleted}
                                    type="number"
                                    value={set.rpe || 5}
                                    onChange={(e) => onUpdateSet(workoutEx.exerciseId, idx, { rpe: parseInt(e.target.value) || 5 })}
                                  />
                                </>
                              ) : (
                                <>
                                  <div className="pbw-wcell">
                                    <input
                                      className="pbw-winput"
                                      disabled={set.isCompleted}
                                      type="number"
                                      placeholder="Wgt"
                                      value={
                                        exerciseDetails?.equipment === 'Barbell' && workoutEx.barWeight
                                          ? (set.weight - workoutEx.barWeight > 0 ? Number((set.weight - workoutEx.barWeight).toFixed(2)) : "")
                                          : (set.weight === 0 ? "" : set.weight)
                                      }
                                      onChange={(e) => {
                                        const raw = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                                        const w = exerciseDetails?.equipment === 'Barbell' ? raw + (workoutEx.barWeight || 0) : raw;
                                        onUpdateSet(workoutEx.exerciseId, idx, { weight: w });
                                      }}
                                      title="Weight"
                                    />
                                    <span className="pbw-wunit">kg</span>
                                  </div>
                                  <input
                                    className="pbw-winput"
                                    disabled={set.isCompleted}
                                    type="number"
                                    placeholder="–"
                                    value={set.reps === 0 ? "" : set.reps}
                                    onChange={(e) => onUpdateSet(workoutEx.exerciseId, idx, { reps: e.target.value === "" ? 0 : parseInt(e.target.value) || 0 })}
                                  />
                                </>
                              )}
                              <button
                                className={`pbw-donebox ${set.isCompleted ? "on" : ""}`}
                                onClick={() => {
                                  const nextState = !set.isCompleted;
                                  onUpdateSet(workoutEx.exerciseId, idx, { isCompleted: nextState });
                                  if (nextState) {
                                    haptics.setComplete();
                                    const restSec = workoutEx.restTime !== undefined ? workoutEx.restTime : 90;
                                    triggerRestTimer(restSec, exerciseDetails?.name || "Exercise");
                                  } else {
                                    cancelRestTimer();
                                  }
                                }}
                              >
                                <Check />
                              </button>
                              
                              {isCardio && (
                                <div className={`w-full mt-2 pt-2 border-t border-gray-100 dark:border-white/5 flex flex-col transition-all duration-300 ${set.isCompleted ? "opacity-35" : ""} ${activeRpeSlide === `${workoutEx.exerciseId}-${idx}` ? "relative z-[52]" : ""}`}>
                                  <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-widest px-2 mb-2 pt-1">
                                    <span>RPE (Exertion)</span>
                                  </div>
                                  <div className="px-3 pb-3 relative">
                                    {activeRpeSlide === `${workoutEx.exerciseId}-${idx}` && (
                                      <div className="absolute -top-12 xs:-top-11 left-1/2 -translate-x-1/2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[8.5px] xs:text-[10px] uppercase px-3.5 py-1.5 xs:px-4 xs:py-2 rounded-full shadow-2xl border border-white/10 dark:border-black/10 z-[60] whitespace-normal sm:whitespace-nowrap w-[265px] xs:w-auto max-w-[calc(100vw-32px)] text-center flex items-center justify-center gap-2 animate-bounce">
                                        <div className="relative flex h-2 w-2 shrink-0 justify-center items-center">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: getRpeColor(set.rpe || 5) }} />
                                          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: getRpeColor(set.rpe || 5) }} />
                                        </div>
                                        <div className="flex flex-col items-center leading-none py-0.5 select-none pointer-events-none">
                                          <span className="font-extrabold font-mono tracking-wider">RPE {set.rpe || 5}: {getRpeLabelParts(set.rpe || 5).main}</span>
                                          {getRpeLabelParts(set.rpe || 5).bracket && (
                                            <span className="text-[7.5px] xs:text-[8px] font-black font-mono tracking-wider opacity-85 mt-0.5">
                                              {getRpeLabelParts(set.rpe || 5).bracket}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    <div 
                                      className={`relative w-full h-[38px] rounded-2xl overflow-hidden flex cursor-pointer transition-all duration-300 ${activeRpeSlide === `${workoutEx.exerciseId}-${idx}` ? "scale-[1.06] ring-2 ring-white dark:ring-zinc-900" : "hover:scale-[1.01]"}`}
                                      style={{ 
                                        backgroundColor: getRpeBgColor(set.rpe || 5),
                                        boxShadow: activeRpeSlide === `${workoutEx.exerciseId}-${idx}` ? getRpeGlow(set.rpe || 5) : "none"
                                      }}
                                    >
                                      <div 
                                        className="h-full flex items-center pl-3.5 border-r-[3.5px] border-white dark:border-zinc-950 transition-all duration-100 ease-out" 
                                        style={{ 
                                          width: `${Math.max(12, rpePercentage)}%`,
                                          backgroundColor: getRpeColor(set.rpe || 5)
                                        }}
                                      >
                                        <motion.span 
                                          animate={{ scale: activeRpeSlide === `${workoutEx.exerciseId}-${idx}` ? 1.45 : 1 }}
                                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                          className="text-white font-black font-mono text-xs inline-block"
                                        >
                                          {set.rpe || 5}
                                        </motion.span>
                                      </div>
                                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-slate-400/40 pointer-events-none"></div>
                                      <input
                                        disabled={set.isCompleted}
                                        type="range"
                                        min="1"
                                        max="10"
                                        step="1"
                                        value={set.rpe || 5}
                                        onFocus={() => {
                                          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
                                          setActiveRpeSlide(`${workoutEx.exerciseId}-${idx}`);
                                        }}
                                        onBlur={() => setActiveRpeSlide(null)}
                                        onMouseDown={() => {
                                          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
                                          setActiveRpeSlide(`${workoutEx.exerciseId}-${idx}`);
                                        }}
                                        onMouseUp={() => setActiveRpeSlide(null)}
                                        onTouchStart={() => {
                                          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
                                          setActiveRpeSlide(`${workoutEx.exerciseId}-${idx}`);
                                        }}
                                        onTouchEnd={() => setActiveRpeSlide(null)}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value, 10);
                                          if (val !== (set.rpe || 5)) {
                                            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                                              navigator.vibrate(val === 10 ? [8, 5, 8] : 8);
                                            }
                                          }
                                          onUpdateSet(workoutEx.exerciseId, idx, { rpe: val });
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                      />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-gray-500 dark:text-gray-500 font-semibold font-mono mt-1.5 px-2 uppercase tracking-wide">
                                      <span>1 (Easy)</span>
                                      <span>10 (Hard)</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </div>
                          );
                        })}
                      </div>

                      {/* Add Set — exact port .addset */}
                      <div className="pbw-addset">
                        <button onClick={() => onAddSet(workoutEx.exerciseId)}>
                          <Plus /> Add Set
                        </button>
                      </div>
                    </motion.div>

                    {/* Swipe delete confirmation overlay */}
                    <AnimatePresence>
                      {isPendingDelete && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-white dark:bg-black backdrop-blur-md z-20 flex flex-col items-center justify-center p-3 text-center rounded-xl border border-rose-500/30 font-mono"
                        >
                          <Trash2 className="w-8 h-8 text-rose-500 mb-1.5 animate-pulse" />
                          <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-xs md:text-sm uppercase tracking-widest leading-none mb-1 text-rose-455">
                            Confirm Deletion
                          </h4>
                          <p className="text-[10px] sm:text-xs text-gray-600 dark:text-slate-300 mb-3 max-w-[280px] leading-relaxed">
                            Remove <strong className="text-gray-900 dark:text-gray-100 font-extrabold font-sans">{exerciseDetails?.name}</strong> from your active workout? All completed sets will be discarded.
                          </p>
                          
                          <div className="flex items-center space-x-2.5 font-mono">
                            <button
                              onClick={() => {
                                onRemoveExercise(workoutEx.exerciseId);
                                setPendingDeleteExerciseId(null);
                              }}
                              className="px-4 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-[10px] md:text-xs uppercase tracking-wider rounded-lg shadow-lg cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => {
                                setPendingDeleteExerciseId(null);
                              }}
                              className="px-4 py-1.5 bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/10 text-gray-800 dark:text-slate-200 font-extrabold text-[10px] md:text-xs uppercase tracking-wider rounded-lg cursor-pointer"
                            >
                              Keep
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
            });
          })()
        )}

        {/* Bottom action buttons — exact port (.addex lime + .botbtns) */}
        {session.exercises.length > 0 && (
          <div className="pt-4">
            <button onClick={() => setShowAddModal(true)} className="pbw-addex">
              <Plus /> Add Exercise
            </button>
            <div className="pbw-botbtns">
              <button
                onClick={() => { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10); setShowDiscardConfirm(true); }}
                className="pbw-botbtn discard"
              >
                <Trash2 /> Discard
              </button>
              <button onClick={handleFinishClick} className="pbw-botbtn finish">
                <CheckCircle /> Finish Workout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Persistent Personal Notes Modal */}
      {notesExerciseId && createPortal(
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/85 z-[9999] overflow-y-auto backdrop-blur-md">
          <div className="min-h-full flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, y: 25, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 18, mass: 0.8 }}
              className="bg-white dark:bg-black backdrop-blur-xl rounded-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl flex flex-col relative"
            >
              {/* Header */}
              <div className="p-4 bg-gray-50/50 dark:bg-black/30 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <span>Personal Exercise Notes</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setNotesExerciseId(null)}
                  className="p-1 text-gray-400 hover:text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:bg-black dark:border-white/10 shadow-sm rounded-lg transition-colors border-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                    {exercisesList.find((ex) => ex.id === notesExerciseId)?.name || "Exercise Notes"}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    These custom notes will persist across workouts and sync with your account.
                  </p>
                </div>

                <textarea
                  rows={5}
                  maxLength={1000}
                  placeholder="e.g., Focus on a slow eccentric phase, drop shoulders, or record your barbell plate patterns here..."
                  value={notesInputText}
                  onChange={(e) => setNotesInputText(e.target.value)}
                  className="w-full text-xs font-semibold bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-950 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 shadow-inner"
                />

                <div className="flex justify-end gap-2.5 mt-4">
                  <button
                    type="button"
                    onClick={() => setNotesExerciseId(null)}
                    className="px-4 py-2 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-white/10 border border-gray-200 dark:border-white/5 text-slate-500 text-xs font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (notesExerciseId && onUpdateExerciseNotes) {
                        setIsNotesSaving(true);
                        try {
                          await onUpdateExerciseNotes(notesExerciseId, notesInputText);
                        } catch (err) {
                          console.error("Failed to save exercise notes", err);
                        } finally {
                          setIsNotesSaving(false);
                          setNotesExerciseId(null);
                        }
                      }
                    }}
                    disabled={isNotesSaving}
                    className="px-4 py-2 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isNotesSaving ? "Saving..." : "Save Notes"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>,
        document.body
      )}

      {/* No Completed Sets Safety Modal */}
      {showNoCompletedSetsModal && createPortal(
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/80 z-[10000] flex items-center justify-center p-4 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-sm overflow-hidden p-6 shadow-2xl space-y-4 shadow-black/10 dark:shadow-black/50"
          >
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center ring-1 ring-amber-500/20">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                Empty Workout Session
              </h3>
              <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed px-1">
                You haven't ticked off any sets as completed. Please complete at least 1 set before finishing. Alternatively, you can select whether to continue or discard.
              </p>
            </div>

            <div className="pt-2">
              <DiscardSwipeSlider
                onSwipeLeft={() => {
                  setShowNoCompletedSetsModal(false);
                  onDiscard();
                }}
                onSwipeRight={() => {
                  setShowNoCompletedSetsModal(false);
                }}
              />
              
              <button
                type="button"
                onClick={() => setShowNoCompletedSetsModal(false)}
                className="w-full mt-3 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Discard Workout Confirmation Modal */}
      {showDiscardConfirm && createPortal(
        <div className="fixed inset-0 z-[10000]" onClick={() => setShowDiscardConfirm(false)} style={{ background: "rgba(5,4,9,.55)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}>
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="pbw-dsheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dhd">
              <div className="m3-shape lg center" style={{ margin: "0 auto 10px" }}>
                <svg className="sf" viewBox="0 0 100 100"><use href="#shape-sunny" fill="rgba(255,255,255,.22)" /></svg>
                <span className="si"><AlertTriangle style={{ width: 26, height: 26, color: "var(--m3-on-error-cont)" }} /></span>
              </div>
              <h2>Discard workout?</h2>
            </div>
            <div className="dbd">
              <p>
                This clears the <b>{session.exercises.length} exercise{session.exercises.length === 1 ? "" : "s"}</b> and{" "}
                <b>{session.exercises.reduce((a, ex) => a + ex.sets.length, 0)} set{session.exercises.reduce((a, ex) => a + ex.sets.length, 0) === 1 ? "" : "s"}</b> you've tracked. It can't be undone.
              </p>
              <div className="drow">
                <button className="db keep" onClick={() => setShowDiscardConfirm(false)}>Keep</button>
                <button className="db disc" onClick={() => { haptics.discardConfirm(); setShowDiscardConfirm(false); onDiscard(); }}>
                  <Trash2 /> Discard
                </button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Search / Add Exercise Picker Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ background: "rgba(8,6,14,.72)" }}>
          <div className="min-h-full flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ background: "var(--m3-sc-low)", border: "1px solid var(--m3-outline-q)" }}
              className="rounded-[28px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-32px)] md:max-h-[85vh] relative"
            >
              <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true"><defs><symbol id="pbw-cookie" viewBox="0 0 100 100"><path d="M45.2 11.5 C45.8 10.6 54.2 10.6 54.8 11.5 L55.9 13.1 C56.5 14.0 68.2 18.3 69.2 18.0 L71.1 17.4 C72.1 17.1 78.6 22.5 78.5 23.6 L78.2 25.5 C78.1 26.6 84.3 37.4 85.3 37.8 L87.1 38.6 C88.1 39.0 89.6 47.3 88.8 48.1 L87.3 49.4 C86.5 50.1 84.4 62.4 84.9 63.3 L85.8 65.1 C86.3 66.0 82.0 73.4 81.0 73.4 L79.0 73.5 C77.9 73.6 68.4 81.6 68.1 82.6 L67.7 84.6 C67.5 85.6 59.5 88.5 58.7 87.9 L57.1 86.7 C56.2 86.0 43.8 86.0 42.9 86.7 L41.3 87.9 C40.5 88.5 32.5 85.6 32.3 84.6 L31.9 82.6 C31.6 81.6 22.1 73.6 21.0 73.5 L19.0 73.4 C18.0 73.4 13.7 66.0 14.2 65.1 L15.1 63.3 C15.6 62.4 13.5 50.1 12.7 49.4 L11.2 48.1 C10.4 47.3 11.9 39.0 12.9 38.6 L14.7 37.8 C15.7 37.4 21.9 26.6 21.8 25.5 L21.5 23.6 C21.4 22.5 27.9 17.1 28.9 17.4 L30.8 18.0 C31.8 18.3 43.5 14.0 44.1 13.1Z"/></symbol></defs></svg>
              {/* Picker header — exact port .pkhead */}
              <div className="pbw-pkhead" style={{ padding: "16px 16px 14px" }}>
                <Dumbbell className="di" />
                <h2>Choose Exercise</h2>
                <button className="cl" onClick={() => setShowAddModal(false)}>
                  <X />
                </button>
              </div>

              {/* Sub-header: search + filter chips */}
              <div style={{ padding: "0 16px 14px" }}>
                <div className="pbw-search">
                  <Search />
                  <input
                    type="text"
                    placeholder="Search exercise library…"
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                  />
                </div>
                <div className="pbw-fchips">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`pbw-fchip${selectedCategory === cat ? " sel" : ""}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom exercise inline form switcher */}
              {showAddCustomInline ? (
                <form onSubmit={handleSaveCustomInline} className="p-4 border-b border-indigo-500/20 space-y-3 shrink-0" style={{ background: "var(--m3-sc)" }}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      <span>Quick Custom Exercise</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomInline(false)}
                      className="p-1 text-gray-400 hover:text-gray-900 dark:text-gray-100 rounded hover:bg-gray-50 dark:bg-black dark:border-white/10 shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-indigo-600 dark:text-indigo-300 uppercase mb-1">Exercise Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Incline DB Squeeze Press"
                      value={inlineName}
                      onChange={(e) => setInlineName(e.target.value)}
                      className="w-full text-xs font-semibold bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-indigo-600 dark:text-indigo-300 uppercase mb-1">Category</label>
                      <select
                        value={inlineCategory}
                        onChange={(e) => setInlineCategory(e.target.value)}
                        className="w-full text-xs font-semibold bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl p-2 text-gray-900 dark:text-gray-100 focus:outline-none"
                      >
                        <option value="Arms">Arms</option>
                        <option value="Back">Back</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Chest">Chest</option>
                        <option value="Core">Core</option>
                        <option value="Legs">Legs</option>
                        <option value="Shoulders">Shoulders</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-indigo-600 dark:text-indigo-300 uppercase mb-1">Equipment</label>
                      <select
                        value={inlineEquipment}
                        onChange={(e) => setInlineEquipment(e.target.value)}
                        className="w-full text-xs font-semibold bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl p-2 text-gray-950 dark:text-gray-100 focus:outline-none"
                      >
                        <option value="Barbell">Barbell</option>
                        <option value="Bodyweight">Bodyweight</option>
                        <option value="Cables">Cables</option>
                        <option value="Dumbbell">Dumbbell</option>
                        <option value="Machine">Machine</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setShowAddCustomInline(false)}
                      className="px-3 py-1.5 bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 hover:bg-white/10 text-gray-600 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingInline || !inlineName.trim()}
                      className="px-3.5 py-1.5 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-550 hover:to-purple-555 text-white text-xs font-bold rounded-lg transition-all shadow-md disabled:opacity-50"
                    >
                      {isSavingInline ? "Saving..." : "Create & Add"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="pbw-customrow" style={{ marginLeft: "16px", marginRight: "16px" }}>
                  <span className="q">Can't find your exercise?</span>
                  <button type="button" onClick={() => setShowAddCustomInline(true)} className="pbw-ccbtn">
                    <Plus /> Create Custom
                  </button>
                </div>
              )}

              {/* Database scrolling list */}
              <div className="flex-1 overflow-y-auto">
                {filteredExercises.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-xs">
                    No matching exercises found in library.
                  </div>
                ) : (
                  filteredExercises.map((ex) => {
                    const isAlreadyAdded = session.exercises.some((se) => se.exerciseId === ex.id);
                    return (
                      <div key={ex.id} className="pbw-exrow" style={{ marginLeft: "16px", marginRight: "16px" }}>
                        <div className="pbw-exbadge">
                          <svg className="sf" viewBox="0 0 100 100"><use href="#pbw-cookie" fill="var(--m3-primary-cont)" /></svg>
                          <Dumbbell className="ic" />
                        </div>
                        <div className="pbw-exinfo">
                          <div className="nm" onClick={() => openExerciseGuide(ex)} title="Click to view setup and guide demonstration">{ex.name}</div>
                          <div className="ct">{ex.category} · {ex.equipment}</div>
                        </div>
                        <button
                          onClick={() => { if (isAlreadyAdded) { onRemoveExercise(ex.id); } else { onAddExercise(ex.id); } }}
                          className={`pbw-addbtn${isAlreadyAdded ? " added" : ""}`}
                        >
                          {isAlreadyAdded ? (<><X /> Remove</>) : (<><Plus /> Add</>)}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal footer — Close Picker (.closepk) */}
              <div style={{ padding: "0 16px", display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setShowAddModal(false)} className="pbw-closepk">
                  Close Picker
                </button>
              </div>
            </motion.div>
          </div>
        </div>,
        document.body
      )}

      {/* Inline Bottom Sheet Modal for Duration Selection */}
      {createPortal(
        <AnimatePresence>
          {durationPickerState && (
            <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDurationPickerState(null)}
                className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-[2px] pointer-events-auto"
              />

              {/* Bottom Sheet Modal */}
              <motion.div
                drag="y"
                dragControls={dragControls}
                dragListener={true}
                dragConstraints={{ top: 0 }}
                dragElastic={{ top: 0, bottom: 0.8 }}
                onDragEnd={(event, info) => {
                  if (info.offset.y > 100 || info.velocity.y > 200) {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate([15, 12, 10]); // pleasant triple tick on completion swipe
                    }
                    setDurationPickerState(null);
                  }
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-t-[28px] border-t border-gray-100 dark:border-zinc-800 shadow-2xl z-10 overflow-hidden pb-safe pointer-events-auto"
              >
                {/* Unified Drag Handle & Header Drag Area - Pull Pill and Title together */}
                <div 
                  className="select-none touch-none cursor-grab active:cursor-grabbing hover:bg-gray-50/50 dark:hover:bg-zinc-900/10 transition-colors pb-3 border-b border-gray-100 dark:border-zinc-900/50 flex flex-col items-center justify-center w-full"
                  onPointerDown={(e) => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate(8); // click-like tactile response when starting drag
                    }
                    dragControls.start(e);
                  }}
                >
                  {/* Pull Pill */}
                  <div className="py-3 flex justify-center w-full">
                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                  </div>

                  {/* Header Title */}
                  <div className="px-5 text-center w-full">
                    <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm tracking-wide uppercase">
                      Select Duration
                    </h3>
                    <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-indigo-500 mt-0.5">
                      Set Cardio Session Goal
                    </p>
                  </div>
                </div>

                {/* Drum Wheels Selector Container (Perfect alignment) */}
                <div className="relative flex flex-col px-6 py-4 bg-gray-50/50 dark:bg-zinc-950/50 select-none border-b border-gray-100 dark:border-zinc-900/50">
                  {/* Column Headers Grid */}
                  <div className="flex items-center justify-between mb-2 text-center">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono">Hours</span>
                    </div>
                    <div className="w-4"></div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono">Minutes</span>
                    </div>
                    <div className="w-4"></div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono">Seconds</span>
                    </div>
                  </div>

                  {/* Wheels flex track with centered highlight overlay */}
                  <div className="relative flex items-center justify-center h-[120px]">
                    {/* Horizontal Center Selector Highlight Block */}
                    <div className="absolute left-0 right-0 h-10 bg-indigo-500/5 dark:bg-indigo-500/10 border-y border-indigo-500/15 dark:border-indigo-500/15 rounded-lg pointer-events-none" />

                    {/* Left Column (Hours Wheel) */}
                    <div className="flex-1 flex justify-center h-full overflow-hidden select-none touch-pan-y">
                      <div className="relative w-full h-full flex justify-center overflow-hidden">
                        {/* Upper arrow indicator */}
                        <div className="absolute top-0.5 left-1/2 -translate-x-1/2 text-indigo-500/50 dark:text-indigo-400/40 pointer-events-none z-20 flex flex-col items-center">
                          <ChevronUp className="w-3.5 h-3.5 animate-pulse" />
                        </div>

                        {/* Shadow overlays for elegant fade effect */}
                        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-50/50 dark:from-zinc-950/50 to-transparent pointer-events-none z-10" />
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50/50 dark:from-zinc-950/50 to-transparent pointer-events-none z-10" />
                        
                        {/* Scroll Snapping Track */}
                        <div
                          ref={hoursScrollRef}
                          onScroll={handleHoursScroll}
                          className="w-full h-full overflow-y-scroll overflow-x-hidden touch-pan-y snap-y snap-mandatory scroll-smooth invisible-scrollbar py-[40px]"
                        >
                          {hoursArray.map((hr) => {
                            const isSelected = hr === pickerHours;
                            return (
                              <div
                                key={hr}
                                className={`h-10 flex items-center justify-center snap-center text-center transition-all ${
                                  isSelected
                                    ? "text-indigo-600 dark:text-indigo-400 font-black text-lg scale-110"
                                    : "text-gray-400 dark:text-zinc-650 font-bold text-sm"
                                }`}
                              >
                                {String(hr).padStart(2, "0")}
                              </div>
                            );
                          })}
                        </div>

                        {/* Lower arrow indicator */}
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-indigo-500/50 dark:text-indigo-400/40 pointer-events-none z-20 flex flex-col items-center">
                          <ChevronDown className="w-3.5 h-3.5 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Colon Separator 1 */}
                    <div className="text-xl font-bold font-mono text-indigo-500/40 dark:text-indigo-500/20 px-1 select-none pointer-events-none">:</div>

                    {/* Middle Column (Minutes Wheel) */}
                    <div className="flex-1 flex justify-center h-full overflow-hidden select-none touch-pan-y">
                      <div className="relative w-full h-full flex justify-center overflow-hidden">
                        {/* Upper arrow indicator */}
                        <div className="absolute top-0.5 left-1/2 -translate-x-1/2 text-indigo-500/50 dark:text-indigo-400/40 pointer-events-none z-20 flex flex-col items-center">
                          <ChevronUp className="w-3.5 h-3.5 animate-pulse" />
                        </div>

                        {/* Shadow overlays for elegant fade effect */}
                        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-50/50 dark:from-zinc-950/50 to-transparent pointer-events-none z-10" />
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50/50 dark:from-zinc-950/50 to-transparent pointer-events-none z-10" />
                        
                        {/* Scroll Snapping Track */}
                        <div
                          ref={minutesScrollRef}
                          onScroll={handleMinutesScroll}
                          className="w-full h-full overflow-y-scroll overflow-x-hidden touch-pan-y snap-y snap-mandatory scroll-smooth invisible-scrollbar py-[40px]"
                        >
                          {minutesArray.map((min) => {
                            const isSelected = min === pickerMinutes;
                            return (
                              <div
                                key={min}
                                className={`h-10 flex items-center justify-center snap-center text-center transition-all ${
                                  isSelected
                                    ? "text-indigo-600 dark:text-indigo-400 font-black text-lg scale-110"
                                    : "text-gray-400 dark:text-zinc-650 font-bold text-sm"
                                }`}
                              >
                                {String(min).padStart(2, "0")}
                              </div>
                            );
                          })}
                        </div>

                        {/* Lower arrow indicator */}
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-indigo-500/50 dark:text-indigo-400/40 pointer-events-none z-20 flex flex-col items-center">
                          <ChevronDown className="w-3.5 h-3.5 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Colon Separator 2 */}
                    <div className="text-xl font-bold font-mono text-indigo-500/40 dark:text-indigo-500/20 px-1 select-none pointer-events-none">:</div>

                    {/* Right Column (Seconds Wheel) */}
                    <div className="flex-1 flex justify-center h-full overflow-hidden select-none touch-pan-y">
                      <div className="relative w-full h-full flex justify-center overflow-hidden">
                        {/* Upper arrow indicator */}
                        <div className="absolute top-0.5 left-1/2 -translate-x-1/2 text-indigo-500/50 dark:text-indigo-400/40 pointer-events-none z-20 flex flex-col items-center">
                          <ChevronUp className="w-3.5 h-3.5 animate-pulse" />
                        </div>

                        {/* Shadow overlays for elegant fade effect */}
                        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-50/50 dark:from-zinc-950/50 to-transparent pointer-events-none z-10" />
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50/50 dark:from-zinc-950/50 to-transparent pointer-events-none z-10" />
                        
                        {/* Scroll Snapping Track */}
                        <div
                          ref={secondsScrollRef}
                          onScroll={handleSecondsScroll}
                          className="w-full h-full overflow-y-scroll overflow-x-hidden touch-pan-y snap-y snap-mandatory scroll-smooth invisible-scrollbar py-[40px]"
                        >
                          {secondsArray.map((sec) => {
                            const isSelected = sec === pickerSeconds;
                            return (
                              <div
                                key={sec}
                                className={`h-10 flex items-center justify-center snap-center text-center transition-all ${
                                  isSelected
                                    ? "text-indigo-600 dark:text-indigo-400 font-black text-lg scale-110"
                                    : "text-gray-400 dark:text-zinc-650 font-bold text-sm"
                                }`}
                              >
                                {String(sec).padStart(2, "0")}
                              </div>
                            );
                          })}
                        </div>

                        {/* Lower arrow indicator */}
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-indigo-500/50 dark:text-indigo-400/40 pointer-events-none z-20 flex flex-col items-center">
                          <ChevronDown className="w-3.5 h-3.5 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Duration Banner */}
                <div className="py-2.5 bg-indigo-500/5 dark:bg-indigo-500/10 text-center text-indigo-700 dark:text-indigo-400 text-xs font-mono font-extrabold select-none">
                  Selected Duration: <span className="font-black text-indigo-600 dark:text-indigo-300">{String(pickerHours).padStart(2, '0')}:{String(pickerMinutes).padStart(2, '0')}:{String(pickerSeconds).padStart(2, '0')}</span>
                </div>

                {/* Action Buttons Section */}
                <div className="p-5 bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 flex flex-col gap-2.5">
                  {/* Full-width elegant blue done button */}
                  <button
                    type="button"
                    onClick={handleDoneClick}
                    className="w-full py-3.5 px-4 bg-gradient-to-tr from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-550 hover:to-purple-550 active:from-indigo-650 active:scale-98 text-white text-sm font-black whitespace-nowrap uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-600/15 transition-all text-center flex items-center justify-center gap-2 cursor-pointer border border-white/5"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span>Done</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationPickerState(null)}
                    className="w-full py-2.5 text-center text-xs text-gray-400 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-zinc-100 font-bold tracking-wider uppercase transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

// --- End of ActiveWorkout.tsx ---
