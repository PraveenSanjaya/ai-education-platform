import { Router } from 'express';
import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import { Word, toPublicWord, type WordDoc } from '../models/Word.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError, parse, wrap } from '../middleware/http.js';
import { updateStrength } from '../services/adaptive.js';
import { buildVocabTest } from '../services/vocabTest.js';

export const wordsRouter = Router();
wordsRouter.use(requireAuth);

const createSchema = z.object({
  english: z
    .string()
    .trim()
    .min(1, 'English word is required')
    .max(60)
    .regex(/^[A-Za-z][A-Za-z' -]*$/, 'English word may only contain letters'),
  sinhala: z.string().trim().min(1, 'Sinhala meaning is required').max(120),
  partOfSpeech: z.string().trim().max(30).optional(),
  example: z.string().trim().max(300).optional(),
});

const listSchema = z.object({
  q: z.string().trim().max(60).optional(),
  filter: z.enum(['all', 'learning', 'learned', 'mistakes']).optional(),
});

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

wordsRouter.get(
  '/',
  wrap(async (req, res) => {
    const { q, filter = 'all' } = parse(listSchema, req.query);
    const query: Record<string, unknown> = { userId: req.user!._id };
    if (filter === 'learning') query.strength = { $lt: 4 };
    if (filter === 'learned') query.strength = { $gte: 4 };
    if (filter === 'mistakes') query.needsReview = true;
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      query.$or = [{ english: rx }, { sinhala: rx }];
    }
    const words = await Word.find(query).sort({ createdAt: -1 }).lean();
    res.json({ words: words.map((w) => toPublicWord(w as WordDoc)) });
  }),
);

wordsRouter.post(
  '/',
  wrap(async (req, res) => {
    const body = parse(createSchema, req.body);
    const english = body.english.toLowerCase();
    if (await Word.exists({ userId: req.user!._id, english })) {
      throw new HttpError(409, `"${english}" is already in your word list`);
    }
    const word = await Word.create({ ...body, english, userId: req.user!._id });
    res.status(201).json({ word: toPublicWord(word.toObject() as WordDoc) });
  }),
);

wordsRouter.delete(
  '/:id',
  wrap(async (req, res) => {
    if (!isValidObjectId(req.params.id)) throw new HttpError(400, 'Invalid word id');
    const result = await Word.deleteOne({ _id: req.params.id, userId: req.user!._id });
    if (!result.deletedCount) throw new HttpError(404, 'Word not found');
    res.status(204).end();
  }),
);

const testQuerySchema = z.object({ type: z.enum(['en-si', 'si-en', 'spelling', 'mistakes']) });

wordsRouter.get(
  '/test',
  wrap(async (req, res) => {
    const { type } = parse(testQuerySchema, req.query);
    const questions = await buildVocabTest(req.user!._id, type);
    if (questions.length === 0) {
      throw new HttpError(
        400,
        type === 'mistakes'
          ? 'No mistakes to review yet. Take a test first!'
          : 'Add some words first, then come back to practise.',
      );
    }
    res.json({ questions });
  }),
);

const reviewSchema = z.object({
  answers: z
    .array(z.object({ wordId: z.string(), correct: z.boolean() }))
    .min(1, 'No answers to record')
    .max(100),
});

/** Apply the adaptive strength rule for each answered word. */
wordsRouter.post(
  '/review',
  wrap(async (req, res) => {
    const { answers } = parse(reviewSchema, req.body);
    const ids = answers.map((a) => a.wordId).filter((id) => isValidObjectId(id));
    const words = await Word.find({ _id: { $in: ids }, userId: req.user!._id });
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
    res.json({ words: [...byId.values()].map((w) => toPublicWord(w.toObject() as WordDoc)) });
  }),
);
