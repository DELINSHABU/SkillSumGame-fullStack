'use client';

import type { Level } from '@skillsum/shared';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

interface PreLessonProps {
  level: Level;
  canSkip: boolean;
  onReady: () => void;
}

export function PreLesson({ level, canSkip, onReady }: PreLessonProps) {
  return (
    <div className="flex flex-col gap-6 animate-fade-up max-w-md mx-auto py-8">
      <div className="text-label" style={{ color: 'var(--text-tertiary)' }}>
        {level.worldName} · Level {((level.id - 1) % 50) + 1}
      </div>
      <h1 className="text-h1">{level.title}</h1>

      <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '2px solid var(--pink-200)' }}>
        <div className="text-label mb-2" style={{ color: 'var(--pink-500)' }}>💡 Tip</div>
        <p className="text-body">{level.tip}</p>
      </div>

      {level.tipDiagram && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
          <div className="text-h2 mb-3 text-center">{level.tipDiagram.example}</div>
          <ol className="flex flex-col gap-2">
            {level.tipDiagram.solution.map((step, i) => (
              <li
                key={i}
                className="rounded-xl px-4 py-2 animate-fade-up font-semibold"
                style={{ backgroundColor: 'var(--pink-50)', animationDelay: `${i * 0.15}s` }}
              >
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <PrimaryButton fullWidth onClick={onReady}>
          I&apos;m Ready! 💪
        </PrimaryButton>
        {canSkip && (
          <button
            type="button"
            onClick={onReady}
            className="min-h-[48px] font-bold active:scale-95"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Skip tip
          </button>
        )}
      </div>
    </div>
  );
}
