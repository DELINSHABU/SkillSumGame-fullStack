import { describe, expect, it } from 'vitest';
import { DAILY_XP_REWARD, generateDailyChallenge, getTodayDate, hashDate } from '../daily';

describe('daily challenges', () => {
  it('same date → identical challenges', () => {
    expect(generateDailyChallenge('2026-07-04')).toEqual(generateDailyChallenge('2026-07-04'));
  });

  it('adjacent dates → different challenges', () => {
    const a = generateDailyChallenge('2026-07-04');
    const b = generateDailyChallenge('2026-07-05');
    expect(a).not.toEqual(b);
    expect(hashDate('2026-07-04')).not.toBe(hashDate('2026-07-05'));
  });

  it('365 days: always 3 tasks with valid params', () => {
    for (let i = 0; i < 365; i++) {
      const d = new Date(Date.UTC(2026, 0, 1 + i));
      const challenge = generateDailyChallenge(getTodayDate(d));
      expect(challenge.tasks).toHaveLength(3);
      expect(challenge.xpReward).toBe(DAILY_XP_REWARD);
      const [score, accuracy, streak] = challenge.tasks;
      expect(score?.type).toBe('score');
      expect(score?.target).toBeGreaterThanOrEqual(12);
      expect(score?.target).toBeLessThanOrEqual(25);
      expect(score?.practiceConfig?.mode).toBe('time');
      expect(accuracy?.type).toBe('accuracy');
      expect(accuracy?.target).toBeGreaterThanOrEqual(80);
      expect(accuracy?.target).toBeLessThanOrEqual(95);
      expect(accuracy?.practiceConfig?.mode).toBe('count');
      expect(streak?.type).toBe('streak');
      expect(streak?.target).toBeGreaterThanOrEqual(8);
      expect(streak?.target).toBeLessThanOrEqual(15);
    }
  });

  it('getTodayDate formats YYYY-MM-DD', () => {
    expect(getTodayDate(new Date('2026-07-04T15:00:00Z'))).toBe('2026-07-04');
  });
});
