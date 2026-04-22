import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';

export default function LeaderboardPage() {
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
        <h1 style={{ fontSize: 28, margin: 0, letterSpacing: -0.6, fontWeight: 600 }}>Leaderboard</h1>
        <p style={{ color: 'var(--fg-2)', margin: '6px 0 0' }}>
          Ranked by hidden-period Sharpe. Updates in real time as submissions complete.
        </p>
      </div>
      <LeaderboardTable />
    </div>
  );
}
