import { Router } from 'express';
import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { HttpError, parse, wrap } from '../middleware/http.js';
import { Lesson, type LessonDoc } from '../models/Lesson.js';
import { LessonProgress } from '../models/LessonProgress.js';
import { isCorrect } from '../services/grading.js';
import { loadPath } from '../services/grammarPath.js';
import { outcomeFor } from '../services/grammarRules.js';

export const resultsRouter = Router();
resultsRouter.use(requireAuth);

const answerSchema = z.object({
  questionId: z.string().min(1),
  response: z.string().max(300),
});

const grammarSchema = z.object({
  kind: z.literal('grammar'),
  lessonId: z.string(),
  answers: z.array(answerSchema).min(1, 'No answers submitted').max(100),
});

const bodySchema = z.discriminatedUnion('kind', [grammarSchema]);

resultsRouter.post(
  '/',
  wrap(async (req, res) => {
    const body = parse(bodySchema, req.body);
    if (!isValidObjectId(body.lessonId)) throw new HttpError(400, 'Invalid lesson id');
    const lesson = (await Lesson.findById(body.lessonId).lean()) as unknown as LessonDoc | null;
    if (!lesson) throw new HttpError(404, 'Lesson not found');

    const before = await loadPath(req.user!._id, req.user!.startLevel);
    const index = before.lessons.findIndex((l) => String(l._id) === body.lessonId);
    if (!before.unlocked[index]) throw new HttpError(403, 'This lesson is locked');

    const byId = new Map(lesson.questions.map((q) => [q.id, q]));
    const wrongItems: {
      questionId: string;
      prompt: string;
      response: string;
      correctAnswer: string;
      explanation: string;
    }[] = [];
    let score = 0;
    for (const a of body.answers) {
      const q = byId.get(a.questionId);
      if (!q) throw new HttpError(400, `Unknown question: ${a.questionId}`);
      if (isCorrect(q, a.response)) score++;
      else {
        wrongItems.push({
          questionId: q.id,
          prompt: q.prompt,
          response: a.response,
          correctAnswer: q.answers[0],
          explanation: q.explanation,
        });
      }
    }
    const total = body.answers.length;
    const percent = Math.round((score / total) * 100);

    const prior = await LessonProgress.findOne({ userId: req.user!._id, lessonId: lesson._id });
    const bestPercent = Math.max(prior?.bestPercent ?? 0, percent);
    await LessonProgress.updateOne(
      { userId: req.user!._id, lessonId: lesson._id },
      { $set: { bestPercent, lastPercent: percent, updatedAt: new Date() }, $inc: { attempts: 1 } },
      { upsert: true },
    );

    const after = await loadPath(req.user!._id, req.user!.startLevel);
    const nextIdx = index + 1;
    const unlockedNext =
      !before.unlocked[nextIdx] && after.unlocked[nextIdx]
        ? String(after.lessons[nextIdx]._id)
        : null;

    res.json({
      score,
      total,
      percent,
      bestPercent,
      outcome: outcomeFor(percent),
      wrongItems,
      unlockedNext,
      recommendedId: after.recommendedId,
    });
  }),
);
