import { describe, expect, it } from 'vitest';
import { dayBefore, nextStreak } from '../lib/dates';

describe('dates', () => {
  it('dayBefore handles month/year boundaries', () => {
    expect(dayBefore('2026-07-04')).toBe('2026-07-03');
    expect(dayBefore('2026-07-01')).toBe('2026-06-30');
    expect(dayBefore('2026-01-01')).toBe('2025-12-31');
    expect(dayBefore('2026-03-01')).toBe('2026-02-28');
    expect(dayBefore('2024-03-01')).toBe('2024-02-29'); // leap year
  });

  it('streak: first ever play → 1', () => {
    expect(nextStreak({ dailyStreak: 0, lastStreakDate: null }, '2026-07-04')).toEqual({
      dailyStreak: 1,
      lastStreakDate: '2026-07-04',
    });
  });

  it('streak: same day → unchanged', () => {
    expect(nextStreak({ dailyStreak: 5, lastStreakDate: '2026-07-04' }, '2026-07-04').dailyStreak).toBe(5);
  });

  it('streak: consecutive day → +1', () => {
    expect(nextStreak({ dailyStreak: 5, lastStreakDate: '2026-07-03' }, '2026-07-04').dailyStreak).toBe(6);
  });

  it('streak: gap → reset to 1', () => {
    expect(nextStreak({ dailyStreak: 30, lastStreakDate: '2026-07-01' }, '2026-07-04').dailyStreak).toBe(1);
  });
});
