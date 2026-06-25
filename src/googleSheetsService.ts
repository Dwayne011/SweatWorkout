/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkoutSession, Exercise } from "./types";
import { robustFetch } from "./utils/network";

/**
 * Creates a brand new Google Spreadsheet named "SW3AT Workout Logs" on the user's Drive.
 * Generates two tabs: "Workout Summaries" and "Sets Log".
 */
export async function createWorkoutSpreadsheet(accessToken: string): Promise<string> {
  const response = await robustFetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      properties: {
        title: "SW3AT Workout Logs",
      },
      sheets: [
        {
          properties: {
            title: "Workout Summaries",
          },
        },
        {
          properties: {
            title: "Sets Log",
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Failed to create spreadsheet:", errText);
    throw new Error(`Google Sheets API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  if (!spreadsheetId) {
    throw new Error("No spreadsheetId returned from Google Sheets API");
  }

  // Initialize sheet headers
  await initializeSheetHeaders(accessToken, spreadsheetId);

  return spreadsheetId;
}

/**
 * Writes standard headings on both tabs of the spreadsheet.
 */
export async function initializeSheetHeaders(accessToken: string, spreadsheetId: string): Promise<void> {
  // 1. Populate Workout Summaries Headers
  const summaryHeaders = [
    "Date & Time (UTC)",
    "Workout Name",
    "Total Exercises",
    "Total Sets",
    "Total Volume (kg)",
    "Duration (mins)",
    "Notes / Coaching Feedback",
  ];

  await robustFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Workout Summaries'!A1:G1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        values: [summaryHeaders],
      }),
    }
  );

  // 2. Populate Sets Log Headers
  const setsHeaders = [
    "Date & Time (UTC)",
    "Workout Name",
    "Exercise Name",
    "Set #",
    "Weight (kg)",
    "Reps",
    "Set Type",
    "Completed",
    "Notes",
  ];

  await robustFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Sets Log'!A1:I1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        values: [setsHeaders],
      }),
    }
  );
}

/**
 * Helper to compute session volume.
 */
function calculateWorkoutVolume(session: WorkoutSession): number {
  return session.exercises.reduce((vSum, ex) => {
    return (
      vSum +
      ex.sets.reduce((sSum, s) => {
        return sSum + (s.isCompleted || !session.endTime ? s.weight * s.reps : 0);
      }, 0)
    );
  }, 0);
}

/**
 * Helper to compute session length in minutes.
 */
function calculateDurationMins(session: WorkoutSession): number {
  if (!session.endTime || !session.startTime) return 45; // Default fallback
  const start = new Date(session.startTime).getTime();
  const end = new Date(session.endTime).getTime();
  return Math.round((end - start) / (60 * 1000));
}

/**
 * Appends a completed workout log rows to the user's spreadsheet.
 */
export async function appendWorkoutToSheet(
  accessToken: string,
  spreadsheetId: string,
  session: WorkoutSession,
  exercisesList: Exercise[]
): Promise<boolean> {
  try {
    const formattedDate = new Date(session.startTime).toISOString().replace("T", " ").substring(0, 19);
    
    // 1. Prepare Workout Summaries row
    const totalExercises = session.exercises.length;
    const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const totalVolume = calculateWorkoutVolume(session);
    const duration = calculateDurationMins(session);
    const summariesRow = [
      formattedDate,
      session.name || "Completed Workout",
      totalExercises,
      totalSets,
      totalVolume,
      duration,
      session.notes || session.analysis?.summaryFeedback || "",
    ];

    // Append Summary
    const summaryRes = await robustFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Workout Summaries'!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          values: [summariesRow],
        }),
      }
    );

    if (!summaryRes.ok) {
      console.error("Failed to append summary row:", await summaryRes.text());
    }

    // 2. Prepare Sets rows
    const setsRows: any[][] = [];
    (session.exercises || []).forEach((ex) => {
      const exerciseDef = exercisesList.find((e) => e.id === ex.exerciseId);
      const exName = exerciseDef ? exerciseDef.name : ex.exerciseId;

      (ex.sets || []).forEach((set, idx) => {
        setsRows.push([
          formattedDate,
          session.name || "Completed Workout",
          exName,
          idx + 1,
          set.weight ?? 0,
          set.reps ?? 0,
          (set.type || "normal").toUpperCase(),
          set.isCompleted ? "YES" : "NO",
          ex.notes || "",
        ]);
      });
    });

    if (setsRows.length > 0) {
      const setsRes = await robustFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Sets Log'!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            values: setsRows,
          }),
        }
      );

      if (!setsRes.ok) {
        console.error("Failed to append sets rows:", await setsRes.text());
      }
    }

    return true;
  } catch (err) {
    console.error("Error inside appendWorkoutToSheet:", err);
    return false;
  }
}

/**
 * Clears rows A2:Z9999 from both sheets, and rewrites ALL historical workout sessions inside.
 * Resolves any duplicates and ensures sheets match local logs exactly.
 */
export async function syncAllHistoryToSheet(
  accessToken: string,
  spreadsheetId: string,
  history: WorkoutSession[],
  exercisesList: Exercise[]
): Promise<boolean> {
  try {
    // 1. Clear cells on Workout Summaries
    const clearSummary = await robustFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Workout Summaries'!A2:Z9999:clear`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!clearSummary.ok) console.warn("Failed clear summarries", await clearSummary.text());

    // 2. Clear cells on Sets Log
    const clearSets = await robustFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Sets Log'!A2:Z9999:clear`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!clearSets.ok) console.warn("Failed clear sets content", await clearSets.text());

    if (history.length === 0) {
      return true;
    }

    // Sort chronologically (oldest first so it appends top to bottom)
    const chronologicalHistory = [...history].reverse();

    const summariesRows: any[][] = [];
    const setsRows: any[][] = [];

    chronologicalHistory.forEach((session) => {
      const formattedDate = new Date(session.startTime).toISOString().replace("T", " ").substring(0, 19);
      const totalExercises = session.exercises.length;
      const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
      const totalVolume = calculateWorkoutVolume(session);
      const duration = calculateDurationMins(session);

      summariesRows.push([
        formattedDate,
        session.name || "Completed Workout",
        totalExercises,
        totalSets,
        totalVolume,
        duration,
        session.notes || session.analysis?.summaryFeedback || "",
      ]);

      (session.exercises || []).forEach((ex) => {
        const exerciseDef = exercisesList.find((e) => e.id === ex.exerciseId);
        const exName = exerciseDef ? exerciseDef.name : ex.exerciseId;

        (ex.sets || []).forEach((set, idx) => {
          setsRows.push([
            formattedDate,
            session.name || "Completed Workout",
            exName,
            idx + 1,
            set.weight ?? 0,
            set.reps ?? 0,
            (set.type || "normal").toUpperCase(),
            set.isCompleted ? "YES" : "NO",
            ex.notes || "",
          ]);
        });
      });
    });

    // Write Summaries
    if (summariesRows.length > 0) {
      const writeSummaryRes = await robustFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Workout Summaries'!A2?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            values: summariesRows,
          }),
        }
      );
      if (!writeSummaryRes.ok) {
        throw new Error("Failed writing summaries batch: " + (await writeSummaryRes.text()));
      }
    }

    // Write Sets
    if (setsRows.length > 0) {
      const writeSetsRes = await robustFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Sets Log'!A2?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            values: setsRows,
          }),
        }
      );
      if (!writeSetsRes.ok) {
        throw new Error("Failed writing sets log batch: " + (await writeSetsRes.text()));
      }
    }

    return true;
  } catch (err) {
    console.error("Error in syncAllHistoryToSheet:", err);
    return false;
  }
}
