'use client';

import type { Level, StarCount } from '@skillsum/shared';
import { cn } from '@/lib/utils';

export type LevelNodeState = 'locked' | 'current' | 'unlocked' | 'bronze' | 'silver' | 'gold';

interface LevelNodeProps {
  level: Level;
  stars: StarCount;
  state: LevelNodeState;
  onSelect: (level: Level) => void;
}

export function LevelNode({ level, stars, state, onSelect }: LevelNodeProps) {
  const isBoss = level.type === 'boss';
  const local = ((level.id - 1) % 50) + 1;

  const background =
    state === 'gold'
      ? 'var(--node-gold-gradient)'
      : state === 'silver' || state === 'bronze'
        ? 'var(--node-played-gradient)'
        : state === 'current'
          ? 'var(--pink-300)'
          : state === 'unlocked'
            ? 'var(--node-unlocked)'
            : 'var(--node-locked)';

  return (
    <div className="flex flex-col items-center gap-1 w-20">
      {/* Stars above bubble */}
      <div className="h-4 text-xs" aria-hidden>
        {stars > 0 && '⭐'.repeat(stars)}
      </div>
      <button
        type="button"
        disabled={state === 'locked'}
        onClick={() => onSelect(level)}
        aria-label={`Level ${local}: ${level.title}${state === 'locked' ? ' (locked)' : ''}`}
        className={cn(
          'rounded-full flex items-center justify-center font-bold active:scale-95 transition-transform',
          state === 'current' && 'animate-pulse-glow',
          state === 'gold' && 'animate-star-shimmer',
          state === 'locked' && 'opacity-50 cursor-not-allowed'
        )}
        style={{
          width: isBoss ? 72 : 56,
          height: isBoss ? 72 : 56,
          background,
          border: isBoss ? '3px solid var(--star-gold)' : 'none',
          boxShadow: state === 'locked' ? 'none' : 'var(--shadow-md)',
          color: state === 'unlocked' || state === 'locked' ? 'var(--text-secondary)' : 'var(--text-on-pink)',
          fontFamily: 'var(--font-display)',
          fontSize: isBoss ? '1.3rem' : '1.1rem',
        }}
      >
        {state === 'locked' ? '🔒' : isBoss ? '👑' : local}
      </button>
      <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--text-tertiary)' }}>
        {level.title.length > 22 ? `${level.title.slice(0, 20)}…` : level.title}
      </span>
    </div>
  );
}
