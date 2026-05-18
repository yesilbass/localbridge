import { useState, useEffect, useCallback } from 'react';
import { X, Check, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { focusRing } from '../ui';
import { generateTicketId } from '../config/contact';
import { sendSupportEmail } from '../api/supportEmail';
import { useContent } from '../content';

const focusRingWhite =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';

const CATEGORIES = [
  { key: 'bug', label: 'Bug report', icon: '🐛', desc: "Something broken or not working" },
  { key: 'ux', label: 'User experience', icon: '✨', desc: 'Confusing, slow, or could be smoother' },
  { key: 'feature', label: 'Feature request', icon: '💡', desc: 'Something you wish existed' },
  { key: 'mentor', label: 'Mentor feedback', icon: '👤', desc: 'About a mentor or session' },
  { key: 'billing', label: 'Billing / subscription', icon: '💳', desc: 'Payment, plans, or invoices' },
  { key: 'content', label: 'Content / copy', icon: '📝', desc: 'Typos, unclear wording, or docs' },
  { key: 'other', label: 'Other', icon: '💬', desc: "Doesn't fit anywhere else" },
];

const SENTIMENTS = [
  { key: 'love', emoji: '😍', label: 'Love it', tint: 'from-emerald-400 to-teal-400' },
  { key: 'good', emoji: '🙂', label: 'Good', tint: 'from-sky-400 to-cyan-400' },
  { key: 'meh', emoji: '😐', label: 'Meh', tint: 'from-amber-400 to-orange-400' },
  { key: 'bad', emoji: '😞', label: 'Frustrated', tint: 'from-rose-400 to-red-400' },
];

export default function FeedbackModal({ open, onClose }) {
  const { s } = useContent();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setCategory(null);
      setSentiment(null);
      setMessage('');
      setEmail('');
      setSent(false);
      setTicketId(null);
      setSubmitting(false);
      setSubmitError(null);
    }, 220);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, handleClose]);

  if (!open) return null;

  async function submit() {
    if (submitting) return;
    const isBug = category?.key === 'bug';
    const prefix = isBug ? 'BUG' : 'FB';
    const id = generateTicketId(prefix);
    const subjectTag = isBug ? 'Bridge bug report' : 'Bridge feedback';
    const subject = `[${subjectTag}] [#${id}] ${category?.label ?? 'Other'}${sentiment ? ` · ${sentiment.label}` : ''}`;

    const meta = {
      Type: isBug ? 'Bug report' : 'Feedback',
      Category: category?.label ?? '',
      ...(sentiment ? { Sentiment: sentiment.label } : {}),
      Page: typeof window !== 'undefined' ? window.location.href : '',
      ...(email ? { 'Reply to': email } : { 'Reply to': '(anonymous)' }),
      Submitted: new Date().toISOString(),
      ...(isBug
        ? {
            'User agent': navigator.userAgent,
            Language: navigator.language,
            Viewport: `${window.innerWidth}×${window.innerHeight}`,
          }
        : {}),
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      await sendSupportEmail({
        kind: isBug ? 'bug' : 'feedback',
        ticketId: id,
        subject,
        body: message,
        replyTo: email || undefined,
        meta,
      });
      setTicketId(id);
      setSent(true);
    } catch (err) {
      setSubmitError(err?.message || 'Could not send your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xl"
        aria-label="Close"
        onClick={handleClose}
      />
      {/* Aurora behind modal */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2 opacity-50 dark:opacity-70"
        style={{
          background:
            'conic-gradient(from 200deg at 50% 50%, color-mix(in srgb, var(--color-primary) 20%, transparent), color-mix(in srgb, var(--color-primary) 12%, transparent), color-mix(in srgb, var(--color-accent) 14%, transparent), color-mix(in srgb, var(--color-primary) 20%, transparent))',
          filter: 'blur(110px)',
        }}
      />

      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-float sm:rounded-[2rem]">
        {sent ? (
          <div className="relative flex flex-col items-center px-8 py-16 text-center">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.05] dark:opacity-[0.12]" />
            <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-300/30 to-transparent blur-3xl" />
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_18px_48px_-8px_rgba(16,185,129,0.55)]">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="font-display text-3xl font-bold text-[var(--bridge-text)]">
              {category?.key === 'bug' ? 'Bug report received' : 'Thanks for the feedback'}
            </h2>
            <p className="mt-3 max-w-sm leading-relaxed text-[var(--bridge-text-secondary)]">
              {category?.key === 'bug'
                ? 'Engineering triages every bug. If you left your email, we\u2019ll follow up with status updates.'
                : 'Every piece of feedback gets read. If you left your email, we\u2019ll follow up when relevant.'}
            </p>
            {ticketId && (
              <div className="mt-5 inline-flex flex-col items-center gap-1 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-5 py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-muted)]">
                  {category?.key === 'bug' ? 'Bug ticket' : 'Ticket number'}
                </span>
                <code className="font-mono text-base font-semibold tracking-wide text-[var(--bridge-text)]">#{ticketId}</code>
                <span className="text-[11px] text-[var(--bridge-text-muted)]">Keep this for replies.</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleClose}
              className={`btn-sheen mt-9 inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${focusRing}`}
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', boxShadow: '0 12px 30px -8px color-mix(in srgb, var(--color-primary) 50%, transparent)' }}
            >
              {s.common.done}
            </button>
          </div>
        ) : (
          <>
            <header className="relative shrink-0 overflow-hidden px-6 pb-6 pt-7 sm:px-7"
              style={{ background: 'linear-gradient(135deg, var(--bridge-surface-raised) 0%, color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface-raised)) 100%)', borderBottom: '1px solid var(--bridge-border)' }}>
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.06] mix-blend-overlay" />
              <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full blur-3xl" style={{ background: 'color-mix(in srgb, var(--color-primary) 18%, transparent)' }} />
              <div aria-hidden className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full blur-3xl" style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }} />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-primary)' }}>
                    Share feedback · Step {step} of 3
                  </p>
                  <h2 id="feedback-title" className="mt-1.5 font-display text-2xl font-semibold" style={{ color: 'var(--bridge-text)' }}>
                    {step === 1 && 'What kind of feedback?'}
                    {step === 2 && "How's it going overall?"}
                    {step === 3 && 'Tell us more'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${focusRing}`}
                  style={{ backgroundColor: 'color-mix(in srgb, var(--bridge-text) 8%, transparent)', color: 'var(--bridge-text-muted)', border: '1px solid var(--bridge-border)' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--bridge-text) 15%, transparent)'; e.currentTarget.style.color = 'var(--bridge-text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--bridge-text) 8%, transparent)'; e.currentTarget.style.color = 'var(--bridge-text-muted)'; }}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="relative mt-5 flex gap-1.5">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-1 flex-1 rounded-full transition-all duration-500"
                    style={n <= step ? {
                      backgroundColor: 'var(--color-primary)',
                      boxShadow: '0 0 8px color-mix(in srgb, var(--color-primary) 50%, transparent)',
                    } : {
                      backgroundColor: 'var(--bridge-border)',
                    }}
                  />
                ))}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-7">
              {step === 1 && (
                <div className="space-y-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setCategory(c);
                        setStep(2);
                      }}
                      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ${focusRing}`}
                      style={category?.key === c.key ? {
                        borderColor: 'color-mix(in srgb, var(--color-primary) 55%, transparent)',
                        backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface))',
                        boxShadow: '0 8px 24px -8px color-mix(in srgb, var(--color-primary) 30%, transparent)',
                      } : {
                        borderColor: 'var(--bridge-border)',
                        backgroundColor: 'var(--bridge-surface)',
                      }}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bridge-surface-muted)] text-xl ring-1 ring-[var(--bridge-border)]">
                        {c.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[var(--bridge-text)]">{c.label}</p>
                        <p className="text-xs text-[var(--bridge-text-muted)]">{c.desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--bridge-text-faint)] transition group-hover:translate-x-0.5" style={{ color: 'var(--bridge-text-faint)' }} />
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {SENTIMENTS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => {
                        setSentiment(s);
                        setStep(3);
                      }}
                      className={`group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border py-6 transition-all duration-200 hover:-translate-y-1 ${focusRing}`}
                      style={sentiment?.key === s.key ? {
                        borderColor: 'color-mix(in srgb, var(--color-primary) 55%, transparent)',
                        backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface))',
                        boxShadow: '0 8px 24px -8px color-mix(in srgb, var(--color-primary) 30%, transparent)',
                      } : {
                        borderColor: 'var(--bridge-border)',
                        backgroundColor: 'var(--bridge-surface)',
                      }}
                    >
                      <span
                        aria-hidden
                        className={`pointer-events-none absolute -top-6 left-1/2 h-16 w-24 -translate-x-1/2 rounded-full bg-gradient-to-b ${s.tint} opacity-0 blur-2xl transition group-hover:opacity-30`}
                      />
                      <span className="relative text-4xl transition-transform duration-500 group-hover:scale-110">
                        {s.emoji}
                      </span>
                      <span className="relative text-xs font-bold uppercase tracking-wide text-[var(--bridge-text-secondary)]">
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="relative overflow-hidden rounded-2xl p-4"
                    style={{ border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 7%, var(--bridge-surface))' }}>
                    <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full blur-2xl" style={{ background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }} />
                    <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-muted)]">You&apos;re reporting</p>
                    <p className="relative mt-1.5 text-sm font-semibold text-[var(--bridge-text)]">
                      {category?.icon} {category?.label} · {sentiment?.emoji} {sentiment?.label}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
                      Your feedback
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      placeholder="What happened? What did you expect? The more specific, the better."
                      className="w-full resize-none rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-4 py-3.5 text-sm text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:bg-[var(--bridge-surface)]"
                      onFocus={e => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 65%, transparent)'; e.currentTarget.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--color-primary) 14%, transparent)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                    />
                    <p className="mt-1.5 text-right text-[10px] font-medium text-[var(--bridge-text-faint)]">
                      {message.length} characters
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
                      Email{' '}
                      <span className="text-[10px] font-medium normal-case text-[var(--bridge-text-faint)]">
                        (optional — only if you want a reply)
                      </span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-4 py-3.5 text-sm text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:bg-[var(--bridge-surface)]"
                      onFocus={e => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 65%, transparent)'; e.currentTarget.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--color-primary) 14%, transparent)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                    />
                  </div>
                </div>
              )}
            </div>

            <footer className="shrink-0 border-t border-[var(--bridge-border)] bg-[var(--bridge-surface)]/95 px-6 py-4 sm:px-7">
              {submitError && step === 3 && (
                <div role="alert" className="mb-3 rounded-2xl border border-red-300/60 bg-red-50 px-3 py-2 text-xs text-red-900 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-100">
                  {submitError}
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    disabled={submitting}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] disabled:opacity-50 ${focusRing}`}
                  >
                    <ArrowLeft className="h-4 w-4" /> {s.common.back}
                  </button>
                ) : (
                  <span />
                )}
                {step === 3 ? (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!message.trim() || submitting}
                    className={`btn-sheen group inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', boxShadow: '0 12px 30px -6px color-mix(in srgb, var(--color-primary) 55%, transparent)' }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Send feedback
                      </>
                    )}
                  </button>
                ) : (
                  <span />
                )}
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
