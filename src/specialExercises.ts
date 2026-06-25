/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Exercise, WorkoutSession } from "./types";

// Setup unique, high-fidelity exercises from the CSV that might not exist in the general default library
export const specialRoutinesExercises: Exercise[] = [
  {
    id: "iso-lateral-chest-press-machine",
    name: "Iso-Lateral Chest Press (Machine)",
    category: "Chest",
    equipment: "Machine",
    correctForm: "Setup: Adjust seat height high so handles align exactly with mid-sternum. Form: Keep scapulae aggressively retracted and pinned back into the pad. Stop one inch short of full lockout to trap continuous mechanical tension inside the pecs."
  },
  {
    id: "knees-up-gironda-dip",
    name: "\"Knees-Up\" Gironda Dip",
    category: "Chest",
    equipment: "Bodyweight",
    correctForm: "Setup: Standard dip station. Form: Pull knees up toward your chest dynamically, tuck your chin, and flare your elbows out wide (Gironda/Glass style) to strictly isolate lower/outer pectoralis chest fibres."
  },
  {
    id: "plate-loaded-high-row",
    name: "Plate-Loaded High Row",
    category: "Back",
    equipment: "Machine",
    correctForm: "Setup: Plate-loaded machine, utilise the outer grip handles. Form: Commencing directly at 120 kg (or 70 kg skipping underloaded blocks). Retract your shoulder blades dynamically and drive your elbows down and back to isolate the mid-back."
  },
  {
    id: "seated-sagittal-db-overhead-press",
    name: "Seated Sagittal DB Overhead Press",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Setup: Bench set to high incline. Form: Ryan Humiston Overhaul: Tuck your elbows completely forward into the sagittal plane and use a strict neutral hammer grip. Arch your upper back slightly and terminate the concentric stroke just short of full lockout to maximally stretch the anterior deltoid under load."
  },
  {
    id: "hammer-strength-pec-deck",
    name: "Hammer Strength Pec Deck",
    category: "Chest",
    equipment: "Machine",
    correctForm: "Setup: Standard chest fly machine. Form: Mandated load increase to 42.5 kg. Keep your scapulae aggressively retracted against the pad; do not allow your shoulders to roll forward or unpin from the pad at peak contraction."
  },
  {
    id: "cable-drag-hammer-curl",
    name: "Cable Drag Hammer Curl",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Setup: Attach a rope or D-handle to the absolute bottom pulley notch. Form: Humiston Forearm Blueprint: Stand tight to the tower and drag your hands straight up your torso, driving your elbows directly backward. Bypasses dominant bicep heads to isolate the brachioradialis and brachialis width."
  },
  {
    id: "forearm-kettlebell-curl",
    name: "Forearm Kettlebell Curl",
    category: "Arms",
    equipment: "Other",
    correctForm: "Setup: Support your forearm flat on a bench and lean your torso directly toward your working side to align diagonal flexor fibres. Form: Fingertip Mechanical Drop-Set: Roll handle out fully into fingertips for a deep stretch, flex fingers closed, then flex wrist. At finger failure, lock your grip tight and finish with pure wrist flexion reps to absolute failure."
  },
  {
    id: "incline-bench-guillotine-press-smith-machine",
    name: "Incline Bench Guillotine Press (Smith Machine)",
    category: "Chest",
    equipment: "Machine",
    correctForm: "Setup: Lock the bench into a low 30-degree incline (first notch above flat on Primal Strength setup). Set Smith Machine safety stoppers. Form: Use a wide grip with elbows flared strictly at 90 degrees. Lower the bar smoothly to your lower neck/chin area, stopping strictly 2 inches short of throat. Keep scapulae retracted to protect joint capsule."
  },
  {
    id: "seated-row-machine-upper-b",
    name: "Seated Row (Machine - Upper B)",
    category: "Back",
    equipment: "Machine",
    correctForm: "Setup: Seated selectorised row machine. Form: Utilise the vertical grip option. Drive your elbows back tight along your ribs; focus on intense mid-back retraction at peak contraction with zero torso sway or kinetic momentum."
  },
  {
    id: "kinesis-chest-fly",
    name: "Kinesis Chest Fly",
    category: "Chest",
    equipment: "Cables",
    correctForm: "Setup: Drop the seat entirely to the floor and pull from the bottom free-moving handles. Form: Keep your shoulders depressed, sweep your arms in a low-to-high trajectory, and force the inner sternocostal chest fibres together at the peak."
  },
  {
    id: "unilateral-scapular-plane-lateral-raise-machine",
    name: "Unilateral Scapular-Plane Lateral Raise (Machine)",
    category: "Shoulders",
    equipment: "Machine",
    correctForm: "Setup: Seated lateral raise machine, executed unilaterally. Form: Humiston Overhaul: Sit slightly sideways on the pad to align with your scapular plane. Keep your palms turned strictly down (internal humerus rotation). Pre-protract your shoulder blades (flare lats) at the bottom starting point as a wedge and raise strictly to 90 degrees only."
  },
  {
    id: "lat-pullaround",
    name: "Lat Pullaround",
    category: "Back",
    equipment: "Cables",
    correctForm: "Setup: Single handle set to Cable Height: 12. Form: Retract your shoulder blade dynamically on the pull and wrap your elbow completely around your torso to target the lower lat insertions."
  },
  {
    id: "incline-overhead-triceps-extension-cable",
    name: "Incline Overhead Triceps Extension (Cable)",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Setup: Bench placed in front of bottom pulley stack. Form: Treat your elbow strictly as a fixed fulcrum point and flex over the top of it. Lower the rope into a deep 2-second stretched negative behind your head, and terminate your extension just short of full joint lockout to trap tension on the long head."
  },
  {
    id: "bayesian-curl-cable",
    name: "Bayesian Curl (Cable)",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Setup: Single D-handle at bottom pulley notch, stand facing completely away from the stack. Form: Pin your working elbow tightly in space slightly behind your hip line. Allow your torso to lean slightly backward relative to the vertical line of the cable to overload peak mechanical tension at maximum bicep length."
  },
  {
    id: "heavy-isometric-wall-sit",
    name: "Heavy Isometric Wall Sit",
    category: "Legs",
    equipment: "Bodyweight",
    correctForm: "Setup: Back flat against a solid wall. Form: Mandatory pre-load before any lower body compound. Hold a static position with a strict 90-degree angle at the knee joints. Induces cortical inhibition and triggers a vital analgesic effect to numb Patellar Tendonitis (Jumper's Knee)."
  },
  {
    id: "calf-press-on-leg-press",
    name: "Calf Press on Leg Press",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Setup: Place balls of feet on bottom edge of the leg press sled, heels free. Form: Double-Pause Protocol: Execute a strict 3-second pause at both extremes (deep stretched bottom and contracted top) to completely dissipate Achilles stretch reflex. Gastrocnemius Head Targeting: Set 1 toes straight, Set 2 toes turned slightly inward, Set 3 toes turned slightly outward."
  },
  {
    id: "barbell-or-machine-hip-thrust",
    name: "Barbell or Machine Hip Thrust",
    category: "Glutes",
    equipment: "Barbell",
    correctForm: "Setup: Position upper back securely on a bench and place the padded barbell or hip belt across your pelvis. Form: Non-Deadlift Posterior Pivot: Plant feet firmly so your shins are perfectly vertical at the top of the extension. Drive directly through your heels and lock out at peak contraction by tucking your pelvis into an explicit posterior pelvic tilt, isolating glutes with zero lumbar load."
  },
  {
    id: "forty-five-degree-back-extension-glute-hamstring-biased",
    name: "45-Degree Back Extension (Glute/Hamstring Biased)",
    category: "Back",
    equipment: "Other",
    correctForm: "Setup: Adjust the hip pad just below your pelvic crest so your torso can hinge freely. Form: Internally rotate your feet slightly (toes pointed inward) and round your upper back deliberately. Hinge down smoothly to expose the glutes and upper hamstrings to a maximal structural stretch, then contract your glutes hard to pull your torso up, stopping short of hyperextension."
  }
];

// Reusable definitions of Upper Body A, Upper Body B, Lower Body A, Lower Body B
export const DEFAULT_ROUTINES: WorkoutSession[] = [
  {
    id: "template-upper-body-a",
    name: "Upper Body A",
    startTime: new Date().toISOString(),
    isTemplate: true,
    exercises: [
      {
        id: "ex-upper-a-1",
        exerciseId: "iso-lateral-chest-press-machine",
        sets: [
          { id: "set-ua1-1", weight: 80, reps: 8, type: "normal", isCompleted: false },
          { id: "set-ua1-2", weight: 80, reps: 8, type: "normal", isCompleted: false },
          { id: "set-ua1-3", weight: 80, reps: 8, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-upper-a-2",
        exerciseId: "pendlay-row",
        sets: [
          { id: "set-ua2-1", weight: 60, reps: 8, type: "normal", isCompleted: false },
          { id: "set-ua2-2", weight: 60, reps: 8, type: "normal", isCompleted: false },
          { id: "set-ua2-3", weight: 60, reps: 8, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-upper-a-3",
        exerciseId: "knees-up-gironda-dip",
        sets: [
          { id: "set-ua3-1", weight: 0, reps: 12, type: "failure", isCompleted: false },
          { id: "set-ua3-2", weight: 0, reps: 12, type: "failure", isCompleted: false },
          { id: "set-ua3-3", weight: 0, reps: 12, type: "failure", isCompleted: false }
        ]
      },
      {
        id: "ex-upper-a-4",
        exerciseId: "plate-loaded-high-row",
        sets: [
          { id: "set-ua4-1", weight: 70, reps: 10, type: "normal", isCompleted: false },
          { id: "set-ua4-2", weight: 70, reps: 10, type: "normal", isCompleted: false },
          { id: "set-ua4-3", weight: 70, reps: 10, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-upper-a-5",
        exerciseId: "seated-sagittal-db-overhead-press",
        sets: [
          { id: "set-ua5-1", weight: 15, reps: 10, type: "normal", isCompleted: false },
          { id: "set-ua5-2", weight: 15, reps: 10, type: "normal", isCompleted: false },
          { id: "set-ua5-3", weight: 15, reps: 10, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-upper-a-6",
        exerciseId: "hammer-strength-pec-deck",
        sets: [
          { id: "set-ua6-1", weight: 42.5, reps: 12, type: "normal", isCompleted: false },
          { id: "set-ua6-2", weight: 42.5, reps: 12, type: "normal", isCompleted: false },
          { id: "set-ua6-3", weight: 42.5, reps: 12, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-upper-a-7",
        exerciseId: "cable-drag-hammer-curl",
        sets: [
          { id: "set-ua7-1", weight: 35, reps: 12, type: "normal", isCompleted: false },
          { id: "set-ua7-2", weight: 35, reps: 12, type: "normal", isCompleted: false },
          { id: "set-ua7-3", weight: 35, reps: 12, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-upper-a-8",
        exerciseId: "forearm-kettlebell-curl",
        sets: [
          { id: "set-ua8-1", weight: 16, reps: 10, type: "failure", isCompleted: false },
          { id: "set-ua8-2", weight: 16, reps: 10, type: "failure", isCompleted: false },
          { id: "set-ua8-3", weight: 16, reps: 10, type: "failure", isCompleted: false }
        ]
      }
    ]
  },
  {
    id: "template-upper-body-b",
    name: "Upper Body B",
    startTime: new Date().toISOString(),
    isTemplate: true,
    exercises: [
      {
        id: "ex-upper-b-1",
        exerciseId: "incline-bench-guillotine-press-smith-machine",
        sets: [
          { id: "set-ub1-1", weight: 25, reps: 10, type: "normal", isCompleted: false },
          { id: "set-ub1-2", weight: 25, reps: 10, type: "normal", isCompleted: false },
          { id: "set-ub1-3", weight: 25, reps: 10, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-upper-b-2",
        exerciseId: "seated-row-machine-upper-b",
        sets: [
          { id: "set-ub2-1", weight: 30, reps: 10, type: "normal", isCompleted: false },
          { id: "set-ub2-2", weight: 30, reps: 10, type: "normal", isCompleted: false },
          { id: "set-ub2-3", weight: 30, reps: 10, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-upper-b-3",
        exerciseId: "kinesis-chest-fly",
        sets: [
          { id: "set-ub3-1", weight: 17.5, reps: 12, type: "normal", isCompleted: false },
          { id: "set-ub3-2", weight: 17.5, reps: 12, type: "normal", isCompleted: false },
          { id: "set-ub3-3", weight: 17.5, reps: 12, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-upper-b-4",
        exerciseId: "unilateral-scapular-plane-lateral-raise-machine",
        sets: [
          { id: "set-ub4-1", weight: 27.5, reps: 12, type: "normal", isCompleted: false },
          { id: "set-ub4-2", weight: 27.5, reps: 12, type: "normal", isCompleted: false },
          { id: "set-ub4-3", weight: 27.5, reps: 12, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-upper-b-5",
        exerciseId: "lat-pullaround",
        sets: [
          { id: "set-ub5-1", weight: 35, reps: 12, type: "normal", isCompleted: false },
          { id: "set-ub5-2", weight: 35, reps: 12, type: "normal", isCompleted: false },
          { id: "set-ub5-3", weight: 35, reps: 12, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-upper-b-6",
        exerciseId: "incline-overhead-triceps-extension-cable",
        sets: [
          { id: "set-ub6-1", weight: 35, reps: 10, type: "normal", isCompleted: false },
          { id: "set-ub6-2", weight: 35, reps: 10, type: "normal", isCompleted: false },
          { id: "set-ub6-3", weight: 35, reps: 10, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-upper-b-7",
        exerciseId: "bayesian-curl-cable",
        sets: [
          { id: "set-ub7-1", weight: 18.5, reps: 12, type: "normal", isCompleted: false },
          { id: "set-ub7-2", weight: 18.5, reps: 12, type: "normal", isCompleted: false },
          { id: "set-ub7-3", weight: 18.5, reps: 12, type: "normal", isCompleted: false }
        ]
      }
    ]
  },
  {
    id: "template-lower-body-a",
    name: "Lower Body A",
    startTime: new Date().toISOString(),
    isTemplate: true,
    exercises: [
      {
        id: "ex-lower-a-1",
        exerciseId: "heavy-isometric-wall-sit",
        sets: [
          { id: "set-la1-1", weight: 30, reps: 45, type: "normal", isCompleted: false },
          { id: "set-la1-2", weight: 30, reps: 45, type: "normal", isCompleted: false },
          { id: "set-la1-3", weight: 30, reps: 45, type: "normal", isCompleted: false },
          { id: "set-la1-4", weight: 30, reps: 45, type: "normal", isCompleted: false },
          { id: "set-la1-5", weight: 30, reps: 45, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-lower-a-2",
        exerciseId: "hack-squat",
        sets: [
          { id: "set-la2-1", weight: 60, reps: 9, type: "normal", isCompleted: false },
          { id: "set-la2-2", weight: 60, reps: 9, type: "normal", isCompleted: false },
          { id: "set-la2-3", weight: 60, reps: 9, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-lower-a-3",
        exerciseId: "lying-leg-curl",
        sets: [
          { id: "set-la3-1", weight: 35, reps: 11, type: "normal", isCompleted: false },
          { id: "set-la3-2", weight: 35, reps: 11, type: "normal", isCompleted: false },
          { id: "set-la3-3", weight: 35, reps: 11, type: "failure", isCompleted: false }
        ]
      },
      {
        id: "ex-lower-a-4",
        exerciseId: "leg-press",
        sets: [
          { id: "set-la4-1", weight: 80, reps: 11, type: "normal", isCompleted: false },
          { id: "set-la4-2", weight: 80, reps: 11, type: "normal", isCompleted: false },
          { id: "set-la4-3", weight: 60, reps: 12, type: "drop", isCompleted: false }
        ]
      },
      {
        id: "ex-lower-a-5",
        exerciseId: "calf-press-on-leg-press",
        sets: [
          { id: "set-la5-1", weight: 60, reps: 13, type: "normal", isCompleted: false },
          { id: "set-la5-2", weight: 60, reps: 13, type: "normal", isCompleted: false },
          { id: "set-la5-3", weight: 60, reps: 13, type: "normal", isCompleted: false }
        ]
      }
    ]
  },
  {
    id: "template-lower-body-b",
    name: "Lower Body B",
    startTime: new Date().toISOString(),
    isTemplate: true,
    exercises: [
      {
        id: "ex-lower-b-1",
        exerciseId: "heavy-isometric-wall-sit",
        sets: [
          { id: "set-lb1-1", weight: 30, reps: 45, type: "normal", isCompleted: false },
          { id: "set-lb1-2", weight: 30, reps: 45, type: "normal", isCompleted: false },
          { id: "set-lb1-3", weight: 30, reps: 45, type: "normal", isCompleted: false },
          { id: "set-lb1-4", weight: 30, reps: 45, type: "normal", isCompleted: false },
          { id: "set-lb1-5", weight: 30, reps: 45, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-lower-b-2",
        exerciseId: "barbell-or-machine-hip-thrust",
        sets: [
          { id: "set-lb2-1", weight: 60, reps: 10, type: "normal", isCompleted: false },
          { id: "set-lb2-2", weight: 60, reps: 10, type: "normal", isCompleted: false },
          { id: "set-lb2-3", weight: 60, reps: 10, type: "normal", isCompleted: false }
        ]
      },
      {
        id: "ex-lower-b-3",
        exerciseId: "forty-five-degree-back-extension-glute-hamstring-biased",
        sets: [
          { id: "set-lb3-1", weight: 0, reps: 12, type: "normal", isCompleted: false },
          { id: "set-lb3-2", weight: 0, reps: 12, type: "normal", isCompleted: false },
          { id: "set-lb3-3", weight: 0, reps: 12, type: "normal", isCompleted: false }
        ]
      }
    ]
  }
];
