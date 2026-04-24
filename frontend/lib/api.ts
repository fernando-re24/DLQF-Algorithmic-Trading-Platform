import { getAccessToken } from './supabase';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export type JobStatus =
  | 'pending_upload'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type Job = {
  job_id: string;
  user_id: string;
  project_id: string;
  status: JobStatus;
  s3_key: string;
  created_at: string;
  updated_at: string;
};

export type JobRun = {
  run_id: string;
  job_id: string;
  user_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  error?: string | null;
  created_at: string;
  updated_at: string;
};

export type PresignedUpload = {
  url: string;
  fields: Record<string, string>;
};

export type CreateJobResponse = { job: Job; upload: PresignedUpload };
export type GetJobResponse = { job: Job; latest_run: JobRun | null };
export type JobResultResponse = {
  run_id: string;
  score: number;
  max_drawdown: number;
  report_url: string;
  metrics_url: string;
};
export type MeResponse = {
  user: { user_id: string; email: string };
  project: { project_id: string; name?: string };
};
export type LeaderboardRow = {
  run_id: string;
  user_id: string;
  score: number;
  max_drawdown: number;
  created_at: string;
};

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  return res;
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.detail ?? detail;
    } catch {}
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  me: () => authFetch('/me').then((r) => json<MeResponse>(r)),

  createJob: (projectId: string) =>
    authFetch(`/projects/${projectId}/jobs`, { method: 'POST' }).then((r) =>
      json<CreateJobResponse>(r),
    ),

  submitGithub: (projectId: string, repoUrl: string, ref?: string) =>
    authFetch(`/projects/${projectId}/jobs/github`, {
      method: 'POST',
      body: JSON.stringify({ repo_url: repoUrl, ref: ref || null }),
    }).then((r) => json<{ job: Job; run: JobRun }>(r)),

  confirmUpload: (jobId: string) =>
    authFetch(`/jobs/${jobId}/confirm-upload`, { method: 'POST' }).then((r) => json(r)),

  getJob: (jobId: string) => authFetch(`/jobs/${jobId}`).then((r) => json<GetJobResponse>(r)),

  getJobResult: (jobId: string) =>
    authFetch(`/jobs/${jobId}/result`).then((r) => json<JobResultResponse>(r)),

  cancelJob: (jobId: string) =>
    authFetch(`/jobs/${jobId}/cancel`, { method: 'POST' }).then((r) => json(r)),

  listProjectJobs: (projectId: string) =>
    authFetch(`/projects/${projectId}/jobs`).then((r) =>
      json<{ jobs: Array<{ job: Job; latest_run: JobRun | null }> }>(r),
    ),

  leaderboard: (projectId: string) =>
    authFetch(`/projects/${projectId}/leaderboard`).then((r) =>
      json<{ leaderboard: LeaderboardRow[] }>(r),
    ),
};

// Upload the zip directly to S3 using the presigned POST envelope from the backend.
export async function uploadZipToS3(
  upload: PresignedUpload,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<void> {
  const form = new FormData();
  for (const [k, v] of Object.entries(upload.fields)) form.append(k, v);
  form.append('file', file);

  // Use XHR to get upload progress events (fetch streaming upload is still spotty).
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', upload.url);
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.responseText}`));
    };
    xhr.onerror = () => reject(new Error('S3 upload network error'));
    xhr.send(form);
  });
}

export { ApiError };
