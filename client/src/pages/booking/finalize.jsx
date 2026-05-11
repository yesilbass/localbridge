import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { finalizeCheckout } from '../../api/stripe';
import CalendlyInlineWidget from '../../components/CalendlyInlineWidget';

export default function BookingFinalizePage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!sessionId) { setError('Missing checkout session id.'); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const res = await finalizeCheckout(sessionId);
      if (cancelled) return;
      if (!res.ok) { setError(res.error || 'Could not finalize your booking.'); setLoading(false); return; }
      setResult(res.data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [sessionId]);

  const prefill = useMemo(() => ({
    name: user?.user_metadata?.full_name || user?.email || undefined,
    email: user?.email || undefined,
  }), [user]);

  const utm = useMemo(() => ({
    utmSource: 'bridge',
    utmMedium: 'paid_booking',
    utmCampaign: result?.mentor_summary?.id || result?.bridge_session_id || 'bridge',
    utmContent: sessionId || '',
  }), [result, sessionId]);

  return (
    <main className="relative min-h-screen px-4 py-12 sm:px-6 sm:py-16" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <div className="relative mx-auto max-w-3xl">
        <p className="text-[11px] font-black uppercase tracking-[0.28em]" style={{ color: 'var(--color-primary)' }}>
          Almost there
        </p>
        <h1
          className="mt-2 font-display font-black tracking-[-0.025em]"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--bridge-text)' }}
        >
          Pick your hour
        </h1>
        {result?.mentor_summary?.name && (
          <p className="mt-3 text-base" style={{ color: 'var(--bridge-text-secondary)' }}>
            Choose a time that works for you with{' '}
            <span className="font-bold" style={{ color: 'var(--bridge-text)' }}>{result.mentor_summary.name}</span>.
          </p>
        )}

        <div className="mt-8">
          {loading && (
            <div
              className="rounded-3xl"
              style={{
                minHeight: 760,
                backgroundColor: 'var(--bridge-surface-muted)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            />
          )}

          {!loading && error && (
            <div
              className="rounded-3xl p-8"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <p className="text-base font-bold" style={{ color: 'var(--bridge-text)' }}>
                We couldn't open your booking link.
              </p>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
                Your payment was processed. Email{' '}
                <a href="mailto:support@bridge.com" style={{ color: 'var(--color-primary)' }}>support@bridge.com</a>
                {' '}with your session id <span className="font-mono">{sessionId}</span> and we will set it up by hand.
              </p>
              <p className="mt-3 text-sm" style={{ color: 'var(--bridge-text-muted)' }}>{error}</p>
              <Link
                to="/dashboard/sessions"
                className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                }}
              >
                Open dashboard
              </Link>
            </div>
          )}

          {!loading && !error && result?.scheduling_url && (
            <CalendlyInlineWidget
              url={result.scheduling_url}
              prefill={prefill}
              utm={utm}
              minHeight={760}
              onScheduled={() => navigate('/dashboard/sessions?booked=1')}
            />
          )}
        </div>
      </div>
    </main>
  );
}
