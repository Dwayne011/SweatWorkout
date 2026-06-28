/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Trash2, Dumbbell, Calendar, Clock, Trophy, ChevronDown, ChevronUp, Sparkles, MessageSquare, BarChart3, ListCollapse } from "lucide-react";
import { WorkoutSession, Exercise } from "../types";
import { motion, AnimatePresence } from "motion/react";
import WorkoutAnalytics from "./WorkoutAnalytics";
import { Button } from "./ui/Button";

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
        <Button variant="none" onClick={() => setViewMode("logs")} className={viewMode === "logs" ? "sel" : ""}>
          <ListCollapse className="w-4 h-4" /> Journals timeline
        </Button>
        <Button variant="none" onClick={() => setViewMode("analytics")} className={viewMode === "analytics" ? "sel" : ""}>
          <BarChart3 className="w-4 h-4" /> Insights &amp; trends
        </Button>
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
                    <div className="flex items-center justify-center bg-[var(--m3-sc-low)] rounded-lg border border-rose-500/20 px-2.5 py-1 shadow-sm">
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
                    className={`bg-[var(--m3-sc)] rounded-[26px] overflow-hidden relative z-10 w-full h-full ${
                      deletingLogId === log.id ? 'translate-x-[-100vw] opacity-0 transition-all duration-300' : ''
                    }`}
                  >
                  {/* Collapsed summary — v5 .jcard */}
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="pbw-jcard"
                    style={{ margin: 0, background: "transparent", borderRadius: 0, cursor: "pointer" }}
                  >
                    <div className="jtop">
                      <div className="jbadge"><Calendar /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="jname">{log.name}</div>
                        <div className="jmeta">
                          {formatDate(log.startTime)} <span>·</span> <Clock /> <span className="dur">{duration} mins</span>
                        </div>
                        <div className="jex">
                          <span className="lbl">Exercises</span>
                          <span className="nms">{(log.exercises || []).map(ex => getExerciseName(ex.exerciseId)).join(", ") || "No exercises logged"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="jfoot">
                      {deletingLogId === log.id ? (
                        <span className="text-[10px] text-rose-500 font-mono italic px-2">Deleting…</span>
                      ) : (
                        <Button variant="none" className="viewins" onClick={(e) => { e.stopPropagation(); onViewAnalysis(log); }}>
                          <Sparkles /> {log.analysis ? "View insights" : "Analyze workout"}
                        </Button>
                      )}
                      <span className="jhint">&larr; Swipe to delete</span>
                      <span className="jchev">{isExpanded ? <ChevronUp /> : <ChevronDown />}</span>
                    </div>
                  </div>

                  {/* Collapsible log breakdown details */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200 dark:border-white/5 bg-[var(--m3-sc-low)]"
                      >
                        <div className="p-4 md:p-5 space-y-4">
                          {/* Interactive summary panel */}
                          <div className="bg-[var(--m3-sc-low)] border border-gray-200 dark:border-white/10 rounded-xl p-3.5 flex flex-wrap gap-4 items-center justify-between">
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
                            <Button
                              variant="none"
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
                            </Button>
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
                                className="bg-[var(--m3-sc-low)] rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-2xs"
                              >
                                <div className="px-4 py-2.5 bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
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
