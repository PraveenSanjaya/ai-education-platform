import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User, type UserDoc } from '../models/User.js';
import { HttpError } from './http.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserDoc;
  }
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new HttpError(401, 'Please log in first');
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    } catch {
      throw new HttpError(401, 'Your session has expired. Please log in again');
    }
    const user = await User.findById(payload.sub).lean();
    if (!user || !user.active) throw new HttpError(401, 'Account not found or deactivated');
    req.user = user as UserDoc;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(new HttpError(403, 'Admin access required'));
  next();
};
