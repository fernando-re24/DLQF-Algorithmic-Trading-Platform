'use client';

import { useEffect, useRef } from 'react';
import { LineChart } from './LineChart';

type Props = React.ComponentProps<typeof LineChart>;

export function AnimatedLineChart({ data, ...props }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const paths = ref.current?.querySelectorAll('path');
    if (!paths) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    paths.forEach((p) => {
      if (p.getAttribute('fill') !== 'none') return;
      const len = (p as SVGPathElement).getTotalLength();
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = reduceMotion ? '0' : String(len);
      p.getBoundingClientRect();
      p.style.transition = reduceMotion ? 'none' : 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)';
      p.style.strokeDashoffset = '0';
    });
  }, [data]);

  return (
    <div ref={ref}>
      <LineChart data={data} {...props} />
    </div>
  );
}
