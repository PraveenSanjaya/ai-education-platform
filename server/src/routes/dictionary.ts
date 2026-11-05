import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { parse, wrap } from '../middleware/http.js';
import { lookupWord } from '../services/dictionary.js';

export const dictionaryRouter = Router();
dictionaryRouter.use(requireAuth);

const querySchema = z.object({
  word: z.string().trim().min(1, 'Enter a word to look up').max(60),
});

dictionaryRouter.get(
  '/lookup',
  wrap(async (req, res) => {
    const { word } = parse(querySchema, req.query);
    res.json(await lookupWord(word));
  }),
);
