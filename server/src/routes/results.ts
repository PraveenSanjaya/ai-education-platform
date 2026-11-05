import { Router } from 'express';
import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { HttpError, parse, wrap } from '../middleware/http.js';
import { handleGrammar, handleMixed, handlePlacement } from '../services/resultHandlers.js';

export const resultsRouter = Router();
resultsRouter.use(requireAuth);

const answers = z
  .array(z.object({ questionId: z.string().min(1), response: z.string().max(300) }))
  .min(1, 'No answers submitted')
  .max(100);

const bodySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('grammar'), lessonId: z.string(), answers }),
  z.object({ kind: z.literal('mixed'), answers }),
  z.object({ kind: z.literal('placement'), answers }),
]);

resultsRouter.post(
  '/',
  wrap(async (req, res) => {
    const body = parse(bodySchema, req.body);
    const user = req.user!;
    if (body.kind === 'grammar') {
      if (!isValidObjectId(body.lessonId)) throw new HttpError(400, 'Invalid lesson id');
      res.json(await handleGrammar(user, body.lessonId, body.answers));
    } else if (body.kind === 'mixed') {
      res.json(await handleMixed(body.answers));
    } else {
      res.json(await handlePlacement(user._id, body.answers));
    }
  }),
);
