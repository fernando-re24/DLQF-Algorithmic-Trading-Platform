'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { UploadDropzone } from '@/components/jobs/UploadDropzone';
import { JobsTable } from '@/components/jobs/JobsTable';
import { SUBMISSIONS } from '@/lib/fixtures';

type Mode = 'zip' | 'github';

export default function SubmitPage() {
  const [mode, setMode] = useState<Mode>('zip');
  const [ghUrl, setGhUrl] = useState('');
  const [runningPct, setRunningPct] = useState(0.62);

  useEffect(() => {
    const t = setInterval(() => {
      setRunningPct((p) => Math.min(0.99, p + 0.008 + Math.random() * 0.01));
    }, 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
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
          Submit strategy
        </h1>
        <p style={{ color: 'var(--fg-2)', margin: '6px 0 0' }}>
          Package your code as a ZIP or link a GitHub repo. Evaluation runs in a sealed container, no
          outbound network.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card">
          <div
            style={{ display: 'flex', borderBottom: '1px solid var(--line-soft)' }}
            role="tablist"
            aria-label="Submission source"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'zip'}
              onClick={() => setMode('zip')}
              className="tab"
              style={{
                borderBottom: mode === 'zip' ? '2px solid var(--fg-0)' : '2px solid transparent',
                color: mode === 'zip' ? 'var(--fg-0)' : 'var(--fg-2)',
                margin: 0,
                padding: '14px 20px',
              }}
            >
              <Icon name="zip" size={14} /> Upload ZIP
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'github'}
              onClick={() => setMode('github')}
              className="tab"
              style={{
                borderBottom: mode === 'github' ? '2px solid var(--fg-0)' : '2px solid transparent',
                color: mode === 'github' ? 'var(--fg-0)' : 'var(--fg-2)',
                margin: 0,
                padding: '14px 20px',
              }}
            >
              <Icon name="github" size={14} /> Link GitHub
            </button>
          </div>

          <div style={{ padding: 22 }}>
            {mode === 'zip' ? (
              <UploadDropzone />
            ) : (
              <>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: 'var(--fg-2)',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Repository URL
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={ghUrl}
                    onChange={(e) => setGhUrl(e.target.value)}
                    placeholder="https://github.com/your-team/strategy"
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: 'var(--bg-0)',
                      border: '1px solid var(--line)',
                      borderRadius: 6,
                      color: 'var(--fg-0)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                    }}
                  />
                  <button type="button" className="btn btn-primary">
                    <Icon name="ext" size={14} />
                    Clone & evaluate
                  </button>
                </div>
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 12,
                    color: 'var(--fg-2)',
                    lineHeight: 1.7,
                  }}
                >
                  We&apos;ll clone at{' '}
                  <span className="mono" style={{ color: 'var(--fg-1)' }}>
                    HEAD
                  </span>{' '}
                  of the default branch. Private repos require the DLQF GitHub App to be installed,{' '}
                  <a style={{ color: 'var(--fg-0)', textDecoration: 'underline' }}>install</a>.
                </div>
                <div
                  style={{
                    marginTop: 22,
                    padding: 14,
                    background: 'var(--bg-0)',
                    borderRadius: 6,
                    border: '1px solid var(--line-soft)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--fg-1)' }}>
                    <Icon name="github" size={16} />
                    <span className="mono" style={{ fontSize: 12 }}>
                      dlqf-bot
                    </span>
                    <span style={{ color: 'var(--fg-3)' }}>·</span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>
                      read-only access to selected repos
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-head">
              <div className="card-title">Live status · sub_8d21e4</div>
              <span className="badge badge-running">
                <span className="dot" aria-hidden="true"></span>RUNNING
              </span>
            </div>
            <div style={{ padding: 18 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginBottom: 6 }}>
                shard 03/04 · 2025-07 → 2025-09
              </div>
              <div
                style={{
                  height: 6,
                  background: 'var(--bg-2)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${runningPct * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent), oklch(0.85 0.13 210))',
                    transition: 'width 0.6s',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                      animation: 'shimmer 1.8s infinite',
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 8,
                  fontSize: 11,
                }}
                className="mono"
              >
                <span style={{ color: 'var(--fg-2)' }}>elapsed 18.4s</span>
                <span style={{ color: 'var(--fg-0)' }}>{Math.round(runningPct * 100)}%</span>
              </div>
              <Link
                href="/jobs/sub_8d21e4"
                className="btn btn-sm"
                style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
              >
                View logs <Icon name="arrow_right" size={12} />
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Rate limit</div>
            </div>
            <div style={{ padding: 18 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: 'var(--fg-2)',
                  marginBottom: 6,
                }}
              >
                <span>Next submission in</span>
                <span className="mono" style={{ color: 'var(--fg-0)' }}>
                  4m 12s
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: 'var(--bg-2)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div style={{ width: '72%', height: '100%', background: 'var(--warn)' }} />
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 11,
                  color: 'var(--fg-2)',
                  lineHeight: 1.6,
                }}
              >
                1 submission per 15 min. 23 today · 318 lifetime.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h2 style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Submission history</h2>
          <div className="h-row" style={{ gap: 8 }}>
            <button type="button" className="btn btn-sm btn-ghost">
              <Icon name="filter" size={13} />
              Filter
            </button>
            <button type="button" className="btn btn-sm btn-ghost">
              <Icon name="refresh" size={13} />
              Refresh
            </button>
          </div>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <JobsTable submissions={SUBMISSIONS} liveRunningPct={runningPct} />
        </div>
      </div>
    </div>
  );
}
