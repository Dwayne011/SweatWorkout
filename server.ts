// Author: Google AI Studio Coding Agent
// OS support: All (Web, Android, iOS)
// Description: Express server providing REST endpoints, Google Sheets bridges, and Gemini model orchestrations.

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Model name is a config value so it can be swapped without code changes.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";

// Firebase Admin — used only to VERIFY caller ID tokens. Verification needs the
// project id (public certs are fetched from Google), no service account. On
// Cloud Run GOOGLE_CLOUD_PROJECT is injected automatically.
const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "gen-lang-client-0615336375";
try {
  if (!getApps().length) initializeApp({ projectId: FIREBASE_PROJECT_ID });
} catch (e) {
  console.error("Firebase Admin init failed:", e);
}

// Reject any AI call without a valid Firebase ID token. Always JSON, never HTML.
async function verifyAuth(req: any, res: any, next: any) {
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    res.status(401).json({ error: "auth_required", message: "Sign in to use the coach features." });
    return;
  }
  try {
    const decoded = await getAuth().verifyIdToken(token);
    (req as any).uid = decoded.uid;
    next();
  } catch (e) {
    res.status(401).json({ error: "auth_invalid", message: "Your session has expired. Sign in again." });
  }
}

const keyConfigured = () =>
  !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Route for Gemini Command Processing
  app.post("/api/ai/command", verifyAuth, async (req, res) => {
    try {
      const { message, currentState, chatHistory } = req.body;

      if (!message) {
        res.status(400).json({ error: "Missing message field" });
        return;
      }

      // Check if API key is loaded
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        res.status(500).json({
          error: "Gemini API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.",
        });
        return;
      }

      // Assemble the context details to make the prompt fully grounded in the user's environment
      const exercisesList = currentState.exercises || [];
      const templatesList = currentState.templates || [];
      const historyList = currentState.history || [];
      const activeWorkout = currentState.activeWorkout || null;

      const systemPrompt = `You are an expert AI Strength & Conditioning Coach and direct interface assistant for the Workout Tracker application (designed like the Strong app).
Your mission is to understand user intentions (logging exercises, modifying sets, creating templates, explaining progress) and output BOTH a conversational assistant text response AND/OR a list of structured state mutations (actions).

=== USER DATA CONTEXT ===
- ACTIVE SEESION (Current active workout): ${JSON.stringify(activeWorkout)}
- EXISTING EXERCISES (Use IDs here): ${JSON.stringify(exercisesList)}
- SAVED ROUTINE TEMPLATES: ${JSON.stringify(templatesList)}
- WORKOUT HISTORY LOGS: ${JSON.stringify(historyList.slice(0, 10))} (Last 10 workouts)

=== CAPABILITIES & ACTIONS ===
You can return a list of "actions" that will be executed in real-time in the user's application. You can execute multiple actions in a single response to coordinate complex updates.

Supported Actions:
1. START_WORKOUT
   - Starts a blank active workout, or starts a routine based on a template.
   - Payload: { "name": string, "templateId"?: string, "exercises"?: { exerciseId: string; sets: { weight: number, reps: number, type: "normal" | "warmup" | "drop" | "failure" }[] }[] }
2. ADD_EXERCISE
   - Adds a new exercise to the ACTIVE workout.
   - Payload: { "exerciseId": string }
3. REMOVE_EXERCISE
   - Removes an exercise and all its sets from the ACTIVE workout.
   - Payload: { "exerciseId": string }
4. ADD_SET
   - Appends a set to a specific exercise in the ACTIVE workout.
   - Payload: { "exerciseId": string, "weight": number, "reps": number, "type"?: "normal" | "warmup" | "drop" | "failure" }
5. UPDATE_SET
   - Edits properties of a specific set belonging to an exercise in the ACTIVE workout (using 0-indexed set position).
   - Payload: { "exerciseId": string, "setIndex": number, "fields": { "weight"?: number, "reps"?: number, "isCompleted"?: boolean, "type"?: "normal" | "warmup" | "drop" | "failure" } }
6. REMOVE_SET
   - Deletes a set from an exercise in the ACTIVE workout.
   - Payload: { "exerciseId": string, "setIndex": number }
7. LOG_WORKOUT
   - Logs a completed workout session directly to history (great for adding historic workouts).
   - Payload: { "name": string, "date"?: string (ISO or YYYY-MM-DD), "duration"?: number, "exercises": { "exerciseId": string, "sets": { "weight": number, "reps": number, "type": "normal" | "warmup" | "drop" | "failure", "isCompleted": boolean }[] }[], "notes"?: string }
8. CREATE_TEMPLATE
   - Creates a reusable workout routine template.
   - Payload: { "name": string, "exercises": { "exerciseId": string, "sets": { "weight": number, "reps": number, "type": "normal" | "warmup" | "drop" | "failure" }[] }[], "notes"?: string }
9. DELETE_LOG
   - Deletes a workout log from history.
   - Payload: { "logId": string }
10. UPDATE_ACTIVE_NOTES
    - Updates the notes field in the ACTIVE workout session.
    - Payload: { "notes": string }
11. FINISH_WORKOUT
    - Saves the current ACTIVE workout, completing and logging it to history.
    - Payload: {}

=== STRICT LOGICAL GUIDELINES ===
- If a user says "start a bicep session", "start chest day", "set up a shoulder workout", or any other muscle/goal-specific routine, do NOT launch a blank active workout. You MUST search the "EXISTING EXERCISES" list for 3-5 exercises belonging to that category (e.g., biceps, chest, shoulders, legs, core), and pre-populate the "exercises" array in the START_WORKOUT payload. Each exercise should contain 3 standard, non-completed sets (e.g., 10-12 reps with appropriate typical starter weights like 15-20kg for curls, 40-60kg for bench, etc.) so that the workout starts pre-filled and structured rather than blank!
- If the user's logging command is ambiguous, incomplete, or missing key metrics (for example: they say "Log some squats", "Log my workout", or "Log a set of squats" but leave out the weight in kg or the number of repetitions):
  * You MUST NOT output any mutations under "actions". Keep the "actions" array empty.
  * Instead, ask the user a polite, specific strength-and-conditioning coach question in your conversational "message" to clarify the missing details (e.g., "I'd love to log that squat set for you! What weight did you use in kg, and how many reps did you complete?").
- If the user specifies an exercise name that does not exist in the "EXISTING EXERCISES" list and matches absolutely no standard category or known exercise synonyms:
  * Do NOT guess a blank or random existing exercise.
  * Instead, leave the "actions" array empty and ask them for confirmation in your conversational "message" if they want you to map it to a similar movement, or if they would like to create a Custom Exercise first.
- If an active workout session is currently running, and the user asks to "log a set of squats...", or requests direct history records, ask them clearly if they'd like this set appended to their active workout or saved separately in history.
- When logging directly to history (LOG_WORKOUT), you should actively notify the user in your conversational "message" that they can customize the logged duration, date, or add extra notes by replying to you (e.g., "I've successfully logged that squat session under your history! Would you like to adjust the custom duration, date, or add notes?").
- If a user says "log a set of bench press 80kg for 12 reps" or "log a set of squats/deadlifts...", or requests to save a completed set/workout directly, and there is NO active session currently running:
  * You MUST use "LOG_WORKOUT" to record it directly into history so that it appears in their History tab instantly!
  * Ensure every set inside the "LOG_WORKOUT" payload has "isCompleted": true, with the non-zero weight and reps included, so that their total lifting volume and set count are calculated and displayed correctly immediately.
- If they say "track a set of bench press ...", "add a set of squats to my active workout", or say "log/track a set" while an ACTIVE SESSION is currently running:
  * Check if an active workout exists. If not, start one with 'START_WORKOUT' and 'ADD_SET'.
  * If an active workout is already running, produce an 'ADD_SET' action (which appends a set to the specified exercise).
- For matching exercises, search "EXISTING EXERCISES" to find the closest matches (e.g., "squats" -> "squat-barbell", "bench press" -> "bench-press-barbell", "deadlift" -> "deadlift-barbell"). ONLY instruct the user to create a Custom Exercise if it represents something entirely novel.
- Maintain a warm, encouraging, athletic-coach-like persona in your "message" text. Keep instructions highly practical. Never list raw JSON code in your conversational message. Use beautiful Markdown formatting to make set listings scan elegantly.`;

      const contents = [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nChat History:\n${JSON.stringify(chatHistory || [])}\n\nUser Input: "${message}"` }] }
      ];

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              message: {
                type: Type.STRING,
                description: "Conversational response in markdown explaining what was changed or answering queries.",
              },
              actions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: "One of: START_WORKOUT | ADD_EXERCISE | REMOVE_EXERCISE | ADD_SET | UPDATE_SET | REMOVE_SET | LOG_WORKOUT | CREATE_TEMPLATE | DELETE_LOG | UPDATE_ACTIVE_NOTES | FINISH_WORKOUT",
                    },
                    payload: {
                      type: Type.OBJECT,
                      description: "Payload parameters for the action",
                    },
                  },
                  required: ["type", "payload"],
                },
                description: "The list of structural actions to mutate state. Leave empty if only answering a general training question.",
              },
            },
            required: ["message"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini AI");
      }

      const parsedResponse = JSON.parse(responseText.trim());
      res.json(parsedResponse);
    } catch (error) {
      console.error("AI Assistant Endpoint Error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal Server Error in Gemini Command handler",
      });
    }
  });

  app.post("/api/ai/generate-workout", verifyAuth, async (req, res) => {
    try {
      const { goal, fitnessLevel, equipment, includePastHistory, feedback, exercisesList, historyList, userProfile, rpeTarget, weightModifier } = req.body;

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        res.status(500).json({
          error: "Gemini API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.",
        });
        return;
      }

      const prompt = `You are an expert Strength & Conditioning Coach.
Generate a personalized, fully-structured workout template based on the user's specific fitness goals, experience level, and available gear.

User's Training Request:
- Goal: "${goal}"
- Fitness Level: "${fitnessLevel}"
- Equipment available: "${equipment}"
- Past History inclusion: ${includePastHistory ? "Yes, analyze user's historical performance to tailor sets and weights appropriately" : "No, start with standard baselines"}
- Target Effort Intensity (RPE - Rate of Perceived Exertion): RPE ${rpeTarget || "8"} (RPE 7 = 3 reps in reserve, 8 = 2 reps in reserve, 9 = 1 rep in reserve, 10 = absolute limit/failure)
- Custom Weight Modifier Bias: ${weightModifier ? (weightModifier > 0 ? `+${weightModifier}%` : `${weightModifier}%`) : "0% (Auto)"} (Scale recommended weights by this exact percentage)
- Special feedback/constraints: "${feedback || "None"}"

User's Body Profile & Metrics:
- Biological Sex: "${userProfile?.biologicalSex || "Prefer not to say"}"
- Age: ${userProfile?.age || 30} yrs
- Body Weight: ${userProfile?.weightKg || 70} kg (approx ${Math.round((userProfile?.weightKg || 70) * 2.20462)} lbs)
- Height: ${userProfile?.heightCm || 170} cm (approx ${Math.round((userProfile?.heightCm || 170) / 2.54)} inches)
- Preferred Units: "${userProfile?.preferredUnits || "Metric"}"

User Context data:
- Known Exercises (Use the exact "id" from this list where matching, or recommend standard keys):
${JSON.stringify(exercisesList || [])}
- Last few workouts parsed:
${JSON.stringify((historyList || []).slice(0, 5))}

HOW TO CALCULATE TARGET WEIGHTS (STRICT FORMULAIC INSTRUCTIONS):
1. BODYWEIGHT EXERCISES:
   - For any bodyweight exercises (e.g. Pull-ups, Push-ups, Dips, Hanging Leg Raises), the weight MUST be exactly 0 (kg).
2. BARBELL / HEAVY COMPOUND EXERCISES:
   - If 'Past History' is empty OR contains no matching performance logs for the recommended exercise:
     - Estimate standard beginner/intermediate/advanced baselines as a percentage of their Body Weight ('weightKg').
     - Squats: Beginner = 0.6x body weight. Intermediate = 1.0x body weight. Advanced = 1.4x body weight.
     - Bench Press: Beginner = 0.4x body weight. Intermediate = 0.7x body weight. Advanced = 1.0x body weight.
     - Deadlift: Beginner = 0.8x body weight. Intermediate = 1.2x body weight. Advanced = 1.6x body weight.
     - Shoulder Press: Beginner = 0.25x body weight. Intermediate = 0.45x body weight. Advanced = 0.65x body weight.
     - (Scale down baseline weight estimates by an extra 30% if Biological Sex is 'Female' or user is in older age brackets for safety).
   - If 'Past History' HAS matching exercises and includePastHistory is true:
     - Identify the max weight they successfully lifted for that exercise in their history.
     - Calculate target base load at 10-reps max:
       - For 'Build Muscle' / Hypertrophy goals: set target weight to 75%-80% of historical max capability.
       - For 'Gain Strength' / Strength goals: set target weight to 85%-90% of historical max capability.
       - For 'Cardio' / 'Endurance': set target weight to 50%-60% of historical max capability.
3. SCALE WEIGHT BY THE WEIGHT MODIFIER BIAS:
   - Take the calculated target weight from step 1/2 and apply the Custom Weight Modifier Bias (e.g., if target is 100kg and modifier bias is +10%, increase target to 110kg; if bias is -20%, reduce target to 80kg).
4. INCORPORATE TARGET INTENSITY (RPE):
   - At closer proximity to RPE 10, reps should be lower or sets should have slightly higher weight to induce fatigue safely, whereas RPE 7 suggests leaving 3 reps in reserve. Adjust weights or reps slightly to match the selected RPE.
5. All weight recommendations MUST be in kg (SI units). Convert to kg if referencing raw logs in pounds, then round to the nearest 0.5kg or 2.5kg increment (for plates scaling).

Your Output:
You MUST output a structured JSON plan following the required response schema. Match exercises from 'Known Exercises' by using the exact 'id' value (e.g., "bench-press-barbell", "squat-barbell", etc.) to maintain data references.
Provide a clear, personal, motivating S&C response (2-3 sentences max) under 'reasoning' explaining why this exercise combination and set structure is ideal for them. Include helpful coach pointers under 'notes' for each exercise.`;

      const contents = [
        { role: "user", parts: [{ text: prompt }] }
      ];

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedName: {
                type: Type.STRING,
                description: "Name of the routine (e.g., 'Core Torch & Conditioning', 'Garage Dumbbell Power', etc.)"
              },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    exerciseId: {
                      type: Type.STRING,
                      description: "The ID of the closest matching exercise from the provided Known Exercises list. MUST be one of the IDs in the user's exercises list."
                    },
                    sets: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          weight: { type: Type.NUMBER, description: "Target weight in kg (0 for bodyweight exercises)" },
                          reps: { type: Type.INTEGER, description: "Target repetitions for muscle failure/stimulus" },
                          type: { type: Type.STRING, description: "One of: normal | warmup | drop | failure" }
                        },
                        required: ["weight", "reps", "type"]
                      }
                    },
                    notes: { type: Type.STRING, description: "Brief posture, tempo, or physical coaching pointers" }
                  },
                  required: ["exerciseId", "sets"]
                }
              },
              reasoning: {
                type: Type.STRING,
                description: "Personalized coaching feedback (2-3 sentences) on why this works for their goals, equipment, and fitness level."
              }
            },
            required: ["recommendedName", "exercises", "reasoning"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini workout generator");
      }

      res.json(JSON.parse(responseText.trim()));
    } catch (error) {
      console.error("AI Workout Generator Error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal Server Error in Gemini Workout Generator",
      });
    }
  });

  // API Route for AI Workout Finisher & Progression Analyst
  app.post("/api/ai/analyze-workout", verifyAuth, async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        res.status(500).json({
          error: "Gemini API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.",
        });
        return;
      }

      const { workout, history, modality } = req.body;
      const isScoredWorkout = !!(modality || (workout && workout.modality));

      if (isScoredWorkout) {
        const payload = modality ? req.body : workout;
        const scoredPrompt = `You are a deeply professional, world-class athletic coach and physical conditioning expert.
Your task is to ingest a pre-calculated workout score object alongside the post session details and generate a deep, highly tailored post-workout summary for the user.

Here is the exact workout metrics payload:
${JSON.stringify(payload, null, 2)}

DATA HANDLING & CONDITIONAL ROUTING RULES:
1. STRICT TRUTH DATA GUARD: You must never compute, guess, or approximate any metrics, scores, or volume targets. Read the 'overallScore', 'strengthBreakdown', and 'cardioBreakdown' keys as absolute, verified facts. If a value is null, treat it as non-existent for that session.
2. HYBRID EVALUATION: If modality is 'HYBRID', you must evaluate the relationship between the lifting and cardio volumes. Address how the time split impacts muscle hypertrophy adaptation, recovery windows, and whether the cardio intensity risks blunting their strength progression.
3. PURE STRENGTH EVALUATION: If modality is 'STRENGTH', completely omit all mentions of cardiovascular systems, conditioning, or aerobic conditioning. Focus entirely on progressive overload, mechanical tension, total tonnage, and localized recovery.
4. PURE CARDIO EVALUATION: If modality is 'CARDIO', completely omit all references to lifting, tonnage, weights, or hypertrophy. Focus entirely on cardiovascular energy pathways, duration efficiency, and systemic load thresholds.

OUTPUT FORMATTING SPECIFICATIONS:
Generate a crisp breakdown structured into these three high-impact sections:

- PERFORMANCE ANALYSIS: A deeply analytical review of the session's verified score inputs, explaining what the metrics indicate about today's outputs relative to their historical baselines.
- BIOMECHANICAL & ADAPTAPTION PROFILE: Address recovery requirements based strictly on the active training modalities present. If hybrid, explicitly flag any concurrent interference risks.
- NEXT-SESSION ACTIONABLE COACHING CUE: Provide exactly one highly tactical, technique or recovery instruction to focus on during their next scheduled training block.

Voice/Grammar: Maintain a deeply professional, highly encouraging, and objective coaching voice. All outputs must use impeccable UK English grammar and spelling standards (e.g., utilising, prioritised, muscle fibres, labour, metabolised, recovery, adaptive, systemic, overload). Do not invent data points under any circumstances.

Your response must be structured as valid JSON matching the specified response schema exactly.`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: [{ role: "user", parts: [{ text: scoredPrompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                performanceAnalysis: {
                  type: Type.STRING,
                  description: "A deeply analytical review of the session's verified score inputs using impeccable UK English spelling."
                },
                biomechanicalProfile: {
                  type: Type.STRING,
                  description: "Recovery analysis based strictly on active training modalities present using impeccable UK English spelling. Address concurrent interference risks if hybrid."
                },
                nextSessionActionableCue: {
                  type: Type.STRING,
                  description: "Exactly one highly tactical instruction for next scheduled block using impeccable UK English spelling."
                },
                congratulations: {
                  type: Type.STRING,
                  description: "A brief, highly professional encouraging sentence in UK English."
                }
              },
              required: ["performanceAnalysis", "biomechanicalProfile", "nextSessionActionableCue", "congratulations"]
            }
          }
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error("Empty response from Gemini AI scored analyst.");
        }

        const parsed = JSON.parse(responseText.trim());
        const fullSummaryMarkdown = `- PERFORMANCE ANALYSIS: ${parsed.performanceAnalysis}\n\n- BIOMECHANICAL & ADAPTAPTION PROFILE: ${parsed.biomechanicalProfile}\n\n- NEXT-SESSION ACTIONABLE COACHING CUE: ${parsed.nextSessionActionableCue}`;

        res.json({
          congratulations: parsed.congratulations,
          summaryFeedback: fullSummaryMarkdown,
          nextSessionRecommendations: `- ${parsed.nextSessionActionableCue}`,
          strengthChanges: [],
          muscleGroupImpact: [],
          performanceAnalysis: parsed.performanceAnalysis,
          biomechanicalProfile: parsed.biomechanicalProfile,
          nextSessionActionableCue: parsed.nextSessionActionableCue,
          fullSummaryMarkdown: fullSummaryMarkdown,
          summary: fullSummaryMarkdown
        });
        return;
      }

      const prompt = `You are an expert strength and conditioning trainer.
Analyze the user's completed workout and compare it against their past workout history to evaluate strength progress and deliver actionable guidance.

Completed Session:
${JSON.stringify(workout)}

Past Workout History:
${JSON.stringify((history || []).slice(0, 10))}

CRITICAL DIRECTIONS:
1. ABSOLUTE EXCLUSION OF RANGE OF MOTION REMARKS: Under no circumstances should you make claims about, comment on, or praise the user's "Range of Motion" (ROM) (e.g., "excellent range of motion" or "full range of motion"). As an AI model writing feedback based on digital spreadsheet-like logs, you have NO visibility into the user's physical extension or joint movement during today's session. Reject any range of motion assessments to remain professional and mathematically precise. Focus technical feedback on pacing, historic comparisons, volume consistency, rep failure points, and numerical overload metrics.
2. DETECT EMPTY SESSIONS (ZERO COMPLETED SETS):
   - Check the completed session data. Each set has an 'isCompleted' boolean flag. Check if any are true, or if they have logged weights/reps with marked completion.
   - If the user completed ZERO sets (i.e. all 'isCompleted' fields are false or no exercises have checked off sets), the session is considered "empty" or "unlogged".
   - In this case, DO NOT write highly congratulatory phrases (like "Excellent job!", "You crushed it!" or "Elite effort!"). Act like a supportive but realistic coach: offer gentle, calm, realistic feedback (e.g., acknowledging that showing up at the gym is a win for consistency, but noting that no work sets were tracked, and outlining how they can check off their sets during their next workout to receive accurate estimated 1RM and progress charts). Avoid extreme harshness, but maintain 100% realistic and objective feedback.
3. If they DID complete sets:
   - Calculate estimated 1-Rep Max (1RM) for today's top sets using the Epley formula: 1RM = Weight * (1 + Reps / 30).
   - Cross-reference with prior logs of the same exercises to calculate weight or repetition increments.
   - Under "strengthChanges", report positive gains ("increased"), normal variance ("stable"), decrements ("decreased"), or brand-new lifts ("new", and set changePercent to 100).
   - Calculate stimulation intensity for muscle groups from 0 to 100 based on total volume of sets/reps.
   - Return separate properties for the performance analysis of the completed workout versus actionable, concrete progressive overload recommendations for the next session.

You must reply with a valid JSON payload matching the requested response schema exactly.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              congratulations: {
                type: Type.STRING,
                description: "Short sentence of praise or encouragement. If no sets are completed, DO NOT make congratulatory remarks; instead, use simple, calm encouragement like 'Workout Logged' or 'Consistency holds the key to momentum.'",
              },
              summaryFeedback: {
                type: Type.STRING,
                description: "A compact 1-2 paragraph breakdown and analytical feedback. MUST NOT mention 'range of motion' or assume any technical visual alignment. If no sets are completed, provide realistic, supportive feedback explaining that no completed working sets were tracked, and encourage them to check sets off to trigger progression metrics next time.",
              },
              nextSessionRecommendations: {
                type: Type.STRING,
                description: "A clear, bulleted list of 2-3 specific, actionable recommendations and weight/rep overload directions for their NEXT workout session so they know exactly what to level up next time.",
              },
              strengthChanges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    exerciseName: { type: Type.STRING },
                    exerciseId: { type: Type.STRING },
                    changePercent: { type: Type.NUMBER, description: "Percentage change of estimated 1RM. Positive for increase, negative for decrease, 0 for stable, and 100 for newly introduced exercises." },
                    status: { type: Type.STRING, description: "increased | decreased | stable | new" },
                    currentMaxWeight: { type: Type.NUMBER },
                    previousMaxWeight: { type: Type.NUMBER },
                    currentEst1RM: { type: Type.NUMBER },
                    previousEst1RM: { type: Type.NUMBER },
                    description: { type: Type.STRING, description: "Short sentence explanation of this specific lift's metrics." }
                  },
                  required: ["exerciseName", "exerciseId", "changePercent", "status", "currentMaxWeight", "previousMaxWeight", "currentEst1RM", "previousEst1RM", "description"]
                }
              },
              muscleGroupImpact: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    muscle: { type: Type.STRING, description: "Anatomical focus such as Chest, Back, Legs, Shoulders, Arms, or Core" },
                    intensity: { type: Type.NUMBER, description: "Score from 0 to 100 representing the loading intensity" },
                    status: { type: Type.STRING, description: "increased | decreased | stable" },
                    description: { type: Type.STRING, description: "Brief visual summary of fibers targeted." }
                  },
                  required: ["muscle", "intensity", "status", "description"]
                }
              }
            },
            required: ["congratulations", "summaryFeedback", "nextSessionRecommendations", "strengthChanges", "muscleGroupImpact"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty analysis from Gemini AI");
      }

      res.json(JSON.parse(responseText.trim()));
    } catch (error) {
      console.error("AI Workout Analysis Error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal Server Error in Gemini Workout Analyst",
      });
    }
  });

  // API Route for performance diagnostic coaching insights
  app.post("/api/ai/diagnostic-insights", verifyAuth, async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        res.status(500).json({
          error: "Gemini API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.",
        });
        return;
      }

      const {
        weekly_tonnage_history = [],
        cardio_load_history = [],
        muscle_split_volume = {},
        consistency_matrix = []
      } = req.body;

      // 1. COMPUTE ACWR METRICS SECURELY (Strict Truth Data Guard)
      // Strength tonnage ACWR
      const strength_curr = weekly_tonnage_history.length > 0 ? Number(weekly_tonnage_history[weekly_tonnage_history.length - 1] || 0) : 0;
      const strength_avg = weekly_tonnage_history.length > 0 ? (weekly_tonnage_history.reduce((a: number, b: number) => a + Number(b || 0), 0) / weekly_tonnage_history.length) : 0;
      const strength_acwr = strength_avg > 0 ? strength_curr / strength_avg : 0;

      // Cardio load ACWR
      const cardio_curr = cardio_load_history.length > 0 ? Number(cardio_load_history[cardio_load_history.length - 1] || 0) : 0;
      const cardio_avg = cardio_load_history.length > 0 ? (cardio_load_history.reduce((a: number, b: number) => a + Number(b || 0), 0) / cardio_load_history.length) : 0;
      const cardio_acwr = cardio_avg > 0 ? cardio_curr / cardio_avg : 0;

      // 2. MUSCLE SPLIT VOLUME ANALYSIS (Hypertrophy Anchor Checklist)
      // Priorities: Quads (Teardrop/VMO), Upper Chest, Brachialis
      let quadsSets = 0;
      let upperChestSets = 0;
      let brachialisSets = 0;
      let otherHighestSets = 0;

      const treatZoneValue = (name: string, val: number) => {
        const cleanName = name.toLowerCase();
        const numVal = Number(val || 0);
        if (cleanName.includes("quad") || cleanName.includes("vmo") || cleanName.includes("teardrop") || cleanName.includes("leg")) {
          quadsSets = Math.max(quadsSets, numVal);
        } else if (cleanName.includes("upper chest") || (cleanName.includes("chest") && !cleanName.includes("lower"))) {
          upperChestSets = Math.max(upperChestSets, numVal);
        } else if (cleanName.includes("brachialis") || cleanName.includes("brach")) {
          brachialisSets = Math.max(brachialisSets, numVal);
        } else {
          otherHighestSets = Math.max(otherHighestSets, numVal);
        }
      };

      if (Array.isArray(muscle_split_volume)) {
        muscle_split_volume.forEach((item: any) => {
          if (item && typeof item === "object") {
            const mName = String(item.muscle || item.name || item.group || "");
            const mSets = Number(item.sets || item.volume || item.value || 0);
            treatZoneValue(mName, mSets);
          }
        });
      } else if (typeof muscle_split_volume === "object" && muscle_split_volume !== null) {
        Object.entries(muscle_split_volume).forEach(([key, val]) => {
          treatZoneValue(key, Number(val));
        });
      }

      // 3. CONCURRENT INTERFERENCE 14-DAY CALCULATION
      const len_ton = weekly_tonnage_history.length;
      const strength_prev_14 = len_ton >= 2 ? Number(weekly_tonnage_history[len_ton - 2] || 0) : 0;
      const strength_curr_14 = len_ton >= 1 ? Number(weekly_tonnage_history[len_ton - 1] || 0) : 0;
      const strength_change_pct = strength_prev_14 > 0 ? (strength_curr_14 - strength_prev_14) / strength_prev_14 : 0;

      const len_cardio = cardio_load_history.length;
      const cardio_prev_14 = len_cardio >= 2 ? Number(cardio_load_history[len_cardio - 2] || 0) : 0;
      const cardio_curr_14 = len_cardio >= 1 ? Number(cardio_load_history[len_cardio - 1] || 0) : 0;
      const cardio_change_pct = cardio_prev_14 > 0 ? (cardio_curr_14 - cardio_prev_14) / cardio_prev_14 : 0;

      // Assemble structured sports-science diagnostic prompt for Gemini 3.5 Flash
      const diagnosticPrompt = `You are a supportive, knowledgeable, and friendly personal fitness trainer.
Your task is to ingest workout metrics and generate exactly three easy-to-understand, encouraging, and highly practical fitness coaching insights based on these metrics.

=== METRICS DATA PROVIDED (ABSOLUTE VERIFIED TRUTH) ===
- Weekly Weight Lifted Volume (Tonnage) History: ${JSON.stringify(weekly_tonnage_history)}
- Cardio/Heart Workout History: ${JSON.stringify(cardio_load_history)}
- Strength Workload Balance Ratio (ACWR): ${strength_acwr.toFixed(3)} (ideal is 0.8-1.3; values above 1.5 mean fatigue spike)
- Cardio Workload Balance Ratio (ACWR): ${cardio_acwr.toFixed(3)} (ideal is 0.8-1.3; values above 1.5 mean fatigue spike)

- Current 7-Day Completed Sets per muscle group:
  * Legs working sets: ${quadsSets}
  * Chest working sets: ${upperChestSets}
  * Arms/Upper-body working sets: ${brachialisSets}
  * Max sets on other muscle areas: ${otherHighestSets}

- 14-Day Performance Trends:
  * Strength Change: ${(strength_change_pct * 100).toFixed(2)}%
  * Cardio Effort Spike/Change: ${(cardio_change_pct * 100).toFixed(2)}%

- Rolling 30-Day Consistency Index/Logs: ${JSON.stringify(consistency_matrix)}

=== SIMPLICITY & TERMINOLOGY RULES (CRITICAL) ===
1. ABSOLUTELY NO SCIENTIFIC JARGON: You must translate all athletic, medical, and sports-science terminology into plain, humble, human-friendly words that everyday gym-goers understand easily.
   - NEVER use complex terms like "Acute-to-Chronic Workload Ratio", "ACWR", "progressive overload", "microcycle", "VMO/Teardrop", "brachialis", "hypertrophy anchor", "patellar tendon integrity", "rotator cuff health", "joint overuse", "concurrent interference", or "tissue recovery blunting".
   - INSTEAD use terms like: "consistent workouts", "rest and recovery time", "leg exercises", "arm sets", "uneven focus area", "risk of feeling overtired / muscle strain", "balancing cardio and lifting weight", and "muscles finding it hard to get stronger".

2. REVENUE RULES FOR INSIGHT CATEGORIES
- If workload ratio (ACWR) sits between 0.8 and 1.3, output a 'GREEN_STATUS' insight item praising their steady, consistent work. Use simple terms.
- If workload ratio exceeds 1.5, output an 'ALERT_STATUS' insight item warning them simply that they are training a lot faster or heavier than usual, which can lead to high tiredness or strain, and suggest slightly lighter weights or an extra rest day.
- If Leg, Chest, or Arm sets are low (< 10 sets) compared to other areas, output a 'BIAS_IMBALANCE' insight item pointing out that they should add more sets for that specific muscle group next week to keep their workout coverage balanced.
- If cardio load increased significantly while strength stagnated or dropped, output a 'CONCURRENT_INTERFERENCE_WARNING' insight item in simple words, explaining that doing a lot of intense cardio beside heavy lifting might make it harder for their muscles to fully recover and get stronger, and giving tips on how to balance them.

=== FORMATTING SPECIFICATIONS ===
- Return a JSON array containing EXACTLY THREE items. Individual items must match this Type.OBJECT schema structure:
  ├── "category": MUST be one of these exact keys: "GREEN_STATUS" | "ALERT_STATUS" | "BIAS_IMBALANCE" | "CONCURRENT_INTERFERENCE_WARNING"
  ├── "score_impact": A positive or negative integer (e.g., 15, -12, -20) representing impact priority.
  └── "coaching_copy": Highly helpful, data-grounded simple coaching sentence explaining how they can adjust.

=== GRAMMAR & SPELLING CONSTRAINTS ===
- Maintain a warm, personal, encouraging, and clear fitness coach voice.
- All text must use impeccable UK English spelling standards (e.g., prioritised, utilisation, tracking, colour, muscle fibres, labour, metabolised, energised, rigour, synchronised).
- Absolutely do NOT invent any other data points. Directly address the actual calculated and array entries supplied.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts: [{ text: diagnosticPrompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description: "Must be exactly one of: GREEN_STATUS | ALERT_STATUS | BIAS_IMBALANCE | CONCURRENT_INTERFERENCE_WARNING"
                },
                score_impact: {
                  type: Type.INTEGER,
                  description: "A positive or negative integer score impact."
                },
                coaching_copy: {
                  type: Type.STRING,
                  description: "A deeply analytical and professional coaching guidance statement using UK English spelling."
                }
              },
              required: ["category", "score_impact", "coaching_copy"]
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini AI sports science model.");
      }

      res.setHeader("Content-Type", "application/json");
      res.send(responseText.trim());
    } catch (error) {
      console.error("AI Diagnostic Insights Error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal Server Error in Gemini Diagnostic Insights Engine",
      });
    }
  });

  // API Route for Analyzing Custom Exercise Demonstration Video/Images
  app.post("/api/ai/analyze-media", verifyAuth, async (req, res) => {
    try {
      const { name, mediaData, mimeType } = req.body;

      if (!mediaData || !mimeType) {
        res.status(400).json({ error: "Missing mediaData (base64) or mimeType parameters" });
        return;
      }

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        res.status(500).json({
          error: "Gemini API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.",
        });
        return;
      }

      // Prepare image or video parts for Gemini API
      let cleanBase64 = mediaData;
      if (mediaData.includes(";base64,")) {
        cleanBase64 = mediaData.split(";base64,").pop();
      }

      const mediaPart = {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      };

      const promptText = `You are a world-class biomechanics investigator, athletic coach, and physical trainer.
The gym user has provided a movement recording or photography demonstration of an exercise they call: "${name || "Custom Exercise"}".

Analyze the physical exercise demonstration in this media to understand its mechanics, setup procedures, targets, and cue guides.
Extract and return:
1. Category - Must be exactly one of: Chest | Back | Legs | Shoulders | Arms | Core | Cardio
2. Equipment - Must be exactly one of: Dumbbell | Barbell | Cables | Machine | Bodyweight | Other
3. setupInstructions - Step-by-step equipment setup guidelines (one clear point/step per line) based on the observation. If no equipment, provide simple position alignment.
4. formMechanics - Biomechanics and physical body movement execution cues (one mechanical rule per line) based on observing proper form.
5. coachTip - A motivating mental focal point or tactile coaching advice (e.g., "Keep your pinky fingers squeezed hard at peak contraction to load inner chest fibers.").
6. primaryTarget - Comma-separated list of primary muscle groups targeted (e.g., "Pectoralis Major, Triceps Brachii").
7. secondaryTarget - Comma-separated list of supporting muscle stabilizers activated (e.g., "Anterior Deltoids, Core").

Respond STRICTLY with a JSON matching the expected schema.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: { parts: [mediaPart, { text: promptText }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              equipment: { type: Type.STRING },
              setupInstructions: { type: Type.STRING },
              formMechanics: { type: Type.STRING },
              coachTip: { type: Type.STRING },
              primaryTarget: { type: Type.STRING },
              secondaryTarget: { type: Type.STRING },
            },
            required: [
              "category",
              "equipment",
              "setupInstructions",
              "formMechanics",
              "coachTip",
              "primaryTarget",
              "secondaryTarget",
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Failed to receive feedback analysis from Gemini AI model.");
      }

      res.json(JSON.parse(responseText.trim()));
    } catch (error) {
      console.error("AI Media Analysis Error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal Server Error in Gemini Media Analyst",
      });
    }
  });

  // Unified coach endpoint — per-workout read, all-time read, and passive notes.
  // The CLIENT computes the deterministic metrics and sends them; the model only
  // interprets them into plain coaching prose and returns structured JSON (no
  // markdown), so nothing can leak into the UI. The model never recomputes or
  // invents a number. kind: "workout" | "alltime" | "notes".
  app.post("/api/ai/coach", verifyAuth, async (req, res) => {
    try {
      if (!keyConfigured()) {
        res.status(503).json({ error: "not_configured", message: "The AI coach is not set up yet." });
        return;
      }
      const { kind, payload, profile } = req.body || {};
      // (o8a) The coach reads the whole athlete profile and tailors to it.
      const p = (profile || {}) as Record<string, any>;
      const profileBlock = `Athlete profile (tailor the read to this person; weight advice to their experience and goal; do not restate the profile back):
- Biological sex: ${p.biologicalSex || "Prefer not to say"}
- Age: ${p.age ?? "unknown"}
- Body weight: ${p.weightKg ? `${p.weightKg} kg` : "unknown"}
- Height: ${p.heightCm ? `${p.heightCm} cm` : "unknown"}
- Preferred units: ${p.preferredUnits || "Metric"}
- Primary goal: ${p.primaryGoal || "General Fitness"}
- Training experience: ${p.trainingExperience || "unknown"}
- Trains about ${p.daysPerWeek ?? "unknown"} days per week`;
      const voice =
        "Plain coaching language, like a person talking, not a clinical readout. No medical or sci-fi jargon, no \"diagnostic\", no \"motor-unit fatigue\", no \"stimulation index\". No em dashes, no \"seamless\" or \"robust\". Use only the numbers provided, never invent or recompute any figure.";

      if (kind === "alltime") {
        const r = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: [{ role: "user", parts: [{ text: `${profileBlock}\n\nYou are a strength coach giving this athlete an all-time read on their training so far, from these computed facts:\n${JSON.stringify(payload)}\n\nWrite a short readout (3 to 5 short paragraphs) on their splits, their consistency, and where their strength is going. ${voice}` }] }],
          config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { readout: { type: Type.STRING } }, required: ["readout"] } },
        });
        res.json(JSON.parse((r.text || "{}").trim()));
        return;
      }

      if (kind === "notes") {
        const r = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: [{ role: "user", parts: [{ text: `${profileBlock}\n\nYou are a strength coach. From these computed facts:\n${JSON.stringify(payload)}\nwrite two short passive observations this athlete can glance at, each a title and a sentence. ${voice}` }] }],
          config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { notes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, body: { type: Type.STRING } }, required: ["title", "body"] } } }, required: ["notes"] } },
        });
        res.json(JSON.parse((r.text || "{}").trim()));
        return;
      }

      // default: per-workout — one short interpretive line over the facts.
      const r = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts: [{ text: `${profileBlock}\n\nYou are a strength coach reading back one completed workout from these computed facts:\n${JSON.stringify(payload)}\n\nWrite "summary": one short plain-language line on the session, a real observation, not "you crushed it". If the session has no completed sets, say plainly there is not enough logged here to analyse. ${voice}` }] }],
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { summary: { type: Type.STRING } }, required: ["summary"] } },
      });
      res.json(JSON.parse((r.text || "{}").trim()));
    } catch (error) {
      console.error("AI Coach Error:", error);
      res.status(500).json({ error: "coach_error", message: error instanceof Error ? error.message : "Coach request failed" });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production built assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started, listening on port ${PORT}`);
  });
}

startServer();

// --- End of server.ts ---
