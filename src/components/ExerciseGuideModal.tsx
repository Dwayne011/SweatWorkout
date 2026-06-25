/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, CheckCircle, Info, Dumbbell, ShieldAlert, Award } from "lucide-react";
import { Exercise } from "../types";
import { motion, AnimatePresence } from "motion/react";

// Register helper for dispatching global events
export function openExerciseGuide(exercise: Exercise) {
  window.dispatchEvent(
    new CustomEvent("open-exercise-guide", { detail: exercise })
  );
}

interface GuideContent {
  setup: string[];
  form: string[];
  coachingProTip: string;
  majorMuscles: string[];
  minorMuscles: string[];
}

const GUIDES_DATABASE: Record<string, GuideContent> = {
  // Chest
  "bench-press-barbell": {
    setup: [
      "Lie flat on the bench with your feet planted firmly on the floor.",
      "Grip the barbell slightly wider than shoulder-width apart.",
      "Position your body so your eyes are directly under the barbells in the rack."
    ],
    form: [
      "Unrack the weight and hold it directly above your chest with straight arms.",
      "Lower the bar slowly to your mid-chest while tucking your elbows slightly (about 45 degrees).",
      "Press the bar back up to the starting position, keeping your shoulder blades squeezed together."
    ],
    coachingProTip: "Avoid bouncing the bar off your chest. Maintain full control during the entire descent to maximize chest muscle recruitment.",
    majorMuscles: ["Pectoralis Major (Chest)", "Triceps Brachii"],
    minorMuscles: ["Anterior Deltoids (Front Shoulder)", "Rotator Cuff"]
  },
  "bench-press-dumbbell": {
    setup: [
      "Sit on the edge of a flat bench with a dumbbell resting on each thigh.",
      "Lie back on the bench, bringing the dumbbells up to your shoulders with your elbows bent."
    ],
    form: [
      "Press the dumbbells straight up above your chest, keeping your palms facing away from you.",
      "Lower the weights slowly until your elbows reach a 90-degree angle or slightly below.",
      "Push the dumbbells back up together in a slight arc without letting them clank at the top."
    ],
    coachingProTip: "Dumbbells allow for a greater range of motion than a barbell. Flex your chest hard at the peak of the press.",
    majorMuscles: ["Pectoralis Major (Chest)", "Anterior Deltoids"],
    minorMuscles: ["Triceps Brachii", "Serratus Anterior"]
  },
  "incline-dumbbell-press": {
    setup: [
      "Adjust the bench to a 30-to-45-degree incline.",
      "Sit on the bench with a dumbbell on each knee, then kick them up to starting shoulder height as you lie back."
    ],
    form: [
      "Press dumbbells directly up, keeping your elbows beneath your wrists at all times.",
      "Lower the weights slowly to the upper chest, keeping your forearms vertical to the floor.",
      "Contract your upper pectorals as you drive the weights back up."
    ],
    coachingProTip: "Do not exceed a 45-degree incline, otherwise the front shoulders (anterior deltoids) will overpower the upper chest.",
    majorMuscles: ["Upper Pectoralis (Clavicular Head)", "Anterior Deltoids"],
    minorMuscles: ["Triceps Brachii", "Upper Trapezius"]
  },
  "chest-fly-dumbbell": {
    setup: [
      "Lie flat on your back on a bench, holding dumbbells straight over your chest with palms facing each other."
    ],
    form: [
      "With a slight curve in your elbows, lower the arms out sideways to the desk in a wide arc.",
      "Stop when your hands are in line with your shoulders or chest.",
      "Squeeze your chest back together to lift the weights back up, mimicking a tree-hugging movement."
    ],
    coachingProTip: "Never lock your elbows completely. Keep the bend constant to isolate the chest and prevent biceps tendon strain.",
    majorMuscles: ["Pectoralis Major (Outer-Chest Fibers)"],
    minorMuscles: ["Anterior Deltoids", "Biceps Brachii (Short Head)"]
  },
  "cable-crossover": {
    setup: [
      "Set the cable pulleys to the high position (above your head).",
      "Grip the attachments, step forward one pace, and lean your torso slightly."
    ],
    form: [
      "Slightly bend your elbows and sweep your arms down and inward.",
      "Bring your hands together or cross them over slightly at the bottom (hip level) to maximize tension.",
      "Control the weights as they return to the starting position."
    ],
    coachingProTip: "Focus on the squeeze at the peak contraction. Cables provide constant tension that dumbbells cannot replicate.",
    majorMuscles: ["Lower Pectoralis Major", "Inner Chest"],
    minorMuscles: ["Front Deltoids", "Coracobrachialis"]
  },
  "push-up": {
    setup: [
      "Place your hands on the floor slightly wider than shoulder-width.",
      "Extend your legs backward and raise your torso so your body forms a straight line from head to heels."
    ],
    form: [
      "Lower your body by bending your arms until your chest nearly touches the floor.",
      "Keep your neck neutral and your elbows tucked back relative to your trunk.",
      "Push back up to the starting position by extending your arms."
    ],
    coachingProTip: "Squeeze your glutes and pull your belly button towards your spine to prevent your hips from sagging.",
    majorMuscles: ["Pectoralis Major", "Triceps Brachii"],
    minorMuscles: ["Core (Rectus Abdominis)", "Anterior Deltoids"]
  },

  // Back
  "deadlift-barbell": {
    setup: [
      "Stand with your feet hip-width apart, the barbell positioned over the middle of your shoelaces.",
      "Bend at your hips and knees to grip the bar with a shoulder-width overhand or mixed grip.",
      "Flatten your back completely and pull your hips down slightly."
    ],
    form: [
      "Drive through your legs to pull the barbell off the floor, keeping it touching your shins.",
      "As the bar passes your knees, push your hips forward to lock out the lift standing tall.",
      "Lower the bar by hingeing your hips back first, then bending knees once the bar clears them."
    ],
    coachingProTip: "Keep the bar as close to your legs as possible. If the bar drifts forward, it places severe stress on your lower back.",
    majorMuscles: ["Hamstrings", "Gluteus Maximus", "Erector Spinae (Lower Back)"],
    minorMuscles: ["Lats (Latissimus Dorsi)", "Forearms / Grip", "Trapezius"]
  },
  "pull-up": {
    setup: [
      "Grip the pull-up bar with an overhand grip (palms facing away), wider than shoulder-width.",
      "Hang with your arms fully extended and feet crossed behind you."
    ],
    form: [
      "Squeeze your shoulder blades together to initiate the pull.",
      "Drive your elbows straight down toward your hips to lift your chest up to the bar.",
      "Lower your body slowly back to a dead hang starting position."
    ],
    coachingProTip: "Think of your hands as hooks. Pull through your elbows, not your hands, to better engage your lats.",
    majorMuscles: ["Latissimus Dorsi (Lats)", "Teres Major"],
    minorMuscles: ["Biceps Brachii", "Middle & Lower Trapezius", "Rhomboids"]
  },
  "lat-pulldown": {
    setup: [
      "Sit in the seat and adjust the thigh pad securely to lock your legs down.",
      "Grip the pulldown bar with an overhand grip wider than shoulder-width, then sit back with arms extended."
    ],
    form: [
      "Lean back very slightly (10-15 degrees) and pull the bar down toward your upper chest.",
      "Keep your elbows pointed straight down under the bar at the bottom.",
      "Resist the weight's pull as you slowly return the bar back up to full vertical stretch."
    ],
    coachingProTip: "Avoid leaning back excessively to momentum-pull the weight. Keep your torso steady and isolate your back.",
    majorMuscles: ["Latissimus Dorsi", "Rear Deltoids"],
    minorMuscles: ["Biceps Brachii", "Brachialis", "Middle Trapezius"]
  },
  "bent-over-row-barbell": {
    setup: [
      "Stand with feet shoulder-width apart, holding a barbell with an overhand or underhand grip.",
      "Hinge at your hips to lean your chest forward to about 45 degrees with a flat, rigid back."
    ],
    form: [
      "Pull the barbell up toward your lower stomach/belly button.",
      "Keep your elbows close to your torso and squeeze your shoulder blades fully at the peak.",
      "Extend your arms slowly to return the barbell, maintaining your torso angle."
    ],
    coachingProTip: "Keep your lower back locked and stable. Do not stand up or bounce your hips to heave the weight up.",
    majorMuscles: ["Middle Trapezius & Rhomboids", "Latissimus Dorsi"],
    minorMuscles: ["Rear Deltoids", "Erector Spinae", "Biceps"]
  },
  "seated-cable-row": {
    setup: [
      "Sit at the row platform, place feet on the footplates, and bend your knees slightly.",
      "Grip the V-handle attachment and sit upright with straight arms."
    ],
    form: [
      "Pull the handle toward your lower ribs while keeping your spine straight and shoulders down.",
      "Squeeze your shoulder blades hard at the peak of the pull.",
      "Extend your arms back forward slowly, letting your lats stretch without rounding your back."
    ],
    coachingProTip: "Initiate the movement by retracting your shoulder blades, rather than just pulling with your biceps.",
    majorMuscles: ["Rhomboids", "Middle & Lower Trapezius", "Latissimus Dorsi"],
    minorMuscles: ["Rear Deltoids", "Biceps Brachii", "Forearms"]
  },

  // Legs
  "squat-barbell": {
    setup: [
      "Rest the bar on your upper back/trap muscles (not your neck).",
      "Set your feet shoulder-width apart with your toes flared slightly outwards (15-30 degrees).",
      "Unrack the barbell and take two small steps back to clear the J-cups."
    ],
    form: [
      "Break at your hips and bend your knees at the same time, descending as if sitting in a chair.",
      "Keep your heels flat on the floor and knees tracking inline with your toes.",
      "Squat down until your thighs are parallel to the floor or lower, then drive through your feet to stand up."
    ],
    coachingProTip: "Keep your chest high and head neutral. Squeezing your upper back tight helps maintain a rigid spine.",
    majorMuscles: ["Quadriceps", "Gluteus Maximus"],
    minorMuscles: ["Hamstrings", "Erector Spinae", "Calves", "Core"]
  },
  "leg-press": {
    setup: [
      "Sit in the sled, place your feet hip-width on the platform, and release the safety latches.",
      "Ensure your lower back stays flat and pressed against the backrest throughout."
    ],
    form: [
      "Lower the platform slowly by bending your knees toward your chest (stop before your lower back lifts).",
      "Push the platform away by extending your legs, driving through your heels.",
      "Do not lock out your knees completely at the end of the press."
    ],
    coachingProTip: "Locking your knees out completely shifts the load directly to your skeletal structure, increasing joint damage risk. Keep a micro-bend.",
    majorMuscles: ["Quadriceps", "Gluteus Maximus"],
    minorMuscles: ["Hamstrings", "Adductors"]
  },
  "lunge-dumbbell": {
    setup: [
      "Stand upright holding a dumbbell in each hand at your sides."
    ],
    form: [
      "Take a large step forward and bend both knees to lower your hips.",
      "Your back knee should hover just above the floor, and your front thigh should be parallel to the ground.",
      "Push forcefully off your front heel to step back to the starting feet-together position."
    ],
    coachingProTip: "Align your front knee over your ankle. Don't let your knee cave inward as you press back up.",
    majorMuscles: ["Quadriceps", "Gluteus Maximus"],
    minorMuscles: ["Hamstrings", "Calves", "Core (Balance)"]
  },

  // Shoulders
  "overhead-press-barbell": {
    setup: [
      "Set the barbell in the rack at collarbone height.",
      "Grip the bar slightly wider than shoulder-width, with your elbows directly under your wrists.",
      "Unrack the bar and rest it on your front shoulders."
    ],
    form: [
      "Squeeze your glutes, legs, and core tightly to create a rigid foundation.",
      "Press the bar straight up overhead, tilting your head back slightly so the bar clears your nose.",
      "Lock out your elbows at the top with your head pushed slightly forward, then lower back to your chest."
    ],
    coachingProTip: "Do not use leg bend or hip swing unless you are performing a push-press. Keep your torso rock-solid.",
    majorMuscles: ["Anterior Deltoid (Front Shoulder)", "Lateral Deltoid", "Triceps Brachii"],
    minorMuscles: ["Upper Trapezius", "Upper Chest", "Serratus Anterior"]
  },
  "shoulder-press-dumbbell": {
    setup: [
      "Sit on an upright bench and raise the dumbbells to shoulder height, palms facing forward and elbows bent at 90 degrees."
    ],
    form: [
      "Press the dumbbells vertically until your arms are fully extended.",
      "Lower the dumbbells slowly and under control to the sides of your ears/shoulders.",
      "Maintain a vertical forearm position relative to the floor."
    ],
    coachingProTip: "Try tucking your elbows in slightly (about 15 degrees forward) instead of keeping them fully flared out to reduce rotator cuff friction.",
    majorMuscles: ["Anterior & Lateral Deltoids", "Triceps"],
    minorMuscles: ["Trapezius", "Upper Chest"]
  },
  "lateral-raise-dumbbell": {
    setup: [
      "Stand tall holding dumbbells at your sides, chest out and feet together."
    ],
    form: [
      "Raise your arms out sideways with a very slight bend in your elbow.",
      "Lift until your arms are parallel to the floor (shoulder height).",
      "Lower the weights slowly, resisting gravity during the descent back to your legs."
    ],
    coachingProTip: "Lead the movement with your elbows and tilt your pinkies slightly up at the top like pouring a pitcher of water for maximal lateral head isolation.",
    majorMuscles: ["Lateral Deltoid (Side Shoulder)"],
    minorMuscles: ["Anterior Deltoid", "Upper Trapezius", "Supraspinatus"]
  },

  // Arms
  "bicep-curl-dumbbell": {
    setup: [
      "Stand with your feet hip-width, holding dumbbells at your arms' length with palms facing forward."
    ],
    form: [
      "Keep your upper arms locked against your torso as you bend your elbows.",
      "Curl the dumbbells up toward your chest, contracting your biceps.",
      "Lower the weights slowly back to full elbow extension."
    ],
    coachingProTip: "Keep your elbows pinned next to your ribcage. Swinging your elbows forward shifts the load to the front deltoids.",
    majorMuscles: ["Biceps Brachii"],
    minorMuscles: ["Brachialis", "Brachioradialis", "Forearm Flexors"]
  },
  "bicep-curl-barbell": {
    setup: [
      "Hold a barbell with an underhand grip (palms up) at shoulder-width, arms fully extended."
    ],
    form: [
      "Keeping your ribs tall and core dry, curl the bar up toward your shoulders.",
      "Hold the contraction at the top for a count, then slowly extend your elbows back down.",
      "Do not swing your back to rock the bar up."
    ],
    coachingProTip: "Lower the bar slowly for a full 3-second eccentric phase. This eccentricity triggers major microfiber growth.",
    majorMuscles: ["Biceps Brachii (Short & Long Heads)"],
    minorMuscles: ["Brachialis", "Pronator Teres"]
  },
  "tricep-pushdown-cable": {
    setup: [
      "Facing a cable tower with a rope or straight-bar attachment, grasp the handles.",
      "Pin your elbows to the sides of your torso and lean slightly forward."
    ],
    form: [
      "Push the attachment down by extending your elbows until your arms are fully locked.",
      "Flare your wrists outward slightly at the bottom if using a rope.",
      "Return the attachment slowly back to chest level, maintaining pinned elbow position."
    ],
    coachingProTip: "Engage your triceps during the eccentric phase. Do not let the cable snap your arms back up.",
    majorMuscles: ["Triceps Brachii (Lateral & Medial Heads)"],
    minorMuscles: ["Triceps Brachii (Long Head)", "Anconeus"]
  },

  // Core
  "plank": {
    setup: [
      "Place your forearms on the floor, elbows aligned directly under your shoulders.",
      "Extend your legs behind, balancing on your toes, creating a straight bridge from head to toe."
    ],
    form: [
      "Actively pull your belly button towards your spine and squeeze your glutes tight.",
      "Maintain a completely flat upper back; do not let your hips sag or hike upwards.",
      "Hold this position, breathing evenly through your nose."
    ],
    coachingProTip: "Think of pulling your elbows and toes toward each other. This creates maximal abdominal brace tension.",
    majorMuscles: ["Transversus Abdominis", "Rectus Abdominis (Abs)"],
    minorMuscles: ["Obliques", "Gluteals", "Serratus Anterior", "Quads"]
  }
};

// Helper to extract YouTube video ID from various link styles
function getYouTubeEmbedId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Returns a generic fallback guide for custom exercises
function getGuide(exercise: Exercise): GuideContent {
  const matched = GUIDES_DATABASE[exercise.id];
  if (matched) return matched;

  // Render advanced instructions if exercise has granular guide fields or is custom
  if (exercise.setupInstructions || exercise.formMechanics || exercise.isCustom) {
    const setup = exercise.setupInstructions
      ? exercise.setupInstructions.split("\n").map(s => s.trim().replace(/^\d+\.\s*/, "")).filter(Boolean)
      : [
          `Setup equipment / space suitable for: ${exercise.name}.`,
          `Category focus: ${exercise.category}`,
          `Equipment: ${exercise.equipment}`
        ];

    const form = exercise.formMechanics
      ? exercise.formMechanics.split("\n").map(s => s.trim().replace(/^[•-]\s*/, "")).filter(Boolean)
      : [
          exercise.correctForm || "Ensure slow, governed repetitions and a solid body posture."
        ];

    let majorMuscles: string[];
    let minorMuscles: string[];

    if (exercise.primaryTarget) {
      majorMuscles = exercise.primaryTarget.split(",").map(s => s.trim()).filter(Boolean);
    } else {
      majorMuscles = [`${exercise.category} (Primary)`];
    }

    if (exercise.secondaryTarget) {
      if (Array.isArray(exercise.secondaryTarget)) {
        minorMuscles = exercise.secondaryTarget;
      } else {
        try {
          const parsed = JSON.parse(exercise.secondaryTarget);
          if (Array.isArray(parsed)) {
            minorMuscles = parsed;
          } else {
            minorMuscles = exercise.secondaryTarget.split(",").map(s => s.trim()).filter(Boolean);
          }
        } catch {
          minorMuscles = exercise.secondaryTarget.split(",").map(s => s.trim()).filter(Boolean);
        }
      }
    } else {
      minorMuscles = ["Core", "Stabilizers"];
    }

    return {
      setup,
      form,
      coachingProTip: exercise.coachTip || "Focus on deep muscular recruitment and mind-muscle isolation.",
      majorMuscles,
      minorMuscles
    };
  }

  // Let's check if the exercise has its own custom correctForm text
  if (exercise.correctForm) {
    return {
      setup: [
        `Prepare equipment / space suitable for: ${exercise.name}.`,
        `Required Setup: ${exercise.equipment}.`,
        "Locate a comfortable position, align your body, and stabilize your posture."
      ],
      form: [
        exercise.correctForm
      ],
      coachingProTip: `Establish full core branding. Concentrate on perfect movement mechanics and control.`,
      majorMuscles: [`${exercise.category} Group`],
      minorMuscles: ["Core", "Stabilizers"]
    };
  }

  // Let's create an intelligent fallback based on category
  const cat = exercise.category;
  const equip = exercise.equipment;

  return {
    setup: [
      `Position yourself comfortably with the ${equip} setup.`,
      `Establish a stable base with foot and hip placement suitable for ${cat} exercises.`,
      "Engage your core and set your baseline grip or posture."
    ],
    form: [
      `Initiate the ${cat} movement by contracting the primary target muscles.`,
      "Maintain a controlled, smooth cadence of about 2 seconds down, 1 second hold, and 1 second raise.",
      "Squeeze at the peak contraction before returning gracefully to the start."
    ],
    coachingProTip: `Focus on the mind-muscle connection. Keep movements steady and avoid using swinging motions or momentum to lift the weights.`,
    majorMuscles: [`${cat} Target Muscles`],
    minorMuscles: ["Stabilizers", "Core Muscles"]
  };
}

export default function ExerciseGuideModal() {
  const [open, setOpen] = useState(false);
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<Exercise>;
      if (customEvent.detail) {
        setExercise(customEvent.detail);
        setOpen(true);
      }
    };

    window.addEventListener("open-exercise-guide", handleOpen);
    return () => {
      window.removeEventListener("open-exercise-guide", handleOpen);
    };
  }, []);

  useEffect(() => {
    // Intercept escape key to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent body scrolling
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !exercise) return null;

  const guide = getGuide(exercise);

  // Determine which visual loop to render based on exercise category or ID
  const renderVisualDemonstration = () => {
    if (exercise.isCustom) {
      const ytId = getYouTubeEmbedId(exercise.videoLink);
      if (ytId) {
        return (
          <div className="w-full h-56 bg-black rounded-2xl border border-gray-200 dark:border-white/5 relative overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              title={`${exercise.name} Custom Video Guide`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        );
      }

      if (exercise.mediaUrl) {
        if (exercise.mediaType === "video") {
          return (
            <div className="w-full h-56 bg-black rounded-2xl border border-gray-200 dark:border-white/5 relative overflow-hidden flex items-center justify-center">
              <video
                src={exercise.mediaUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          );
        } else {
          return (
            <div className="w-full h-56 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-white/5 relative overflow-hidden flex items-center justify-center">
              <img
                src={exercise.mediaUrl}
                alt={`${exercise.name} Custom Guide`}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          );
        }
      }

      return (
        <div className="w-full h-44 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-white/5 flex flex-col items-center justify-center p-5 text-center">
          <Dumbbell className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
          <p className="text-xs font-extrabold text-gray-600 dark:text-slate-300">Custom Active Guide</p>
          <p className="text-[10px] text-slate-500 max-w-sm mt-1.5 leading-relaxed font-mono">
            No media attached. Edit this exercise in the library to link a YouTube guide or upload personal demonstration media!
          </p>
        </div>
      );
    }

    const id = exercise.id;
    const isChest = exercise.category === "Chest";
    const isBack = exercise.category === "Back";
    const isLegs = exercise.category === "Legs";
    const isShoulders = exercise.category === "Shoulders";
    const isArms = exercise.category === "Arms";
    const isCore = exercise.category === "Core";

    // CSS Keyframe styles injected inline for self-contained, high-performance looping
    return (
      <div className="w-full h-44 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-white/5 relative flex items-center justify-center overflow-hidden">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes arm-curl {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-55deg); }
          }
          @keyframes squat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(22px); }
          }
          @keyframes squat-bar {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(22px); }
          }
          @keyframes press {
            0%, 100% { transform: translateY(12px); }
            50% { transform: translateY(-24px); }
          }
          @keyframes chest-press {
            0%, 100% { transform: translateY(16px); }
            50% { transform: translateY(-16px); }
          }
          @keyframes lat-pull {
            0%, 100% { transform: translateY(-20px); }
            50% { transform: translateY(15px); }
          }
          @keyframes fly {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-45deg); }
          }
          @keyframes core-pulse {
            0%, 100% { opacity: 0.15; transform: scale(0.9); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
        `}} />

        {/* Ambient grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

        {/* 1. SQUAT VISUAL (LEGS) */}
        {isLegs && (
          <svg className="w-40 h-40 text-indigo-400" viewBox="0 0 100 100" fill="none">
            {/* Ground */}
            <line x1="20" y1="80" x2="80" y2="80" stroke="#1e1b4b" strokeWidth="2" strokeDasharray="3 3" />
            
            {/* Rack side poles */}
            <path d="M30 80 V25 M70 80 V25" stroke="#ffffff0d" strokeWidth="2" />
            
            {/* Moving Squat Figure Skeleton */}
            <g style={{ animation: "squat 4s ease-in-out infinite" }}>
              {/* Feet (pinned theoretically) */}
              <circle cx="45" cy="80" r="1.5" fill="#4f46e5" />
              <circle cx="55" cy="80" r="1.5" fill="#4f46e5" />

              {/* Knees and Hips */}
              <path d="M45 80 L 42 62 L 48 48 L 52 48 L 58 62 L 55 80" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Torso */}
              <line x1="50" y1="48" x2="50" y2="34" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
              
              {/* Head */}
              <circle cx="50" cy="27" r="4.5" stroke="#4f46e5" strokeWidth="2" fill="#0c0d1b" />
              
              {/* Active quad highlight overlay */}
              <path d="M42 62 L 48 48 M58 62 L 52 48" stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
              
              {/* Barbell on shoulder back */}
              <g style={{ transform: "translateY(-4px)" }}>
                <line x1="25" y1="36" x2="75" y2="36" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                {/* Weight plates */}
                <rect x="20" y="30" width="5" height="12" rx="1.5" fill="#4f46e5" stroke="#818cf8" strokeWidth="1" />
                <rect x="15" y="32" width="4" height="8" rx="1" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1" />
                <rect x="75" y="30" width="5" height="12" rx="1.5" fill="#4f46e5" stroke="#818cf8" strokeWidth="1" />
                <rect x="81" y="32" width="4" height="8" rx="1" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1" />
              </g>
            </g>
          </svg>
        )}

        {/* 2. CHEST PRESS VISUAL (CHEST) */}
        {isChest && id !== "chest-fly-dumbbell" && (
          <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
            {/* Flat Bench drawing */}
            <path d="M25 65 H75 M33 65 V80 M67 65 V80" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Lying Athlete Wireframe */}
            {/* Head (left) */}
            <circle cx="30" cy="59" r="4" stroke="#4f46e5" strokeWidth="2" fill="#0c0d1b" />
            {/* Body */}
            <line x1="34" y1="61" x2="68" y2="61" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" />
            {/* Folded knee details */}
            <path d="M68 61 L 76 61 L 76 80" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Barbell Pressing */}
            <g style={{ animation: "chest-press 3s ease-in-out infinite" }}>
              <line x1="20" y1="44" x2="80" y2="44" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              {/* Plates */}
              <rect x="14" y="38" width="5" height="12" rx="1" fill="#a855f7" stroke="#ffffff22" />
              <rect x="81" y="38" width="5" height="12" rx="1" fill="#a855f7" stroke="#ffffff22" />
              
              {/* Reaching arms pulling bar */}
              <path d="M43 61 L 43 51 L 48 45 M57 61 L 57 51 L 52 45" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        )}

        {/* Dumbbell chest fly */}
        {isChest && id === "chest-fly-dumbbell" && (
          <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
            {/* Flat Bench */}
            <path d="M30 70 H70 M38 70 V82 M62 70 V82" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
            
            {/* Torso lying down */}
            <circle cx="50" cy="63" r="3.5" stroke="#4f46e5" strokeWidth="2" fill="#0c0d1b" />

            {/* Sweeping Left Arm */}
            <g style={{ transform: "translate(35px, 63px)" }}>
              <g style={{ animation: "fly 3s ease-in-out infinite", transformOrigin: "right center" }}>
                <line x1="-20" y1="0" x2="0" y2="0" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
                <circle cx="-20" cy="0" r="3" fill="#a855f7" />
              </g>
            </g>

            {/* Sweeping Right Arm */}
            <g style={{ transform: "translate(65px, 63px)" }}>
              <g style={{ animation: "fly 3s ease-in-out infinite", transformOrigin: "left center" }}>
                <line x1="0" y1="0" x2="20" y2="0" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" style={{ transform: "scaleX(-1)" }} />
                <circle cx="20" cy="0" r="3" fill="#a855f7" />
              </g>
            </g>
          </svg>
        )}

        {/* 3. LAT HOVERPULL VISUAL (BACK) */}
        {isBack && (
          <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
            {/* Seated frame */}
            <path d="M42 80 H58 M50 80 V55 M50 62 H38 M38 62 V80" stroke="#1e1b4b" strokeWidth="2.5" />
            {/* Squeezing Pullover Athlete */}
            <circle cx="50" cy="49" r="4" stroke="#4f46e5" strokeWidth="2" fill="#0c0d1b" />
            
            {/* Pinned thighs */}
            <line x1="50" y1="62" x2="62" y2="62" stroke="#4f46e5" strokeWidth="3" />
            <line x1="62" y1="62" x2="62" y2="80" stroke="#4f46e5" strokeWidth="2" />

            {/* Lat cable pulldown bar */}
            <g style={{ animation: "lat-pull 3.5s ease-in-out infinite" }}>
              <line x1="28" y1="34" x2="72" y2="34" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              {/* Cable feeds */}
              <line x1="50" y1="15" x2="50" y2="34" stroke="#ffffff1a" strokeWidth="1" />
              {/* Active grabbing arms */}
              <path d="M50 54 L 38 40 L 35 34 M50 54 L 62 40 L 65 34" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        )}

        {/* 4. OVERHEAD PRESS (SHOULDERS) */}
        {isShoulders && (
          <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
            {/* Floor */}
            <line x1="30" y1="85" x2="70" y2="85" stroke="#1e1b4b" strokeWidth="2" />
            
            {/* Rigid Athlete */}
            {/* Feet */}
            <line x1="46" y1="85" x2="54" y2="85" stroke="#4f46e5" strokeWidth="3" />
            {/* Legs & Torso */}
            <line x1="50" y1="85" x2="50" y2="44" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
            {/* Head */}
            <circle cx="50" cy="38" r="4" stroke="#4f46e5" strokeWidth="2" fill="#0c0d1b" />

            {/* Barbell pressing */}
            <g style={{ animation: "press 3.2s ease-in-out infinite" }}>
              <line x1="25" y1="44" x2="75" y2="44" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              {/* Small side weights */}
              <rect x="21" y="39" width="4" height="10" rx="1" fill="#4f46e5" />
              <rect x="75" y="39" width="4" height="10" rx="1" fill="#4f46e5" />
              
              {/* Squeeze shoulder arms */}
              <path d="M50 48 L 38 48 L 34 44 M50 48 L 62 48 L 66 44" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        )}

        {/* 5. ARM BICEPS CURLS (ARMS) */}
        {isArms && (
          <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
            {/* Pinned shoulder joint */}
            <circle cx="45" cy="35" r="3" fill="#4f46e5" />
            {/* Main torso */}
            <path d="M45 35 V75 M45 75 L 38 85 M45 75 L 52 85" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="45" cy="27" r="4.5" stroke="#4f46e5" strokeWidth="1.5" fill="#0c0d1b" />

            {/* Upper arm (static) */}
            <line x1="45" y1="35" x2="45" y2="52" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" />
            
            {/* Elbow joint */}
            <circle cx="45" cy="52" r="2" fill="#818cf8" />

            {/* Forearm flexing up and down */}
            <g style={{ transform: "translate(45px, 52px)" }}>
              <g style={{ animation: "arm-curl 3s ease-in-out infinite", transformOrigin: "left top" }}>
                <line x1="0" y1="0" x2="0" y2="20" stroke="#818cf8" strokeWidth="3.2" strokeLinecap="round" />
                {/* Dumbbell held in hand */}
                <g style={{ transform: "translateY(22px)" }}>
                  <line x1="-7" y1="0" x2="7" y2="0" stroke="#ffffff" strokeWidth="2.5" />
                  <rect x="-10" y="-4" width="3" height="8" rx="1" fill="#4f46e5" />
                  <rect x="7" y="-4" width="3" height="8" rx="1" fill="#4f46e5" />
                </g>
                
                {/* Muscle pump overlay glowing active */}
                <line x1="0" y1="3" x2="0" y2="15" stroke="#a855f7" strokeWidth="4.2" opacity="0.65" strokeLinecap="round" />
              </g>
            </g>
          </svg>
        )}

        {/* 6. CORE STABILIZER CORE PLANK (CORE) */}
        {isCore && (
          <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
            {/* Ground support line */}
            <line x1="15" y1="70" x2="85" y2="70" stroke="#1e1b4b" strokeWidth="2.5" />
            
            {/* Rigid Horizontal Plank Body */}
            <g>
              {/* Elbow and forearm pinned */}
              <path d="M42 70 L 42 62 L 54 62" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {/* Toe support */}
              <circle cx="76" cy="69" r="1.5" fill="#4f46e5" />

              {/* Back & body bridge leg to neck */}
              <line x1="33" y1="56" x2="76" y2="68" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" />
              {/* Head */}
              <circle cx="28" cy="54" r="3.5" stroke="#4f46e5" strokeWidth="2" fill="#0c0d1b" />
              
              {/* Pulsing Core stabilizer circle showing effort */}
              <ellipse cx="50" cy="60" rx="9" ry="6" stroke="#a855f7" strokeWidth="1.5" style={{ animation: "core-pulse 2s ease-in-out infinite" }} />
            </g>
          </svg>
        )}

        {/* 7. FALLBACK / GENERAL (FOR CARDIO OR OTHERS) */}
        {!isChest && !isBack && !isLegs && !isShoulders && !isArms && !isCore && (
          <div className="text-center space-y-2">
            <Dumbbell className="w-10 h-10 text-indigo-550 mx-auto animate-bounce mt-2 text-indigo-400" />
            <span className="text-[10px] font-mono font-extrabold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest block">
              Constant Overload Cadence
            </span>
            <div className="w-24 h-1 bg-gray-200 dark:bg-black dark:border-white/10 shadow-sm rounded-full mx-auto relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-0 bg-indigo-500 w-1/2 rounded-full animate-pulse" style={{ animationDuration: "1.5s" }} />
            </div>
          </div>
        )}

        {/* Demo status Tag */}
        <span className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded bg-gray-200 dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 text-[9px] font-mono text-gray-400 font-extrabold uppercase tracking-wide">
          Perfect Cadence Loop
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col my-8 max-h-[90vh]"
      >
        {/* Header bar */}
        <div className="p-5 bg-white dark:bg-black border-b border-gray-200 dark:border-white/5 flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <span className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-bold px-2 py-0.5 rounded-md font-mono uppercase tracking-widest inline-block mb-1.5">
              {exercise.category} • {exercise.equipment}
            </span>
            {(() => {
              const rawName = exercise.name;
              const nameMatch = rawName.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
              const mainTitle = nameMatch ? nameMatch[1].trim() : rawName;
              const subtitleModifier = nameMatch ? nameMatch[2].trim() : null;
              return (
                <>
                  <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-base md:text-lg tracking-tight leading-none">
                    {mainTitle}
                  </h3>
                  {subtitleModifier && (
                    <div className="text-[13px] font-semibold text-indigo-500 dark:text-indigo-300 mt-1 leading-snug">
                      {subtitleModifier}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:bg-black dark:border-white/10 shadow-sm rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic form / scrollable contents */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Looping vector illustration */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest font-mono">
              Visual Form Guide
            </h4>
            {renderVisualDemonstration()}
          </div>

          {/* Setup / Machinery alignment instructions (Bench, barbell, bars, hooks) */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Correct Equipment Setup</span>
            </h4>
            <div className="bg-slate-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 p-4 rounded-xl space-y-2.5">
              {guide.setup.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-md bg-indigo-600 text-white font-mono text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed font-medium">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Form & Execution rules */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Proper Body Form & Mechanics</span>
            </h4>
            <div className="bg-slate-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 p-4 rounded-xl space-y-2.5">
              {guide.form.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-550 dark:bg-indigo-400 shrink-0 mt-2" />
                  <p className="text-xs text-gray-700 dark:text-slate-305 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pro tips badge */}
          <div className="bg-gradient-to-tr from-indigo-50 dark:from-indigo-950/20 to-purple-50 dark:to-purple-950/20 border border-indigo-500/15 dark:border-indigo-500/20 p-4 rounded-xl flex items-start space-x-3">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-extrabold uppercase text-indigo-600 dark:text-indigo-300 tracking-wider">
                Coach Pro-Tip
              </span>
              <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed font-semibold italic">
                "{guide.coachingProTip}"
              </p>
            </div>
          </div>

          {/* Muscle splits highlight detail info */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-gray-50 dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 p-3.5 rounded-xl">
              <span className="text-[9px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider font-mono block mb-1">
                Primary Target
              </span>
              <div className="flex flex-wrap gap-1">
                {guide.majorMuscles.map((item, idx) => (
                  <span key={idx} className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-black dark:border-white/10 shadow-sm border border-gray-200 dark:border-white/5 p-3.5 rounded-xl">
              <span className="text-[9px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider font-mono block mb-1">
                Secondary Target
              </span>
              <div className="flex flex-wrap gap-1">
                {guide.minorMuscles.map((item, idx) => (
                  <span key={idx} className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-white dark:bg-black border-t border-gray-200 dark:border-white/5 flex justify-end shrink-0">
          <button
            onClick={() => setOpen(false)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Got It, Thanks
          </button>
        </div>
      </motion.div>
    </div>
  );
}
