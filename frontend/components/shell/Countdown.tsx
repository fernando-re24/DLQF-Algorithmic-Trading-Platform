'use client';

import { useEffect, useState } from 'react';

type Props = { target: number };

export function Countdown({ target }: Props) {
  const [now, setNow] = useState(() => target);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const ms = Math.max(0, target - now);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="countdown" role="timer" aria-live="off">
      {[
        [pad(d), 'days'],
        [pad(h), 'hrs'],
        [pad(m), 'min'],
        [pad(s), 'sec'],
      ].map(([v, l]) => (
        <div key={l} className="countdown-unit">
          <div className="countdown-val">{v}</div>
          <div className="countdown-lbl">{l}</div>
        </div>
      ))}
    </div>
  );
}
