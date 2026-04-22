'use client';

import { useId } from 'react';

type Props = {
  equity: number[];
  width?: number;
  height?: number;
};

export function DrawdownChart({ equity, width = 600, height = 140 }: Props) {
  let peak = equity[0];
  const dd = equity.map((v) => {
    peak = Math.max(peak, v);
    return (v - peak) / peak;
  });
  const min = Math.min(...dd) || -1;
  const padding = { top: 10, right: 16, bottom: 24, left: 44 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;
  const step = w / (dd.length - 1);

  const linePath = dd
    .map((v, i) => {
      const x = padding.left + i * step;
      const y = padding.top + (v / min) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const areaPath = linePath + ` L${padding.left + w},${padding.top} L${padding.left},${padding.top} Z`;

  const gradId = useId();

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
      role="img"
      aria-label="drawdown curve"
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--neg)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="var(--neg)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <line
          key={i}
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + h * f}
          y2={padding.top + h * f}
          stroke="var(--line-soft)"
          strokeWidth="1"
          strokeDasharray={i === 0 ? '0' : '2 3'}
        />
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <text
          key={i}
          x={padding.left - 8}
          y={padding.top + h * f + 3}
          fill="var(--fg-2)"
          fontSize="10"
          textAnchor="end"
          fontFamily="var(--font-mono)"
        >
          {(min * f * 100).toFixed(1)}%
        </text>
      ))}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke="var(--neg)" strokeWidth="1.2" />
    </svg>
  );
}
