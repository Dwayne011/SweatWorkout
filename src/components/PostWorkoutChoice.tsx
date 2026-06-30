/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Post-workout choice (w4) — shown after finishing instead of jumping straight
 * to the AI feedback. "Workout complete", a deterministic stat row, then three
 * equal choices: see your feedback, save as a routine, or close. Built to
 * post-workout-choice.html. All numbers are computed from the saved doc.
 */
import React, { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { WorkoutSession, Exercise } from "../types";
import { Button } from "./ui/Button";

interface Props {
  workout: WorkoutSession;
  exercisesList: Exercise[];
  history: WorkoutSession[];
  onSeeFeedback: () => void;
  onSaveRoutine: () => void;
  onClose: () => void;
}

const startMs = (s: WorkoutSession) => new Date(s.startTime).getTime();
const ISpark = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5 13.7 8 19 9.5 13.7 11 12 16.5 10.3 11 5 9.5 10.3 8 12 2.5Zm6.5 9 .9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" /></svg>);
const Chev = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>);

export default function PostWorkoutChoice({ workout, exercisesList, history, onSeeFeedback, onSaveRoutine, onClose }: Props) {
  const reduce = useReducedMotion();

  const m = useMemo(() => {
    const exById = new Map(exercisesList.map((e) => [e.id, e]));
    const thisMs = startMs(workout);
    let volume = 0, setCount = 0, prCount = 0, lifts = 0;
    (workout.exercises || []).forEach((we) => {
      const ex = exById.get(we.exerciseId);
      const done = (we.sets || []).filter((s) => s.isCompleted);
      if (!done.length) return;
      lifts += 1;
      const isBW = ex?.equipment === "Bodyweight" || ex?.modality === "BODYWEIGHT" || done.every((s) => (Number(s.weight) || 0) === 0);
      let prevBest: number | null = null;
      history.forEach((h) => {
        if (h.id === workout.id || startMs(h) >= thisMs) return;
        (h.exercises || []).forEach((he) => {
          if (he.exerciseId !== we.exerciseId) return;
          (he.sets || []).filter((s) => s.isCompleted).forEach((s) => {
            const v = isBW ? Number(s.reps) || 0 : Number(s.weight) || 0;
            if (prevBest === null || v > prevBest) prevBest = v;
          });
        });
      });
      done.forEach((s) => {
        const w = Number(s.weight) || 0, r = Number(s.reps) || 0;
        volume += w * r; setCount += 1;
        const val = isBW ? r : w;
        if (prevBest !== null && val > prevBest) prCount += 1;
      });
    });
    return { volume, setCount, lifts, prCount };
  }, [workout, exercisesList, history]);

  const durMin = workout.endTime ? Math.max(0, Math.round((new Date(workout.endTime).getTime() - startMs(workout)) / 60000)) : 0;

  return (
    <motion.div className="pbw-pwc" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="body">
        <motion.div
          className="checkwrap"
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.05 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
        </motion.div>
        <h1>Workout complete</h1>
        <div className="sub">{workout.name} · {durMin} min{durMin === 1 ? "" : "s"}</div>

        <div className="statcard">
          <div className="stat"><div className="v">{m.volume.toLocaleString()}</div><div className="l">Volume</div></div>
          <div className="stat"><div className="v">{m.setCount}</div><div className="l">Sets</div></div>
          <div className="stat"><div className="v">{m.lifts}</div><div className="l">Lifts</div></div>
          <div className="stat"><div className="v">{m.prCount}</div><div className="l">PR</div></div>
        </div>

        <div className="whatnext">What next?</div>

        <Button variant="none" className="choice feedback" onClick={onSeeFeedback}>
          <span className="ci"><ISpark /></span>
          <span className="ct"><b>See your feedback</b><span>The coach reads this session</span></span>
          <span className="cv"><Chev /></span>
        </Button>

        <Button variant="none" className="choice saveroutine" onClick={onSaveRoutine}>
          <span className="ci">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>
          </span>
          <span className="ct"><b>Save as a routine</b><span>Reuse this workout, name it your own</span></span>
          <span className="cv"><Chev /></span>
        </Button>

        <Button variant="none" className="choice close" onClick={onClose}>
          <span className="ci">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </span>
          <span className="ct"><b>Close</b><span>Back to your workouts</span></span>
        </Button>
      </div>
    </motion.div>
  );
}
