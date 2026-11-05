import type { Level } from '../models/User.js';

export const MAX_PLACEMENT_MISTAKES = 2;

export interface PlacementOutcome {
  /** How many lessons were counted before the second mistake stopped the test. */
  counted: number;
  /** Number of lessons reached (those before the lesson with the 2nd mistake, or all of them). */
  reached: number;
  /** The level of the furthest lesson reached; Beginner when none were reached. */
  level: Level;
}

/**
 * Level check: one question per lesson, in lesson order. Counting stops at the second mistake.
 * The furthest lesson reached (the last one before the second mistake) sets the start level.
 * `results[i]` says whether the answer for lesson i was correct; `levels[i]` is that lesson's level.
 */
export function placementOutcome(results: boolean[], levels: Level[]): PlacementOutcome {
  let mistakes = 0;
  let reached = results.length;
  let counted = results.length;
  for (let i = 0; i < results.length; i++) {
    if (!results[i]) {
      mistakes++;
      if (mistakes >= MAX_PLACEMENT_MISTAKES) {
        reached = i;
        counted = i + 1;
        break;
      }
    }
  }
  const level: Level = reached > 0 ? levels[Math.min(reached, levels.length) - 1] : 'Beginner';
  return { counted, reached, level };
}
