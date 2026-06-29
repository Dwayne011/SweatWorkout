/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Trash2, Dumbbell, Calendar, Clock, Trophy, ChevronDown, ChevronUp, ChevronRight, Sparkles, MessageSquare, BarChart3, ListCollapse } from "lucide-react";
import { WorkoutSession, Exercise } from "../types";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import InsightsTrends from "./InsightsTrends";
import { Button } from "./ui/Button";
import WorkoutOverviewPopout from "./WorkoutOverviewPopout";

interface HistoryLogsProps {
  history: WorkoutSession[];
  exercisesList: Exercise[];
  onDeleteLog: (logId: string) => void;
  onAskGemini: (prompt: string) => void;
  onViewAnalysis: (session: WorkoutSession) => void;
}

// The master i-spark — a filled big+small sparkle, lifted verbatim from the
// mockup. Not a single-point star.
const ISpark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5 13.7 8 19 9.5 13.7 11 12 16.5 10.3 11 5 9.5 10.3 8 12 2.5Zm6.5 9 .9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" /></svg>
);

export default function HistoryLogs({ history, exercisesList, onDeleteLog, onAskGemini, onViewAnalysis }: HistoryLogsProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [popoutLog, setPopoutLog] = useState<WorkoutSession | null>(null); // overview popout
  const [viewMode, setViewMode] = useState<"logs" | "analytics">("logs");
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  // Per-card AI footer state. The busy->ready transition is driven by the
  // workout's `analysis` field appearing once the per-workout coach returns.
  // TODO(data-model): wire to the real AI completion callback + request/response
  // shapes once the exercise/set data model is finalised (see history AI spec).
  const [analyzingLogId, setAnalyzingLogId] = useState<string | null>(null);

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
      day: "numeric"
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

  // seg2 tab switch — directional slide + fade. Journals (left) <-> Insights (right).
  const reduceMotion = useReducedMotion();
  const tabDir = useRef(0);
  const switchTab = (m: "logs" | "analytics") => {
    if (m === viewMode) return;
    tabDir.current = m === "analytics" ? 1 : -1;
    setViewMode(m);
  };
  const panelOffset = reduceMotion ? 0 : 40;
  const panelVariants = {
    enter: (d: number) => ({ opacity: 0, x: d >= 0 ? panelOffset : -panelOffset }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d >= 0 ? -panelOffset : panelOffset }),
  };

  return (
    <div className="space-y-4">
      {/* History header + segmented tabs */}
      <div><span className="m3-eyebrow primary">Workout history</span></div>
      <div className="m3-seg2">
        <Button variant="none" onClick={() => switchTab("logs")} className={viewMode === "logs" ? "sel" : ""}>
          <ListCollapse className="w-4 h-4" /> Journals timeline
        </Button>
        <Button variant="none" onClick={() => switchTab("analytics")} className={viewMode === "analytics" ? "sel" : ""}>
          <BarChart3 className="w-4 h-4" /> Insights &amp; trends
        </Button>
      </div>

      <AnimatePresence mode="wait" custom={tabDir.current}>
        <motion.div
          key={viewMode}
          custom={tabDir.current}
          variants={panelVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-3 pb-40"
        >
          {viewMode === "analytics" ? (
            <InsightsTrends
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
                <div key={log.id} className="pbw-jwrap shrink-0">
                  {/* Red delete pane — revealed on swipe (Gmail-style, matches workouts page) */}
                  <div className="jdel">
                    <span>Delete</span>
                    <Trash2 />
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
                    style={{ background: "var(--m3-sc)", position: "relative", zIndex: 1 }}
                    className={`rounded-[24px] overflow-hidden w-full h-full ${
                      deletingLogId === log.id ? 'translate-x-[-100vw] opacity-0 transition-all duration-300' : ''
                    }`}
                  >
                  {/* Collapsed summary — option-3 .jcard, whole card is the tap target */}
                  <div
                    onClick={() => setPopoutLog(log)}
                    className="pbw-jcard"
                    style={{ margin: 0, background: "transparent", borderRadius: 0, cursor: "pointer" }}
                  >
                    <div className="jtop">
                      <div className="jbadge"><Calendar /></div>
                      <div className="jtext">
                        <div className="jname">{log.name}</div>
                        <div className="jmeta">
                          {formatDate(log.startTime)} <span>·</span> <Clock /> <span className="dur">{duration} mins</span>
                        </div>
                        <div className="jex">
                          <span className="lbl">Exercises</span>
                          <span className="nms">{(log.exercises || []).map(ex => getExerciseName(ex.exerciseId)).join(", ") || "No exercises logged"}</span>
                        </div>
                      </div>
                      <span className="jchev"><ChevronRight /></span>
                    </div>
                    <div className="jfoot">
                      {log.analysis ? (
                        <Button variant="none" className="pbw-rbtn rready" onClick={(e) => { e.stopPropagation(); onViewAnalysis(log); }}>
                          <ISpark /> AI Coach analysis <ChevronRight />
                        </Button>
                      ) : analyzingLogId === log.id ? (
                        <Button variant="none" className="pbw-rbtn getins busy" disabled onClick={(e) => e.stopPropagation()}>
                          <span className="pbw-spin" /> Analysing workout…
                        </Button>
                      ) : (
                        <Button
                          variant="none"
                          className="pbw-rbtn getins"
                          onClick={(e) => { e.stopPropagation(); setAnalyzingLogId(log.id); onViewAnalysis(log); }}
                        >
                          <ISpark /> Get insights
                        </Button>
                      )}
                    </div>
                  </div>

                  </motion.div>
                </div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>

      {/* Portalled to body so the sheet escapes the History page's stacking
          context (its tab-slide transforms) and renders above the floating
          bottom nav. AnimatePresence lives INSIDE the portal — wrapping a
          portal in AnimatePresence is what breaks, not this. */}
      {createPortal(
        <AnimatePresence>
          {popoutLog && (
            <WorkoutOverviewPopout
              session={popoutLog}
              history={history}
              exercisesList={exercisesList}
              onClose={() => setPopoutLog(null)}
              onReadFull={() => { setPopoutLog(null); onViewAnalysis(popoutLog); }}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
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
