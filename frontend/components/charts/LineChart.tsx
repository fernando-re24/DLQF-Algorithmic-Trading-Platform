'use client';

import { useId } from 'react';

type Padding = { top: number; right: number; bottom: number; left: number };

type Props = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  showAxes?: boolean;
  showGrid?: boolean;
  label?: string;
  padding?: Padding;
};

export function LineChart({
  data,
  width = 600,
  height = 200,
  color,
  fill = true,
  showAxes = true,
  showGrid = true,
  label,
  padding,
}: Props) {
  const pad: Padding = padding ?? {
    top: 16,
    right: 16,
    bottom: showAxes ? 24 : 8,
    left: showAxes ? 44 : 8,
  };

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const xStep = w / (data.length - 1);
  const points: [number, number][] = data.map((v, i) => [
    pad.left + i * xStep,
    pad.top + h - ((v - min) / range) * h,
  ]);

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
    .join(' ');
  const areaPath =
    path +
    ` L${points[points.length - 1][0].toFixed(2)},${pad.top + h} L${points[0][0].toFixed(2)},${pad.top + h} Z`;

  const stroke = color ?? 'var(--pos)';
  const gridLines = 4;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => min + (range * i) / gridLines);

  const gradId = useId();

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
      role="img"
      aria-label={label ?? 'line chart'}
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showGrid &&
        yTicks.map((_, i) => (
          <line
            key={i}
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + h - (h * i) / gridLines}
            y2={pad.top + h - (h * i) / gridLines}
            stroke="var(--line-soft)"
            strokeWidth="1"
            strokeDasharray={i === 0 ? '0' : '2 3'}
          />
        ))}
      {showAxes &&
        yTicks.map((t, i) => (
          <text
            key={i}
            x={pad.left - 8}
            y={pad.top + h - (h * i) / gridLines + 3}
            fill="var(--fg-2)"
            fontSize="10"
            textAnchor="end"
            fontFamily="var(--font-mono)"
          >
            {t.toFixed(2)}
          </text>
        ))}
      {fill && <path d={areaPath} fill={`url(#${gradId})`} />}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {label && (
        <text x={pad.left} y={pad.top - 4} fontSize="10" fill="var(--fg-2)" fontFamily="var(--font-mono)">
          {label}
        </text>
      )}
    </svg>
  );
}
