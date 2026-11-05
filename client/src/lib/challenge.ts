export type Challenge = 'easy' | 'hard';

export interface ChallengeRules {
  label: string;
  /** Answer choices in multiple-choice questions. */
  choices: number;
  /** Spelling hints and letter reveal are only offered on Easy. */
  hints: boolean;
  /** speechSynthesis rate. */
  speechRate: number;
}

export const RULES: Record<Challenge, ChallengeRules> = {
  easy: { label: 'Easy', choices: 3, hints: true, speechRate: 0.85 },
  hard: { label: 'Hard', choices: 4, hints: false, speechRate: 1 },
};

export const rulesFor = (c: Challenge | undefined) => RULES[c ?? 'easy'];

const isLetter = (ch: string) => /[A-Za-z]/.test(ch);
const letterCount = (word: string) => [...word].filter(isLetter).length;

/** Reveal can go up to all but the last letter, so the learner still has to finish the word. */
export const maxReveals = (word: string) => Math.max(letterCount(word) - 1, 0);

/**
 * Letter reveal: show the first `count` letters and hide the rest, e.g. cat, 1 -> "c _ _".
 * Characters that are not letters (hyphens, spaces) are always shown.
 */
export function revealLetters(word: string, count: number): string {
  const shown = Math.min(Math.max(count, 0), maxReveals(word));
  let seen = 0;
  return [...word]
    .map((ch) => {
      if (!isLetter(ch)) return ch;
      seen += 1;
      return seen <= shown ? ch : '_';
    })
    .join(' ');
}

const KEY = 'pendingChallenge';

/** A visitor who picks a challenge before registering: remember it until the account exists. */
export const pendingChallenge = {
  get(): Challenge | null {
    try {
      const v = localStorage.getItem(KEY);
      return v === 'easy' || v === 'hard' ? v : null;
    } catch {
      return null;
    }
  },
  set(c: Challenge) {
    try {
      localStorage.setItem(KEY, c);
    } catch {
      /* storage unavailable */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable */
    }
  },
};
