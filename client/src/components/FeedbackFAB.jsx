import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { useFooterOffset } from '../utils/useFooterOffset';

const fabFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)] dark:focus-visible:ring-offset-stone-950';

export default function FeedbackFAB() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const bottomRef = useFooterOffset(24);

  return (
    <>
      <div ref={bottomRef} className="pointer-events-none fixed right-6 z-40" style={{ bottom: 24 }}>
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          className={`group pointer-events-auto btn-sheen relative inline-flex items-center gap-2.5 rounded-full pl-4 pr-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 ${fabFocus}`}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            boxShadow: '0 12px 36px -8px color-mix(in srgb, var(--color-primary) 50%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-on-primary) 20%, transparent)',
          }}
          aria-label="Give feedback"
        >
          <span
            aria-hidden
            className="relative flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-on-primary) 15%, transparent)',
              boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-on-primary) 25%, transparent)',
            }}
          >
            <MessageSquareText className="h-3.5 w-3.5 opacity-95" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.85)] animate-pulse-soft" />
          </span>
          <span className="relative">Feedback</span>
        </button>
      </div>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
