import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, Check, MessageCircle, Sparkles, Video, X } from 'lucide-react';
import MentorAvatar from '../../components/MentorAvatar';
import EmbeddedCheckoutPanel from '../../components/EmbeddedCheckoutPanel';
import { createSubscriptionCheckout } from '../../api/stripe';
import { getAllMentors } from '../../api/mentors';
import { SUBSCRIPTION_MONTHLY_USD } from '../../../../shared/subscriptionPlans.js';
import { useProfileReducedMotion } from './profileHooks';

const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';

const PERKS = [
  { icon: Video, label: 'Book any mentor on their calendar' },
  { icon: MessageCircle, label: 'Message before you meet' },
  { icon: Sparkles, label: 'Unlimited AI matching & resume review' },
];

function formatPoolCount(n) {
  if (!n || n < 1) return '750+';
  const rounded = n >= 100 ? Math.floor(n / 10) * 10 : n;
  return `${rounded.toLocaleString()}+`;
}

export default function SubscribeUnlockModal({
  open,
  onClose,
  intent = 'book',
  mentor,
  user,
  pricingPath = '/pricing',
}) {
  const flat = useProfileReducedMotion();
  const [mentorPool, setMentorPool] = useState(null);
  const [checkoutSecret, setCheckoutSecret] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');

  const firstName = mentor?.name?.split(/\s+/)[0] ?? 'this mentor';
  const poolLabel = formatPoolCount(mentorPool);

  const headline =
    intent === 'message'
      ? `Message ${firstName}`
      : `Book with ${firstName}`;

  const subcopy =
    intent === 'message'
      ? 'Direct messaging is included with your Bridge subscription — no per-session fees, ever.'
      : 'Book sessions on their calendar with a Bridge subscription — mentors volunteer their time.';

  const reset = useCallback(() => {
    setCheckoutSecret(null);
    setCheckoutLoading(null);
    setCheckoutError('');
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    window.setTimeout(reset, 220);
  }, [onClose, reset]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void getAllMentors({ pageSize: 1, availableOnly: true }).then(({ totalCount }) => {
      if (!cancelled && totalCount) setMentorPool(totalCount);
    });
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !checkoutSecret) handleClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, checkoutSecret, handleClose]);

  async function startCheckout(planName) {
    if (!user?.email || checkoutLoading) return;
    setCheckoutError('');
    setCheckoutLoading(planName);
    try {
      const result = await createSubscriptionCheckout({ planName, userEmail: user.email });
      if (!result.ok) {
        setCheckoutError(result.error || 'Could not start checkout.');
        return;
      }
      setCheckoutSecret(result.clientSecret);
    } catch {
      setCheckoutError('Could not connect to payment server.');
    } finally {
      setCheckoutLoading(null);
    }
  }

  if ((!open && !checkoutSecret) || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <AnimatePresence>
        {open && !checkoutSecret && (
          <>
            <motion.button
              type="button"
              aria-label="Close"
              className="fixed inset-0 z-[10040]"
              style={{ background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(6px)' }}
              initial={flat ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={flat ? {} : { opacity: 0 }}
              onClick={handleClose}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="subscribe-unlock-heading"
              className="fixed inset-x-4 top-[10vh] z-[10041] mx-auto max-w-md overflow-hidden rounded-[1.75rem] sm:top-[12vh]"
              style={{
                background: 'var(--bridge-surface)',
                boxShadow: '0 40px 100px -32px rgba(0,0,0,0.45), inset 0 0 0 1px var(--bridge-border)',
              }}
              initial={flat ? false : { opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={flat ? {} : { opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-32"
                style={{
                  background: 'linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 85%)',
                }}
              />

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full ${ring}`}
                style={{ background: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)' }}
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative px-7 pb-8 pt-10 text-center sm:px-9 sm:pb-9 sm:pt-11">
                <div className="mx-auto flex justify-center">
                  <div
                    className="rounded-full p-1"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-accent) 70%, var(--color-primary)))',
                      boxShadow: '0 12px 32px -8px color-mix(in srgb, var(--color-primary) 45%, transparent)',
                    }}
                  >
                    {(mentor?.avatarUrl || mentor?.image_url) ? (
                      <img
                        src={mentor.avatarUrl ?? mentor.image_url}
                        alt=""
                        width={88}
                        height={88}
                        className="h-[5.5rem] w-[5.5rem] rounded-full object-cover object-top ring-4 ring-[var(--bridge-surface)]"
                      />
                    ) : (
                      <MentorAvatar
                        name={mentor?.name ?? ''}
                        size="xl"
                        className="!h-[5.5rem] !w-[5.5rem] !text-2xl ring-4 ring-[var(--bridge-surface)]"
                      />
                    )}
                  </div>
                </div>

                <h2
                  id="subscribe-unlock-heading"
                  className="mt-6 font-display text-[clamp(1.5rem,4.5vw,1.85rem)] font-black leading-[1.12] tracking-[-0.03em]"
                  style={{ color: 'var(--bridge-text)' }}
                >
                  {headline}
                  <span className="mt-1 block text-[clamp(1.15rem,3.5vw,1.35rem)] font-bold tracking-[-0.02em]" style={{ color: 'var(--color-primary)' }}>
                    and {poolLabel} mentors on Bridge
                  </span>
                </h2>

                <p className="mx-auto mt-4 max-w-[19rem] text-base leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
                  {subcopy}
                </p>

                <ul className="mx-auto mt-7 max-w-[20rem] space-y-3 text-left">
                  {PERKS.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-start gap-3 text-[15px] leading-snug" style={{ color: 'var(--bridge-text)' }}>
                      <span
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background: 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface-muted))',
                          color: 'var(--color-primary)',
                        }}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>

                {checkoutError && (
                  <p
                    className="mt-5 rounded-xl px-4 py-3 text-sm"
                    style={{
                      background: 'color-mix(in srgb, var(--color-error) 8%, var(--bridge-surface-muted))',
                      color: 'var(--color-error)',
                    }}
                  >
                    {checkoutError}
                  </p>
                )}

                <div className="mt-8">
                  <button
                    type="button"
                    disabled={Boolean(checkoutLoading)}
                    onClick={() => startCheckout('monthly')}
                    className={`w-full rounded-full px-6 py-4 text-base font-black transition-all hover:-translate-y-0.5 disabled:opacity-60 ${ring}`}
                    style={{
                      background: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      boxShadow: '0 14px 36px -8px color-mix(in srgb, var(--color-primary) 55%, transparent)',
                    }}
                  >
                    {checkoutLoading ? 'Opening checkout…' : `Start 7-day free trial — $${SUBSCRIPTION_MONTHLY_USD}/mo`}
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    Cancel anytime
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    Sessions stay free
                  </span>
                </div>

                <Link
                  to={pricingPath}
                  onClick={handleClose}
                  className={`mt-5 inline-block text-sm font-semibold transition-colors ${ring}`}
                  style={{ color: 'var(--color-primary)' }}
                >
                  See what&apos;s included →
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <EmbeddedCheckoutPanel
        clientSecret={checkoutSecret}
        onClose={() => {
          setCheckoutSecret(null);
          handleClose();
        }}
      />
    </>,
    document.body,
  );
}
