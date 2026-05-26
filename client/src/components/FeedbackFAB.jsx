import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { MessageSquareText } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

const fabFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]';

function useFooterVisible() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const footer = document.querySelector('footer');
    if (!footer) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -80px 0px' },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [pathname]);

  return visible;
}

export default function FeedbackFAB() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const footerVisible = useFooterVisible();
  const hidden = feedbackOpen || footerVisible;

  return createPortal(
    <>
      <div
        className={`fixed right-6 z-40 transition-[opacity,transform] duration-200 ease-out ${
          hidden ? 'pointer-events-none translate-y-2 opacity-0' : 'pointer-events-none translate-y-0 opacity-100'
        }`}
        style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          className={`group pointer-events-auto btn-sheen relative inline-flex items-center gap-2.5 rounded-full py-3 pl-4 pr-5 text-sm font-semibold transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 ${fabFocus}`}
          style={{
            backgroundColor: '#0c0a09',
            color: '#ffffff',
            boxShadow: '0 12px 36px -8px rgba(12,10,9,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
          }}
          aria-label="Give feedback"
          tabIndex={hidden ? -1 : 0}
          aria-hidden={hidden}
        >
          <span
            aria-hidden
            className="relative flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm"
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.18)',
            }}
          >
            <MessageSquareText className="h-3.5 w-3.5 opacity-95" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse-soft rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.85)]" />
          </span>
          <span className="relative">Feedback</span>
        </button>
      </div>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>,
    document.body,
  );
}
