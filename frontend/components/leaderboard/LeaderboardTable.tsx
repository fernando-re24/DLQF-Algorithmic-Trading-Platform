'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { Sparkline } from '@/components/charts/Sparkline';
import { genEquity } from '@/lib/chart-utils';
import { TEAMS, type Team } from '@/lib/fixtures';

type SortKey = 'rank' | 'sharpe' | 'maxdd' | 'ret' | 'turnover';
type SortDir = 'asc' | 'desc';

type Props = { showToolbar?: boolean };

export function LeaderboardTable({ showToolbar = true }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>('sharpe');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [limit, setLimit] = useState(10);

  const sorted = useMemo(() => {
    const arr = [...TEAMS];
    arr.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      return sortDir === 'desc' ? bv - av : av - bv;
    });
    return arr;
  }, [sortBy, sortDir]);

  const shown = sorted.slice(0, limit);

  const onSort = (col: SortKey) => {
    if (sortBy === col) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const SortHdr = ({
    col,
    children,
    align = 'left',
  }: {
    col: SortKey;
    children: React.ReactNode;
    align?: 'left' | 'right' | 'center';
  }) => {
    const active = sortBy === col;
    const ariaSort: 'ascending' | 'descending' | 'none' = active
      ? sortDir === 'desc'
        ? 'descending'
        : 'ascending'
      : 'none';
    return (
      <th
        className="sortable"
        onClick={() => onSort(col)}
        style={{ textAlign: align }}
        aria-sort={ariaSort}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {children}
          {active && (
            <span style={{ fontSize: 9, color: 'var(--fg-0)' }}>{sortDir === 'desc' ? '▼' : '▲'}</span>
          )}
        </span>
      </th>
    );
  };

  return (
    <>
      {showToolbar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-1)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              padding: 2,
            }}
            role="tablist"
            aria-label="Limit"
          >
            {[10, 50, TEAMS.length].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setLimit(n)}
                style={{
                  padding: '5px 12px',
                  fontSize: 12,
                  border: 'none',
                  background: limit === n ? 'var(--bg-3)' : 'transparent',
                  color: limit === n ? 'var(--fg-0)' : 'var(--fg-2)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {n === TEAMS.length ? 'All' : `Top ${n}`}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>
            Sort: <span style={{ color: 'var(--fg-0)' }}>{sortBy}</span> · {sortDir}
          </div>
          <button type="button" className="btn btn-sm btn-ghost">
            <Icon name="download" size={13} />
            Export CSV
          </button>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <SortHdr col="rank">Rank</SortHdr>
              <th>Team</th>
              <th>Equity curve (hidden)</th>
              <SortHdr col="sharpe" align="right">
                Sharpe
              </SortHdr>
              <SortHdr col="maxdd" align="right">
                Max DD
              </SortHdr>
              <SortHdr col="ret" align="right">
                Return
              </SortHdr>
              <SortHdr col="turnover" align="right">
                Turnover
              </SortHdr>
              <th style={{ textAlign: 'center' }}>Δ</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((t, i) => (
              <LeaderboardRow key={t.team} team={t} rank={sortBy === 'rank' ? t.rank : i + 1} />
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: 12,
          display: 'flex',
          justifyContent: 'space-between',
          color: 'var(--fg-2)',
          fontSize: 12,
        }}
        className="mono"
      >
        <span>
          Showing {shown.length} of {TEAMS.length} teams
        </span>
        <span>Updated 14:22 UTC · next refresh in 0:42</span>
      </div>
    </>
  );
}

function LeaderboardRow({ team, rank }: { team: Team; rank: number }) {
  const row = (
    <>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {rank <= 3 ? (
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background:
                  rank === 1
                    ? 'oklch(0.82 0.15 85)'
                    : rank === 2
                      ? 'oklch(0.75 0.01 250)'
                      : 'oklch(0.62 0.10 50)',
                color: 'var(--bg-0)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {rank}
            </div>
          ) : (
            <div
              className="mono"
              style={{ fontSize: 13, color: 'var(--fg-2)', width: 22, textAlign: 'center' }}
            >
              {rank}
            </div>
          )}
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              background: `oklch(${0.4 + (team.seed % 40) / 100} 0.1 ${(team.seed * 17) % 360})`,
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
          <div>
            <div style={{ fontWeight: 500, color: team.isYou ? 'var(--accent)' : 'var(--fg-0)' }}>
              {team.team}{' '}
              {team.isYou && (
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--accent)',
                    marginLeft: 6,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: 1,
                  }}
                >
                  YOU
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td>
        <Sparkline
          data={genEquity(team.seed, 40, 1.0, 0.009, team.ret / 50000)}
          width={120}
          height={28}
        />
      </td>
      <td className="num" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--pos)' }}>
        {team.sharpe.toFixed(2)}
      </td>
      <td className="num" style={{ textAlign: 'right', color: 'var(--neg)' }}>
        {team.maxdd.toFixed(1)}%
      </td>
      <td className="num" style={{ textAlign: 'right' }}>
        +{team.ret.toFixed(1)}%
      </td>
      <td className="num" style={{ textAlign: 'right', color: 'var(--fg-2)' }}>
        {team.turnover.toFixed(1)}×
      </td>
      <td style={{ textAlign: 'center' }}>
        {team.delta > 0 && (
          <span className="mono" style={{ color: 'var(--pos)', fontSize: 11 }}>
            ▲{team.delta}
          </span>
        )}
        {team.delta < 0 && (
          <span className="mono" style={{ color: 'var(--neg)', fontSize: 11 }}>
            ▼{Math.abs(team.delta)}
          </span>
        )}
        {team.delta === 0 && (
          <span className="mono" style={{ color: 'var(--fg-3)', fontSize: 11 }}>
            —
          </span>
        )}
      </td>
    </>
  );

  if (team.isYou) {
    return (
      <tr
        style={{
          cursor: 'pointer',
          background: 'oklch(0.75 0.13 210 / 0.06)',
        }}
        onClick={() => {
          window.location.href = '/jobs/sub_8f3a1c';
        }}
      >
        {row}
      </tr>
    );
  }
  return <tr>{row}</tr>;
}
