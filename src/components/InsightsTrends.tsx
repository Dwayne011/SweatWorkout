/**
 * History · Insights & trends tab.
 *
 * Aggregate read across all logged workouts, built to the history-page mockup
 * (option-3). Every deterministic metric (volume, streak, frequency, calendar,
 * est-1RM, muscle split) is computed client-side from the real workout history.
 *
 * The two AI surfaces are deliberately distinct:
 *   - "Ask the coach"  — on-demand all-time readout (user presses it).
 *   - "Coach notes"    — passive auto observations (deterministic for now).
 *
 * TODO(data-model / AI): the per-call request + response shapes for the Gemini
 * coach are not wired here — they go through the backend proxy with an absolute
 * base URL once the exercise/set model and prompt contracts are finalised. Keep
 * those shapes in one place (the ai service), never a relative /api path, never
 * the Gemini key on the client. This file only renders the UI + states.
 */
import React, { useMemo, useState } from "react";
import { WorkoutSession, Exercise } from "../types";

interface InsightsTrendsProps {
  history: WorkoutSession[];
  exercisesList: Exercise[];
  onAskGemini: (prompt: string) => void;
}

const DAY = 86400000;

// ---- exact mockup icons (stroke) -------------------------------------------
const Stroke = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const ISpark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5 13.7 8 19 9.5 13.7 11 12 16.5 10.3 11 5 9.5 10.3 8 12 2.5Zm6.5 9 .9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" /></svg>
);
const IconCal = () => <Stroke><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></Stroke>;
const IconTrend = () => <Stroke><path d="M3 17l6-6 4 4 8-8" /><path d="M21 7h-5M21 7v5" /></Stroke>;
const IconMuscle = () => <Stroke><path d="M12 3v18M5 21h14M7 7l-4 7a4 4 0 0 0 8 0L7 7zM17 7l-4 7a4 4 0 0 0 8 0l-4-7zM5 7h14" /></Stroke>;
const IconLeaf = () => <Stroke><path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 11-9 1 4-1 11-4 16zM4 13c5 0 8-3 10-6" /></Stroke>;
const IconClock = () => <Stroke><path d="M3 9a9 9 0 1 1 .7 4.5" /><path d="M3 4v5h5M12 8v4l3 2" /></Stroke>;
const IconFlame = () => <Stroke><path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 2 2c0-3 2-5 2-8z" /></Stroke>;
const IconRefresh = () => <Stroke><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></Stroke>;
const ChevR = () => <Stroke><path d="M9 6l6 6-6 6" /></Stroke>;

// muscle groups in the mockup's fixed order + palette
const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"];
const MUSCLE_COLOR: Record<string, string> = {
  Chest: "var(--m3-primary-fill)",
  Back: "var(--m3-success)",
  Legs: "var(--m3-gold)",
  Shoulders: "var(--m3-error)",
  Arms: "var(--m3-primary)",
  Core: "var(--m3-primary)",
  Cardio: "var(--m3-success)",
};

const completedSets = (s: WorkoutSession) =>
  (s.exercises || []).flatMap((e) => (e.sets || []).filter((set) => set.isCompleted));
const setVolume = (set: any) => (Number(set.weight) || 0) * (Number(set.reps) || 0);
const est1RM = (w: number, reps: number) => w * (1 + reps / 30); // Epley
const startMs = (s: WorkoutSession) => new Date(s.startTime).getTime();

function sparkPath(values: number[]) {
  const W = 80, H = 28, pad = 4;
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const n = values.length;
  const pts = values.map((v, i) => {
    const x = 2 + (i / (n - 1)) * (W - 4);
    const y = H - pad - ((v - min) / range) * (H - 2 * pad);
    return [x, y] as const;
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return { d, last: pts[pts.length - 1] };
}

export default function InsightsTrends({ history, exercisesList, onAskGemini }: InsightsTrendsProps) {
  const [askState, setAskState] = useState<"idle" | "loading">("idle");
  const [notesStamp, setNotesStamp] = useState(0); // refresh tick

  const exName = (id: string) => exercisesList.find((e) => e.id === id)?.name || id;
  const exCategory = (id: string) => exercisesList.find((e) => e.id === id)?.category || "Other";

  const metrics = useMemo(() => {
    const now = Date.now();
    const sorted = [...history].sort((a, b) => startMs(a) - startMs(b));

    // weekly volume buckets (rolling 7-day windows back from now)
    const volIn = (fromDaysAgo: number, toDaysAgo: number) =>
      sorted
        .filter((s) => { const age = now - startMs(s); return age >= toDaysAgo * DAY && age < fromDaysAgo * DAY; })
        .reduce((a, s) => a + completedSets(s).reduce((x, set) => x + setVolume(set), 0), 0);
    const thisWeekVol = volIn(7, 0);
    const lastWeekVol = volIn(14, 7);
    const wow = lastWeekVol > 0 ? Math.round(((thisWeekVol - lastWeekVol) / lastWeekVol) * 100) : null;

    // streak: consecutive 7-day windows (back from now) that have >=1 workout
    let streak = 0;
    for (let w = 0; w < 104; w++) {
      const has = sorted.some((s) => { const age = now - startMs(s); return age >= w * 7 * DAY && age < (w + 1) * 7 * DAY; });
      if (has) streak++;
      else if (w === 0) { /* current week empty — streak stays 0 */ break; }
      else break;
    }

    // sessions per week, averaged over the active span
    let perWeek = 0;
    if (sorted.length > 0) {
      const spanDays = Math.max(7, (now - startMs(sorted[0])) / DAY);
      perWeek = Math.round((history.length / (spanDays / 7)) * 10) / 10;
    }

    // focus muscle — most-trained group by completed-set count, all time
    const groupCountAll: Record<string, number> = {};
    sorted.forEach((s) =>
      (s.exercises || []).forEach((e) => {
        const cat = exCategory(e.exerciseId);
        const c = (e.sets || []).filter((set) => set.isCompleted).length;
        groupCountAll[cat] = (groupCountAll[cat] || 0) + c;
      })
    );
    const focus = Object.entries(groupCountAll).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    // last-30-days calendar
    const workoutDays = new Set(
      sorted.map((s) => new Date(s.startTime).toDateString())
    );
    const cal = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now - (29 - i) * DAY);
      return { day: d.getDate(), wk: workoutDays.has(d.toDateString()), today: i === 29 };
    });

    // muscle split — last 30 days completed working sets per group
    const since30 = now - 30 * DAY;
    const groupCount30: Record<string, number> = {};
    let total30 = 0;
    sorted.filter((s) => startMs(s) >= since30).forEach((s) =>
      (s.exercises || []).forEach((e) => {
        const cat = exCategory(e.exerciseId);
        const c = (e.sets || []).filter((set) => set.isCompleted).length;
        if (c > 0) { groupCount30[cat] = (groupCount30[cat] || 0) + c; total30 += c; }
      })
    );
    const maxGroup = Math.max(1, ...MUSCLE_GROUPS.map((g) => groupCount30[g] || 0));
    const split = MUSCLE_GROUPS.map((g) => {
      const c = groupCount30[g] || 0;
      return { name: g, sets: c, pct: total30 ? Math.round((c / total30) * 100) : 0, width: Math.round((c / maxGroup) * 100), color: MUSCLE_COLOR[g] };
    });

    // strength overview — per exercise est-1RM series (or BW reps)
    const byEx: Record<string, { date: number; oneRm: number; reps: number; weighted: boolean }[]> = {};
    sorted.forEach((s) =>
      (s.exercises || []).forEach((e) => {
        const done = (e.sets || []).filter((set) => set.isCompleted);
        if (done.length === 0) return;
        const weighted = done.some((set) => (Number(set.weight) || 0) > 0);
        const best = weighted
          ? Math.max(...done.map((set) => est1RM(Number(set.weight) || 0, Number(set.reps) || 0)))
          : Math.max(...done.map((set) => Number(set.reps) || 0));
        (byEx[e.exerciseId] ||= []).push({ date: startMs(s), oneRm: best, reps: best, weighted });
      })
    );
    const strength = Object.entries(byEx)
      .map(([id, series]) => {
        series.sort((a, b) => a.date - b.date);
        const vals = series.map((p) => p.oneRm);
        const weighted = series[series.length - 1].weighted;
        const first = vals[0], last = vals[vals.length - 1];
        let delta: string, up: boolean;
        if (weighted) {
          const pc = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
          delta = pc > 0 ? `↑ +${pc}%` : pc < 0 ? `↓ ${pc}%` : "· flat";
          up = pc > 0;
        } else {
          const dr = Math.round(last - first);
          delta = dr > 0 ? `↑ +${dr} reps` : dr < 0 ? `↓ ${dr} reps` : "· flat";
          up = dr > 0;
        }
        return {
          id, name: exName(id), weighted,
          cur: weighted ? `${Math.round(last)} kg` : `BW×${Math.round(last)}`,
          delta, up, spark: sparkPath(vals.slice(-8)),
        };
      })
      .sort((a, b) => Number(b.up) - Number(a.up))
      .slice(0, 6);

    // coach notes — deterministic observations from the metrics
    const notes: { title: string; body: string }[] = [];
    const topSplit = [...split].filter((s) => s.sets > 0).sort((a, b) => b.sets - a.sets)[0];
    if (topSplit && topSplit.pct >= 35) {
      notes.push({ title: `Splits are ${topSplit.name.toLowerCase()}-heavy`, body: `${topSplit.name} is carrying ${topSplit.pct}% of your sets right now. If you want a more even spread, a little more of the other groups would balance it out.` });
    }
    const climbing = strength.find((s) => s.up);
    if (climbing) {
      notes.push({ title: `${climbing.name} is climbing`, body: `Your ${climbing.name.toLowerCase()} is trending up (${climbing.delta.replace("↑ ", "")}). Keep the weekly jumps small and it holds.` });
    }
    if (notes.length === 0 && history.length > 0) {
      notes.push({ title: "Keep logging", body: "Log a few more sessions and your trends, splits, and strength curves will fill in here." });
    }

    return { thisWeekVol, wow, streak, perWeek, focus, cal, split, total30, strength, notes };
  }, [history, exercisesList, notesStamp]);

  const fmtVol = (n: number) => n.toLocaleString("en-US");

  const handleAsk = () => {
    setAskState("loading");
    // TODO(AI): replace with the all-time coach call through the backend proxy.
    onAskGemini(
      "Give me an all-time read on my training so far — my splits, my consistency, and where my strength is going. Plain coaching language, no clinical terms."
    );
    try { window.dispatchEvent(new CustomEvent("open-gemini-drawer")); } catch {}
    setTimeout(() => setAskState("idle"), 600);
  };

  return (
    <div>
      {/* 1 — Ask the coach */}
      <div className="pbw-askcard">
        <div className="askhd">
          <span className="aci"><ISpark /></span>
          <div className="actitle">Your coach</div>
        </div>
        <p className="askbody">A read on your training so far. Your splits, your consistency, and where your strength is going.</p>
        <button className="pbw-askbtn" onClick={handleAsk} disabled={askState === "loading"}>
          {askState === "loading" ? <span className="pbw-spin" /> : <ISpark />} Ask the coach
        </button>
      </div>

      {/* 2 — Four stat tiles */}
      <div className="pbw-tiles">
        <div className="pbw-tile">
          <div className="tlab">This week · volume</div>
          <div className="tnum">{fmtVol(metrics.thisWeekVol)}<span className="tu">kg</span></div>
          {metrics.wow === null ? (
            <div className="tsub">First week tracked</div>
          ) : (
            <div className={`tsub${metrics.wow > 0 ? " up" : ""}`}>{metrics.wow >= 0 ? "↑" : "↓"} {Math.abs(metrics.wow)}% vs last week</div>
          )}
        </div>
        <div className="pbw-tile">
          <div className="tlab">Streak</div>
          <div className="tnum">{metrics.streak}<span className="tu">wks</span></div>
          <div className="tsub"><span className="tflame"><IconFlame /></span> Working weeks in a row</div>
        </div>
        <div className="pbw-tile">
          <div className="tlab">Per week</div>
          <div className="tnum">{metrics.perWeek}<span className="tu">sessions</span></div>
          <div className="tsub">Your average frequency</div>
        </div>
        <div className="pbw-tile">
          <div className="tlab">Focus muscle</div>
          <div className="tnum tnumsm">{metrics.focus}</div>
          <div className="tsub">Most-trained group</div>
        </div>
      </div>

      {/* 3 — Last 30 days */}
      <div className="pbw-icard">
        <div className="cardhd">
          <span className="ci"><IconCal /></span>
          <div><div className="ct">Last 30 days</div><div className="csub">Workout days vs rest</div></div>
        </div>
        <div className="pbw-calgrid">
          {metrics.cal.map((c, i) => (
            <div key={i} className={`pbw-cd${c.wk ? " wk" : ""}${c.today ? " today" : ""}`}>{c.day}</div>
          ))}
        </div>
        <div className="pbw-calleg">
          <span className="lg"><span className="dot wk" />Workout</span>
          <span className="lg"><span className="dot" />Rest</span>
        </div>
      </div>

      {/* 4 — Strength overview */}
      <div className="pbw-icard">
        <div className="cardhd">
          <span className="ci"><IconTrend /></span>
          <div><div className="ct">Strength</div><div className="csub">Every lift, trending · last 8 weeks</div></div>
          <span className="hdtoggle">1RM</span>
        </div>
        {metrics.strength.length === 0 ? (
          <p className="pbw-aistate">No weighted working sets logged yet. Track a few sessions and your lifts will trend here.</p>
        ) : (
          <>
            <div className="pbw-ovlist">
              {metrics.strength.map((s) => (
                <button key={s.id} className="pbw-ovrow" onClick={() => onAskGemini(`How is my ${s.name} progressing, and what should I do next? Plain coaching language.`)}>
                  <div className="ovmain">
                    <div className="ovnm">{s.name}</div>
                    <div className="ovd">
                      <span className="ovcur">{s.cur}</span>
                      <span className="ovdelta" style={{ color: s.up ? "var(--m3-success)" : "var(--m3-on-dim)" }}>{s.delta}</span>
                    </div>
                  </div>
                  {s.spark && (
                    <span className="ovspark">
                      <svg viewBox="0 0 80 28" width="80" height="28" style={{ display: "block" }}>
                        <path d={s.spark.d} fill="none" stroke={s.up ? "var(--m3-success)" : "var(--m3-on-dim)"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx={s.spark.last[0]} cy={s.spark.last[1]} r="2.5" fill={s.up ? "var(--m3-success)" : "var(--m3-on-dim)"} />
                      </svg>
                    </span>
                  )}
                  <span className="ovchev"><ChevR /></span>
                </button>
              ))}
            </div>
            <div className="pbw-ovfoot">Tap a lift to open its full curve.</div>
          </>
        )}
      </div>

      {/* 6 — Muscle split */}
      <div className="pbw-icard">
        <div className="cardhd">
          <span className="ci"><IconMuscle /></span>
          <div><div className="ct">Muscle split</div><div className="csub">Sets per group · last 30 days</div></div>
        </div>
        <div className="pbw-mlist">
          {metrics.split.map((m) => (
            <div key={m.name} className="mrow">
              <div className="mtop">
                <span className="mnm" style={m.sets === 0 ? { opacity: 0.5 } : undefined}>{m.name}</span>
                <span className="mval">{m.sets} sets ({m.pct}%)</span>
              </div>
              <div className="mbar"><span className="mfill" style={{ width: `${m.width}%`, background: m.sets === 0 ? "transparent" : m.color }} /></div>
            </div>
          ))}
        </div>
        <div className="pbw-mnote"><IconClock /><span>Counts every working set you logged in the last 30 days.</span></div>
      </div>

      {/* 7 — Coach notes */}
      <div className="pbw-icard notescard">
        <div className="cardhd">
          <span className="ci notesic"><IconLeaf /></span>
          <div><div className="ct">Coach notes</div><div className="csub">Updated today</div></div>
          <button className="pbw-refresh" onClick={() => setNotesStamp((t) => t + 1)} aria-label="Refresh notes"><IconRefresh /></button>
        </div>
        {metrics.notes.length === 0 ? (
          <p className="pbw-aistate">No observations yet. They appear once you have a bit of history.</p>
        ) : (
          metrics.notes.map((n, i) => (
            <div key={i} className="pbw-note"><div className="ntitle">{n.title}</div><p>{n.body}</p></div>
          ))
        )}
      </div>
    </div>
  );
}
