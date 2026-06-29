/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Workout overview — a full-screen page (its own view, not a sheet). The
 * at-a-glance read of one logged workout and the bridge to the full coach
 * analysis: a back arrow, profile header + stats, the inline coach take teaser,
 * then the set log. All numbers are deterministic from the saved doc; the
 * coach-take prose is the model's job (backend-gated, see the analysis page).
 * Plain coaching voice. Slides in from the right over History.
 */
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import { WorkoutSession, Exercise, WorkoutSet } from "../types";
import { Button } from "./ui/Button";
import { coachWorkout } from "../aiClient";

interface Props {
  session: WorkoutSession;
  history: WorkoutSession[];
  exercisesList: Exercise[];
  onClose: () => void;
  onReadFull: () => void;
}

const startMs = (s: WorkoutSession) => new Date(s.startTime).getTime();

// set type -> label + chip class (normal renders as "Working")
const TYPE_META: Record<string, { label: string; cls: string }> = {
  warmup: { label: "Warmup", cls: "warm" },
  normal: { label: "Working", cls: "norm" },
  drop: { label: "Drop", cls: "drop" },
  failure: { label: "Failure", cls: "fail" },
};

export default function WorkoutOverviewPopout({ session, history, exercisesList, onClose, onReadFull }: Props) {
  const reduce = useReducedMotion();

  const m = useMemo(() => {
    const exById = new Map(exercisesList.map((e) => [e.id, e]));
    const thisMs = startMs(session);

    let volume = 0;
    let setCount = 0;
    let prCount = 0;

    const exercises = (session.exercises || []).map((we) => {
      const ex = exById.get(we.exerciseId);
      const done = (we.sets || []).filter((s) => s.isCompleted);
      const isBW = ex?.equipment === "Bodyweight" || ex?.modality === "BODYWEIGHT" || (done.length > 0 && done.every((s) => (Number(s.weight) || 0) === 0));

      // previous best for this exerciseId across PAST sessions
      let prevBest: number | null = null;
      history.forEach((h) => {
        if (h.id === session.id || startMs(h) >= thisMs) return;
        (h.exercises || []).forEach((he) => {
          if (he.exerciseId !== we.exerciseId) return;
          (he.sets || []).filter((s) => s.isCompleted).forEach((s) => {
            const v = isBW ? Number(s.reps) || 0 : Number(s.weight) || 0;
            if (prevBest === null || v > prevBest) prevBest = v;
          });
        });
      });

      const rows = done.map((s: WorkoutSet) => {
        const w = Number(s.weight) || 0;
        const r = Number(s.reps) || 0;
        volume += w * r;
        setCount += 1;
        const val = isBW ? r : w;
        const isPR = prevBest !== null && val > prevBest;
        if (isPR) prCount += 1;
        const meta = TYPE_META[s.type] || TYPE_META.normal;
        return {
          label: meta.label,
          cls: meta.cls,
          load: isBW ? `BW × ${r}` : `${Math.round(w)} kg × ${r}`,
          isPR,
        };
      });

      return { name: ex?.name || we.exerciseId, count: done.length, rows };
    }).filter((e) => e.count > 0);

    return { exercises, volume, setCount, lifts: exercises.length, prCount };
  }, [session, history, exercisesList]);

  const date = new Date(session.startTime);
  const dateStr = date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const durMin = session.endTime ? Math.max(0, Math.round((new Date(session.endTime).getTime() - startMs(session)) / 60000)) : 0;

  // The coach-take prose is the same per-workout coach call as the analysis page
  // (one call, short here, full there). When it isn't available (backend not set
  // up, signed out, offline) this falls back to the deterministic facts line.
  const teaser = m.setCount > 0
    ? `You logged ${m.setCount} set${m.setCount === 1 ? "" : "s"} across ${m.lifts} lift${m.lifts === 1 ? "" : "s"}${m.volume > 0 ? `, ${m.volume.toLocaleString()} kg of total volume` : ""}.`
    : "No completed sets in this session yet.";

  const [takeState, setTakeState] = useState<"loading" | "ready" | "fallback">(m.setCount > 0 ? "loading" : "fallback");
  const [takeText, setTakeText] = useState("");

  const runTake = useCallback(async () => {
    setTakeState("loading");
    try {
      const res = await coachWorkout({
        workoutName: session.name,
        date: dateStr,
        durationMin: durMin,
        totalSets: m.setCount,
        lifts: m.lifts,
        volumeKg: m.volume,
        prCount: m.prCount,
        exercises: m.exercises.map((e) => ({ name: e.name, sets: e.count })),
      });
      const text = (res.summary || "").trim();
      if (text) { setTakeText(text); setTakeState("ready"); }
      else setTakeState("fallback");
    } catch {
      // not configured / signed out / offline -> deterministic teaser
      setTakeState("fallback");
    }
  }, [session.name, dateStr, durMin, m.setCount, m.lifts, m.volume, m.prCount, m.exercises]);

  useEffect(() => {
    if (m.setCount <= 0) { setTakeState("fallback"); return; }
    let cancelled = false;
    runTake().catch(() => { if (!cancelled) setTakeState("fallback"); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  return (
    <motion.div
      className="pbw-wop"
      initial={reduce ? false : { x: "100%" }}
      animate={{ x: 0 }}
      exit={reduce ? { opacity: 0 } : { x: "100%" }}
      transition={{ type: "spring", stiffness: 420, damping: 38 }}
    >
      <div className="wopbody">
        <div className="wophead">
          <button className="wopback" onClick={onClose} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="pcover">
            <div className="pavatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
            </div>
            <div className="pname">{session.name}</div>
            <div className="pdate">{dateStr} · {durMin} min{durMin === 1 ? "" : "s"}</div>
            <div className="pstats">
              <div className="pstat"><div className="pv">{m.volume.toLocaleString()}</div><div className="pl">Volume</div></div>
              <div className="pstat"><div className="pv">{m.setCount}</div><div className="pl">Sets</div></div>
              <div className="pstat"><div className="pv">{m.lifts}</div><div className="pl">Lifts</div></div>
              <div className="pstat"><div className="pv">{m.prCount}</div><div className="pl">PR</div></div>
            </div>
          </div>
        </div>

        <div className="sheetbody">
          <div className="coachsec">
            <div className="coachhd">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5 13.7 8 19 9.5 13.7 11 12 16.5 10.3 11 5 9.5 10.3 8 12 2.5Zm6.5 9 .9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" /></svg>
              <span>Coach take</span>
            </div>
            {takeState === "loading" ? (
              <div className="coachload">
                <div className="cll" style={{ width: "100%" }} />
                <div className="cll" style={{ width: "62%" }} />
              </div>
            ) : (
              <p className="coachteaser">{takeState === "ready" ? takeText : teaser}</p>
            )}
            <Button variant="none" className="readmore" onClick={onReadFull}>
              Read full analysis
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </Button>
          </div>

          <div className="loglab">Exercises</div>
          {m.exercises.map((ex, i) => (
            <div key={i} className="excard">
              <div className="exhd">
                <div className="exname">{ex.name}</div>
                <div className="exn">{ex.count} set{ex.count === 1 ? "" : "s"}</div>
              </div>
              <div className="setlist">
                {ex.rows.map((row, j) => (
                  <div key={j} className="setrow">
                    <span className={`st ${row.cls}`}>{row.label}</span>
                    <span className="sval">{row.load}{row.isPR && <span className="prb">PR</span>}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
