/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared muscle aggregation. Given a list of completed-set counts per exercise,
 * roll them up to sub-muscle scores using the curated muscleMap (primary counts
 * full, secondary half), bucket each region High/Moderate/Light by its share of
 * the busiest region, and return the figure fill colours + the worked list.
 *
 * Both surfaces use this so they always agree: the post-workout coach figure
 * (one session) and the Insights muscle map (a rolling window of sessions).
 * Unmapped exercises fall back honestly to their coarse category; cardio maps to
 * nothing and lights no region.
 */
import { muscleMap, CATEGORY_FALLBACK, MUSCLE_LABEL, MUSCLE_PARENT, Muscle } from "../data/muscleMap";

export interface MuscleEntry {
  exerciseId: string;
  /** completed working sets that hit this exercise (in this session or window) */
  sets: number;
}

export interface WorkedMuscle {
  key: Muscle;
  name: string;
  parent: string;
  sets: number;
  ratio: number;
  bucket: "High" | "Moderate" | "Light";
  color: string;
}

export interface MuscleAgg {
  worked: WorkedMuscle[];
  muscleColor: Record<string, string>;
  totalSets: number;
}

/** Bucket fill colours — violet intensities, shared with the legend swatches. */
export const BUCKET_COLOR = {
  High: "#9a6cff",
  Moderate: "rgba(139,92,255,.45)",
  Light: "rgba(139,92,255,.2)",
} as const;

export function aggregateMuscles(entries: MuscleEntry[], catOf: (id: string) => string): MuscleAgg {
  const muscleScore: Record<string, number> = {};
  const muscleSets: Record<string, number> = {};
  let totalSets = 0;

  entries.forEach(({ exerciseId, sets }) => {
    if (!sets) return;
    totalSets += sets;
    const map = muscleMap[exerciseId];
    const primaries = map ? map.primary : (CATEGORY_FALLBACK[catOf(exerciseId)] || []);
    const secondaries = map ? (map.secondary || []) : [];
    primaries.forEach((mu) => {
      muscleScore[mu] = (muscleScore[mu] || 0) + sets;
      muscleSets[mu] = (muscleSets[mu] || 0) + sets;
    });
    secondaries.forEach((mu) => {
      muscleScore[mu] = (muscleScore[mu] || 0) + sets * 0.5;
      muscleSets[mu] = (muscleSets[mu] || 0) + sets;
    });
  });

  const maxScore = Math.max(1, ...Object.values(muscleScore));
  const muscleColor: Record<string, string> = {};
  const worked = (Object.keys(muscleScore) as Muscle[])
    .map((mu) => {
      const ratio = muscleScore[mu] / maxScore;
      const bucket: WorkedMuscle["bucket"] = ratio >= 0.7 ? "High" : ratio >= 0.35 ? "Moderate" : "Light";
      const color = BUCKET_COLOR[bucket];
      muscleColor[mu] = color;
      return { key: mu, name: MUSCLE_LABEL[mu], parent: MUSCLE_PARENT[mu], sets: muscleSets[mu], ratio, bucket, color };
    })
    .sort((a, b) => b.ratio - a.ratio || b.sets - a.sets);

  return { worked, muscleColor, totalSets };
}
