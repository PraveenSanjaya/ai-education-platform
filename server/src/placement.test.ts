import { placementOutcome } from './services/placement';
import { pickMixed, lessonWeight, type MixedSource } from './services/mixedReview';
import type { Level } from './models/User';

const levels: Level[] = [
  'Beginner',
  'Beginner',
  'Beginner',
  'Elementary',
  'Elementary',
  'Elementary',
  'Intermediate',
  'Intermediate',
  'Intermediate',
];

describe('placementOutcome', () => {
  it('reaches the end when there are fewer than two mistakes', () => {
    const r = placementOutcome([true, true, false, true, true, true, true, true, true], levels);
    expect(r.reached).toBe(9);
    expect(r.counted).toBe(9);
    expect(r.level).toBe('Intermediate');
  });

  it('stops counting at the second mistake', () => {
    const r = placementOutcome([true, true, true, true, false, true, false, true, true], levels);
    expect(r.counted).toBe(7);
    expect(r.reached).toBe(6); // lessons 1-6 reached; lesson 7 had the second mistake
    expect(r.level).toBe('Elementary');
  });

  it('places a learner who fails immediately at Beginner', () => {
    const r = placementOutcome([false, false, true], levels.slice(0, 3));
    expect(r.reached).toBe(1);
    expect(r.counted).toBe(2);
    expect(r.level).toBe('Beginner');
  });
});

describe('pickMixed', () => {
  const q = (id: string) => ({
    id,
    type: 'mc' as const,
    prompt: id,
    answers: ['x'],
    explanation: '',
  });
  const sources: MixedSource[] = [
    {
      id: 'weak',
      title: 'Weak',
      best: 20,
      questions: Array.from({ length: 20 }, (_, i) => q(`w${i}`)),
    },
    {
      id: 'strong',
      title: 'Strong',
      best: 100,
      questions: Array.from({ length: 20 }, (_, i) => q(`s${i}`)),
    },
  ];

  it('weights low-scoring and untried lessons higher', () => {
    expect(lessonWeight(null)).toBeGreaterThan(lessonWeight(70));
    expect(lessonWeight(20)).toBeGreaterThan(lessonWeight(100));
  });

  it('returns 10 distinct questions', () => {
    const picked = pickMixed(sources);
    expect(picked).toHaveLength(10);
    expect(new Set(picked.map((p) => p.id)).size).toBe(10);
  });

  it('draws more from the weak lesson', () => {
    let weak = 0;
    let total = 0;
    for (let i = 0; i < 300; i++) {
      for (const p of pickMixed(sources)) {
        total++;
        if (p.lessonId === 'weak') weak++;
      }
    }
    expect(weak / total).toBeGreaterThan(0.55);
  });

  it('returns fewer when not enough questions exist', () => {
    expect(
      pickMixed([{ id: 'a', title: 'A', best: null, questions: [q('1'), q('2')] }]),
    ).toHaveLength(2);
  });
});
