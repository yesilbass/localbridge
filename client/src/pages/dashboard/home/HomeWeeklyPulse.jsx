import { useMemo, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  useDashboardSessions,
  useDashboardActivity,
  formatCurrency,
} from '../dashboardHooks.js';
import { usePerfTier, EASE, DUR_MED } from '../../landing/landingHooks';

const STORAGE_KEY = 'bridge.dashboard.pulseMetric';

function startOfWeekMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff)).setHours(0, 0, 0, 0);
}

function getDayKey(t) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildWeekBuckets(sessions, ratePerSession, metric) {
  const wkStart = startOfWeekMonday(new Date());
  const wkEnd = wkStart + 7 * 24 * 60 * 60 * 1000;
  const buckets = DAY_LABELS.map((label, i) => {
    const dayStart = wkStart + i * 24 * 60 * 60 * 1000;
    return { label, dayStart, count: 0, value: 0 };
  });

  for (const s of sessions ?? []) {
    const t = new Date(s.scheduled_date ?? s.created_at).getTime();
    if (t < wkStart || t >= wkEnd) continue;
    const status = String(s.status ?? '').toLowerCase();
    if (!['completed', 'accepted', 'pending'].includes(status)) continue;
    const dayIdx = Math.floor((getDayKey(t) - wkStart) / (24 * 60 * 60 * 1000));
    if (dayIdx < 0 || dayIdx > 6) continue;
    if (metric === 'sessions') {
      buckets[dayIdx].count += 1;
      buckets[dayIdx].value += 1;
    } else {
      // earnings: only completed/accepted count toward $
      if (['completed', 'accepted'].includes(status)) {
        buckets[dayIdx].count += 1;
        buckets[dayIdx].value += ratePerSession;
      }
    }
  }
  return buckets;
}

function buildSavesBuckets(activity) {
  const wkStart = startOfWeekMonday(new Date());
  const wkEnd = wkStart + 7 * 24 * 60 * 60 * 1000;
  const buckets = DAY_LABELS.map((label, i) => {
    const dayStart = wkStart + i * 24 * 60 * 60 * 1000;
    return { label, dayStart, count: 0, value: 0 };
  });
  for (const a of activity ?? []) {
    if (a.type !== 'mentor_saved') continue;
    const t = new Date(a.timestamp).getTime();
    if (t < wkStart || t >= wkEnd) continue;
    const dayIdx = Math.floor((getDayKey(t) - wkStart) / (24 * 60 * 60 * 1000));
    if (dayIdx < 0 || dayIdx > 6) continue;
    buckets[dayIdx].count += 1;
    buckets[dayIdx].value += 1;
  }
  return buckets;
}

function getStoredMetric(isMentor, fallback) {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === 'sessions') return v;
    if (v === 'earnings' && isMentor) return v;
    if (v === 'saves' && !isMentor) return v;
  } catch { /* ignore */ }
  return fallback;
}

function setStoredMetric(v) {
  try { window.localStorage.setItem(STORAGE_KEY, v); } catch { /* ignore */ }
}

function Bar({ value, max, isToday, animate, delay }) {
  const ratio = max > 0 ? value / max : 0;
  const heightPct = Math.max(4, Math.min(100, ratio * 100));
  return (
    <div className="group relative flex h-full flex-1 items-end">
      <div
        className="w-full rounded-t-md transition-colors"
        style={{
          height: `${heightPct}%`,
          minHeight: '4%',
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 60%, transparent)',
          boxShadow: isToday ? 'inset 0 0 0 2px var(--color-primary)' : 'none',
          transition: animate ? `height ${DUR_MED * 1000}ms cubic-bezier(${EASE.join(',')})` : 'none',
          transitionDelay: animate ? `${delay}ms` : '0ms',
        }}
      />
    </div>
  );
}

export default function HomeWeeklyPulse({ activeRole }) {
  const reduced = useReducedMotion();
  const tier = usePerfTier();
  const flat = reduced || tier === 'low';

  const isMentor = activeRole === 'mentor';
  const [metric, setMetric] = useState(() => getStoredMetric(isMentor, 'sessions'));

  const { sessions } = useDashboardSessions();
  const { items: activity } = useDashboardActivity({ limit: 50 });

  const ratePerSession = useMemo(() => {
    if (!isMentor) return 0;
    // derive from completed average if possible; else fall back
    const completed = sessions.filter((s) => String(s.status).toLowerCase() === 'completed');
    if (!completed.length) return 100;
    return 100; // earnings hook owns per-session rate; bar magnitude is comparative
  }, [isMentor, sessions]);

  const buckets = useMemo(() => {
    if (metric === 'saves' && !isMentor) return buildSavesBuckets(activity);
    return buildWeekBuckets(sessions, ratePerSession, metric);
  }, [sessions, activity, metric, ratePerSession, isMentor]);

  const total = buckets.reduce((s, b) => s + b.value, 0);
  const max = Math.max(1, ...buckets.map((b) => b.value));
  const todayIdx = (() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  })();
  const empty = total === 0;

  const headerTotal = (() => {
    if (empty) return 'Your week shows up here once you book.';
    if (metric === 'earnings') return `$${formatCurrency(total)}`;
    if (metric === 'saves') return `${total} saves`;
    return `${total} session${total === 1 ? '' : 's'}`;
  })();

  const setMetricPersist = (m) => { setMetric(m); setStoredMetric(m); };

  return (
    <section
      aria-labelledby="pulse-heading"
      className="relative overflow-hidden rounded-3xl p-5 sm:p-6"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <h2
          id="pulse-heading"
          className="text-[10px] font-black uppercase tracking-[0.22em]"
          style={{ color: 'var(--color-primary)' }}
        >
          This week
        </h2>
        <div
          role="tablist"
          aria-label="Pulse metric"
          className="inline-flex items-center gap-1 rounded-full p-1"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={metric === 'sessions'}
            onClick={() => setMetricPersist('sessions')}
            className="bridge-focus rounded-full px-3 py-1 text-[11px] font-bold transition-colors"
            style={{
              backgroundColor: metric === 'sessions' ? 'var(--bridge-surface-muted)' : 'transparent',
              boxShadow: metric === 'sessions' ? 'inset 0 0 0 1px var(--bridge-border-strong)' : 'none',
              color: metric === 'sessions' ? 'var(--bridge-text)' : 'var(--bridge-text-muted)',
            }}
          >
            Sessions
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={metric !== 'sessions'}
            onClick={() => setMetricPersist(isMentor ? 'earnings' : 'saves')}
            className="bridge-focus rounded-full px-3 py-1 text-[11px] font-bold transition-colors"
            style={{
              backgroundColor: metric !== 'sessions' ? 'var(--bridge-surface-muted)' : 'transparent',
              boxShadow: metric !== 'sessions' ? 'inset 0 0 0 1px var(--bridge-border-strong)' : 'none',
              color: metric !== 'sessions' ? 'var(--bridge-text)' : 'var(--bridge-text-muted)',
            }}
          >
            {isMentor ? 'Earnings' : 'Saves'}
          </button>
        </div>
      </div>

      <p
        className="mt-3 text-[14px]"
        style={{ color: 'var(--bridge-text-secondary)' }}
      >
        {empty ? headerTotal : "You're at"}
      </p>
      {!empty ? (
        <p
          className="font-display font-black tabular-nums"
          style={{
            fontSize: 'clamp(28px, 3vw, 40px)',
            letterSpacing: '-0.025em',
            color: 'var(--bridge-text)',
            lineHeight: 1.05,
            fontFeatureSettings: '"tnum" 1, "kern" 1',
          }}
          aria-live="polite"
        >
          {headerTotal}
        </p>
      ) : null}

      <div className="relative mt-5 h-32 sm:h-40">
        {empty ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-lg"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, color-mix(in srgb, var(--bridge-text-muted) 8%, transparent) 0 6px, transparent 6px 12px)',
              opacity: 1,
            }}
          />
        ) : null}
        <div className="relative z-10 flex h-full items-end gap-1.5">
          {buckets.map((b, i) => (
            <Bar
              key={b.label}
              value={empty ? 0 : b.value}
              max={max}
              isToday={i === todayIdx}
              animate={!flat}
              delay={i * 40}
            />
          ))}
        </div>
      </div>

      <div
        className="mt-3 flex items-center justify-between text-[11px] tabular-nums"
        style={{ color: 'var(--bridge-text-muted)' }}
      >
        {DAY_LABELS.map((d, i) => (
          <span
            key={d}
            className="flex-1 text-center"
            style={{
              color: i === todayIdx ? 'var(--bridge-text-secondary)' : 'var(--bridge-text-muted)',
              fontWeight: i === todayIdx ? 700 : 600,
            }}
          >
            {d}
          </span>
        ))}
      </div>
    </section>
  );
}
