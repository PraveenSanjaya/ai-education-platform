import { computeStreak, summarise } from './services/progress';

const d = (s: string) => new Date(s);

describe('computeStreak', () => {
  const now = d('2025-03-10T12:00:00Z');

  it('is 0 with no sessions', () => {
    expect(computeStreak([], now)).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const dates = [d('2025-03-10T08:00:00Z'), d('2025-03-09T20:00:00Z'), d('2025-03-08T01:00:00Z')];
    expect(computeStreak(dates, now)).toBe(3);
  });

  it('keeps the streak alive when the last session was yesterday', () => {
    expect(computeStreak([d('2025-03-09T10:00:00Z'), d('2025-03-08T10:00:00Z')], now)).toBe(2);
  });

  it('resets after a missed day', () => {
    expect(computeStreak([d('2025-03-08T10:00:00Z')], now)).toBe(0);
    expect(computeStreak([d('2025-03-10T10:00:00Z'), d('2025-03-08T10:00:00Z')], now)).toBe(1);
  });

  it('counts several sessions on one day once', () => {
    expect(computeStreak([d('2025-03-10T01:00:00Z'), d('2025-03-10T02:00:00Z')], now)).toBe(1);
  });

  it('respects the learner time zone (UTC+5:30)', () => {
    // 20:00Z on the 9th is 01:30 on the 10th in Sri Lanka
    const dates = [d('2025-03-09T20:00:00Z')];
    expect(computeStreak(dates, d('2025-03-10T10:00:00Z'), 330)).toBe(1);
    expect(computeStreak(dates, d('2025-03-11T10:00:00Z'), 330)).toBe(1); // yesterday is still alive
    expect(computeStreak(dates, d('2025-03-12T10:00:00Z'), 330)).toBe(0);
  });
});

describe('summarise', () => {
  it('averages percent and counts mistakes', () => {
    const items = [
      { percent: 80, total: 10, score: 8, createdAt: d('2025-03-10T00:00:00Z') },
      { percent: 50, total: 10, score: 5, createdAt: d('2025-03-10T00:00:00Z') },
    ];
    const s = summarise(
      items,
      items.map((i) => i.createdAt),
      d('2025-03-10T12:00:00Z'),
    );
    expect(s).toEqual({ sessions: 2, averagePercent: 65, mistakes: 7, streak: 1 });
  });
});
