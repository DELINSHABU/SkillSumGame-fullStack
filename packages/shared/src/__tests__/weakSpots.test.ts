import { describe, expect, it } from 'vitest';
import { detectWeakSpots } from '../weakSpots';
import type { QuestionAttempt } from '../types';

const attempt = (skill: QuestionAttempt['skill'], isCorrect: boolean, responseMs: number): QuestionAttempt => ({
  question: '1 + 1',
  correctAnswer: 2,
  userAnswer: isCorrect ? 2 : 3,
  isCorrect,
  responseMs,
  skill,
  operator: '+',
});

describe('detectWeakSpots', () => {
  it('flags low accuracy', () => {
    const attempts = [
      attempt('addNine', false, 2000),
      attempt('addNine', false, 2000),
      attempt('addNine', true, 2000),
    ];
    const [report] = detectWeakSpots(attempts);
    expect(report?.skill).toBe('addNine');
    expect(report?.reason).toBe('low_accuracy');
  });

  it('flags slow speed', () => {
    const attempts = Array.from({ length: 4 }, () => attempt('doubles', true, 5000));
    const [report] = detectWeakSpots(attempts);
    expect(report?.reason).toBe('slow_speed');
  });

  it('ignores skills with under 3 attempts', () => {
    const attempts = [attempt('makeTen', false, 9000), attempt('makeTen', false, 9000)];
    expect(detectWeakSpots(attempts)).toHaveLength(0);
  });

  it('no false positives on strong performance', () => {
    const attempts = Array.from({ length: 10 }, () => attempt('addTen', true, 1500));
    expect(detectWeakSpots(attempts)).toHaveLength(0);
  });
});
