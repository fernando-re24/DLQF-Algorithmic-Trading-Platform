'use client';

import { useState, type ChangeEvent, type DragEvent } from 'react';
import { Icon } from '@/components/Icon';

type FileMeta = { name: string; size: string };

export function UploadDropzone() {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<FileMeta | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  const toMeta = (f: File): FileMeta => ({
    name: f.name,
    size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
  });

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(toMeta(f));
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(toMeta(f));
  };

  const startUpload = () => {
    setUploading(true);
    setUploadPct(0);
    const t = setInterval(() => {
      setUploadPct((p) => {
        if (p >= 100) {
          clearInterval(t);
          setUploading(false);
          setFile(null);
          return 0;
        }
        return p + 3 + Math.random() * 4;
      });
    }, 80);
  };

  return (
    <>
      <div
        className={`dropzone ${drag ? 'drag' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        role="region"
        aria-label="Upload strategy zip"
      >
        <div className="dropzone-icon">
          <Icon name="upload" size={20} />
        </div>
        {file ? (
          <>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{file.name}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 4 }}>
              {file.size}
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
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 6 }}>
                  Uploading · {uploadPct.toFixed(0)}%
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Drop strategy.zip here</div>
            <div style={{ color: 'var(--fg-2)', fontSize: 12, marginTop: 4 }}>
              or{' '}
              <label style={{ color: 'var(--fg-0)', textDecoration: 'underline', cursor: 'pointer' }}>
                browse files
                <input type="file" accept=".zip" style={{ display: 'none' }} onChange={onPick} />
              </label>{' '}
              · max 50 MB
            </div>
          </>
        )}
      </div>

      {file && !uploading && (
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn" onClick={() => setFile(null)}>
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
