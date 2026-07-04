'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';
import { api, ApiError } from '@/lib/api';

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
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
      setLoading(false);
    }
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
          {loading ? 'Logging in…' : '🚀 Log In'}
        </PrimaryButton>
      </div>

      <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        New here?{' '}
        <Link href="/signup" className="font-bold" style={{ color: 'var(--pink-400)' }}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
