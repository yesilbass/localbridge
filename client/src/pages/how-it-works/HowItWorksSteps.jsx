import {
  Search, Calendar, Video, Sparkles, FileText, Zap, UserPlus,
  Star, MapPin, Check, MessageSquare, Mic,
} from 'lucide-react';
import RevealOnScroll from '../landing/RevealOnScroll';
import { SESSION_STEPS, TOOL_STEPS } from './howItWorksData';

const VISUALS = {
  signup: SignupVisual,
  discover: DiscoverVisual,
  book: BookVisual,
  call: CallVisual,
  profile: ProfileVisual,
  match: MatchVisual,
  prep: PrepVisual,
  priority: PriorityVisual,
};

const CARD_SHADOW =
  '0 28px 70px -32px color-mix(in srgb, var(--bridge-text) 22%, transparent), 0 0 0 1px color-mix(in srgb, var(--bridge-border) 35%, transparent)';

const FLOAT_SHADOW =
  '0 18px 48px -20px color-mix(in srgb, var(--color-primary) 28%, transparent), 0 0 0 1px color-mix(in srgb, var(--bridge-border) 40%, transparent)';

export default function HowItWorksSteps({ track }) {
  const steps = track === 'tools' ? TOOL_STEPS : SESSION_STEPS;

  return (
    <section
      id="steps"
      aria-label="How Bridge works steps"
      className="bg-[var(--bridge-canvas)] py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 xl:max-w-[88rem] xl:px-16">
        <ol className="flex flex-col gap-24 sm:gap-28 lg:gap-32">
          {steps.map((step, index) => {
            const Visual = VISUALS[step.visual] ?? SignupVisual;
            const textFirst = index % 2 === 0;

            return (
              <RevealOnScroll key={step.num} delay={index * 40}>
                <li className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
                  <div className={`flex justify-center lg:justify-end ${textFirst ? 'lg:order-2' : ''}`}>
                    <Visual />
                  </div>
                  <div className={textFirst ? '' : 'lg:order-2'}>
                    <p
                      className="text-sm font-bold tabular-nums tracking-[0.08em]"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {step.num}
                    </p>
                    <h3
                      className="mt-3 font-display font-black tracking-[-0.02em] text-[var(--bridge-text)]"
                      style={{ fontSize: 'clamp(1.375rem, 2.6vw, 1.875rem)' }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="mt-4 max-w-lg leading-[1.7] text-[var(--bridge-text-secondary)]"
                      style={{ fontSize: 'clamp(1rem, 1.4vw, 1.0625rem)' }}
                    >
                      {step.body}
                    </p>
                    <span
                      className="mt-6 inline-flex rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {step.chip}
                    </span>
                  </div>
                </li>
              </RevealOnScroll>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function VisualRoot({ children, className = '' }) {
  return (
    <div aria-hidden className={`relative w-full max-w-[min(100%,22rem)] sm:max-w-[24rem] ${className}`}>
      {children}
    </div>
  );
}

function MentorAvatar({ size = 48, gradient = 'linear-gradient(135deg, #4F46E5, #818CF8)' }) {
  return (
    <div
      className="shrink-0 rounded-full"
      style={{ width: size, height: size, background: gradient }}
    />
  );
}

function SignupVisual() {
  return (
    <VisualRoot>
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: CARD_SHADOW }}
      >
        <div className="flex items-center gap-2.5">
          <UserPlus className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
          <span className="text-[13px] font-bold text-[var(--bridge-text)]">Create your free account</span>
        </div>
        <div className="mt-4 space-y-2.5">
          {[
            { label: 'Target role', value: 'Staff Engineer' },
            { label: 'Industry', value: 'Fintech' },
            { label: 'Years experience', value: '6 years' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl px-3.5 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--bridge-text-faint)]">{label}</p>
              <p className="mt-0.5 text-[13px] font-semibold text-[var(--bridge-text)]">{value}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-xl py-2.5 text-[13px] font-bold text-[var(--color-on-primary)]"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Continue — no card required
        </button>
      </div>
      <div
        className="absolute -bottom-3 -right-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          color: 'var(--color-success)',
          boxShadow: FLOAT_SHADOW,
        }}
      >
        <Check className="h-3.5 w-3.5" aria-hidden />
        Ready in 30 sec
      </div>
    </VisualRoot>
  );
}

function DiscoverVisual() {
  return (
    <VisualRoot className="pb-6 pl-2">
      <div
        className="rounded-2xl p-4 sm:p-5"
        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: CARD_SHADOW }}
      >
        <div
          className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2"
        >
          <Search className="h-3.5 w-3.5 text-[var(--bridge-text-muted)]" aria-hidden />
          <span className="text-[12px] text-[var(--bridge-text-secondary)]">Staff engineer · Fintech · Interview prep</span>
        </div>
        <div className="flex gap-3">
          <MentorAvatar size={52} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[14px] font-bold text-[var(--bridge-text)]">Maya Chen</p>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-success) 14%, transparent)', color: 'var(--color-success)' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
                Open today
              </span>
            </div>
            <p className="text-[12px] text-[var(--bridge-text-secondary)]">Director of Engineering · Stripe</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--bridge-text-muted)]">
              <MapPin className="h-3 w-3" aria-hidden /> SF · English
            </p>
            <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[var(--color-primary)]">
              <Star className="h-3 w-3 fill-[var(--color-primary)]" aria-hidden />
              4.9 · 86 sessions · Free
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['System design', 'Staff promo', 'Fintech'].map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-[var(--bridge-text-secondary)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div
        className="absolute -bottom-1 left-0 w-[11.5rem] rounded-xl p-3 sm:w-[12.5rem]"
        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: FLOAT_SHADOW }}
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--bridge-text-muted)]">Session type</p>
        <div className="mt-2 space-y-1.5">
          {['Interview prep', 'Career advice', 'Resume review'].map((t, i) => (
            <label key={t} className="flex items-center gap-2 text-[11px] font-medium text-[var(--bridge-text-secondary)]">
              <span
                className="flex h-3.5 w-3.5 items-center justify-center rounded"
                style={{
                  backgroundColor: i === 0 ? 'var(--color-primary)' : 'var(--bridge-surface-muted)',
                  boxShadow: i === 0 ? 'none' : 'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
                {i === 0 && <Check className="h-2.5 w-2.5 text-[var(--color-on-primary)]" aria-hidden />}
              </span>
              {t}
            </label>
          ))}
        </div>
      </div>
    </VisualRoot>
  );
}

function BookVisual() {
  return (
    <VisualRoot className="pb-8 pt-2">
      <div
        className="rounded-2xl p-4 opacity-90"
        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: CARD_SHADOW }}
      >
        <div className="flex items-center gap-3">
          <MentorAvatar size={44} />
          <div>
            <p className="text-[13px] font-bold text-[var(--bridge-text)]">Maya Chen</p>
            <p className="text-[11px] text-[var(--bridge-text-muted)]">Director of Eng · Stripe</p>
          </div>
        </div>
        <div
          className="mt-3 rounded-xl py-2 text-center text-[12px] font-bold text-[var(--color-on-primary)]"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Book a session
        </div>
      </div>
      <div
        className="absolute bottom-0 right-0 w-[14.5rem] rounded-2xl p-4 sm:w-[15.5rem]"
        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: FLOAT_SHADOW }}
      >
        <p className="text-[12px] font-bold text-[var(--bridge-text)]">Request session with Maya</p>
        <p className="mt-1 text-[10px] leading-snug text-[var(--bridge-text-muted)]">Interview prep · 45 min · Free</p>
        <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-[var(--bridge-text-secondary)]">
          <Calendar className="h-3.5 w-3.5 text-[var(--color-primary)]" aria-hidden />
          Tue, May 28 · 2:00 PM
        </div>
        <p
          className="mt-2.5 rounded-lg px-2.5 py-2 text-[10px] leading-relaxed text-[var(--bridge-text-muted)]"
        >
          Senior loop next week — want feedback on system design stories.
        </p>
        <div
          className="mt-3 rounded-xl py-2 text-center text-[11px] font-bold text-[var(--color-on-primary)]"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Send request
        </div>
      </div>
    </VisualRoot>
  );
}

function CallVisual() {
  return (
    <VisualRoot>
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(165deg, var(--color-midnight) 0%, var(--color-midnight-raised) 100%)',
          boxShadow: '0 28px 70px -28px color-mix(in srgb, var(--color-midnight) 80%, transparent)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-success)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
            Live session
          </span>
          <span className="text-[11px] font-semibold tabular-nums text-white/60">32:14</span>
        </div>
        <div className="grid grid-cols-2 gap-2 px-4 pb-3">
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 40%, #000)' }}
          >
            <div className="absolute inset-0 flex items-end p-2">
              <span className="rounded-md bg-black/40 px-2 py-0.5 text-[9px] font-semibold text-white/90">You</span>
            </div>
          </div>
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-xl"
            style={{ backgroundColor: 'color-mix(in srgb, white 10%, transparent)' }}
          >
            <div className="absolute inset-0 flex items-end p-2">
              <span className="rounded-md bg-black/40 px-2 py-0.5 text-[9px] font-semibold text-white/90">Maya</span>
            </div>
          </div>
        </div>
        <div className="mx-4 mb-4 flex items-center justify-center gap-3 rounded-xl py-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <Mic className="h-4 w-4 text-white/70" aria-hidden />
          <Video className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
          <span className="text-[10px] font-bold text-white/80">In Bridge — not Zoom</span>
        </div>
      </div>
      <div
        className="absolute -bottom-2 -right-1 flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: FLOAT_SHADOW }}
      >
        <FileText className="h-3.5 w-3.5 text-[var(--color-primary)]" aria-hidden />
        <span className="text-[11px] font-semibold text-[var(--bridge-text)]">Notes saved to dashboard</span>
      </div>
    </VisualRoot>
  );
}

function ProfileVisual() {
  return (
    <VisualRoot>
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: CARD_SHADOW }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--bridge-text-muted)]">Career profile</p>
        <p className="mt-1 text-[15px] font-bold text-[var(--bridge-text)]">Your matching snapshot</p>
        <dl className="mt-4 space-y-3">
          {[
            ['Target role', 'Staff Engineer'],
            ['Industry', 'Fintech'],
            ['Top goal', 'Promotion track'],
            ['Session needs', 'Interview prep'],
          ].map(([dt, dd]) => (
            <div key={dt} className="flex items-baseline justify-between gap-3 border-b pb-2 last:border-0" style={{ borderColor: 'color-mix(in srgb, var(--bridge-border) 50%, transparent)' }}>
              <dt className="text-[11px] text-[var(--bridge-text-muted)]">{dt}</dt>
              <dd className="text-[12px] font-semibold text-[var(--bridge-text)]">{dd}</dd>
            </div>
          ))}
        </dl>
        <div
          className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface-muted))' }}
        >
          <FileText className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
          <div>
            <p className="text-[12px] font-semibold text-[var(--bridge-text)]">resume.pdf</p>
            <p className="text-[10px] text-[var(--bridge-text-muted)]">Uploaded · ready for AI review</p>
          </div>
        </div>
      </div>
    </VisualRoot>
  );
}

function MatchVisual() {
  return (
    <VisualRoot className="pb-4">
      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: CARD_SHADOW }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
          <p className="text-[13px] font-bold text-[var(--bridge-text)]">AI-ranked for you</p>
        </div>
        <ul className="mt-3 space-y-2">
          {[
            { name: 'Jordan Lee', role: 'Staff Eng · Plaid', score: '96%', why: 'Same promo path + fintech' },
            { name: 'Sam Ortiz', role: 'Principal · Coinbase', score: '91%', why: 'Deep loop experience' },
            { name: 'Rina Park', role: 'Dir. Eng · Brex', score: '88%', why: 'Staff IC → manager arc' },
          ].map((m, i) => (
            <li
              key={m.name}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{
                backgroundColor: i === 0
                  ? 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface-muted))'
                  : 'var(--bridge-surface-muted)',
              }}
            >
              <MentorAvatar size={36} gradient={`linear-gradient(135deg, hsl(${240 + i * 20}, 70%, 55%), hsl(${260 + i * 20}, 80%, 70%))`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[12px] font-bold text-[var(--bridge-text)]">{m.name}</p>
                  <span className="shrink-0 text-[11px] font-black tabular-nums text-[var(--color-primary)]">{m.score}</span>
                </div>
                <p className="text-[10px] text-[var(--bridge-text-muted)]">{m.role}</p>
                <p className="mt-0.5 text-[10px] text-[var(--bridge-text-secondary)]">{m.why}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </VisualRoot>
  );
}

function PrepVisual() {
  return (
    <VisualRoot className="pb-6">
      <div className="grid gap-3">
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: CARD_SHADOW }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--bridge-text-muted)]">Resume review</p>
          <div className="mt-2 flex items-end gap-3">
            <p className="font-display text-4xl font-black tabular-nums text-[var(--color-primary)]">82</p>
            <p className="pb-1 text-[11px] text-[var(--bridge-text-muted)]">/ 100 · 4 fixes flagged</p>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full">
            <div className="h-full w-[82%] rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
          </div>
        </div>
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: CARD_SHADOW }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--bridge-text-muted)]">Coming up</p>
          <div className="mt-2 flex items-center gap-3">
            <MentorAvatar size={32} />
            <div>
              <p className="text-[12px] font-bold text-[var(--bridge-text)]">Maya Chen · Interview prep</p>
              <p className="text-[11px] text-[var(--bridge-text-muted)]">Thu 4:00 PM · synced to calendar</p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="absolute -bottom-1 right-0 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em]"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', boxShadow: FLOAT_SHADOW }}
      >
        Plus · unlimited AI
      </div>
    </VisualRoot>
  );
}

function PriorityVisual() {
  return (
    <VisualRoot>
      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: CARD_SHADOW }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
            <p className="text-[13px] font-bold text-[var(--bridge-text)]">Match queue</p>
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}
          >
            Pro
          </span>
        </div>
        <ol className="mt-3 space-y-2">
          {[
            { label: 'Your request', sub: 'Staff engineer · Fintech', active: true },
            { label: 'Other mentee', sub: 'Waiting', active: false },
            { label: 'Other mentee', sub: 'Waiting', active: false },
          ].map((item, i) => (
            <li
              key={`${item.label}-${i}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{
                backgroundColor: item.active
                  ? 'color-mix(in srgb, var(--color-primary) 12%, var(--bridge-surface-muted))'
                  : 'var(--bridge-surface-muted)',
              }}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black tabular-nums"
                style={{
                  backgroundColor: item.active ? 'var(--color-primary)' : 'var(--bridge-surface)',
                  color: item.active ? 'var(--color-on-primary)' : 'var(--bridge-text-muted)',
                }}
              >
                {i + 1}
              </span>
              <div>
                <p className="text-[12px] font-bold text-[var(--bridge-text)]">{item.label}</p>
                <p className="text-[10px] text-[var(--bridge-text-muted)]">{item.sub}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div
        className="absolute -bottom-3 -left-1 max-w-[13rem] rounded-xl p-3"
        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: FLOAT_SHADOW }}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-[var(--color-primary)]" aria-hidden />
          <p className="text-[11px] font-semibold text-[var(--bridge-text)]">Early access mentors</p>
        </div>
        <p className="mt-1 text-[10px] leading-snug text-[var(--bridge-text-muted)]">New operators surface in your queue first.</p>
      </div>
    </VisualRoot>
  );
}
