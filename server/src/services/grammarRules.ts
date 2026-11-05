/** Pure grammar-path rules: unlocking, outcome of an attempt, and the recommended lesson. */
import { LEVELS, type Level } from '../models/User.js';

export const PASS_PERCENT = 70;
export const RETRY_PERCENT = 50;

export interface PathLesson {
  id: string;
  order: number;
  level: Level;
}

export type Outcome = 'pass' | 'retry' | 'review';

export const levelRank = (l: Level) => LEVELS.indexOf(l);

/**
 * pass   : >= 70%  -> next lesson unlocks
 * retry  : 50-69%  -> "Try again"
 * review : < 50%   -> back to the explanation with Sinhala notes opened
 */
export function outcomeFor(percent: number): Outcome {
  if (percent >= PASS_PERCENT) return 'pass';
  if (percent >= RETRY_PERCENT) return 'retry';
  return 'review';
}

/** Lessons must be sorted by `order`. `best` maps lesson id -> best percent. */
export function isUnlocked(
  lessons: PathLesson[],
  index: number,
  best: Record<string, number>,
  startLevel: Level,
): boolean {
  const lesson = lessons[index];
  if (levelRank(lesson.level) <= levelRank(startLevel)) return true;
  if (index === 0) return true;
  return (best[lessons[index - 1].id] ?? 0) >= PASS_PERCENT;
}

/**
 * Recommended lesson: the first unlocked lesson, from the start level upward, with best < 70%.
 * Falls back to earlier unlocked lessons that still need work; null when everything is mastered.
 */
export function recommendLesson(
  lessons: PathLesson[],
  best: Record<string, number>,
  startLevel: Level,
): string | null {
  const open = lessons.filter(
    (l, i) => isUnlocked(lessons, i, best, startLevel) && (best[l.id] ?? 0) < PASS_PERCENT,
  );
  const fromStart = open.find((l) => levelRank(l.level) >= levelRank(startLevel));
  return (fromStart ?? open[0])?.id ?? null;
}
