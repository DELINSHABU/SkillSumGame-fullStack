'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';
import { api, ApiError } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await api.auth.signup({ email, username, password });
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
        <h1 className="text-h1">Join SkillSum</h1>
        <p style={{ color: 'var(--text-secondary)' }}>400 levels of mental math await.</p>
      </div>

      <div
        className="flex flex-col gap-4 rounded-2xl p-6"
        style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}
      >
        <TextField label="Username" value={username} onChange={setUsername} placeholder="MathWizard" autoComplete="username" />
        <TextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <TextField label="Password" type="password" value={password} onChange={setPassword} placeholder="8+ characters" autoComplete="new-password" />
        {error && (
          <p className="text-sm font-semibold" style={{ color: 'var(--wrong)' }} role="alert">
            {error}
          </p>
        )}
        <PrimaryButton onClick={submit} disabled={loading || !email || !username || !password} fullWidth>
          {loading ? 'Creating account…' : '✨ Sign Up'}
        </PrimaryButton>
      </div>

      <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        Already playing?{' '}
        <Link href="/login" className="font-bold" style={{ color: 'var(--pink-400)' }}>
          Log in
        </Link>
      </p>
    </div>
  );
}
