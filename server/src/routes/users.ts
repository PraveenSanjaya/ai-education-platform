import { Router } from 'express';
import { z } from 'zod';
import { LEVELS, User, toPublicUser, type UserDoc } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError, parse, wrap } from '../middleware/http.js';

export const usersRouter = Router();
usersRouter.use(requireAuth);

const updateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80).optional(),
  startLevel: z.enum(LEVELS).optional(),
});

usersRouter.get('/me', (req, res) => {
  res.json({ user: toPublicUser(req.user!) });
});

usersRouter.put(
  '/me',
  wrap(async (req, res) => {
    const body = parse(updateSchema, req.body);
    const user = await User.findByIdAndUpdate(req.user!._id, body, { new: true }).lean();
    if (!user) throw new HttpError(404, 'User not found');
    res.json({ user: toPublicUser(user as UserDoc) });
  }),
);
