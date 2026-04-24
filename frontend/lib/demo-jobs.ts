import type { JobRow } from '@/components/jobs/JobsTable';
import type { LeaderboardRow } from '@/lib/api';
import { SUBMISSIONS } from '@/lib/fixtures';

const toIso = (ts: string) => {
  const d = new Date(ts.replace(' ', 'T') + 'Z');
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const DEMO_JOBS: JobRow[] = SUBMISSIONS.map((s) => {
  const iso = toIso(s.ts);
  return {
    job: {
      job_id: s.id,
      user_id: 'demo',
      project_id: 'spring-2026',
      status: s.status,
      s3_key: `submissions/demo/${s.id}/${s.fname}`,
      created_at: iso,
      updated_at: iso,
    },
    latest_run: {
      run_id: `${s.id}_run`,
      job_id: s.id,
      user_id: 'demo',
      status: s.status === 'failed' ? 'failed' : s.status,
      error: s.error ?? null,
      created_at: iso,
      updated_at: iso,
    },
  };
});

export const DEMO_SCORES: Record<string, LeaderboardRow> = Object.fromEntries(
  SUBMISSIONS.filter((s) => s.hiddenSharpe != null).map((s) => [
    `${s.id}_run`,
    {
      run_id: `${s.id}_run`,
      user_id: 'demo',
      score: s.hiddenSharpe!,
      max_drawdown: -9.7,
      created_at: toIso(s.ts),
    },
  ]),
);
