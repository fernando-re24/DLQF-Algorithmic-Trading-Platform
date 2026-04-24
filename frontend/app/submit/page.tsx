'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Icon } from '@/components/Icon';
import { UploadDropzone } from '@/components/jobs/UploadDropzone';
import { JobsTable, type JobRow } from '@/components/jobs/JobsTable';
import { api, type JobStatus, type LeaderboardRow } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { DEMO_JOBS, DEMO_SCORES } from '@/lib/demo-jobs';

type Mode = 'zip' | 'github';

const TERMINAL: JobStatus[] = ['completed', 'failed', 'cancelled'];

export default function SubmitPage() {
  const { session, profile, loading: authLoading } = useAuth();
  const projectId = profile?.project?.project_id ?? null;
  const live = Boolean(session && projectId);

  if (authLoading) {
    return <div className="page" />;
  }

  return live ? <LiveSubmit projectId={projectId as string} /> : <DemoSubmit />;
}

function PageHeader() {
  return (
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
  );
}

function DemoBanner() {
  return (
    <div
      className="card"
      style={{
        padding: 16,
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--fg-1)' }}>
        You&apos;re viewing a demo of the submit flow. Sign in to upload a real strategy.
      </span>
      <Link href="/sign-in?next=/submit" className="btn btn-primary btn-sm">
        Sign in
      </Link>
    </div>
  );
}

function DemoSubmit() {
  const [mode, setMode] = useState<Mode>('zip');
  const [ghUrl, setGhUrl] = useState('');
  const [ghRef, setGhRef] = useState('');
  const [runningPct, setRunningPct] = useState(0.62);

  useEffect(() => {
    const t = setInterval(() => {
      setRunningPct((p) => Math.min(0.99, p + 0.008 + Math.random() * 0.01));
    }, 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="page">
      <PageHeader />
      <DemoBanner />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card">
          <div
            style={{ display: 'flex', borderBottom: '1px solid var(--line-soft)' }}
            role="tablist"
            aria-label="Submission source"
          >
            <ModeTab mode={mode} value="zip" onClick={() => setMode('zip')} label="Upload ZIP" icon="zip" />
            <ModeTab mode={mode} value="github" onClick={() => setMode('github')} label="Link GitHub" icon="github" />
          </div>

          <div style={{ padding: 22 }}>
            {mode === 'zip' ? (
              <UploadDropzone projectId="demo" readOnly />
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
                    disabled
                    style={ghInputStyle(1)}
                  />
                  <input
                    type="text"
                    value={ghRef}
                    onChange={(e) => setGhRef(e.target.value)}
                    placeholder="branch (optional)"
                    disabled
                    style={{ ...ghInputStyle(0), width: 160 }}
                  />
                  <button type="button" className="btn btn-primary" disabled>
                    <Icon name="ext" size={14} />
                    Clone & evaluate
                  </button>
                </div>
                <div style={{ marginTop: 14, fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.7 }}>
                  We&apos;ll clone at{' '}
                  <span className="mono" style={{ color: 'var(--fg-1)' }}>HEAD</span>{' '}
                  of the default branch. Public repos only; max 50 MB after clone.
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
                    <span className="mono" style={{ fontSize: 12 }}>dlqf-bot</span>
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
              <div style={{ height: 6, background: 'var(--bg-2)', borderRadius: 3, overflow: 'hidden' }}>
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
                className="mono"
                style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11 }}
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
                <span className="mono" style={{ color: 'var(--fg-0)' }}>4m 12s</span>
              </div>
              <div style={{ height: 4, background: 'var(--bg-2)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: '72%', height: '100%', background: 'var(--warn)' }} />
              </div>
              <div style={{ marginTop: 14, fontSize: 11, color: 'var(--fg-2)', lineHeight: 1.6 }}>
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
          <JobsTable jobs={DEMO_JOBS} scoresByRunId={DEMO_SCORES} />
        </div>
      </div>
    </div>
  );
}

function LiveSubmit({ projectId }: { projectId: string }) {
  const { session } = useAuth();

  const [mode, setMode] = useState<Mode>('zip');
  const [ghUrl, setGhUrl] = useState('');
  const [ghRef, setGhRef] = useState('');
  const [ghSubmitting, setGhSubmitting] = useState(false);
  const [ghError, setGhError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const jobsSWR = useSWR(
    ['project-jobs', projectId],
    () => api.listProjectJobs(projectId),
    { refreshInterval: 5000 },
  );

  const leaderboardSWR = useSWR(
    ['leaderboard', projectId],
    () => api.leaderboard(projectId),
    { refreshInterval: 15000 },
  );

  const scoresByRunId = useMemo(() => {
    const map: Record<string, LeaderboardRow> = {};
    for (const row of leaderboardSWR.data?.leaderboard ?? []) map[row.run_id] = row;
    return map;
  }, [leaderboardSWR.data]);

  const jobs: JobRow[] = jobsSWR.data?.jobs ?? [];

  const liveJob: JobRow | null =
    jobs.find(({ job }) => !TERMINAL.includes(job.status)) ?? jobs[0] ?? null;
  const focusedId = activeJobId ?? liveJob?.job.job_id ?? null;
  const focused = focusedId ? jobs.find((r) => r.job.job_id === focusedId) ?? liveJob : liveJob;

  useEffect(() => {
    if (!focused) return;
    if (TERMINAL.includes(focused.job.status) && activeJobId === focused.job.job_id) {
      setActiveJobId(null);
    }
  }, [focused, activeJobId]);

  const submitGithub = async () => {
    const url = ghUrl.trim();
    if (!url) {
      setGhError('Enter a GitHub repository URL.');
      return;
    }
    if (!/^https:\/\/github\.com\/[^/\s]+\/[^/\s]+?(?:\.git)?\/?$/.test(url)) {
      setGhError('URL must look like https://github.com/<owner>/<repo>');
      return;
    }
    setGhSubmitting(true);
    setGhError(null);
    try {
      const { job } = await api.submitGithub(projectId, url, ghRef.trim() || undefined);
      setActiveJobId(job.job_id);
      setGhUrl('');
      setGhRef('');
      jobsSWR.mutate();
    } catch (e: any) {
      setGhError(e?.message ?? 'GitHub submission failed');
    } finally {
      setGhSubmitting(false);
    }
  };

  return (
    <div className="page">
      <PageHeader />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card">
          <div
            style={{ display: 'flex', borderBottom: '1px solid var(--line-soft)' }}
            role="tablist"
            aria-label="Submission source"
          >
            <ModeTab mode={mode} value="zip" onClick={() => setMode('zip')} label="Upload ZIP" icon="zip" />
            <ModeTab mode={mode} value="github" onClick={() => setMode('github')} label="Link GitHub" icon="github" />
          </div>

          <div style={{ padding: 22 }}>
            {mode === 'zip' ? (
              <UploadDropzone
                projectId={projectId}
                onJobCreated={(jobId) => {
                  setActiveJobId(jobId);
                  jobsSWR.mutate();
                }}
              />
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
                    disabled={ghSubmitting}
                    style={ghInputStyle(1)}
                  />
                  <input
                    type="text"
                    value={ghRef}
                    onChange={(e) => setGhRef(e.target.value)}
                    placeholder="branch (optional)"
                    disabled={ghSubmitting}
                    style={{ ...ghInputStyle(0), width: 160 }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={submitGithub}
                    disabled={ghSubmitting}
                  >
                    <Icon name="ext" size={14} />
                    {ghSubmitting ? 'Cloning...' : 'Clone & evaluate'}
                  </button>
                </div>
                {ghError && (
                  <div className="mono" style={{ marginTop: 12, color: 'var(--neg)', fontSize: 11 }}>
                    {ghError}
                  </div>
                )}
                <div style={{ marginTop: 14, fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.7 }}>
                  Public repos only. The backend shallow-clones at submit time and enqueues the job
                  identically to a ZIP upload. Max 50 MB after clone.
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <LiveStatusCard row={focused} />

          <div className="card">
            <div className="card-head">
              <div className="card-title">Session</div>
            </div>
            <div style={{ padding: 18, fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.7 }}>
              Signed in as{' '}
              <span className="mono" style={{ color: 'var(--fg-0)' }}>
                {session?.user.email}
              </span>
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
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => jobsSWR.mutate()}
            >
              <Icon name="refresh" size={13} />
              Refresh
            </button>
          </div>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <JobsTable jobs={jobs} scoresByRunId={scoresByRunId} />
        </div>
      </div>
    </div>
  );
}

function ModeTab({
  mode,
  value,
  onClick,
  label,
  icon,
}: {
  mode: Mode;
  value: Mode;
  onClick: () => void;
  label: string;
  icon: 'zip' | 'github';
}) {
  const active = mode === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="tab"
      style={{
        borderBottom: active ? '2px solid var(--fg-0)' : '2px solid transparent',
        color: active ? 'var(--fg-0)' : 'var(--fg-2)',
        margin: 0,
        padding: '14px 20px',
      }}
    >
      <Icon name={icon} size={14} /> {label}
    </button>
  );
}

function ghInputStyle(flex: number): React.CSSProperties {
  return {
    flex: flex || undefined,
    padding: '10px 12px',
    background: 'var(--bg-0)',
    border: '1px solid var(--line)',
    borderRadius: 6,
    color: 'var(--fg-0)',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
  };
}

function LiveStatusCard({ row }: { row: JobRow | null }) {
  const jobId = row?.job.job_id;
  const status = row?.job.status;
  const isActive = !!status && !TERMINAL.includes(status);

  const { data } = useSWR(
    isActive && jobId ? ['job', jobId] : null,
    () => api.getJob(jobId!),
    { refreshInterval: 2000 },
  );

  const current = data ?? (row ? { job: row.job, latest_run: row.latest_run } : null);

  if (!current) {
    return (
      <div className="card">
        <div className="card-head">
          <div className="card-title">Live status</div>
        </div>
        <div style={{ padding: 18, fontSize: 12, color: 'var(--fg-2)' }}>
          No active submission.
        </div>
      </div>
    );
  }

  const { job, latest_run } = current;
  const shortId = job.job_id.slice(0, 8);
  const badgeClass =
    job.status === 'running'
      ? 'badge-running'
      : job.status === 'completed'
        ? 'badge-completed'
        : job.status === 'failed'
          ? 'badge-failed'
          : 'badge-queued';

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Live status · {shortId}</div>
        <span className={`badge ${badgeClass}`}>
          <span className="dot" aria-hidden="true"></span>
          {job.status.toUpperCase().replace('_', ' ')}
        </span>
      </div>
      <div style={{ padding: 18 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginBottom: 6 }}>
          run {latest_run?.run_id?.slice(0, 8) ?? '—'} · updated{' '}
          {new Date(job.updated_at).toLocaleTimeString()}
        </div>
        {latest_run?.error && (
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: 'var(--neg)',
              marginTop: 8,
              whiteSpace: 'pre-wrap',
            }}
          >
            {latest_run.error}
          </div>
        )}
        <Link
          href={`/jobs/${job.job_id}`}
          className="btn btn-sm"
          style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
        >
          View logs <Icon name="arrow_right" size={12} />
        </Link>
      </div>
    </div>
  );
}
