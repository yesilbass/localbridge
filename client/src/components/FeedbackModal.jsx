import { useState, useEffect, useCallback } from 'react';
import { X, Check, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { focusRing } from '../ui';
import { generateTicketId } from '../config/contact';
import { sendSupportEmail } from '../api/supportEmail';
import { useContent } from '../content';

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

const fieldClass =
  'w-full rounded-2xl border px-4 py-3.5 text-sm outline-none transition placeholder:text-[var(--bridge-text-faint)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]';

const fieldStyle = {
  borderColor: 'var(--bridge-border-strong)',
  backgroundColor: 'var(--bridge-surface-muted)',
  color: 'var(--bridge-text)',
};

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
        className="absolute inset-0 backdrop-blur-xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--bridge-text) 52%, transparent)' }}
        aria-label="Close"
        onClick={handleClose}
      />

      <div
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] border shadow-bridge-float sm:rounded-[2rem]"
        style={{
          borderColor: 'var(--bridge-border)',
          backgroundColor: 'var(--bridge-surface-raised)',
          boxShadow: '0 32px 80px -24px color-mix(in srgb, var(--bridge-text) 28%, transparent), inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        {sent ? (
          <div className="relative flex flex-col items-center px-8 py-16 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full blur-3xl"
              style={{ background: 'color-mix(in srgb, var(--color-success) 18%, transparent)' }}
            />
            <div
              className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(135deg, var(--color-success), color-mix(in srgb, var(--color-success) 70%, var(--color-primary)))',
                boxShadow: '0 18px 48px -8px color-mix(in srgb, var(--color-success) 45%, transparent)',
              }}
            >
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
              <div
                className="mt-5 inline-flex flex-col items-center gap-1 rounded-2xl px-5 py-3"
                style={{
                  border: '1px solid var(--bridge-border)',
                  backgroundColor: 'var(--bridge-surface-muted)',
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-faint)]">
                  {category?.key === 'bug' ? 'Bug ticket' : 'Ticket number'}
                </span>
                <code className="font-mono text-base font-semibold tracking-wide text-[var(--color-primary)]">#{ticketId}</code>
                <span className="text-[11px] text-[var(--bridge-text-muted)]">Keep this for replies.</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleClose}
              className={`mt-9 inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-[var(--color-on-primary)] transition hover:-translate-y-0.5 hover:brightness-110 ${focusRing}`}
              style={{
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 12px 30px -8px color-mix(in srgb, var(--color-primary) 55%, transparent)',
              }}
            >
              {s.common.done}
            </button>
          </div>
        ) : (
          <>
            <header
              className="relative shrink-0 overflow-hidden px-6 pb-6 pt-7 sm:px-7"
              style={{
                background: 'linear-gradient(135deg, var(--bridge-surface) 0%, var(--bridge-surface-muted) 100%)',
                borderBottom: '1px solid var(--bridge-border)',
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full blur-3xl"
                style={{ background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)' }}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                    Share feedback · Step {step} of 3
                  </p>
                  <h2 id="feedback-title" className="mt-1.5 font-display text-2xl font-semibold text-[var(--bridge-text)]">
                    {step === 1 && 'What kind of feedback?'}
                    {step === 2 && "How's it going overall?"}
                    {step === 3 && 'Tell us more'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--bridge-surface-muted)] ${focusRing}`}
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    color: 'var(--bridge-text-muted)',
                    border: '1px solid var(--bridge-border)',
                  }}
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
                    style={
                      n <= step
                        ? {
                            backgroundColor: 'var(--color-primary)',
                            boxShadow: '0 0 8px color-mix(in srgb, var(--color-primary) 45%, transparent)',
                          }
                        : { backgroundColor: 'var(--bridge-border)' }
                    }
                  />
                ))}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-7">
              {step === 1 && (
                <div className="space-y-2">
                  {CATEGORIES.map((c) => {
                    const selected = category?.key === c.key;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => {
                          setCategory(c);
                          setStep(2);
                        }}
                        className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ${focusRing}`}
                        style={
                          selected
                            ? {
                                borderColor: 'color-mix(in srgb, var(--color-primary) 55%, transparent)',
                                backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface))',
                                boxShadow: '0 8px 24px -8px color-mix(in srgb, var(--color-primary) 20%, transparent)',
                              }
                            : {
                                borderColor: 'var(--bridge-border)',
                                backgroundColor: 'var(--bridge-surface)',
                              }
                        }
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                          style={{
                            backgroundColor: 'var(--bridge-surface-muted)',
                            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                          }}
                        >
                          {c.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[var(--bridge-text)]">{c.label}</p>
                          <p className="text-xs text-[var(--bridge-text-muted)]">{c.desc}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[var(--bridge-text-faint)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]" />
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {SENTIMENTS.map((item) => {
                    const selected = sentiment?.key === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setSentiment(item);
                          setStep(3);
                        }}
                        className={`group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border py-6 transition-all duration-200 hover:-translate-y-1 ${focusRing}`}
                        style={
                          selected
                            ? {
                                borderColor: 'color-mix(in srgb, var(--color-primary) 55%, transparent)',
                                backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface))',
                                boxShadow: '0 8px 24px -8px color-mix(in srgb, var(--color-primary) 20%, transparent)',
                              }
                            : {
                                borderColor: 'var(--bridge-border)',
                                backgroundColor: 'var(--bridge-surface)',
                              }
                        }
                      >
                        <span
                          aria-hidden
                          className={`pointer-events-none absolute -top-6 left-1/2 h-16 w-24 -translate-x-1/2 rounded-full bg-gradient-to-b ${item.tint} opacity-0 blur-2xl transition group-hover:opacity-30`}
                        />
                        <span className="relative text-4xl transition-transform duration-500 group-hover:scale-110">
                          {item.emoji}
                        </span>
                        <span className="relative text-xs font-bold uppercase tracking-wide text-[var(--bridge-text-secondary)]">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div
                    className="relative overflow-hidden rounded-2xl p-4"
                    style={{
                      border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 7%, var(--bridge-surface-muted))',
                    }}
                  >
                    <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                      You&apos;re reporting
                    </p>
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
                      className={`${fieldClass} resize-none`}
                      style={fieldStyle}
                    />
                    <p className="mt-1.5 text-right text-[10px] font-medium tabular-nums text-[var(--bridge-text-faint)]">
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
                      className={fieldClass}
                      style={fieldStyle}
                    />
                  </div>
                </div>
              )}
            </div>

            <footer
              className="shrink-0 px-6 py-4 sm:px-7"
              style={{
                borderTop: '1px solid var(--bridge-border)',
                backgroundColor: 'var(--bridge-surface-muted)',
              }}
            >
              {submitError && step === 3 && (
                <div
                  role="alert"
                  className="mb-3 rounded-2xl px-3 py-2 text-xs"
                  style={{
                    border: '1px solid color-mix(in srgb, var(--color-error) 30%, transparent)',
                    backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, var(--bridge-surface))',
                    color: 'var(--color-error)',
                  }}
                >
                  {submitError}
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    disabled={submitting}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-[var(--bridge-surface)] disabled:opacity-50 ${focusRing}`}
                    style={{ color: 'var(--bridge-text-secondary)' }}
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
                    className={`group inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      boxShadow: '0 12px 30px -6px color-mix(in srgb, var(--color-primary) 55%, transparent)',
                    }}
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
