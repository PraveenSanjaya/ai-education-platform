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
