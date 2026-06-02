import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';

const STORAGE_KEY = 'bridge-cookie-consent';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return createPortal(
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6"
    >
      <div
        className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        <div className="min-w-0">
          <p
            id="cookie-consent-title"
            className="text-base font-semibold text-[var(--bridge-text)]"
          >
            Cookies on Bridge
          </p>
          <p
            id="cookie-consent-desc"
            className="mt-1.5 text-sm leading-relaxed text-[var(--bridge-text-secondary)]"
          >
            We use essential cookies for sign-in and preferences, plus optional analytics to improve
            the product. No ad tracking.{' '}
            <Link
              to="/cookies"
              className="font-semibold underline underline-offset-4 transition hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              Cookie policy
            </Link>
            {' · '}
            <Link
              to="/privacy"
              className="font-semibold underline underline-offset-4 transition hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              Privacy
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Link
            to="/cookies"
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--bridge-text-secondary)] transition hover:text-[var(--bridge-text)] focus:outline-none focus-visible:underline"
          >
            Manage
          </Link>
          <button
            type="button"
            onClick={accept}
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
