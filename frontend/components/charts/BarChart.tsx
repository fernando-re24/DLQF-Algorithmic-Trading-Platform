type Props = {
  data: number[];
  labels?: string[];
  width?: number;
  height?: number;
  color?: string;
};

export function BarChart({ data, labels, width = 600, height = 160, color = 'var(--accent)' }: Props) {
  const max = Math.max(...data.map(Math.abs)) || 1;
  const padding = { top: 10, right: 16, bottom: 28, left: 44 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;
  const bw = (w / data.length) * 0.7;
  const gap = (w / data.length) * 0.3;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
      role="img"
      aria-label="bar chart"
    >
      {[0, 0.5, 1].map((f, i) => (
        <line
          key={i}
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + h * f}
          y2={padding.top + h * f}
          stroke="var(--line-soft)"
          strokeDasharray="2 3"
        />
      ))}
      {[0, 0.5, 1].map((f, i) => (
        <text
          key={i}
          x={padding.left - 8}
          y={padding.top + h * f + 3}
          fill="var(--fg-2)"
          fontSize="10"
          textAnchor="end"
          fontFamily="var(--font-mono)"
        >
          {(max * (1 - f)).toFixed(1)}
        </text>
      ))}
      {data.map((v, i) => {
        const bh = (Math.abs(v) / max) * h;
        const x = padding.left + i * (bw + gap) + gap / 2;
        const y = padding.top + h - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} fill={v < 0 ? 'var(--neg)' : color} rx="2" />
            {labels && (
              <text
                x={x + bw / 2}
                y={padding.top + h + 14}
                fill="var(--fg-2)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
