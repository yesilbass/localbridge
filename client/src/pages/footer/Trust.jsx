import { useState } from 'react';
import { ShieldCheck, Lock, CreditCard, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';
import { generateTicketId } from '../../config/contact';
import { sendSupportEmail } from '../../api/supportEmail';
import { useContent } from '../../content';

const INSET = { boxShadow: 'inset 0 0 0 1px var(--bridge-border)' };
const INSET_FOCUS = 'inset 0 0 0 1px var(--bridge-border), 0 0 0 4px color-mix(in srgb, var(--color-primary) 18%, transparent)';
const INSET_GREEN = { boxShadow: 'inset 0 0 0 1px color-mix(in srgb, #10b981 35%, transparent)' };
const INSET_RED = { boxShadow: 'inset 0 0 0 1px color-mix(in srgb, #ef4444 45%, transparent)' };

export default function Trust() {
  const { s } = useContent();
  const [form, setForm] = useState({ type: 'Conduct issue', description: '', contact: '' });
  const [sent, setSent] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const pillars = [
    { title: 'Verified mentors', desc: 'Identity, credentials, and portfolio verified. Under 20% of applicants pass.', stat: '< 20%', Icon: ShieldCheck, hue: 'from-orange-500 to-amber-500' },
    { title: 'Encrypted in transit and at rest', desc: 'AES-256 encryption. SOC 2 Type II compliant.', stat: 'SOC 2', Icon: Lock, hue: 'from-sky-500 to-indigo-500' },
    { title: 'PCI-compliant payments', desc: 'Stripe handles all card processing. We never see your card number.', stat: 'PCI-DSS', Icon: CreditCard, hue: 'from-violet-500 to-fuchsia-500' },
    { title: 'Satisfaction guarantee', desc: '48-hour full refund window on every completed session.', stat: '48 hrs', Icon: Clock, hue: 'from-emerald-500 to-teal-500' },
  ];

  const standards = [
    'Respectful communication in all interactions',
    "No discrimination based on race, gender, sexuality, religion, or background",
    'No sharing of confidential information outside the platform',
    "No solicitation of services outside Bridge's payment system",
    'Honest representation of credentials and experience',
    'Prompt cancellation if unable to attend',
  ];

  function fieldHandlers(el) {
    return {
      style: INSET,
      onFocus: () => { el.style.boxShadow = INSET_FOCUS; },
      onBlur: () => { el.style.boxShadow = INSET.boxShadow; }
    };
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.description.trim() || submitting) return;
    const id = generateTicketId('SAFE');
    const subject = `[Bridge Trust & Safety] [#${id}] ${form.type}`;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await sendSupportEmail({
        kind: 'safety',
        ticketId: id,
        subject,
        body: form.description,
        replyTo: form.contact || undefined,
        meta: {
          Concern: form.type,
          'Reply to': form.contact || '(anonymous)',
          Page: typeof window !== 'undefined' ? window.location.href : '',
          Submitted: new Date().toISOString()
        }
      });
      setTicketId(id);
      setSent(true);
    } catch (err) {
      setSubmitError(err?.message || 'Could not submit your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40vmax] w-[70vmax] -translate-x-1/2"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 20%, transparent), transparent 70%)',
          filter: 'blur(80px)',
          opacity: 0.28
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        <Reveal className="mb-14 max-w-3xl">
          <span
            className="mb-4 block"
            style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.32em', color: 'var(--color-primary)' }}
          >
            {s.footer.trustSafety}
          </span>
          <h1
            className="font-display font-black text-[var(--bridge-text)]"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', lineHeight: 1.02, letterSpacing: '-0.03em' }}
          >
            How Bridge keeps the community safe.
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
            The technical measures we enforce, the standards we expect from everyone, and how to report anything that doesn't feel right.
          </p>
        </Reveal>

        <div className="mb-16 grid gap-5 md:grid-cols-2">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div
                className="relative overflow-hidden rounded-2xl bg-[var(--bridge-surface)] p-8 sm:p-10"
                style={INSET}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${p.hue} text-white`}>
                    <p.Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-display font-semibold text-[var(--bridge-text)]">{p.title}</p>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-0.5"
                        style={{
                          fontSize: '10px',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.32em',
                          color: 'var(--color-primary)',
                          boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 28%, transparent)',
                          backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
                        }}
                      >
                        {p.stat}
                      </span>
                    </div>
                    <p className="mt-2 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">{p.desc}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div
            className="relative mb-12 overflow-hidden rounded-2xl bg-[var(--bridge-surface)] p-8 sm:p-10"
            style={INSET}
          >
            <span
              className="mb-3 block"
              style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.32em', color: 'var(--color-primary)' }}
            >
              Community standards
            </span>
            <h2 className="font-display font-semibold text-xl text-[var(--bridge-text)] sm:text-2xl">
              What we expect from everyone
            </h2>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {standards.map((std) => (
                <li
                  key={std}
                  className="flex items-start gap-3 rounded-2xl bg-[var(--bridge-canvas)] p-4"
                  style={INSET}
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">{std}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div
            className="relative overflow-hidden rounded-2xl bg-[var(--bridge-surface)] p-8 sm:p-10"
            style={INSET}
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <span
                  className="mb-2 block"
                  style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.32em', color: 'var(--color-primary)' }}
                >
                  Report a concern
                </span>
                <h2 className="font-display font-semibold text-xl text-[var(--bridge-text)] sm:text-2xl">
                  Submit a safety report
                </h2>
                <p className="mt-2 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                  All reports are confidential and reviewed within 4 hours. Leave contact info blank to report anonymously.
                </p>
              </div>
            </div>

            {sent ? (
              <div
                className="flex flex-wrap items-center gap-4 rounded-2xl bg-[var(--bridge-surface)] p-6"
                style={INSET_GREEN}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-semibold text-[var(--bridge-text)]">Report received</p>
                  <p className="text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">Our team will review within 4 hours.</p>
                </div>
                {ticketId && (
                  <div
                    className="flex flex-col items-start gap-0.5 rounded-xl bg-[var(--bridge-canvas)] px-4 py-2"
                    style={INSET}
                  >
                    <span
                      style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.32em', color: 'var(--bridge-text-muted)' }}
                    >
                      Ticket
                    </span>
                    <code className="font-mono text-sm font-semibold tracking-wide text-[var(--bridge-text)]">#{ticketId}</code>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.32em] text-[var(--bridge-text-muted)]">
                    Type of concern
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-2xl bg-[var(--bridge-surface)] px-4 py-3.5 text-[15px] text-[var(--bridge-text)] outline-none transition"
                    style={INSET}
                    onFocus={(e) => { e.currentTarget.style.boxShadow = INSET_FOCUS; }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = INSET.boxShadow; }}
                  >
                    <option>Conduct issue</option>
                    <option>Harassment or discrimination</option>
                    <option>Misrepresented credentials</option>
                    <option>Payment or fraud issue</option>
                    <option>Privacy violation</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.32em] text-[var(--bridge-text-muted)]">
                    What happened?
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe what happened — the more detail, the faster we can help."
                    className="w-full resize-none rounded-2xl bg-[var(--bridge-surface)] px-4 py-3.5 text-[15px] text-[var(--bridge-text)] outline-none transition placeholder:text-[var(--bridge-text-muted)]"
                    style={INSET}
                    onFocus={(e) => { e.currentTarget.style.boxShadow = INSET_FOCUS; }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = INSET.boxShadow; }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.32em] text-[var(--bridge-text-muted)]">
                    Your email{' '}
                    <span className="text-[10px] font-medium normal-case text-[var(--bridge-text-muted)]">
                      (optional — leave blank to report anonymously)
                    </span>
                  </label>
                  <input
                    type="email"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl bg-[var(--bridge-surface)] px-4 py-3.5 text-[15px] text-[var(--bridge-text)] outline-none transition placeholder:text-[var(--bridge-text-muted)]"
                    style={INSET}
                    onFocus={(e) => { e.currentTarget.style.boxShadow = INSET_FOCUS; }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = INSET.boxShadow; }}
                  />
                </div>

                {submitError && (
                  <div
                    role="alert"
                    className="rounded-2xl bg-[var(--bridge-surface)] px-4 py-3 text-[15px] leading-[1.75] text-[var(--bridge-text)]"
                    style={INSET_RED}
                  >
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-[var(--color-on-primary)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${focusRing}`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Submit report
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </main>
  );
}
