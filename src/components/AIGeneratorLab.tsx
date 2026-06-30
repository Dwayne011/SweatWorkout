/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Workout composer (r1, rebuild to gemini-composer.html). The old AI-Studio
 * panel was Tailwind-soup with sci-fi copy ("CALIBRATING TONNAGE & HYPERTROPHY
 * CURVES") and a single-select equipment toggle. This is the plain-coaching-
 * voice version on the app's --m3 tokens: pick your kit (multi-select, plus a
 * specific-kit checklist), say how hard it should feel, and the coach builds it.
 * The Gemini call + the result preview are unchanged in contract; only the UI
 * and the wording are reworked. equipment is sent as a readable string so the
 * backend prompt stays backward compatible.
 */
import React, { useState } from "react";
import { robustFetch } from "../utils/network";
import { apiUrl, getAuthHeader } from "../aiClient";
import { Exercise, WorkoutSession, UserProfile } from "../types";
import { Sparkles, Check, RefreshCw, Save, Play, Plus, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/Button";

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

// Multi-select kit. "Full gym" covers everything, so it's exclusive with the
// three specific categories; those three combine freely.
const KIT_CHIPS = ["Full gym", "Dumbbells", "Kettlebells", "Bodyweight"];
const SPECIFIC_KIT = ["Barbell & plates", "Adjustable bench", "Pull-up bar", "Cable machine", "Resistance bands", "Dip station"];

// Each kit choice → the catalogue `equipment` tags it unlocks. Bodyweight is
// always available (it's your body), so it's added implicitly. "Full gym" means
// no filter at all. This is what turns the chips into a concrete performable
// pool the model picks from, rather than a hint it can ignore.
const EQUIP_MAP: Record<string, string[]> = {
  "Full gym": ["Barbell", "Bodyweight", "Cables", "Dumbbell", "EZ-Bar", "Machine", "Other", "Weight plate"],
  Dumbbells: ["Dumbbell"],
  Kettlebells: ["Other", "Dumbbell"],
  Bodyweight: ["Bodyweight"],
  "Barbell & plates": ["Barbell", "Weight plate", "EZ-Bar"],
  "Adjustable bench": [],
  "Pull-up bar": ["Bodyweight"],
  "Cable machine": ["Cables"],
  "Resistance bands": ["Other"],
  "Dip station": ["Bodyweight"],
};

export default function AIGeneratorLab({
  exercisesList,
  historyList,
  userProfile,
  onCreateTemplate,
  onStartBlank,
  onStartFromTemplate,
  onSuccessClose,
}: AIGeneratorLabProps) {
  const [goal, setGoal] = useState<string>("Build muscle");
  const [fitnessLevel, setFitnessLevel] = useState<string>("Intermediate");
  const [kit, setKit] = useState<Set<string>>(new Set(["Full gym"]));
  const [specificKit, setSpecificKit] = useState<Set<string>>(new Set());
  const [showKit, setShowKit] = useState<boolean>(false);
  const [includePastHistory, setIncludePastHistory] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string>("");
  const [rpeTarget, setRpeTarget] = useState<string>("8");
  const [weightModifier, setWeightModifier] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedWorkout, setGeneratedWorkout] = useState<{
    recommendedName: string;
    reasoning: string;
    exercises: { exerciseId: string; sets: { weight: number; reps: number; type: string }[]; notes?: string }[];
  } | null>(null);

  const getExerciseName = (id: string) => exercisesList.find((ex) => ex.id === id)?.name || id;
  const getExerciseCategory = (id: string) => exercisesList.find((ex) => ex.id === id)?.category || "Legs";

  const toggleKit = (name: string) => {
    setKit((prev) => {
      const next = new Set(prev);
      if (name === "Full gym") return new Set(["Full gym"]); // exclusive
      next.delete("Full gym");
      if (next.has(name)) next.delete(name);
      else next.add(name);
      if (next.size === 0) next.add("Full gym"); // never leave it empty
      return next;
    });
  };
  const toggleSpecific = (name: string) => {
    setSpecificKit((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Fold the chips + checklist into one readable line for the prompt.
  const equipmentString = () => {
    const base = kit.has("Full gym") ? ["Full gym (everything available)"] : [...kit];
    const extra = [...specificKit];
    return [...base, ...extra].join(", ") || "Bodyweight only";
  };

  // Turn the kit selection into the concrete pool of movements the user can
  // actually do. Full gym → the whole catalogue; otherwise only exercises whose
  // equipment is unlocked (bodyweight always counts). The model is handed this
  // pool, so it can't prescribe a barbell lift to someone with only dumbbells.
  const performableExercises = () => {
    if (kit.has("Full gym")) return exercisesList;
    const allowed = new Set<string>(["Bodyweight"]);
    [...kit, ...specificKit].forEach((k) => (EQUIP_MAP[k] || []).forEach((e) => allowed.add(e)));
    const filtered = exercisesList.filter((e) => allowed.has(e.equipment));
    return filtered.length ? filtered : exercisesList;
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedWorkout(null);
    try {
      const response = await robustFetch(apiUrl("/api/ai/generate-workout"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await getAuthHeader()) },
        body: JSON.stringify({
          goal,
          fitnessLevel,
          equipment: equipmentString(),
          includePastHistory,
          feedback,
          exercisesList: performableExercises(),
          historyList,
          userProfile,
          rpeTarget,
          weightModifier,
        }),
      });
      if (!response.ok) throw new Error("Couldn't reach the coach. Check the connection and that the Gemini key is set up.");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setGeneratedWorkout(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong building your workout. Give it another go.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToTemplates = async () => {
    if (!generatedWorkout) return;
    try {
      await onCreateTemplate(
        generatedWorkout.recommendedName,
        generatedWorkout.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps, type: s.type as any })),
        })),
        generatedWorkout.reasoning
      );
      if (onSuccessClose) onSuccessClose();
    } catch (err) {
      console.error(err);
      setErrorMessage("Couldn't save that as a routine. Check your connection and try again.");
    }
  };

  const handleStartWorkoutNow = async () => {
    if (!generatedWorkout) return;
    try {
      const docRef = await onCreateTemplate(
        generatedWorkout.recommendedName,
        generatedWorkout.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps, type: s.type as any })),
        })),
        generatedWorkout.reasoning
      );
      const templateId = docRef?.id || docRef;
      if (templateId) onStartFromTemplate(templateId);
      else onStartBlank();
    } catch (err) {
      console.error(err);
      onStartBlank();
    }
  };

  return (
    <div className="pbw-composer">
      <div className="cmphd">
        <span className="cmpic"><Sparkles className="w-5 h-5" /></span>
        <div>
          <div className="cmpt">Workout composer</div>
          <div className="cmpsub">Coached by Gemini</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!generatedWorkout && !isLoading ? (
          <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="cmpbody">
            <div className="cfield">
              <label className="clab">What are you training for</label>
              <div className="cselect">
                <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="Build muscle">Build muscle</option>
                  <option value="Lose weight">Lose weight &amp; lean out</option>
                  <option value="Gain strength">Get stronger</option>
                  <option value="Conditioning">Conditioning &amp; fitness</option>
                  <option value="General fitness">Stay in shape</option>
                </select>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <div className="cfield">
              <label className="clab">How experienced are you</label>
              <div className="cselect">
                <select value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value)}>
                  <option value="Beginner">New to this, keep it simple</option>
                  <option value="Intermediate">Intermediate, lifting consistently</option>
                  <option value="Advanced">Advanced, high volume</option>
                </select>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <div className="cfield">
              <label className="clab">What kit have you got</label>
              <div className="kitchips">
                {KIT_CHIPS.map((name) => {
                  const on = kit.has(name);
                  return (
                    <button type="button" key={name} className={`kitchip${on ? " on" : ""}`} onClick={() => toggleKit(name)}>
                      {name}
                      {on && <X className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
              <p className="kitnote">
                Pick everything you have. Full gym covers it all, or tap the pieces you own.
                {!kit.has("Full gym") && <span className="kitcount"> · coaching from {performableExercises().length} movements you can do</span>}
              </p>
              <button type="button" className="kitadd" onClick={() => setShowKit((s) => !s)}>
                <Plus className="w-4 h-4" /> Add specific kit
              </button>
              <AnimatePresence initial={false}>
                {showKit && (
                  <motion.div
                    key="kitlist"
                    className="kitlist"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {SPECIFIC_KIT.map((name) => {
                      const on = specificKit.has(name);
                      return (
                        <label key={name} className="kitrow">
                          <span className={`kitbox${on ? " on" : ""}`}>{on && <Check className="w-3 h-3" />}</span>
                          <input type="checkbox" checked={on} onChange={() => toggleSpecific(name)} hidden />
                          {name}
                        </label>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="cfield">
              <label className="clab">Use my past workouts</label>
              <label className="ctoggle">
                <span className={`kitbox${includePastHistory ? " on" : ""}`}>{includePastHistory && <Check className="w-3 h-3" />}</span>
                <input type="checkbox" checked={includePastHistory} onChange={(e) => setIncludePastHistory(e.target.checked)} hidden />
                <div>
                  <div className="ctgt">Look at what I've lifted</div>
                  <div className="ctgs">The coach reads your past sessions so it can set weights that match where you are now.</div>
                </div>
              </label>
            </div>

            <div className="cfield">
              <label className="clab">How hard should it feel</label>
              <div className="cselect">
                <select value={rpeTarget} onChange={(e) => setRpeTarget(e.target.value)}>
                  <option value="7">RPE 7, leave about 3 reps in the tank</option>
                  <option value="8">RPE 8, leave about 2 reps in the tank</option>
                  <option value="9">RPE 9, leave about 1 rep in the tank</option>
                  <option value="10">RPE 10, take sets to failure</option>
                </select>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <div className="cfield">
              <label className="clab">Weight starting point</label>
              <div className="cselect">
                <select value={weightModifier} onChange={(e) => setWeightModifier(Number(e.target.value))}>
                  <option value="-20">Start me lighter (−20%)</option>
                  <option value="-10">A little lighter (−10%)</option>
                  <option value="0">Let the coach decide</option>
                  <option value="10">A little heavier (+10%)</option>
                  <option value="20">Push me heavier (+20%)</option>
                </select>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <div className="cfield">
              <label className="clab">Anything else</label>
              <textarea
                className="ctext"
                placeholder="For example: skip leg press, my knee is sore. Or, go easier on shoulders. Or, keep it to 30 minutes."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            {errorMessage && <div className="cerr">{errorMessage}</div>}

            <Button variant="none" onClick={handleGenerate} className="cbuild">
              <Sparkles className="w-5 h-5" /> Build my workout
            </Button>
          </motion.div>
        ) : isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="cmploading">
            <div className="cspin"><Sparkles className="w-6 h-6" /></div>
            <div className="cloadt">Building your workout</div>
            <div className="cloads">Reading your history and picking your lifts…</div>
          </motion.div>
        ) : (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="cmpbody">
            <div className="crec">
              <span className="creceyb">Your coach suggests</span>
              <div className="crecname">{generatedWorkout?.recommendedName}</div>
              <p className="crecwhy">{generatedWorkout?.reasoning}</p>
            </div>

            <div className="clab" style={{ marginTop: 4 }}>The plan</div>
            {generatedWorkout?.exercises.map((ex) => (
              <div key={ex.exerciseId} className="cex">
                <div className="cexhd">
                  <div className="cexnm">{getExerciseName(ex.exerciseId)}</div>
                  <div className="cexcat">{getExerciseCategory(ex.exerciseId)}</div>
                </div>
                <div className="cexsets">
                  {ex.sets.map((set, sIdx) => (
                    <div key={sIdx} className="cexrow">
                      <span className="cexset">Set {sIdx + 1}</span>
                      <span className="cexval">
                        <span className="cextype">{set.type}</span>
                        {set.weight} kg × {set.reps}
                      </span>
                    </div>
                  ))}
                  {ex.notes && <p className="cextip">{ex.notes}</p>}
                </div>
              </div>
            ))}

            <div className="cprevbtns">
              <Button variant="none" onClick={() => setGeneratedWorkout(null)} className="cghost">
                <RefreshCw className="w-4 h-4" /> Start over
              </Button>
              <Button variant="none" onClick={handleSaveToTemplates} className="csave">
                <Save className="w-4 h-4" /> Save as routine
              </Button>
            </div>
            <Button variant="none" onClick={handleStartWorkoutNow} className="cbuild">
              <Play className="w-5 h-5" /> Start this workout
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
