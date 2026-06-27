/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Trash2, Dumbbell, Calendar, Clock, Trophy, ChevronDown, ChevronUp, Sparkles, MessageSquare, BarChart3, ListCollapse } from "lucide-react";
import { WorkoutSession, Exercise } from "../types";
import { motion, AnimatePresence } from "motion/react";
import WorkoutAnalytics from "./WorkoutAnalytics";

interface HistoryLogsProps {
  history: WorkoutSession[];
  exercisesList: Exercise[];
  onDeleteLog: (logId: string) => void;
  onAskGemini: (prompt: string) => void;
  onViewAnalysis: (session: WorkoutSession) => void;
}

export default function HistoryLogs({ history, exercisesList, onDeleteLog, onAskGemini, onViewAnalysis }: HistoryLogsProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"logs" | "analytics">("logs");
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);

  const findBestMatchEx = (id: string) => {
    if (!id) return null;
    const cleanedInput = id.trim().toLowerCase();
    
    // 1. Direct match check
    const exact = exercisesList.find((ex) => {
      if (!ex) return false;
      const exId = typeof ex.id === "string" ? ex.id.toLowerCase() : "";
      const exName = typeof ex.name === "string" ? ex.name.toLowerCase() : "";
      return exId === id.toLowerCase() || exId === cleanedInput || exName === cleanedInput;
    });
    if (exact) return exact;

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
    const exactStemmed = exercisesList.find(e => {
      if (!e) return false;
      const eId = typeof e.id === "string" ? e.id : "";
      const eName = typeof e.name === "string" ? e.name : "";
      return stem(eId) === stemmedInput || stem(eName) === stemmedInput;
    });
    if (exactStemmed) return exactStemmed;

    // 3. Token-based overlap matching
    const inputTokens = cleanedInput
      .split(/[\s-_]+/)
      .map(t => stem(t))
      .filter(t => t.length > 1);

    let bestMatch: { exercise: typeof exercisesList[0]; score: number } | null = null;

    for (const ex of exercisesList) {
      if (!ex) continue;
      const eId = typeof ex.id === "string" ? ex.id : "";
      const eName = typeof ex.name === "string" ? ex.name : "";

      const idTokens = eId.split(/[\s-_]+/).map(t => stem(t)).filter(t => t.length > 1);
      const nameTokens = eName.split(/[\s-_]+/).map(t => stem(t)).filter(t => t.length > 1);
      
      let score = 0;
      for (const inputTok of inputTokens) {
        if (idTokens.includes(inputTok) || nameTokens.includes(inputTok)) {
          score += 2;
        } else if (idTokens.some(tok => tok.includes(inputTok) || inputTok.includes(tok)) || 
                   nameTokens.some(tok => tok.includes(inputTok) || inputTok.includes(tok))) {
          score += 1;
        }
      }
      
      if (score > 0) {
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { exercise: ex, score };
        }
      }
    }

    if (bestMatch && bestMatch.score >= 1) {
      return bestMatch.exercise;
    }

    const normInput = cleanedInput.replace(/[^a-z0-9]/g, "");
    const fuzzy = exercisesList.find(e => {
      if (!e) return false;
      const eId = typeof e.id === "string" ? e.id : "";
      const eName = typeof e.name === "string" ? e.name : "";
      const normId = eId.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normName = eName.toLowerCase().replace(/[^a-z0-9]/g, "");
      return normId.includes(normInput) || normInput.includes(normId) || normName.includes(normInput) || normInput.includes(normName);
    });
    if (fuzzy) return fuzzy;

    return null;
  };

  const getExerciseName = (id: string) => {
    if (!id) return "Gym Exercise";
    const match = findBestMatchEx(id);
    if (match) return match.name;

    // Direct string cleanup fallback
    return id
      .split(/[-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getExerciseCategory = (id: string) => {
    if (!id) return "Strength";
    const match = findBestMatchEx(id);
    if (match) return match.category;

    const cleanedId = id.toLowerCase();
    if (cleanedId.includes("curl") || cleanedId.includes("bicep") || cleanedId.includes("tricep") || cleanedId.includes("arm")) return "Arms";
    if (cleanedId.includes("press") || cleanedId.includes("chest") || cleanedId.includes("bench")) return "Chest";
    if (cleanedId.includes("squat") || cleanedId.includes("leg") || cleanedId.includes("quad") || cleanedId.includes("calf") || cleanedId.includes("lunge")) return "Legs";
    if (cleanedId.includes("pull") || cleanedId.includes("row") || cleanedId.includes("lats") || cleanedId.includes("back")) return "Back";
    if (cleanedId.includes("shoulder") || cleanedId.includes("press") || cleanedId.includes("delts")) return "Shoulders";
    if (cleanedId.includes("crunch") || cleanedId.includes("abs") || cleanedId.includes("core") || cleanedId.includes("plank")) return "Core";

    return "Strength";
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDurationMinutes = (start: string, end?: string) => {
    if (!end) return 45; // Default safe fallback
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.floor(diff / (1000 * 60));
  };

  // Heavy lifting workout summary analytics calculation
  const calculateWorkoutStats = (session: WorkoutSession) => {
    let totalVolume = 0;
    let completedSets = 0;
    let maxWeight = 0;

    session.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        const shouldCount = s.isCompleted;
        if (shouldCount) {
          totalVolume += s.weight * s.reps;
          completedSets += 1;
          if (s.weight > maxWeight) maxWeight = s.weight;
        }
      });
    });

    return { totalVolume, completedSets, maxWeight };
  };

  const toggleExpand = (logId: string) => {
    setExpandedLogId((prev) => (prev === logId ? null : logId));
  };

  return (
    <div className="space-y-4">
      {/* History header + segmented tabs */}
      <div><span className="m3-eyebrow primary">Workout history</span></div>
      <div className="m3-seg2">
        <button onClick={() => setViewMode("logs")} className={viewMode === "logs" ? "sel" : ""}>
          <ListCollapse className="w-4 h-4" /> Journals timeline
        </button>
        <button onClick={() => setViewMode("analytics")} className={viewMode === "analytics" ? "sel" : ""}>
          <BarChart3 className="w-4 h-4" /> Insights &amp; trends
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.12 }}
          className="space-y-4 pb-40"
        >
          {viewMode === "analytics" ? (
            <WorkoutAnalytics
              history={history}
              exercisesList={exercisesList}
              onAskGemini={onAskGemini}
            />
          ) : history.length === 0 ? (
            <div className="m3-empty" style={{ paddingTop: "34px", paddingBottom: "34px" }}>
              <div className="m3-shape lg center" style={{ marginBottom: "10px" }}>
                <svg className="sf" viewBox="0 0 100 100"><use href="#shape-clover" fill="var(--m3-primary-cont)" /></svg>
                <span className="si"><HistoryIcon size={34} style={{ color: "var(--m3-primary)" }} /></span>
              </div>
              <h2 className="m3-h center">No workout logs yet</h2>
              <p className="m3-body center">Finish a session, or tell Gemini "log a squat workout from yesterday" and it lands here.</p>
            </div>
          ) : (
            history.map((log) => {
              const { totalVolume, completedSets, maxWeight } = calculateWorkoutStats(log);
              const isExpanded = expandedLogId === log.id;
              const duration = calculateDurationMinutes(log.startTime, log.endTime);

              return (
                <div key={log.id} className="relative rounded-2xl overflow-hidden shrink-0">
                  {/* Clean text action underlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-rose-500/20 dark:to-rose-600/30 flex items-center justify-end px-6 rounded-2xl pointer-events-none">
                    <div className="flex items-center justify-center bg-white dark:bg-black rounded-lg border border-rose-500/20 px-2.5 py-1 shadow-sm">
                      <span className="text-rose-500 text-[10px] font-bold uppercase tracking-wider font-mono">Delete Log</span>
                    </div>
                  </div>
                  <motion.div
                    layout="position"
                    drag="x"
                    dragDirectionLock
                    dragConstraints={{ left: -140, right: 0 }}
                    dragElastic={{ left: 0.15, right: 0 }}
                    onDragStart={() => {
                      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5);
                    }}
                    onDragEnd={(e, info) => {
                      if (info.offset.x < -80) {
                        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
                        setDeletingLogId(log.id);
                        setTimeout(() => onDeleteLog(log.id), 300);
                      }
                    }}
                    className={`bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden relative z-10 w-full h-full ${
                      deletingLogId === log.id ? 'translate-x-[-100vw] opacity-0 transition-all duration-300' : ''
                    }`}
                  >
                  {/* Collapsed top bar summary card */}
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="p-4 md:p-5 flex flex-wrap items-center justify-between cursor-pointer gap-4 bg-transparent hover:bg-gray-50 dark:bg-black dark:border-white/10 shadow-sm select-none transition-all"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl ring-1 ring-indigo-500/20">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm md:text-base leading-snug">
                          {log.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-indigo-350/60 font-mono mt-0.5">
                          <span>{formatDate(log.startTime)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            {duration} mins
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-1.5 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-wider bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10 shrink-0">
                            Exercises
                          </span>
                          <span className="text-gray-600 dark:text-slate-300 text-[11px] font-medium whitespace-normal break-words max-w-full flex-1">
                            {(log.exercises || []).map(ex => getExerciseName(ex.exerciseId)).join(", ") || "No exercises logged"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Key volume stats summary badges */}
                    <div className="flex items-center space-x-4 md:space-x-6">
                      <div className="hidden sm:block text-right">
                        <span className="block text-[9px] font-bold text-indigo-600 dark:text-indigo-300/40 uppercase tracking-widest font-mono">Lifting Volume</span>
                        <span className="text-xs font-extrabold font-mono text-gray-900 dark:text-gray-100">{totalVolume} kg</span>
                      </div>
                      <div className="hidden sm:block text-right">
                        <span className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-300/40 uppercase tracking-widest font-mono">Completed Sets</span>
                        <span className="text-xs font-extrabold font-mono text-gray-900 dark:text-gray-100">{completedSets} sets</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {deletingLogId !== log.id && (
                          log.analysis ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewAnalysis(log);
                              }}
                              className="px-3 py-1.5 bg-white dark:bg-black hover:bg-indigo-950/80 border border-indigo-500/20 hover:border-indigo-400 text-indigo-600 dark:text-indigo-300 hover:text-gray-900 dark:text-gray-100 rounded-xl flex items-center space-x-1.5 text-[10px] font-extrabold uppercase tracking-wider font-mono transition-all cursor-pointer shrink-0 border border-gray-200 dark:border-white/5 hover:scale-[1.02]"
                              style={{ boxShadow: "0 0 12px rgba(99, 102, 241, 0.35), 0 0 8px rgba(168, 85, 247, 0.25)" }}
                              title="View completed coaching insights"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-yellow-350 fill-yellow-350 animate-pulse" />
                              <span>View Insights</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewAnalysis(log);
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-650 hover:from-indigo-500 hover:to-purple-550 text-white rounded-xl flex items-center space-x-1.5 text-[10px] font-extrabold uppercase tracking-wider font-mono transition-all cursor-pointer shrink-0 border border-gray-200 dark:border-white/10 hover:scale-[1.02]"
                              style={{ boxShadow: "0 0 18px rgba(99, 102, 241, 0.65), 0 0 12px rgba(168, 85, 247, 0.45)" }}
                              title="Run post-workout coaching metrics report"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-yellow-250 fill-yellow-250 shrink-0 animate-bounce" />
                              <span>Analyze Workout</span>
                            </button>
                          )
                        )}

                        {deletingLogId === log.id ? (
                          <span className="text-[10px] text-rose-500 font-mono italic px-2">Deleting...</span>
                        ) : (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono italic px-2 col-span-1">← Swipe to delete</span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-indigo-350/70" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-indigo-350/70" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible log breakdown details */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200 dark:border-white/5 bg-white dark:bg-black"
                      >
                        <div className="p-4 md:p-5 space-y-4">
                          {/* Interactive summary panel */}
                          <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl p-3.5 flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg ring-1 ring-yellow-500/20">
                                <Trophy className="w-4 h-4 text-yellow-405" />
                              </div>
                              <div>
                                <span className="block text-[9px] text-indigo-600 dark:text-indigo-300/60 font-semibold uppercase leading-none mb-1 tracking-wider font-mono">Max Weight Lifted</span>
                                <span className="text-xs font-extrabold font-mono text-gray-900 dark:text-gray-100">{maxWeight} kg</span>
                              </div>
                            </div>

                            {/* Ask Gemini shortcut button */}
                            <button
                              onClick={() => {
                                const queryPrompt = `Explain performance details for my workout log "${log.name}" checked on ${formatDate(log.startTime)}, featuring ${totalVolume}kg total weight. Suggest recommendations for improvement.`;
                                onAskGemini(queryPrompt);
                                
                                // Automatically open the Gemini Coach drawer
                                const openDrawerEvent = new CustomEvent("open-gemini-drawer");
                                window.dispatchEvent(openDrawerEvent);
                              }}
                              className="px-3.5 py-1.5 bg-indigo-505/10 hover:bg-indigo-505/20 text-indigo-305 text-xs font-bold rounded-lg flex items-center space-x-1.5 border border-indigo-500/20 transition-all shadow-md"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Analyse with Gemini Coach</span>
                            </button>
                          </div>

                          {/* Log notes if present */}
                          {log.notes && (
                            <div className="p-3 bg-indigo-500/5 border-l-4 border-indigo-500/35 rounded-r-lg max-w-full">
                              <span className="block text-[9px] text-indigo-600 dark:text-indigo-300/50 font-bold uppercase leading-none mb-1 tracking-wider font-mono font-bold">Session notes</span>
                              <p className="text-xs text-slate-305 italic font-normal">{log.notes}</p>
                            </div>
                          )}

                          {/* Exercises detailed table of sets completed */}
                          <div className="space-y-4">
                            {log.exercises.map((workoutEx) => (
                              <div
                                key={workoutEx.id}
                                className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-2xs"
                              >
                                <div className="px-4 py-2.5 bg-white dark:bg-black dark:border-white/10 shadow-sm border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                                  <div>
                                    <h5 className="font-extrabold text-[#818cf8] text-[#818cf8] text-xs md:text-sm">
                                      {getExerciseName(workoutEx.exerciseId)}
                                    </h5>
                                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-300/40">
                                      {getExerciseCategory(workoutEx.exerciseId)}
                                    </span>
                                  </div>
                                </div>
                                <div className="p-3 divide-y divide-[#171727]/30">
                                  {workoutEx.sets.map((set, setIdx) => (
                                    <div
                                      key={set.id}
                                      className="py-1.5 flex justify-between items-center text-xs font-mono"
                                    >
                                      <div className="flex items-center space-x-3.5 text-gray-500 dark:text-slate-400">
                                        <span>Set {setIdx + 1}</span>
                                        <span className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/15 font-sans font-extrabold uppercase tracking-widest">
                                          {set.type}
                                        </span>
                                      </div>
                                      <div className="flex space-x-4 text-gray-900 dark:text-gray-100 font-extrabold font-mono">
                                        <span>{set.weight} kg</span>
                                        <span className="text-gray-500 font-normal">×</span>
                                        <span>{set.reps} reps</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </motion.div>
                </div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Icon helper to avoid missing imports
function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}
