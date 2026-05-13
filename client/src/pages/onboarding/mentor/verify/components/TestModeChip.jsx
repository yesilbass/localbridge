import { FlaskConical } from 'lucide-react';

/**
 * Floating chip rendered in the wizard + admin panel whenever the verification
 * system is running in test mode. Mirrors Stripe's "TEST MODE" banner.
 */
export default function TestModeChip({ position = 'top-right' }) {
  // DECISION: client doesn't know server's BRIDGE_VERIFICATION_MODE directly,
  // so we treat presence of any test_link/test_otp anywhere on the run as
  // evidence. For simplicity we always show the chip — there is no live mode
  // wired in yet, and the chip is dismissible-free + low-contrast.
  const positions = {
    'top-right':    'top-3 right-3',
    'top-left':     'top-3 left-3',
    'bottom-right': 'bottom-3 right-3',
    'bottom-left':  'bottom-3 left-3',
  };
  return (
    <div
      className={`fixed z-50 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${positions[position] || positions['top-right']}`}
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-warning) 14%, transparent)',
        color: 'var(--color-warning)',
        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-warning) 35%, transparent)',
      }}
      aria-label="Verification system is in test mode"
    >
      <FlaskConical className="h-3 w-3" aria-hidden />
      Test mode
    </div>
  );
}
