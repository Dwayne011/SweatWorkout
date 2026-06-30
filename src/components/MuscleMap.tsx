/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Muscle map — a full-screen page reached by tapping the Insights "Muscle split"
 * module (muscle-map-frontback.html). Same granular front/back figure and
 * sub-muscle list as the post-workout coach analysis, but over a rolling window
 * of sessions rather than one. Deterministic from the curated muscleMap; no
 * model involvement. Slides in from the right over the Insights tab.
 */
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Exercise } from "../types";
import { aggregateMuscles, MuscleEntry, BUCKET_COLOR } from "../lib/muscleAgg";
import MuscleFigure from "./MuscleFigure";

interface Props {
  entries: MuscleEntry[];
  exercisesList: Exercise[];
  windowLabel: string;
  onClose: () => void;
}

export default function MuscleMap({ entries, exercisesList, windowLabel, onClose }: Props) {
  const reduce = useReducedMotion();
  const [view, setView] = useState<"front" | "back">("front");

  const { worked, muscleColor, groups } = useMemo(() => {
    const exById = new Map(exercisesList.map((e) => [e.id, e]));
    const catOf = (id: string) => exById.get(id)?.category || "Other";
    const agg = aggregateMuscles(entries, catOf);

    // Group the worked sub-muscles by their coarse parent (Chest, Shoulders…),
    // ordering the groups by how hard they were hit and keeping each group's
    // rows in intensity order within.
    const byParent = new Map<string, typeof agg.worked>();
    agg.worked.forEach((w) => {
      const arr = byParent.get(w.parent) || [];
      arr.push(w);
      byParent.set(w.parent, arr);
    });
    const grouped = [...byParent.entries()]
      .map(([parent, items]) => ({ parent, items, top: Math.max(...items.map((i) => i.ratio)) }))
      .sort((a, b) => b.top - a.top);

    return { worked: agg.worked, muscleColor: agg.muscleColor, groups: grouped };
  }, [entries, exercisesList]);

  return (
    <motion.div
      className="pbw-ca pbw-mmap"
      initial={reduce ? false : { x: "100%" }}
      animate={{ x: 0 }}
      exit={reduce ? { opacity: 0 } : { x: "100%" }}
      transition={{ type: "spring", stiffness: 420, damping: 38 }}
    >
      <div className="body">
        <div className="ovhd">
          <button className="back" onClick={onClose} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div>
            <div className="eyb">Muscles worked</div>
            <div className="ovname">Muscle map</div>
            <div className="ovsub">{windowLabel}</div>
          </div>
        </div>

        {worked.length === 0 ? (
          <div className="mmempty">No completed sets in this window yet. Train a few sessions and your worked muscles will light up here.</div>
        ) : (
          <>
            <div className="fbtoggle">
              <button className={view === "front" ? "on" : ""} onClick={() => setView("front")}>Front</button>
              <button className={view === "back" ? "on" : ""} onClick={() => setView("back")}>Back</button>
            </div>
            <div className="mapwrap">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={view}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <MuscleFigure view={view} color={muscleColor} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="legend">
              <span className="lg"><i style={{ background: BUCKET_COLOR.High }} />High</span>
              <span className="lg"><i style={{ background: BUCKET_COLOR.Moderate }} />Moderate</span>
              <span className="lg"><i style={{ background: BUCKET_COLOR.Light }} />Light</span>
            </div>
            <div className="grouplist">
              {groups.map((group) => (
                <React.Fragment key={group.parent}>
                  <div className="ghead">{group.parent}</div>
                  {group.items.map((g) => (
                    <div key={g.key} className="grow">
                      <div className="gtop">
                        <span className="gnm">{g.name}</span>
                        <span className="gset">{g.sets} set{g.sets === 1 ? "" : "s"} · {g.bucket}</span>
                      </div>
                      <div className="gbar"><span style={{ width: `${Math.max(8, Math.round(g.ratio * 100))}%`, background: g.color || "transparent" }} /></div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
