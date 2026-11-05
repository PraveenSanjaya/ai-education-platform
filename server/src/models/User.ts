import { Schema, model, type InferSchemaType } from 'mongoose';

export const LEVELS = ['Beginner', 'Elementary', 'Intermediate'] as const;
export const CHALLENGES = ['easy', 'hard'] as const;
export type Challenge = (typeof CHALLENGES)[number];
export type Level = (typeof LEVELS)[number];

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  startLevel: { type: String, enum: LEVELS, default: 'Beginner' },
  challenge: { type: String, enum: CHALLENGES, default: 'easy' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: import('mongoose').Types.ObjectId;
};
export const User = model('User', userSchema);

/** Public shape of a user (never includes the password hash). */
export function toPublicUser(u: UserDoc) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    startLevel: u.startLevel,
    challenge: u.challenge ?? 'easy',
    role: u.role,
    active: u.active,
    createdAt: u.createdAt,
  };
}
