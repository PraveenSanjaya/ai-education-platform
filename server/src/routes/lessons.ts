import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { HttpError, wrap } from '../middleware/http.js';
import { loadPath } from '../services/grammarPath.js';

export const lessonsRouter = Router();
lessonsRouter.use(requireAuth);

lessonsRouter.get(
  '/',
  wrap(async (req, res) => {
    const p = await loadPath(req.user!._id, req.user!.startLevel);
    res.json({
      recommendedId: p.recommendedId,
      lessons: p.lessons.map((l, i) => {
        const id = String(l._id);
        return {
          id,
          order: l.order,
          title: l.title,
          titleSi: l.titleSi,
          level: l.level,
          unlocked: p.unlocked[i],
          bestPercent: p.best[id] ?? null,
          attempts: p.attempts[id] ?? 0,
          mastered: (p.best[id] ?? 0) >= p.passPercent,
          questionCount: l.questions.length,
        };
      }),
    });
  }),
);

lessonsRouter.get(
  '/:id',
  wrap(async (req, res) => {
    if (!isValidObjectId(req.params.id)) throw new HttpError(400, 'Invalid lesson id');
    const p = await loadPath(req.user!._id, req.user!.startLevel);
    const index = p.lessons.findIndex((l) => String(l._id) === req.params.id);
    if (index < 0) throw new HttpError(404, 'Lesson not found');
    if (!p.unlocked[index]) {
      throw new HttpError(403, 'This lesson is locked. Score 70% on the previous lesson first.');
    }
    const l = p.lessons[index];
    const id = String(l._id);
    res.json({
      lesson: {
        id,
        order: l.order,
        title: l.title,
        titleSi: l.titleSi,
        level: l.level,
        explanation: l.explanation,
        sinhalaNotes: l.sinhalaNotes,
        examples: l.examples,
        questions: l.questions,
        bestPercent: p.best[id] ?? null,
      },
    });
  }),
);
