export const LEVELS = ['Beginner', 'Elementary', 'Intermediate'] as const;
export type Level = (typeof LEVELS)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  startLevel: Level;
  role: 'user' | 'admin';
  active: boolean;
  createdAt: string;
}

export interface SavedWord {
  id: string;
  english: string;
  sinhala: string;
  partOfSpeech: string;
  example: string;
  strength: number;
  seenCount: number;
  needsReview: boolean;
  createdAt: string;
}

export interface Lookup {
  found: boolean;
  sinhala?: string;
  partOfSpeech?: string;
  example?: string;
  baseForm?: string;
}

export interface VocabQuestion {
  wordId: string;
  format: 'en-si' | 'si-en' | 'spelling';
  prompt: string;
  options?: string[];
  answer: string;
}

export type QuestionType = 'mc' | 'fill' | 'tf' | 'order';

export interface GrammarQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  answers: string[];
  explanation: string;
}

export interface LessonSummary {
  id: string;
  order: number;
  title: string;
  titleSi: string;
  level: Level;
  unlocked: boolean;
  bestPercent: number | null;
  attempts: number;
  mastered: boolean;
  questionCount: number;
}

export interface LessonFull {
  id: string;
  order: number;
  title: string;
  titleSi: string;
  level: Level;
  explanation: string[];
  sinhalaNotes: string[];
  examples: { en: string; si: string }[];
  questions: GrammarQuestion[];
  bestPercent: number | null;
}

export interface WrongItem {
  questionId: string;
  prompt: string;
  response: string;
  correctAnswer: string;
  explanation: string;
}

export interface GrammarResult {
  score: number;
  total: number;
  percent: number;
  bestPercent: number;
  outcome: 'pass' | 'retry' | 'review';
  wrongItems: WrongItem[];
  unlockedNext: string | null;
  recommendedId: string | null;
}
