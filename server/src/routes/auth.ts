import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { CHALLENGES, LEVELS, User, toPublicUser, type UserDoc } from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { HttpError, parse, wrap } from '../middleware/http.js';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  startLevel: z.enum(LEVELS).optional(),
  challenge: z.enum(CHALLENGES).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

authRouter.post(
  '/register',
  wrap(async (req, res) => {
    const body = parse(registerSchema, req.body);
    const exists = await User.exists({ email: body.email.toLowerCase() });
    if (exists) throw new HttpError(409, 'An account with this email already exists');
    const user = await User.create({
      name: body.name,
      email: body.email,
      passwordHash: await bcrypt.hash(body.password, 10),
      startLevel: body.startLevel ?? 'Beginner',
      challenge: body.challenge ?? 'easy',
    });
    const doc = user.toObject() as UserDoc;
    res.status(201).json({ token: signToken(String(doc._id)), user: toPublicUser(doc) });
  }),
);

authRouter.post(
  '/login',
  wrap(async (req, res) => {
    const body = parse(loginSchema, req.body);
    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      throw new HttpError(401, 'Incorrect email or password');
    }
    if (!user.active) throw new HttpError(403, 'This account has been deactivated');
    const doc = user.toObject() as UserDoc;
    res.json({ token: signToken(String(doc._id)), user: toPublicUser(doc) });
  }),
);
