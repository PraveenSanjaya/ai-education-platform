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
