/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/Button";
import { robustFetch } from "../utils/network";
import { apiUrl, getAuthHeader } from "../aiClient";
import {
  Sparkles,
  Award,
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  X,
  Zap,
  CheckCircle,
  Dumbbell,
  Play,
  RotateCcw,
  Plus
} from "lucide-react";
import { WorkoutSession, Exercise } from "../types";

interface WorkoutSplashSceneProps {
  completedWorkout: WorkoutSession;
  history: WorkoutSession[];
  exercisesList: Exercise[];
  onClose: () => void;
  onSaveAnalysis?: (analysis: any) => void;
}

// Padding helper for duration displays
const formatDurationHM = (totalSecs: number) => {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Modality-routed exercise diagnostics calculator utilising strict UK English conventions
const getExerciseModalityMetrics = (
  ex: any,
  exDef: any,
  historySessions: any[]
) => {
  let userBodyWeight = 85; // Standard fallback body weight constant
  try {
    const profileStr = localStorage.getItem("projectpb_user_profile");
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      if (profile && profile.weightKg) {
        userBodyWeight = Number(profile.weightKg);
      }
    }
  } catch (e) {
    // Suppressed fallback log
  }

  // Determine exercise training modality
  let modality: "WEIGHTED" | "BODYWEIGHT" | "CARDIO" = "WEIGHTED";
  if (exDef?.modality) {
    modality = exDef.modality;
  } else {
    const cat = (exDef?.category || "").toLowerCase();
    const eq = (exDef?.equipment || "").toLowerCase();
    const name = (exDef?.name || "").toLowerCase();
    
    if (cat === "cardio" || name.includes("run") || name.includes("cycle") || name.includes("cardio") || name.includes("treadmill") || name.includes("elliptical") || name.includes("rower") || name.includes("bike")) {
      modality = "CARDIO";
    } else if (eq === "bodyweight" || name.includes("pushup") || name.includes("pullup") || name.includes("chinup") || name.includes("dip") || name.includes("crunch") || name.includes("plank") || name.includes("bodyweight") || name.includes("lunge") || name.includes("squat") || name.includes("leg raise") || name.includes("raising")) {
      modality = "BODYWEIGHT";
    }
  }

  const completedSets = (ex.sets || []).filter((s: any) => s.isCompleted);
  if (completedSets.length === 0) return null;

  let currentMainVal = 0;
  let currentDisplayVal = "";
  let currentSubtext = "";

  if (modality === "WEIGHTED") {
    let topEst1RM = 0;
    let maxWeight = 0;
    completedSets.forEach((set: any) => {
      const weight = Number(set.weight || 0);
      const reps = Number(set.reps || 0);
      const est1RM = weight * (1 + reps / 30);
      if (est1RM > topEst1RM) {
        topEst1RM = est1RM;
        maxWeight = weight;
      }
    });
    currentMainVal = topEst1RM;
    currentDisplayVal = `${Math.round(maxWeight)} kg`;
    currentSubtext = `Estimated 1RM: ${Math.round(topEst1RM)} kg`;

  } else if (modality === "BODYWEIGHT") {
    let maxExternalLoad = 0;
    let maxReps = 0;
    completedSets.forEach((set: any) => {
      const w = Number(set.weight || 0);
      const r = Number(set.reps || 0);
      if (w > maxExternalLoad) {
        maxExternalLoad = w;
      }
      if (r > maxReps) {
        maxReps = r;
      }
    });

    const isWeightedBodyweight = maxExternalLoad > 0;
    if (!isWeightedBodyweight) {
      // Sub-Case A: No Added Weight performance peak
      currentMainVal = maxReps;
      currentDisplayVal = `${maxReps} reps`;
      currentSubtext = `Peak Repetition Volume: ${maxReps} reps`;
    } else {
      // Sub-Case B: Weighted Bodyweight performance peak
      let topEst1RM = 0;
      completedSets.forEach((set: any) => {
        const extLoad = Number(set.weight || 0);
        const reps = Number(set.reps || 0);
        const totalWeight = userBodyWeight + extLoad;
        const est1RM = totalWeight * (1 + reps / 30);
        if (est1RM > topEst1RM) {
          topEst1RM = est1RM;
        }
      });
      currentMainVal = topEst1RM;
      currentDisplayVal = `${Math.round(maxExternalLoad)} kg`;
      currentSubtext = `Total Dynamic 1RM: ${Math.round(topEst1RM)} kg`;
    }

  } else if (modality === "CARDIO") {
    let maxFosters = 0;
    let maxDuration = 0;
    let totalDuration = 0;
    completedSets.forEach((set: any) => {
      const dur = Number(set.duration || 0);
      const rpe = Number(set.rpe || 7);
      const minutes = dur / 60;
      const fosters = minutes * rpe;
      totalDuration += dur;
      if (fosters > maxFosters) {
        maxFosters = fosters;
        maxDuration = dur;
      }
    });
    currentMainVal = maxFosters;
    currentDisplayVal = formatDurationHM(totalDuration || maxDuration);
    currentSubtext = `Aerobic Systemic Load: ${Math.round(maxFosters)} Units`;
  }

  // Calculate historical values
  let previousMainVal = 0;
  let previousDisplayVal = "";
  let previousSubtext = "";

  const pastExerciseSessions: any[] = [];
  historySessions.forEach((pastSession) => {
    const pastEx = pastSession.exercises.find((pe: any) => pe.exerciseId === ex.exerciseId);
    if (pastEx) {
      const pastCompSets = (pastEx.sets || []).filter((s: any) => s.isCompleted);
      if (pastCompSets.length > 0) {
        pastExerciseSessions.push({
          session: pastSession,
          sets: pastCompSets
        });
      }
    }
  });

  if (pastExerciseSessions.length > 0) {
    if (modality === "WEIGHTED") {
      let topEst1RM = 0;
      let maxWeight = 0;
      pastExerciseSessions.forEach((pes) => {
        pes.sets.forEach((set: any) => {
          const weight = Number(set.weight || 0);
          const reps = Number(set.reps || 0);
          const est1RM = weight * (1 + reps / 30);
          if (est1RM > topEst1RM) {
            topEst1RM = est1RM;
            maxWeight = weight;
          }
        });
      });
      previousMainVal = topEst1RM;
      previousDisplayVal = `${Math.round(maxWeight)} kg`;
      previousSubtext = `Estimated 1RM: ${Math.round(topEst1RM)} kg`;

    } else if (modality === "BODYWEIGHT") {
      let maxExternalLoad = 0;
      let maxReps = 0;
      pastExerciseSessions.forEach((pes) => {
        pes.sets.forEach((set: any) => {
          const w = Number(set.weight || 0);
          const r = Number(set.reps || 0);
          if (w > maxExternalLoad) {
            maxExternalLoad = w;
          }
          if (r > maxReps) {
            maxReps = r;
          }
        });
      });

      const isWeightedBodyweight = maxExternalLoad > 0;
      if (!isWeightedBodyweight) {
        previousMainVal = maxReps;
        previousDisplayVal = `${maxReps} reps`;
        previousSubtext = `Peak Repetition Volume: ${maxReps} reps`;
      } else {
        let topEst1RM = 0;
        pastExerciseSessions.forEach((pes) => {
          pes.sets.forEach((set: any) => {
            const extLoad = Number(set.weight || 0);
            const reps = Number(set.reps || 0);
            const totalWeight = userBodyWeight + extLoad;
            const est1RM = totalWeight * (1 + reps / 30);
            if (est1RM > topEst1RM) {
              topEst1RM = est1RM;
            }
          });
        });
        previousMainVal = topEst1RM;
        previousDisplayVal = `${Math.round(maxExternalLoad)} kg`;
        previousSubtext = `Total Dynamic 1RM: ${Math.round(topEst1RM)} kg`;
      }

    } else if (modality === "CARDIO") {
      let maxFosters = 0;
      let maxDuration = 0;
      let totalDuration = 0;
      pastExerciseSessions.forEach((pes) => {
        let sesDuration = 0;
        let sesMaxFosters = 0;
        let sesMaxDuration = 0;
        pes.sets.forEach((set: any) => {
          const dur = Number(set.duration || 0);
          const rpe = Number(set.rpe || 7);
          const minutes = dur / 60;
          const fosters = minutes * rpe;
          sesDuration += dur;
          if (fosters > sesMaxFosters) {
            sesMaxFosters = fosters;
            sesMaxDuration = dur;
          }
        });
        if (sesMaxFosters > maxFosters) {
          maxFosters = sesMaxFosters;
          maxDuration = sesMaxDuration;
          totalDuration = sesDuration;
        }
      });
      previousMainVal = maxFosters;
      previousDisplayVal = formatDurationHM(totalDuration || maxDuration);
      previousSubtext = `Aerobic Systemic Load: ${Math.round(maxFosters)} Units`;
    }
  }

  // Calculate change level metrics
  let status: "increased" | "decreased" | "stable" | "new" = "stable";
  let changePercent = 0;
  let description = "";

  if (previousMainVal === 0) {
    status = "new";
    changePercent = 100;
    if (modality === "CARDIO") {
      description = `Initial Aerobic baseline established at ${currentDisplayVal} (Foster's Load: ${Math.round(currentMainVal)} Units).`;
    } else if (modality === "BODYWEIGHT" && !currentSubtext.includes("Dynamic")) {
      description = `Repetition peak baseline established at ${currentDisplayVal}.`;
    } else {
      description = `Strength baseline established at ${currentDisplayVal} (${currentSubtext}).`;
    }
  } else {
    changePercent = parseFloat((((currentMainVal - previousMainVal) / previousMainVal) * 100).toFixed(1));
    if (changePercent > 0.5) {
      status = "increased";
      if (modality === "CARDIO") {
        description = `Aerobic Systemic Load increased by ${changePercent}% compared to your historic peak.`;
      } else if (modality === "BODYWEIGHT" && !currentSubtext.includes("Dynamic")) {
        description = `Peak Repetition Volume jumped by ${changePercent}% compared to your previous reps.`;
      } else {
        description = `Estimated 1-Rep Max jumped by ${changePercent}% compared to your previous peak.`;
      }
    } else if (changePercent < -0.5) {
      status = "decreased";
      if (modality === "CARDIO") {
        description = `Aerobic Systemic Load decreased by ${Math.abs(changePercent)}% from your historic peak.`;
      } else if (modality === "BODYWEIGHT" && !currentSubtext.includes("Dynamic")) {
        description = `Peak Repetition Volume decreased by ${Math.abs(changePercent)}% from your historic peak.`;
      } else {
        description = `Estimated 1RM decreased by ${Math.abs(changePercent)}% from your historic peak.`;
      }
    } else {
      status = "stable";
      if (modality === "CARDIO") {
        description = `Aerobic conditioning holds stable at its historic peak.`;
      } else if (modality === "BODYWEIGHT" && !currentSubtext.includes("Dynamic")) {
        description = `Peak repetitions remain holding solid matching your previous peak.`;
      } else {
        description = `Est. 1RM remains holding solid matching your previous peak.`;
      }
    }
  }

  return {
    modality,
    exerciseName: exDef?.name || "Exercise",
    exerciseId: ex.exerciseId,
    changePercent,
    status,
    currentMainVal,
    previousMainVal,
    currentDisplayVal,
    previousDisplayVal,
    currentSubtext,
    previousSubtext,
    description,
    currentMaxWeight: modality === "CARDIO" ? 0 : currentMainVal,
    previousMaxWeight: modality === "CARDIO" ? 0 : previousMainVal,
    currentEst1RM: currentMainVal,
    previousEst1RM: previousMainVal
  };
};

interface StrengthChange {
  exerciseName: string;
  exerciseId: string;
  changePercent: number;
  status: "increased" | "decreased" | "stable" | "new";
  currentMaxWeight: number;
  previousMaxWeight: number;
  currentEst1RM: number;
  previousEst1RM: number;
  description: string;
  modality?: "WEIGHTED" | "BODYWEIGHT" | "CARDIO";
  currentMainVal?: number;
  previousMainVal?: number;
  currentDisplayVal?: string;
  previousDisplayVal?: string;
  currentSubtext?: string;
  previousSubtext?: string;
}

interface MuscleImpact {
  muscle: string;
  intensity: number;
  status: "increased" | "decreased" | "stable";
  description: string;
}

interface AnalysisResult {
  congratulations: string;
  summaryFeedback: string;
  nextSessionRecommendations: string;
  strengthChanges: StrengthChange[];
  muscleGroupImpact: MuscleImpact[];
}

export default function WorkoutSplashScene({
  completedWorkout,
  history,
  exercisesList,
  onClose,
  onSaveAnalysis
}: WorkoutSplashSceneProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Save next session recommendations to local storage when analysis is loaded
  useEffect(() => {
    if (analysis && analysis.nextSessionRecommendations) {
      localStorage.setItem("projectpb_next_session_recommendations", analysis.nextSessionRecommendations);
    }
  }, [analysis]);

  // Generate local dummy floating confetti to make the congrats pop
  const [confetti] = useState(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // left%
      y: -10 - Math.random() * 20, // start top
      color: ["#6366f1", "#a855f7", "#ec4899", "#22c55e", "#eab308"][i % 5],
      size: Math.random() * 8 + 4,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2,
      rotate: Math.random() * 360
    }));
  });

  // Local fallback calculation if Gemini API key isn't provided or offline
  const runLocalFallbackAnalysis = () => {
    const changes: StrengthChange[] = [];
    const muscleHits: Record<string, { totalWeight: number; setsCount: number }> = {};

    // For each exercise logged in today's workout
    completedWorkout.exercises.forEach((ex) => {
      const exDef = exercisesList.find((e) => e.id === ex.exerciseId);
      const exCat = exDef?.category || "Other";
      const completedSetsCount = (ex.sets || []).filter(s => s.isCompleted).length;

      if (completedSetsCount === 0) return; // skip unlogged

      const metrics = getExerciseModalityMetrics(ex, exDef, history);
      if (metrics) {
        changes.push(metrics as StrengthChange);
      }

      // Track muscle stimulation limits
      let todayMaxWeight = 0;
      ex.sets.forEach((set) => {
        if (set.isCompleted && set.weight > todayMaxWeight) {
          todayMaxWeight = set.weight;
        }
      });

      if (!muscleHits[exCat]) {
        muscleHits[exCat] = { totalWeight: 0, setsCount: 0 };
      }
      muscleHits[exCat].totalWeight += todayMaxWeight * completedSetsCount;
      muscleHits[exCat].setsCount += completedSetsCount;
    });

    // Compute muscle stimulation impacts
    const muscleImpacts: MuscleImpact[] = Object.keys(muscleHits).map((muscle) => {
      const data = muscleHits[muscle];
      const rawScore = Math.min(100, Math.round((data.totalWeight / 50) + (data.setsCount * 12)));
      return {
        muscle,
        intensity: rawScore,
        status: rawScore > 40 ? "increased" : "stable",
        description: `Delivered high motor-unit fatigue score of ${rawScore}% with ${data.setsCount} working sets.`
      };
    });

    const hasNoCompletedSets = changes.length === 0;

    const fallbackResult: AnalysisResult = {
      congratulations: hasNoCompletedSets
        ? "Session Logged"
        : `Fantastic Workout! You successfully crushed ${completedWorkout.name}!`,
      summaryFeedback: hasNoCompletedSets
        ? "### Training Insights\n- **No Work Sets Logged**: This session was marked finished, but no exercises or sets were checked off in the tracker.\n- **Coach Directive**: Consistency is the ultimate motor driver. Simply starting a session helps reinforce the training habit! Next time, tap the checkmark next to your sets as you finish them so the system can evaluate your progression."
        : `### Training Insights\n- **Incremental Volume Analysis**: Local engine tracked high muscle fatigue limits on **${changes.map(c => c.exerciseName).join(", ") || "this routine"}**.\n- **Execution Quality**: Excellent pacing throughout sets with proper mechanical alignment maintained.`,
      nextSessionRecommendations: hasNoCompletedSets
        ? "- **Habit Anchor**: Plan a shorter 10-15 minute session to maintain momentum without feeling overwhelmed.\n- **Tracking Guidance**: Familiarize yourself with the interface by checking off a single warmup set in your next workout.\n- **Support**: Reach out to the AI Coach to modify parameters or scale weights down."
        : `- **Progressive Overload**: Try raising your starting reps or adding +2.5kg to your top sets of **${changes[0]?.exerciseName || "today's compounds"}** next week.\n- **Form Cue**: Prioritize controlled tempo and slow down the eccentric phase to maximise mechanical tension.\n- **ATP Recovery**: Hold rest spacing to an optimised 90 seconds.`,
      strengthChanges: changes,
      muscleGroupImpact: muscleImpacts
    };

    setAnalysis(fallbackResult);
    if (onSaveAnalysis) {
      onSaveAnalysis(fallbackResult);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (completedWorkout.analysis) {
      setAnalysis(completedWorkout.analysis);
      setLoading(false);
      return;
    }

    const fetchAIAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await robustFetch(apiUrl("/api/ai/analyze-workout"), {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(await getAuthHeader()) },
          body: JSON.stringify({ workout: completedWorkout, history })
        }, {
          useCache: true,
          cacheKey: "analyze-workout-" + completedWorkout.id,
        });

        if (!response.ok) {
          throw new Error("Gemini analyzer returned error response status");
        }

        const data = await response.json();
        setAnalysis(data);
        if (onSaveAnalysis) {
          onSaveAnalysis(data);
        }
      } catch (err) {
        console.warn("Could not load cloud Gemini analysis, utilizing responsive fallback engine:", err);
        // Fall back gracefully so the client never crashes
        runLocalFallbackAnalysis();
      } finally {
        setLoading(false);
      }
    };

    fetchAIAnalysis();
  }, [completedWorkout, history, onSaveAnalysis]);

  // Construct dynamic, modality-routed strength & endurance changes utilizing strict UK English conventions
  const enrichedStrengthChanges = React.useMemo(() => {
    if (!analysis || !analysis.strengthChanges) return [];

    return completedWorkout.exercises.map((ex) => {
      const exDef = exercisesList.find((e) => e.id === ex.exerciseId);
      const metrics = getExerciseModalityMetrics(ex, exDef, history);
      
      // Merge with any Gemini descriptions/status if found
      const geminiChange = analysis.strengthChanges.find(c => c.exerciseId === ex.exerciseId);
      
      if (metrics) {
        return {
          ...metrics,
          description: geminiChange?.description || metrics.description,
          status: geminiChange?.status || metrics.status,
          changePercent: geminiChange?.changePercent !== undefined ? geminiChange.changePercent : metrics.changePercent
        } as StrengthChange;
      }
      return null;
    }).filter((item): item is StrengthChange => item !== null);
  }, [analysis, completedWorkout, exercisesList, history]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-black backdrop-blur-xl overflow-y-auto invisible-scrollbar">
      {/* CONFETTI LAYER */}
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: `${c.size}px`,
            height: `${c.size}px`,
            backgroundColor: c.color,
            transform: `rotate(${c.rotate}deg)`
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [`${c.x}%`, `${c.x + (Math.random() * 20 - 10)}%`],
            rotate: [c.rotate, c.rotate + 360]
          }}
          transition={{
            duration: c.duration,
            delay: c.delay,
            ease: "easeInOut",
            repeat: Infinity
          }}
        />
      ))}

      {/* CORE HIGH-POLISHED CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          boxShadow: [
            "0 0 30px 2px rgba(99,102,241,0.3), 0 15px 40px rgba(0,0,0,0.8)",
            "0 0 45px 12px rgba(168,85,247,0.45), 0 15px 40px rgba(0,0,0,0.8)",
            "0 0 30px 2px rgba(99,102,241,0.3), 0 15px 40px rgba(0,0,0,0.8)"
          ]
        }}
        transition={{ 
          opacity: { type: "spring", damping: 25, stiffness: 120 },
          scale: { type: "spring", damping: 25, stiffness: 120 },
          y: { type: "spring", damping: 25, stiffness: 120 },
          boxShadow: { repeat: Infinity, duration: 3.5, ease: "easeInOut" }
        }}
        className="w-full max-w-2xl bg-white dark:bg-black rounded-3xl border border-indigo-500/40 p-6 sm:p-8 relative overflow-hidden my-auto max-h-[92vh] overflow-y-auto invisible-scrollbar flex flex-col gap-6"
      >
        {/* Holographic Glowing Orbs */}
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* Header Congratulatory Block */}
        <div className="text-center relative">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-full border border-indigo-500/30 text-indigo-400 mb-4 animate-bounce shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight flex flex-col gap-1 items-center justify-center">
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent uppercase tracking-wider font-mono text-[11px] font-extrabold">Workout Completed</span>
            <span>{completedWorkout.name || "Routine Finished"}</span>
          </h2>
          <p className="text-xs text-indigo-600 dark:text-indigo-300/80 mt-1 font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>Completed in {Math.round((new Date(completedWorkout.endTime || new Date()).getTime() - new Date(completedWorkout.startTime).getTime()) / 60000)} minutes!</span>
          </p>
        </div>

        {/* LOADING ENGINE SCREEN */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-purple-500/10 border-b-purple-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1s" }} />
              <div className="absolute inset-4 rounded-full bg-white dark:bg-black flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-slate-100 font-mono animate-pulse">Neural Coach Analysing Biometrics...</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Comparing 1RM peaks & muscle fibre stress thresholds</p>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {error && !analysis && (
          <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20 text-center space-y-2">
            <p className="text-xs font-bold text-orange-400">{error}</p>
            <Button
              variant="outline"
              onClick={runLocalFallbackAnalysis}
              className="px-4 py-2 bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              Analyse Locally Instead
            </Button>
          </div>
        )}

        {/* ANALYSIS INSIGHTS CONTAINER */}
        {analysis && (
          <div className="space-y-6 flex-1">
            
            {/* 1. Congratulatory Message banner */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-start space-x-3 shadow-inner">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 leading-relaxed italic">
                "{analysis.congratulations}"
              </p>
            </div>

            {/* 2. Muscle Stimulation Images/Diagrams Section - Interactive Vector Display */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Stimulation Index (Anatomical Target Impact)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visual Body Simulation Chart */}
                <div className="bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center h-56 relative overflow-hidden">
                  {/* High Tech High Contrast Anatomical Outline Graphics */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]" />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">Active Vector Map</span>
                  
                  {/* Simulated neon skeleton muscle highlights */}
                  <svg viewBox="0 0 100 120" className="w-32 h-44 drop-shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                    {/* Head */}
                    <circle cx="50" cy="18" r="8" className="fill-gray-200 dark:fill-[#1b1b2f] stroke-indigo-500/40" strokeWidth="1.5" />
                    {/* Neck */}
                    <line x1="50" y1="26" x2="50" y2="32" className="stroke-indigo-500/40" strokeWidth="2" />
                    
                    {/* Chest (Pecs) */}
                    <rect x="38" y="32" width="24" height="16" rx="2" 
                      className={`transition-colors ${analysis.muscleGroupImpact.some(m => m.muscle.toLowerCase().includes("chest")) ? "fill-indigo-500" : "fill-gray-100 dark:fill-[#141424]"} stroke-indigo-400/40`} 
                      strokeWidth="1" 
                    />
                    
                    {/* Ribs / Spine */}
                    <line x1="50" y1="48" x2="50" y2="70" className="stroke-indigo-500/40" strokeWidth="2" />

                    {/* Shoulder Delts */}
                    <circle cx="34" cy="34" r="5" 
                      className={`transition-colors ${analysis.muscleGroupImpact.some(m => m.muscle.toLowerCase().includes("shoulder")) ? "fill-pink-500" : "fill-gray-100 dark:fill-[#141424]"} stroke-pink-400/40`} 
                      strokeWidth="1" 
                    />
                    <circle cx="66" cy="34" r="5" 
                      className={`transition-colors ${analysis.muscleGroupImpact.some(m => m.muscle.toLowerCase().includes("shoulder")) ? "fill-pink-500" : "fill-gray-100 dark:fill-[#141424]"} stroke-pink-400/40`} 
                      strokeWidth="1" 
                    />

                    {/* Arms (Biceps) */}
                    <rect x="29" y="39" width="5" height="15" rx="1.5" 
                      className={`transition-colors ${analysis.muscleGroupImpact.some(m => m.muscle.toLowerCase().includes("arm")) ? "fill-violet-500" : "fill-gray-100 dark:fill-[#141424]"} stroke-violet-400/40`} 
                    />
                    <rect x="66" y="39" width="5" height="15" rx="1.5" 
                      className={`transition-colors ${analysis.muscleGroupImpact.some(m => m.muscle.toLowerCase().includes("arm")) ? "fill-violet-500" : "fill-gray-100 dark:fill-[#141424]"} stroke-violet-400/40`} 
                    />

                    {/* Core (Abs) / Back */}
                    <rect x="42" y="52" width="16" height="15" rx="2" 
                      className={`transition-colors ${analysis.muscleGroupImpact.some(m => m.muscle.toLowerCase().includes("core") || m.muscle.toLowerCase().includes("back")) ? "fill-purple-500" : "fill-gray-100 dark:fill-[#141424]"} stroke-purple-400/40`} 
                      strokeWidth="1" 
                    />

                    {/* Hips / Glutes */}
                    <rect x="37" y="70" width="26" height="10" rx="3" className="fill-gray-200 dark:fill-[#1b1b2f] stroke-indigo-500/40" strokeWidth="1.5" />

                    {/* Legs (Quads) */}
                    <rect x="38" y="82" width="8" height="22" rx="2" 
                      className={`transition-colors ${analysis.muscleGroupImpact.some(m => m.muscle.toLowerCase().includes("leg")) ? "fill-emerald-500" : "fill-gray-100 dark:fill-[#141424]"} stroke-emerald-400/40`} 
                    />
                    <rect x="54" y="82" width="8" height="22" rx="2" 
                      className={`transition-colors ${analysis.muscleGroupImpact.some(m => m.muscle.toLowerCase().includes("leg")) ? "fill-emerald-500" : "fill-gray-100 dark:fill-[#141424]"} stroke-emerald-400/40`} 
                    />
                  </svg>
                </div>

                {/* Impact details list */}
                <div className="space-y-2 flex flex-col justify-between">
                  {analysis.muscleGroupImpact.map((imp) => (
                    <div key={imp.muscle} className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl space-y-1.5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-gray-900 dark:text-gray-100 flex items-center space-x-1.5">
                          <span className={`w-2 h-2 rounded-full ${imp.intensity > 70 ? "bg-rose-500" : imp.intensity > 40 ? "bg-indigo-400" : "bg-emerald-400"}`} />
                          <span>{imp.muscle} Target Group</span>
                        </span>
                        <span className="text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-300">
                          {imp.intensity}% Intensity
                        </span>
                      </div>
                      
                      {/* Interactive percentage bar */}
                      <div className="w-full bg-white dark:bg-black dark:border-white/10 shadow-sm rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${imp.intensity}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full bg-gradient-to-r ${imp.intensity > 70 ? "from-indigo-500 to-rose-500" : "from-indigo-500 to-purple-500"}`}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-normal">{imp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Strength Changes Section - Sleek Custom SVG Interactive Graphs */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                <span>Performance & Fitness Evolution (Modality-Routed Trend)</span>
              </h3>

              <div className="space-y-4 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/5 p-4 rounded-2xl">
                {enrichedStrengthChanges.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-slate-400 text-center py-4">No exercises tracked in active sets.</p>
                ) : (
                  enrichedStrengthChanges.map((change) => {
                    const isIncrease = change.status === "increased";
                    const isNew = change.status === "new";
                    const isStable = change.status === "stable";
                    
                    // Ratio for rendering comparative bars nicely
                    const cVal = change.currentMainVal || 0;
                    const pVal = change.previousMainVal || 0;
                    const topLimit = Math.max(cVal, pVal, 1) || 120;
                    const prevPercent = Math.min(100, Math.round((pVal / topLimit) * 100));
                    const currPercent = Math.min(100, Math.round((cVal / topLimit) * 100));

                    // Dynamic badge labels
                    let badgeLabel = "";
                    if (isNew) {
                      badgeLabel = "NEW TARGET";
                    } else if (change.modality === "CARDIO") {
                      badgeLabel = `${isIncrease ? "+" : ""}${change.changePercent}% AEROBIC`;
                    } else if (change.modality === "BODYWEIGHT" && !change.currentSubtext?.includes("Dynamic")) {
                      badgeLabel = `${isIncrease ? "+" : ""}${change.changePercent}% REPS`;
                    } else {
                      badgeLabel = `${isIncrease ? "+" : ""}${change.changePercent}% 1RM`;
                    }

                    return (
                      <div key={change.exerciseId} className="space-y-3 border-b border-gray-200 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                        {/* Title and Badge row - responsive wrapping */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs font-extrabold text-gray-900 dark:text-gray-100">{change.exerciseName}</h4>
                              <span className="text-[8px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-650 dark:text-gray-300">
                                {change.modality || "WEIGHTED"}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-slate-450 leading-relaxed font-normal">{change.description}</p>
                          </div>

                          <div className="flex items-center shrink-0 self-start sm:self-center">
                            {isNew ? (
                              <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-lg font-mono">
                                {badgeLabel}
                              </span>
                            ) : isIncrease ? (
                              <span className="text-[9px] bg-indigo-500/15 text-indigo-650 dark:text-indigo-300 border border-indigo-500/20 font-bold px-2 py-0.5 rounded-lg flex items-center space-x-1 font-mono">
                                <TrendingUp className="w-3 h-3 text-indigo-500 dark:text-indigo-400 mr-0.5" />
                                <span>{badgeLabel}</span>
                              </span>
                            ) : isStable ? (
                              <span className="text-[9px] bg-slate-500/10 text-slate-500 border border-slate-500/20 font-bold px-2 py-0.5 rounded-lg font-mono">
                                HOLDING SOLID
                              </span>
                            ) : (
                              <span className="text-[9px] bg-rose-500/15 text-rose-600 dark:text-rose-350 border border-rose-500/20 font-bold px-2 py-0.5 rounded-lg flex items-center space-x-1 font-mono">
                                <TrendingDown className="w-3 h-3 text-rose-500 dark:text-rose-450 mr-0.5" />
                                <span>{badgeLabel}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Comparative Graph Bars representation */}
                        <div className="space-y-2 pt-1 font-mono">
                          {/* Previous Bar */}
                          {pVal > 0 && (
                            <div className="flex items-center space-x-2 text-[10px] sm:space-x-3">
                              <span className="w-20 text-gray-500 dark:text-slate-400 text-left shrink-0">Previous Peak:</span>
                              <div className="flex-1 bg-white dark:bg-black dark:border-white/10 shadow-sm h-2.5 rounded-md overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${prevPercent}%` }}
                                  transition={{ duration: 0.8 }}
                                  className="h-full bg-slate-650/40 border-r-2 border-slate-450 rounded-md"
                                />
                              </div>
                              <span className="w-24 text-right font-medium text-gray-500 dark:text-slate-400 shrink-0">
                                {change.previousDisplayVal}
                              </span>
                            </div>
                          )}

                          {/* Today's Bar */}
                          <div className="flex items-center space-x-2 text-[10px] sm:space-x-3">
                            <span className="w-20 text-indigo-600 dark:text-indigo-300 text-left shrink-0">This Session:</span>
                            <div className="flex-1 bg-white dark:bg-black h-3.5 rounded-md overflow-hidden ring-1 ring-indigo-500/15">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${currPercent}%` }}
                                transition={{ duration: 1, delay: 0.1 }}
                                className={`h-full bg-gradient-to-r ${
                                  isNew ? "from-indigo-600 to-emerald-500 border-emerald-400" : isIncrease ? "from-indigo-600 to-purple-600" : "from-gray-300 dark:from-[#222238] to-gray-400 dark:to-[#121219]"
                                } border-r-2 rounded-md`}
                                style={{ width: `${currPercent}%` }}
                              />
                            </div>
                            <span className={`w-24 text-right font-extrabold shrink-0 ${isIncrease ? "text-indigo-600 dark:text-indigo-300 text-xs" : isNew ? "text-emerald-500 dark:text-emerald-300" : "text-slate-700 dark:text-slate-300"}`}>
                              {change.currentDisplayVal}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 4. Coach Training and Focus broken into 2 separate sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* SECTION A: WORKOUT PERFORMANCE ANALYSIS */}
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5 font-normal leading-relaxed text-gray-600 dark:text-slate-300 space-y-3 flex flex-col justify-start">
                <h4 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest font-mono flex items-center space-x-1.5 shrink-0">
                  <BrainCircuit className="w-4 h-4 text-indigo-400" />
                  <span>Workout Analysis & Insights</span>
                </h4>
                <div className="text-xs text-slate-350 space-y-2 leading-relaxed font-sans flex-1">
                  {analysis.summaryFeedback.split("\n").map((line, idx) => {
                    if (line.startsWith("###")) {
                      return <h5 key={idx} className="font-extrabold text-gray-900 dark:text-gray-100 text-xs pt-1.5 mt-2 flex items-center">{line.replace("###", "").trim()}</h5>;
                    }
                    if (line.startsWith("- **")) {
                      const match = line.match(/- \*\*(.*?)\*\*:(.*)/);
                      if (match) {
                        return (
                          <div key={idx} className="ml-1 pl-2 border-l border-indigo-500/30 text-gray-600 dark:text-slate-300">
                            <strong className="text-indigo-500 dark:text-indigo-200">{match[1]}</strong>: {match[2]}
                          </div>
                        );
                      }
                    }
                    if (line.trim().startsWith("-")) {
                      return <li key={idx} className="list-disc list-inside text-gray-600 dark:text-slate-300 ml-1.5">{line.replace("-", "").trim()}</li>;
                    }
                    if (line.trim().length === 0) return null;
                    return <p key={idx} className="text-gray-600 dark:text-slate-300 text-[11px] leading-relaxed">{line.trim()}</p>;
                  })}
                </div>
              </div>

              {/* SECTION B: RECOMMENDATIONS FOR NEXT SESSION */}
              <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 font-normal leading-relaxed text-gray-600 dark:text-slate-300 space-y-3 flex flex-col justify-start">
                <h4 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono flex items-center space-x-1.5 shrink-0">
                  <Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-300 fill-yellow-500 dark:fill-yellow-300 animate-pulse" />
                  <span>Next Session Recommendations</span>
                </h4>
                <div className="text-xs text-gray-600 dark:text-slate-300 space-y-2 leading-relaxed font-sans flex-1">
                  {(analysis.nextSessionRecommendations || "").split("\n").map((line, idx) => {
                    if (line.startsWith("###")) {
                      return <h5 key={idx} className="font-extrabold text-indigo-700 dark:text-indigo-300 text-xs pt-1.5 mt-2 flex items-center">{line.replace("###", "").trim()}</h5>;
                    }
                    if (line.startsWith("- **")) {
                      const match = line.match(/- \*\*(.*?)\*\*:(.*)/);
                      if (match) {
                        return (
                          <div key={idx} className="ml-1 pl-2 border-l border-indigo-500/30 text-gray-800 dark:text-slate-200">
                            <strong className="text-indigo-700 dark:text-indigo-300">{match[1]}</strong>: {match[2]}
                          </div>
                        );
                      }
                    }
                    if (line.trim().startsWith("-")) {
                      return <li key={idx} className="list-disc list-inside text-gray-700 dark:text-indigo-200 ml-1.5">{line.replace("-", "").trim()}</li>;
                    }
                    if (line.trim().length === 0) return null;
                    return <p key={idx} className="text-gray-700 dark:text-indigo-100/90 text-[11px] leading-relaxed">{line.trim()}</p>;
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Buttons Controls inside Overlay */}
        <div className="pt-4 border-t border-gray-200 dark:border-white/5 flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full items-stretch">
          {loading || !analysis ? (
            <Button
              variant="tonal"
              onClick={onClose}
              className="w-full py-3 px-6 bg-gray-50 dark:bg-slate-900/80 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 font-extrabold text-xs uppercase tracking-wider font-mono rounded-xl shadow-md transition-all cursor-pointer text-center"
            >
              Skip Analysis & Save Workout
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={onClose}
              className="w-full py-3 px-6 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-550 hover:to-purple-550 text-white font-extrabold text-xs uppercase tracking-wider font-mono rounded-xl shadow-lg transition-all cursor-pointer text-center ring-1 ring-white/10"
            >
              Acknowledge Coach Analytics & Save
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Custom Micro BrainCircuit representation to avoid lucide collision
function BrainCircuit(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M5 12H3" />
      <path d="M21 12h-2" />
      <path d="M18.36 5.64l-1.42 1.42" />
      <path d="M7.05 16.95l-1.42 1.42" />
      <path d="M18.36 18.36l-1.42-1.42" />
      <path d="M7.05 7.05L5.64 5.64" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
