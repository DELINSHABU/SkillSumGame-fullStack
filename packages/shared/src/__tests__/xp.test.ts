import { describe, expect, it } from 'vitest';
import { calculateXP, getAccountLevel, getLevelXPThreshold, getStarsFromScore } from '../xp';

const session = (over: Partial<Parameters<typeof calculateXP>[0]> = {}) => ({
  correct: 10,
  wrong: 0,
  accuracy: 100,
  maxStreak: 10,
  durationMs: 30000,
  ...over,
});

describe('calculateXP', () => {
  it('base is 10 per correct', () => {
    expect(calculateXP(session()).base).toBe(100);
  });

  it('accuracy tiers', () => {
    expect(calculateXP(session({ accuracy: 100 })).accuracyBonus).toBe(80); // 1.8x
    expect(calculateXP(session({ accuracy: 92 })).accuracyBonus).toBe(50); // 1.5x
    expect(calculateXP(session({ accuracy: 85 })).accuracyBonus).toBe(19); // 1.2x (floor of 100*0.1999…)
    expect(calculateXP(session({ accuracy: 75 })).accuracyBonus).toBe(0); // 1.0x
    expect(calculateXP(session({ accuracy: 60 })).accuracyBonus).toBe(-40); // 0.6x
    expect(calculateXP(session({ accuracy: 30 })).accuracyBonus).toBe(-80); // 0.2x
  });

  it('speed tiers by avg ms', () => {
    expect(calculateXP(session({ durationMs: 10000 })).speedBonus).toBe(50); // 1000ms avg
    expect(calculateXP(session({ durationMs: 20000 })).speedBonus).toBe(25); // 2000ms
    expect(calculateXP(session({ durationMs: 30000 })).speedBonus).toBe(10); // 3000ms
    expect(calculateXP(session({ durationMs: 50000 })).speedBonus).toBe(0); // 5000ms
  });

  it('streak tiers', () => {
    expect(calculateXP(session({ maxStreak: 25 })).streakBonus).toBe(50);
    expect(calculateXP(session({ maxStreak: 12 })).streakBonus).toBe(30);
    expect(calculateXP(session({ maxStreak: 6 })).streakBonus).toBe(15);
    expect(calculateXP(session({ maxStreak: 3 })).streakBonus).toBe(0);
  });

  it('mode bonuses stack', () => {
    const b = calculateXP(session(), {
      isLevelComplete: true,
      isBossLevel: true,
      isPersonalBest: true,
    });
    expect(b.modeBonus).toBe(450);
  });

  it('daily streak multiplier caps at 2.0', () => {
    expect(calculateXP(session(), { dailyStreakDays: 10 }).multiplier).toBeCloseTo(1.3);
    expect(calculateXP(session(), { dailyStreakDays: 100 }).multiplier).toBe(2.0);
  });

  it('zero correct yields zero-ish XP', () => {
    const b = calculateXP(session({ correct: 0, accuracy: 0, maxStreak: 0 }));
    expect(b.total).toBe(0);
  });
});

describe('stars', () => {
  const level = { star1Score: 6, star2Score: 8, star3Score: 10 };
  it('thresholds', () => {
    expect(getStarsFromScore(5, level)).toBe(0);
    expect(getStarsFromScore(6, level)).toBe(1);
    expect(getStarsFromScore(8, level)).toBe(2);
    expect(getStarsFromScore(10, level)).toBe(3);
    expect(getStarsFromScore(99, level)).toBe(3);
  });
});

describe('account levels', () => {
  it('threshold formula', () => {
    expect(getLevelXPThreshold(1)).toBe(0);
    expect(getLevelXPThreshold(2)).toBe(500);
    expect(getLevelXPThreshold(3)).toBe(Math.floor(500 * Math.pow(2, 1.5)));
  });
  it('level from xp is monotonic', () => {
    expect(getAccountLevel(0)).toBe(1);
    expect(getAccountLevel(499)).toBe(1);
    expect(getAccountLevel(500)).toBe(2);
    let prev = 1;
    for (let xp = 0; xp <= 100000; xp += 2500) {
      const lvl = getAccountLevel(xp);
      expect(lvl).toBeGreaterThanOrEqual(prev);
      prev = lvl;
    }
  });
});
