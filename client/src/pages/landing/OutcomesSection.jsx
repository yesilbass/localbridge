import { Star, Quote } from 'lucide-react';
import { OUTCOMES } from './landingData';
import RevealOnScroll from './RevealOnScroll';

const TONE_GRADIENTS = {
  amber:   'linear-gradient(135deg, #4F46E5, #818CF8)',
  emerald: 'linear-gradient(135deg, #059669, #10b981)',
  sky:     'linear-gradient(135deg, #0EA5E9, #38BDF8)',
  rose:    'linear-gradient(135deg, #4F46E5, #A78BFA)',
  violet:  'linear-gradient(135deg, #6D28D9, #A78BFA)',
  teal:    'linear-gradient(135deg, #0D9488, #14B8A6)',
  orange:  'linear-gradient(135deg, #4F46E5, #6366F1)',
  pink:    'linear-gradient(135deg, #312E81, #818CF8)',
};

export default function OutcomesSection() {
  return (
    <section
      id="outcomes"
      className="relative overflow-hidden py-24 sm:py-28"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <RevealOnScroll>
          <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-[10px] font-black uppercase tracking-[0.32em]"
                style={{ color: 'var(--color-primary)' }}
              >
                Real outcomes
              </p>
              <h2
                className="mt-3 font-display font-black tracking-[-0.025em]"
                style={{ fontSize: 'clamp(2rem, 4.6vw, 3.5rem)', color: 'var(--bridge-text)' }}
              >
                People who got{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(94deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 55%, var(--lp-grad-to) 100%)' }}
                >
                  unstuck
                </span>.
              </h2>
            </div>
            <div
              className="flex items-center gap-2.5 rounded-full px-4 py-2 text-[11.5px] font-bold"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                color: 'var(--bridge-text-muted)',
                boxShadow: '0 0 0 1px var(--bridge-border) inset',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-65" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>97% would recommend Bridge</span>
            </div>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {OUTCOMES.map((o, i) => (
            <RevealOnScroll
              key={i}
              delay={i * 90}
              variant={i % 3 === 0 ? 'left' : i % 3 === 1 ? 'zoom' : 'right'}
            >
              <div
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl p-7 transition-all hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: '0 14px 32px -22px rgba(79,70,229,0.18), 0 0 0 1px var(--bridge-border) inset',
                }}
              >
                {/* Quote mark accent */}
                <Quote
                  aria-hidden
                  className="absolute right-5 top-5 h-8 w-8 opacity-[0.08]"
                  style={{ color: 'var(--color-primary)' }}
                />

                {/* Top row: stars + result chip */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3, 4].map(k => (
                      <Star
                        key={k}
                        className="h-3 w-3"
                        style={{ fill: '#F59E0B', color: '#F59E0B' }}
                      />
                    ))}
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[9.5px] font-bold whitespace-nowrap uppercase tracking-wider"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                      color: 'var(--color-primary)',
                      boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-primary) 22%, transparent) inset',
                    }}
                  >
                    {o.result}
                  </span>
                </div>

                {/* Quote */}
                <p
                  className="relative flex-1 text-[14px] leading-relaxed"
                  style={{ color: 'var(--bridge-text-secondary)' }}
                >
                  &ldquo;{o.quote}&rdquo;
                </p>

                {/* Footer: avatar + name + metric */}
                <div
                  className="mt-6 flex items-center gap-3 pt-5"
                  style={{ borderTop: '1px solid var(--bridge-border)' }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold text-white"
                    style={{ background: TONE_GRADIENTS[o.tone] || TONE_GRADIENTS.amber }}
                  >
                    {o.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-[12.5px] font-bold"
                      style={{ color: 'var(--bridge-text)' }}
                    >
                      {o.name}
                    </p>
                    <p className="truncate text-[10.5px]" style={{ color: 'var(--bridge-text-faint)' }}>
                      {o.role}
                    </p>
                  </div>
                  <span
                    className="text-[10.5px] font-bold whitespace-nowrap"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {o.metric}
                  </span>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
