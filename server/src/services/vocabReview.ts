import { isValidObjectId, type Types } from 'mongoose';
import { Word, toPublicWord, type WordDoc } from '../models/Word.js';
import { updateStrength } from './adaptive.js';

/** Apply the adaptive strength rule for each answered word and bump its seenCount. */
export async function applyVocabAnswers(
  userId: Types.ObjectId,
  answers: { wordId: string; correct: boolean }[],
) {
  const ids = answers.map((a) => a.wordId).filter((id) => isValidObjectId(id));
  const words = await Word.find({ _id: { $in: ids }, userId });
  const byId = new Map(words.map((w) => [String(w._id), w]));
  for (const a of answers) {
    const w = byId.get(a.wordId);
    if (!w) continue;
    const next = updateStrength(w, a.correct);
    w.strength = next.strength;
    w.needsReview = next.needsReview;
    w.seenCount += 1;
  }
  await Promise.all([...byId.values()].map((w) => w.save()));
  return [...byId.values()].map((w) => toPublicWord(w.toObject() as WordDoc));
}
