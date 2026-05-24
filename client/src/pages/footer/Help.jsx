import { useState, useMemo } from 'react';
import { Search, ArrowLeft, ChevronRight, LifeBuoy, MessageCircle, Sparkles, CreditCard, Calendar } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';
import { useContent } from '../../content';

const CATEGORY_META = {
  'Getting Started': { Icon: Sparkles },
  'Billing': { Icon: CreditCard },
  'Sessions': { Icon: Calendar }
};

const ARTICLES = {
  'creating-account': { category: 'Getting Started', title: 'Creating an account', body: `Signing up takes under a minute. Click "Sign up" in the top right, enter your email and a password, and confirm your email when our message hits your inbox.\n\nIf you don't see the confirmation email within 5 minutes, check your spam folder. Still nothing? Contact mentors.bridge@gmail.com.` },
  'finding-mentor': { category: 'Getting Started', title: 'Finding the right mentor', body: `Use the filters on the Mentors page: industry, role, company size, and specific skills. Read the full bio — not just the tagline. The bio is where real mentors distinguish themselves.\n\nCheck their session count and rating, but don't over-weight them. A mentor with 8 sessions and 5.0 rating may be better for your specific situation than one with 200 sessions.\n\nRead at least three reviews before booking.` },
  'first-session': { category: 'Getting Started', title: 'Booking your first session', body: `Click "Book a session" on the mentor's profile. Pick a session format — Career Advice, Interview Prep, Resume Review, or Networking. Choose a date from the calendar, then a time slot.\n\nYou'll see the total price before confirming. Payment is held until 24 hours after the session completes, so if anything goes wrong you get an automatic refund.` },
  'preparing-session': { category: 'Getting Started', title: 'Preparing for a session', body: `Write down the ONE thing you want to walk away knowing. Not five things — one. Share it with the mentor in the booking note 24 hours before.\n\nIf you're sharing documents (resume, code, pitch deck), send them at least 6 hours ahead so the mentor can actually review.\n\nTest your video and audio 10 minutes before. Nothing wastes a session faster than "can you hear me now?"` },
  'payment-methods': { category: 'Billing', title: 'Payment methods', body: `We accept all major credit and debit cards (Visa, Mastercard, Amex, Discover), Apple Pay, and Google Pay. Bank transfers aren't supported for session bookings.\n\nYour card is not charged until the mentor confirms the session. For Pro and Premium subscriptions, you're billed monthly or annually depending on your plan.` },
  'refund-policy': { category: 'Billing', title: 'Refund policy', body: `Before a session: 100% refund, any time.\n\nAfter a session: 100% refund within 48 hours if you're unsatisfied. No explanation required — we take your word for it.\n\nMentor no-shows: Automatic full refund plus credit toward your next booking.` },
  'reschedule': { category: 'Sessions', title: 'Rescheduling a session', body: `Go to your Dashboard → Upcoming Sessions → click the session. Use "Reschedule" to pick a new time from the mentor's availability.\n\nFree up to 24 hours before the session. Inside 24 hours, the mentor may charge a rescheduling fee at their discretion.` },
  'cancel': { category: 'Sessions', title: 'Canceling a session', body: `From your Dashboard, open the session and click "Cancel." Full refund issued if more than 24 hours before the session starts. Inside 24 hours, refunds are at the mentor's discretion.\n\nWe don't penalize occasional cancellations. Repeated last-minute cancellations may limit your ability to book.` },
  'technical': { category: 'Sessions', title: 'Technical issues during a call', body: `If the video call drops, try rejoining from the same link. If problems persist for more than 5 minutes, end the call and message the mentor through the platform — they'll restart or reschedule.\n\nUse Chrome, Safari, or Firefox (latest versions). Mobile works but desktop is more reliable for screen sharing.` }
};

const CATEGORIES = [
  { name: 'Getting Started', keys: ['creating-account', 'finding-mentor', 'first-session', 'preparing-session'] },
  { name: 'Billing', keys: ['payment-methods', 'refund-policy'] },
  { name: 'Sessions', keys: ['reschedule', 'cancel', 'technical'] },
];

export default function Help() {
  const { s } = useContent();
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return Object.entries(ARTICLES).filter(
      ([, a]) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)
    );
  }, [search]);

  if (active) {
    const article = ARTICLES[active];
    return (
      <main className={`${pageShell} px-4 py-16 sm:px-6 sm:py-20 lg:px-8`}>
        <article className="mx-auto max-w-3xl">
          <button
            onClick={() => setActive(null)}
            className={`mb-8 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-[var(--bridge-text-secondary)] transition hover:-translate-y-0.5 hover:text-[var(--bridge-text)] ${focusRing}`}
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to help center
          </button>

          <p
            className="text-[10px] font-black uppercase"
            style={{ letterSpacing: '0.32em', color: 'var(--color-primary)' }}
          >
            {article.category}
          </p>
          <h1
            className="mt-3 font-display font-black text-[var(--bridge-text)]"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.03em'
            }}
          >
            {article.title}
          </h1>

          <div className="mt-8 space-y-5 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
            {article.body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <div
            className="relative mt-12 overflow-hidden rounded-2xl p-7"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent)'
              }}
            />
            <div className="relative flex items-start gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor:
                    'color-mix(in srgb, var(--color-primary) 12%, var(--bridge-surface))'
                }}
              >
                <LifeBuoy className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-semibold text-[var(--bridge-text)]">
                  Still need help?
                </p>
                <p className="mt-1.5 text-[14px] leading-[1.65] text-[var(--bridge-text-secondary)]">
                  Can&apos;t find what you&apos;re looking for?{' '}
                  <a
                    href="/contact"
                    className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                    style={{
                      color: 'var(--color-primary)',
                      textDecorationColor:
                        'color-mix(in srgb, var(--color-primary) 40%, transparent)'
                    }}
                  >
                    {s.common.contactSupport}
                  </a>{' '}
                  — we reply within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[45vmax] w-[80vmax] -translate-x-1/2 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 68%)',
          filter: 'blur(80px)'
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        <Reveal className="mb-10">
          <p
            className="mb-4 text-[10px] font-black uppercase"
            style={{ letterSpacing: '0.32em', color: 'var(--color-primary)' }}
          >
            Support
          </p>
          <h1
            className="font-display font-black text-[var(--bridge-text)]"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.03em'
            }}
          >
            Help center
          </h1>
        </Reveal>

        <Reveal delay={60}>
          <div className="relative mb-12 max-w-2xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition"
              style={{ color: 'var(--bridge-text-muted)' }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles…"
              className={`w-full rounded-2xl py-3.5 pl-12 pr-4 text-[15px] text-[var(--bridge-text)] outline-none placeholder:text-[var(--bridge-text-muted)] shadow-[inset_0_0_0_1px_var(--bridge-border)] transition focus:shadow-[inset_0_0_0_1.5px_var(--color-primary),0_0_0_4px_color-mix(in_srgb,var(--color-primary)_18%,transparent)] ${focusRing}`}
              style={{ backgroundColor: 'var(--bridge-surface)' }}
            />
          </div>
        </Reveal>

        {search ? (
          <div className="space-y-3">
            <p className="mb-4 text-[13px] font-semibold text-[var(--bridge-text-muted)]">
              {results.length} result{results.length !== 1 && 's'}
            </p>
            {results.length === 0 ? (
              <div
                className="rounded-2xl p-8 text-center"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                }}
              >
                <p className="text-[15px] text-[var(--bridge-text-secondary)]">
                  No articles found for &ldquo;{search}&rdquo;.
                </p>
              </div>
            ) : (
              results.map(([key, a]) => (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={`group flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5 ${focusRing}`}
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[10px] font-black uppercase"
                      style={{ letterSpacing: '0.32em', color: 'var(--color-primary)' }}
                    >
                      {a.category}
                    </p>
                    <p className="mt-1 font-display text-[15px] font-semibold text-[var(--bridge-text)]">
                      {a.title}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5"
                    style={{ color: 'var(--bridge-text-muted)' }}
                  />
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {CATEGORIES.map((cat, i) => {
              const meta = CATEGORY_META[cat.name] ?? CATEGORY_META['Getting Started'];
              return (
                <Reveal key={cat.name} delay={i * 60}>
                  <div
                    className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: 'var(--bridge-surface)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                    }}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition duration-500 group-hover:opacity-100"
                      style={{
                        background:
                          'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent)'
                      }}
                    />
                    <div className="relative flex items-center gap-3 mb-5">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition duration-300 group-hover:scale-[1.06]"
                        style={{
                          backgroundColor:
                            'color-mix(in srgb, var(--color-primary) 12%, var(--bridge-surface))'
                        }}
                      >
                        <meta.Icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)]">
                        {cat.name}
                      </h2>
                    </div>
                    <ul className="relative space-y-0.5">
                      {cat.keys.map((k) => (
                        <li key={k}>
                          <button
                            onClick={() => setActive(k)}
                            className={`group/row flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-[var(--bridge-text-secondary)] transition hover:bg-orange-50/60 hover:text-[var(--bridge-text)] dark:hover:bg-orange-500/10 ${focusRing}`}
                          >
                            {ARTICLES[k].title}
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40 transition group-hover/row:translate-x-0.5 group-hover/row:opacity-80" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        <Reveal delay={280}>
          <div
            className="mt-12 flex flex-col items-start gap-5 rounded-2xl p-7 sm:flex-row sm:items-center sm:justify-between"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor:
                    'color-mix(in srgb, var(--color-primary) 12%, var(--bridge-surface))'
                }}
              >
                <MessageCircle className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <p className="font-display text-[15px] font-semibold text-[var(--bridge-text)]">
                  Still stuck?
                </p>
                <p className="mt-0.5 text-[13px] text-[var(--bridge-text-muted)]">
                  We reply to every message within 24 hours.
                </p>
              </div>
            </div>
            <a
              href="/contact"
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition hover:-translate-y-0.5 ${focusRing}`}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                boxShadow:
                  '0 8px 24px -6px color-mix(in srgb, var(--color-primary) 45%, transparent)'
              }}
            >
              {s.common.contactSupport}
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
