const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const GAP = '_____';

/**
 * "Complete the sentence" builder: blank the first whole-word occurrence of `word` in `sentence`.
 * Returns null when the word does not appear, so callers can fall back to another question format.
 */
export function buildGap(sentence: string, word: string): { text: string; answer: string } | null {
  if (!sentence || !word) return null;
  const rx = new RegExp(`(^|[^A-Za-z])(${escapeRegex(word)})(?![A-Za-z])`, 'i');
  const m = rx.exec(sentence);
  if (!m) return null;
  const start = m.index + m[1].length;
  const text = sentence.slice(0, start) + GAP + sentence.slice(start + m[2].length);
  return { text, answer: word.toLowerCase() };
}

/** Only longer words make good gap questions ("in", "on" would blank too easily). */
export const canGap = (word: string) => word.length >= 4 && /^[A-Za-z]+$/.test(word);
