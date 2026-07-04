import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS_LIST, checkAchievements, type AchievementContext } from '../achievements';

const baseContext = (over: Partial<AchievementContext> = {}): AchievementContext => ({
  totalCorrect: 0,
  sessionCount: 0,
  sessionAccuracy: 0,
  sessionMaxStreak: 0,
  sessionAvgMs: 0,
  accountLevel: 1,
  dailyStreak: 0,
  alreadyUnlocked: new Set(),
  ...over,
});

describe('achievements', () => {
  it('exactly 50 achievements with unique ids', () => {
    expect(ACHIEVEMENTS_LIST).toHaveLength(50);
    expect(new Set(ACHIEVEMENTS_LIST.map((a) => a.id)).size).toBe(50);
  });

  it('first_answer unlocks on 1 correct', () => {
    expect(checkAchievements(baseContext({ totalCorrect: 1, sessionCount: 1 }))).toContain('first_answer');
  });

  it('already unlocked never re-unlocks', () => {
    const unlocked = checkAchievements(
      baseContext({ totalCorrect: 1, sessionCount: 1, alreadyUnlocked: new Set(['first_answer']) })
    );
    expect(unlocked).not.toContain('first_answer');
  });

  it('streak + accuracy + speed unlock together', () => {
    const unlocked = checkAchievements(
      baseContext({
        totalCorrect: 20,
        sessionCount: 1,
        sessionAccuracy: 100,
        sessionMaxStreak: 10,
        sessionAvgMs: 900,
      })
    );
    expect(unlocked).toEqual(
      expect.arrayContaining(['perfect_session', 'accuracy_95', 'streak_5', 'streak_10', 'speed_1s', 'speed_1_5s', 'speed_2s'])
    );
  });

  it('boss achievements keyed to level ids', () => {
    const unlocked = checkAchievements(baseContext({ completedLevelId: 150, sessionCount: 1, totalCorrect: 30 }));
    expect(unlocked).toContain('boss_150');
    expect(unlocked).not.toContain('boss_200');
  });

  it('night owl by local hour', () => {
    expect(checkAchievements(baseContext({ localHour: 2 }))).toContain('night_owl');
    expect(checkAchievements(baseContext({ localHour: 5 }))).toContain('early_bird');
    expect(checkAchievements(baseContext({ localHour: 12 }))).not.toContain('night_owl');
  });

  it('all_worlds requires 8 completed worlds', () => {
    expect(
      checkAchievements(baseContext({ completedWorldIds: [1, 2, 3, 4, 5, 6, 7, 8] }))
    ).toContain('all_worlds');
    expect(checkAchievements(baseContext({ completedWorldIds: [1, 2] }))).not.toContain('all_worlds');
  });
});
