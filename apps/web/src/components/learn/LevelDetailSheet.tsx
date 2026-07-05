'use client';

import { useRouter } from 'next/navigation';
import type { Level } from '@skillsum/shared';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { StarRow } from '@/components/shared/StarRow';
import type { MasteryRow } from '@/lib/api';
import { GameIcon } from '@/components/ui/GameIcon';

interface LevelDetailSheetProps {
  level: Level;
  mastery: MasteryRow | undefined;
  onClose: () => void;
}

export function LevelDetailSheet({ level, mastery, onClose }: LevelDetailSheetProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 w-full"
        style={{ backgroundColor: 'var(--scrim)' }}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="absolute bottom-0 inset-x-0 rounded-t-3xl p-6 animate-slide-up max-h-[70vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <div className="mx-auto mb-4 rounded-full" style={{ width: 32, height: 4, backgroundColor: 'var(--text-tertiary)' }} />

        <div className="text-label mb-1" style={{ color: 'var(--text-tertiary)' }}>
          {level.worldName} · Level {((level.id - 1) % 50) + 1}
          {level.type === 'boss' && <>&nbsp;·&nbsp;<GameIcon emoji="👑" /> BOSS</>}
        </div>
        <h2 className="text-h1 mb-2">{level.title}</h2>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{level.description}</p>

        <div className="rounded-xl p-4 mb-4 flex flex-col gap-2" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Stars</span>
            <span className="font-bold">
              ⭐ {level.star1Score} · ⭐⭐ {level.star2Score} · ⭐⭐⭐ {level.star3Score}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Timer</span>
            <span className="font-bold">{level.timeLimit ? `${level.timeLimit}s` : 'No timer'}</span>
          </div>
          {mastery && mastery.attempts > 0 && (
            <div className="flex justify-between text-sm items-center">
              <span style={{ color: 'var(--text-secondary)' }}>Your best</span>
              <span className="flex items-center gap-2 font-bold">
                {mastery.bestScore} correct <StarRow stars={mastery.stars} size="sm" />
              </span>
            </div>
          )}
        </div>

        <PrimaryButton fullWidth onClick={() => router.push(`/play/${level.id}`)}>
          <GameIcon emoji="🚀" /> Start Level
        </PrimaryButton>
      </div>
    </div>
  );
}
