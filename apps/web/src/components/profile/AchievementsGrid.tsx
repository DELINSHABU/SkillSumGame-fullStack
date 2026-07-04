'use client';

import type { AchievementRow } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface AchievementsGridProps {
  achievements: AchievementRow[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <div className="flex flex-col gap-4">
      <p style={{ color: 'var(--text-secondary)' }}>
        {unlockedCount}/{achievements.length} unlocked
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {achievements.map((a, index) => {
          const unlocked = a.unlockedAt !== null;
          return (
            <div
              key={a.id}
              className="rounded-2xl p-4 text-center animate-fade-up"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: unlocked ? '2px solid var(--star-gold)' : '2px solid transparent',
                boxShadow: unlocked ? 'var(--glow-gold)' : 'var(--shadow-sm)',
                opacity: unlocked ? 1 : 0.5,
                filter: unlocked ? 'none' : 'grayscale(1)',
                animationDelay: `${Math.min(index * 0.03, 0.6)}s`,
              }}
            >
              <div className="text-3xl mb-1" style={{ filter: !unlocked && a.secret ? 'blur(4px)' : 'none' }}>
                {a.secret && !unlocked ? '❓' : a.icon}
              </div>
              <div className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>{a.name}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.description}</div>
              {unlocked && a.unlockedAt && (
                <div className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {formatDate(a.unlockedAt)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
