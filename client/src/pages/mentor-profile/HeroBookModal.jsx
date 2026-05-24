import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CalendlyInlineWidget from '../../components/CalendlyInlineWidget';
import BookingDrawer from './BookingDrawer';
import { useProfileReducedMotion } from './profileHooks';

const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';
const DARK_BG = 'linear-gradient(140deg, color-mix(in srgb, var(--color-primary) 50%, black), color-mix(in srgb, var(--color-primary) 22%, black))';

function BookPanel({ mentor, user, onClose, utmMedium }) {
  const navigate = useNavigate();
  const acceptingBookings = mentor?.available !== false;
  const calendlyReady = Boolean(
    mentor?.calendly_connected && mentor?.calendly_event_type_uri && mentor?.calendly_scheduling_url,
  );

  const prefill = useMemo(() => ({
    name: user?.user_metadata?.full_name || user?.email || undefined,
    email: user?.email || undefined,
    customAnswers: { a1: 'Booked via Bridge subscription' },
  }), [user]);

  const utm = useMemo(() => ({
    utmSource: 'bridge',
    utmMedium,
    utmCampaign: mentor?.id || 'bridge',
  }), [mentor?.id, utmMedium]);

  return (
    <div>
      <div className="mb-5 pr-10">
        <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: 'var(--color-primary)' }}>
          Subscriber booking
        </p>
        <h2
          className="mt-1 font-display font-black tracking-tight"
          style={{ fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', color: 'var(--bridge-text)' }}
        >
          Book with {mentor?.name?.split(' ')[0] || 'your mentor'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
          Included with your Bridge plan — pick a time on their calendar.
        </p>
      </div>

      {!acceptingBookings ? (
        <p
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            border: '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)',
            background: 'color-mix(in srgb, var(--color-warning) 8%, var(--bridge-surface-muted))',
            color: 'var(--color-warning)',
          }}
        >
          This mentor is not accepting new sessions right now.
        </p>
      ) : !calendlyReady ? (
        <div
          className="rounded-2xl p-5"
          style={{ border: '1px solid var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)' }}
        >
          <p className="font-display text-lg font-black" style={{ color: 'var(--bridge-text)' }}>
            Calendar not connected yet
          </p>
          <p className="mt-2 text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
            Message them to coordinate a time, or check back soon.
          </p>
        </div>
      ) : (
        <CalendlyInlineWidget
          url={mentor.calendly_scheduling_url}
          prefill={prefill}
          utm={utm}
          minHeight={620}
          onScheduled={() => {
            onClose();
            navigate('/dashboard/sessions?booked=1');
          }}
        />
      )}
    </div>
  );
}

export default function HeroBookModal({ open, onClose, mentor, user, utmMedium = 'mentor_profile_hero' }) {
  const flat = useProfileReducedMotion();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  if (isMobile) {
    return (
      <BookingDrawer isOpen={open} onClose={onClose}>
        {open && <BookPanel mentor={mentor} user={user} onClose={onClose} utmMedium={utmMedium} />}
      </BookingDrawer>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close booking"
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            initial={flat ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={flat ? {} : { opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Book a session"
            className="fixed inset-x-4 top-[8vh] z-50 mx-auto max-h-[88vh] max-w-3xl overflow-y-auto rounded-[1.75rem] p-6 sm:p-8"
            style={{
              background: 'var(--bridge-surface)',
              boxShadow: '0 32px 80px -24px rgba(0,0,0,0.35), inset 0 0 0 1px var(--bridge-border)',
            }}
            initial={flat ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={flat ? {} : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[1.75rem]"
              style={{ background: `linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent)` }}
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full ${ring}`}
              style={{ background: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)' }}
            >
              <X className="h-5 w-5" />
            </button>
            <BookPanel mentor={mentor} user={user} onClose={onClose} utmMedium={utmMedium} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
