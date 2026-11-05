import { isUnlocked, outcomeFor, recommendLesson, type PathLesson } from './services/grammarRules';

const lessons: PathLesson[] = [
  { id: 'a', order: 1, level: 'Beginner' },
  { id: 'b', order: 2, level: 'Beginner' },
  { id: 'c', order: 3, level: 'Elementary' },
  { id: 'd', order: 4, level: 'Elementary' },
  { id: 'e', order: 5, level: 'Intermediate' },
];

describe('outcomeFor', () => {
  it.each([
    [100, 'pass'],
    [70, 'pass'],
    [69, 'retry'],
    [50, 'retry'],
    [49, 'review'],
    [0, 'review'],
  ])('%i%% -> %s', (percent, outcome) => {
    expect(outcomeFor(percent)).toBe(outcome);
  });
});

describe('isUnlocked', () => {
  it('unlocks lessons at or below the start level', () => {
    expect(isUnlocked(lessons, 1, {}, 'Beginner')).toBe(true);
    expect(isUnlocked(lessons, 3, {}, 'Elementary')).toBe(true);
    expect(isUnlocked(lessons, 4, {}, 'Elementary')).toBe(false);
    expect(isUnlocked(lessons, 4, {}, 'Intermediate')).toBe(true);
  });

  it('unlocks the next lesson once the previous best is >= 70%', () => {
    expect(isUnlocked(lessons, 2, {}, 'Beginner')).toBe(false);
    expect(isUnlocked(lessons, 2, { b: 69 }, 'Beginner')).toBe(false);
    expect(isUnlocked(lessons, 2, { b: 70 }, 'Beginner')).toBe(true);
  });
});

describe('recommendLesson', () => {
  it('starts with the first lesson for a beginner', () => {
    expect(recommendLesson(lessons, {}, 'Beginner')).toBe('a');
  });

  it('skips mastered lessons', () => {
    expect(recommendLesson(lessons, { a: 80 }, 'Beginner')).toBe('b');
  });

  it('starts from the start level upward', () => {
    expect(recommendLesson(lessons, {}, 'Elementary')).toBe('c');
  });

  it('falls back to earlier unlocked lessons that still need work', () => {
    expect(recommendLesson(lessons, { c: 90, d: 90 }, 'Elementary')).toBe('e');
    expect(recommendLesson(lessons, { c: 90, d: 90, e: 90 }, 'Elementary')).toBe('a');
  });

  it('returns null when everything is mastered', () => {
    const best = { a: 100, b: 100, c: 100, d: 100, e: 100 };
    expect(recommendLesson(lessons, best, 'Beginner')).toBeNull();
  });
});
