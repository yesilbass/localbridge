import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';
import { isMentorAccount } from '../../utils/accountRole';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import MentorAvailabilityPanel from './MentorAvailabilityPanel.jsx';
import supabase from '../../api/supabase';

export default function AvailabilityPage() {
  const { user } = useAuth();
  const isMentor = user ? isMentorAccount(user) : false;
  const [mentorProfileId, setMentorProfileId] = useState(null);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!user || !isMentor) { setLoading(false); return undefined; }
    setLoading(true);
    void (async () => {
      const { data } = await supabase
        .from('mentor_profiles')
        .select('id, calendar_connected')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setMentorProfileId(data?.id ?? null);
      setCalendarConnected(!!data?.calendar_connected);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, isMentor, reloadKey]);

  if (!user) return <Navigate to="/login" replace />;
  if (!isMentor) return <Navigate to="/dashboard" replace />;
  if (loading) return <LoadingSpinner label="Loading availability…" className="min-h-[40vh]" size="md" />;

  return (
    <MentorAvailabilityPanel
      mentorProfileId={mentorProfileId}
      calendarConnected={calendarConnected}
      onSaved={() => setReloadKey((k) => k + 1)}
    />
  );
}
