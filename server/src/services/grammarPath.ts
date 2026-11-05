import type { Types } from 'mongoose';
import { Lesson, type LessonDoc } from '../models/Lesson.js';
import { LessonProgress } from '../models/LessonProgress.js';
import type { Level } from '../models/User.js';
import { isUnlocked, recommendLesson, PASS_PERCENT } from './grammarRules.js';

export async function loadPath(userId: Types.ObjectId, startLevel: Level) {
  const lessons = (await Lesson.find().sort({ order: 1 }).lean()) as unknown as LessonDoc[];
  const progress = await LessonProgress.find({ userId }).lean();
  const best: Record<string, number> = {};
  const attempts: Record<string, number> = {};
  for (const p of progress) {
    best[String(p.lessonId)] = p.bestPercent;
    attempts[String(p.lessonId)] = p.attempts;
  }
  const path = lessons.map((l) => ({ id: String(l._id), order: l.order, level: l.level }));
  const recommendedId = recommendLesson(path, best, startLevel);
  const unlocked = lessons.map((_, i) => isUnlocked(path, i, best, startLevel));
  return { lessons, best, attempts, unlocked, recommendedId, passPercent: PASS_PERCENT };
}
