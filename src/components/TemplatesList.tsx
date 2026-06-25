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
      {/* Starting Block Launcher controls - Expanded to 3 Columns Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner shadow-md dark:shadow-none backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-455 flex items-center justify-center mb-3 ring-1 ring-indigo-500/20">
              <Play className="w-4 h-4 fill-indigo-400 text-indigo-400" />
            </div>
            <h3 className="font-extrabold text-base md:text-lg text-gray-900 dark:text-gray-100 mb-1">Quick Logging Panel</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 font-normal leading-relaxed">
              Skip planning and initialize an active blank workout instantly to record whatever exercises you perform on the fly.
            </p>
          </div>
          <button
            onClick={onStartBlank}
            className="w-full py-3 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-550 hover:to-purple-550 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center space-x-1 ring-1 ring-white/10"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Empty Workout</span>
          </button>
        </div>

        <div className="bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner shadow-md dark:shadow-none backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-black dark:border-white/10 shadow-sm text-slate-350 flex items-center justify-center mb-3 ring-1 ring-white/10">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base md:text-lg text-gray-900 dark:text-gray-100 mb-1">Custom Routine Architect</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 font-normal leading-relaxed">
              Combine multiple barbell, dumbbell, or bodyweight exercises to pre-arrange sets and volume targets for automated start.
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddTemplate(true);
              setShowAIGenerator(false);
            }}
            className="w-full py-3 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-white/10 border border-gray-200 dark:border-white/10 text-slate-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Template</span>
          </button>
        </div>

        <div className="bg-gradient-to-tr from-indigo-50 via-white to-purple-50 dark:from-indigo-950/20 dark:via-[#111119]/90 dark:to-purple-950/20 rounded-2xl border border-indigo-100 dark:border-[#818cf8]/15 p-5 shadow-xl dark:shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-2xl animate-pulse" />
          <div>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-yellow-300 flex items-center justify-center mb-3 ring-1 ring-indigo-500/20">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-yellow-300 fill-indigo-600 dark:fill-yellow-300 animate-pulse" />
            </div>
            <h3 className="font-extrabold text-base md:text-lg text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-1.5">
              <span>Gemini AI Composer</span>
              <span className="text-[9px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded px-1 py-0.5 leading-none uppercase font-bold tracking-wider font-mono">LAB</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-normal leading-relaxed">
              Let Gemini S&C intelligence generate custom warmups, set progressions, and volume targets aligned to your goals.
            </p>
          </div>
          <button
            onClick={() => {
              setShowAIGenerator(!showAIGenerator);
              setShowAddTemplate(false);
            }}
            className="w-full py-3 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center space-x-1 bg-gradient-to-tr from-indigo-650 via-violet-600 to-purple-600 hover:from-indigo-550 hover:to-purple-555 text-white shadow-lg ring-1 ring-white/10"
          >
            <Sparkles className="w-4 h-4 text-yellow-350 fill-yellow-350" />
            <span>{showAIGenerator ? "Hide AI Composer" : "Launch AI Composer"}</span>
          </button>
        </div>
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
                className="bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-base md:text-lg leading-tight">
                      {tp.name}
                    </h4>
                    <button
                      onClick={() => onDeleteTemplate(tp.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-gray-50 dark:bg-black dark:border-white/10 shadow-sm rounded-lg transition-colors"
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
                        className="inline-flex items-center text-xs bg-white dark:bg-black dark:border-white/10 shadow-sm text-slate-350 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/5 font-normal"
                      >
                        {ex.sets.length}x {getExerciseName(ex.exerciseId)}
                      </span>
                    ))}
                    {tp.exercises.length > 3 && (
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-300/60 font-semibold bg-white dark:bg-black dark:border-white/10 shadow-sm px-2 rounded-lg border border-gray-200 dark:border-white/5 leading-6">
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
                className="bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 rounded-2xl p-4 shadow-2xl flex flex-col justify-between space-y-3.5"
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
              className="bg-white dark:bg-black dark:border-white/10 shadow-sm rounded-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl flex flex-col max-h-[calc(100vh-32px)] md:max-h-[85vh] relative"
            >
              <div className="p-4 bg-white dark:bg-black dark:border-white/10 shadow-sm border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm md:text-base flex items-center space-x-2">
                  <Dumbbell className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <span>Build New Muscle Routine</span>
                </h3>
                <button
                  onClick={() => setShowAddTemplate(false)}
                  className="p-1 text-gray-400 hover:text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:bg-black dark:border-white/10 shadow-sm transition-colors"
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
                    className="w-full text-xs font-bold border border-gray-200 dark:border-white/10 rounded-xl p-3 bg-white dark:bg-black dark:border-white/10 shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 placeholder-gray-500"
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
                    className="w-full text-xs font-bold border border-gray-200 dark:border-white/10 bg-white dark:bg-black dark:border-white/10 shadow-sm text-gray-900 dark:text-gray-100 rounded-xl px-3 py-2.5 mb-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400"
                  />

                  <div className="border border-gray-200 dark:border-white/5 rounded-xl p-2.5 bg-white dark:bg-black dark:border-white/10 shadow-sm max-h-60 overflow-y-auto space-y-1">
                    {filteredExercises.map((ex) => {
                      const isSelected = selectedExercises.includes(ex.id);
                      return (
                        <div
                          key={ex.id}
                          onClick={() => handleToggleExerciseSelect(ex.id)}
                          className={`w-full text-left px-3 py-2.5 text-xs rounded-lg flex items-center justify-between border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-500/15 border-indigo-505/30 text-indigo-500 dark:text-indigo-200 font-bold"
                              : "bg-white dark:bg-black dark:border-white/10 shadow-sm border-transparent hover:bg-white/10 text-slate-330"
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
                    className="px-4 py-2 bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors"
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
