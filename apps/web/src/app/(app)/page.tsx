'use client';

import Link from 'next/link';
import { ALL_LEVELS, getLevelById } from '@skillsum/shared';
import { HomeSkeleton } from '@/components/shared/HomeSkeleton';
import { api } from '@/lib/api';
import { useResource } from '@/lib/cache';
import { GameIcon } from '@/components/ui/GameIcon';

export default function HomePage() {
  const { data: me } = useResource('auth/me', () => api.auth.me());
  const { data: mastery } = useResource('mastery', () => api.mastery.list());
  const { data: daily } = useResource('daily', () => api.daily.get());

  if (!me || !daily) return <HomeSkeleton />;

  const masteryRows = mastery ?? [];
  // Continue point: first level not yet passed.
  const passed = new Set(masteryRows.filter((m) => m.stars > 0).map((m) => m.levelId));
  const nextLevel = ALL_LEVELS.find((l) => !passed.has(l.id)) ?? getLevelById(400);
  const dailyDone = daily.tasks.filter((t) => daily.taskState[t.id]?.completed).length;

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Hi, {me.username}! {me.avatarEmoji}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Level {me.accountLevel} · {me.xp.toLocaleString()} XP</p>
        </div>
        <div
          className="flex items-center gap-1 rounded-full px-4 py-2 font-bold"
          style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', color: 'var(--streak)' }}
        >
          <span className="animate-flicker"><GameIcon emoji="🔥" /></span> {me.dailyStreak}
        </div>
      </header>

      {/* Continue learning */}
      {nextLevel && (
        <Link
          href={`/play/${nextLevel.id}`}
          className="block rounded-2xl p-4 active:scale-95 transition-transform"
          style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🗺️</span>
            <div>
              <div className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>Continue Learning</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {nextLevel.worldName} · Level {nextLevel.id}
              </div>
            </div>
          </div>
          <div className="text-h2">{nextLevel.title}</div>
          <div
            className="mt-3 inline-flex items-center rounded-xl px-6 min-h-[48px] font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              backgroundColor: 'var(--pink-300)',
              color: 'var(--text-on-pink)',
              boxShadow: 'var(--shadow-btn-primary)',
            }}
          >
            Play →
          </div>
        </Link>
      )}

      {/* Daily challenge card */}
      <Link
        href="/daily"
        className="block rounded-2xl p-4 active:scale-95 transition-transform"
        style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <div className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>Daily Challenges</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {dailyDone}/3 complete · {daily.xpRewarded ? 'Reward claimed <GameIcon emoji="✅" />' : `${daily.xpReward.toLocaleString()} XP reward`}
              </div>
            </div>
          </div>
          <div className="text-stat" style={{ color: 'var(--pink-400)' }}>{dailyDone}/3</div>
        </div>
        <div className="h-2 rounded-full mt-3" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(dailyDone / 3) * 100}%`, backgroundColor: 'var(--xp-gold)' }}
          />
        </div>
      </Link>

      {/* Quick practice */}
      <Link
        href="/practice"
        className="block rounded-2xl p-4 active:scale-95 transition-transform"
        style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <div className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>Quick Practice</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Time attack, score target, or zen mode
            </div>
          </div>
        </div>
      </Link>

      {/* Progress summary */}
      <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
        <div className="font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Your Journey</div>
        <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span>{passed.size}/400 levels</span>
          <span>⭐ {masteryRows.reduce((sum, m) => sum + m.stars, 0)}</span>
        </div>
        <div className="h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(passed.size / 400) * 100}%`, backgroundColor: 'var(--pink-300)' }}
          />
        </div>
      </div>
    </div>
  );
}
