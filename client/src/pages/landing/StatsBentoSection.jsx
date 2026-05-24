import { useRef, useState, useEffect } from 'react';
import { usePerfTier } from './landingHooks';
import { useI18n } from '../../i18n';

function useStatTrigger(enabled) {
  const ref = useRef(null);
  const [triggered, setTriggered] = useState(!enabled);
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled]);
  return [ref, triggered];
}

function useCountUp(target, { duration = 1600, decimals = 0, enabled = true, triggered = true, delay = 0 } = {}) {
  const [val, setVal] = useState(enabled ? 0 : target);
  const startedRef = useRef(false);
  useEffect(() => {
    if (!enabled || !triggered || startedRef.current) return;
    startedRef.current = true;
    let raf;
    const run = () => {
      let start = null;
      const tick = (now) => {
        if (!start) start = now;
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const cur = decimals
          ? parseFloat((target * eased).toFixed(decimals))
          : Math.round(target * eased);
        setVal(cur);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const t = setTimeout(run, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [target, duration, decimals, enabled, triggered, delay]);
  return enabled ? val : target;
}

function Stat({ stat, triggered, enabled, index }) {
  const count = useCountUp(stat.countTo, {
    duration: 1500,
    decimals: stat.decimals ?? 0,
    enabled,
    triggered,
    delay: index * 110,
  });

  const display = enabled
    ? `${stat.prefix ?? ''}${stat.decimals ? count.toFixed(stat.decimals) : count.toLocaleString('en-US')}${stat.suffix ?? ''}`
    : stat.value;

  const isLast = index === 3;

  return (
    <div
      className="flex flex-col items-start gap-2 py-10 px-8 sm:py-12 sm:px-10"
      style={{
        flex: '1 1 0',
        minWidth: 0,
        borderRight: isLast ? 'none' : '1px solid var(--bridge-border)',
      }}
    >
      {/* Animated number */}
      <p
        className="font-display font-black tabular-nums"
        style={{
          fontSize: 'clamp(2.4rem, 3.8vw, 3.4rem)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          backgroundImage: 'linear-gradient(135deg, var(--lp-grad-from, var(--color-primary)) 0%, var(--lp-grad-to, var(--color-primary)) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          opacity: triggered ? 1 : 0,
          transform: triggered ? 'translateY(0)' : 'translateY(10px)',
          transition: `opacity 0.55s ease ${index * 110}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${index * 110}ms`,
        }}
      >
        {display}
      </p>

      {/* Label */}
      <p
        className="text-[14px] font-medium leading-snug"
        style={{
          color: 'var(--bridge-text-secondary)',
          opacity: triggered ? 1 : 0,
          transition: `opacity 0.55s ease ${index * 110 + 80}ms`,
        }}
      >
        {stat.label}
      </p>
    </div>
  );
}

export default function StatsBentoSection() {
  const { t } = useI18n();
  const tier    = usePerfTier();
  const enabled = tier !== 'low';

  const STATS = [
    { value: '2,400+', countTo: 2400, suffix: '+',   label: t('landing.stats.vettedMentors', 'Vetted mentors') },
    { value: '4.9/5',  countTo: 4.9,  suffix: '/5',  decimals: 1, label: t('landing.stats.reviews', '1,200+ reviews') },
    { value: '97%',    countTo: 97,   suffix: '%',    label: t('landing.stats.recommend', 'Would recommend') },
    { value: '$2.1M+', countTo: 2.1,  prefix: '$',   suffix: 'M+', decimals: 1, label: t('landing.stats.compIncrease', 'In comp increases') },
  ];

  const [sectionRef, triggered] = useStatTrigger(enabled);

  return (
    <section
      ref={sectionRef}
      aria-label="Platform statistics"
      className="relative"
      style={{ backgroundColor: 'var(--bridge-canvas)', borderTop: '1px solid var(--bridge-border)', borderBottom: '1px solid var(--bridge-border)' }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Stat key={s.label} stat={s} triggered={triggered} enabled={enabled} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
