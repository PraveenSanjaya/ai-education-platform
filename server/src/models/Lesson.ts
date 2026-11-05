import { Schema, model, type Types } from 'mongoose';
import { LEVELS } from './User.js';

export const QUESTION_TYPES = ['mc', 'fill', 'tf', 'order'] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

const questionSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: QUESTION_TYPES, required: true },
    prompt: { type: String, required: true },
    /** mc: choices; order: the shuffled words; fill/tf: unused. */
    options: { type: [String], default: undefined },
    /** All accepted answers (normalised on comparison). tf uses 'true' / 'false'. */
    answers: { type: [String], required: true },
    explanation: { type: String, default: '' },
  },
  { _id: false },
);

const lessonSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  order: { type: Number, required: true, index: true },
  title: { type: String, required: true },
  titleSi: { type: String, required: true },
  level: { type: String, enum: LEVELS, required: true },
  explanation: { type: [String], required: true },
  sinhalaNotes: { type: [String], required: true },
  examples: [{ en: String, si: String, _id: false }],
  questions: { type: [questionSchema], required: true },
});

export interface LessonQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  answers: string[];
  explanation: string;
}

export interface LessonDoc {
  _id: Types.ObjectId;
  slug: string;
  order: number;
  title: string;
  titleSi: string;
  level: (typeof LEVELS)[number];
  explanation: string[];
  sinhalaNotes: string[];
  examples: { en: string; si: string }[];
  questions: LessonQuestion[];
}

export const Lesson = model('Lesson', lessonSchema);
