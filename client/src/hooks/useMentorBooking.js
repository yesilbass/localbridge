import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function useMentorBooking({ embedded = false } = {}) {
  const { user, isSubscribed: subscribed, settingsLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookMentor, setBookMentor] = useState(null);

  const loginReturn = location.pathname;
  const planPath = embedded ? '/dashboard/plan' : '/pricing';

  const beginBook = useCallback((mentor, { allowed = true } = {}) => {
    if (!allowed || !mentor) return;
    if (!user) {
      navigate('/login', { state: { from: loginReturn } });
      return;
    }
    if (settingsLoading) return;
    if (!subscribed) return;
    setBookMentor(mentor);
  }, [user, subscribed, settingsLoading, navigate, loginReturn]);

  const closeBook = useCallback(() => setBookMentor(null), []);

  return {
    beginBook,
    bookMentor,
    closeBook,
    planPath,
    user,
    subscriptionLoading: settingsLoading,
    isSubscribed: subscribed,
  };
}
