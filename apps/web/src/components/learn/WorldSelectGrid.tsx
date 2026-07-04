'use client';

import Link from 'next/link';
import { getLevelsByWorld, WORLDS_META } from '@skillsum/shared';
import type { MasteryRow } from '@/lib/api';
import { cn } from '@/lib/utils';

interface WorldSelectGridProps {
  mastery: MasteryRow[];
}

export function WorldSelectGrid({ mastery }: WorldSelectGridProps) {
  const starsByLevel = new Map(mastery.map((m) => [m.levelId, m.stars]));

  // World N unlocks when the previous world's boss (level (N-1)*50) is passed.
  const isWorldUnlocked = (worldId: number) =>
    worldId === 1 || (starsByLevel.get((worldId - 1) * 50) ?? 0) > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {WORLDS_META.map((world, index) => {
        const levels = getLevelsByWorld(world.id);
        const done = levels.filter((l) => (starsByLevel.get(l.id) ?? 0) > 0).length;
        const unlocked = isWorldUnlocked(world.id);
        const card = (
          <div
            className={cn(
              'relative w-full rounded-3xl overflow-hidden transition-transform animate-fade-up',
              unlocked && 'cursor-pointer active:scale-95',
              `world-${world.id}-gradient`
            )}
            style={{ animationDelay: `${index * 0.07}s` }}
          >
            <div className="p-5" style={{ color: 'var(--text-on-pink)' }}>
              <div className="text-4xl mb-1">{world.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>
                World {world.id}
              </div>
              <div className="text-sm opacity-80">{world.name}</div>
            </div>
            <div className="px-5 py-3" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                <span>{done}/50 levels</span>
                <span>⭐ {levels.reduce((sum, l) => sum + (starsByLevel.get(l.id) ?? 0), 0)}</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(done / 50) * 100}%`, backgroundColor: `var(${world.colorVar})` }}
                />
              </div>
            </div>
            {!unlocked && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <span className="text-4xl" role="img" aria-label="Locked">🔒</span>
              </div>
            )}
          </div>
        );

        return unlocked ? (
          <Link key={world.id} href={`/learn/${world.id}`}>{card}</Link>
        ) : (
          <div key={world.id}>{card}</div>
        );
      })}
    </div>
  );
}
