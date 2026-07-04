import { getTodayDate } from '@skillsum/shared';

export { getTodayDate };

/** Date string for the day before the given YYYY-MM-DD. */
export function dayBefore(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return getTodayDate(d);
}

export interface StreakUpdate {
  dailyStreak: number;
  lastStreakDate: string;
}

/** Streak rule: consecutive calendar days. Same day = no change. */
export function nextStreak(
  current: { dailyStreak: number; lastStreakDate: string | null },
  today: string
): StreakUpdate {
  if (current.lastStreakDate === today) {
    return { dailyStreak: Math.max(current.dailyStreak, 1), lastStreakDate: today };
  }
  if (current.lastStreakDate === dayBefore(today)) {
    return { dailyStreak: current.dailyStreak + 1, lastStreakDate: today };
  }
  return { dailyStreak: 1, lastStreakDate: today };
}
