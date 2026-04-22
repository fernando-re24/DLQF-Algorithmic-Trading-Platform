'use client';

import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { StatusBadge } from './StatusBadge';
import type { Submission } from '@/lib/fixtures';

type Props = {
  submissions: Submission[];
  liveRunningPct?: number;
};

export function JobsTable({ submissions, liveRunningPct }: Props) {
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>Submission</th>
          <th>Status</th>
          <th style={{ textAlign: 'right' }}>Train Sharpe</th>
          <th style={{ textAlign: 'right' }}>Hidden Sharpe</th>
          <th>Timestamp</th>
          <th aria-hidden="true"></th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((s) => {
          const progress = s.id === 'sub_8d21e4' && liveRunningPct != null ? liveRunningPct : s.progress;
          return (
            <tr key={s.id}>
              <td>
                <Link
                  href={`/jobs/${s.id}`}
                  style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                >
                  <div className="mono" style={{ color: 'var(--fg-0)' }}>
                    {s.id}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 2 }}>
                    {s.fname} · {s.size}
                    {s.error && <span style={{ color: 'var(--neg)', marginLeft: 6 }}>· {s.error}</span>}
                  </div>
                </Link>
              </td>
              <td>
                <StatusBadge status={s.status} progress={progress} queuePos={s.queuePos} />
              </td>
              <td className="num" style={{ textAlign: 'right' }}>
                {s.trainSharpe?.toFixed(2) ?? '—'}
              </td>
              <td
                className="num"
                style={{
                  textAlign: 'right',
                  color: s.hiddenSharpe ? 'var(--pos)' : 'var(--fg-3)',
                }}
              >
                {s.hiddenSharpe?.toFixed(2) ?? '—'}
              </td>
              <td className="mono" style={{ color: 'var(--fg-2)', fontSize: 12 }}>
                {s.ts}
              </td>
              <td>
                <Link href={`/jobs/${s.id}`} aria-label={`Open ${s.id}`}>
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
