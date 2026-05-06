import { useCountUp } from './landingHooks';

const DEFAULT_GRADIENT = 'linear-gradient(90deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 60%, var(--lp-grad-to) 100%)';

export default function StatCell({ target, suffix, label, accent, decimal, gradient }) {
  const raw = decimal ? Math.round(target * 10) : target;
  const [ref, val] = useCountUp(raw, 1200);
  const display = decimal ? (val / 10).toFixed(1) : val.toLocaleString();

  // accent is an optional Tailwind gradient string (legacy); gradient is the
  // preferred prop and accepts a CSS background-image value (works with vars).
  const useTailwind = !!accent && !gradient;

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <p
        className={`font-display font-black tabular-nums text-transparent bg-clip-text ${useTailwind ? `bg-gradient-to-r ${accent}` : ''}`}
        style={{
          fontSize: 'clamp(2.2rem, 4vw, 3.75rem)',
          lineHeight: 1,
          ...(useTailwind ? {} : { backgroundImage: gradient || DEFAULT_GRADIENT }),
        }}
      >
        {display}{suffix}
      </p>
      <p
        className="text-[11px] font-black uppercase tracking-[0.22em]"
        style={{ color: 'var(--bridge-text-muted)' }}
      >
        {label}
      </p>
    </div>
  );
}
