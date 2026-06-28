// Author: Google AI Studio Coding Agent
// OS support: All (Web, Android, iOS)
// Description: User-saved and pre-defined routines templates list with interactive AI composer integration.

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Play, Trash2, Dumbbell, Calendar, Info, Clock, Check, X, Sparkles } from "lucide-react";
import { WorkoutSession, Exercise, UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import AIGeneratorLab from "./AIGeneratorLab";
import { openExerciseGuide } from "./ExerciseGuideModal";

interface TemplatesListProps {
  templates: WorkoutSession[];
  exercisesList: Exercise[];
  historyList: WorkoutSession[];
  userProfile?: UserProfile | null;
  onStartBlank: () => void;
  onStartFromTemplate: (templateId: string) => void;
  onCreateTemplate: (name: string, exercises: { exerciseId: string; sets: { weight: number; reps: number; type: any }[] }[], notes?: string) => Promise<any>;
  onDeleteTemplate: (templateId: string) => void;
}

// Built-in starter routines for a pristine user experience
const STARTER_TEMPLATES = [
  {
    id: "starter-push",
    name: "Classic Push Day",
    notes: "Focus on chest, shoulders, and triceps hypertrophy",
    exercises: [
      { exerciseId: "bench-press-barbell", sets: [{ weight: 60, reps: 10, type: "normal" }, { weight: 70, reps: 8, type: "normal" }, { weight: 80, reps: 6, type: "normal" }] },
      { exerciseId: "shoulder-press-dumbbell", sets: [{ weight: 15, reps: 12, type: "normal" }, { weight: 15, reps: 10, type: "normal" }] },
      { exerciseId: "tricep-pushdown-cable", sets: [{ weight: 20, reps: 12, type: "normal" }, { weight: 25, reps: 10, type: "normal" }] }
    ]
  },
  {
    id: "starter-pull",
    name: "Classic Pull Day",
    notes: "Focus on lat width, mid back thickness, and biceps curls",
    exercises: [
      { exerciseId: "deadlift-barbell", sets: [{ weight: 100, reps: 5, type: "normal" }, { weight: 110, reps: 5, type: "normal" }] },
      { exerciseId: "pull-up", sets: [{ weight: 0, reps: 8, type: "normal" }, { weight: 0, reps: 6, type: "normal" }] },
      { exerciseId: "bicep-curl-dumbbell", sets: [{ weight: 12, reps: 12, type: "normal" }, { weight: 12, reps: 12, type: "normal" }] }
    ]
  },
  {
    id: "starter-legs",
    name: "Classic Leg Day",
    notes: "Deep barbell squats followed by posterior chain leg curls",
    exercises: [
      { exerciseId: "squat-barbell", sets: [{ weight: 80, reps: 8, type: "normal" }, { weight: 90, reps: 6, type: "normal" }, { weight: 100, reps: 5, type: "normal" }] },
      { exerciseId: "leg-press", sets: [{ weight: 150, reps: 12, type: "normal" }, { weight: 180, reps: 10, type: "normal" }] },
      { exerciseId: "leg-curl", sets: [{ weight: 40, reps: 12, type: "normal" }, { weight: 45, reps: 10, type: "normal" }] }
    ]
  }
];

export default function TemplatesList({
  templates,
  exercisesList,
  historyList,
  userProfile,
  onStartBlank,
  onStartFromTemplate,
  onCreateTemplate,
  onDeleteTemplate,
}: TemplatesListProps) {
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState("");

  React.useEffect(() => {
    if (showAddTemplate) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddTemplate]);

  const allAvailableTemplates = [...templates];

  // Helper to extract exercise names safely
  const getExerciseName = (id: string) => {
    return exercisesList.find((ex) => ex.id === id)?.name || "Bench Press";
  };

  const handleCreateTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || selectedExercises.length === 0) return;

    // Build standard structure: 3 sets of 0 weight / reps representation
    const exercisesPayload = selectedExercises.map((exId) => ({
      exerciseId: exId,
      sets: [
        { weight: 0, reps: 10, type: "normal" },
        { weight: 0, reps: 10, type: "normal" },
        { weight: 0, reps: 10, type: "normal" }
      ]
    }));

    await onCreateTemplate(templateName, exercisesPayload);
    setTemplateName("");
    setSelectedExercises([]);
    setShowAddTemplate(false);
  };

  const handleToggleExerciseSelect = (id: string) => {
    if (selectedExercises.includes(id)) {
      setSelectedExercises((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedExercises((prev) => [...prev, id]);
    }
  };

  const filteredExercises = exercisesList
    .filter((ex) =>
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6 pb-40">
      {/* Launcher cards */}
      <div className="m3-card">
        <div className="m3-shape md" style={{ marginBottom: "8px" }}>
          <svg className="sf" viewBox="0 0 100 100"><use href="#shape-sunny" fill="var(--m3-primary-cont)" /></svg>
          <span className="si"><Play className="w-5 h-5" style={{ color: "var(--m3-primary)" }} /></span>
        </div>
        <h2 className="m3-h">Quick logging panel</h2>
        <p className="m3-body">Skip planning and start a blank active workout instantly. Record whatever you perform, on the fly.</p>
        <div style={{ height: "16px" }} />
        <button onClick={onStartBlank} className="m3-btn fill"><Play className="w-5 h-5" /> Start empty workout</button>
      </div>

      <div className="m3-card">
        <div className="m3-shape md" style={{ marginBottom: "8px" }}>
          <svg className="sf" viewBox="0 0 100 100"><use href="#shape-sunny" fill="var(--m3-sc-highest)" /></svg>
          <span className="si"><Plus className="w-5 h-5" style={{ color: "var(--m3-on-var)" }} /></span>
        </div>
        <h2 className="m3-h">Custom routine architect</h2>
        <p className="m3-body">Combine barbell, dumbbell or bodyweight exercises to pre-arrange sets and volume targets.</p>
        <div style={{ height: "16px" }} />
        <button onClick={() => { setShowAddTemplate(true); setShowAIGenerator(false); }} className="m3-btn outline"><Plus className="w-5 h-5" /> Create new template</button>
      </div>

      <div className="m3-card" style={{ background: "var(--m3-tertiary-cont)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div className="m3-shape" style={{ width: "48px", height: "48px" }}>
            <svg className="sf" viewBox="0 0 100 100"><use href="#shape-wavy" fill="rgba(255,255,255,.18)" /></svg>
            <span className="si"><Sparkles className="w-5 h-5" style={{ color: "#fff" }} /></span>
          </div>
          <span className="m3-eyebrow" style={{ background: "rgba(0,0,0,.25)", color: "#fff" }}>Lab</span>
        </div>
        <h2 className="m3-h" style={{ color: "#fff" }}>Gemini AI composer</h2>
        <p className="m3-body" style={{ color: "var(--m3-on-tertiary-cont)" }}>Let Gemini S&C intelligence generate custom warm-ups, accessory work and progression targets.</p>
        <div style={{ height: "16px" }} />
        <button onClick={() => { setShowAIGenerator(!showAIGenerator); setShowAddTemplate(false); }} className="m3-btn" style={{ background: "linear-gradient(95deg, var(--m3-primary-fill), #d566c8 90%)", color: "#fff" }}>
          <Sparkles className="w-5 h-5" /> {showAIGenerator ? "Hide AI composer" : "Launch AI composer"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showAIGenerator && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            <AIGeneratorLab
              exercisesList={exercisesList}
              historyList={historyList}
              userProfile={userProfile}
              onCreateTemplate={onCreateTemplate}
              onStartBlank={onStartBlank}
              onStartFromTemplate={onStartFromTemplate}
              onSuccessClose={() => setShowAIGenerator(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Routine Templates Segment */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-indigo-400/80 uppercase tracking-widest font-mono">Workout Routines</h3>
        
        {/* User saved routines */}
        {allAvailableTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allAvailableTemplates.map((tp) => (
              <div
                key={tp.id}
                className="bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-base md:text-lg leading-tight">
                      {tp.name}
                    </h4>
                    <button
                      onClick={() => onDeleteTemplate(tp.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-gray-50 dark:bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm rounded-lg transition-colors"
                      title="Delete saved template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {tp.notes && <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">{tp.notes}</p>}
                  
                  {/* Exercises Checklist summary */}
                  <div className="flex flex-wrap gap-1.5">
                    {tp.exercises.slice(0, 3).map((ex, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-xs bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm text-slate-350 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/5 font-normal"
                      >
                        {ex.sets.length}x {getExerciseName(ex.exerciseId)}
                      </span>
                    ))}
                    {tp.exercises.length > 3 && (
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-300/60 font-semibold bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm px-2 rounded-lg border border-gray-200 dark:border-white/5 leading-6">
                        +{tp.exercises.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onStartFromTemplate(tp.id)}
                  className="w-full py-2.5 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-550 hover:to-purple-550 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center space-x-1 ring-1 ring-white/10"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Launch Template</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Starter library routines */}
        <div>
          <p className="text-xs font-bold text-indigo-400/80 uppercase tracking-widest font-mono mb-3">Starter Templates</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STARTER_TEMPLATES.map((tp) => (
              <div
                key={tp.id}
                className="bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 rounded-2xl p-4 shadow-2xl flex flex-col justify-between space-y-3.5"
              >
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-slate-100 text-sm md:text-base leading-none mb-1">
                    {tp.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-normal leading-relaxed mb-3">
                    {tp.notes}
                  </p>
                  
                  <div className="space-y-1">
                    {tp.exercises.map((ex, idx) => (
                      <p key={idx} className="text-xs text-indigo-600 dark:text-indigo-300/80 font-normal list-item list-inside font-mono">
                        {ex.sets.length} sets • {getExerciseName(ex.exerciseId)}
                      </p>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Create and start!
                    onCreateTemplate(tp.name, tp.exercises, tp.notes).then((res) => {
                      if (res) onStartFromTemplate(res.id);
                    });
                  }}
                  className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1"
                >
                  <Play className="w-3 h-3 fill-indigo-400 text-indigo-400" />
                  <span>Start Routine</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Creation popover popup drawer */}
      {showAddTemplate && createPortal(
        <div className="fixed inset-0 bg-black/85 z-[9999] overflow-y-auto backdrop-blur-md">
          <div className="min-h-full flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm rounded-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl flex flex-col max-h-[calc(100vh-32px)] md:max-h-[85vh] relative"
            >
              <div className="p-4 bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm md:text-base flex items-center space-x-2">
                  <Dumbbell className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <span>Build New Muscle Routine</span>
                </h3>
                <button
                  onClick={() => setShowAddTemplate(false)}
                  className="p-1 text-gray-400 hover:text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTemplateSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-300/80 uppercase tracking-widest font-mono mb-1.5">
                    Template / Routine Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heavy Legs A, Upper Hypertrophy"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full text-xs font-bold border border-gray-200 dark:border-white/10 rounded-xl p-3 bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-300/80 uppercase tracking-widest font-mono mb-1">
                    Select Routine Exercises
                  </label>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mb-2">Toggle exercises to append to this routine</p>
                  
                  <input
                    type="text"
                    placeholder="Search exercise library..."
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    className="w-full text-xs font-bold border border-gray-200 dark:border-white/10 bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm text-gray-900 dark:text-gray-100 rounded-xl px-3 py-2.5 mb-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400"
                  />

                  <div className="border border-gray-200 dark:border-white/5 rounded-xl p-2.5 bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm max-h-60 overflow-y-auto space-y-1">
                    {filteredExercises.map((ex) => {
                      const isSelected = selectedExercises.includes(ex.id);
                      return (
                        <div
                          key={ex.id}
                          onClick={() => handleToggleExerciseSelect(ex.id)}
                          className={`w-full text-left px-3 py-2.5 text-xs rounded-lg flex items-center justify-between border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-500/15 border-indigo-505/30 text-indigo-500 dark:text-indigo-200 font-bold"
                              : "bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm border-transparent hover:bg-white/10 text-slate-330"
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="font-bold text-gray-900 dark:text-gray-100 block truncate">{ex.name}</span>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-300/50 block font-normal mt-0.5">{ex.category} • {ex.equipment}</span>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openExerciseGuide(ex);
                              }}
                              className="p-1 text-indigo-400 hover:text-indigo-205 hover:bg-white/10 rounded-md transition-all cursor-pointer"
                              title="View setup & body form demonstration guide"
                            >
                              <Info className="w-4 h-4 shrink-0" />
                            </button>
                            {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTemplate(false)}
                    className="px-4 py-2 bg-[var(--m3-sc-low)] dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedExercises.length === 0 || !templateName.trim()}
                    className="px-4 py-2 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-555 hover:to-purple-555 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-lg disabled:opacity-30 transition-colors"
                  >
                    <span>Create Template</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// --- End of TemplatesList.tsx ---
