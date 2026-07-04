import type { QuestionAttempt, SkillType } from './types';

interface SkillStats {
  correct: number;
  wrong: number;
  totalMs: number;
  count: number;
}

export interface WeakSpotReport {
  skill: SkillType;
  accuracy: number;
  avgMs: number;
  isWeak: boolean;
  reason: 'low_accuracy' | 'slow_speed' | 'both';
}

const ACCURACY_THRESHOLD = 70;
const SPEED_THRESHOLD_MS = 4000;
const MIN_ATTEMPTS = 3;

export function detectWeakSpots(attempts: QuestionAttempt[]): WeakSpotReport[] {
  const stats = new Map<SkillType, SkillStats>();

  for (const attempt of attempts) {
    let s = stats.get(attempt.skill);
    if (!s) {
      s = { correct: 0, wrong: 0, totalMs: 0, count: 0 };
      stats.set(attempt.skill, s);
    }
    s.count++;
    s.totalMs += attempt.responseMs;
    if (attempt.isCorrect) s.correct++;
    else s.wrong++;
  }

  const reports: WeakSpotReport[] = [];
  for (const [skill, s] of stats) {
    if (s.count < MIN_ATTEMPTS) continue;
    const accuracy = (s.correct / s.count) * 100;
    const avgMs = s.totalMs / s.count;
    const lowAccuracy = accuracy < ACCURACY_THRESHOLD;
    const slowSpeed = avgMs > SPEED_THRESHOLD_MS;
    if (!lowAccuracy && !slowSpeed) continue;
    reports.push({
      skill,
      accuracy,
      avgMs,
      isWeak: true,
      reason: lowAccuracy && slowSpeed ? 'both' : lowAccuracy ? 'low_accuracy' : 'slow_speed',
    });
  }
  return reports;
}
