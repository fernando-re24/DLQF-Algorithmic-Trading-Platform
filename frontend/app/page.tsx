import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { Sparkline } from '@/components/charts/Sparkline';
import { genEquity } from '@/lib/chart-utils';

const PROJECT = 'spring-2026';

export default function LandingPage() {
  const heroEquity = genEquity(42, 140, 1.0, 0.01, 0.0012);
  const leaderboardEquity = [
    { name: 'Stochastic Gradient', sharpe: 2.84, data: genEquity(11, 60, 1.0, 0.009, 0.0015) },
    { name: 'Latent Alpha', sharpe: 2.71, data: genEquity(22, 60, 1.0, 0.01, 0.0014) },
    { name: 'Kernel Drift', sharpe: 2.48, data: genEquity(33, 60, 1.0, 0.011, 0.0012) },
  ];

  const steps = [
    {
      n: '01',
      t: 'Download training data',
      d: 'Six years of minute-bar equities data, corporate actions adjusted. 4.2 GB parquet.',
      icon: 'download' as const,
    },
    {
      n: '02',
      t: 'Submit trading strategy',
      d: 'Package as ZIP or link a GitHub repo. Python 3.11, any package, deterministic seed required.',
      icon: 'upload' as const,
    },
    {
      n: '03',
      t: 'Get evaluated on hidden data',
      d: 'Your container runs against the out-of-sample regime. Tearsheet + leaderboard rank in seconds.',
      icon: 'play' as const,
    },
  ];

  return (
    <>
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-inner">
          <div>
            <span className="eyebrow">
              <span
                className="dot"
                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pos)' }}
                aria-hidden="true"
              ></span>
              SPRING 2026 · REGISTRATION OPEN
            </span>
            <h1>DLQF Algorithmic Trading Challenge</h1>
            <p>
              Compete. Backtest. Generalize. Submit containerized strategies, get evaluated on a hidden
              out-of-sample market regime. Generalization is the only alpha that matters.
            </p>
            <div className="h-row" style={{ gap: 10 }}>
              <Link href={`/projects/${PROJECT}/jobs`} className="btn btn-primary">
                View Active Challenge <Icon name="arrow_right" size={14} />
              </Link>
              <Link href={`/projects/${PROJECT}/jobs/new`} className="btn">
                <Icon name="upload" size={14} /> Submit Strategy
              </Link>
            </div>
            <div
              style={{
                marginTop: 36,
                display: 'flex',
                gap: 28,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--fg-2)',
                textTransform: 'uppercase',
                letterSpacing: 1.2,
              }}
            >
              <div>
                <span
                  style={{ color: 'var(--fg-0)', fontSize: 18, display: 'block', letterSpacing: 0 }}
                >
                  312
                </span>
                teams active
              </div>
              <div>
                <span
                  style={{ color: 'var(--fg-0)', fontSize: 18, display: 'block', letterSpacing: 0 }}
                >
                  8,421
                </span>
                submissions
              </div>
              <div>
                <span
                  style={{ color: 'var(--fg-0)', fontSize: 18, display: 'block', letterSpacing: 0 }}
                >
                  $50K
                </span>
                prize pool
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-1)' }}>
            <div className="card-head">
              <div>
                <div className="card-title">Live leaderboard · top 3</div>
                <div className="card-sub mono">Hidden period · 2025-Q4</div>
              </div>
              <span className="badge badge-running">
                <span className="dot" aria-hidden="true"></span>LIVE
              </span>
            </div>
            <div style={{ padding: '8px 12px 0' }}>
              <AnimatedLineChart data={heroEquity} height={180} color="var(--pos)" showAxes={true} />
            </div>
            <div style={{ borderTop: '1px solid var(--line-soft)' }}>
              {leaderboardEquity.map((t, i) => (
                <div
                  key={t.name}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr auto auto',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 18px',
                    borderBottom: i < 2 ? '1px solid var(--line-soft)' : 'none',
                  }}
                >
                  <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>
                    0{i + 1}
                  </span>
                  <span style={{ fontSize: 13 }}>{t.name}</span>
                  <Sparkline data={t.data} width={80} height={22} />
                  <span
                    className="num"
                    style={{
                      fontSize: 13,
                      color: 'var(--pos)',
                      minWidth: 48,
                      textAlign: 'right',
                    }}
                  >
                    {t.sharpe.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page" style={{ paddingTop: 64 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div>
            <div
              className="mono"
              style={{
                fontSize: 11,
                color: 'var(--fg-2)',
                textTransform: 'uppercase',
                letterSpacing: 1.4,
              }}
            >
              § 01 · The problem
            </div>
            <h2 style={{ fontSize: 28, margin: '8px 0', letterSpacing: -0.8, fontWeight: 600 }}>
              Overfitting wins in-sample. Generalization wins in production.
            </h2>
          </div>
        </div>

        <div className="feat-grid">
          <div className="feat">
            <div className="feat-num">01 / 03</div>
            <div style={{ color: 'var(--fg-0)', marginTop: 12 }}>
              <Icon name="lock" size={20} />
            </div>
            <h3>Hidden test period</h3>
            <p>
              Training data covers 2019 to 2024. Evaluation runs on a held-out 2025 regime you never see.
              Grid-search to your heart&apos;s content.
            </p>
          </div>
          <div className="feat">
            <div className="feat-num">02 / 03</div>
            <div style={{ color: 'var(--fg-0)', marginTop: 12 }}>
              <Icon name="chip" size={20} />
            </div>
            <h3>Realistic market simulation</h3>
            <p>
              Per-bar fills with Almgren slippage, 0.5 bps commission, T+1 settlement, borrow fees, and
              circuit-breaker halts. No look-ahead.
            </p>
          </div>
          <div className="feat">
            <div className="feat-num">03 / 03</div>
            <div style={{ color: 'var(--fg-0)', marginTop: 12 }}>
              <Icon name="refresh" size={20} />
            </div>
            <h3>Automated scoring pipeline</h3>
            <p>
              Containerized sandbox, deterministic seeds, distributed runners. Submission to scored
              tearsheet in under 30 seconds.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 72 }}>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: 'var(--fg-2)',
              textTransform: 'uppercase',
              letterSpacing: 1.4,
            }}
          >
            § 02 · How it works
          </div>
          <h2 style={{ fontSize: 28, margin: '8px 0 32px', letterSpacing: -0.8, fontWeight: 600 }}>
            Three steps from notebook to leaderboard.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 32px 1fr 32px 1fr',
              gap: 0,
              alignItems: 'stretch',
            }}
          >
            {steps.map((s, i) => (
              <StepGroup key={s.n} step={s} index={i} />
            ))}
          </div>
        </div>

        <div
          className="card"
          style={{
            marginTop: 72,
            padding: '32px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <div>
            <h3 style={{ fontSize: 22, margin: '0 0 6px', letterSpacing: -0.5 }}>
              Code freeze in 12d 04h
            </h3>
            <p style={{ color: 'var(--fg-2)', margin: 0 }}>
              Final scoring runs 2026-05-02 at 16:00 UTC. Unlimited submissions until then.
            </p>
          </div>
          <div className="h-row">
            <Link href={`/projects/${PROJECT}/leaderboard`} className="btn">
              View leaderboard
            </Link>
            <Link href={`/projects/${PROJECT}/jobs/new`} className="btn btn-primary">
              Submit strategy <Icon name="arrow_right" size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

type Step = {
  n: string;
  t: string;
  d: string;
  icon: 'download' | 'upload' | 'play';
};

function StepGroup({ step, index }: { step: Step; index: number }) {
  return (
    <>
      {index > 0 && (
        <div style={{ display: 'grid', placeItems: 'center', color: 'var(--fg-3)' }}>
          <Icon name="arrow_right" size={18} />
        </div>
      )}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--fg-2)' }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: 1.4 }}>
            STEP {step.n}
          </span>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'var(--bg-2)',
            border: '1px solid var(--line)',
            display: 'grid',
            placeItems: 'center',
            margin: '18px 0 14px',
          }}
        >
          <Icon name={step.icon} size={18} />
        </div>
        <h3 style={{ fontSize: 16, margin: '0 0 6px', fontWeight: 600, letterSpacing: -0.2 }}>
          {step.t}
        </h3>
        <p style={{ color: 'var(--fg-2)', fontSize: 13, margin: 0, lineHeight: 1.55 }}>{step.d}</p>
      </div>
    </>
  );
}
