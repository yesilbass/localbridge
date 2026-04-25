import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect } from 'react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function EmbeddedCheckoutPanel({ clientSecret, onClose }) {
    useEffect(() => {
        if (!clientSecret) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [clientSecret, onClose]);

    if (!clientSecret) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-950/75 px-4 py-6 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Complete payment"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative mx-auto flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_32px_80px_-20px_rgba(28,25,23,0.45)] ring-1 ring-stone-900/10">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-stone-900">Complete payment</h2>
                        <p className="mt-0.5 text-sm text-stone-500">Secure checkout powered by Stripe.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close checkout"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                        <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable checkout area */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-stone-50/50 p-4 sm:p-6">
                    <EmbeddedCheckoutProvider
                        stripe={stripePromise}
                        options={{ clientSecret }}
                    >
                        <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 items-center justify-between border-t border-stone-200 bg-white px-6 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                        <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                        </svg>
                        Secured by Stripe — 256-bit encryption
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs font-semibold text-stone-500 transition hover:text-stone-700"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
