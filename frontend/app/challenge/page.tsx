'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Icon } from '@/components/Icon';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { Countdown } from '@/components/shell/Countdown';
import { JobsTable, type JobRow } from '@/components/jobs/JobsTable';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { genEquity } from '@/lib/chart-utils';
import { DEMO_JOBS, DEMO_SCORES } from '@/lib/demo-jobs';
import { api, type LeaderboardRow } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type Tab = 'overview' | 'rules' | 'dataset' | 'submissions' | 'leaderboard';

export default function ChallengePage() {
  const [tab, setTab] = useState<Tab>('overview');
  const { session, profile } = useAuth();
  const projectId = profile?.project?.project_id ?? null;
  const live = Boolean(session && projectId);

  const jobsSWR = useSWR(
    live ? ['project-jobs', projectId] : null,
    () => api.listProjectJobs(projectId as string),
    { refreshInterval: 10000 },
  );
  const leaderboardSWR = useSWR(
    live ? ['leaderboard', projectId] : null,
    () => api.leaderboard(projectId as string),
    { refreshInterval: 15000 },
  );

  const liveJobs = jobsSWR.data?.jobs ?? [];
  const liveScores = useMemo(() => {
    const m: Record<string, LeaderboardRow> = {};
    for (const r of leaderboardSWR.data?.leaderboard ?? []) m[r.run_id] = r;
    return m;
  }, [leaderboardSWR.data]);

  const jobs = live ? liveJobs : DEMO_JOBS;
  const scoresByRunId = live ? liveScores : DEMO_SCORES;

  const target = useMemo(
    () => Date.now() + (12 * 24 * 3600 + 4 * 3600 + 37 * 60) * 1000,
    [],
  );
  const progressData = useMemo(() => genEquity(7, 80, 1.0, 0.008, 0.0006), []);

  const tabs: [Tab, string, number | null][] = [
    ['overview', 'Overview', null],
    ['rules', 'Rules & Constraints', null],
    ['dataset', 'Dataset', null],
    ['submissions', 'Submissions', jobs.length || null],
    ['leaderboard', 'Leaderboard', 312],
  ];

  return (
    <div className="page">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 32,
          marginBottom: 28,
        }}
      >
        <div>
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
          <h1 style={{ fontSize: 30, margin: 0, letterSpacing: -0.8, fontWeight: 600 }}>
            US Equities · Intraday Mean-Reversion
          </h1>
          <p style={{ color: 'var(--fg-2)', margin: '6px 0 0', maxWidth: 640 }}>
            Build a market-neutral intraday equities strategy. Evaluated on an unseen 2025 regime with
            realistic microstructure. Max leverage 2×.
          </p>
        </div>
        <div className="card" style={{ padding: '14px 18px' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--fg-2)',
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              marginBottom: 10,
            }}
          >
            Code freeze in
          </div>
          <Countdown target={target} />
          <div className="mono" style={{ marginTop: 10, fontSize: 11, color: 'var(--fg-2)' }}>
            2026-05-02 · 16:00 UTC
          </div>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Challenge sections">
        {tabs.map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`tab ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
            {count != null && <span className="count">{count}</span>}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Your best submission · sub_8f3a1c</div>
                <div className="card-sub mono">Hidden period equity curve · 252 days</div>
              </div>
              <span className="badge badge-completed">
                <span className="dot" aria-hidden="true"></span>SCORED
              </span>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <AnimatedLineChart data={progressData} height={220} color="var(--pos)" />
            </div>
            <div
              style={{
                borderTop: '1px solid var(--line-soft)',
                padding: '14px 18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 18,
              }}
            >
              {(
                [
                  ['Hidden Sharpe', '2.09', 'pos'],
                  ['Train Sharpe', '2.41', null],
                  ['Max Drawdown', '−9.70%', 'neg'],
                  ['Annual Return', '+26.1%', 'pos'],
                ] as const
              ).map(([l, v, c]) => (
                <div key={l}>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--fg-2)',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    {l}
                  </div>
                  <div
                    className="num"
                    style={{
                      fontSize: 18,
                      marginTop: 4,
                      color:
                        c === 'pos' ? 'var(--pos)' : c === 'neg' ? 'var(--neg)' : 'var(--fg-0)',
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div className="card-head">
                <div className="card-title">Constraints summary</div>
              </div>
              <div className="constraints">
                {[
                  ['Slippage model', 'Almgren · η=0.14'],
                  ['Commission', '0.50 bps'],
                  ['Leverage cap', '2.0 ×'],
                  ['Rebalance freq.', '1-minute bars'],
                  ['Borrow rate', 'OIS + 40 bps'],
                  ['Universe', 'S&P 500'],
                ].map(([l, v]) => (
                  <div key={l} className="constraint">
                    <div className="constraint-label">{l}</div>
                    <div className="constraint-val">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div className="card-title">Dataset</div>
                <span className="badge badge-completed">
                  <span className="dot" aria-hidden="true"></span>READY
                </span>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: 'var(--bg-2)',
                      border: '1px solid var(--line)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Icon name="dataset" size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>spring2026_train.parquet</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>
                      4.2 GB · 2019-01 → 2024-12
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Icon name="download" size={14} /> Download training dataset
                </button>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: 'var(--fg-3)',
                    marginTop: 10,
                    textAlign: 'center',
                  }}
                >
                  sha256: 4a7f… · requester-pays S3
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div className="card-title">Quick actions</div>
              </div>
              <div
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Link href="/submit" className="nav-item">
                  <Icon name="upload" size={14} />
                  Submit new strategy
                </Link>
                <Link href="/leaderboard" className="nav-item">
                  <Icon name="chart" size={14} />
                  View leaderboard
                </Link>
                <button type="button" className="nav-item">
                  <Icon name="doc" size={14} />
                  Read starter notebook
                </button>
                <button type="button" className="nav-item">
                  <Icon name="github" size={14} />
                  Example repo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'rules' && <RulesTab />}
      {tab === 'dataset' && <DatasetTab />}
      {tab === 'submissions' && (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Your submissions</div>
              <div className="card-sub">
                {live ? `${jobs.length} total` : `Demo · ${jobs.length} sample submissions`}
              </div>
            </div>
            <Link href="/submit" className="btn btn-primary btn-sm">
              <Icon name="plus" size={13} />
              New submission
            </Link>
          </div>
          <JobsTable jobs={jobs} scoresByRunId={scoresByRunId} />
        </div>
      )}
      {tab === 'leaderboard' && <LeaderboardTable />}
    </div>
  );
}

function RulesTab() {
  return (
    <div className="card">
      <div style={{ padding: '24px 28px', maxWidth: 820 }}>
        <h3 style={{ marginTop: 0, fontSize: 16 }}>Eligibility</h3>
        <ul style={{ color: 'var(--fg-1)', lineHeight: 1.7, paddingLeft: 18 }}>
          <li>Teams of 1 to 4. Graduate and undergraduate students only.</li>
          <li>One submission per team every 15 minutes. No limit on total submissions.</li>
          <li>All code runs in a sandboxed container · no outbound network.</li>
        </ul>
        <h3 style={{ fontSize: 16, marginTop: 28 }}>Constraints</h3>
        <div className="card" style={{ background: 'var(--bg-0)', marginTop: 12 }}>
          <div className="constraints">
            {[
              ['Gross leverage', '≤ 2.0 ×'],
              ['Position limit per name', '≤ 5% gross'],
              ['Daily turnover cap', '≤ 200% gross'],
              ['Short-sale restriction', 'Reg SHO hard-to-borrow list enforced'],
              ['Order types allowed', 'Market, limit, IOC'],
              ['Warmup window', '60 bars minimum'],
              ['Execution timeout', '30 minutes per evaluation'],
              ['Memory ceiling', '8 GiB · cpu=4'],
            ].map(([l, v]) => (
              <div key={l} className="constraint">
                <div className="constraint-label">{l}</div>
                <div className="constraint-val">{v}</div>
              </div>
            ))}
          </div>
        </div>
        <h3 style={{ fontSize: 16, marginTop: 28 }}>Scoring</h3>
        <p style={{ color: 'var(--fg-1)', lineHeight: 1.7 }}>
          Primary ranking metric is <span className="mono">hidden_sharpe</span>, the annualized Sharpe
          ratio over the held-out 2025 period, computed from daily PnL net of costs. Ties broken by
          lower max drawdown. Submissions with hidden Sharpe &lt; 0.5 do not qualify for prizes.
        </p>
      </div>
    </div>
  );
}

function DatasetTab() {
  const rows: [string, string, string][] = [
    ['timestamp', 'datetime64[ns, UTC]', 'Bar end time'],
    ['symbol', 'string', 'Ticker'],
    ['open, high, low, close', 'float32', 'OHLC, split + div adjusted'],
    ['volume', 'int64', 'Share volume'],
    ['vwap', 'float32', 'Volume-weighted avg price'],
    ['bid, ask', 'float32', 'NBBO at bar close'],
    ['halt_flag', 'bool', 'True if halted that minute'],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">spring2026_train.parquet</div>
            <div className="card-sub mono">
              S&P 500 · 1-minute bars · adjusted · 2019-01 → 2024-12
            </div>
          </div>
          <button type="button" className="btn btn-sm">
            <Icon name="download" size={13} />
            Download · 4.2 GB
          </button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Column</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[0]}>
                  <td className="mono">{r[0]}</td>
                  <td className="mono" style={{ color: 'var(--fg-2)' }}>
                    {r[1]}
                  </td>
                  <td>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <div className="card-title">Sample snippet</div>
        </div>
        <pre
          style={{
            margin: 0,
            padding: 18,
            fontFamily: 'var(--font-mono)',
            fontSize: 11.5,
            color: 'var(--fg-1)',
            lineHeight: 1.65,
            overflow: 'auto',
          }}
        >
{`import dlqf

# Dataset streams lazily
ds = dlqf.dataset('spring2026_train')

# Strategy entrypoint
def on_bar(ctx, bar):
    sig = ctx.signal('reversal')
    tgt = -1 * sig.zscore(60)
    ctx.target_weights(tgt.clip(-0.05, 0.05))`}
        </pre>
      </div>
    </div>
  );
}
