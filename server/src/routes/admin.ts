import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import { LEVELS, User, toPublicUser, type UserDoc } from '../models/User.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { HttpError, parse, wrap } from '../middleware/http.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

const createSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  startLevel: z.enum(LEVELS).optional(),
  role: z.enum(['user', 'admin']).optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  email: z.string().trim().email().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  startLevel: z.enum(LEVELS).optional(),
  role: z.enum(['user', 'admin']).optional(),
  active: z.boolean().optional(),
});

function checkId(id: string) {
  if (!isValidObjectId(id)) throw new HttpError(400, 'Invalid user id');
}

adminRouter.get(
  '/users',
  wrap(async (_req, res) => {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json({ users: users.map((u) => toPublicUser(u as UserDoc)) });
  }),
);

adminRouter.post(
  '/users',
  wrap(async (req, res) => {
    const body = parse(createSchema, req.body);
    if (await User.exists({ email: body.email.toLowerCase() })) {
      throw new HttpError(409, 'An account with this email already exists');
    }
    const { password, ...rest } = body;
    const user = await User.create({ ...rest, passwordHash: await bcrypt.hash(password, 10) });
    res.status(201).json({ user: toPublicUser(user.toObject() as UserDoc) });
  }),
);

adminRouter.put(
  '/users/:id',
  wrap(async (req, res) => {
    checkId(req.params.id);
    const { password, ...rest } = parse(updateSchema, req.body);
    const update: Record<string, unknown> = { ...rest };
    if (password) update.passwordHash = await bcrypt.hash(password, 10);
    if (
      String(req.user!._id) === req.params.id &&
      (rest.active === false || rest.role === 'user')
    ) {
      throw new HttpError(400, 'You cannot deactivate or demote your own account');
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!user) throw new HttpError(404, 'User not found');
    res.json({ user: toPublicUser(user as UserDoc) });
  }),
);

/** DELETE deactivates the user (soft delete) so their data stays intact. */
adminRouter.delete(
  '/users/:id',
  wrap(async (req, res) => {
    checkId(req.params.id);
    if (String(req.user!._id) === req.params.id) {
      throw new HttpError(400, 'You cannot deactivate your own account');
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true },
    ).lean();
    if (!user) throw new HttpError(404, 'User not found');
    res.json({ user: toPublicUser(user as UserDoc) });
  }),
);
