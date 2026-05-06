import { Check, X, Sparkles } from 'lucide-react';
import { WHY_ROWS } from './landingData';
import RevealOnScroll from './RevealOnScroll';

const COLUMN_HEADERS = [
  { label: 'LinkedIn DMs', sub: 'Cold outreach' },
  { label: 'Life coaching', sub: 'Generic advice' },
  { label: 'Bridge', sub: 'Done-it mentors', best: true },
];

export default function ComparisonSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
        <RevealOnScroll>
          <div className="mb-12 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p
                className="text-[10px] font-black uppercase tracking-[0.32em]"
                style={{ color: 'var(--color-primary)' }}
              >
                Why not just DM on LinkedIn?
              </p>
              <h2
                className="mt-3 font-display font-black leading-[1] tracking-[-0.025em]"
                style={{ fontSize: 'clamp(1.85rem, 4.6vw, 3.5rem)', color: 'var(--bridge-text)' }}
              >
                Bridge vs<br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(94deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 55%, var(--lp-grad-to) 100%)' }}
                >
                  the alternatives
                </span>
              </h2>
            </div>
            <p
              className="max-w-xs text-[12.5px] leading-relaxed"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              Side-by-side, decided in a minute. The same six questions you&rsquo;d ask any platform — answered honestly.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={120} variant="zoom">
          <div
            className="relative overflow-hidden rounded-[1.75rem]"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: '0 30px 60px -30px color-mix(in srgb, var(--color-primary) 26%, transparent), 0 0 0 1px var(--bridge-border) inset',
            }}
          >
            {/* Bridge column glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 sm:block"
              style={{
                background: 'linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, color-mix(in srgb, var(--color-primary) 3%, transparent) 50%, color-mix(in srgb, var(--color-primary) 7%, transparent) 100%)',
              }}
            />

            {/* Table header */}
            <div
              className="relative grid grid-cols-4"
              style={{
                borderBottom: '2px solid var(--bridge-border)',
                backgroundColor: 'color-mix(in srgb, var(--bridge-surface-muted) 60%, transparent)',
              }}
            >
              <div className="px-5 py-5">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{ color: 'var(--bridge-text-faint)' }}
                >
                  Compare on
                </p>
              </div>
              {COLUMN_HEADERS.map((h, idx) => (
                <div
                  key={h.label}
                  className="px-4 py-5 text-center"
                  style={{
                    borderLeft: '1px solid var(--bridge-border)',
                    backgroundColor: h.best ? 'color-mix(in srgb, var(--color-primary) 6%, transparent)' : 'transparent',
                  }}
                >
                  {h.best ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[14.5px] font-black tracking-tight"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {h.label}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest text-white"
                          style={{
                            backgroundImage: 'linear-gradient(135deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 100%)',
                            boxShadow: '0 0 18px color-mix(in srgb, var(--color-primary) 45%, transparent)',
                          }}
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          Best
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-semibold"
                        style={{ color: 'color-mix(in srgb, var(--color-primary) 80%, transparent)' }}
                      >
                        {h.sub}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="text-[12px] font-bold tracking-tight"
                        style={{ color: 'var(--bridge-text-muted)' }}
                      >
                        {h.label}
                      </span>
                      <span className="text-[9px]" style={{ color: 'var(--bridge-text-faint)' }}>
                        {h.sub}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {WHY_ROWS.map((row, i) => (
              <div
                key={i}
                className="relative grid grid-cols-4 transition-colors"
                style={{
                  borderBottom: '1px solid color-mix(in srgb, var(--bridge-border) 60%, transparent)',
                  backgroundColor: i % 2 === 0 ? 'transparent' : 'color-mix(in srgb, var(--bridge-surface-muted) 22%, transparent)',
                }}
              >
                <div
                  className="flex items-center px-5 py-5 text-[13px] font-bold"
                  style={{ color: 'var(--bridge-text)' }}
                >
                  {row.label}
                </div>
                {[
                  { v: row.dm, best: false, neg: true },
                  { v: row.coaching, best: false, neg: false },
                  { v: row.bridge, best: true, neg: false },
                ].map((cell, j) => {
                  const isFailValue = cell.v === '—' || cell.v === 'No' || cell.v === 'None' || (typeof cell.v === 'string' && cell.v.startsWith('~'));

                  return (
                    <div
                      key={j}
                      className="relative px-4 py-5 text-center text-[12.5px] transition-all"
                      style={{
                        borderLeft: '1px solid color-mix(in srgb, var(--bridge-border) 50%, transparent)',
                        color: cell.best ? 'var(--color-primary)' : 'var(--bridge-text-muted)',
                        fontWeight: cell.best ? 700 : 400,
                      }}
                    >
                      {cell.best && cell.v !== '—' ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: 'color-mix(in srgb, #10b981 14%, transparent)',
                              boxShadow: '0 0 0 1px color-mix(in srgb, #10b981 30%, transparent) inset',
                            }}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} style={{ color: '#10b981' }} />
                          </span>
                          {cell.v}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {!isFailValue ? (
                            <span
                              className="h-1 w-1 rounded-full"
                              style={{ backgroundColor: 'var(--bridge-text-faint)' }}
                            />
                          ) : (
                            <X
                              className="h-3 w-3"
                              strokeWidth={3}
                              style={{ color: 'color-mix(in srgb, #f87171 70%, transparent)' }}
                            />
                          )}
                          {cell.v}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Summary footer */}
            <div
              className="relative grid grid-cols-4"
              style={{
                borderTop: '2px solid var(--bridge-border)',
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)',
              }}
            >
              <div
                className="px-5 py-4 text-[11px] font-black uppercase tracking-[0.22em]"
                style={{ color: 'var(--bridge-text-faint)' }}
              >
                Summary
              </div>
              <div
                className="px-4 py-4 text-center text-[11px] font-semibold"
                style={{
                  borderLeft: '1px solid var(--bridge-border)',
                  color: 'color-mix(in srgb, #f87171 80%, var(--bridge-text-muted))',
                }}
              >
                High effort · low signal
              </div>
              <div
                className="px-4 py-4 text-center text-[11px] font-semibold"
                style={{
                  borderLeft: '1px solid var(--bridge-border)',
                  color: 'color-mix(in srgb, #F59E0B 80%, var(--bridge-text-muted))',
                }}
              >
                Generic · expensive
              </div>
              <div
                className="px-4 py-4 text-center text-[11px] font-black"
                style={{
                  borderLeft: '1px solid var(--bridge-border)',
                  color: 'var(--color-primary)',
                }}
              >
                Targeted · transparent
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
