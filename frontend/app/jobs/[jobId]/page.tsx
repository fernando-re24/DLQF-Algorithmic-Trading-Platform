'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Icon } from '@/components/Icon';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { DrawdownChart } from '@/components/charts/DrawdownChart';
import { BarChart } from '@/components/charts/BarChart';
import { genEquity } from '@/lib/chart-utils';
import { LOG_LINES } from '@/lib/fixtures';

type LogFilter = 'ALL' | 'INFO' | 'WARN' | 'ERR' | 'OK';

export default function JobDetailPage({ params }: { params: { jobId: string } }) {
  const equity = useMemo(() => genEquity(77, 252, 1.0, 0.009, 0.0012), []);
  const monthlyReturns = [2.1, 1.8, -0.6, 3.2, 1.1, -1.4, 2.8, 3.6, -0.9, 1.7, 2.3, 4.1];
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const [logFilter, setLogFilter] = useState<LogFilter>('ALL');
  const filteredLogs = LOG_LINES.filter((l) => logFilter === 'ALL' || l.l === logFilter);

  const metrics = [
    { l: 'Hidden Sharpe', v: '2.09', d: '+0.12 vs train', dc: 'pos' as const, big: true },
    { l: 'Annual Return', v: '+26.1%', d: 'net of costs', dc: 'pos' as const },
    { l: 'Max Drawdown', v: '−9.70%', d: '2025-08-14', dc: 'neg' as const },
    { l: 'Volatility', v: '12.5%', d: 'annualized', dc: null },
  ];

  const risk: [string, string][] = [
    ['Tracking error', '8.2%'],
    ['Beta vs SPY', '0.04'],
    ['Sortino ratio', '3.12'],
    ['Calmar ratio', '2.69'],
    ['Skewness', '−0.31'],
    ['Kurtosis', '4.8'],
    ['Win rate', '54.3%'],
    ['Profit factor', '1.72'],
  ];

  const artifacts = [
    { n: 'metrics.json', s: '4.1 KB', d: 'tearsheet summary', icon: 'doc' as const },
    { n: 'trades.csv', s: '812 KB', d: '3,204 trades', icon: 'doc' as const },
    { n: 'positions.parquet', s: '186 KB', d: 'daily positions', icon: 'doc' as const },
    { n: 'runner.log', s: '14 KB', d: 'full stdout', icon: 'logs' as const },
  ];

  return (
    <div className="page">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Link href="/submit" className="btn btn-sm btn-ghost">
              <span style={{ display: 'inline-block' }}>←</span> Back
            </Link>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>
              Submission
            </span>
          </div>
          <h1
            style={{
              fontSize: 26,
              margin: 0,
              letterSpacing: -0.5,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {params.jobId}
          </h1>
          <div
            style={{
              marginTop: 8,
              color: 'var(--fg-2)',
              fontSize: 13,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <span>momentum_v12.zip · 3.4 MB</span>
            <span style={{ color: 'var(--fg-3)' }}>·</span>
            <span className="mono">2026-04-19 14:22:08 UTC</span>
            <span style={{ color: 'var(--fg-3)' }}>·</span>
            <span>19.6s</span>
            <span className="badge badge-completed" style={{ marginLeft: 4 }}>
              <span className="dot" aria-hidden="true"></span>COMPLETED
            </span>
          </div>
        </div>
        <div className="h-row" style={{ gap: 8 }}>
          <button type="button" className="btn btn-sm">
            <Icon name="download" size={13} />
            metrics.json
          </button>
          <button type="button" className="btn btn-sm">
            <Icon name="download" size={13} />
            trades.csv
          </button>
          <button type="button" className="btn btn-sm">
            <Icon name="copy" size={13} />
            Copy ID
          </button>
          <button type="button" className="btn btn-sm btn-primary">
            <Icon name="refresh" size={13} />
            Re-run
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {metrics.map((m) => (
          <div key={m.l} className="metric">
            <div className="metric-label">{m.l}</div>
            <div
              className="metric-value"
              style={{
                color:
                  m.dc === 'pos' ? 'var(--pos)' : m.dc === 'neg' ? 'var(--neg)' : 'var(--fg-0)',
                fontSize: m.big ? 26 : 22,
              }}
            >
              {m.v}
            </div>
            <div
              className="metric-delta"
              style={{
                color:
                  m.dc === 'pos' ? 'var(--pos)' : m.dc === 'neg' ? 'var(--neg)' : 'var(--fg-2)',
              }}
            >
              {m.d}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <div>
            <div className="card-title">Equity curve · hidden period</div>
            <div className="card-sub mono">
              2025-01-02 → 2025-12-31 · 252 trading days · start=$1.00
            </div>
          </div>
          <div className="h-row" style={{ gap: 6 }}>
            {['1M', '3M', '6M', 'YTD', 'ALL'].map((r) => (
              <button
                key={r}
                type="button"
                className="btn btn-sm"
                style={{
                  background: r === 'ALL' ? 'var(--bg-3)' : 'transparent',
                  borderColor: r === 'ALL' ? 'var(--line)' : 'transparent',
                  color: r === 'ALL' ? 'var(--fg-0)' : 'var(--fg-2)',
                  padding: '3px 9px',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '14px 18px' }}>
          <AnimatedLineChart data={equity} height={260} color="var(--pos)" />
        </div>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}
      >
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Drawdown</div>
              <div className="card-sub mono">peak-to-trough underwater curve</div>
            </div>
            <span className="num" style={{ color: 'var(--neg)', fontSize: 13 }}>
              min: −9.70%
            </span>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <DrawdownChart equity={equity} height={180} />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Risk breakdown</div>
          </div>
          <div style={{ padding: '16px 18px' }}>
            {risk.map(([k, v], i) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '7px 0',
                  borderBottom: i < risk.length - 1 ? '1px solid var(--line-soft)' : 'none',
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: 'var(--fg-2)' }}>{k}</span>
                <span className="num" style={{ color: 'var(--fg-0)' }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <div>
            <div className="card-title">Monthly returns · 2025</div>
            <div className="card-sub mono">% net PnL per month</div>
          </div>
        </div>
        <div style={{ padding: '14px 18px' }}>
          <BarChart data={monthlyReturns} labels={labels} height={160} color="var(--accent)" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Run logs</div>
              <div className="card-sub mono">runner · dlqf-eu-west-1a · node i-0af32c</div>
            </div>
            <div className="h-row" style={{ gap: 4 }}>
              {(['ALL', 'INFO', 'WARN', 'ERR'] as LogFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setLogFilter(f)}
                  className="btn btn-sm"
                  style={{
                    padding: '3px 9px',
                    background: logFilter === f ? 'var(--bg-3)' : 'transparent',
                    borderColor: logFilter === f ? 'var(--line)' : 'transparent',
                    color: logFilter === f ? 'var(--fg-0)' : 'var(--fg-2)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: 14 }}>
            <div className="logs" role="log">
              {filteredLogs.map((l, i) => (
                <div key={i} className="log-line">
                  <span className="log-time">{l.t}</span>
                  <span className={`log-lvl ${l.l}`}>{l.l}</span>
                  <span className="log-msg">{l.m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Artifacts</div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>
              4 files · 817 KB
            </span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {artifacts.map((a, i) => (
              <div
                key={a.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 18px',
                  borderBottom:
                    i < artifacts.length - 1 ? '1px solid var(--line-soft)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: 'var(--bg-2)',
                    border: '1px solid var(--line)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--fg-1)',
                  }}
                >
                  <Icon name={a.icon} size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 12.5 }}>
                    {a.n}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 2 }}>
                    {a.s} · {a.d}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  aria-label={`Download ${a.n}`}
                >
                  <Icon name="download" size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
