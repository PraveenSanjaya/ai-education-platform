import type { LessonQuestion } from '../models/Lesson.js';

/** Lowercase, collapse spaces, drop trailing punctuation and normalise apostrophes. */
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?]+$/, '')
    .trim();
}

export function isCorrect(q: Pick<LessonQuestion, 'type' | 'answers'>, response: string): boolean {
  const r = normalise(response);
  if (!r) return false;
  return q.answers.some((a) => normalise(a) === r);
}
