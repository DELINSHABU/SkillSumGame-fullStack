import type { ChallengeTask, DailyChallenge, OperationType } from './types';
import { mulberry32, pick, randInt } from './rng';

// Daily challenges are deterministic per date: same date → same 3 tasks for
// every player. Seed comes from the date string.

export const DAILY_XP_REWARD = 2000;

const OP_NAMES: Record<OperationType, string> = {
  '+': 'Addition',
  '-': 'Subtraction',
  '×': 'Multiplication',
  '÷': 'Division',
};

export function hashDate(date: string): number {
  // FNV-1a — spreads consecutive dates across the seed space (the guide's
  // char-code sum gave near-identical seeds for adjacent days).
  let h = 0x811c9dc5;
  for (let i = 0; i < date.length; i++) {
    h ^= date.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function getTodayDate(now: Date = new Date()): string {
  const key = now.toISOString().split('T')[0];
  if (!key) throw new Error('unreachable: toISOString always contains T');
  return key;
}

export function generateDailyChallenge(date: string): DailyChallenge {
  const rng = mulberry32(hashDate(date));
  const ops: OperationType[] = ['+', '-', '×', '÷'];

  // Task 1 — score in a timed run
  const op1 = pick(rng, ops);
  const time1 = pick(rng, [45, 60, 90] as const);
  const target1 = randInt(rng, 12, 25);
  const score: ChallengeTask = {
    id: `${date}_c1`,
    description: `Get ${target1} correct in ${OP_NAMES[op1]} (${time1}s)`,
    type: 'score',
    target: target1,
    practiceConfig: { mode: 'time', timeLimit: time1, operators: [op1], numberRange: [1, 50] },
  };

  // Task 2 — accuracy over a fixed count
  const op2 = pick(rng, ops);
  const target2 = pick(rng, [80, 85, 90, 95] as const);
  const count2 = randInt(rng, 15, 25);
  const accuracy: ChallengeTask = {
    id: `${date}_c2`,
    description: `Achieve ${target2}%+ accuracy in ${OP_NAMES[op2]} (${count2} answers)`,
    type: 'accuracy',
    target: target2,
    practiceConfig: { mode: 'count', targetCount: count2, operators: [op2], numberRange: [1, 30] },
  };

  // Task 3 — answer streak
  const target3 = pick(rng, [8, 10, 12, 15] as const);
  const streak: ChallengeTask = {
    id: `${date}_c3`,
    description: `Complete a ${target3}-answer streak in any mode`,
    type: 'streak',
    target: target3,
  };

  return { id: `daily_${date}`, date, tasks: [score, accuracy, streak], xpReward: DAILY_XP_REWARD };
}
