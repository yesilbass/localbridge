import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { fetchOwnMentorProfileRow } from '../api/verification';

export default function MentorOnboardingBanner() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) {
      setShow(false);
      return undefined;
    }
    let cancelled = false;
    void fetchOwnMentorProfileRow(user.id).then((row) => {
      if (cancelled) return;
      setShow(Boolean(row?.mentor_status === 'active' && row?.onboarding_complete !== true));
    });
    return () => { cancelled = true; };
  }, [user]);

  if (!show) return null;

  return (
    <div
      className="border-b px-5 py-3 sm:px-8"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, var(--bridge-canvas))',
        borderColor: 'color-mix(in srgb, var(--color-success) 25%, var(--bridge-border))',
      }}
    >
      <div className="mx-auto flex max-w-[100rem] flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--bridge-text)' }}>
          Your mentor application was approved — complete your profile to go live.
        </p>
        <Link
          to="/onboarding/mentor"
          className="bridge-focus inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold"
          style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-on-primary, #fff)' }}
        >
          Complete your profile <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
