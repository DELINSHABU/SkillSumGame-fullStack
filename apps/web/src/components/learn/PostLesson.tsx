'use client';

import Link from 'next/link';
import { getNextLevel, type Level } from '@skillsum/shared';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { StarRow } from '@/components/shared/StarRow';
import type { SessionSaveResult } from '@/lib/api';

interface PostLessonProps {
  level: Level;
  result: SessionSaveResult;
  onRetry: () => void;
}

export function PostLesson({ level, result, onRetry }: PostLessonProps) {
  const next = getNextLevel(level.id);
  const stars = result.starsEarned ?? 0;
  const passed = stars > 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-up max-w-md mx-auto py-8 text-center">
      <h1 className="text-h1">{passed ? 'Level Complete! 🎉' : 'So Close! 💪'}</h1>

      <StarRow stars={stars} size="lg" animated />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Correct', value: result.recomputed.correct, color: 'var(--correct)' },
          { label: 'Wrong', value: result.recomputed.wrong, color: 'var(--wrong)' },
          { label: 'Accuracy', value: `${Math.round(result.recomputed.accuracy)}%`, color: 'var(--text-primary)' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
            <div className="text-stat" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-label" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
        <div className="text-label mb-1" style={{ color: 'var(--text-tertiary)' }}>XP Earned</div>
        <div className="text-stat animate-spring-pop" style={{ color: 'var(--xp-gold)' }}>
          +{result.xpBreakdown.total} XP
        </div>
        {result.profile.leveledUp && (
          <div className="mt-2 font-bold animate-level-up" style={{ color: 'var(--pink-400)' }}>
            🎊 Account Level {result.profile.accountLevel}!
          </div>
        )}
      </div>

      {result.newAchievements.length > 0 && (
        <div className="rounded-2xl p-4 animate-scale-in" style={{ backgroundColor: 'var(--bg-card)', border: '2px solid var(--star-gold)', boxShadow: 'var(--glow-gold)' }}>
          <div className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            🏆 {result.newAchievements.length} new achievement{result.newAchievements.length > 1 ? 's' : ''}!
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Check your profile to see them.</div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {passed && next && (
          <Link href={`/play/${next.id}`}>
            <PrimaryButton fullWidth>Next Level →</PrimaryButton>
          </Link>
        )}
        <PrimaryButton fullWidth variant={passed ? 'ghost' : 'primary'} onClick={onRetry}>
          🔄 Retry Level
        </PrimaryButton>
        <Link href={`/learn/${level.worldId}`}>
          <PrimaryButton fullWidth variant="ghost">🗺️ Back to Map</PrimaryButton>
        </Link>
      </div>
    </div>
  );
}
