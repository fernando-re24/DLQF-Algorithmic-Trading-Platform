export type Team = {
  rank: number;
  team: string;
  sharpe: number;
  maxdd: number;
  ret: number;
  turnover: number;
  seed: number;
  delta: number;
  isYou?: boolean;
};

export type Submission = {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  trainSharpe: number | null;
  hiddenSharpe: number | null;
  ts: string;
  fname: string;
  size: string;
  progress?: number;
  queuePos?: number;
  error?: string;
};

export type LogLine = {
  t: string;
  l: 'INFO' | 'OK' | 'WARN' | 'ERR';
  m: string;
};

export const TEAMS: Team[] = [
  { rank: 1, team: 'Stochastic Gradient', sharpe: 2.84, maxdd: -6.2, ret: 41.3, turnover: 1.2, seed: 11, delta: 0 },
  { rank: 2, team: 'Latent Alpha', sharpe: 2.71, maxdd: -7.8, ret: 38.9, turnover: 2.1, seed: 22, delta: 1 },
  { rank: 3, team: 'Kernel Drift', sharpe: 2.48, maxdd: -9.1, ret: 35.2, turnover: 0.9, seed: 33, delta: -1 },
  { rank: 4, team: 'Overfit United', sharpe: 2.39, maxdd: -11.4, ret: 37.0, turnover: 4.3, seed: 44, delta: 2 },
  { rank: 5, team: 'Vol Surface', sharpe: 2.31, maxdd: -8.3, ret: 29.7, turnover: 1.8, seed: 55, delta: 0 },
  { rank: 6, team: 'Mean Reverters', sharpe: 2.18, maxdd: -10.2, ret: 28.4, turnover: 2.6, seed: 66, delta: -2 },
  { rank: 7, team: 'DLQF-YOU', sharpe: 2.09, maxdd: -9.7, ret: 26.1, turnover: 1.4, seed: 77, delta: 3, isYou: true },
  { rank: 8, team: 'Bayes & Confused', sharpe: 1.97, maxdd: -12.1, ret: 24.8, turnover: 3.1, seed: 88, delta: 0 },
  { rank: 9, team: 'Gamma Squeeze', sharpe: 1.88, maxdd: -14.0, ret: 27.3, turnover: 5.2, seed: 99, delta: -1 },
  { rank: 10, team: 'Shrinkage Estimators', sharpe: 1.75, maxdd: -11.8, ret: 21.4, turnover: 1.9, seed: 110, delta: 1 },
  { rank: 11, team: 'Hull-White', sharpe: 1.62, maxdd: -13.4, ret: 19.8, turnover: 2.2, seed: 121, delta: 0 },
  { rank: 12, team: 'Tail Risk Collective', sharpe: 1.54, maxdd: -15.1, ret: 22.5, turnover: 3.8, seed: 132, delta: 2 },
  { rank: 13, team: 'Kalman Filters', sharpe: 1.41, maxdd: -12.9, ret: 17.2, turnover: 1.1, seed: 143, delta: -3 },
  { rank: 14, team: 'Alpha Decay Labs', sharpe: 1.33, maxdd: -16.8, ret: 20.1, turnover: 4.6, seed: 154, delta: 0 },
  { rank: 15, team: 'Stationary Processes', sharpe: 1.22, maxdd: -14.2, ret: 15.9, turnover: 0.8, seed: 165, delta: 1 },
  { rank: 16, team: 'Regime Switch', sharpe: 1.1, maxdd: -17.5, ret: 18.4, turnover: 3.3, seed: 176, delta: -1 },
  { rank: 17, team: 'Pairs Trading LLC', sharpe: 0.98, maxdd: -15.8, ret: 13.2, turnover: 2.0, seed: 187, delta: 0 },
  { rank: 18, team: 'Stop Loss', sharpe: 0.84, maxdd: -18.3, ret: 11.7, turnover: 4.1, seed: 198, delta: -2 },
];

export const SUBMISSIONS: Submission[] = [
  { id: 'sub_8f3a1c', status: 'completed', trainSharpe: 2.41, hiddenSharpe: 2.09, ts: '2026-04-19 14:22:08', fname: 'momentum_v12.zip', size: '3.4 MB' },
  { id: 'sub_8d21e4', status: 'running', trainSharpe: 2.38, hiddenSharpe: null, ts: '2026-04-19 13:04:52', fname: 'momentum_v11.zip', size: '3.4 MB', progress: 0.62 },
  { id: 'sub_8c0915', status: 'completed', trainSharpe: 2.22, hiddenSharpe: 1.88, ts: '2026-04-18 19:41:11', fname: 'ensemble_rev3.zip', size: '4.1 MB' },
  { id: 'sub_8b77aa', status: 'failed', trainSharpe: null, hiddenSharpe: null, ts: '2026-04-18 17:02:29', fname: 'ensemble_rev2.zip', size: '4.0 MB', error: 'ImportError: no module named torch' },
  { id: 'sub_8a4132', status: 'completed', trainSharpe: 1.97, hiddenSharpe: 1.71, ts: '2026-04-17 21:18:04', fname: 'baseline_mr.zip', size: '2.8 MB' },
  { id: 'sub_89ffd0', status: 'queued', trainSharpe: null, hiddenSharpe: null, ts: '2026-04-19 14:40:12', fname: 'momentum_v13.zip', size: '3.5 MB', queuePos: 2 },
  { id: 'sub_891e7b', status: 'completed', trainSharpe: 1.44, hiddenSharpe: 1.28, ts: '2026-04-16 11:32:51', fname: 'momentum_v9.zip', size: '3.2 MB' },
];

export const LOG_LINES: LogLine[] = [
  { t: '14:22:08.142', l: 'INFO', m: '→ pulling image dlqf/runner:2.4.1 (sha256:a8f…)' },
  { t: '14:22:09.681', l: 'INFO', m: 'container spawned · cpu=4 · mem=8Gi · net=none' },
  { t: '14:22:09.944', l: 'INFO', m: 'extracting submission sub_8f3a1c (3.4 MB)' },
  { t: '14:22:10.312', l: 'INFO', m: 'detected strategy.py · entrypoint=on_bar(ctx, bar)' },
  { t: '14:22:10.480', l: 'OK', m: 'deps resolved from requirements.txt (9 packages)' },
  { t: '14:22:11.025', l: 'INFO', m: 'loading hidden dataset shard 01/04 · 2025-01 → 2025-03' },
  { t: '14:22:11.891', l: 'INFO', m: 'warmup window: 60 bars · starting simulation' },
  { t: '14:22:15.423', l: 'WARN', m: 'shard 01 complete · 2 orders rejected (insufficient margin)' },
  { t: '14:22:15.620', l: 'INFO', m: 'loading hidden dataset shard 02/04 · 2025-04 → 2025-06' },
  { t: '14:22:19.004', l: 'INFO', m: 'shard 02 complete · PnL=+1.84% · turnover=0.31' },
  { t: '14:22:19.210', l: 'INFO', m: 'loading hidden dataset shard 03/04 · 2025-07 → 2025-09' },
  { t: '14:22:22.788', l: 'WARN', m: 'circuit breaker triggered 2025-08-14 · paused 1 bar' },
  { t: '14:22:23.502', l: 'INFO', m: 'shard 03 complete · PnL=+3.21% · turnover=0.29' },
  { t: '14:22:23.711', l: 'INFO', m: 'loading hidden dataset shard 04/04 · 2025-10 → 2025-12' },
  { t: '14:22:27.194', l: 'INFO', m: 'shard 04 complete · PnL=+2.09% · turnover=0.33' },
  { t: '14:22:27.301', l: 'INFO', m: 'computing tearsheet · 252 trading days' },
  { t: '14:22:27.640', l: 'OK', m: 'artifacts written · metrics.json (4.1 KB) · trades.csv (812 KB)' },
  { t: '14:22:27.702', l: 'OK', m: '✓ evaluation complete · hidden_sharpe=2.09 · elapsed=19.6s' },
];
