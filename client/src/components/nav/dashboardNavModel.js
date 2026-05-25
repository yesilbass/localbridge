import {
  Search, Users, MessageSquare, CalendarCheck, Heart, FileText,
  Clock, DollarSign, Star,
} from 'lucide-react';

const MENTEE_GROUPS = [
  {
    id: 'explore',
    labelKey: 'nav.explore',
    fallback: 'Explore',
    items: [
      { to: '/dashboard/mentors', labelKey: 'nav.mentors', fallback: 'Mentors', icon: Search },
      { to: '/dashboard/community', labelKey: 'nav.community', fallback: 'Community', icon: Users },
    ],
  },
  {
    id: 'activity',
    labelKey: 'nav.activity',
    fallback: 'Activity',
    items: [
      { to: '/dashboard/sessions', labelKey: 'common.sessions', fallback: 'Sessions', icon: CalendarCheck },
      { to: '/dashboard/messages', labelKey: 'nav.messages', fallback: 'Messages', icon: MessageSquare },
      { to: '/dashboard/saved', labelKey: 'common.saved', fallback: 'Saved', icon: Heart },
    ],
  },
  {
    id: 'tools',
    labelKey: 'nav.tools',
    fallback: 'Tools',
    items: [
      { to: '/dashboard/resume', labelKey: 'nav.resume', fallback: 'Resume', icon: FileText },
    ],
  },
];

const MENTOR_GROUPS = [
  {
    id: 'work',
    labelKey: 'nav.work',
    fallback: 'Work',
    items: [
      { to: '/dashboard/sessions', labelKey: 'common.sessions', fallback: 'Sessions', icon: CalendarCheck },
      { to: '/dashboard/messages', labelKey: 'nav.messages', fallback: 'Messages', icon: MessageSquare },
      { to: '/dashboard/community', labelKey: 'nav.community', fallback: 'Community', icon: Users },
    ],
  },
  {
    id: 'mentor',
    labelKey: 'nav.mentorHub',
    fallback: 'Mentor',
    items: [
      { to: '/dashboard/availability', labelKey: 'common.availability', fallback: 'Availability', icon: Clock },
      { to: '/dashboard/earnings', labelKey: 'common.earnings', fallback: 'Earnings', icon: DollarSign },
      { to: '/dashboard/reviews', labelKey: 'common.reviews', fallback: 'Reviews', icon: Star },
    ],
  },
];

export function buildDashboardNavModel(isMentor, t) {
  const groups = (isMentor ? MENTOR_GROUPS : MENTEE_GROUPS).map((g) => ({
    id: g.id,
    label: t(g.labelKey, g.fallback),
    items: g.items.map((item) => ({
      ...item,
      label: t(item.labelKey, item.fallback),
    })),
  }));
  const links = groups.flatMap((g) => g.items);
  return { links };
}

export function isDashboardPathActive(pathname, to) {
  if (to === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/dashboard/';
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}
