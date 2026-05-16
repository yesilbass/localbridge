import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { useProfileHealth } from './dashboardHooks.js';
import { useContent } from '../../content';

function CircularGauge({ score, animate }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const target = c * (1 - score / 100);
  const [offset, setOffset] = useState(animate ? c : target);

  useEffect(() => {
    if (!animate) { setOffset(target); return undefined; }
    const start = performance.now();
    const duration = 800;
    let raf = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setOffset(c + (target - c) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, animate, c]);

  return (
    <div className="relative grid h-24 w-24 place-items-center sm:h-28 sm:w-28">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50" cy="50" r={r}
          stroke="var(--bridge-border-strong)"
          strokeWidth="8" fill="none"
        />
        <circle
          cx="50" cy="50" r={r}
          stroke="var(--color-primary)"
          strokeWidth="8" fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 200ms linear' }}
        />
      </svg>
      <span
        className="pointer-events-none absolute inset-0 grid place-items-center font-display text-[20px] font-black tabular-nums"
        style={{ color: 'var(--bridge-text)' }}
      >
        {score}%
      </span>
    </div>
  );
}

export default function ProfileHealthCard() {
  const { s } = useContent();
  const { score, breakdown, isLoading } = useProfileHealth();
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (isLoading) {
    return (
      <section
        className="rounded-3xl p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <div className="bridge-skeleton mb-4 h-3 w-32 rounded" />
        <div className="flex items-center gap-6">
          <div className="bridge-skeleton h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="bridge-skeleton h-3 w-3/4 rounded" />
            <div className="bridge-skeleton h-3 w-2/3 rounded" />
            <div className="bridge-skeleton h-3 w-4/5 rounded" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="health-heading"
      className="rounded-3xl p-6 sm:p-8"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="health-heading"
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          {s.dashboard.profileCompletion}
        </h2>
        <span className="text-[14px] font-bold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
          {score}/100
        </span>
      </div>

      <div className="mt-4 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <CircularGauge score={score} animate={!reduce} />
        <ul className="flex flex-1 flex-col gap-2">
          {breakdown.map((item) => (
            <li key={item.key} className="flex items-center gap-2 text-[13px]">
              {item.done
                ? <CheckCircle2 aria-hidden className="h-4 w-4 shrink-0" style={{ color: 'var(--color-success)' }} />
                : <Circle aria-hidden className="h-4 w-4 shrink-0" style={{ color: 'var(--bridge-text-muted)' }} />}
              <span
                className="flex-1 truncate font-semibold"
                style={{
                  color: item.done ? 'var(--bridge-text-muted)' : 'var(--bridge-text-secondary)',
                  textDecoration: item.done ? 'line-through' : 'none',
                }}
              >
                {item.label}
              </span>
              {!item.done && (
                <Link
                  to={item.hrefMissing}
                  className="bridge-focus rounded-md text-[11px] font-bold uppercase tracking-[0.12em] hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Fix
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
