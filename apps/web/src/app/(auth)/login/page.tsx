'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';
import { api, ApiError } from '@/lib/api';
import { readLocalMe, writeLocalMe } from '@/lib/localStore';
import { drainQueue } from '@/lib/sync';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.auth.login({ email, password });
      // Ending any guest mode: replay offline games into this account.
      document.cookie = 'skillsum-guest=; path=/; max-age=0';
      await drainQueue();
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const playAsGuest = async () => {
    // Local-only mode: progress lives in IndexedDB; signing up later syncs it.
    document.cookie = `skillsum-guest=1; path=/; max-age=${60 * 60 * 24 * 365}`;
    if (!(await readLocalMe())) {
      await writeLocalMe({
        id: 'guest',
        email: '',
        username: 'Guest',
        avatarEmoji: '🧠',
        xp: 0,
        accountLevel: 1,
        dailyStreak: 0,
        dailyXpEarned: 0,
        dailyGoalMinutes: 10,
        onboardingComplete: true,
        mathLevel: 'beginner',
        theme: 'system',
      });
    }
    router.push('/');
    router.refresh();
  };

  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <div className="text-center">
        <div className="text-6xl mb-2">🧠</div>
        <h1 className="text-h1">SkillSum</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Ready to train?</p>
      </div>

      <div
        className="flex flex-col gap-4 rounded-2xl p-6"
        style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}
      >
        <TextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <TextField label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
        {error && (
          <p className="text-sm font-semibold" style={{ color: 'var(--wrong)' }} role="alert">
            {error}
          </p>
        )}
        <PrimaryButton onClick={submit} disabled={loading || !email || !password} fullWidth>
          {loading ? 'Logging in…' : '<GameIcon emoji="🚀" /> Log In'}
        </PrimaryButton>
      </div>

      <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        New here?{' '}
        <Link href="/signup" className="font-bold" style={{ color: 'var(--pink-400)' }}>
          Create an account
        </Link>
      </p>

      <button
        type="button"
        onClick={() => void playAsGuest()}
        className="min-h-[48px] rounded-xl font-bold active:scale-95"
        style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
      >
        Play as guest (works offline)
      </button>
    </div>
  );
}
