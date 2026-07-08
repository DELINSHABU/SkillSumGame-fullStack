'use client';

import { THEME_LIST } from '@skillsum/shared';
import type { Theme, ThemeMeta } from '@skillsum/shared';
import { useTheme } from '@/components/providers/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
      <p className="text-label mb-3" style={{ color: 'var(--text-secondary)' }}>
        Appearance
      </p>

      <button
        type="button"
        onClick={() => setTheme('system')}
        aria-pressed={theme === 'system'}
        className="mb-3 w-full min-h-[44px] rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        style={{
          fontFamily: 'var(--font-display)',
          backgroundColor: theme === 'system' ? 'var(--pink-300)' : 'var(--bg-surface)',
          color: theme === 'system' ? 'var(--text-on-pink)' : 'var(--text-secondary)',
          boxShadow: theme === 'system' ? 'var(--shadow-btn-primary)' : 'var(--shadow-sm)',
        }}
      >
        <span aria-hidden>💻</span>
        <span className="text-sm">System</span>
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {THEME_LIST.map((meta) => (
          <SwatchCard key={meta.id} meta={meta} active={theme === meta.id} onPick={setTheme} />
        ))}
      </div>
    </div>
  );
}

function SwatchCard({
  meta,
  active,
  onPick,
}: {
  meta: ThemeMeta;
  active: boolean;
  onPick: (mode: Theme) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(meta.id)}
      aria-pressed={active}
      className="min-h-[64px] rounded-xl p-2 flex flex-col items-stretch justify-center gap-1.5 active:scale-95 transition-transform"
      style={{
        backgroundColor: active ? 'var(--pink-300)' : 'var(--bg-surface)',
        boxShadow: active ? 'var(--shadow-btn-primary)' : 'var(--shadow-sm)',
      }}
    >
      <span
        className="h-5 w-full rounded-md flex items-center justify-center"
        style={{ backgroundColor: meta.swatch.bg }}
        aria-hidden
      >
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: meta.swatch.accent }}
        />
      </span>
      <span
        className="text-xs font-semibold text-center truncate"
        style={{
          fontFamily: 'var(--font-display)',
          color: active ? 'var(--text-on-pink)' : 'var(--text-secondary)',
        }}
      >
        {meta.label}
      </span>
    </button>
  );
}
