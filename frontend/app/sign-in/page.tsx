'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function SignInPage() {
  const { session, signInWithPassword, signUpWithPassword } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/submit';

  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) router.replace(next);
  }, [session, router, next]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === 'sign-in') await signInWithPassword(email, password);
      else await signUpWithPassword(email, password);
    } catch (e: any) {
      setErr(e?.message ?? 'Auth failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 420, margin: '64px auto' }}>
      <h1 style={{ fontSize: 24, margin: 0, fontWeight: 600 }}>
        {mode === 'sign-in' ? 'Sign in' : 'Create account'}
      </h1>
      <p style={{ color: 'var(--fg-2)', marginTop: 6, fontSize: 13 }}>
        DLQF Platform · Spring 2026 Challenge
      </p>

      <form onSubmit={onSubmit} style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              padding: '10px 12px',
              background: 'var(--bg-0)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              color: 'var(--fg-0)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
            }}
          />
        </label>

        <label style={{ display: 'grid', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            style={{
              padding: '10px 12px',
              background: 'var(--bg-0)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              color: 'var(--fg-0)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
            }}
          />
        </label>

        {err && (
          <div style={{ color: 'var(--neg)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            {err}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Please wait...' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
        >
          {mode === 'sign-in' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
