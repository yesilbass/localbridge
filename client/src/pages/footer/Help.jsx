import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, ChevronRight } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';
import { useContent } from '../../content';
import { COMPANY_EMAIL } from '../../config/contact';

const EYEBROW = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  color: 'var(--color-primary)',
};

const HAIRLINE = { borderBottom: '1px solid var(--bridge-border)' };

const ARTICLES = {
  'creating-account': {
    categoryId: 'getting-started',
    category: 'Getting started',
    title: 'Creating an account',
    body: `Click Sign up in the top right, enter your email and a password, and confirm your email when our message arrives.\n\nYou can browse mentors without an account. You only need one to book a session so we can send your meeting link and reminders.\n\nIf the confirmation email doesn't show up within five minutes, check spam. Still nothing? Email ${COMPANY_EMAIL}.`,
  },
  'finding-mentor': {
    categoryId: 'getting-started',
    category: 'Getting started',
    title: 'Finding the right mentor',
    body: `Open Mentors from the nav. Filter by industry, role, and skills, or use AI matching from your dashboard if you've filled in your goals.\n\nRead the full bio and mentorship description — not just the headline. Check reviews if the mentor has completed sessions, but don't treat session count as the only signal.\n\nWhen someone looks like a fit, open their profile and scan availability before you book.`,
  },
  'first-session': {
    categoryId: 'getting-started',
    category: 'Getting started',
    title: 'Booking your first session',
    body: `On the mentor's profile, choose a session type — Career Advice, Interview Prep, Resume Review, or Networking — then pick an open slot on their calendar. Add a short note about what you want to cover.\n\nMentor time is free. If you don't already have platform access, booking may start a 7-day trial — you won't be charged until day 8 unless you cancel. See Pricing for subscription details.\n\nYou'll get email confirmation. The video link appears in your dashboard once the mentor accepts.`,
  },
  'preparing-session': {
    categoryId: 'getting-started',
    category: 'Getting started',
    title: 'Preparing for a session',
    body: `Pick one outcome you want by the end — not five. Put it in your booking note at least a day ahead when you can.\n\nIf you're sharing a resume, deck, or links, send them through the platform early so the mentor has time to skim.\n\nTest camera and mic about ten minutes before. Join from Chrome, Safari, or Firefox on desktop when you need screen share.`,
  },
  'reschedule': {
    categoryId: 'sessions',
    category: 'Sessions',
    title: 'Rescheduling a session',
    body: `Go to Dashboard → Sessions and open the upcoming session. Use Reschedule when it's available and pick a new time from the mentor's calendar.\n\nTry to move it more than 24 hours ahead so the mentor isn't holding a slot for nothing. If you're cutting it close, message them through the platform.`,
  },
  'cancel': {
    categoryId: 'sessions',
    category: 'Sessions',
    title: 'Canceling a session',
    body: `Dashboard → Sessions → open the session → Cancel, then confirm in the prompt.\n\nCanceling frees the slot for your mentor. Occasional cancellations are fine; repeated last-minute no-shows may limit how often you can book.`,
  },
  'join-call': {
    categoryId: 'sessions',
    category: 'Sessions',
    title: 'Joining your video call',
    body: `After the mentor accepts, Dashboard → Sessions shows Join Call. The session runs in Bridge in your browser — no separate app.\n\nJoin a few minutes early. If the button isn't visible yet, the session may still be pending acceptance.\n\nMentor no-show? Email ${COMPANY_EMAIL} with the session time and mentor name — we'll help you rebook.`,
  },
  'technical': {
    categoryId: 'sessions',
    category: 'Sessions',
    title: 'Technical issues during a call',
    body: `If video or audio drops, refresh and rejoin from the same session in your dashboard. If problems last more than five minutes, end the call and message the mentor in-app.\n\nUse the latest Chrome, Safari, or Firefox. Desktop is more reliable than phone for screen sharing.\n\nStill stuck? Email ${COMPANY_EMAIL} with what you tried and which browser you're on.`,
  },
  'subscription': {
    categoryId: 'subscription',
    category: 'Subscription',
    title: 'Platform subscription & free trial',
    body: `Mentor sessions stay free — mentors volunteer their time. The Bridge subscription unlocks the platform: full directory access, AI matching, resume review, community, messaging, and everything we ship next.\n\nNew bookings may start a 7-day free trial if you're not already subscribed. You won't be charged until day 8; we send a reminder on day 5. Students with a verified .edu email get a reduced rate — see Pricing.`,
  },
  'manage-billing': {
    categoryId: 'subscription',
    category: 'Subscription',
    title: 'Manage or cancel your subscription',
    body: `Dashboard → Billing opens the Stripe customer portal. There you can update your card, view invoices, or cancel.\n\nCancel before day 8 of a trial and you owe nothing. Canceling a paid subscription stops future charges; it doesn't delete your account or session history.\n\nSession bookings stay free either way — you're only managing platform access.`,
  },
};

const CATEGORIES = [
  {
    id: 'getting-started',
    name: 'Getting started',
    sub: 'Account, mentor search, booking, prep.',
    keys: ['creating-account', 'finding-mentor', 'first-session', 'preparing-session'],
  },
  {
    id: 'sessions',
    name: 'Sessions',
    sub: 'Reschedule, cancel, video, A/V.',
    keys: ['reschedule', 'cancel', 'join-call', 'technical'],
  },
  {
    id: 'subscription',
    name: 'Subscription',
    sub: 'Trial and billing — not session fees.',
    keys: ['subscription', 'manage-billing'],
  },
];

function ArticleList({ keys, onSelect }) {
  return (
    <ul className="mt-4 border-t border-[var(--bridge-border)]">
      {keys.map((key, i) => {
        const article = ARTICLES[key];
        const last = i === keys.length - 1;
        return (
          <li key={key} style={!last ? HAIRLINE : undefined}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(key)}
              className="group flex w-full items-center justify-between gap-3 py-4 text-left focus:outline-none focus-visible:underline"
            >
              <span className="text-base font-semibold text-[var(--bridge-text)]">{article.title}</span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)] transition group-hover:translate-x-0.5"
                aria-hidden
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function relatedArticleKeys(activeKey) {
  const { categoryId } = ARTICLES[activeKey];
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return [];
  return cat.keys.filter((k) => k !== activeKey).slice(0, 3);
}

export default function Help() {
  const { s } = useContent();
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return Object.entries(ARTICLES).filter(
      ([, a]) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q),
    );
  }, [search]);

  if (active) {
    const article = ARTICLES[active];
    const related = relatedArticleKeys(active);

    return (
      <main className={`${pageShell} px-4 py-16 sm:px-6 sm:py-20 lg:px-8`}>
        <article className="mx-auto max-w-3xl">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setActive(null)}
            className="mb-8 inline-flex items-center gap-1.5 text-base font-medium text-[var(--bridge-text-muted)] transition hover:text-[var(--bridge-text)] focus:outline-none focus-visible:underline"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Help center
          </button>

          <p className="mb-4" style={EYEBROW}>
            {article.category}
          </p>
          <h1
            className="font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 3.25rem)', lineHeight: 1.08 }}
          >
            {article.title}
          </h1>

          <div className="mt-8 space-y-5 text-base leading-[1.8] text-[var(--bridge-text-secondary)] sm:text-[17px]">
            {article.body.split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {related.length > 0 && (
            <div className="mt-12 border-t border-[var(--bridge-border)] pt-10">
              <p className="mb-4 text-base font-semibold text-[var(--bridge-text)]">Related articles</p>
              <ul>
                {related.map((key, i) => {
                  const rel = ARTICLES[key];
                  const last = i === related.length - 1;
                  return (
                    <li key={key} style={!last ? HAIRLINE : undefined}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setActive(key)}
                        className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold text-[var(--bridge-text)] focus:outline-none focus-visible:underline"
                      >
                        {rel.title}
                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)]" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <p className="mt-12 border-t border-[var(--bridge-border)] pt-10 text-base leading-[1.8] text-[var(--bridge-text-secondary)] sm:text-lg">
            Questions about pricing or how Bridge works?{' '}
            <Link
              to="/faq"
              className="font-semibold underline underline-offset-4 transition hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              Read the FAQ
            </Link>
            . Still need help?{' '}
            <a
              href="/contact"
              className="font-semibold underline underline-offset-4 transition hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              {s.common.contactSupport}
            </a>
            .
          </p>
        </article>
      </main>
    );
  }

  const showBrowse = !search.trim();

  return (
    <main className={`${pageShell} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <div className="mx-auto max-w-4xl">
        <Reveal className="mb-12 border-b border-[var(--bridge-border)] pb-12">
          <span className="mb-3 block" style={EYEBROW}>
            Guides
          </span>
          <h1
            className="font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', lineHeight: 1.08 }}
          >
            How do I…?
          </h1>
          <p className="mt-3 max-w-xl text-base leading-[1.7] text-[var(--bridge-text-muted)]">
            Search tasks below. Policy and &ldquo;is it free?&rdquo; →{' '}
            <Link to="/faq" className="font-semibold underline underline-offset-4" style={{ color: 'var(--color-primary)' }}>
              FAQ
            </Link>
            .
          </p>

          <div className="relative mt-8">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--bridge-text-muted)]"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search — book session, video call, cancel, trial…"
              aria-label="Search help articles"
              className="w-full rounded-lg border border-[var(--bridge-border)] bg-transparent py-4 pl-12 pr-4 text-lg text-[var(--bridge-text)] outline-none placeholder:text-[var(--bridge-text-muted)] transition focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
        </Reveal>

        {!showBrowse ? (
          <div>
            <p className="mb-6 text-base text-[var(--bridge-text-muted)]">
              {results.length} result{results.length !== 1 && 's'}
            </p>
            {results.length === 0 ? (
              <p className="py-10 text-base text-[var(--bridge-text-secondary)]">
                Nothing matched &ldquo;{search}&rdquo;. Try the{' '}
                <Link to="/faq" className="font-semibold underline underline-offset-4" style={{ color: 'var(--color-primary)' }}>
                  FAQ
                </Link>{' '}
                or{' '}
                <Link to="/contact" className="font-semibold underline underline-offset-4" style={{ color: 'var(--color-primary)' }}>
                  contact us
                </Link>
                .
              </p>
            ) : (
              <ul className="border-t border-[var(--bridge-border)]">
                {results.map(([key, a], i) => {
                  const last = i === results.length - 1;
                  return (
                    <li key={key} style={!last ? HAIRLINE : undefined}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSearch('');
                          setActive(key);
                        }}
                        className="group flex w-full items-center justify-between gap-4 py-5 text-left focus:outline-none focus-visible:underline"
                      >
                        <div className="min-w-0">
                          <p style={EYEBROW}>{a.category}</p>
                          <p className="mt-1 text-base font-semibold text-[var(--bridge-text)]">{a.title}</p>
                        </div>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)] transition group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
              {CATEGORIES.map((cat, ci) => (
                <Reveal key={cat.id} delay={ci * 40}>
                  <div>
                    <h2 className="font-display text-xl font-bold text-[var(--bridge-text)]">
                      {cat.name}
                    </h2>
                    <p className="mt-1 text-base text-[var(--bridge-text-muted)]">{cat.sub}</p>
                    <ArticleList keys={cat.keys} onSelect={setActive} />
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <p className="mt-16 border-t border-[var(--bridge-border)] pt-10 text-base leading-[1.8] text-[var(--bridge-text-secondary)]">
                Still stuck?{' '}
                <Link to="/contact" className="font-semibold underline underline-offset-4" style={{ color: 'var(--color-primary)' }}>
                  {s.common.contactSupport}
                </Link>
                .
              </p>
            </Reveal>
          </>
        )}
      </div>
    </main>
  );
}
