'use client';

import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { useAuth } from '@/lib/auth-context';

export default function LeaderboardPage() {
  const { session, loading } = useAuth();

  return (
    <div className="page">
      <div style={{ marginBottom: 20 }}>
        <div
          className="mono"
          style={{
            fontSize: 11,
            color: 'var(--fg-2)',
            textTransform: 'uppercase',
            letterSpacing: 1.4,
            marginBottom: 8,
          }}
        >
          CHALLENGE · SPRING-2026
        </div>
        <h1 style={{ fontSize: 28, margin: 0, letterSpacing: -0.6, fontWeight: 600 }}>
          Leaderboard
        </h1>
        <p style={{ color: 'var(--fg-2)', margin: '6px 0 0' }}>
          Ranked by hidden-period Sharpe. Updates in real time as submissions complete.
        </p>
      </div>

      {loading ? null : session ? (
        <div
          className="card"
          style={{
            padding: 48,
            textAlign: 'center',
            color: 'var(--fg-2)',
            fontSize: 13,
          }}
        >
          Live leaderboard coming soon.
        </div>
      ) : (
        <LeaderboardTable />
      )}
    </div>
  );
}
