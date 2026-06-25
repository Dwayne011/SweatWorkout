// Author: Google AI Studio Coding Agent
// OS support: All (Web, Android, iOS)
// Description: Interactive Gemini S&C Routine Composer interface supporting RPE target selection, custom weights biases, and responsive styling.

import React, { useState } from "react";
import { useWorkoutState } from "../useWorkoutState";
import { robustFetch } from "../utils/network";
import { Exercise, WorkoutSession, UserProfile } from "../types";
import { 
  Sparkles, 
  Settings2, 
  Volume2, 
  Check, 
  Save, 
  Trash2, 
  Timer, 
  HelpCircle, 
  Play, 
  RefreshCw,
  TrendingUp,
  Dumbbell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import FlexingArm from "./FlexingArm";

interface AIGeneratorLabProps {
  exercisesList: Exercise[];
  historyList: WorkoutSession[];
  userProfile?: UserProfile | null;
  onCreateTemplate: (
    name: string, 
    exercises: { exerciseId: string; sets: { weight: number; reps: number; type: any }[] }[], 
    notes?: string
  ) => Promise<any>;
  onStartBlank: () => void;
  onStartFromTemplate: (tid: string) => void;
  onSuccessClose?: () => void;
}

export default function AIGeneratorLab({
  exercisesList,
  historyList,
  userProfile,
  onCreateTemplate,
  onStartBlank,
  onStartFromTemplate,
  onSuccessClose
}: AIGeneratorLabProps) {
  const [goal, setGoal] = useState<string>("Build Muscle");
  const [fitnessLevel, setFitnessLevel] = useState<string>("Intermediate");
  const [equipment, setEquipment] = useState<string>("Full Gym");
  const [includePastHistory, setIncludePastHistory] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string>("");
  const [rpeTarget, setRpeTarget] = useState<string>("8");
  const [weightModifier, setWeightModifier] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedWorkout, setGeneratedWorkout] = useState<{
    recommendedName: string;
    reasoning: string;
    exercises: {
      exerciseId: string;
      sets: { weight: number; reps: number; type: string }[];
      notes?: string;
    }[];
  } | null>(null);

  const getExerciseName = (id: string) => {
    return exercisesList.find((ex) => ex.id === id)?.name || id;
  };

  const getExerciseCategory = (id: string) => {
    return exercisesList.find((ex) => ex.id === id)?.category || "Legs";
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedWorkout(null);

    try {
      const response = await robustFetch("/api/ai/generate-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          fitnessLevel,
          equipment,
          includePastHistory,
          feedback,
          exercisesList,
          historyList,
          userProfile,
          rpeTarget,
          weightModifier,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process request. Make sure your Gemini API Key is active.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedWorkout(data);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during formulation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToTemplates = async () => {
    if (!generatedWorkout) return;
    try {
      const res = await onCreateTemplate(
        generatedWorkout.recommendedName,
        generatedWorkout.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets.map((s) => ({
            weight: s.weight,
            reps: s.reps,
            type: s.type as any,
          })),
        })),
        generatedWorkout.reasoning
      );
      
      alert(`"${generatedWorkout.recommendedName}" added successfully to your reusable Routines templates!`);
      if (onSuccessClose) onSuccessClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save template. Check database connection.");
    }
  };

  const handleStartWorkoutNow = async () => {
    if (!generatedWorkout) return;
    try {
      // Save to templates list first so they keep a reference database side
      const docRef = await onCreateTemplate(
        generatedWorkout.recommendedName,
        generatedWorkout.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets.map((s) => ({
            weight: s.weight,
            reps: s.reps,
            type: s.type as any,
          })),
        })),
        generatedWorkout.reasoning
      );

      const templateId = docRef?.id || docRef;
      if (templateId) {
        onStartFromTemplate(templateId);
      } else {
        // Fallback quick empty session just in case ID is missing on non-async offline states
        onStartBlank();
      }
    } catch (err) {
      console.error(err);
      onStartBlank();
    }
  };

  return (
    <div className="bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner dark:shadow-none/90 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-white/5 p-5 md:p-6 shadow-2xl space-y-5">
      {/* HEADER CONTROLS */}
      <div className="flex items-center space-x-2">
        <div className="p-2.5 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white rounded-2xl shadow-lg ring-1 ring-white/10">
          <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base md:text-lg">Gemini Workout Composer</h4>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-300/60 font-bold uppercase font-mono tracking-wider">Neural Assistant Coach Labs</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!generatedWorkout && !isLoading ? (
          // CONTROLS CONFIGURATION PANEL
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* GOAL + EXPERIENCE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-300/85 uppercase tracking-widest mb-1.5 font-mono">
                  Training Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-400"
                >
                  <option value="Build Muscle" className="bg-white dark:bg-black dark:border-white/10 shadow-sm">Build Muscle (Hypertrophy)</option>
                  <option value="Lose Weight" className="bg-white dark:bg-black dark:border-white/10 shadow-sm">Lose Weight & Lean Out</option>
                  <option value="Gain Strength" className="bg-white dark:bg-black dark:border-white/10 shadow-sm">Gain Absolute Strength (Powerlifting)</option>
                  <option value="Cardio & HIIT" className="bg-white dark:bg-black dark:border-white/10 shadow-sm">Cardio Conditioning / HIIT</option>
                  <option value="General Fitness" className="bg-white dark:bg-black dark:border-white/10 shadow-sm">General Tone & Conditioning</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-300/85 uppercase tracking-widest mb-1.5 font-mono">
                  Fitness Level
                </label>
                <select
                  value={fitnessLevel}
                  onChange={(e) => setFitnessLevel(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-400"
                >
                  <option value="Beginner" className="bg-white dark:bg-black dark:border-white/10 shadow-sm">Beginner (Safety First)</option>
                  <option value="Intermediate" className="bg-white dark:bg-black dark:border-white/10 shadow-sm">Intermediate (Consistent lifting)</option>
                  <option value="Advanced" className="bg-white dark:bg-black dark:border-white/10 shadow-sm">Advanced (High Intensity / Volume)</option>
                </select>
              </div>
            </div>

            {/* GEAR SELECTION */}
            <div>
              <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-300/85 uppercase tracking-widest mb-1.5 font-mono">
                Available Equipment
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: "Full Gym", label: "Full Gym" },
                  { name: "Dumbbells Only", label: "Dumbbell Only" },
                  { name: "Kettlebells Only", label: "Kettlebells" },
                  { name: "Bodyweight Only", label: "Bodyweight" },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setEquipment(item.name)}
                    className={`px-3 py-2.5 border rounded-xl text-xs font-bold transition-all ${
                      equipment === item.name
                        ? "bg-indigo-650/40 border-indigo-400 text-indigo-500 dark:text-indigo-200 ring-1 ring-indigo-500/25"
                        : "bg-white dark:bg-black dark:border-white/10 shadow-sm border-gray-200 dark:border-white/5 text-slate-350 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start space-x-2.5 p-3.5 bg-indigo-500/5 rounded-2xl border border-indigo-500/15 cursor-pointer hover:bg-indigo-500/10 transition-colors">
              <input
                type="checkbox"
                checked={includePastHistory}
                onChange={(e) => setIncludePastHistory(e.target.checked)}
                className="mt-0.5 rounded text-indigo-500 focus:ring-indigo-500 border-gray-200 dark:border-white/10 bg-white dark:bg-black dark:border-white/10 shadow-sm accent-indigo-500"
              />
              <div>
                <span className="block text-xs font-bold text-indigo-500 dark:text-indigo-200 leading-none mb-1">
                  Examine My Training Logs
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-300/75 leading-snug font-medium block">
                  Enabling this forces Gemini to parse your completed workout timelines to automatically calibrate optimal lifting weights so you hit peak hypertrophy safely.
                </span>
              </div>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-300/85 uppercase tracking-widest mb-1.5 font-mono">
                  Target Effort (RPE)
                </label>
                <select
                  value={rpeTarget}
                  onChange={(e) => setRpeTarget(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-400"
                >
                  <option value="7">RPE 7 (Moderate effort - 3 reps in reserve)</option>
                  <option value="8">RPE 8 (Challenging effort - 2 reps in reserve)</option>
                  <option value="9">RPE 9 (Very hard effort - 1 rep in reserve)</option>
                  <option value="10">RPE 10 (Maximum effort - muscle failure)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-300/85 uppercase tracking-widest mb-1.5 font-mono">
                  Weight Modifier Bias
                </label>
                <select
                  value={weightModifier}
                  onChange={(e) => setWeightModifier(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2.5 bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-400"
                >
                  <option value="-20">Force Lighter (-20%)</option>
                  <option value="-10">Slightly Lighter (-10%)</option>
                  <option value="0">AI Recommended Baseline (Auto)</option>
                  <option value="10">Slightly Heavier (+10%)</option>
                  <option value="20">Force Heavy / Overload (+20%)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-300/60 uppercase tracking-widest mb-1 font-mono">
                Special Requests or Feedback
              </label>
              <textarea
                placeholder="Examples: 'Avoid leg press due to knee pain', 'focus more on shoulders', 'make it an ultra fast 30-minute session'..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full text-xs p-3 bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/10 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-400 text-gray-900 dark:text-gray-100 min-h-16 placeholder-gray-500"
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/20 text-rose-200 rounded-xl text-xs font-semibold">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* ACTION DISPATCH BUTTON */}
            <button
              onClick={handleGenerate}
              className="w-full py-3.5 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-550 hover:to-purple-550 text-white font-bold text-xs rounded-xl transition-all shadow-lg active:scale-99 flex items-center justify-center space-x-1.5 uppercase tracking-wide group"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300 group-hover:animate-bounce" />
              <span>Compose Personalised Workout Plan</span>
            </button>
          </motion.div>
        ) : isLoading ? (
          // MODERN GLOWING NEURAL LOADER
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 flex flex-col items-center justify-center space-y-4"
          >
            <div className="relative">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center animate-ping" style={{ animationDuration: "2.4s" }} />
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform rotate-45 animate-spin duration-1000" style={{ animationDuration: "3s" }}>
                <FlexingArm className="w-7 h-7 text-gray-900 dark:text-gray-100 transform -rotate-45 animate-pulse" />
              </div>
            </div>
            
            <div className="text-center">
              <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                Gemini AI is analysing training models...
              </h5>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-300/60 font-mono tracking-widest uppercase mt-1">
                CALIBRATING TONNAGE & HYPERTROPHY CURVES
              </p>
            </div>
          </motion.div>
        ) : (
          // GENERATED PREVIEW LAYOUT
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Header description */}
            <div className="bg-gradient-to-tr from-indigo-950/40 via-indigo-950/20 to-purple-950/30 p-4 rounded-2xl border border-indigo-500/15 relative">
              <span className="block text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">GEMINI RECOMMENDS</span>
              <h5 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base">{generatedWorkout?.recommendedName}</h5>
              <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed italic mt-1.5">
                "{generatedWorkout?.reasoning}"
              </p>
            </div>

            {/* Generated exercises list */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-indigo-600 dark:text-indigo-300/60 uppercase tracking-widest pl-1 font-mono">Prescribed Movements</span>
              
              {generatedWorkout?.exercises.map((ex, exIdx) => (
                <div key={ex.exerciseId} className="bg-white dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="px-4 py-2 bg-white dark:bg-black dark:border-white/10 shadow-sm border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <h6 className="font-bold text-gray-900 dark:text-slate-100 text-xs">{getExerciseName(ex.exerciseId)}</h6>
                      <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-300/60">{getExerciseCategory(ex.exerciseId)}</span>
                    </div>
                  </div>

                  <div className="p-3 space-y-1.5 divide-y divide-white/5">
                    {ex.sets.map((set, sIdx) => (
                      <div key={sIdx} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-500 dark:text-slate-400">Set {sIdx + 1}</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded px-1.5 py-0.5 uppercase tracking-widest font-sans font-bold leading-none">{set.type}</span>
                          <span className="text-gray-900 dark:text-gray-100 font-bold">{set.weight} kg × {set.reps} reps</span>
                        </div>
                      </div>
                    ))}
                    {ex.notes && (
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-300/80 italic pt-2 font-medium leading-normal">
                        💡 Key tip: {ex.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* OPTION FORMS DISPATCH PANEL */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                onClick={() => setGeneratedWorkout(null)}
                className="w-full py-3 bg-white dark:bg-black dark:border-white/10 shadow-sm hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Panel</span>
              </button>

              <button
                onClick={handleSaveToTemplates}
                className="w-full py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-305 border border-indigo-500/25 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Routine</span>
              </button>
            </div>

            <button
              onClick={handleStartWorkoutNow}
              className="w-full py-3.5 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-550 hover:to-purple-550 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5 uppercase tracking-wider ring-1 ring-white/10"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Tracking This Session Now</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- End of AIGeneratorLab.tsx ---
