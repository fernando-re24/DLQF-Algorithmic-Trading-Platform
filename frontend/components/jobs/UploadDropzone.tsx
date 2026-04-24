'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Icon } from '@/components/Icon';
import { api, uploadZipToS3 } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type Props = {
  projectId: string;
  onJobCreated?: (jobId: string) => void;
  readOnly?: boolean;
};

const MAX_BYTES = 50 * 1024 * 1024;

function validateFile(f: File): string | null {
  const isZip =
    f.type === 'application/zip' ||
    f.type === 'application/x-zip-compressed' ||
    f.name.toLowerCase().endsWith('.zip');
  if (!isZip) return 'Only .zip files are accepted.';
  if (f.size > MAX_BYTES) return 'File exceeds 50 MB limit.';
  if (f.size === 0) return 'File is empty.';
  return null;
}

export function UploadDropzone({ projectId, onJobCreated, readOnly = false }: Props) {
  const router = useRouter();
  const { session } = useAuth();
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'creating' | 'uploading' | 'confirming' | 'error'>(
    'idle',
  );
  const [error, setError] = useState<string | null>(null);
  const dragDepth = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    if (uploading || readOnly) return;
    inputRef.current?.click();
  };

  const sizeLabel = file ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : '';

  const acceptFile = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      setPhase('error');
      setFile(null);
      return;
    }
    setError(null);
    setPhase('idle');
    setFile(f);
  };

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current += 1;
    if (e.dataTransfer?.types?.includes('Files')) setDrag(true);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDrag(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setDrag(false);
    if (readOnly) return;
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
  };

  const reset = () => {
    setFile(null);
    setUploadPct(0);
    setPhase('idle');
    setError(null);
  };

  const startUpload = async () => {
    if (!file) return;
    if (!session) {
      router.push(`/sign-in?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadPct(0);

    try {
      setPhase('creating');
      const { job, upload } = await api.createJob(projectId);

      setPhase('uploading');
      await uploadZipToS3(upload, file, (pct) => setUploadPct(pct));

      setPhase('confirming');
      await api.confirmUpload(job.job_id);

      onJobCreated?.(job.job_id);
      reset();
    } catch (e: any) {
      console.error('[upload] failed', e);
      setError(e?.message ?? 'Upload failed');
      setPhase('error');
    } finally {
      setUploading(false);
    }
  };

  const phaseLabel =
    phase === 'creating'
      ? 'Creating job...'
      : phase === 'uploading'
        ? `Uploading · ${uploadPct.toFixed(0)}%`
        : phase === 'confirming'
          ? 'Enqueueing...'
          : '';

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip,application/x-zip-compressed"
        style={{ display: 'none' }}
        onChange={onPick}
      />
      <div
        className={`dropzone ${drag ? 'drag' : ''}`}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={file || readOnly ? undefined : openPicker}
        onKeyDown={(e) => {
          if (file || readOnly) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        role="button"
        tabIndex={file || readOnly ? -1 : 0}
        aria-disabled={readOnly || undefined}
        aria-label="Upload strategy zip — click or drop a .zip file"
        style={{
          cursor: readOnly ? 'default' : file || uploading ? 'default' : 'pointer',
        }}
      >
        <div className="dropzone-icon">
          <Icon name="upload" size={20} />
        </div>
        {file ? (
          <>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{file.name}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 4 }}>
              {sizeLabel}
            </div>
            {uploading && (
              <div style={{ marginTop: 16, maxWidth: 360, margin: '16px auto 0' }}>
                <div
                  style={{
                    height: 4,
                    background: 'var(--bg-2)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${uploadPct}%`,
                      height: '100%',
                      background: 'var(--accent)',
                      transition: 'width 0.2s',
                    }}
                  />
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 6 }}
                >
                  {phaseLabel}
                </div>
              </div>
            )}
            {error && (
              <div
                className="mono"
                style={{ marginTop: 12, color: 'var(--neg)', fontSize: 11 }}
              >
                {error}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {drag ? 'Release to upload' : 'Drop strategy.zip here'}
            </div>
            <div style={{ color: 'var(--fg-2)', fontSize: 12, marginTop: 4 }}>
              or{' '}
              <span
                style={{ color: 'var(--fg-0)', textDecoration: 'underline' }}
              >
                browse files
              </span>{' '}
              · max 50 MB
            </div>
            {error && (
              <div
                className="mono"
                style={{ marginTop: 12, color: 'var(--neg)', fontSize: 11 }}
              >
                {error}
              </div>
            )}
          </>
        )}
      </div>

      {file && !uploading && (
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn" onClick={reset}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={startUpload}>
            <Icon name="upload" size={14} />
            Upload & evaluate
          </button>
        </div>
      )}

      <div
        style={{
          marginTop: 22,
          padding: 16,
          background: 'var(--bg-0)',
          borderRadius: 6,
          border: '1px solid var(--line-soft)',
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 10,
            color: 'var(--fg-2)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          Expected structure
        </div>
        <pre
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: 11.5,
            color: 'var(--fg-1)',
            lineHeight: 1.7,
          }}
        >
{`strategy.zip
├── strategy.py        ← must define on_bar(ctx, bar)
├── requirements.txt   ← optional deps (py3.11)
├── config.yaml        ← hyperparams (optional)
└── README.md          ← team name, method summary`}
        </pre>
      </div>
    </>
  );
}
