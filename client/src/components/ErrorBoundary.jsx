import { Component, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

class ErrorBoundaryInner extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.renderFallback();
    }
    return this.props.children;
  }
}

export default function ErrorBoundary({ children }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <ErrorBoundaryInner
        renderFallback={() => (
          <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
            <div
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
            >
              <AlertTriangle
                className="h-8 w-8"
                style={{ color: 'var(--color-primary)' }}
                aria-hidden
              />
            </div>
            <h2
              className="font-display text-2xl font-bold tracking-tight"
              style={{ color: 'var(--bridge-text)' }}
            >
              Something went wrong
            </h2>
            <p
              className="mt-2 max-w-sm text-sm leading-relaxed"
              style={{ color: 'var(--bridge-text-secondary)' }}
            >
              An unexpected error occurred. Please refresh the page.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                }}
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Refresh page
              </button>
              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{
                  borderColor: 'var(--bridge-border)',
                  color: 'var(--bridge-text-secondary)',
                  background: 'var(--bridge-surface)',
                }}
              >
                Report this
              </button>
            </div>
          </div>
        )}
      >
        {children}
      </ErrorBoundaryInner>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
