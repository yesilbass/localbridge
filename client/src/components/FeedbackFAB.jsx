import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

const fabFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)] dark:focus-visible:ring-offset-stone-950';

export default function FeedbackFAB() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setFeedbackOpen(true)}
        className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/25 ring-1 ring-white/25 transition hover:from-orange-500 hover:to-amber-400 hover:shadow-xl dark:shadow-black/50 ${fabFocus}`}
      >
        <MessageSquareText className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
        Feedback
      </button>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
