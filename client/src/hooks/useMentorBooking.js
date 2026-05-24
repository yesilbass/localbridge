import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useSubscription } from './useSubscription';

export function useMentorBooking({ embedded = false } = {}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isActive: subscriberReady, loading: subscriptionLoading } = useSubscription();
  const [bookMentor, setBookMentor] = useState(null);
  const [unlock, setUnlock] = useState({ open: false, intent: 'book', mentor: null });

  const loginReturn = location.pathname;
  const planPath = embedded ? '/dashboard/plan' : '/pricing';

  const beginBook = useCallback((mentor, { allowed = true } = {}) => {
    if (!allowed || !mentor) return;
    if (!user) {
      navigate('/login', { state: { from: loginReturn } });
      return;
    }
    if (subscriptionLoading) return;
    if (!subscriberReady) {
      setUnlock({ open: true, intent: 'book', mentor });
      return;
    }
    setBookMentor(mentor);
  }, [user, subscriberReady, subscriptionLoading, navigate, loginReturn]);

  const closeBook = useCallback(() => setBookMentor(null), []);
  const closeUnlock = useCallback(() => setUnlock((prev) => ({ ...prev, open: false })), []);

  return {
    beginBook,
    bookMentor,
    closeBook,
    unlock,
    closeUnlock,
    planPath,
    user,
    subscriptionLoading,
  };
}
