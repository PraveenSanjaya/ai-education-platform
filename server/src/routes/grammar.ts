import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { HttpError, wrap } from '../middleware/http.js';
import { loadPath } from '../services/grammarPath.js';
import { pickMixed } from '../services/mixedReview.js';

export const grammarRouter = Router();
grammarRouter.use(requireAuth);

/** 10 questions from unlocked lessons, weighted toward lessons with low scores. */
grammarRouter.get(
  '/mixed',
  wrap(async (req, res) => {
    const p = await loadPath(req.user!._id, req.user!.startLevel);
    const sources = p.lessons
      .filter((_, i) => p.unlocked[i])
      .map((l) => ({
        id: String(l._id),
        title: l.title,
        best: p.best[String(l._id)] ?? null,
        questions: l.questions,
      }));
    const questions = pickMixed(sources);
    if (questions.length === 0) throw new HttpError(400, 'No unlocked lessons to review yet.');
    res.json({ questions });
  }),
);

/** Level check: one random question per lesson, in lesson order. */
grammarRouter.get(
  '/placement',
  wrap(async (req, res) => {
    const p = await loadPath(req.user!._id, req.user!.startLevel);
    const questions = p.lessons.map((l) => ({
      ...l.questions[Math.floor(Math.random() * l.questions.length)],
      lessonId: String(l._id),
      lessonTitle: l.title,
    }));
    res.json({ questions });
  }),
);
