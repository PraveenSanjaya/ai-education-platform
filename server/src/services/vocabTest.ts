import type { Types } from 'mongoose';
import { Word, type WordDoc } from '../models/Word.js';
import { DictionaryEntry } from '../models/DictionaryEntry.js';
import type { Challenge } from '../models/User.js';
import { pickWeighted, shuffle } from './adaptive.js';
import { buildGap, canGap } from './gap.js';

export type VocabTestType = 'en-si' | 'si-en' | 'spelling' | 'mistakes';
export type QuestionFormat = 'en-si' | 'si-en' | 'spelling' | 'cloze';

export interface VocabQuestion {
  wordId: string;
  format: QuestionFormat;
  prompt: string;
  options?: string[];
  answer: string;
}

export const TEST_LENGTH = 10;
/** Easy shows 3 answer choices, Hard shows 4. */
export const choicesFor = (c: Challenge) => (c === 'hard' ? 4 : 3);

/** Distractors: other saved words first, topped up from the dictionary. */
async function distractorPool(userId: Types.ObjectId, wordIds: Types.ObjectId[]) {
  const others = await Word.find({ userId, _id: { $nin: wordIds } })
    .limit(40)
    .lean();
  const fromDict = await DictionaryEntry.aggregate<{ english: string; sinhala: string }>([
    { $sample: { size: 20 } },
  ]);
  return [
    ...others.map((w) => ({ english: w.english, sinhala: w.sinhala })),
    ...fromDict.map((d) => ({ english: d.english, sinhala: d.sinhala })),
  ];
}

export async function buildVocabTest(
  userId: Types.ObjectId,
  type: VocabTestType,
  challenge: Challenge = 'easy',
  rng: () => number = Math.random,
): Promise<VocabQuestion[]> {
  const filter = type === 'mistakes' ? { userId, needsReview: true } : { userId };
  const words = (await Word.find(filter).lean()) as WordDoc[];
  const chosen = pickWeighted(words, TEST_LENGTH, rng);
  if (chosen.length === 0) return [];
  const pool = await distractorPool(
    userId,
    chosen.map((w) => w._id),
  );
  const entries = await DictionaryEntry.find({
    english: { $in: chosen.map((w) => w.english) },
  }).lean();
  const sentenceOf = new Map(entries.map((e) => [e.english, e.sentenceHard]));
  const formats: QuestionFormat[] = ['en-si', 'si-en', 'spelling'];
  const nOptions = choicesFor(challenge);

  return chosen.map((w, i) => {
    let format: QuestionFormat = type === 'mistakes' ? formats[i % 3] : (type as QuestionFormat);
    const base = { wordId: String(w._id) };

    // Hard challenge adds "complete the sentence" questions (every 4th question).
    if (challenge === 'hard' && i % 4 === 3 && canGap(w.english)) {
      const gap = buildGap(sentenceOf.get(w.english) ?? '', w.english);
      if (gap) {
        const wrong = [...new Set(pool.map((p) => p.english))].filter((e) => e !== w.english);
        const options = shuffle([w.english, ...shuffle(wrong, rng).slice(0, nOptions - 1)], rng);
        return { ...base, format: 'cloze' as const, prompt: gap.text, options, answer: w.english };
      }
    }

    if (format === 'spelling') {
      return { ...base, format, prompt: w.sinhala, answer: w.english };
    }
    const toSi = format === 'en-si';
    const answer = toSi ? w.sinhala : w.english;
    const candidates = pool.map((p) => (toSi ? p.sinhala : p.english)).filter((c) => c !== answer);
    const options = shuffle(
      [answer, ...shuffle([...new Set(candidates)], rng).slice(0, nOptions - 1)],
      rng,
    );
    format = toSi ? 'en-si' : 'si-en';
    return { ...base, format, prompt: toSi ? w.english : w.sinhala, options, answer };
  });
}
