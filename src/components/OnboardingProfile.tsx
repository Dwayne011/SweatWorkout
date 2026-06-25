// Author: Google AI Studio Coding Agent
// OS support: All (Web, Android, iOS)
// Description: Onboarding and profile editing screen for athlete metrics management.
import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { motion } from "motion/react";
import { ArrowRight, Ruler, Scale, User, Target, Activity } from "lucide-react";

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

const formatImperialWeight = (totalLbs: number) => {
  const st = Math.floor(totalLbs / 14);
  const lbs = Math.round(totalLbs % 14);
  return `${st}st ${lbs}lb (${Math.round(totalLbs)} lbs)`;
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
  // Weight: roughly 88 lbs to 440 lbs
  const imperialWeightConfig = { min: 88, max: 440, step: 1 };
  // Height: roughly 47 inches to 90 inches
  const imperialHeightConfig = { min: 47, max: 90, step: 1 };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-xl flex flex-col items-center border border-gray-100 dark:border-gray-800"
    >
      <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6">
        <Activity className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
      </div>
      
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 text-center tracking-tight">Athlete Profile</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8 px-4 font-medium">
        Set your baseline metrics to optimise categorisation and tracking.
      </p>

      {/* Unit Toggle */}
      <div className="w-full flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex relative border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setPreferredUnits("Metric")}
            className={`px-6 py-2 rounded-lg text-sm font-bold z-10 transition-colors ${
              preferredUnits === "Metric" ? "text-white" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Metric (kg/cm)
          </button>
          <button
            onClick={() => setPreferredUnits("Imperial")}
            className={`px-6 py-2 rounded-lg text-sm font-bold z-10 transition-colors ${
              preferredUnits === "Imperial" ? "text-white" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Imperial (lbs/ft)
          </button>
          <motion.div
            layout
            className="absolute top-1 bottom-1 bg-indigo-600 rounded-lg"
            initial={false}
            animate={{
              left: preferredUnits === "Metric" ? "0.25rem" : "50%",
              right: preferredUnits === "Metric" ? "50%" : "0.25rem",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>
      </div>

      <div className="w-full space-y-8">
        {/* Sex */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-black text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wider">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Biological Sex</span>
          </label>
          <select
            value={biologicalSex}
            onChange={(e) => setBiologicalSex(e.target.value as UserProfile["biologicalSex"])}
            className="w-full p-4 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900 dark:text-white"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        {/* Age */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="flex items-center space-x-2 text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              <span>Age (Years)</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="12"
                max="100"
                value={ageInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setAgeInput(val);
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && num >= 12 && num <= 100) {
                    setAge(num);
                  }
                }}
                onBlur={() => {
                  const num = parseInt(ageInput, 10);
                  if (isNaN(num)) {
                    setAge(30);
                    setAgeInput("30");
                  } else {
                    const clamped = Math.max(12, Math.min(100, num));
                    setAge(clamped);
                    setAgeInput(clamped.toString());
                  }
                }}
                className="w-16 px-2 py-1 text-center font-bold text-base text-indigo-600 dark:text-indigo-400 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Yrs</span>
            </div>
          </div>
          
          <div className="relative w-full h-10 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl overflow-hidden flex items-center transition-all duration-300 hover:scale-[1.01] active:scale-[1.02] border border-gray-100/50 dark:border-zinc-800/50">
            {/* Filled track */}
            <div 
              className="h-full absolute left-0 top-0 transition-all duration-100 ease-out border-r-[3px] border-white dark:border-zinc-950" 
              style={{ 
                width: `${Math.max(0, Math.min(100, ((age - 12) / 88) * 100))}%`,
                backgroundColor: "rgb(99, 102, 241)",
              }}
            />
            {/* Visual elements */}
            <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-slate-400/30 pointer-events-none" />
            <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-400/20 pointer-events-none" />
            
            <input
              type="range"
              min="12"
              max="100"
              step="1"
              value={age}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val !== age) {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(6);
                  }
                  setAge(val);
                  setAgeInput(val.toString());
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
        </div>

        {/* Height */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="flex items-center space-x-2 text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              <Ruler className="w-4 h-4 text-indigo-500" />
              <span>Height</span>
            </label>
            <div className="flex items-center gap-1.5">
              {preferredUnits === "Metric" ? (
                <>
                  <input
                    type="number"
                    min="120"
                    max="230"
                    value={heightInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHeightInput(val);
                      const num = parseFloat(val);
                      if (!isNaN(num) && num >= 120 && num <= 230) {
                        setHeightCm(num);
                      }
                    }}
                    onBlur={() => {
                      const num = parseFloat(heightInput);
                      if (isNaN(num)) {
                        setHeightCm(170);
                        setHeightInput("170");
                      } else {
                        const clamped = Math.max(120, Math.min(230, num));
                        setHeightCm(clamped);
                        setHeightInput(clamped.toString());
                      }
                    }}
                    className="w-18 px-2 py-1 text-center font-bold text-base text-indigo-600 dark:text-indigo-400 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">cm</span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    min="47"
                    max="90"
                    value={heightInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHeightInput(val);
                      const num = parseFloat(val);
                      if (!isNaN(num) && num >= 47 && num <= 90) {
                        setHeightCm(parseFloat(inchesToCm(num).toFixed(2)));
                      }
                    }}
                    onBlur={() => {
                      const num = parseFloat(heightInput);
                      if (isNaN(num)) {
                        setHeightCm(170);
                        setHeightInput(Math.round(cmToInches(170)).toString());
                      } else {
                        const clamped = Math.max(47, Math.min(90, num));
                        setHeightCm(parseFloat(inchesToCm(clamped).toFixed(2)));
                        setHeightInput(clamped.toString());
                      }
                    }}
                    className="w-18 px-2 py-1 text-center font-bold text-base text-indigo-600 dark:text-indigo-400 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <div className="flex flex-col items-start leading-none min-w-[36px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">in</span>
                    <span className="text-[9px] font-bold text-indigo-500/80 font-mono select-none">
                      ({formatImperialHeight(cmToInches(heightCm))})
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="relative w-full h-10 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl overflow-hidden flex items-center transition-all duration-300 hover:scale-[1.01] active:scale-[1.02] border border-gray-100/50 dark:border-zinc-800/50">
            {/* Filled track */}
            <div 
              className="h-full absolute left-0 top-0 transition-all duration-100 ease-out border-r-[3px] border-white dark:border-zinc-950" 
              style={{ 
                width: `${Math.max(0, Math.min(100, 
                  preferredUnits === "Metric"
                    ? ((heightCm - 120) / 110) * 100
                    : ((cmToInches(heightCm) - 47) / 43) * 100
                ))}%`,
                backgroundColor: "rgb(99, 102, 241)",
              }}
            />
            {/* Visual element dots */}
            <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-slate-400/30 pointer-events-none" />
            <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-400/20 pointer-events-none" />

            {/* Range slider */}
            <input
              type="range"
              min={preferredUnits === "Metric" ? metricHeightConfig.min : imperialHeightConfig.min}
              max={preferredUnits === "Metric" ? metricHeightConfig.max : imperialHeightConfig.max}
              step={preferredUnits === "Metric" ? metricHeightConfig.step : imperialHeightConfig.step}
              value={preferredUnits === "Metric" ? heightCm : Math.round(cmToInches(heightCm))}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                const currentVal = preferredUnits === "Metric" ? heightCm : Math.round(cmToInches(heightCm));
                if (val !== currentVal) {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(6);
                  }
                  setHeightCm(
                    preferredUnits === "Metric" ? val : parseFloat(inchesToCm(val).toFixed(2))
                  );
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
        </div>

        {/* Weight */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="flex items-center space-x-2 text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              <Scale className="w-4 h-4 text-indigo-500" />
              <span>Body Mass</span>
            </label>
            <div className="flex items-center gap-1.5">
              {preferredUnits === "Metric" ? (
                <>
                  <input
                    type="number"
                    step="0.5"
                    min="40"
                    max="200"
                    value={weightInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setWeightInput(val);
                      const num = parseFloat(val);
                      if (!isNaN(num) && num >= 40 && num <= 200) {
                        setWeightKg(num);
                      }
                    }}
                    onBlur={() => {
                      const num = parseFloat(weightInput);
                      if (isNaN(num)) {
                        setWeightKg(70);
                        setWeightInput("70");
                      } else {
                        const clamped = Math.max(40, Math.min(200, num));
                        setWeightKg(clamped);
                        setWeightInput(clamped.toString());
                      }
                    }}
                    className="w-20 px-2 py-1 text-center font-bold text-base text-indigo-600 dark:text-indigo-400 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">kg</span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    min="88"
                    max="440"
                    value={weightInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setWeightInput(val);
                      const num = parseFloat(val);
                      if (!isNaN(num) && num >= 88 && num <= 440) {
                        setWeightKg(parseFloat(lbsToKg(num).toFixed(2)));
                      }
                    }}
                    onBlur={() => {
                      const num = parseFloat(weightInput);
                      if (isNaN(num)) {
                        setWeightKg(70);
                        setWeightInput(Math.round(kgToLbs(70)).toString());
                      } else {
                        const clamped = Math.max(88, Math.min(440, num));
                        setWeightKg(parseFloat(lbsToKg(clamped).toFixed(2)));
                        setWeightInput(clamped.toString());
                      }
                    }}
                    className="w-20 px-2 py-1 text-center font-bold text-base text-indigo-600 dark:text-indigo-400 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <div className="flex flex-col items-start leading-none min-w-[36px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">lbs</span>
                    <span className="text-[9px] font-bold text-indigo-500/80 font-mono select-none">
                      ({Math.floor(kgToLbs(weightKg) / 14)}st {Math.round(kgToLbs(weightKg) % 14)}lb)
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="relative w-full h-10 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl overflow-hidden flex items-center transition-all duration-300 hover:scale-[1.01] active:scale-[1.02] border border-gray-100/50 dark:border-zinc-800/50">
            {/* Filled track */}
            <div 
              className="h-full absolute left-0 top-0 transition-all duration-100 ease-out border-r-[3px] border-white dark:border-zinc-950" 
              style={{ 
                width: `${Math.max(0, Math.min(100, 
                  preferredUnits === "Metric"
                    ? ((weightKg - 40) / 160) * 100
                    : ((kgToLbs(weightKg) - 88) / 352) * 100
                ))}%`,
                backgroundColor: "rgb(99, 102, 241)",
              }}
            />
            {/* Visual element dots */}
            <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-slate-400/30 pointer-events-none" />
            <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-400/20 pointer-events-none" />

            {/* Range slider */}
            <input
              type="range"
              min={preferredUnits === "Metric" ? metricWeightConfig.min : imperialWeightConfig.min}
              max={preferredUnits === "Metric" ? metricWeightConfig.max : imperialWeightConfig.max}
              step={preferredUnits === "Metric" ? metricWeightConfig.step : imperialWeightConfig.step}
              value={preferredUnits === "Metric" ? weightKg : Math.round(kgToLbs(weightKg))}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                const currentVal = preferredUnits === "Metric" ? weightKg : Math.round(kgToLbs(weightKg));
                if (val !== currentVal) {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(6);
                  }
                  setWeightKg(
                    preferredUnits === "Metric" ? val : parseFloat(lbsToKg(val).toFixed(2))
                  );
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
        </div>

        {/* Primary Goal */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-black text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wider">
            <Target className="w-4 h-4 text-indigo-500" />
            <span>Primary Goal</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {["Hypertrophy", "Strength", "Cardiovascular Endurance", "Weight Loss", "General Fitness"].map(
              (goal) => (
                <button
                  key={goal}
                  onClick={() => setPrimaryGoal(goal as UserProfile["primaryGoal"])}
                  className={`p-3 text-xs md:text-sm font-bold rounded-xl border-2 transition-all ${
                    primaryGoal === goal
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  {goal}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="w-full mt-10">
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold shadow-xl shadow-indigo-600/20 transition-colors"
        >
          <span>Confirm Athlete Profile</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

// --- End of OnboardingProfile.tsx ---
