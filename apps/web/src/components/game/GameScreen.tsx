'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { generateQuestion, type GenerationParams, type Question, type QuestionAttempt } from '@skillsum/shared';
import { Numpad } from './Numpad';
import { StarProgressBar } from './StarProgressBar';

export interface GameEndResult {
  attempts: QuestionAttempt[];
  durationMs: number;
}

interface GameScreenProps {
  title: string;
  generationParams: GenerationParams;
  /** Seconds. Session ends when it reaches 0. */
  timeLimit?: number;
  /** Session ends when `correct` reaches this (learn target / practice count mode). */
  targetCorrect?: number;
  /** Star thresholds — shows the in-game star bar (learn mode only). */
  starThresholds?: { star1: number; star2: number; star3: number };
  /** Zen mode: no end condition, shows an End button. */
  showEndButton?: boolean;
  onEnd: (result: GameEndResult) => void;
}

type Feedback = 'idle' | 'correct' | 'wrong';

export function GameScreen({
  title,
  generationParams,
  timeLimit,
  targetCorrect,
  starThresholds,
  showEndButton,
  onEnd,
}: GameScreenProps) {
  const [question, setQuestion] = useState<Question>(() => generateQuestion(generationParams));
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [revealAnswer, setRevealAnswer] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(timeLimit ?? 0);

  const attemptsRef = useRef<QuestionAttempt[]>([]);
  const startRef = useRef(Date.now());
  const questionShownRef = useRef(Date.now());
  const endedRef = useRef(false);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    onEnd({ attempts: attemptsRef.current, durationMs: Date.now() - startRef.current });
  }, [onEnd]);

  // Countdown timer.
  useEffect(() => {
    if (!timeLimit) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLimit, finish]);

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion(generationParams));
    setInput('');
    setRevealAnswer(null);
    setFeedback('idle');
    questionShownRef.current = Date.now();
  }, [generationParams]);

  const submit = useCallback(() => {
    if (input === '' || feedback !== 'idle' || endedRef.current) return;
    const userAnswer = Number(input);
    const isCorrect = userAnswer === question.answer;

    attemptsRef.current.push({
      question: question.question,
      correctAnswer: question.answer,
      userAnswer,
      isCorrect,
      responseMs: Date.now() - questionShownRef.current,
      skill: question.skill,
      operator: question.operator,
    });

    if (isCorrect) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      setStreak((s) => s + 1);
      setFeedback('correct');
      if (targetCorrect !== undefined && newCorrect >= targetCorrect) {
        setTimeout(finish, 350);
        return;
      }
      setTimeout(nextQuestion, 350);
    } else {
      setWrong((w) => w + 1);
      setStreak(0);
      setFeedback('wrong');
      setRevealAnswer(question.answer);
      setTimeout(nextQuestion, 1100);
    }
  }, [input, feedback, question, correct, targetCorrect, finish, nextQuestion]);

  // Physical keyboard support.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) setInput((v) => (v.length < 6 ? v + e.key : v));
      else if (e.key === 'Backspace') setInput((v) => v.slice(0, -1));
      else if (e.key === 'Enter') submit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [submit]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-12">
        <span className="text-sm font-bold truncate max-w-[40%]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <div className="flex items-center gap-4">
          {streak >= 3 && (
            <span className="font-bold animate-flicker" style={{ color: 'var(--streak)' }}>
              🔥{streak}
            </span>
          )}
          <span className="text-stat" style={{ color: 'var(--text-primary)' }}>
            {correct}
            {targetCorrect !== undefined && <span style={{ color: 'var(--text-tertiary)' }}>/{targetCorrect}</span>}
          </span>
          {timeLimit !== undefined && (
            <span
              className="text-stat"
              style={{ color: secondsLeft <= 10 ? 'var(--wrong)' : 'var(--text-primary)' }}
            >
              {secondsLeft}s
            </span>
          )}
          {showEndButton && (
            <button
              type="button"
              onClick={finish}
              className="rounded-lg px-3 py-1 text-sm font-bold active:scale-95"
              style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
            >
              End
            </button>
          )}
        </div>
      </div>

      {/* Star bar (learn mode) */}
      {starThresholds && (
        <StarProgressBar score={correct} star1={starThresholds.star1} star2={starThresholds.star2} star3={starThresholds.star3} />
      )}

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div
          className={feedback === 'wrong' ? 'animate-shake' : feedback === 'correct' ? 'animate-spring-pop' : ''}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 10vw, 5rem)',
            fontWeight: 900,
            color: feedback === 'correct' ? 'var(--correct)' : feedback === 'wrong' ? 'var(--wrong)' : 'var(--text-primary)',
          }}
        >
          {question.question}
        </div>
        {revealAnswer !== null && (
          <div className="text-h2 animate-fade-up" style={{ color: 'var(--correct)' }}>
            Answer: {revealAnswer}
          </div>
        )}
      </div>

      {/* Answer display */}
      <div
        className="h-[60px] flex items-center justify-center text-stat"
        style={{ color: input ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
      >
        {input || '···'}
      </div>

      {/* Numpad */}
      <Numpad
        onDigit={(d) => setInput((v) => (v.length < 6 ? v + d : v))}
        onBackspace={() => setInput((v) => v.slice(0, -1))}
        onSubmit={submit}
        submitDisabled={input === '' || feedback !== 'idle'}
      />
    </div>
  );
}
