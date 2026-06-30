/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Exercise {
  id: string;
  name: string;
  category: string; // e.g. "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"
  equipment: string; // e.g. "Barbell", "Dumbbell", "Machine", "Cables", "Bodyweight", "Other"
  isCustom?: boolean;
  correctForm?: string;
  videoLink?: string;        // YouTube or online guide video URL
  mediaUrl?: string;         // Self-uploaded image/video preview (as a Base64 string or URL)
  mediaType?: "image" | "video";
  setupInstructions?: string; // Custom granular setup guide text
  formMechanics?: string;     // Custom granular body form text
  coachTip?: string;          // Custom coach tip
  primaryTarget?: string;     // Custom primary muscle target list
  secondaryTarget?: string | string[]; // Custom secondary muscle target list
  metValue?: number;          // Estimated Metabolic Equivalent of Task score
  modality?: "WEIGHTED" | "BODYWEIGHT" | "CARDIO"; // Training modality for sports-science diagnostics
}

export type SetType = "normal" | "warmup" | "drop" | "failure";

export interface WorkoutSet {
  id: string;
  weight: number; // in kg (or lb)
  reps: number;
  duration?: number; // total seconds for cardio
  rpe?: number; // 1-10 string or number
  isCompleted: boolean;
  type: SetType;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
  supersetId?: string; // Optional identifier to group exercises as a superset
  restTime?: number;   // Customizable rest timer in seconds for this exercise
  barWeight?: number;  // Customizable bar weight (e.g., 20kg for olympic barbell)
}

export interface UserProfile {
  biologicalSex: "Male" | "Female" | "Other" | "Prefer not to say";
  age: number;        // Years
  heightCm: number;   // Stored strictly in centimetres
  weightKg: number;   // Stored strictly in kilograms
  primaryGoal: "Hypertrophy" | "Strength" | "Cardiovascular Endurance" | "Weight Loss" | "General Fitness";
  preferredUnits: "Metric" | "Imperial";
  trainingExperience?: "Beginner" | "Intermediate" | "Advanced"; // optional on legacy profiles
  daysPerWeek?: number;                                          // training days per week (1-7)
}

export interface WorkoutSession {
  id: string;
  name: string;
  startTime: string; // ISO string
  endTime?: string;  // ISO string, present only when completed
  exercises: WorkoutExercise[];
  notes?: string;
  isTemplate?: boolean;
  analysis?: any;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "gemini";
  text: string;
  timestamp: string;
  status?: "sending" | "error" | "done";
}

// Structured action sent by Gemini to mutate the frontend workout state
export type AIAction =
  | {
      type: "START_WORKOUT";
      payload: { name: string; templateId?: string; exercises?: { exerciseId: string; sets: { weight: number; reps: number; type: SetType }[] }[] };
    }
  | {
      type: "ADD_SET";
      payload: { exerciseId: string; weight: number; reps: number; type?: SetType };
    }
  | {
      type: "UPDATE_SET";
      payload: { exerciseId: string; setIndex: number; fields: Partial<WorkoutSet> };
    }
  | {
      type: "REMOVE_SET";
      payload: { exerciseId: string; setIndex: number };
    }
  | {
      type: "ADD_EXERCISE";
      payload: { exerciseId: string };
    }
  | {
      type: "REMOVE_EXERCISE";
      payload: { exerciseId: string };
    }
  | {
      type: "LOG_WORKOUT";
      payload: { name: string; date?: string; duration?: number; exercises: { exerciseId: string; sets: { weight: number; reps: number; type: SetType; isCompleted: boolean }[] }[]; notes?: string };
    }
  | {
      type: "CREATE_TEMPLATE";
      payload: { name: string; exercises: { exerciseId: string; sets: { weight: number; reps: number; type: SetType }[] }[]; notes?: string };
    }
  | {
      type: "DELETE_LOG";
      payload: { logId: string };
    }
  | {
      type: "UPDATE_ACTIVE_NOTES";
      payload: { notes: string };
    }
  | {
      type: "FINISH_WORKOUT";
      payload: {};
    };

export interface AIResponse {
  message: string;
  actions?: AIAction[];
}
