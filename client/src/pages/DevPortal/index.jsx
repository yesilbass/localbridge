import { useState, useEffect } from 'react';
import { isDevAuthed, devFetch } from './devAuth.js';
import DevGate from './DevGate.jsx';
import DevLayout from './DevLayout.jsx';
import DevOverview from './DevOverview.jsx';
import DevMentors from './DevMentors.jsx';
import DevSessions from './DevSessions.jsx';
import DevReviews from './DevReviews.jsx';
import DevUsers from './DevUsers.jsx';
import DevSchedule from './DevSchedule.jsx';
import DevCancellations from './DevCancellations.jsx';
import DevMentorQueue from './DevMentorQueue.jsx';

function useBadgeCounts() {
  const [navBadges, setNavBadges] = useState({});

  useEffect(() => {
    async function load() {
      try {
        const [qRes, cRes] = await Promise.all([
          devFetch('/mentor-queue?status=pending').then(r => r.json()).catch(() => ({ items: [] })),
          devFetch('/cancellations?status=pending').then(r => r.json()).catch(() => []),
        ]);
        setNavBadges({
          'mentor-queue': (qRes.items || []).length,
          'cancellations': Array.isArray(cRes) ? cRes.length : 0,
        });
      } catch {}
    }
    load();
  }, []);

  return navBadges;
}

export default function DevPortal() {
  const [authed, setAuthed] = useState(isDevAuthed);
  const [activeTab, setActiveTab] = useState('overview');
  const navBadges = useBadgeCounts();

  if (!authed) {
    return <DevGate onAuth={() => setAuthed(true)} />;
  }

  const CONTENT = {
    overview:      <DevOverview />,
    mentors:       <DevMentors />,
    'mentor-queue': <DevMentorQueue />,
    sessions:      <DevSessions />,
    reviews:       <DevReviews />,
    users:         <DevUsers />,
    schedule:      <DevSchedule />,
    cancellations: <DevCancellations />,
  };

  return (
    <DevLayout activeTab={activeTab} setActiveTab={setActiveTab} navBadges={navBadges}>
      {CONTENT[activeTab] || <DevOverview />}
    </DevLayout>
  );
}
