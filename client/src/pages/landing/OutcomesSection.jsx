import { OUTCOMES } from './landingData';
import RevealOnScroll from './RevealOnScroll';

const TONE_GRADIENTS = {
  amber:   'linear-gradient(135deg,#4F46E5,#818CF8)',
  emerald: 'linear-gradient(135deg,#059669,#10b981)',
  sky:     'linear-gradient(135deg,#0EA5E9,#38BDF8)',
  rose:    'linear-gradient(135deg,#6D28D9,#A78BFA)',
};

function initialsOf(name) {
  return name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function OutcomesSection() {
  const list = OUTCOMES.slice(0, 3);
  const [featured, ...rest] = list;

  return (
    <section
      id="outcomes"
      aria-labelledby="outcomes-heading"
      className="relative py-24 lg:py-32"
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        borderTop: '1px solid var(--bridge-border)',
      }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <h2
            id="outcomes-heading"
            className="font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            People who got
            <br />
            <span style={{ color: 'var(--color-primary)' }}>unstuck.</span>
          </h2>
          <p
            className="mt-7 max-w-xl"
            style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.6 }}
          >
            Real outcomes from people who booked the session. We use first-name and role only.
          </p>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-5">
          <RevealOnScroll>
            <FeaturedCard outcome={featured} index={0} />
          </RevealOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rest.map((o, i) => (
              <RevealOnScroll key={o.name}>
                <SupportingCard outcome={o} index={i + 1} />
              </RevealOnScroll>
            ))}
          </div>
        </div>

        <RevealOnScroll>
          <div
            className="mt-12 flex items-start gap-4 max-w-2xl mx-auto pt-10"
            style={{ borderTop: '1px solid var(--bridge-border)' }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full font-display font-black shrink-0"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                fontSize: 16,
              }}
              aria-hidden="true"
            >
              B
            </div>
            <div className="flex-1">
              <p
                className="italic font-display"
                style={{
                  fontSize: 'clamp(1rem, 1.6vw, 1.125rem)',
                  lineHeight: 1.55,
                  color: 'var(--bridge-text)',
                }}
              >
                Bridge is built by a small team. We hand-vet every mentor and read every review. If a session doesn&rsquo;t earn the rebook, we want to know.
              </p>
              <p
                className="mt-3 text-[12px] uppercase font-bold"
                style={{
                  color: 'var(--bridge-text-muted)',
                  letterSpacing: '0.18em',
                }}
              >
                The Bridge team
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function Avatar({ outcome, size, fontSize, lazy = true }) {
  const tones = ['amber', 'emerald', 'sky', 'rose'];
  const tone = tones[(outcome.name?.charCodeAt(0) ?? 0) % tones.length];
  if (outcome.avatarUrl) {
    return (
      <img
        src={outcome.avatarUrl}
        alt={outcome.name}
        width={size}
        height={size}
        loading={lazy ? 'lazy' : 'eager'}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: TONE_GRADIENTS[tone],
        fontSize,
      }}
      aria-hidden="true"
    >
      {initialsOf(outcome.name)}
    </div>
  );
}

function FeaturedCard({ outcome }) {
  return (
    <div
      className="rounded-3xl p-7 sm:p-9 flex flex-col sm:flex-row items-start gap-6"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <Avatar outcome={outcome} size={64} fontSize={20} />
      <div className="flex-1 flex flex-col gap-4">
        <p
          className="italic font-display"
          style={{
            fontSize: 'clamp(1.125rem, 1.8vw, 1.375rem)',
            lineHeight: 1.55,
            color: 'var(--bridge-text)',
          }}
        >
          “{outcome.quote}”
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
            {outcome.name}, {outcome.role} in {outcome.industry}
          </p>
          <span
            className="ml-auto px-4 py-2 rounded-full text-[14px] font-bold"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              fontFeatureSettings: '"tnum" 1',
            }}
          >
            {outcome.metric}
          </span>
        </div>
      </div>
    </div>
  );
}

function SupportingCard({ outcome }) {
  return (
    <div
      className="rounded-3xl p-6 h-full flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <Avatar outcome={outcome} size={40} fontSize={14} />
      <p
        className="italic font-display text-[14px]"
        style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.6 }}
      >
        “{outcome.quote}”
      </p>
      <div className="mt-auto flex items-center gap-3 flex-wrap">
        <p className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
          {outcome.name}, {outcome.role} in {outcome.industry}
        </p>
        <span
          className="ml-auto px-2.5 py-1 rounded-full text-[11px] font-bold"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--color-primary) 12%, transparent)',
            color: 'var(--color-primary)',
            fontFeatureSettings: '"tnum" 1',
          }}
        >
          {outcome.metric}
        </span>
      </div>
    </div>
  );
}
