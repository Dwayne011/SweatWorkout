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
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { WorkoutSession, Exercise } from "../types";
import { Button } from "./ui/Button";
import { coachWorkout, AiError } from "../aiClient";
import { muscleMap, CATEGORY_FALLBACK, MUSCLE_LABEL, MUSCLE_PARENT, Muscle } from "../data/muscleMap";

interface CoachAnalysisProps {
  completedWorkout: WorkoutSession;
  history: WorkoutSession[];
  exercisesList: Exercise[];
  onClose: () => void;
  onSaveAnalysis: (analysis: any) => void;
}

// The per-workout coach call lives in aiClient.coachWorkout: it POSTs the
// deterministic metrics (computed below) to the backend proxy at the ABSOLUTE
// base URL with the Firebase ID token, and the model only interprets them into
// the prose summary, returning structured JSON so nothing like ** can leak in.
// wentWell/nextTime stay deterministic below; only `summary` is the AI surface.
type SummaryState = "loading" | "ready" | "off" | "error";

const startMs = (s: WorkoutSession) => new Date(s.startTime).getTime();
const fmtDur = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

// Granular front/back figures. Each shape is keyed to a sub-muscle region; its
// fill is that region's bucket colour (from the per-muscle scores), and
// untouched regions + outline use currentColor so the figure reads in dark +
// light. Only the violet intensities are literals.
function MuscleFigure({ view, color }: { view: "front" | "back"; color: Record<string, string> }) {
  const f = (m: Muscle) => {
    const c = color[m];
    return c ? { fill: c } : { fill: "currentColor", fillOpacity: 0.05 };
  };
  const base = { fill: "currentColor", fillOpacity: 0.05 };
  if (view === "front") {
    return (
      <svg className="fig" viewBox="0 0 360 470" width="190">
        <g stroke="currentColor" strokeOpacity={0.12} strokeWidth={1.5}>
          <circle cx="180" cy="42" r="22" {...base} />
          <rect x="170" y="62" width="20" height="14" rx="6" {...base} />
          {/* traps (front, upper) */}
          <path d="M160 70 L132 94 L152 96 L174 78 Z" {...f("traps")} />
          <path d="M200 70 L228 94 L208 96 L186 78 Z" {...f("traps")} />
          {/* side + front delts */}
          <ellipse cx="100" cy="116" rx="12" ry="17" {...f("delt_side")} />
          <ellipse cx="260" cy="116" rx="12" ry="17" {...f("delt_side")} />
          <ellipse cx="120" cy="108" rx="20" ry="16" {...f("delt_front")} />
          <ellipse cx="240" cy="108" rx="20" ry="16" {...f("delt_front")} />
          {/* chest: upper / mid / lower */}
          <rect x="142" y="96" width="36" height="13" rx="5" {...f("chest_upper")} />
          <rect x="182" y="96" width="36" height="13" rx="5" {...f("chest_upper")} />
          <rect x="142" y="111" width="36" height="13" rx="5" {...f("chest_mid")} />
          <rect x="182" y="111" width="36" height="13" rx="5" {...f("chest_mid")} />
          <rect x="142" y="126" width="36" height="14" rx="6" {...f("chest_lower")} />
          <rect x="182" y="126" width="36" height="14" rx="6" {...f("chest_lower")} />
          {/* biceps + forearms */}
          <rect x="104" y="126" width="22" height="54" rx="11" {...f("biceps")} />
          <rect x="234" y="126" width="22" height="54" rx="11" {...f("biceps")} />
          <rect x="101" y="184" width="20" height="56" rx="10" {...f("forearms")} />
          <rect x="239" y="184" width="20" height="56" rx="10" {...f("forearms")} />
          {/* obliques + abs */}
          <rect x="140" y="150" width="12" height="56" rx="5" {...f("obliques")} />
          <rect x="208" y="150" width="12" height="56" rx="5" {...f("obliques")} />
          <rect x="154" y="148" width="52" height="29" rx="9" {...f("abs")} />
          <rect x="154" y="180" width="52" height="29" rx="9" {...f("abs")} />
          {/* quads + adductors */}
          <rect x="144" y="224" width="26" height="96" rx="13" {...f("quads")} />
          <rect x="190" y="224" width="26" height="96" rx="13" {...f("quads")} />
          <rect x="170" y="228" width="9" height="66" rx="4" {...f("adductors")} />
          <rect x="181" y="228" width="9" height="66" rx="4" {...f("adductors")} />
          {/* lower legs (shin, no region) */}
          <rect x="150" y="326" width="26" height="84" rx="13" {...base} />
          <rect x="184" y="326" width="26" height="84" rx="13" {...base} />
        </g>
      </svg>
    );
  }
  return (
    <svg className="fig" viewBox="0 0 360 470" width="190">
      <g stroke="currentColor" strokeOpacity={0.12} strokeWidth={1.5}>
        <circle cx="180" cy="42" r="22" {...base} />
        {/* traps (back, upper diamond) */}
        <path d="M150 116 L180 80 L210 116 L196 138 L164 138 Z" {...f("traps")} />
        {/* side + rear delts */}
        <ellipse cx="100" cy="116" rx="12" ry="17" {...f("delt_side")} />
        <ellipse cx="260" cy="116" rx="12" ry="17" {...f("delt_side")} />
        <ellipse cx="120" cy="110" rx="20" ry="16" {...f("delt_rear")} />
        <ellipse cx="240" cy="110" rx="20" ry="16" {...f("delt_rear")} />
        {/* upper back (rhomboids / mid traps) */}
        <rect x="156" y="138" width="48" height="34" rx="8" {...f("upper_back")} />
        {/* lats */}
        <path d="M152 146 C140 178 152 206 178 214 L180 150 Z" {...f("lats")} />
        <path d="M208 146 C220 178 208 206 182 214 L180 150 Z" {...f("lats")} />
        {/* lower back (erectors) */}
        <rect x="165" y="206" width="30" height="40" rx="8" {...f("lower_back")} />
        {/* triceps + forearms */}
        <rect x="104" y="126" width="22" height="54" rx="11" {...f("triceps")} />
        <rect x="234" y="126" width="22" height="54" rx="11" {...f("triceps")} />
        <rect x="101" y="184" width="20" height="54" rx="10" {...f("forearms")} />
        <rect x="239" y="184" width="20" height="54" rx="10" {...f("forearms")} />
        {/* glutes */}
        <ellipse cx="165" cy="252" rx="22" ry="18" {...f("glutes")} />
        <ellipse cx="195" cy="252" rx="22" ry="18" {...f("glutes")} />
        {/* hamstrings */}
        <rect x="146" y="270" width="32" height="78" rx="15" {...f("hamstrings")} />
        <rect x="182" y="270" width="32" height="78" rx="15" {...f("hamstrings")} />
        {/* calves */}
        <rect x="150" y="352" width="26" height="74" rx="13" {...f("calves")} />
        <rect x="184" y="352" width="26" height="74" rx="13" {...f("calves")} />
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

    // Per sub-muscle scoring from the curated map. A completed set adds its full
    // count to each PRIMARY muscle and half to each SECONDARY one (score drives
    // the shade); `muscleSets` is the plain count of sets that touched the
    // muscle at all (shown in the list). Unmapped exercises fall back to their
    // coarse category. The model never sees this — it's all deterministic.
    const muscleScore: Record<string, number> = {};
    const muscleSets: Record<string, number> = {};
    let totalSets = 0;
    (completedWorkout.exercises || []).forEach((we) => {
      const done = (we.sets || []).filter((s) => s.isCompleted);
      if (!done.length) return;
      totalSets += done.length;
      const map = muscleMap[we.exerciseId];
      const primaries = map ? map.primary : (CATEGORY_FALLBACK[catOf(we.exerciseId)] || []);
      const secondaries = map ? (map.secondary || []) : [];
      primaries.forEach((mu) => {
        muscleScore[mu] = (muscleScore[mu] || 0) + done.length;
        muscleSets[mu] = (muscleSets[mu] || 0) + done.length;
      });
      secondaries.forEach((mu) => {
        muscleScore[mu] = (muscleScore[mu] || 0) + done.length * 0.5;
        muscleSets[mu] = (muscleSets[mu] || 0) + done.length;
      });
    });
    const maxScore = Math.max(1, ...Object.values(muscleScore));
    const muscleColor: Record<string, string> = {};
    const worked = (Object.keys(muscleScore) as Muscle[])
      .map((mu) => {
        const ratio = muscleScore[mu] / maxScore;
        let bucket: string, color: string;
        if (ratio >= 0.7) { bucket = "High"; color = "#9a6cff"; }
        else if (ratio >= 0.35) { bucket = "Moderate"; color = "rgba(139,92,255,.45)"; }
        else { bucket = "Light"; color = "rgba(139,92,255,.2)"; }
        muscleColor[mu] = color;
        return { key: mu, name: MUSCLE_LABEL[mu], parent: MUSCLE_PARENT[mu], sets: muscleSets[mu], ratio, bucket, color };
      })
      .sort((a, b) => b.ratio - a.ratio || b.sets - a.sets);

    const thisMs = startMs(completedWorkout);

    // (w7b) Cardio is summarised on duration + estimated calories, not as a
    // strength row. Bodyweight comes from the saved profile (default 70 kg).
    let bodyweightKg = 70;
    try { const p = JSON.parse(localStorage.getItem("projectpb_user_profile") || "null"); if (p && Number(p.weightKg)) bodyweightKg = Number(p.weightKg); } catch { /* ignore */ }
    let cardioSeconds = 0, cardioCalories = 0, cardioCount = 0;
    (completedWorkout.exercises || []).forEach((we) => {
      const ex = exById.get(we.exerciseId);
      if (!(ex?.modality === "CARDIO" || ex?.category === "Cardio")) return;
      const done = (we.sets || []).filter((s) => s.isCompleted);
      if (!done.length) return;
      cardioCount += 1;
      const met = Number(ex?.metValue) || 7;
      done.forEach((s) => {
        const secs = Number(s.duration) || 0;
        cardioSeconds += secs;
        cardioCalories += met * bodyweightKg * (secs / 3600);
      });
    });
    const cardio = cardioCount > 0 ? { seconds: cardioSeconds, calories: Math.round(cardioCalories), count: cardioCount } : null;

    // strength: previous best (from past sessions) vs this session. Cardio excluded.
    const strength = (completedWorkout.exercises || []).map((we) => {
      const ex = exById.get(we.exerciseId);
      if (ex?.modality === "CARDIO" || ex?.category === "Cardio") return null;
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
      worked, muscleColor, strength, cardio,
      wentWell: wentWell.slice(0, 3), nextTime: nextTime.slice(0, 3),
      durationMin, totalSets, hasData: totalSets > 0,
    };
  }, [completedWorkout, history, exercisesList]);

  const dateStr = new Date(completedWorkout.startTime).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const durLabel = `${m.durationMin} min${m.durationMin === 1 ? "" : "s"}`;

  // Written coach read — the one AI surface on this screen. The model only ever
  // sees the deterministic facts below and writes a single line over them.
  const [summaryState, setSummaryState] = useState<SummaryState>("loading");
  const [summaryText, setSummaryText] = useState("");
  const [offNote, setOffNote] = useState(
    "The written coach read appears here once analysis is set up. Your session numbers below are live."
  );

  const runSummary = useCallback(async () => {
    setSummaryState("loading");
    try {
      const res = await coachWorkout({
        workoutName: completedWorkout.name,
        date: dateStr,
        durationMin: m.durationMin,
        totalSets: m.totalSets,
        groups: m.worked.map((g) => ({ name: g.name, sets: g.sets, intensity: g.bucket })),
        strength: m.strength.map((s) => ({
          name: s.name,
          kind: s.isBW ? "bodyweight" : "weighted",
          thisSession: s.thisStr,
          previousBest: s.prevStr,
          trend: s.trend,
        })),
        cardio: m.cardio
          ? { exercises: m.cardio.count, totalSeconds: m.cardio.seconds, estimatedCalories: m.cardio.calories }
          : null,
      });
      const text = (res.summary || "").trim();
      if (text) { setSummaryText(text); setSummaryState("ready"); }
      else setSummaryState("off");
    } catch (e) {
      if (e instanceof AiError && e.code === "not_configured") {
        setOffNote("The written coach read appears here once analysis is set up. Your session numbers below are live.");
        setSummaryState("off");
      } else if (e instanceof AiError && e.code === "auth_required") {
        setOffNote("Sign in to get your written coach read. Your session numbers below are live.");
        setSummaryState("off");
      } else {
        setSummaryState("error");
      }
    }
  }, [completedWorkout.name, dateStr, m.durationMin, m.totalSets, m.worked, m.strength]);

  useEffect(() => {
    if (!m.hasData) return;
    let cancelled = false;
    setSummaryState("loading");
    setSummaryText("");
    runSummary().catch(() => { if (!cancelled) setSummaryState("error"); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedWorkout.id, m.hasData]);

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
              {summaryState === "loading" ? (
                <div style={{ flex: 1 }}>
                  <div className="caload" style={{ width: "100%" }} />
                  <div className="caload" style={{ width: "70%" }} />
                </div>
              ) : summaryState === "ready" ? (
                <p className="castate" style={{ color: "var(--m3-on)" }}>{summaryText}</p>
              ) : summaryState === "error" ? (
                <div style={{ flex: 1 }}>
                  <p className="castate err">Couldn't load the written read just now. Your session numbers below are live.</p>
                  <button className="caretry" onClick={() => { void runSummary(); }}>Try again</button>
                </div>
              ) : (
                <p className="castate">{offNote}</p>
              )}
            </div>

            {/* Muscles worked — granular sub-muscles, deterministic */}
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
                    <MuscleFigure view={view} color={m.muscleColor} />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="legend">
                <span className="lg"><i style={{ background: "#9a6cff" }} />High</span>
                <span className="lg"><i style={{ background: "rgba(139,92,255,.45)" }} />Moderate</span>
                <span className="lg"><i style={{ background: "rgba(139,92,255,.2)" }} />Light</span>
              </div>
              <div className="grouplist">
                {m.worked.map((g) => (
                  <div key={g.key} className="grow">
                    <div className="gtop">
                      <span className="gnm">{g.name}</span>
                      <span className="gset">{g.sets} set{g.sets === 1 ? "" : "s"} · {g.bucket}</span>
                    </div>
                    <div className="gbar"><span style={{ width: `${Math.max(8, Math.round(g.ratio * 100))}%`, background: g.color || "transparent" }} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cardio this session (w7b) — duration + estimated calories, not a strength row */}
            {m.cardio && (
              <>
                <div className="sec">Cardio this session</div>
                <div className="card cardiocard">
                  <div className="crow">
                    <div className="ck">Total time</div>
                    <div className="cv">{fmtDur(m.cardio.seconds)}</div>
                  </div>
                  <div className="crow">
                    <div className="ck">Calories <span className="cest">est</span></div>
                    <div className="cv">~{m.cardio.calories} kcal</div>
                  </div>
                  <p className="cnote">A rough estimate, from a generic effort level and your body weight. Real burn depends on your intensity, heart rate, terrain, age, and technique.</p>
                </div>
              </>
            )}

            {/* Strength this session */}
            {m.strength.length > 0 && (<>
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
            </>)}

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
