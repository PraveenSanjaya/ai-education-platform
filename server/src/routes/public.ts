import { Router } from 'express';
import { DictionaryEntry } from '../models/DictionaryEntry.js';
import { Lesson } from '../models/Lesson.js';
import { wrap } from '../middleware/http.js';

/** Public (no login) endpoints for the home page: a sample of picture words and real counts. */
export const publicRouter = Router();

/** Distinct question formats the app offers: vocabulary formats plus the grammar types in the data. */
const VOCAB_FORMATS = ['en-si', 'si-en', 'spelling', 'cloze', 'picture', 'listen'];

publicRouter.get(
  '/sample',
  wrap(async (_req, res) => {
    const words = await DictionaryEntry.aggregate([
      { $match: { imageUrl: { $ne: '' } } },
      { $sample: { size: 3 } },
      { $project: { _id: 0, english: 1, sinhala: 1, imageUrl: 1 } },
    ]);
    res.json({ words });
  }),
);

publicRouter.get(
  '/stats',
  wrap(async (_req, res) => {
    const [words, sentences, lessons, grammarTypes] = await Promise.all([
      DictionaryEntry.countDocuments({ sinhala: { $ne: '' } }),
      DictionaryEntry.countDocuments({ sentenceEasy: { $ne: '' } }),
      Lesson.countDocuments(),
      Lesson.distinct('questions.type'),
    ]);
    res.json({
      words,
      // every word has an easy and a hard sentence
      sentences: sentences * 2,
      lessons,
      questionTypes: new Set([...VOCAB_FORMATS, ...grammarTypes]).size,
    });
  }),
);
