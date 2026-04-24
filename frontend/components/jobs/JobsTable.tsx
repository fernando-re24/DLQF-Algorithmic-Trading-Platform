'use client';

import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { StatusBadge } from './StatusBadge';
import type { Job, JobRun, LeaderboardRow } from '@/lib/api';

export type JobRow = {
  job: Job;
  latest_run: JobRun | null;
};

type Props = {
  jobs: JobRow[];
  scoresByRunId?: Record<string, LeaderboardRow>;
};

const fmtKey = (s3Key: string) => s3Key.split('/').pop() || s3Key;

const fmtTime = (iso: string) => {
  try {
    return new Date(iso).toISOString().replace('T', ' ').slice(0, 19);
  } catch {
    return iso;
  }
};

export function JobsTable({ jobs, scoresByRunId }: Props) {
  if (jobs.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--fg-2)', fontSize: 13 }}>
        No submissions yet. Upload a strategy.zip above to get started.
      </div>
    );
  }

  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>Submission</th>
          <th>Status</th>
          <th style={{ textAlign: 'right' }}>Score</th>
          <th style={{ textAlign: 'right' }}>Max DD</th>
          <th>Timestamp</th>
          <th aria-hidden="true"></th>
        </tr>
      </thead>
      <tbody>
        {jobs.map(({ job, latest_run }) => {
          const runScore = latest_run ? scoresByRunId?.[latest_run.run_id] : undefined;
          const shortId = job.job_id.slice(0, 8);
          return (
            <tr key={job.job_id}>
              <td>
                <Link
                  href={`/jobs/${job.job_id}`}
                  style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                >
                  <div className="mono" style={{ color: 'var(--fg-0)' }}>
                    {shortId}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 2 }}>
                    {fmtKey(job.s3_key)}
                    {latest_run?.error && (
                      <span style={{ color: 'var(--neg)', marginLeft: 6 }}>
                        · {latest_run.error}
                      </span>
                    )}
                  </div>
                </Link>
              </td>
              <td>
                <StatusBadge status={job.status} />
              </td>
              <td className="num" style={{ textAlign: 'right' }}>
                {runScore ? runScore.score.toFixed(2) : '—'}
              </td>
              <td
                className="num"
                style={{
                  textAlign: 'right',
                  color: runScore ? 'var(--fg-1)' : 'var(--fg-3)',
                }}
              >
                {runScore ? runScore.max_drawdown.toFixed(2) : '—'}
              </td>
              <td className="mono" style={{ color: 'var(--fg-2)', fontSize: 12 }}>
                {fmtTime(job.created_at)}
              </td>
              <td>
                <Link href={`/jobs/${job.job_id}`} aria-label={`Open ${shortId}`}>
                  <Icon name="arrow_right" size={14} />
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
