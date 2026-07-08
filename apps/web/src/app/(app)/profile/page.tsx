'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AchievementsGrid } from '@/components/profile/AchievementsGrid';
import { HistoryList } from '@/components/profile/HistoryList';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { StatsPanel } from '@/components/profile/StatsPanel';
import { ThemeToggle } from '@/components/profile/ThemeToggle';
import { api } from '@/lib/api';
import { invalidate, useResource } from '@/lib/cache';
import { cn } from '@/lib/utils';
import { GameIcon } from '@/components/ui/GameIcon';

type Tab = 'stats' | 'achievements' | 'history';

export default function ProfilePage() {
  const router = useRouter();
  const { data: profile } = useResource('profile', () => api.profile.get());
  const { data: achievements } = useResource('achievements', () => api.achievements.list());
  const { data: history } = useResource('sessions?limit=20', () => api.sessions.history({ limit: 20 }));
  const { data: mastery } = useResource('mastery', () => api.mastery.list());
  const [tab, setTab] = useState<Tab>('stats');

  if (!profile) return <ProfileSkeleton />;

  const xpIntoLevel = profile.xp - profile.xpForCurrentLevel;
  const xpForLevel = profile.xpForNextLevel - profile.xpForCurrentLevel;
  const levelPct = Math.min((xpIntoLevel / Math.max(xpForLevel, 1)) * 100, 100);

  const logout = async () => {
    await api.auth.logout();
    invalidate(''); // clear all cached account data for the next session
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Header */}
      <div className="rounded-3xl p-6 world-1-gradient" style={{ color: 'var(--text-on-pink)' }}>
        <div className="flex items-center gap-4">
          <span className="text-6xl">{profile.avatarEmoji}</span>
          <div className="flex-1">
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>
              {profile.username}
            </h1>
            <p className="text-sm opacity-90">
              Level {profile.accountLevel} · <GameIcon emoji="🔥" /> {profile.dailyStreak}-day streak
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs opacity-90 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
            <span>{profile.xp.toLocaleString()} XP</span>
            <span>{profile.xpForNextLevel.toLocaleString()} XP → L{profile.accountLevel + 1}</span>
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${levelPct}%`, backgroundColor: 'var(--xp-gold)' }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['stats', 'achievements', 'history'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn('flex-1 min-h-[48px] rounded-xl font-bold capitalize active:scale-95 transition-transform')}
            style={{
              fontFamily: 'var(--font-display)',
              backgroundColor: tab === t ? 'var(--pink-300)' : 'var(--bg-card)',
              color: tab === t ? 'var(--text-on-pink)' : 'var(--text-secondary)',
              boxShadow: tab === t ? 'var(--shadow-btn-primary)' : 'var(--shadow-sm)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'stats' && <StatsPanel profile={profile} mastery={mastery ?? []} />}
      {tab === 'achievements' && <AchievementsGrid achievements={achievements ?? []} />}
      {tab === 'history' && <HistoryList sessions={history ?? []} />}

      <ThemeToggle />

      <button
        type="button"
        onClick={() => void logout()}
        className="min-h-[48px] rounded-xl font-bold active:scale-95"
        style={{ color: 'var(--wrong)', backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
      >
        Log out
      </button>

      <p className="text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
        Version {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev'}
      </p>
    </div>
  );
}
