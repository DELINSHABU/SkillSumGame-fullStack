'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { QuestionAttempt } from '@skillsum/shared';
import { ChartSkeleton } from '@/components/practice/ChartSkeleton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { SessionSaveResult } from '@/lib/api';

// Lazy-load the recharts-backed chart so recharts stays out of the practice bundle.
const PaceChart = dynamic(() => import('@/components/practice/PaceChart').then((m) => m.PaceChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

interface PracticeResultsProps {
  result: SessionSaveResult;
  attempts: QuestionAttempt[];
  durationMs: number;
  onRetry: () => void;
  onReconfigure: () => void;
}

/** Correct answers per 10-second block. */
function buildBlocks(attempts: QuestionAttempt[]): Array<{ block: string; correct: number }> {
  const blocks: Array<{ block: string; correct: number }> = [];
  let elapsed = 0;
  let blockIndex = 0;
  let count = 0;
  for (const attempt of attempts) {
    elapsed += attempt.responseMs;
    while (elapsed > (blockIndex + 1) * 10000) {
      blocks.push({ block: `${blockIndex * 10}s`, correct: count });
      count = 0;
      blockIndex++;
    }
    if (attempt.isCorrect) count++;
  }
  blocks.push({ block: `${blockIndex * 10}s`, correct: count });
  return blocks;
}

export function PracticeResults({ result, attempts, onRetry, onReconfigure }: PracticeResultsProps) {
  const blocks = buildBlocks(attempts);

  return (
    <div className="flex flex-col gap-6 animate-fade-up max-w-md mx-auto py-8 text-center">
      <h1 className="text-h1">Practice Complete!</h1>

      {result.newPersonalBest && (
        <div
          className="rounded-2xl p-4 animate-scale-in font-bold"
          style={{ backgroundColor: 'var(--bg-card)', border: '2px solid var(--star-gold)', boxShadow: 'var(--glow-gold)', fontFamily: 'var(--font-display)' }}
        >
          🎉 New Personal Best!
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Correct', value: result.recomputed.correct, color: 'var(--correct)' },
          { label: 'Accuracy', value: `${Math.round(result.recomputed.accuracy)}%`, color: 'var(--text-primary)' },
          { label: 'Best Streak', value: result.recomputed.maxStreak, color: 'var(--streak)' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
            <div className="text-stat" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-label" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
        <div className="text-label mb-1" style={{ color: 'var(--text-tertiary)' }}>XP Earned</div>
        <div className="text-stat" style={{ color: 'var(--xp-gold)' }}>+{result.xpBreakdown.total} XP</div>
      </div>

      {blocks.length > 1 && <PaceChart blocks={blocks} />}

      <div className="flex flex-col gap-2">
        <PrimaryButton fullWidth onClick={onRetry}>🔄 Same Again</PrimaryButton>
        <PrimaryButton fullWidth variant="ghost" onClick={onReconfigure}>⚙️ Change Setup</PrimaryButton>
        <Link href="/">
          <PrimaryButton fullWidth variant="ghost">🏠 Home</PrimaryButton>
        </Link>
      </div>
    </div>
  );
}
