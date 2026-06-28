// Author: Google AI Studio Coding Agent
// OS support: All (Web, Android, iOS)
// Description: Onboarding and profile editing screen for athlete metrics management.
import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { motion } from "motion/react";
import { Check, Ruler, Scale, User, Target, ChevronDown } from "lucide-react";

interface OnboardingProfileProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

const kgToLbs = (kg: number) => kg * 2.20462;
const lbsToKg = (lbs: number) => lbs / 2.20462;
const cmToInches = (cm: number) => cm / 2.54;
const inchesToCm = (inches: number) => inches * 2.54;

const formatImperialHeight = (totalInches: number) => {
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${ft}' ${inches}"`;
};

export default function OnboardingProfile({ onComplete, initialProfile }: OnboardingProfileProps) {
  const [preferredUnits, setPreferredUnits] = useState<"Metric" | "Imperial">(
    initialProfile?.preferredUnits || "Metric"
  );
  const [biologicalSex, setBiologicalSex] = useState<UserProfile["biologicalSex"]>(
    initialProfile?.biologicalSex || "Prefer not to say"
  );
  const [age, setAge] = useState<number>(initialProfile?.age || 30);
  const [heightCm, setHeightCm] = useState<number>(initialProfile?.heightCm || 170);
  const [weightKg, setWeightKg] = useState<number>(initialProfile?.weightKg || 70);
  const [primaryGoal, setPrimaryGoal] = useState<UserProfile["primaryGoal"]>(
    initialProfile?.primaryGoal || "General Fitness"
  );

  const [ageInput, setAgeInput] = useState<string>((initialProfile?.age || 30).toString());
  const [heightInput, setHeightInput] = useState<string>(
    (initialProfile?.preferredUnits || "Metric") === "Metric"
      ? (initialProfile?.heightCm || 170).toString()
      : Math.round(cmToInches(initialProfile?.heightCm || 170)).toString()
  );
  const [weightInput, setWeightInput] = useState<string>(
    (initialProfile?.preferredUnits || "Metric") === "Metric"
      ? (initialProfile?.weightKg || 70).toString()
      : Math.round(kgToLbs(initialProfile?.weightKg || 70)).toString()
  );

  useEffect(() => {
    if (preferredUnits === "Metric") {
      setHeightInput(Math.round(heightCm).toString());
      setWeightInput(Math.round(weightKg).toString());
    } else {
      setHeightInput(Math.round(cmToInches(heightCm)).toString());
      setWeightInput(Math.round(kgToLbs(weightKg)).toString());
    }
  }, [preferredUnits]);

  const handleSubmit = () => {
    let finalAge = age;
    if (finalAge === 0) finalAge = 30;
    else finalAge = Math.max(12, Math.min(100, finalAge));

    let finalHeight = heightCm;
    if (finalHeight === 0) finalHeight = 170;
    else finalHeight = Math.max(120, Math.min(230, finalHeight));

    let finalWeight = weightKg;
    if (finalWeight === 0) finalWeight = 70;
    else finalWeight = Math.max(40, Math.min(200, finalWeight));

    onComplete({
      biologicalSex,
      age: finalAge,
      heightCm: finalHeight,
      weightKg: finalWeight,
      primaryGoal,
      preferredUnits
    });
  };

  // Metric step configurations
  const metricWeightConfig = { min: 40, max: 200, step: 0.5 };
  const metricHeightConfig = { min: 120, max: 230, step: 1 };

  // Imperial step configurations (visual only)
  const imperialWeightConfig = { min: 88, max: 440, step: 1 };
  const imperialHeightConfig = { min: 47, max: 90, step: 1 };

  // Slider fill / thumb positions (0-100%)
  const agePct = Math.max(0, Math.min(100, ((age - 12) / 88) * 100));
  const heightPct = Math.max(0, Math.min(100,
    preferredUnits === "Metric"
      ? ((heightCm - 120) / 110) * 100
      : ((cmToInches(heightCm) - 47) / 43) * 100
  ));
  const weightPct = Math.max(0, Math.min(100,
    preferredUnits === "Metric"
      ? ((weightKg - 40) / 160) * 100
      : ((kgToLbs(weightKg) - 88) / 352) * 100
  ));

  const goals: UserProfile["primaryGoal"][] = [
    "Hypertrophy", "Strength", "Cardiovascular Endurance", "Weight Loss", "General Fitness"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md mx-auto px-5 py-7"
    >
      <h2 className="m3-h center" style={{ fontSize: "var(--m3-headline-md)", marginTop: 0 }}>Athlete Profile</h2>
      <p className="m3-body center" style={{ marginBottom: "18px" }}>
        Set your baseline metrics to optimise categorisation and tracking.
      </p>

      {/* Units */}
      <div className="m3-bgroup" style={{ marginBottom: "22px" }}>
        <button className={`seg${preferredUnits === "Metric" ? " sel" : ""}`} onClick={() => setPreferredUnits("Metric")}>
          Metric (kg/cm)
        </button>
        <button className={`seg${preferredUnits === "Imperial" ? " sel" : ""}`} onClick={() => setPreferredUnits("Imperial")}>
          Imperial (lbs/ft)
        </button>
      </div>

      {/* Biological sex */}
      <div className="m3-seclabel"><span className="l"><User /> Biological sex</span></div>
      <div className="m3-field">
        <select
          className="m3-dropdown"
          value={biologicalSex}
          onChange={(e) => setBiologicalSex(e.target.value as UserProfile["biologicalSex"])}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
        <ChevronDown className="chev" />
      </div>

      {/* Age */}
      <div className="m3-slider-row">
        <div className="m3-slider-top">
          <span className="l">Age (years)</span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              className="m3-numpill"
              inputMode="numeric"
              style={{ width: "48px" }}
              value={ageInput}
              onChange={(e) => {
                const val = e.target.value;
                setAgeInput(val);
                const num = parseInt(val, 10);
                if (!isNaN(num) && num >= 12 && num <= 100) setAge(num);
              }}
              onBlur={() => {
                const num = parseInt(ageInput, 10);
                if (isNaN(num)) { setAge(30); setAgeInput("30"); }
                else { const c = Math.max(12, Math.min(100, num)); setAge(c); setAgeInput(c.toString()); }
              }}
            />
            <span className="m3-unit">yrs</span>
          </span>
        </div>
        <div className="m3-slider-wrap">
          <div className="m3-slider-track">
            <div className="m3-slider-fill" style={{ width: `${agePct}%` }} />
            <div className="m3-slider-thumb" style={{ left: `${agePct}%` }} />
          </div>
          <input
            type="range" min="12" max="100" step="1" value={age}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (val !== age) {
                if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(6);
                setAge(val); setAgeInput(val.toString());
              }
            }}
          />
        </div>
      </div>

      {/* Height */}
      <div className="m3-slider-row">
        <div className="m3-slider-top">
          <span className="l"><Ruler /> Height</span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {preferredUnits === "Metric" ? (
              <>
                <input
                  className="m3-numpill" inputMode="decimal" style={{ width: "56px" }}
                  value={heightInput}
                  onChange={(e) => {
                    const val = e.target.value; setHeightInput(val);
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 120 && num <= 230) setHeightCm(num);
                  }}
                  onBlur={() => {
                    const num = parseFloat(heightInput);
                    if (isNaN(num)) { setHeightCm(170); setHeightInput("170"); }
                    else { const c = Math.max(120, Math.min(230, num)); setHeightCm(c); setHeightInput(c.toString()); }
                  }}
                />
                <span className="m3-unit">cm</span>
              </>
            ) : (
              <>
                <input
                  className="m3-numpill" inputMode="numeric" style={{ width: "52px" }}
                  value={heightInput}
                  onChange={(e) => {
                    const val = e.target.value; setHeightInput(val);
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 47 && num <= 90) setHeightCm(parseFloat(inchesToCm(num).toFixed(2)));
                  }}
                  onBlur={() => {
                    const num = parseFloat(heightInput);
                    if (isNaN(num)) { setHeightCm(170); setHeightInput(Math.round(cmToInches(170)).toString()); }
                    else { const c = Math.max(47, Math.min(90, num)); setHeightCm(parseFloat(inchesToCm(c).toFixed(2))); setHeightInput(c.toString()); }
                  }}
                />
                <span className="m3-unit" style={{ lineHeight: 1.2 }}>in<br />({formatImperialHeight(cmToInches(heightCm))})</span>
              </>
            )}
          </span>
        </div>
        <div className="m3-slider-wrap">
          <div className="m3-slider-track">
            <div className="m3-slider-fill" style={{ width: `${heightPct}%` }} />
            <div className="m3-slider-thumb" style={{ left: `${heightPct}%` }} />
          </div>
          <input
            type="range"
            min={preferredUnits === "Metric" ? metricHeightConfig.min : imperialHeightConfig.min}
            max={preferredUnits === "Metric" ? metricHeightConfig.max : imperialHeightConfig.max}
            step={preferredUnits === "Metric" ? metricHeightConfig.step : imperialHeightConfig.step}
            value={preferredUnits === "Metric" ? heightCm : Math.round(cmToInches(heightCm))}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const cur = preferredUnits === "Metric" ? heightCm : Math.round(cmToInches(heightCm));
              if (val !== cur) {
                if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(6);
                setHeightCm(preferredUnits === "Metric" ? val : parseFloat(inchesToCm(val).toFixed(2)));
              }
            }}
          />
        </div>
      </div>

      {/* Body mass */}
      <div className="m3-slider-row">
        <div className="m3-slider-top">
          <span className="l"><Scale /> Body mass</span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {preferredUnits === "Metric" ? (
              <>
                <input
                  className="m3-numpill" inputMode="decimal" style={{ width: "60px" }}
                  value={weightInput}
                  onChange={(e) => {
                    const val = e.target.value; setWeightInput(val);
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 40 && num <= 200) setWeightKg(num);
                  }}
                  onBlur={() => {
                    const num = parseFloat(weightInput);
                    if (isNaN(num)) { setWeightKg(70); setWeightInput("70"); }
                    else { const c = Math.max(40, Math.min(200, num)); setWeightKg(c); setWeightInput(c.toString()); }
                  }}
                />
                <span className="m3-unit">kg</span>
              </>
            ) : (
              <>
                <input
                  className="m3-numpill" inputMode="numeric" style={{ width: "56px" }}
                  value={weightInput}
                  onChange={(e) => {
                    const val = e.target.value; setWeightInput(val);
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 88 && num <= 440) setWeightKg(parseFloat(lbsToKg(num).toFixed(2)));
                  }}
                  onBlur={() => {
                    const num = parseFloat(weightInput);
                    if (isNaN(num)) { setWeightKg(70); setWeightInput(Math.round(kgToLbs(70)).toString()); }
                    else { const c = Math.max(88, Math.min(440, num)); setWeightKg(parseFloat(lbsToKg(c).toFixed(2))); setWeightInput(c.toString()); }
                  }}
                />
                <span className="m3-unit" style={{ lineHeight: 1.2 }}>lbs<br />({Math.floor(kgToLbs(weightKg) / 14)}st {Math.round(kgToLbs(weightKg) % 14)}lb)</span>
              </>
            )}
          </span>
        </div>
        <div className="m3-slider-wrap">
          <div className="m3-slider-track">
            <div className="m3-slider-fill" style={{ width: `${weightPct}%` }} />
            <div className="m3-slider-thumb" style={{ left: `${weightPct}%` }} />
          </div>
          <input
            type="range"
            min={preferredUnits === "Metric" ? metricWeightConfig.min : imperialWeightConfig.min}
            max={preferredUnits === "Metric" ? metricWeightConfig.max : imperialWeightConfig.max}
            step={preferredUnits === "Metric" ? metricWeightConfig.step : imperialWeightConfig.step}
            value={preferredUnits === "Metric" ? weightKg : Math.round(kgToLbs(weightKg))}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const cur = preferredUnits === "Metric" ? weightKg : Math.round(kgToLbs(weightKg));
              if (val !== cur) {
                if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(6);
                setWeightKg(preferredUnits === "Metric" ? val : parseFloat(lbsToKg(val).toFixed(2)));
              }
            }}
          />
        </div>
      </div>

      {/* Primary goal */}
      <div className="m3-seclabel"><span className="l"><Target /> Primary goal</span></div>
      <div className="m3-goals">
        {goals.map((goal) => (
          <button
            key={goal}
            onClick={() => setPrimaryGoal(goal)}
            className={`m3-goal${primaryGoal === goal ? " sel" : ""}`}
          >
            {goal === "Cardiovascular Endurance" ? "Cardio endurance" : goal}
          </button>
        ))}
      </div>

      <button onClick={handleSubmit} className="m3-btn accent" style={{ marginTop: "26px" }}>
        <Check className="w-[18px] h-[18px]" /> Save profile
      </button>
    </motion.div>
  );
}

// --- End of OnboardingProfile.tsx ---
