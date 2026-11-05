import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { parse, wrap } from '../middleware/http.js';
import { History } from '../models/History.js';
import { Word } from '../models/Word.js';
import { loadPath } from '../services/grammarPath.js';
import { PASS_PERCENT } from '../services/grammarRules.js';
import { summarise, computeStreak } from '../services/progress.js';

export const historyRouter = Router();
export const progressRouter = Router();
historyRouter.use(requireAuth);
progressRouter.use(requireAuth);

const tzSchema = z.object({ tz: z.coerce.number().int().min(-840).max(840).default(0) });

historyRouter.get(
  '/',
  wrap(async (req, res) => {
    const { tz } = parse(tzSchema, req.query);
    const items = await History.find({ userId: req.user!._id }).sort({ createdAt: -1 }).lean();
    res.json({
      summary: summarise(
        items,
        items.map((i) => i.createdAt),
        new Date(),
        tz,
      ),
      items: items.map((i) => ({
        id: String(i._id),
        kind: i.kind,
        title: i.title,
        score: i.score,
        total: i.total,
        percent: i.percent,
        wrongItems: i.wrongItems,
        createdAt: i.createdAt,
      })),
    });
  }),
);

historyRouter.delete(
  '/',
  wrap(async (req, res) => {
    await History.deleteMany({ userId: req.user!._id });
    res.status(204).end();
  }),
);

progressRouter.get(
  '/',
  wrap(async (req, res) => {
    const { tz } = parse(tzSchema, req.query);
    const userId = req.user!._id;
    const [wordsSaved, wordsLearned, recent, dates, path] = await Promise.all([
      Word.countDocuments({ userId }),
      Word.countDocuments({ userId, strength: { $gte: 4 } }),
      History.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
      History.find({ userId }).select('createdAt').lean(),
      loadPath(userId, req.user!.startLevel),
    ]);
    const lessonsMastered = path.lessons.filter(
      (l) => (path.best[String(l._id)] ?? 0) >= PASS_PERCENT,
    ).length;
    const rec = path.lessons.find((l) => String(l._id) === path.recommendedId);
    res.json({
      streak: computeStreak(
        dates.map((d) => d.createdAt),
        new Date(),
        tz,
      ),
      wordsSaved,
      wordsLearned,
      lessonsMastered,
      totalLessons: path.lessons.length,
      lastScores: recent.reverse().map((r) => ({
        id: String(r._id),
        kind: r.kind,
        title: r.title,
        percent: r.percent,
        createdAt: r.createdAt,
      })),
      next: rec
        ? {
            lessonId: String(rec._id),
            title: rec.title,
            titleSi: rec.titleSi,
            bestPercent: path.best[String(rec._id)] ?? null,
          }
        : null,
    });
  }),
);
