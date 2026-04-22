export const seededRng = (seed: number): (() => number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

export const genEquity = (
  seed: number,
  n = 120,
  startVal = 1.0,
  vol = 0.012,
  drift = 0.0008,
): number[] => {
  const rng = seededRng(seed);
  const pts: number[] = [startVal];
  for (let i = 1; i < n; i++) {
    const shock = (rng() - 0.5) * 2 * vol + drift;
    pts.push(pts[i - 1] * (1 + shock));
  }
  return pts;
};
