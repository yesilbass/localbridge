import { useState } from 'react';
import { Mail, Phone, MapPin, ShieldAlert, CheckCircle2, Send, ArrowRight, Loader2 } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';
import { COMPANY_EMAIL, generateTicketId } from '../../config/contact';
import { sendSupportEmail } from '../../api/supportEmail';
import { useContent } from '../../content';

const INPUT_CLASS =
  'w-full rounded-2xl px-4 py-3.5 text-[15px] text-[var(--bridge-text)] outline-none placeholder:text-[var(--bridge-text-muted)] shadow-[inset_0_0_0_1px_var(--bridge-border)] transition focus:shadow-[inset_0_0_0_1.5px_var(--color-primary),0_0_0_4px_color-mix(in_srgb,var(--color-primary)_18%,transparent)] focus:bg-[var(--bridge-surface)]';

export default function Contact() {
  const { s } = useContent();
  const [form, setForm] = useState({ name: '', email: '', topic: 'General question', message: '' });
  const [sent, setSent] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message || submitting) return;

    const id = generateTicketId();
    const subject = `[${form.topic}] [#${id}] Bridge contact from ${form.name}`;
    const body = [`Topic: ${form.topic}`, `From: ${form.name} <${form.email}>`, '', form.message].join('\n');

    setSubmitting(true);
    setSubmitError(null);
    try {
      await sendSupportEmail({
        kind: 'contact',
        ticketId: id,
        subject,
        body,
        replyTo: form.email,
        fromName: form.name,
        meta: {
          Topic: form.topic,
          Name: form.name,
          Email: form.email,
          Page: typeof window !== 'undefined' ? window.location.href : '',
          Submitted: new Date().toISOString(),
        },
      });
      setTicketId(id);
      setSent(true);
    } catch (err) {
      setSubmitError(err?.message || 'Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const cards = [
    { Icon: Mail, eyebrow: s.footer.contactEmailLabel, primary: COMPANY_EMAIL, secondary: s.footer.contactEmailSecondary },
    { Icon: Phone, eyebrow: s.footer.contactPhoneLabel, primary: '+1 (555) 123-4567', secondary: s.footer.contactPhoneSecondary },
    { Icon: MapPin, eyebrow: s.footer.contactOfficeLabel, primary: '525 Market Street', secondary: 'San Francisco, CA 94105' },
  ];

  return (
    <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[50vmax] w-[80vmax] -translate-x-1/2 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 68%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative mx-auto max-w-bridge">
        <Reveal className="mb-12 max-w-2xl">
          <p
            className="mb-4 text-[10px] font-black uppercase"
            style={{ letterSpacing: '0.32em', color: 'var(--color-primary)' }}
          >
            Contact support
          </p>
          <h1
            className="font-display font-black text-[var(--bridge-text)]"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
            }}
          >
            Get in touch
          </h1>
          <p className="mt-5 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
            We respond to every message within 24 hours, usually faster.
          </p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="space-y-4">
              {cards.map(({ Icon, eyebrow, primary, secondary }) => (
                <div
                  key={eyebrow}
                  className="group relative flex items-start gap-4 overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent)',
                    }}
                  />
                  <div
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-[1.04]"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--color-primary) 12%, var(--bridge-surface))',
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div className="relative min-w-0">
                    <p
                      className="text-[10px] font-black uppercase"
                      style={{ letterSpacing: '0.32em', color: 'var(--color-primary)' }}
                    >
                      {eyebrow}
                    </p>
                    <p className="mt-1 font-display text-[15px] font-semibold text-[var(--bridge-text)]">
                      {primary}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[var(--bridge-text-muted)]">{secondary}</p>
                  </div>
                </div>
              ))}

              <div
                className="relative flex items-start gap-4 overflow-hidden rounded-2xl p-5"
                style={{
                  backgroundColor:
                    'color-mix(in srgb, var(--color-error) 6%, var(--bridge-surface))',
                  boxShadow:
                    'inset 0 0 0 1px color-mix(in srgb, var(--color-error) 28%, transparent)',
                }}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{
                    backgroundColor: 'var(--color-error)',
                    boxShadow:
                      '0 8px 22px -6px color-mix(in srgb, var(--color-error) 45%, transparent)',
                  }}
                >
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[10px] font-black uppercase"
                    style={{ letterSpacing: '0.32em', color: 'var(--color-error)' }}
                  >
                    Urgent?
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.65] text-[var(--bridge-text-secondary)]">
                    For Trust &amp; Safety issues, use the{' '}
                    <a
                      href="/trust"
                      className="font-semibold underline underline-offset-2 transition hover:opacity-80"
                      style={{
                        color: 'var(--color-error)',
                        textDecorationColor:
                          'color-mix(in srgb, var(--color-error) 40%, transparent)',
                      }}
                    >
                      Trust &amp; Safety report form
                    </a>{' '}
                    — reviewed within 4 hours and routed to{' '}
                    <span className="font-semibold">{COMPANY_EMAIL}</span>.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-3">
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5"
                style={{ backgroundColor: 'var(--color-primary)', opacity: 0.7 }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent)',
                }}
              />
              <div className="relative p-8 sm:p-10">
                {sent ? (
                  <div className="py-10 text-center">
                    <div
                      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
                      style={{
                        backgroundColor:
                          'color-mix(in srgb, var(--color-success) 12%, var(--bridge-surface))',
                        boxShadow:
                          '0 16px 40px -8px color-mix(in srgb, var(--color-success) 35%, transparent)',
                      }}
                    >
                      <CheckCircle2 className="h-10 w-10" style={{ color: 'var(--color-success)' }} />
                    </div>
                    <h2 className="mt-6 font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                      {s.footer.contactSentHeading}
                    </h2>
                    <p className="mt-3 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                      {s.footer.contactSentBody}
                    </p>
                    {ticketId && (
                      <div
                        className="mx-auto mt-6 inline-flex flex-col items-center gap-1 rounded-2xl px-5 py-4"
                        style={{
                          backgroundColor: 'var(--bridge-surface-muted)',
                          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                        }}
                      >
                        <span
                          className="text-[10px] font-black uppercase"
                          style={{ letterSpacing: '0.32em', color: 'var(--color-primary)' }}
                        >
                          {s.footer.contactTicketLabel}
                        </span>
                        <code className="font-mono text-base font-semibold tabular-nums tracking-wide text-[var(--bridge-text)]">
                          #{ticketId}
                        </code>
                        <span className="text-[12px] text-[var(--bridge-text-muted)]">
                          {s.footer.contactReplyNote}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setSent(false);
                        setTicketId(null);
                        setForm({ name: '', email: '', topic: 'General question', message: '' });
                      }}
                      className={`mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-[var(--bridge-text-secondary)] transition hover:-translate-y-0.5 hover:text-[var(--bridge-text)] ${focusRing}`}
                      style={{
                        backgroundColor: 'var(--bridge-surface)',
                        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                      }}
                    >
                      Send another <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <p
                        className="text-[10px] font-black uppercase"
                        style={{ letterSpacing: '0.32em', color: 'var(--color-primary)' }}
                      >
                        Send us a message
                      </p>
                      <h2 className="mt-2 font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                        We read every one
                      </h2>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
                          {s.footer.contactNameLabel}
                        </label>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={`${INPUT_CLASS} ${focusRing}`}
                          style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
                          {s.footer.contactEmailLabel2}
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className={`${INPUT_CLASS} ${focusRing}`}
                          style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
                        {s.footer.contactTopicLabel}
                      </label>
                      <select
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
                        className={`${INPUT_CLASS} ${focusRing}`}
                        style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
                      >
                        <option>General question</option>
                        <option>Billing issue</option>
                        <option>Session problem</option>
                        <option>Partnership</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
                        {s.footer.contactMessageLabel}
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell us what's up — the more specific, the better."
                        className={`resize-none ${INPUT_CLASS} ${focusRing}`}
                        style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
                      />
                      <p className="mt-1.5 text-right text-[11px] font-medium text-[var(--bridge-text-muted)]">
                        {form.message.length} characters
                      </p>
                    </div>

                    {submitError && (
                      <div
                        role="alert"
                        className="rounded-2xl px-4 py-3 text-[14px] leading-[1.65]"
                        style={{
                          backgroundColor:
                            'color-mix(in srgb, var(--color-error) 8%, var(--bridge-surface))',
                          boxShadow:
                            'inset 0 0 0 1px color-mix(in srgb, var(--color-error) 35%, transparent)',
                          color: 'var(--color-error)',
                        }}
                      >
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className={`group relative inline-flex w-full items-center justify-center gap-2 rounded-full py-4 text-[15px] font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${focusRing}`}
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        boxShadow:
                          '0 14px 36px -8px color-mix(in srgb, var(--color-primary) 50%, transparent)',
                      }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {s.footer.contactSending}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {s.footer.contactSendCta}
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
