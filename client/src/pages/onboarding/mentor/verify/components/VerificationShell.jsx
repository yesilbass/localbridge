import { Check } from 'lucide-react';
import TierBadge from './TierBadge.jsx';

/**
 * Wizard chrome: stepper + content slot + footer with score/tier indicator.
 * Drop-in for every step component.
 */
export default function VerificationShell({
  steps,
  activeStepId,
  onJumpTo,
  score,
  tier,
  children,
  footer,
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8" style={{ color: 'var(--bridge-text)' }}>
      <header className="flex flex-col gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
          Mentor verification
        </p>
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
          Earn your tier on Bridge
        </h1>
        <p className="text-sm sm:text-[15px]" style={{ color: 'var(--bridge-text-secondary)' }}>
          Complete each step at your pace. Higher-quality evidence = higher tier = more discovery + better rates.
        </p>
      </header>

      <Stepper steps={steps} activeStepId={activeStepId} onJumpTo={onJumpTo} />

      <main
        className="rounded-3xl p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        {children}
      </main>

      <footer
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3"
        style={{
          backgroundColor: 'var(--bridge-surface-muted)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <TierBadge tier={tier} size="lg" />
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
            {Number(score) || 0} / 100
          </span>
        </div>
        <div className="flex items-center gap-2">{footer}</div>
      </footer>
    </div>
  );
}

function Stepper({ steps, activeStepId, onJumpTo }) {
  return (
    <nav aria-label="Verification progress" className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const isActive   = step.id === activeStepId;
        const isComplete = step.status === 'passed';
        const isFlagged  = step.status === 'manual_review';
        const isFailed   = step.status === 'failed';
        const accent = isComplete ? 'var(--color-success, #16a34a)'
                     : isFlagged  ? 'var(--color-warning)'
                     : isFailed   ? 'var(--color-error)'
                     : isActive   ? 'var(--color-primary)'
                     : 'var(--bridge-border-strong)';
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onJumpTo?.(step.id)}
            className="bridge-focus group flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors"
            style={{
              color: isActive ? 'var(--bridge-text)' : 'var(--bridge-text-muted)',
              backgroundColor: isActive ? 'var(--bridge-surface)' : 'transparent',
              boxShadow: isActive ? 'inset 0 0 0 1px var(--bridge-border-strong)' : 'none',
            }}
            aria-current={isActive ? 'step' : undefined}
          >
            <span
              aria-hidden
              className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-black text-white"
              style={{ backgroundColor: accent }}
            >
              {isComplete ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span>{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
