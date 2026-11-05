import type { Types } from 'mongoose';
import { Word, type WordDoc } from '../models/Word.js';
import { DictionaryEntry } from '../models/DictionaryEntry.js';
import { pickWeighted, shuffle } from './adaptive.js';

export type VocabTestType = 'en-si' | 'si-en' | 'spelling' | 'mistakes';
export type QuestionFormat = 'en-si' | 'si-en' | 'spelling';

export interface VocabQuestion {
  wordId: string;
  format: QuestionFormat;
  prompt: string;
  options?: string[];
  answer: string;
}

export const TEST_LENGTH = 10;

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
  const formats: QuestionFormat[] = ['en-si', 'si-en', 'spelling'];

  return chosen.map((w, i) => {
    const format: QuestionFormat = type === 'mistakes' ? formats[i % 3] : (type as QuestionFormat);
    const base = { wordId: String(w._id), format };
    if (format === 'spelling') {
      return { ...base, prompt: w.sinhala, answer: w.english };
    }
    const toSi = format === 'en-si';
    const answer = toSi ? w.sinhala : w.english;
    const candidates = pool.map((p) => (toSi ? p.sinhala : p.english)).filter((c) => c !== answer);
    const options = shuffle([answer, ...shuffle([...new Set(candidates)], rng).slice(0, 3)], rng);
    return { ...base, prompt: toSi ? w.english : w.sinhala, options, answer };
  });
}
