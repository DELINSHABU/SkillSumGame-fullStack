'use client';

import { getLevelById } from '@skillsum/shared';
import type { GameSessionRow } from '@/lib/api';
import { formatDate, formatDuration } from '@/lib/utils';

interface HistoryListProps {
  sessions: GameSessionRow[];
}

const MODE_ICONS = { learn: '🗺️', practice: '🎯', daily: '📅' };

export function HistoryList({ sessions }: HistoryListProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
        No sessions yet — go play something!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {sessions.map((s) => {
        const level = s.levelId ? getLevelById(s.levelId) : undefined;
        return (
          <div
            key={s.id}
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{MODE_ICONS[s.mode]}</span>
              <div>
                <div className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                  {level ? level.title : s.mode === 'practice' ? 'Practice' : 'Daily task'}
                  {s.starsEarned !== null && s.starsEarned > 0 && ` ${'⭐'.repeat(s.starsEarned)}`}
                  {s.isPersonalBest && ' 🏅'}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {formatDate(s.startedAt)} · {formatDuration(s.durationMs)} · {Math.round(Number(s.accuracy))}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-stat" style={{ fontSize: '1rem', color: 'var(--correct)' }}>{s.correct}✓</div>
              <div className="text-xs" style={{ color: 'var(--xp-gold)' }}>+{s.xpEarned} XP</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
