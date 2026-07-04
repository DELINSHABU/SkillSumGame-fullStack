'use client';

import { getLevelsByWorld, WORLDS_META } from '@skillsum/shared';
import type { FullProfile, MasteryRow } from '@/lib/api';
import { formatDuration } from '@/lib/utils';

interface StatsPanelProps {
  profile: FullProfile;
  mastery: MasteryRow[];
}

export function StatsPanel({ profile, mastery }: StatsPanelProps) {
  const { stats } = profile;
  const total = stats.totalCorrect + stats.totalWrong;
  const accuracy = total > 0 ? Math.round((stats.totalCorrect / total) * 100) : 0;
  const passedByWorld = new Map<number, number>();
  for (const m of mastery) {
    if (m.stars > 0) {
      const wid = Math.ceil(m.levelId / 50);
      passedByWorld.set(wid, (passedByWorld.get(wid) ?? 0) + 1);
    }
  }

  const tiles = [
    { label: 'Questions', value: total.toLocaleString() },
    { label: 'Accuracy', value: `${accuracy}%` },
    { label: 'Best Streak', value: stats.bestStreak },
    { label: 'Sessions', value: stats.totalSessions },
    { label: 'Time Played', value: formatDuration(Number(stats.totalTimeMs)) },
    { label: 'Total Stars', value: `⭐ ${stats.totalStars}` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
            <div className="text-stat">{tile.value}</div>
            <div className="text-label" style={{ color: 'var(--text-tertiary)' }}>{tile.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
        <div className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>World Completion</div>
        {WORLDS_META.map((world) => {
          const done = passedByWorld.get(world.id) ?? 0;
          const count = getLevelsByWorld(world.id).length;
          return (
            <div key={world.id}>
              <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                <span>{world.icon} {world.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{done}/{count}</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(done / count) * 100}%`, backgroundColor: `var(${world.colorVar})` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
