import { Schema, model } from 'mongoose';

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  bestPercent: { type: Number, default: 0 },
  lastPercent: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});
schema.index({ userId: 1, lessonId: 1 }, { unique: true });

export const LessonProgress = model('LessonProgress', schema);
