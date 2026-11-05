import { Router } from 'express';
import { z } from 'zod';
import { isValidObjectId, type Types } from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { HttpError, parse, wrap } from '../middleware/http.js';
import { History, type HistoryKind } from '../models/History.js';
import { handleGrammar, handleMixed, handlePlacement } from '../services/resultHandlers.js';
import { applyVocabAnswers } from '../services/vocabReview.js';

export const resultsRouter = Router();
resultsRouter.use(requireAuth);

const answers = z
  .array(z.object({ questionId: z.string().min(1), response: z.string().max(300) }))
  .min(1, 'No answers submitted')
  .max(100);

const vocabAnswers = z
  .array(
    z.object({
      wordId: z.string().min(1),
      prompt: z.string().max(200),
      response: z.string().max(200),
      correctAnswer: z.string().max(200),
      correct: z.boolean(),
    }),
  )
  .min(1, 'No answers submitted')
  .max(100);

const bodySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('grammar'), lessonId: z.string(), answers }),
  z.object({ kind: z.literal('mixed'), answers }),
  z.object({ kind: z.literal('placement'), answers }),
  z.object({
    kind: z.literal('vocab'),
    title: z.string().trim().min(1).max(80),
    answers: vocabAnswers,
  }),
]);

interface Recordable {
  title: string;
  score: number;
  total: number;
  percent: number;
  wrongItems: { prompt: string; response: string; correctAnswer: string; explanation?: string }[];
}

async function record(userId: Types.ObjectId, kind: HistoryKind, r: Recordable) {
  await History.create({
    userId,
    kind,
    title: r.title,
    score: r.score,
    total: r.total,
    percent: r.percent,
    wrongItems: r.wrongItems.map((w) => ({
      prompt: w.prompt,
      response: w.response,
      correctAnswer: w.correctAnswer,
      explanation: w.explanation ?? '',
    })),
  });
}

resultsRouter.post(
  '/',
  wrap(async (req, res) => {
    const body = parse(bodySchema, req.body);
    const user = req.user!;
    let result: Recordable & Record<string, unknown>;

    if (body.kind === 'grammar') {
      if (!isValidObjectId(body.lessonId)) throw new HttpError(400, 'Invalid lesson id');
      result = await handleGrammar(user, body.lessonId, body.answers);
    } else if (body.kind === 'mixed') {
      result = await handleMixed(body.answers);
    } else if (body.kind === 'placement') {
      result = await handlePlacement(user._id, body.answers);
    } else {
      const words = await applyVocabAnswers(user._id, body.answers);
      const score = body.answers.filter((a) => a.correct).length;
      const total = body.answers.length;
      result = {
        title: body.title,
        score,
        total,
        percent: Math.round((score / total) * 100),
        wrongItems: body.answers.filter((a) => !a.correct),
        words,
      };
    }

    await record(user._id, body.kind, result);
    res.json(result);
  }),
);
