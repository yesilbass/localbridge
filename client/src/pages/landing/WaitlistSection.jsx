import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import supabase from '../../api/supabase';

export default function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase
      .from('waitlist')
      .insert({ email: email.trim().toLowerCase() });

    if (error) {
      if (error.code === '23505') {
        setStatus('success');
      } else {
        setErrorMsg('Something went wrong. Try again or email us directly.');
        setStatus('error');
      }
    } else {
      setStatus('success');
    }
  }

  return (
    <section
      id="waitlist"
      aria-labelledby="waitlist-heading"
      className="py-24 lg:py-32"
      style={{
        backgroundColor: 'var(--bridge-canvas)',
        scrollMarginTop: 'calc(6.25rem + 24px)',
      }}
    >
      <div className="mx-auto max-w-lg px-5 sm:px-8 text-center">
        <p className="text-[10px] font-black uppercase" style={{ color: 'var(--color-primary)', letterSpacing: '0.3em' }}>
          FOR MENTEES
        </p>
        <h2
          id="waitlist-heading"
          className="mt-3 font-display font-black"
          style={{
            fontSize: 'clamp(1.85rem, 4vw, 2.75rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: 'var(--bridge-text)',
          }}
        >
          Get notified
          <br />
          <span style={{ color: 'var(--color-primary)' }}>at launch.</span>
        </h2>
        <p
          className="mt-4 mx-auto"
          style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--bridge-text-secondary)', maxWidth: '24rem' }}
        >
          We'll email you the moment mentors are live. One email, no spam.
        </p>

        {status === 'success' ? (
          <div
            className="mt-10 rounded-2xl px-8 py-6"
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
            }}
          >
            <p className="font-semibold" style={{ color: 'var(--bridge-text)' }}>You're on the list.</p>
            <p className="mt-1" style={{ fontSize: 14, color: 'var(--bridge-text-secondary)' }}>
              We'll reach out when we're ready.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-3" noValidate>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3.5 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--bridge-text)',
              }}
            />
            {errorMsg && (
              <p role="alert" style={{ fontSize: 13, color: '#ef4444' }}>{errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="lp-cta inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                outlineColor: 'var(--color-primary)',
              }}
            >
              {status === 'loading' ? 'Saving…' : (
                <>
                  Notify me
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
