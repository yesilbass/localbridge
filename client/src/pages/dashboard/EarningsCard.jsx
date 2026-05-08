import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useEarningsSummary, formatCurrency } from './dashboardHooks.js';

function useCountUp(target, duration = 600, enabled = true) {
  const [value, setValue] = useState(enabled ? 0 : target);
  const startedRef = useRef(false);
  useEffect(() => {
    if (!enabled) { setValue(target); return undefined; }
    if (!Number.isFinite(target)) { setValue(0); return undefined; }
    if (startedRef.current === target) return undefined;
    startedRef.current = target;
    const start = performance.now();
    const from = 0;
    let raf = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      // ease out per landing EASE
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);
  return value;
}

function Sparkline({ data, animate }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <div className="relative">
      <div className="flex h-16 items-end gap-1">
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          const heightPct = (d.total / max) * 100;
          return (
            <button
              type="button"
              key={d.month + i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="bridge-focus relative flex-1 rounded-t transition-colors"
              style={{
                height: '100%',
                alignSelf: 'flex-end',
              }}
              aria-label={`${d.month}: $${formatCurrency(d.total)}`}
            >
              <span
                aria-hidden
                className="block w-full rounded-t"
                style={{
                  height: `${heightPct}%`,
                  minHeight: '3px',
                  backgroundColor: hover === i
                    ? 'var(--bridge-text)'
                    : isLast
                      ? 'var(--color-primary)'
                      : 'var(--bridge-text-muted)',
                  transformOrigin: 'bottom',
                  transform: animate ? 'scaleY(0)' : 'scaleY(1)',
                  animation: animate ? `bridgeSparkRise 600ms cubic-bezier(0.16,1,0.3,1) ${i * 60 + 200}ms forwards` : 'none',
                  transition: 'background-color 200ms ease',
                }}
              />
            </button>
          );
        })}
      </div>
      {hover !== null && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-9 z-10 rounded-lg px-2 py-1 text-[11px] font-semibold tabular-nums shadow-bridge-glow"
          style={{
            backgroundColor: 'var(--bridge-surface-raised)',
            color: 'var(--bridge-text)',
            border: '1px solid var(--bridge-border-strong)',
            left: `${(hover + 0.5) * (100 / data.length)}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {data[hover].month} · ${formatCurrency(data[hover].total)}
        </div>
      )}
      <style>{`
        @keyframes bridgeSparkRise {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-spark-animate] { animation: none !important; transform: scaleY(1) !important; }
        }
      `}</style>
    </div>
  );
}

function TrendChip({ pct }) {
  if (pct > 0) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-success) 14%, transparent)',
          color: 'var(--color-success)',
        }}
      >
        <TrendingUp className="h-3 w-3" aria-hidden /> +{pct}%
      </span>
    );
  }
  if (pct < 0) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-warning) 14%, transparent)',
          color: 'var(--color-warning)',
        }}
      >
        <TrendingDown className="h-3 w-3" aria-hidden /> {pct}%
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums"
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        color: 'var(--bridge-text-muted)',
      }}
    >
      Flat
    </span>
  );
}

export default function EarningsCard() {
  const summary = useEarningsSummary();
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const animateNumbers = !reduce && !summary.isLoading;
  const value = useCountUp(summary.thisMonth, 600, animateNumbers);

  return (
    <section
      aria-labelledby="earnings-heading"
      className="rounded-3xl p-6 shadow-bridge-card sm:p-8"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2
          id="earnings-heading"
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Earnings
        </h2>
        <span className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>This month</span>
      </div>

      <div className="mt-2 flex items-baseline gap-3">
        <span
          className="font-display tabular-nums leading-none"
          style={{
            fontSize: 'clamp(44px, 6vw, 56px)',
            fontWeight: 900,
            color: 'var(--bridge-text)',
            letterSpacing: '-0.025em',
          }}
        >
          ${formatCurrency(value)}
        </span>
        <TrendChip pct={summary.trendPct} />
      </div>

      <p className="mt-1 text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
        vs ${formatCurrency(summary.lastMonth)} last month
      </p>

      {summary.streakLine && (
        <p
          className="mt-2 font-display italic"
          style={{
            fontSize: '13px',
            color: 'var(--bridge-text-secondary)',
          }}
        >
          {summary.streakLine}
        </p>
      )}

      <div className="mt-5" data-spark-animate>
        {summary.monthlyHistory.length > 0 && (
          <Sparkline data={summary.monthlyHistory} animate={animateNumbers} />
        )}
      </div>

      <div
        className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl"
        style={{ backgroundColor: 'var(--bridge-border)' }}
      >
        {[
          { label: 'Pending payout', value: summary.pendingPayout },
          { label: 'Lifetime', value: summary.lifetime },
          { label: 'Avg / session', value: summary.avgPerSession },
        ].map((cell) => (
          <div
            key={cell.label}
            className="flex flex-col gap-1 p-4"
            style={{ backgroundColor: 'var(--bridge-surface)' }}
          >
            <span
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              {cell.label}
            </span>
            <span
              className="text-[18px] font-black tabular-nums"
              style={{ color: 'var(--bridge-text)' }}
            >
              ${formatCurrency(cell.value)}
            </span>
          </div>
        ))}
      </div>

      <Link
        to="/dashboard/earnings"
        className="bridge-focus mt-4 inline-block rounded-md text-[12px] font-semibold transition-colors hover:underline"
        style={{ color: 'var(--color-primary)' }}
      >
        View payout history →
      </Link>
    </section>
  );
}
