import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { parse, wrap } from '../middleware/http.js';
import { lookupWord, sentenceFor } from '../services/dictionary.js';
import { DictionaryEntry } from '../models/DictionaryEntry.js';
import { Word } from '../models/Word.js';
import { shuffle } from '../services/adaptive.js';

export const dictionaryRouter = Router();
dictionaryRouter.use(requireAuth);

const querySchema = z.object({
  word: z.string().trim().min(1, 'Enter a word to look up').max(60),
});

dictionaryRouter.get(
  '/lookup',
  wrap(async (req, res) => {
    const { word } = parse(querySchema, req.query);
    res.json(await lookupWord(word, req.user!.challenge ?? 'easy'));
  }),
);

const pictureSchema = z.object({ count: z.coerce.number().int().min(1).max(20).default(10) });

/** Words with a picture for the picture game and listen-and-type: saved words first, then others. */
dictionaryRouter.get(
  '/picture-words',
  wrap(async (req, res) => {
    const { count } = parse(pictureSchema, req.query);
    const challenge = req.user!.challenge ?? 'easy';
    const saved = await Word.find({ userId: req.user!._id }).lean();
    const savedByEnglish = new Map(saved.map((w) => [w.english, String(w._id)]));
    const mine = await DictionaryEntry.find({
      english: { $in: [...savedByEnglish.keys()] },
      imageUrl: { $ne: '' },
    }).lean();
    const picked = shuffle(mine).slice(0, count);
    if (picked.length < count) {
      const others = await DictionaryEntry.aggregate([
        { $match: { imageUrl: { $ne: '' }, english: { $nin: picked.map((p) => p.english) } } },
        { $sample: { size: count - picked.length } },
      ]);
      picked.push(...others);
    }
    res.json({
      words: shuffle(picked).map((e) => ({
        english: e.english,
        sinhala: e.sinhala,
        imageUrl: e.imageUrl,
        sentence: sentenceFor(e, challenge),
        wordId: savedByEnglish.get(e.english) ?? null,
      })),
    });
  }),
);
