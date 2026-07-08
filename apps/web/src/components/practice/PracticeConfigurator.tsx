'use client';

import type { OperationType, PracticeConfig, PracticeMode } from '@skillsum/shared';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { cn } from '@/lib/utils';
import { GameIcon } from '@/components/ui/GameIcon';

interface PracticeConfiguratorProps {
  config: PracticeConfig;
  onChange: (config: PracticeConfig) => void;
  personalBest: number | null;
  onStart: () => void;
}

const MODES: Array<{ id: PracticeMode; label: string; icon: string }> = [
  { id: 'time', label: 'Time Attack', icon: '⏱️' },
  { id: 'count', label: 'Score Target', icon: '🎯' },
  { id: 'zen', label: 'Zen', icon: '🧘' },
];
const TIMES = [15, 30, 60, 120];
const TARGETS = [10, 25, 50, 100];
const OPERATORS: OperationType[] = ['+', '-', '×', '÷'];
const RANGES: Array<{ label: string; range: [number, number] }> = [
  { label: 'Easy 1-15', range: [1, 15] },
  { label: 'Medium 1-30', range: [1, 30] },
  { label: 'Hard 1-50', range: [1, 50] },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('min-h-[48px] px-4 rounded-xl font-bold active:scale-95 transition-transform')}
      style={{
        fontFamily: 'var(--font-display)',
        backgroundColor: active ? 'var(--pink-300)' : 'var(--bg-card)',
        color: active ? 'var(--text-on-pink)' : 'var(--text-secondary)',
        boxShadow: active ? 'var(--shadow-btn-primary)' : 'var(--shadow-sm)',
      }}
    >
      {children}
    </button>
  );
}

export function PracticeConfigurator({ config, onChange, personalBest, onStart }: PracticeConfiguratorProps) {
  const toggleOperator = (op: OperationType) => {
    const has = config.operators.includes(op);
    const operators = has ? config.operators.filter((o) => o !== op) : [...config.operators, op];
    if (operators.length === 0) return; // always at least one
    onChange({ ...config, operators });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <section>
        <div className="text-label mb-2" style={{ color: 'var(--text-secondary)' }}>Mode</div>
        <div className="flex gap-2 flex-wrap">
          {MODES.map((m) => (
            <Chip key={m.id} active={config.mode === m.id} onClick={() => onChange({ ...config, mode: m.id })}>
              <GameIcon emoji={m.icon} /> {m.label}
            </Chip>
          ))}
        </div>
      </section>

      {config.mode === 'time' && (
        <section>
          <div className="text-label mb-2" style={{ color: 'var(--text-secondary)' }}>Time</div>
          <div className="flex gap-2 flex-wrap">
            {TIMES.map((t) => (
              <Chip key={t} active={config.timeLimit === t} onClick={() => onChange({ ...config, timeLimit: t })}>
                {t}s
              </Chip>
            ))}
          </div>
        </section>
      )}

      {config.mode === 'count' && (
        <section>
          <div className="text-label mb-2" style={{ color: 'var(--text-secondary)' }}>Target</div>
          <div className="flex gap-2 flex-wrap">
            {TARGETS.map((t) => (
              <Chip key={t} active={config.targetCount === t} onClick={() => onChange({ ...config, targetCount: t })}>
                {t}
              </Chip>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="text-label mb-2" style={{ color: 'var(--text-secondary)' }}>Operations</div>
        <div className="flex gap-2 flex-wrap">
          {OPERATORS.map((op) => (
            <Chip key={op} active={config.operators.includes(op)} onClick={() => toggleOperator(op)}>
              {op}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <div className="text-label mb-2" style={{ color: 'var(--text-secondary)' }}>Difficulty</div>
        <div className="flex gap-2 flex-wrap">
          {RANGES.map((r) => (
            <Chip
              key={r.label}
              active={config.numberRange[0] === r.range[0] && config.numberRange[1] === r.range[1]}
              onClick={() => onChange({ ...config, numberRange: r.range })}
            >
              {r.label}
            </Chip>
          ))}
        </div>
      </section>

      {personalBest !== null && (
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}
        >
          <span className="text-2xl">🏅</span>
          <div>
            <div className="text-label" style={{ color: 'var(--text-tertiary)' }}>Personal best (this setup)</div>
            <div className="text-stat" style={{ color: 'var(--xp-gold)' }}>{personalBest} correct</div>
          </div>
        </div>
      )}

      <PrimaryButton fullWidth onClick={onStart}><GameIcon emoji="🚀" /> Start Practice</PrimaryButton>
    </div>
  );
}
