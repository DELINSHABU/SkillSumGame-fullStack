import type { QuestionAttempt } from './types';

// Session aggregate recompute from raw attempts. The API uses this as its
// trust boundary (client totals are never trusted); the web app uses the same
// function to show identical optimistic results while offline.

export interface RecomputedSession {
  correct: number;
  wrong: number;
  accuracy: number;
  maxStreak: number;
}

export class ImplausibleSessionError extends Error {}

const MIN_AVG_RESPONSE_MS = 250; // faster than any human across a session
const MAX_ATTEMPTS_PER_SESSION = 500;

export function recomputeSession(attempts: QuestionAttempt[], durationMs: number): RecomputedSession {
  if (attempts.length > MAX_ATTEMPTS_PER_SESSION) {
    throw new ImplausibleSessionError('Too many attempts');
  }

  let correct = 0;
  let wrong = 0;
  let streak = 0;
  let maxStreak = 0;

  for (const attempt of attempts) {
    // isCorrect must be consistent with the recorded answers.
    const actuallyCorrect = attempt.userAnswer !== null && attempt.userAnswer === attempt.correctAnswer;
    if (attempt.isCorrect !== actuallyCorrect) {
      throw new ImplausibleSessionError('isCorrect inconsistent with answers');
    }
    if (actuallyCorrect) {
      correct++;
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      wrong++;
      streak = 0;
    }
  }

  const total = correct + wrong;
  if (total >= 5 && durationMs / total < MIN_AVG_RESPONSE_MS) {
    throw new ImplausibleSessionError('Answer rate implausibly fast');
  }

  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 10000) / 100;
  return { correct, wrong, accuracy, maxStreak };
}
