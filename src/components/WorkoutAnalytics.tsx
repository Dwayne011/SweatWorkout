/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { WorkoutSession, Exercise } from "../types";
import { robustFetch } from "../utils/network";
import { 
  TrendingUp, 
  TrendingDown,
  Activity, 
  Calendar, 
  Award, 
  Clock, 
  Flame, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Scale,
  Dumbbell,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

interface WorkoutAnalyticsProps {
  history: WorkoutSession[];
  exercisesList: Exercise[];
  onAskGemini: (prompt: string) => void;
}

export default function WorkoutAnalytics({ history, exercisesList, onAskGemini }: WorkoutAnalyticsProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [activeMetricTab, setActiveMetricTab] = useState<"strength" | "volume">("strength");

  // Performance Diagnostic Coaching Engine State
  const [diagnosticInsights, setDiagnosticInsights] = useState<any[]>([]);
  const [diagnosticLoading, setDiagnosticLoading] = useState<boolean>(false);
  const [diagnosticError, setDiagnosticError] = useState<string>("");

  const diagnosticPayload = useMemo(() => {
    const now = new Date().getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;

    const weekly_tonnage_history = [0, 0, 0, 0];
    const cardio_load_history = [0, 0, 0, 0];
    const muscle_split_volume: Record<string, number> = {};
    const consistency_matrix = Array(30).fill(0);

    let hasLogs = false;

    history.forEach((session) => {
      if (!session.endTime) return;
      hasLogs = true;
      const sessionTime = new Date(session.startTime).getTime();
      const ageMs = now - sessionTime;

      // 30-day activity matrix
      if (ageMs <= 30 * dayMs) {
        const dayIdx = 29 - Math.floor(ageMs / dayMs);
        if (dayIdx >= 0 && dayIdx < 30) {
          consistency_matrix[dayIdx] = 1;
        }
      }

      // 4-week split calculation
      let weekIdx = -1;
      if (ageMs < 1 * weekMs) {
        weekIdx = 3; // Current Week
      } else if (ageMs >= 1 * weekMs && ageMs < 2 * weekMs) {
        weekIdx = 2;
      } else if (ageMs >= 2 * weekMs && ageMs < 3 * weekMs) {
        weekIdx = 1;
      } else if (ageMs >= 3 * weekMs && ageMs < 4 * weekMs) {
        weekIdx = 0; // Oldest Week
      }

      session.exercises.forEach((ex) => {
        const found = exercisesList.find((e) => e.id === ex.exerciseId);
        const cat = found?.category || "Other";
        
        ex.sets.forEach((s) => {
          if (s.isCompleted) {
            const isCardio = cat === "Cardio";
            
            // 7-day muscle split
            if (ageMs < 7 * dayMs) {
              muscle_split_volume[cat] = (muscle_split_volume[cat] || 0) + 1;
            }

            if (weekIdx !== -1) {
              if (isCardio) {
                // sRPE load = duration * RPE
                const durationMins = s.duration ? Math.ceil(s.duration / 60) : 15;
                const rpe = Number(s.rpe) || 7;
                cardio_load_history[weekIdx] += durationMins * rpe;
              } else {
                weekly_tonnage_history[weekIdx] += s.weight * s.reps;
              }
            }
          }
        });
      });
    });

    // Highly comprehensive baselines if no logged data exists
    if (!hasLogs) {
      return {
        weekly_tonnage_history: [3800, 4120, 3950, 4420],
        cardio_load_history: [90, 115, 110, 135],
        muscle_split_volume: {
          "Chest": 14,
          "Back": 12,
          "Legs": 8, // prioritized zones like Legs/Quads drops slightly below 10 sets to trigger bias
          "Shoulders": 11,
          "Arms": 6,
          "Cardio": 14
        },
        consistency_matrix: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1]
      };
    }

    return {
      weekly_tonnage_history,
      cardio_load_history,
      muscle_split_volume,
      consistency_matrix
    };
  }, [history, exercisesList]);

  const fetchDiagnosticInsights = async () => {
    setDiagnosticLoading(true);
    setDiagnosticError("");
    try {
      const response = await robustFetch("/api/ai/diagnostic-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diagnosticPayload),
      }, {
        useCache: true,
        cacheKey: "diagnostic-insights-" + JSON.stringify(diagnosticPayload),
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to fetch diagnostic insights");
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setDiagnosticInsights(data);
      } else {
        setDiagnosticInsights([]);
      }
    } catch (err: any) {
      console.error(err);
      setDiagnosticError(err.message || "Failed to reach diagnostics engine");
    } finally {
      setDiagnosticLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDiagnosticInsights();
  }, [diagnosticPayload]);

  // 1. CHRONIC DATA PREPARATION (Chronological list of completed sessions)
  const completedHistoryChronological = useMemo(() => {
    return [...history]
      .filter((s) => s.endTime) // only consider fully completed sessions
      .reverse();
  }, [history]);

  // 2. EXTRACT EXERCISES WITH COMPLETED SETS
  const exercisesWithLogs = useMemo(() => {
    const ids = new Set<string>();
    completedHistoryChronological.forEach((session) => {
      session.exercises.forEach((ex) => {
        if (ex.sets.some((s) => s.isCompleted)) {
          ids.add(ex.exerciseId);
        }
      });
    });

    const list = Array.from(ids).map((id) => {
      return exercisesList.find((ex) => ex.id === id) || { 
        id, 
        name: id, 
        category: "Other", 
        equipment: "Other" 
      };
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [completedHistoryChronological, exercisesList]);

  // Set default initial exercise selection
  React.useEffect(() => {
    if (exercisesWithLogs.length > 0 && !selectedExerciseId) {
      setSelectedExerciseId(exercisesWithLogs[0].id);
    }
  }, [exercisesWithLogs, selectedExerciseId]);

  // 3. COMPUTE WEIGHT PROGRESSION HISTORY FOR THE SELECTED EXERCISE
  const progressionData = useMemo(() => {
    if (!selectedExerciseId) return [];

    const dataPoints: { 
      date: string; 
      timestamp: number; 
      weight: number; 
      reps: number; 
      volume: number; 
      estMax: number; 
    }[] = [];

    completedHistoryChronological.forEach((session) => {
      const targetEx = session.exercises.find((e) => e.exerciseId === selectedExerciseId);
      if (targetEx) {
        let bestSetWeight = 0;
        let bestSetReps = 0;
        let exerciseVolume = 0;

        targetEx.sets.forEach((s) => {
          if (s.isCompleted) {
            exerciseVolume += s.weight * s.reps;
            if (s.weight > bestSetWeight) {
              bestSetWeight = s.weight;
              bestSetReps = s.reps;
            } else if (s.weight === bestSetWeight && s.reps > bestSetReps) {
              bestSetReps = s.reps;
            }
          }
        });

        if (bestSetWeight > 0) {
          // Brzycki 1RM Estimate Formula: Weight / (1.0278 - (0.0278 * Reps))
          const estMax = bestSetReps > 1 
            ? Math.round(bestSetWeight / (1.0278 - 0.0278 * bestSetReps)) 
            : bestSetWeight;

          const dateObj = new Date(session.startTime);
          const localString = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          
          dataPoints.push({
            date: localString,
            timestamp: dateObj.getTime(),
            weight: bestSetWeight,
            reps: bestSetReps,
            volume: exerciseVolume,
            estMax: estMax,
          });
        }
      }
    });

    return dataPoints;
  }, [completedHistoryChronological, selectedExerciseId]);

  // 4. GOOGLE HEALTH STYLE: EXHAUSTIVE CLINICAL CALCULATIONS
  const clinicalMetrics = useMemo(() => {
    const metrics = {
      totalWorkouts: history.length,
      weeklyAverage: 0,
      totalTonnage: 0,
      streakWeeks: 0,
      wowChangePct: 0,
      prevWeekTonnage: 0,
      currWeekTonnage: 0,
      favouriteMuscle: "Other",
      muscleDistribution: {} as Record<string, number>, // Category -> Completed Sets
      totalCompletedSets: 0,
      coachingInsights: [] as { title: string; desc: string; type: "alert" | "info" | "success" }[],
    };

    if (history.length === 0) return metrics;

    const now = new Date().getTime();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    // A. CALCULATE TONNAGE AND MUSCLE SPLITS
    history.forEach((session) => {
      const sessionTime = new Date(session.startTime).getTime();
      const inCurrentWeek = now - sessionTime <= oneWeekMs;
      const inPreviousWeek = (now - sessionTime > oneWeekMs) && (now - sessionTime <= 2 * oneWeekMs);

      session.exercises.forEach((ex) => {
        const cat = exercisesList.find((e) => e.id === ex.exerciseId)?.category || "Other";
        
        ex.sets.forEach((s) => {
          if (s.isCompleted) {
            metrics.totalCompletedSets++;
            const sVol = s.weight * s.reps;
            metrics.totalTonnage += sVol;

            // Track muscle group set volume
            metrics.muscleDistribution[cat] = (metrics.muscleDistribution[cat] || 0) + 1;

            if (inCurrentWeek) {
              metrics.currWeekTonnage += sVol;
            } else if (inPreviousWeek) {
              metrics.prevWeekTonnage += sVol;
            }
          }
        });
      });
    });

    // B. FAVORITE MUSCLE GROUP
    let maxSets = 0;
    Object.entries(metrics.muscleDistribution).forEach(([cat, count]) => {
      if (count > maxSets) {
        maxSets = count;
        metrics.favouriteMuscle = cat;
      }
    });

    // C. WEEK-OVER-WEEK (WoW) TONNAGE PERFORMANCE TREND
    if (metrics.prevWeekTonnage > 0) {
      metrics.wowChangePct = Math.round(
        ((metrics.currWeekTonnage - metrics.prevWeekTonnage) / metrics.prevWeekTonnage) * 100
      );
    } else if (metrics.currWeekTonnage > 0) {
      metrics.wowChangePct = 100; // First week logging
    }

    // D. TRAINING FREQUENCY CALCULATION
    if (history.length > 0) {
      const earliest = new Date(history[history.length - 1].startTime).getTime();
      const spannedWeeks = Math.max(1, Math.ceil((now - earliest) / (oneWeekMs)));
      metrics.weeklyAverage = parseFloat((history.length / spannedWeeks).toFixed(1));
    }

    // E. WEEKS CONSISTENCY STREAK
    const weeklyActivityArray = Array(6).fill(0);
    history.forEach((session) => {
      const sessionDate = new Date(session.startTime);
      const diffWeeks = Math.floor((now - sessionDate.getTime()) / oneWeekMs);
      if (diffWeeks >= 0 && diffWeeks < 6) {
        weeklyActivityArray[5 - diffWeeks]++;
      }
    });

    let currentStreak = 0;
    for (let i = 5; i >= 0; i--) {
      if (weeklyActivityArray[i] > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    metrics.streakWeeks = currentStreak;

    // F. COMPUTE SMART BIOMETRIC ALERTS & WARNINGS (Clinical Balance Auditing)
    const totalSetsWithLogs = metrics.totalCompletedSets || 1;
    const distributionPercentages = Object.entries(metrics.muscleDistribution).reduce((acc, [cat, val]) => {
      acc[cat] = Math.round((val / totalSetsWithLogs) * 100);
      return acc;
    }, {} as Record<string, number>);

    // Muscle balance audits
    const chestSetsPct = distributionPercentages["Chest"] || 0;
    const backSetsPct = distributionPercentages["Back"] || 0;
    const legSetsPct = distributionPercentages["Legs"] || 0;

    if (chestSetsPct > 35 && backSetsPct < 15) {
      metrics.coachingInsights.push({
        title: "Push/Pull Imbalance Warning",
        desc: `Your Chest volume (${chestSetsPct}%) heavily supersedes Back volume (${backSetsPct}%). To prevent round-shouldering and protect rotator cuff health, we recommend introducing horizontal pulls (e.g., Cable Rows or Dumbbell Rows) to reach a balanced 1:1 hypertrophy split.`,
        type: "alert",
      });
    }

    if (metrics.totalWorkouts > 4 && legSetsPct < 10) {
      metrics.coachingInsights.push({
        title: "Neglected Posterior Chain Alert",
        desc: "Lifting records indicate Legs make up less than 10% of your total working sets. Leg workouts trigger systemic growth hormone release. We configure a template with Back Squats or Romanian Deadlifts to align with structural posture.",
        type: "alert",
      });
    }

    // Positive indicators
    if (metrics.wowChangePct > 5) {
      metrics.coachingInsights.push({
        title: "Progressive Overload Active",
        desc: `Superb! Your weekly tonnage has escalated by ${metrics.wowChangePct}% WoW. Progressive overload is the prime mechanism of hypertrophy. Continue scaling weights or rep metrics slowly to build density.`,
        type: "success",
      });
    }

    if (metrics.streakWeeks >= 3) {
      metrics.coachingInsights.push({
        title: "Neural Path Adaptation Established",
        desc: `You have successfully completed workouts for ${metrics.streakWeeks} straight weeks! Consistently entering motor loops promotes efficient neural drive recruitment. Keep active!`,
        type: "success",
      });
    }

    // Default general advice if logs are small
    if (metrics.coachingInsights.length === 0) {
      metrics.coachingInsights.push({
        title: "Dynamic Analytics Calibrating",
        desc: "Complete more workout sessions and log your sets with weights. SW3AT will automatically populate deep cardiovascular trends, biomechanical ratios, and muscle-recovery pacing benchmarks.",
        type: "info",
      });
    }

    return metrics;
  }, [history, exercisesList]);

  // 5. BEZIER SVG CHART UTILS (For responsive line progression rendering)
  const chartMath = useMemo(() => {
    const data = progressionData;
    if (data.length < 2) return { linePath: "", fillPath: "", points: [] };
    
    const width = 500;
    const height = 180;
    const padding = 35;

    // Use selected sub-metric
    const plotValues = activeMetricTab === "strength" 
      ? data.map(d => d.estMax) 
      : data.map(d => d.volume);

    const minV = Math.max(0, Math.min(...plotValues) - 5);
    const maxV = Math.max(...plotValues) + 5;
    const range = maxV - minV || 10;

    const points = data.map((d, i) => {
      const val = activeMetricTab === "strength" ? d.estMax : d.volume;
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - minV) / range) * (height - padding * 2.2);
      return { x, y, data: d, val };
    });

    // Build curve line path
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    // Build shaded outline fill path
    let fillPath = linePath;
    fillPath += ` L ${points[points.length - 1].x} ${height - padding}`;
    fillPath += ` L ${points[0].x} ${height - padding} Z`;

    return { linePath, fillPath, points };
  }, [progressionData, activeMetricTab]);

  // 6. LAST 30 DAYS HEALTH GRID CALCULATOR
  const calendarActivityGrid = useMemo(() => {
    const grid: { date: Date; label: string; active: boolean; minutes: number; sessionName: string }[] = [];
    const now = new Date();
    
    // Create past 30 days chronologically
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      
      // Match active sessions
      const matched = history.find((s) => {
        if (!s.startTime) return false;
        const sD = new Date(s.startTime);
        return sD.getDate() === d.getDate() && 
               sD.getMonth() === d.getMonth() && 
               sD.getFullYear() === d.getFullYear();
      });

      let duration = 0;
      if (matched && matched.endTime) {
        duration = Math.round((new Date(matched.endTime).getTime() - new Date(matched.startTime).getTime()) / (60 * 1000));
      } else if (matched) {
        duration = 45; // Default guess
      }

      grid.push({
        date: d,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        active: !!matched,
        minutes: duration,
        sessionName: matched ? matched.name : "Rest Day"
      });
    }

    return grid;
  }, [history]);

  // Muscle color badges helper
  const getMuscleBg = (cat: string) => {
    switch(cat) {
      case "Chest": return "bg-indigo-55 bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "Back": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Legs": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Shoulders": return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      case "Arms": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-slate-500/10 text-gray-500 dark:text-slate-400 border-slate-500/20";
    }
  };

  const getCategoryDisplayName = (cat: string) => {
    switch (cat) {
      case "GREEN_STATUS": return "Great Consistency";
      case "ALERT_STATUS": return "Fatigue Warning";
      case "BIAS_IMBALANCE": return "Muscle Split Imbalance";
      case "CONCURRENT_INTERFERENCE_WARNING": return "Cardio & Strength Balance";
      default: return (cat || "").replace(/_/g, " ");
    }
  };

  const hasLogs = useMemo(() => {
    return history.some((s) => s.endTime);
  }, [history]);

  if (!hasLogs) {
    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center space-y-6 max-w-lg mx-auto my-12 animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Activity className="w-8 h-8 animate-pulse text-indigo-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">No Dynamic Workout Data</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold leading-relaxed max-w-sm">
            Once you log and complete a workout session, your muscle split ratios, volume trends, and expert trainer feedback will calibrate automatically here.
          </p>
        </div>
        <div className="p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/5 text-[11px] text-gray-600 dark:text-slate-350 font-bold max-w-xs leading-relaxed shadow-sm">
          💡 Try starting a routine from the <span className="text-indigo-500 dark:text-indigo-400">Workout</span> tab, or ask the AI to log a workout of yours!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. HERO GOOGLE HEALTH BRANDED HEADLINE GRID */}
      <div className="relative overflow-hidden bg-white dark:bg-gradient-to-tr dark:from-[#11111d] dark:via-[#15162b] dark:to-[#1d1e3d] rounded-3xl p-6 text-white border border-gray-200 dark:border-white/5 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500/15 to-indigo-500/15 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-fit mb-3 backdrop-blur-md">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Diagnostic Team Feedback</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight">Health & Strength Analytics</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 max-w-lg mt-1 block font-semibold leading-relaxed">
              Explore your muscle splits, workload consistency, and dynamic volume progression in plain, simple terms.
            </p>
          </div>
          
          <button
            onClick={() => {
              const summaries = history.map((h, idx) => {
                const totalVol = h.exercises.reduce((vSum, ex) => vSum + ex.sets.reduce((sSum, s) => sSum + (s.isCompleted ? s.weight * s.reps : 0), 0), 0);
                return `#${idx+1}: ${h.name || "Workout"} on ${new Date(h.startTime).toLocaleDateString()} -> Tonnage: ${totalVol}kg`;
              }).join("\n");
              
              onAskGemini(`Evaluate my historical logs and muscular split profiles:
${summaries}

My favorite target muscle group is currently designated as: ${clinicalMetrics.favouriteMuscle}.
Advise me on:
1. Dynamic volume allocation strategies in simple words.
2. Safe progressive overload to slowly trigger muscular gains.
3. Proper simple biomechanics to stay injury-free.`);
              
              const openDrawerEvent = new CustomEvent("open-gemini-drawer");
              window.dispatchEvent(openDrawerEvent);
            }}
            className="group flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg active:scale-95 transition-all text-center leading-none ring-1 ring-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>Consult Gemini Medical Trainer</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* GOOGLE HEALTH BENTO STATS BLOCK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 border-t border-gray-200 dark:border-white/5 pt-5 text-gray-800 dark:text-slate-200">
          
          {/* TONNAGE METRIC (Google Health style with mini progress circle) */}
          <div className="p-4.5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-sm shadow-inner rounded-2xl border border-gray-200 dark:border-white/5 flex items-center justify-between shadow-inner">
            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 dark:text-slate-400 font-extrabold uppercase tracking-widest block">Weekly Lift Volume</span>
              <div>
                <span className="text-2xl font-black font-mono text-gray-900 dark:text-gray-100">{clinicalMetrics.currWeekTonnage.toLocaleString()}</span>
                <span className="text-xs text-gray-500 dark:text-slate-400 font-extrabold font-mono ml-1">KG</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {clinicalMetrics.wowChangePct >= 0 ? (
                  <span className="text-[10px] text-emerald-400 font-black font-mono flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +{clinicalMetrics.wowChangePct}% WoW
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-450 text-rose-400 font-black font-mono flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" />
                    {clinicalMetrics.wowChangePct}% WoW
                  </span>
                )}
              </div>
            </div>
            {/* SVG circle gauge */}
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="none" />
                <circle 
                  cx="24" cy="24" r="18" 
                  stroke="#a78bfa" strokeWidth="4" fill="none" 
                  strokeDasharray="113" 
                  strokeDashoffset={Math.max(0, 113 - (113 * Math.min(100, (clinicalMetrics.currWeekTonnage / (clinicalMetrics.prevWeekTonnage || 3000)) * 100)) / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-extrabold text-violet-300 select-none pointer-events-none text-center">
                <span className="leading-none block">{Math.round(Math.min(100, (clinicalMetrics.currWeekTonnage / (clinicalMetrics.prevWeekTonnage || 3000)) * 100))}%</span>
              </div>
            </div>
          </div>

          {/* ACTIVE STREAK (Google Health style with glowing orange gauge) */}
          <div className="p-4.5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-sm shadow-inner rounded-2xl border border-gray-200 dark:border-white/5 flex items-center justify-between shadow-inner">
            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 dark:text-slate-400 font-extrabold uppercase tracking-widest block">Consistency Streak</span>
              <div className="flex items-center space-x-1.5">
                <Flame className="w-5 h-5 text-orange-400 fill-orange-400 animate-pulse" />
                <span className="text-2xl font-black font-mono text-orange-400">{clinicalMetrics.streakWeeks}</span>
                <span className="text-xs text-slate-550 text-slate-500 font-extrabold font-mono uppercase">weeks</span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium block">Working drills active</span>
            </div>
            {/* SVG circle gauge */}
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="none" />
                <circle 
                  cx="24" cy="24" r="18" 
                  stroke="#fb923c" strokeWidth="4" fill="none" 
                  strokeDasharray="113" 
                  strokeDashoffset={Math.max(0, 113 - (113 * Math.min(6, clinicalMetrics.streakWeeks)) / 6)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-extrabold text-orange-400 select-none pointer-events-none text-center">
                <span className="leading-none block">{clinicalMetrics.streakWeeks}/6</span>
              </div>
            </div>
          </div>

          {/* FREQUENCY INDICES */}
          <div className="p-4.5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-sm shadow-inner rounded-2xl border border-gray-200 dark:border-white/5 flex items-center justify-between shadow-inner">
            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 dark:text-slate-400 font-extrabold uppercase tracking-widest block">Workouts Per Week</span>
              <div>
                <span className="text-2xl font-black font-mono text-indigo-400">{clinicalMetrics.weeklyAverage}</span>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 font-extrabold font-mono ml-1">SESSIONS</span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium block">Your average weekly frequency</span>
            </div>
            {/* SVG circle gauge */}
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="none" />
                <circle 
                  cx="24" cy="24" r="18" 
                  stroke="#38bdf8" strokeWidth="4" fill="none" 
                  strokeDasharray="113" 
                  strokeDashoffset={Math.max(0, 113 - (113 * Math.min(5, clinicalMetrics.weeklyAverage)) / 5)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-extrabold text-sky-400 select-none pointer-events-none text-center">
                <span className="leading-none block">{Math.round(Math.min(100, (clinicalMetrics.weeklyAverage / 5) * 100))}%</span>
              </div>
            </div>
          </div>

          {/* MUSCULAR SPLIT FOCUS */}
          <div className="p-4.5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-sm shadow-inner rounded-2xl border border-gray-200 dark:border-white/5 flex items-center justify-between shadow-inner">
            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 dark:text-slate-400 font-extrabold uppercase tracking-widest block">Focus Muscle</span>
              <span className={`inline-flex items-center text-xs font-black border px-2 py-0.5 mt-1 rounded-md ${getMuscleBg(clinicalMetrics.favouriteMuscle)}`}>
                <Dumbbell className="w-3.5 h-3.5 mr-1" />
                {clinicalMetrics.favouriteMuscle}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium block">Most exercised target zone</span>
            </div>
            {/* Active targeted muscle graphic look */}
            <div className="w-11 h-11 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 text-indigo-400 shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.15)] animate-pulse">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
          </div>

        </div>
      </div>

      {/* PERFORMANCE DIAGNOSTICS DASHBOARD (Simplified) */}
      <div className="bg-white dark:bg-black dark:border-white/10 shadow-lg shadow-inner border border-gray-200 dark:border-white/5 rounded-3xl p-5 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5 gap-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-gray-900 dark:text-slate-100 text-sm flex items-center space-x-2">
              <Activity className="text-emerald-500 w-4 h-4" />
              <span>Trainer Diagnostic Feedback</span>
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">
              Personalized tips about your training consistency, fatigue, and muscle splits.
            </p>
          </div>
          <button
            onClick={fetchDiagnosticInsights}
            disabled={diagnosticLoading}
            className="flex items-center space-x-1 px-3 py-1.5 text-[10px] uppercase font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 rounded-lg transition-all self-start cursor-pointer select-none"
          >
            <Zap className={`w-3 h-3 ${diagnosticLoading ? "animate-spin" : ""}`} />
            <span>{diagnosticLoading ? "Running Diagnostics..." : "Refresh Engine"}</span>
          </button>
        </div>

        {diagnosticLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 animate-pulse space-y-2.5">
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-full w-1/3" />
                <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full w-3/4" />
                <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full w-2/3" />
              </div>
            ))}
          </div>
        ) : diagnosticError ? (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] rounded-xl font-bold">
            {diagnosticError}. Please check Settings & Secrets to confirm your Gemini API key is configured.
          </div>
        ) : diagnosticInsights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {diagnosticInsights.map((insight, idx) => {
              const isAlert = insight.category === "ALERT_STATUS" || insight.category === "CONCURRENT_INTERFERENCE_WARNING";
              const isGreen = insight.category === "GREEN_STATUS";
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl flex flex-col justify-start space-y-2.5 transition-all shadow-inner outline outline-1 ${
                    isAlert
                      ? "bg-rose-50 dark:bg-rose-500/5 text-rose-900 dark:text-rose-100 outline-rose-500/20"
                      : isGreen
                      ? "bg-emerald-50 dark:bg-emerald-500/5 text-emerald-900 dark:text-emerald-100 outline-emerald-500/20"
                      : "bg-amber-50 dark:bg-amber-500/5 text-amber-900 dark:text-amber-100 outline-amber-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      {isAlert ? <ShieldAlert className="w-4 h-4 text-rose-500" /> : isGreen ? <Award className="w-4 h-4 text-emerald-500" /> : <Scale className="w-4 h-4 text-amber-500" />}
                      <span className="font-extrabold text-[9px] uppercase tracking-widest opacity-80">
                        {getCategoryDisplayName(insight.category)}
                      </span>
                    </div>
                    {insight.score_impact !== undefined && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                        {Number(insight.score_impact) > 0 ? `+${insight.score_impact}` : insight.score_impact} Priority
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-700 dark:text-slate-300 opacity-90 leading-relaxed font-semibold">
                    {insight.coaching_copy}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center bg-gray-50 dark:bg-white/5 rounded-xl text-[10px] text-gray-500 dark:text-slate-400 font-bold border border-gray-200 dark:border-white/5">
            No recommendations generated yet. Click 'Refresh Engine' to let your AI Trainer analyze your workouts.
          </div>
        )}
      </div>

      {/* 2. GOOGLE HEALTH 30-DAY ACTIVE GRID (Heat points) */}
      <div className="bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner shadow-md dark:shadow-none backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-white/5 pb-3.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 px-1.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-black">Calendar Ledger</span>
            <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm md:text-base">Last 30-Day Activity Ledger</h4>
          </div>
          <span className="text-[10px] text-gray-500 dark:text-slate-400 font-mono font-bold uppercase">Rest loops vs Motor loops</span>
        </div>

        {/* GRID LAYOUT */}
        <div className="flex flex-col space-y-4 pt-4">
          <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-30 gap-2.5">
            {calendarActivityGrid.map((day, idx) => (
              <div 
                key={idx}
                className="group relative flex flex-col items-center"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-[11px] font-bold transition-all relative ${
                  day.active 
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)] scale-102"
                    : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-400 dark:text-slate-500"
                }`}>
                  {day.date.getDate()}

                  {/* Active tiny light indicator */}
                  {day.active && (
                    <span className="absolute bottom-1 w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                  )}
                </div>

                {/* Google Health tooltip popover on hover */}
                <div className="hidden group-hover:block absolute bottom-10 z-50 bg-white dark:bg-slate-950/95 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-slate-100 rounded-xl p-3 w-40 text-left text-[10px] font-sans font-medium pointer-events-none shadow-2xl leading-relaxed">
                  <div className="font-black text-gray-900 dark:text-gray-100">{day.label}</div>
                  <div className="text-indigo-400 font-mono font-extrabold mt-1 uppercase">{day.sessionName}</div>
                  {day.active && (
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-slate-400 mt-1 dark:text-gray-600 dark:text-slate-300">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span>{day.minutes} mins tracked</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end space-x-4 text-[10px] font-mono text-gray-500 dark:text-slate-400 font-bold self-end border-t border-gray-200 dark:border-white/5 pt-3 w-full">
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 inline-block" /> <span>Rest Day</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500/15 border border-emerald-500/30 inline-block" /> <span>Workout Tracked</span></span>
          </div>
        </div>
      </div>

      {/* 3. CHARTS & MUSCLE SPLIT BALANCING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PROGRESS CHARTS MAP - (8/12 Col) */}
        <div className="lg:col-span-8 bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner shadow-md dark:shadow-none backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-white/5 pb-3.5 mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/10">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-slate-100 text-sm md:text-base tracking-tight">Strength Benchmarks</h4>
                  <p className="text-[10px] text-indigo-400 font-bold font-mono tracking-wider uppercase leading-none">Estimate 1-Rep Max (1RM) trendline</p>
                </div>
              </div>

              {/* TOGGLERS */}
              <div className="flex items-center bg-white dark:bg-black dark:border-white/10 shadow-sm p-1 rounded-xl border border-gray-200 dark:border-white/5">
                <button
                  onClick={() => setActiveMetricTab("strength")}
                  className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
                    activeMetricTab === "strength" ? "bg-indigo-600 text-gray-900 dark:text-gray-100 shadow-sm" : "text-gray-500 dark:text-slate-400 font-semibold"
                  }`}
                >
                  Strength (1RM)
                </button>
                <button
                  onClick={() => setActiveMetricTab("volume")}
                  className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
                    activeMetricTab === "volume" ? "bg-indigo-600 text-gray-900 dark:text-gray-100 shadow-sm" : "text-gray-500 dark:text-slate-400 font-semibold"
                  }`}
                >
                  Set Volume
                </button>
              </div>
            </div>

            {/* STRENGTH SELECTOR PICKER */}
            <div className="flex items-center space-x-2 mb-4 justify-end">
              <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400 font-bold uppercase block text-right">Lifting Target:</span>
              <select
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="text-xs font-semibold px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 min-w-44 cursor-pointer"
              >
                {exercisesWithLogs.length === 0 ? (
                  <option value="" className="bg-white dark:bg-slate-950 text-gray-500 dark:text-slate-400">No workout logs found</option>
                ) : (
                  exercisesWithLogs.map((ex) => (
                    <option key={ex.id} value={ex.id} className="bg-white dark:bg-slate-950 text-slate-600 text-gray-800 dark:text-slate-200">
                      {ex.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* VECTOR TREND CHART PLOTTING */}
          <div className="relative min-h-48 flex items-center justify-center">
            {progressionData.length === 0 ? (
              <div className="text-center p-8 text-gray-500 dark:text-slate-400 text-xs flex flex-col items-center">
                <Award className="w-10 h-10 text-slate-500 mb-2 animate-bounce" />
                <p className="font-extrabold text-gray-800 dark:text-slate-200 mb-0.5">Strength Chart Offline</p>
                <p className="text-[10px] text-slate-500 max-w-xs font-bold leading-normal">
                  No working sets completed with weights for this exercise. Complete sets with numeric weight kilograms &gt; 0 to display progressive curve trendlines.
                </p>
              </div>
            ) : progressionData.length === 1 ? (
              <div className="w-full flex flex-col items-center py-6 bg-white/2 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                <p className="text-xs font-bold text-gray-800 dark:text-slate-200 mb-2 font-sans flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>Benchmark Milestone Saved!</span>
                </p>
                <div className="text-center space-y-1.5 mt-1 font-mono leading-none">
                  <div className="text-[10px] font-semibold text-slate-500">First Capture: {progressionData[0].date}</div>
                  <div className="text-2xl font-black text-indigo-400">
                    {activeMetricTab === "strength" 
                      ? `${progressionData[0].weight} kg × ${progressionData[0].reps} rep(s)`
                      : `${progressionData[0].volume} kg total volume`}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase">
                    {activeMetricTab === "strength" ? "Estimated 1RM:" : "Recorded Set Volume:"} 
                    <span className="text-emerald-400 ml-1">
                      {activeMetricTab === "strength" ? `${progressionData[0].estMax} kg` : `${progressionData[0].volume} v`}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-450 font-semibold max-w-xs text-center mt-3 leading-relaxed">
                  Excellent first record. Complete another workout using this exercise to trace linear strength overloading.
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-center">
                <svg key={`${activeMetricTab}-${selectedExerciseId}`} viewBox="0 0 500 180" className="w-full h-auto overflow-visible select-none animate-in fade-in duration-500">
                  <defs>
                    <linearGradient id="g-strength-health" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={activeMetricTab === "strength" ? "#6366f1" : "#10b981"} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={activeMetricTab === "strength" ? "#6366f1" : "#10b981"} stopOpacity="0.00" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Layout Lines */}
                  <line x1="35" y1="35" x2="465" y2="35" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="35" y1="90" x2="465" y2="90" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="35" y1="145" x2="465" y2="145" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                  {/* Bezier Area Under curves */}
                  <path d={chartMath.fillPath} fill="url(#g-strength-health)" />

                  {/* High Quality Proportional Stroke */}
                  <path d={chartMath.linePath} fill="none" stroke={activeMetricTab === "strength" ? "#818cf8" : "#34d399"} strokeWidth="3.2" strokeLinecap="round" />

                  {/* Nodes, hover data popups */}
                  {chartMath.points.map((pt, i) => (
                    <g key={i} className="group cursor-pointer">
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r="18" 
                        className={`fill-[#1a1a2b] stroke-[2.8] ${activeMetricTab === "strength" ? "stroke-[#818cf8]" : "stroke-[#34d399]"}`} 
                      />
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r="24" 
                        className={`opacity-0 hover:opacity-15 transition-opacity ${activeMetricTab === "strength" ? "fill-indigo-500" : "fill-emerald-500"}`} 
                      />
                      {/* Peak micro values labels */}
                      <text 
                        x={pt.x} 
                        y={pt.y + 1} 
                        className={`font-mono text-[10px] font-black pointer-events-none ${activeMetricTab === "strength" ? "fill-indigo-200" : "fill-emerald-200"}`} 
                        textAnchor="middle"
                        dominantBaseline="middle"
                        alignmentBaseline="middle"
                      >
                        {pt.val}{activeMetricTab === "strength" ? "" : "v"}
                      </text>
                      <text 
                        x={pt.x} 
                        y="162" 
                        className="fill-slate-500 font-mono text-[9px] font-bold" 
                        textAnchor="middle"
                      >
                        {pt.data.date}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* MUSCULAR SPLIT SYMMETRY RANGES - (4/12 Col) */}
        <div className="lg:col-span-4 bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner shadow-md dark:shadow-none backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-white/5 pb-3.5 mb-4">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10 animate-pulse">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-101 text-gray-900 dark:text-gray-100 text-sm tracking-tight border-emerald-500/10">Muscle Split Ratios</h4>
                <p className="text-[10px] text-emerald-400 font-bold font-mono tracking-wider uppercase leading-none">Hypertrophy balancing chart</p>
              </div>
            </div>

            {/* BALANCE STATS SPLIT BARK CHARTS */}
            <div className="space-y-4">
              {["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"].map((cat) => {
                const count = clinicalMetrics.muscleDistribution[cat] || 0;
                const totalWorkingSets = clinicalMetrics.totalCompletedSets || 1;
                const percentage = Math.round((count / totalWorkingSets) * 100);

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800 dark:text-slate-200">{cat}</span>
                      <span className="font-mono text-slate-450 font-bold">{count} sets ({percentage}%)</span>
                    </div>
                    
                    {/* Visual meter track bar */}
                    <div className="w-full h-2 bg-white dark:bg-black dark:border-white/10 shadow-sm rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className={`h-full rounded-full ${
                          cat === "Chest" ? "bg-indigo-500" :
                          cat === "Back" ? "bg-emerald-500" :
                          cat === "Legs" ? "bg-amber-500" :
                          cat === "Shoulders" ? "bg-pink-500" :
                          cat === "Arms" ? "bg-purple-500" : "bg-slate-500"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-gray-500 dark:text-slate-400 leading-normal pt-4 mt-4 border-t border-gray-200 dark:border-white/5 font-semibold flex items-start space-x-2">
            <Clock className="w-4 h-4 text-emerald-400 block shrink-0 mt-0.5 animate-pulse" />
            <span>SW3AT calculates your hypertrophy anchoring targets dynamically based on daily repetitions volume logs.</span>
          </div>
        </div>

      </div>

      {/* 4. COOPERATIVE CLINICAL ADVISORIES/ALERTS (Bento-styled) */}
      <div className="bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner shadow-md dark:shadow-none backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl p-5 shadow-2xl space-y-4">
        <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm flex items-center space-x-2">
          <Zap className="text-yellow-400 w-4 h-4 animate-bounce" />
          <span>Clinical Athletic Insights & Overload Diagnostics</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clinicalMetrics.coachingInsights.map((insight, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-2xl flex items-start space-x-3.5 border transition-all ${
                insight.type === "alert" 
                  ? "bg-rose-500/5 border-rose-500/10 text-rose-300"
                  : insight.type === "success"
                  ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-300"
                  : "bg-indigo-500/5 border-indigo-500/10 text-indigo-600 dark:text-indigo-300"
              }`}
            >
              {insight.type === "alert" ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              ) : insight.type === "success" ? (
                <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Activity className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              )}
              
              <div className="space-y-1 leading-normal">
                <span className="font-black text-gray-900 dark:text-slate-100 text-xs block">{insight.title}</span>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed font-semibold transition-colors">
                  {insight.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
