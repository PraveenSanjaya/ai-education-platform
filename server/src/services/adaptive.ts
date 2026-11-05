/** Pure adaptive-learning rules for vocabulary. No database access, so they are easy to unit test. */

export const MAX_STRENGTH = 5;
export const REVIEW_CLEAR_AT = 3;

export interface WordState {
  strength: number;
  needsReview: boolean;
}

/**
 * Correct: strength +1 (max 5); once strength >= 3 the word is no longer flagged for review.
 * Wrong: strength -2 (min 0) and the word is flagged for review.
 */
export function updateStrength(state: WordState, correct: boolean): WordState {
  if (correct) {
    const strength = Math.min(MAX_STRENGTH, state.strength + 1);
    return { strength, needsReview: strength >= REVIEW_CLEAR_AT ? false : state.needsReview };
  }
  return { strength: Math.max(0, state.strength - 2), needsReview: true };
}

/** Selection weight: weaker words are more likely to be picked. */
export const weightOf = (strength: number) => 6 - strength;

/**
 * Pick up to `count` distinct items, with probability proportional to (6 - strength).
 * `rng` is injectable for deterministic tests.
 */
export function pickWeighted<T extends { strength: number }>(
  items: T[],
  count: number,
  rng: () => number = Math.random,
): T[] {
  const pool = [...items];
  const picked: T[] = [];
  while (picked.length < count && pool.length > 0) {
    const total = pool.reduce((sum, it) => sum + weightOf(it.strength), 0);
    let r = rng() * total;
    let idx = 0;
    for (; idx < pool.length - 1; idx++) {
      r -= weightOf(pool[idx].strength);
      if (r < 0) break;
    }
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
