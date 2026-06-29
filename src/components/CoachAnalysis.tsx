/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Coach analysis — full screen (rebuild to coach-analysis.html). Replaces the
 * old screen that double-rendered, leaked raw markdown, and praised empty
 * sessions. Deterministic metrics (set counts, muscle-group intensity, previous
 * bests, durations) are computed here from the real history; the model only
 * ever writes the prose summary, and that comes from the backend, never the
 * client. Each section is rendered once. Plain coaching voice, no clinical or
 * sci-fi wording. See coach-analysis-claude-code-prompt.md + the data model.
 */
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { WorkoutSession, Exercise } from "../types";
import { Button } from "./ui/Button";

interface CoachAnalysisProps {
  completedWorkout: WorkoutSession;
  history: WorkoutSession[];
  exercisesList: Exercise[];
  onClose: () => void;
  onSaveAnalysis: (analysis: any) => void;
}

// TODO(ai-backend): the per-workout coach call. POST to the backend proxy at an
// ABSOLUTE base URL (never a relative /api path — in the Capacitor WebView that
// resolves to the SPA shell and returns index.html, not JSON), with the Firebase
// ID token. The backend computes the metrics and the model only interprets,
// returning structured JSON so nothing like ** can leak into the UI.
//   request:  { workoutId, metrics: { durationMin, groups, strength } }
//   response: { summary: string }   // wentWell/nextTime are deterministic below
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CoachSummaryResponse { summary: string }

const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"];
const startMs = (s: WorkoutSession) => new Date(s.startTime).getTime();

// Coarse 7-group front/back figures. A region's fill is its group's bucket
// colour; untouched regions and the outline use currentColor (so the figure
// reads in dark + light). Only the violet intensities are literals.
function MuscleFigure({ view, color }: { view: "front" | "back"; color: Record<string, string | null> }) {
  const p = (g: string) => {
    const c = color[g];
    return c ? { fill: c } : { fill: "currentColor", fillOpacity: 0.05 };
  };
  const base = { fill: "currentColor", fillOpacity: 0.05 };
  if (view === "front") {
    return (
      <svg className="fig" viewBox="0 0 360 470" width="190">
        <g stroke="currentColor" strokeOpacity={0.12} strokeWidth={1.5}>
          <circle cx="180" cy="44" r="23" {...base} />
          <rect x="169" y="64" width="22" height="16" rx="7" {...base} />
          <ellipse cx="106" cy="114" rx="12" ry="16" {...p("Shoulders")} />
          <ellipse cx="254" cy="114" rx="12" ry="16" {...p("Shoulders")} />
          <ellipse cx="130" cy="110" rx="23" ry="18" {...p("Shoulders")} />
          <ellipse cx="230" cy="110" rx="23" ry="18" {...p("Shoulders")} />
          <rect x="140" y="97" width="38" height="14" rx="6" {...p("Chest")} />
          <rect x="182" y="97" width="38" height="14" rx="6" {...p("Chest")} />
          <rect x="140" y="112" width="38" height="14" rx="6" {...p("Chest")} />
          <rect x="182" y="112" width="38" height="14" rx="6" {...p("Chest")} />
          <rect x="140" y="127" width="38" height="14" rx="6" {...p("Chest")} />
          <rect x="182" y="127" width="38" height="14" rx="6" {...p("Chest")} />
          <rect x="106" y="128" width="24" height="58" rx="12" {...p("Arms")} />
          <rect x="230" y="128" width="24" height="58" rx="12" {...p("Arms")} />
          <rect x="103" y="190" width="22" height="58" rx="11" {...p("Arms")} />
          <rect x="235" y="190" width="22" height="58" rx="11" {...p("Arms")} />
          <rect x="152" y="146" width="56" height="34" rx="12" {...p("Core")} />
          <rect x="152" y="182" width="56" height="34" rx="12" {...p("Core")} />
          <line x1="180" y1="148" x2="180" y2="214" stroke="currentColor" strokeOpacity={0.12} />
          <line x1="154" y1="180" x2="206" y2="180" stroke="currentColor" strokeOpacity={0.12} />
          <rect x="146" y="228" width="32" height="98" rx="15" {...p("Legs")} />
          <rect x="182" y="228" width="32" height="98" rx="15" {...p("Legs")} />
          <rect x="150" y="330" width="26" height="86" rx="13" {...p("Legs")} />
          <rect x="184" y="330" width="26" height="86" rx="13" {...p("Legs")} />
        </g>
      </svg>
    );
  }
  return (
    <svg className="fig" viewBox="0 0 360 470" width="190">
      <g stroke="currentColor" strokeOpacity={0.12} strokeWidth={1.5}>
        <circle cx="180" cy="44" r="23" {...base} />
        <path d="M150 122 L180 84 L210 122 L198 140 L162 140 Z" {...p("Back")} />
        <ellipse cx="130" cy="112" rx="23" ry="18" {...p("Shoulders")} />
        <ellipse cx="230" cy="112" rx="23" ry="18" {...p("Shoulders")} />
        <rect x="106" y="130" width="24" height="58" rx="12" {...p("Back")} />
        <rect x="230" y="130" width="24" height="58" rx="12" {...p("Back")} />
        <rect x="103" y="192" width="22" height="56" rx="11" {...p("Arms")} />
        <rect x="235" y="192" width="22" height="56" rx="11" {...p("Arms")} />
        <path d="M152 142 C146 168 150 196 176 206 L178 146 Z" {...p("Back")} />
        <path d="M208 142 C214 168 210 196 184 206 L182 146 Z" {...p("Back")} />
        <rect x="166" y="150" width="28" height="62" rx="10" {...p("Back")} />
        <ellipse cx="165" cy="232" rx="20" ry="17" {...p("Legs")} />
        <ellipse cx="195" cy="232" rx="20" ry="17" {...p("Legs")} />
        <rect x="146" y="256" width="32" height="78" rx="15" {...p("Legs")} />
        <rect x="182" y="256" width="32" height="78" rx="15" {...p("Legs")} />
        <rect x="150" y="338" width="26" height="80" rx="13" {...p("Legs")} />
        <rect x="184" y="338" width="26" height="80" rx="13" {...p("Legs")} />
      </g>
    </svg>
  );
}

const ArrowUp = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>);
const Flat = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 9h14M5 15h14" /></svg>);
const ArrowDown = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 17L7 7M15 17H7V9" /></svg>);
const RightArrow = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
const ISpark = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5 13.7 8 19 9.5 13.7 11 12 16.5 10.3 11 5 9.5 10.3 8 12 2.5Zm6.5 9 .9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" /></svg>);

export default function CoachAnalysis({ completedWorkout, history, exercisesList, onClose, onSaveAnalysis }: CoachAnalysisProps) {
  const reduce = useReducedMotion();
  const [view, setView] = useState<"front" | "back">("front");

  const m = useMemo(() => {
    const exById = new Map(exercisesList.map((e) => [e.id, e]));
    const catOf = (id: string) => exById.get(id)?.category || "Other";

    // completed sets per coarse group
    const groupCount: Record<string, number> = {};
    let totalSets = 0;
    (completedWorkout.exercises || []).forEach((we) => {
      const done = (we.sets || []).filter((s) => s.isCompleted);
      if (!done.length) return;
      const cat = catOf(we.exerciseId);
      groupCount[cat] = (groupCount[cat] || 0) + done.length;
      totalSets += done.length;
    });
    const maxCount = Math.max(1, ...Object.values(groupCount));
    const groups = MUSCLE_GROUPS.map((g) => {
      const c = groupCount[g] || 0;
      const ratio = c / maxCount;
      let bucket: string | null = null;
      let color: string | null = null;
      if (c > 0) {
        if (ratio >= 0.7) { bucket = "High"; color = "#9a6cff"; }
        else if (ratio >= 0.35) { bucket = "Moderate"; color = "rgba(139,92,255,.4)"; }
        else { bucket = "Light"; color = "rgba(139,92,255,.2)"; }
      }
      return { name: g, sets: c, ratio, bucket, color };
    });
    const groupColor: Record<string, string | null> = {};
    groups.forEach((g) => { groupColor[g.name] = g.color; });
    const worked = groups.filter((g) => g.sets > 0).sort((a, b) => b.sets - a.sets);

    // strength: previous best (from past sessions) vs this session
    const thisMs = startMs(completedWorkout);
    const strength = (completedWorkout.exercises || []).map((we) => {
      const ex = exById.get(we.exerciseId);
      const done = (we.sets || []).filter((s) => s.isCompleted);
      if (!done.length) return null;
      const isBW = ex?.equipment === "Bodyweight" || ex?.modality === "BODYWEIGHT" || done.every((s) => (Number(s.weight) || 0) === 0);
      const metric = (sets: typeof done) => isBW
        ? Math.max(...sets.map((s) => Number(s.reps) || 0))
        : Math.max(...sets.map((s) => Number(s.weight) || 0));
      const thisVal = metric(done);
      let prev: number | null = null;
      history.forEach((h) => {
        if (h.id === completedWorkout.id || startMs(h) >= thisMs) return;
        (h.exercises || []).forEach((he) => {
          if (he.exerciseId !== we.exerciseId) return;
          const hd = (he.sets || []).filter((s) => s.isCompleted);
          if (!hd.length) return;
          const v = metric(hd);
          if (prev === null || v > prev) prev = v;
        });
      });
      const fmt = (v: number) => (isBW ? `BW × ${v}` : `${Math.round(v)} kg`);
      const trend: "first" | "up" | "matched" | "down" =
        prev === null ? "first" : thisVal > prev ? "up" : thisVal < prev ? "down" : "matched";
      const deltaAmt = prev === null ? 0 : Math.abs(thisVal - prev);
      const unit = isBW ? "reps" : "kg";
      return {
        name: ex?.name || we.exerciseId,
        isBW, thisVal, prev, trend, deltaAmt, unit,
        thisStr: fmt(thisVal), prevStr: prev === null ? "—" : fmt(prev),
      };
    }).filter(Boolean) as Array<{
      name: string; isBW: boolean; thisVal: number; prev: number | null;
      trend: "first" | "up" | "matched" | "down"; deltaAmt: number; unit: string; thisStr: string; prevStr: string;
    }>;

    // deterministic bullets (the model would only refine the wording)
    const wentWell: Array<{ b: string; t: string }> = [];
    strength.filter((s) => s.trend === "up").slice(0, 2).forEach((s) =>
      wentWell.push({ b: `New best on ${s.name}.`, t: `${s.thisStr} this session, up from ${s.prevStr}.` })
    );
    if (totalSets > 0) wentWell.push({ b: `${totalSets} working set${totalSets === 1 ? "" : "s"} logged`, t: `across ${strength.length} exercise${strength.length === 1 ? "" : "s"}.` });
    if (wentWell.length < 2 && strength[0]) wentWell.push({ b: `${strength[0].name} logged.`, t: `${strength[0].thisStr} this session.` });

    const nextTime: Array<{ b: string; t: string }> = [];
    const topW = strength.filter((s) => !s.isBW).sort((a, b) => b.thisVal - a.thisVal)[0];
    if (topW) nextTime.push({ b: `${topW.name}.`, t: `Try a small jump, ${Math.round(topW.thisVal) + 2.5} kg, or one more rep on your top set.` });
    const topBW = strength.find((s) => s.isBW);
    if (topBW) nextTime.push({ b: `${topBW.name}.`, t: `Add a rep or two before you add any load.` });
    nextTime.push({ b: `Keep your rest steady.`, t: `Around 90 seconds between heavy sets keeps your reps up.` });

    const durationMin = completedWorkout.endTime
      ? Math.max(0, Math.round((new Date(completedWorkout.endTime).getTime() - thisMs) / 60000))
      : 0;

    return {
      groups, worked, groupColor, strength,
      wentWell: wentWell.slice(0, 3), nextTime: nextTime.slice(0, 3),
      durationMin, totalSets, hasData: totalSets > 0,
    };
  }, [completedWorkout, history, exercisesList]);

  const dateStr = new Date(completedWorkout.startTime).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const durLabel = `${m.durationMin} min${m.durationMin === 1 ? "" : "s"}`;

  const handleSave = () => {
    onSaveAnalysis({ wentWell: m.wentWell, nextTime: m.nextTime, generatedAt: Date.now(), v: 2 });
    onClose();
  };

  const trendColor = (t: string) => (t === "up" ? "var(--m3-success)" : t === "down" ? "var(--m3-error)" : "var(--m3-on-dim)");

  return (
    <motion.div className="pbw-ca" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="body">
        <div className="ovhd">
          <button className="back" onClick={onClose} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div>
            <div className="eyb">Coach analysis</div>
            <div className="ovname">{completedWorkout.name}</div>
            <div className="ovsub">{dateStr} · {durLabel}</div>
          </div>
        </div>

        {!m.hasData ? (
          <div className="caempty">
            <div className="ei">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
            </div>
            <h3>Nothing logged to analyse</h3>
            <p>This session has no completed sets, so there is nothing to read yet. Log a few sets and the coach analysis will have something to work with.</p>
          </div>
        ) : (
          <>
            {/* Coach summary — AI surface (model writes the prose, backend-gated) */}
            <div className="summary">
              <ISpark />
              <p className="castate">The written coach read appears here once analysis is set up. Your session numbers below are live.</p>
            </div>

            {/* Muscles worked — coarse, deterministic */}
            <div className="sec">Muscles worked</div>
            <div className="card">
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
                    <MuscleFigure view={view} color={m.groupColor} />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="legend">
                <span className="lg"><i style={{ background: "#9a6cff" }} />High</span>
                <span className="lg"><i style={{ background: "rgba(139,92,255,.4)" }} />Moderate</span>
                <span className="lg"><i style={{ background: "rgba(139,92,255,.2)" }} />Light</span>
              </div>
              <div className="grouplist">
                {m.worked.map((g) => (
                  <div key={g.name} className="grow">
                    <div className="gtop">
                      <span className="gnm">{g.name}</span>
                      <span className="gset">{g.sets} set{g.sets === 1 ? "" : "s"} · {g.bucket}</span>
                    </div>
                    <div className="gbar"><span style={{ width: `${Math.max(8, Math.round(g.ratio * 100))}%`, background: g.color || "transparent" }} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strength this session */}
            <div className="sec">Strength this session</div>
            <div className="card">
              {m.strength.map((s, i) => (
                <div key={i} className="srow">
                  <div className="shd">
                    <span className="snm">{s.name}</span>
                    <span className="stag">{s.isBW ? "Bodyweight" : "Weighted"}</span>
                  </div>
                  <div className="scmp">
                    <div className="scol">
                      <div className="scl">Previous best</div>
                      <div className="scv">{s.prevStr}</div>
                    </div>
                    <div className="sarrow"><RightArrow /></div>
                    <div className="scol">
                      <div className="scl">This session</div>
                      <div className="scv now">{s.thisStr}</div>
                    </div>
                    <div className="sdelta" style={{ color: trendColor(s.trend) }}>
                      {s.trend === "up" ? <ArrowUp /> : s.trend === "down" ? <ArrowDown /> : <Flat />}
                      <span>
                        {s.trend === "up" ? `Up ${s.isBW ? `${s.deltaAmt} reps` : `${Math.round(s.deltaAmt)} kg`}`
                          : s.trend === "down" ? `Down ${s.isBW ? `${s.deltaAmt} reps` : `${Math.round(s.deltaAmt)} kg`}`
                          : s.trend === "matched" ? "Matched" : "First session"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* What went well */}
            <div className="sec">What went well</div>
            <div className="card bcard">
              {m.wentWell.map((b, i) => (
                <div key={i} className="bullet"><b>{b.b}</b> {b.t}</div>
              ))}
            </div>

            {/* Next time */}
            <div className="sec">Next time</div>
            <div className="card bcard">
              {m.nextTime.map((b, i) => (
                <div key={i} className="bullet"><b>{b.b}</b> {b.t}</div>
              ))}
            </div>

            <Button variant="none" className="savebtn" onClick={handleSave}>
              <ISpark /> Save to history
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}
