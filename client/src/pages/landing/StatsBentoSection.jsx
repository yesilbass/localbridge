import { TrendingUp, Users, Star, MessageSquare, Clock, Globe } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';
import TiltCard from './TiltCard';
import StatCell from './StatCell';

export default function StatsBentoSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28 lg:py-32" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      {/* subtle top gradient flourish */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 4%, transparent) 0%, transparent 100%)',
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <div className="mb-14 flex flex-col items-start gap-5 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-[10px] font-black uppercase tracking-[0.32em]"
                style={{ color: 'var(--color-primary)' }}
              >
                By the numbers
              </p>
              <h2
                className="mt-3 max-w-3xl font-display font-black leading-[0.98] tracking-[-0.035em]"
                style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: 'var(--bridge-text)' }}
              >
                Built once. Used <span style={{ color: 'var(--color-primary)' }}>relentlessly</span>.
              </h2>
            </div>
            <p className="max-w-sm text-[14px] leading-7" style={{ color: 'var(--bridge-text-muted)' }}>
              No vanity metrics. Real signal: people show up, book again, and recommend.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[200px] lg:grid-cols-4">
          {/* Featured: Mentor network — spans 2 cols × 2 rows */}
          <RevealOnScroll delay={0} variant="left" className="col-span-2 lg:row-span-2">
            <TiltCard
              n={4}
              className="group relative h-full overflow-hidden rounded-[1.75rem] p-7 sm:p-9"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: '0 30px 60px -28px color-mix(in srgb, var(--color-primary) 28%, transparent), 0 0 0 1px var(--bridge-border) inset',
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse 60% 70% at 100% 100%, color-mix(in srgb, var(--color-primary) 9%, transparent), transparent 70%)',
                }}
              />
              <div className="relative flex h-full flex-col justify-between gap-7">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <Users className="h-4 w-4" />
                  </span>
                  <p
                    className="text-[10px] font-black uppercase tracking-[0.28em]"
                    style={{ color: 'var(--bridge-text-muted)' }}
                  >
                    Mentor network
                  </p>
                </div>

                <div>
                  <StatCell
                    target={2400}
                    suffix="+"
                    label="Vetted mentors across 60+ industries"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[
                      ['MC', 'linear-gradient(135deg,#4F46E5,#818CF8)'],
                      ['JR', 'linear-gradient(135deg,#7C7CFF,#4F46E5)'],
                      ['EV', 'linear-gradient(135deg,#312E81,#818CF8)'],
                      ['MK', 'linear-gradient(135deg,#10b981,#059669)'],
                    ].map(([initials, grad]) => (
                      <div
                        key={initials}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{
                          background: grad,
                          border: '2px solid var(--bridge-surface)',
                        }}
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <p className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
                    <span className="font-bold" style={{ color: 'var(--bridge-text)' }}>12 new</span> mentors joined this week
                  </p>
                </div>
              </div>
            </TiltCard>
          </RevealOnScroll>

          <BentoCell
            delay={80}
            variant="flip"
            icon={<TrendingUp className="h-4 w-4" />}
            kicker="Total bookings"
            target={4800}
            suffix="+"
            label="Sessions booked to date"
          />

          <BentoCell
            delay={160}
            variant="right"
            icon={<Star className="h-4 w-4" style={{ fill: 'currentColor' }} />}
            kicker="Average rating"
            target={4.9}
            suffix="/5"
            label="From 1,200+ post-session reviews"
            decimal
          />

          <BentoCell
            delay={240}
            variant="flip"
            icon={<MessageSquare className="h-4 w-4" />}
            kicker="Recommend"
            target={97}
            suffix="%"
            label="Would recommend to a friend"
          />

          <BentoCell
            delay={320}
            variant="right"
            icon={<Clock className="h-4 w-4" />}
            kicker="Response time"
            target={11}
            suffix=" min"
            label="Avg time to first reply"
          />
        </div>

        {/* Footer stats strip */}
        <RevealOnScroll delay={420}>
          <div
            className="mt-5 grid grid-cols-2 gap-4 rounded-[1.75rem] px-6 py-6 backdrop-blur-xl sm:grid-cols-4 sm:gap-7 sm:px-8"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 92%, transparent)',
              boxShadow: '0 14px 30px -22px rgba(79,70,229,0.20), 0 0 0 1px var(--bridge-border) inset',
            }}
          >
            {[
              { k: '$2.1M+', v: 'in offer increases unlocked' },
              { k: '47', v: 'industries covered' },
              { k: '92%', v: 'rebook within 30 days' },
              { k: <span className="inline-flex items-center gap-1.5">24/7 <Globe className="h-5 w-5" style={{ color: 'var(--color-primary)' }} /></span>, v: 'global mentor coverage' },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 border-b pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3 last:border-0"
                style={{ borderColor: 'var(--bridge-border)' }}
              >
                <p
                  className="font-display text-[26px] font-black tabular-nums leading-tight sm:text-[32px]"
                  style={{ color: 'var(--bridge-text)' }}
                >
                  {s.k}
                </p>
                <p className="text-[11.5px] leading-tight" style={{ color: 'var(--bridge-text-muted)' }}>
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function BentoCell({ delay, variant, icon, kicker, target, suffix, label, decimal }) {
  return (
    <RevealOnScroll delay={delay} variant={variant}>
      <TiltCard
        n={3}
        className="relative h-full overflow-hidden rounded-[1.5rem] p-6"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: '0 12px 28px -22px rgba(79,70,229,0.18), 0 0 0 1px var(--bridge-border) inset',
        }}
      >
        <div className="relative flex h-full flex-col justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                color: 'var(--color-primary)',
              }}
            >
              {icon}
            </span>
            <p
              className="text-[10px] font-black uppercase tracking-[0.22em]"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              {kicker}
            </p>
          </div>
          <StatCell
            target={target}
            suffix={suffix}
            label={label}
            decimal={decimal}
          />
        </div>
      </TiltCard>
    </RevealOnScroll>
  );
}
