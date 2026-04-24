'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';

export function TweaksPanel() {
  const [open, setOpen] = useState(false);
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle dev tweaks"
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'var(--bg-2)',
          border: '1px solid var(--line)',
          color: 'var(--fg-1)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          zIndex: 50,
        }}
      >
        <Icon name="sliders" size={14} />
      </button>
      {open && (
        <aside
          aria-label="Dev tweaks"
          style={{
            position: 'fixed',
            bottom: 60,
            right: 16,
            width: 240,
            padding: 14,
            background: 'var(--bg-1)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            zIndex: 50,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: 'var(--fg-2)',
              marginBottom: 8,
            }}
          >
            Dev tweaks
          </div>
          <p className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', margin: 0 }}>
            Placeholder for theme + density toggles.
          </p>
        </aside>
      )}
    </>
  );
}
