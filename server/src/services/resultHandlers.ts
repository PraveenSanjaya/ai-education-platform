import type { Types } from 'mongoose';
import { Lesson, type LessonDoc, type LessonQuestion } from '../models/Lesson.js';
import { LessonProgress } from '../models/LessonProgress.js';
import { User, toPublicUser, type Level, type UserDoc } from '../models/User.js';
import { HttpError } from '../middleware/http.js';
import { isCorrect } from './grading.js';
import { loadPath } from './grammarPath.js';
import { outcomeFor } from './grammarRules.js';
import { placementOutcome } from './placement.js';

export interface Answer {
  questionId: string;
  response: string;
}

export interface WrongItem {
  questionId: string;
  prompt: string;
  response: string;
  correctAnswer: string;
  explanation: string;
}

export interface Graded {
  score: number;
  total: number;
  percent: number;
  wrongItems: WrongItem[];
  /** Per answer, in the order submitted. */
  correctness: boolean[];
}

export function gradeAnswers(questions: Map<string, LessonQuestion>, answers: Answer[]): Graded {
  const wrongItems: WrongItem[] = [];
  const correctness: boolean[] = [];
  let score = 0;
  for (const a of answers) {
    const q = questions.get(a.questionId);
    if (!q) throw new HttpError(400, `Unknown question: ${a.questionId}`);
    const ok = isCorrect(q, a.response);
    correctness.push(ok);
    if (ok) score++;
    else {
      wrongItems.push({
        questionId: q.id,
        prompt: q.prompt,
        response: a.response,
        correctAnswer: q.answers[0],
        explanation: q.explanation,
      });
    }
  }
  const total = answers.length;
  return { score, total, percent: Math.round((score / total) * 100), wrongItems, correctness };
}

async function allQuestions() {
  const lessons = (await Lesson.find().sort({ order: 1 }).lean()) as unknown as LessonDoc[];
  const map = new Map<string, LessonQuestion>();
  const lessonOf = new Map<string, LessonDoc>();
  for (const l of lessons) {
    for (const q of l.questions) {
      map.set(q.id, q);
      lessonOf.set(q.id, l);
    }
  }
  return { lessons, map, lessonOf };
}

export async function handleGrammar(user: UserDoc, lessonId: string, answers: Answer[]) {
  const lesson = (await Lesson.findById(lessonId).lean()) as unknown as LessonDoc | null;
  if (!lesson) throw new HttpError(404, 'Lesson not found');

  const before = await loadPath(user._id, user.startLevel);
  const index = before.lessons.findIndex((l) => String(l._id) === lessonId);
  if (!before.unlocked[index]) throw new HttpError(403, 'This lesson is locked');

  const graded = gradeAnswers(new Map(lesson.questions.map((q) => [q.id, q])), answers);
  const prior = await LessonProgress.findOne({ userId: user._id, lessonId: lesson._id });
  const bestPercent = Math.max(prior?.bestPercent ?? 0, graded.percent);
  await LessonProgress.updateOne(
    { userId: user._id, lessonId: lesson._id },
    {
      $set: { bestPercent, lastPercent: graded.percent, updatedAt: new Date() },
      $inc: { attempts: 1 },
    },
    { upsert: true },
  );

  const after = await loadPath(user._id, user.startLevel);
  const next = index + 1;
  const unlockedNext =
    !before.unlocked[next] && after.unlocked[next] ? String(after.lessons[next]._id) : null;

  return {
    ...graded,
    title: lesson.title,
    bestPercent,
    outcome: outcomeFor(graded.percent),
    unlockedNext,
    recommendedId: after.recommendedId,
  };
}

/** Mixed review: graded only. It never changes a lesson's best score. */
export async function handleMixed(answers: Answer[]) {
  const { map } = await allQuestions();
  return { ...gradeAnswers(map, answers), title: 'Mixed grammar review' };
}

export async function handlePlacement(userId: Types.ObjectId, answers: Answer[]) {
  const { lessons, map, lessonOf } = await allQuestions();
  const order = new Map(lessons.map((l, i) => [String(l._id), i]));
  // one answer per lesson, in lesson order
  const sorted = [...answers].sort(
    (a, b) =>
      (order.get(String(lessonOf.get(a.questionId)?._id)) ?? 0) -
      (order.get(String(lessonOf.get(b.questionId)?._id)) ?? 0),
  );
  const graded = gradeAnswers(map, sorted);
  const outcome = placementOutcome(
    graded.correctness,
    sorted.map((a) => lessonOf.get(a.questionId)!.level),
  );
  const user = await User.findByIdAndUpdate(
    userId,
    { startLevel: outcome.level as Level },
    { new: true },
  ).lean();

  // Only answers up to (and including) the second mistake count.
  const counted = graded.correctness.slice(0, outcome.counted);
  const score = counted.filter(Boolean).length;
  return {
    ...graded,
    score,
    total: outcome.counted,
    percent: Math.round((score / outcome.counted) * 100),
    wrongItems: graded.wrongItems.slice(0, counted.filter((c) => !c).length),
    title: 'Level check',
    level: outcome.level,
    reached: outcome.reached,
    user: toPublicUser(user as UserDoc),
  };
}
