/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Save as a routine (save-as-routine.html) — a full-page popout opened from the
 * post-workout choice screen and from the workout overview. Saves the exercises
 * and the set layout as a TEMPLATE only: no weights, the logged weights stay on
 * the workout. The name field is empty with "Blank Routine" as a faded
 * placeholder when the session is still the default, pre-filled otherwise.
 */
import React, { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { WorkoutSession, Exercise, SetType } from "../types";
import { Button } from "./ui/Button";

interface TemplateExercise {
  exerciseId: string;
  sets: { weight: number; reps: number; type: SetType }[];
}

interface Props {
  session: WorkoutSession;
  exercisesList: Exercise[];
  onBack: () => void;
  onSave: (name: string, exercises: TemplateExercise[]) => void;
}

const DiskIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>);
const ExIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M14.5 9.5L9.5 14.5" /></svg>);

export default function SaveAsRoutine({ session, exercisesList, onBack, onSave }: Props) {
  const reduce = useReducedMotion();
  const isDefaultName = !session.name || session.name === "Blank Routine";
  const [name, setName] = useState(isDefaultName ? "" : session.name);

  const exById = useMemo(() => new Map(exercisesList.map((e) => [e.id, e])), [exercisesList]);

  // Template = exercise + set layout (count + type), no weights. Drop empties.
  const rows = useMemo(() => (session.exercises || [])
    .map((we) => ({
      exerciseId: we.exerciseId,
      name: exById.get(we.exerciseId)?.name || we.exerciseId,
      count: (we.sets || []).length,
      sets: (we.sets || []).map((s) => ({ weight: 0, reps: Number(s.reps) || 0, type: s.type })),
    }))
    .filter((r) => r.count > 0), [session, exById]);

  const handleSave = () => {
    const finalName = name.trim() || "Blank Routine";
    onSave(finalName, rows.map((r) => ({ exerciseId: r.exerciseId, sets: r.sets })));
  };

  return (
    <motion.div
      className="pbw-sar"
      initial={reduce ? false : { x: "100%" }}
      animate={{ x: 0 }}
      exit={reduce ? { opacity: 0 } : { x: "100%" }}
      transition={{ type: "spring", stiffness: 420, damping: 38 }}
    >
      <div className="sarhead">
        <button className="sarback" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span className="sareyebrow">Save as a routine</span>
        <div className="saricon"><DiskIcon /></div>
        <h1>Save as a routine</h1>
        <p>Reuse this workout any time.</p>
      </div>

      <div className="sarbody">
        <div className="sarlab">Routine name</div>
        <input
          className="sarname"
          value={name}
          placeholder="Blank Routine"
          onChange={(e) => setName(e.target.value)}
          autoFocus={false}
          maxLength={60}
        />
        {isDefaultName && (
          <p className="sarhelp">Started as "Blank Routine". Give it a name you'll recognise.</p>
        )}

        <div className="sarinc">
          <span>Included</span>
          <span>{rows.length} exercise{rows.length === 1 ? "" : "s"}</span>
        </div>
        <div className="sarlist">
          {rows.map((r, i) => (
            <div key={i} className="sarrow">
              <span className="ri"><ExIcon /></span>
              <span className="rn">{r.name}</span>
              <span className="rs">{r.count} set{r.count === 1 ? "" : "s"}</span>
            </div>
          ))}
        </div>

        <p className="sarnote">
          Saves the exercises and set layout as a template. Your logged weights stay on the workout, they are not copied as targets.
        </p>

        <Button variant="none" className="sarsave" onClick={handleSave} disabled={rows.length === 0}>
          <DiskIcon /> Save routine
        </Button>
      </div>
    </motion.div>
  );
}
