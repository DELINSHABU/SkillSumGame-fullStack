'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { AchievementsGrid } from '@/components/profile/AchievementsGrid';
import { HistoryList } from '@/components/profile/HistoryList';
import { StatsPanel } from '@/components/profile/StatsPanel';
import { api, type AchievementRow, type FullProfile, type GameSessionRow, type MasteryRow } from '@/lib/api';
import { cn } from '@/lib/utils';

type Tab = 'stats' | 'achievements' | 'history';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [achievements, setAchievements] = useState<AchievementRow[]>([]);
  const [history, setHistory] = useState<GameSessionRow[]>([]);
  const [mastery, setMastery] = useState<MasteryRow[]>([]);
  const [tab, setTab] = useState<Tab>('stats');

  useEffect(() => {
    void Promise.all([
      api.profile.get(),
      api.achievements.list(),
      api.sessions.history({ limit: 20 }),
      api.mastery.list(),
    ]).then(([p, a, h, m]) => {
      setProfile(p);
      setAchievements(a);
      setHistory(h);
      setMastery(m);
    });
  }, []);

  if (!profile) return <LoadingScreen />;

  const xpIntoLevel = profile.xp - profile.xpForCurrentLevel;
  const xpForLevel = profile.xpForNextLevel - profile.xpForCurrentLevel;
  const levelPct = Math.min((xpIntoLevel / Math.max(xpForLevel, 1)) * 100, 100);

  const logout = async () => {
    await api.auth.logout();
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
              Level {profile.accountLevel} · 🔥 {profile.dailyStreak}-day streak
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

      {tab === 'stats' && <StatsPanel profile={profile} mastery={mastery} />}
      {tab === 'achievements' && <AchievementsGrid achievements={achievements} />}
      {tab === 'history' && <HistoryList sessions={history} />}

      <button
        type="button"
        onClick={() => void logout()}
        className="min-h-[48px] rounded-xl font-bold active:scale-95"
        style={{ color: 'var(--wrong)', backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
      >
        Log out
      </button>
    </div>
  );
}
