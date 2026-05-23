import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { useFooterOffset } from '../utils/useFooterOffset';

const fabFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]';

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
            backgroundColor: '#0c0a09',
            color: '#ffffff',
            boxShadow: '0 12px 36px -8px rgba(12,10,9,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
          }}
          aria-label="Give feedback"
        >
          <span
            aria-hidden
            className="relative flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition"
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.18)',
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
