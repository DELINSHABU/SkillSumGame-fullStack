import type { StarCount } from './types';

export interface XPBreakdown {
  base: number;
  accuracyBonus: number;
  speedBonus: number;
  streakBonus: number;
  modeBonus: number;
  multiplier: number;
  total: number;
}

export interface XPSessionInput {
  correct: number;
  wrong: number;
  accuracy: number; // 0-100
  maxStreak: number;
  durationMs: number;
}

export interface XPContext {
  isLevelComplete?: boolean;
  isBossLevel?: boolean;
  isPersonalBest?: boolean;
  dailyStreakDays?: number;
}

export function calculateXP(session: XPSessionInput, config?: XPContext): XPBreakdown {
  const base = session.correct * 10;

  const accuracyMult =
    session.accuracy >= 95 ? 1.8 :
    session.accuracy >= 90 ? 1.5 :
    session.accuracy >= 80 ? 1.2 :
    session.accuracy >= 70 ? 1.0 :
    session.accuracy >= 50 ? 0.6 : 0.2;
  const accuracyBonus = Math.floor(base * (accuracyMult - 1));

  const avgMs = session.durationMs / Math.max(session.correct + session.wrong, 1);
  const speedBonus =
    avgMs < 1500 ? Math.floor(base * 0.5) :
    avgMs < 2500 ? Math.floor(base * 0.25) :
    avgMs < 3500 ? Math.floor(base * 0.1) : 0;

  const streakBonus =
    session.maxStreak >= 20 ? Math.floor(base * 0.5) :
    session.maxStreak >= 10 ? Math.floor(base * 0.3) :
    session.maxStreak >= 5 ? Math.floor(base * 0.15) : 0;

  let modeBonus = 0;
  if (config?.isLevelComplete) modeBonus += 100;
  if (config?.isBossLevel) modeBonus += 200;
  if (config?.isPersonalBest) modeBonus += 150;

  const streakDays = config?.dailyStreakDays || 1;
  const multiplier = Math.min(1 + streakDays * 0.03, 2.0);

  const subtotal = base + accuracyBonus + speedBonus + streakBonus + modeBonus;
  const total = Math.floor(subtotal * multiplier);

  return { base, accuracyBonus, speedBonus, streakBonus, modeBonus, multiplier, total };
}

export function getStarsFromScore(
  score: number,
  level: { star1Score: number; star2Score: number; star3Score: number }
): StarCount {
  if (score >= level.star3Score) return 3;
  if (score >= level.star2Score) return 2;
  if (score >= level.star1Score) return 1;
  return 0;
}

/** XP required to reach an account level (level 1 = 0). */
export function getLevelXPThreshold(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(500 * Math.pow(level - 1, 1.5));
}

export function getAccountLevel(xp: number): number {
  for (let level = 100; level >= 1; level--) {
    if (xp >= getLevelXPThreshold(level)) return level;
  }
  return 1;
}
