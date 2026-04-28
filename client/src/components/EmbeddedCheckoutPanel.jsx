import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Renders via portal to document.body so position:fixed is viewport-relative.
 * (Page wrapper uses transform for enter animation, which breaks fixed descendants.)
 * Shell matches FeedbackModal: viewport-centered on sm+, bottom sheet on narrow screens.
 */
export default function EmbeddedCheckoutPanel({ clientSecret, onClose }) {
  useEffect(() => {
    if (!clientSecret) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [clientSecret, onClose]);

  if (!clientSecret) return null;

  return createPortal(
    (
      <div
        className="fixed inset-0 z-[10050] flex items-end justify-center sm:items-center sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Complete payment"
      >
        <button
          type="button"
          className="absolute inset-0 bg-stone-950/60 backdrop-blur-xl"
          aria-label="Close checkout"
          onClick={onClose}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2 opacity-45 dark:opacity-65"
          style={{
            background:
              'conic-gradient(from 200deg at 50% 50%, rgba(251,146,60,0.22), rgba(234,88,12,0.12), rgba(253,230,138,0.14), rgba(251,146,60,0.22))',
            filter: 'blur(110px)',
          }}
        />

        <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] border border-[var(--bridge-border)] bg-white shadow-bridge-float sm:rounded-[2rem] ring-1 ring-stone-900/10 dark:bg-stone-950 dark:ring-stone-700/40">
          <div className="flex shrink-0 items-center justify-between border-b border-stone-200 bg-white px-6 py-4 dark:border-stone-800 dark:bg-stone-950">
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Complete payment</h2>
              <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">Secure checkout powered by Stripe.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close checkout"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-stone-100"
            >
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-stone-50/50 p-4 sm:p-6 dark:bg-stone-900/80">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-stone-200 bg-white px-6 py-3 dark:border-stone-800 dark:bg-stone-950">
            <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
              <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              </svg>
              Secured by Stripe — 256-bit encryption
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-stone-500 transition hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    ),
    document.body,
  );
}
