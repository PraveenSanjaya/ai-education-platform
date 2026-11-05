import type { LessonQuestion } from '../models/Lesson.js';

export const MIXED_LENGTH = 10;

export interface MixedSource {
  id: string;
  title: string;
  /** Best score percent for this lesson; null when never attempted. */
  best: number | null;
  questions: LessonQuestion[];
}

/** Lessons with lower scores get a higher weight (untried lessons count as 0%). */
export const lessonWeight = (best: number | null) => 110 - (best ?? 0);

/** Pick `count` distinct questions across lessons, weighted toward lessons with low scores. */
export function pickMixed(
  lessons: MixedSource[],
  count = MIXED_LENGTH,
  rng: () => number = Math.random,
) {
  const remaining = lessons.map((l) => ({ ...l, questions: [...l.questions] }));
  const picked: (LessonQuestion & { lessonId: string; lessonTitle: string })[] = [];
  while (picked.length < count) {
    const pool = remaining.filter((l) => l.questions.length > 0);
    if (pool.length === 0) break;
    const total = pool.reduce((s, l) => s + lessonWeight(l.best), 0);
    let r = rng() * total;
    let lesson = pool[pool.length - 1];
    for (const l of pool) {
      r -= lessonWeight(l.best);
      if (r < 0) {
        lesson = l;
        break;
      }
    }
    const q = lesson.questions.splice(Math.floor(rng() * lesson.questions.length), 1)[0];
    picked.push({ ...q, lessonId: lesson.id, lessonTitle: lesson.title });
  }
  return picked;
}
