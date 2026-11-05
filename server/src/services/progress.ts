/** Pure helpers for the history summary and the daily streak. */

export interface HistoryLike {
  percent: number;
  total: number;
  score: number;
  createdAt: Date;
}

const DAY = 24 * 60 * 60 * 1000;

/** Day number in the learner's local time (tzMinutes = minutes ahead of UTC, e.g. 330 for Sri Lanka). */
const dayIndex = (d: Date, tzMinutes: number) =>
  Math.floor((d.getTime() + tzMinutes * 60000) / DAY);

/**
 * Consecutive days with at least one session, counting back from today.
 * If nothing was done today but something was done yesterday, the streak is still alive.
 */
export function computeStreak(dates: Date[], now: Date = new Date(), tzMinutes = 0): number {
  const days = new Set(dates.map((d) => dayIndex(d, tzMinutes)));
  const today = dayIndex(now, tzMinutes);
  let cursor = days.has(today) ? today : today - 1;
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor--;
  }
  return streak;
}

export function summarise(items: HistoryLike[], dates: Date[], now = new Date(), tz = 0) {
  const sessions = items.length;
  const average = sessions ? Math.round(items.reduce((s, i) => s + i.percent, 0) / sessions) : 0;
  const mistakes = items.reduce((s, i) => s + (i.total - i.score), 0);
  return { sessions, averagePercent: average, mistakes, streak: computeStreak(dates, now, tz) };
}
