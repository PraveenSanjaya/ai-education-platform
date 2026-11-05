import type { GrammarQuestion } from './types';

/** Mirrors the server: lowercase, collapse spaces, drop trailing punctuation. */
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?]+$/, '')
    .trim();
}

export function isAnswerCorrect(q: Pick<GrammarQuestion, 'answers'>, response: string): boolean {
  const r = normalise(response);
  return r !== '' && q.answers.some((a) => normalise(a) === r);
}
