type Props = {
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress?: number;
  queuePos?: number;
};

export function StatusBadge({ status, progress, queuePos }: Props) {
  if (status === 'running') {
    return (
      <span className="badge badge-running">
        <span className="dot" aria-hidden="true"></span>RUNNING · {Math.round((progress || 0) * 100)}%
      </span>
    );
  }
  if (status === 'queued') {
    return (
      <span className="badge badge-queued">
        <span className="dot" aria-hidden="true"></span>QUEUED · #{queuePos || 1}
      </span>
    );
  }
  if (status === 'completed') {
    return (
      <span className="badge badge-completed">
        <span className="dot" aria-hidden="true"></span>COMPLETED
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="badge badge-failed">
        <span className="dot" aria-hidden="true"></span>FAILED
      </span>
    );
  }
  return null;
}
