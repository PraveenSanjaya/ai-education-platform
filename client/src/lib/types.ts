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

export interface HistoryItem {
  id: string;
  kind: 'vocab' | 'grammar' | 'mixed' | 'placement';
  title: string;
  score: number;
  total: number;
  percent: number;
  wrongItems: { prompt: string; response: string; correctAnswer: string; explanation: string }[];
  createdAt: string;
}

export interface HistorySummary {
  sessions: number;
  averagePercent: number;
  mistakes: number;
  streak: number;
}

export interface Progress {
  streak: number;
  wordsSaved: number;
  wordsLearned: number;
  lessonsMastered: number;
  totalLessons: number;
  lastScores: { id: string; kind: string; title: string; percent: number; createdAt: string }[];
  next: { lessonId: string; title: string; titleSi: string; bestPercent: number | null } | null;
}

/** Minutes ahead of UTC for the learner's browser, so streak days follow local midnight. */
export const tzOffset = () => -new Date().getTimezoneOffset();
