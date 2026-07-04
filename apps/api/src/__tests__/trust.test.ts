import { describe, expect, it } from 'vitest';
import type { QuestionAttempt } from '@skillsum/shared';
import { ImplausibleSessionError, recomputeSession } from '../lib/trust';

const attempt = (isCorrect: boolean, over: Partial<QuestionAttempt> = {}): QuestionAttempt => ({
  question: '2 + 2',
  correctAnswer: 4,
  userAnswer: isCorrect ? 4 : 5,
  isCorrect,
  responseMs: 2000,
  skill: 'random',
  operator: '+',
  ...over,
});

describe('recomputeSession', () => {
  it('recomputes correct/wrong/accuracy/maxStreak from raw attempts', () => {
    const attempts = [true, true, false, true, true, true].map((v) => attempt(v));
    const result = recomputeSession(attempts, 20000);
    expect(result).toEqual({ correct: 5, wrong: 1, accuracy: 83.33, maxStreak: 3 });
  });

  it('rejects isCorrect flag inconsistent with answers', () => {
    const forged = attempt(false, { isCorrect: true }); // says correct, answer wrong
    expect(() => recomputeSession([forged], 5000)).toThrow(ImplausibleSessionError);
  });

  it('rejects impossibly fast sessions', () => {
    const attempts = Array.from({ length: 50 }, () => attempt(true));
    expect(() => recomputeSession(attempts, 1000)).toThrow(ImplausibleSessionError); // 20ms/answer
  });

  it('null userAnswer counts as wrong', () => {
    const timeout = attempt(false, { userAnswer: null });
    expect(recomputeSession([timeout], 5000).wrong).toBe(1);
  });

  it('empty session is valid with zeros', () => {
    expect(recomputeSession([], 0)).toEqual({ correct: 0, wrong: 0, accuracy: 0, maxStreak: 0 });
  });
});
