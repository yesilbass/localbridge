import { Zap, DollarSign, MessageSquare, Video, Target, Filter, ArrowRight } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';
import TiltCard from './TiltCard';

const PROMISE_CARDS = [
  {
    Icon: Zap,
    title: 'One session at a time',
    desc: 'No packages, no lock-ins. Pay for exactly what you need — nothing more.',
    extra: (
      <div className="mt-3 flex items-center gap-2 text-[10.5px] font-bold" style={{ color: 'var(--bridge-text-faint)' }}>
        <span className="line-through opacity-50">3-month pkg</span>
        <ArrowRight className="h-3 w-3" style={{ color: 'var(--color-primary)' }} />
        <span style={{ color: 'var(--color-primary)' }}>1 hour</span>
      </div>
    ),
  },
  {
    Icon: DollarSign,
    title: 'Price on every profile',
    desc: 'No "contact us for pricing" opacity. Rates are front and center, always.',
  },
  {
    Icon: MessageSquare,
    title: 'Unfiltered reviews',
    desc: 'All reviews published — good and critical. No curation, no censoring.',
  },
  {
    Icon: Video,
    title: 'Built-in video, zero friction',
    desc: 'Custom room auto-generated per session. No Zoom links needed.',
  },
  {
    Icon: Target,
    title: 'Sessions with structure',
    desc: "Four named formats so you walk in knowing what you'll walk out with.",
    extra: (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {['Career Advice', 'Interview Prep', 'Resume Review', 'Networking'].map(t => (
          <span
            key={t}
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor: 'var(--bridge-surface-muted)',
              color: 'var(--bridge-text-muted)',
              boxShadow: '0 0 0 1px var(--bridge-border) inset',
            }}
          >
            {t}
          </span>
        ))}
      </div>
    ),
    wide: true,
  },
];

export default function ManifestoSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28 lg:py-32" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <div className="mb-12 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.32em]" style={{ color: 'var(--color-primary)' }}>
                Why Bridge works
              </p>
              <h2
                className="mt-3 font-display font-black leading-[0.98] tracking-tight"
                style={{ fontSize: 'clamp(2rem, 4.8vw, 3.75rem)', color: 'var(--bridge-text)' }}
              >
                Six promises.<br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(94deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 55%, var(--lp-grad-to) 100%)' }}
                >
                  Zero exceptions.
                </span>
              </h2>
            </div>
            <p
              className="max-w-sm text-[14px] leading-7"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              Built around the things career platforms keep getting wrong — because we lived through them too.
            </p>
          </div>
        </RevealOnScroll>

        {/* Featured promise — "The filter" */}
        <RevealOnScroll delay={0} variant="flip">
          <TiltCard
            n={3}
            className="group relative mb-4 overflow-hidden rounded-[1.75rem] p-7 sm:p-9"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: '0 30px 60px -30px color-mix(in srgb, var(--color-primary) 28%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-primary) 22%, transparent) inset',
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 50% 70% at 100% 0%, color-mix(in srgb, var(--color-primary) 9%, transparent), transparent 70%)',
              }}
            />
            <div className="relative grid gap-7 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] mb-4"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                    color: 'var(--color-primary)',
                    boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-primary) 28%, transparent) inset',
                  }}
                >
                  <Filter className="h-3 w-3" />
                  The filter
                </div>
                <h3
                  className="font-display text-[28px] font-black leading-[1.05] tracking-[-0.025em] sm:text-[40px]"
                  style={{ color: 'var(--bridge-text)' }}
                >
                  Only people who&rsquo;ve <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(94deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 55%, var(--lp-grad-to) 100%)' }}
                  >done your job</span>.
                </h3>
                <p
                  className="mt-4 max-w-2xl text-[14.5px] leading-7"
                  style={{ color: 'var(--bridge-text-muted)' }}
                >
                  Every mentor has lived the exact role you&rsquo;re targeting. We filter on outcome, not credentials. No generic coaches, no unverified bios, no bullshit.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:max-w-[240px]">
                {['PMs at Series B+', 'EMs at hyperscalers', 'RNs → UX', 'VPs of Sales', 'Founders post-YC', 'Top studios'].map(t => (
                  <span
                    key={t}
                    className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                    style={{
                      backgroundColor: 'var(--bridge-surface-muted)',
                      color: 'var(--bridge-text-secondary)',
                      boxShadow: '0 0 0 1px var(--bridge-border) inset',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </TiltCard>
        </RevealOnScroll>

        {/* Supporting promise cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROMISE_CARDS.map((card, i) => (
            <RevealOnScroll
              key={i}
              delay={80 + i * 70}
              variant={i % 2 === 0 ? 'flip-right' : 'flip-left'}
              className={card.wide ? 'sm:col-span-1 lg:col-span-2' : ''}
            >
              <TiltCard
                n={3}
                className="group relative h-full overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: '0 14px 32px -22px rgba(79,70,229,0.16), 0 0 0 1px var(--bridge-border) inset',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                      color: 'var(--color-primary)',
                      boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-primary) 22%, transparent) inset',
                    }}
                  >
                    <card.Icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-[14.5px] font-bold tracking-tight"
                      style={{ color: 'var(--bridge-text)' }}
                    >
                      {card.title}
                    </h3>
                    <p
                      className="mt-1.5 text-[12.5px] leading-relaxed"
                      style={{ color: 'var(--bridge-text-muted)' }}
                    >
                      {card.desc}
                    </p>
                    {card.extra}
                  </div>
                </div>
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
