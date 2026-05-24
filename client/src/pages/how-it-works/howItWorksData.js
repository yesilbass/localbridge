export const HIW_TRACKS = [
  {
    id: 'sessions',
    label: 'On-demand sessions',
    tagline: 'From signup to video call in under five minutes.',
    bullets: [
      'Volunteer operators — mentor time stays free',
      'Real calendar slots on every profile',
      'Built-in Bridge video, no external links',
      'Public reviews before you request',
    ],
    stepLabels: ['Sign up', 'Find mentor', 'Book slot', 'Join call'],
  },
  {
    id: 'tools',
    label: 'AI career stack',
    tagline: 'Matching and prep before you ever hit book.',
    bullets: [
      'AI mentor ranking from your goals',
      'Resume review with actionable feedback',
      'Session notes and calendar sync on Plus',
      'Mentor sessions stay free on every plan',
    ],
    stepLabels: ['Build profile', 'AI match', 'Prep session', 'Priority queue'],
  },
];

export const SESSION_STEPS = [
  {
    num: '01',
    title: 'Create your free account',
    body: 'Sign up in seconds. Tell Bridge what role you are targeting — optional AI intake shapes better matches later.',
    chip: 'No card required',
    visual: 'signup',
  },
  {
    num: '02',
    title: 'Find an operator who has done your job',
    body: 'Browse vetted mentors by industry and session type, or let AI rank the best fits. Every profile shows reviews, expertise, and live availability.',
    chip: 'Browse or AI match',
    visual: 'discover',
  },
  {
    num: '03',
    title: 'Book a real slot — not a maybe',
    body: 'Pick career advice, interview prep, resume review, or networking. Choose a time on their calendar, add context, and send the request. No scheduling ping-pong.',
    chip: 'Calendly on every profile',
    visual: 'book',
  },
  {
    num: '04',
    title: 'Show up in Bridge',
    body: 'When the mentor accepts, join from your dashboard in one click. Built-in video, optional intake call, and session notes you keep after.',
    chip: 'No external meeting links',
    visual: 'call',
  },
];

export const TOOL_STEPS = [
  {
    num: '01',
    title: 'Build your career profile',
    body: 'Target role, industry, and goals feed the matching engine. Upload a resume when you want sharper AI feedback.',
    chip: 'One-time setup',
    visual: 'profile',
  },
  {
    num: '02',
    title: 'Get ranked mentor matches',
    body: 'AI reads your profile against operator expertise and returns a short list with reasons — not a random directory scroll.',
    chip: '3 free · unlimited on Plus',
    visual: 'match',
  },
  {
    num: '03',
    title: 'Prep before the call',
    body: 'Run an AI resume review, save mentors to a shortlist, and sync your calendar so sessions land where you actually are.',
    chip: 'Plus unlocks unlimited',
    visual: 'prep',
  },
  {
    num: '04',
    title: 'Move faster on Pro',
    body: 'Priority matching, faster queue placement, and early access when new operators join — for when you are booking every week.',
    chip: 'See pricing',
    visual: 'priority',
  },
];

export const INCLUDED_ALWAYS = [
  'Unlimited volunteer mentor sessions',
  'Browse directory with unfiltered reviews',
  'Book via live Calendly availability',
  'Built-in Bridge video rooms',
  '3 AI mentor matches',
  '1 AI resume review',
];

export const INCLUDED_PAID = [
  'Unlimited AI matching & resume reviews',
  'Calendar sync & session notes',
  'Priority matching & queue placement',
  'Early access to new mentors',
];

export const CONTRAST_POINTS = [
  {
    title: 'No membership wall for mentorship',
    body: 'Other platforms charge $50–$150/month just to book calls. On Bridge, operator time is free on every plan.',
  },
  {
    title: 'No anonymous experts',
    body: 'Every mentor has a verified profile — company, role, reviews, and expertise you can read before you request.',
  },
  {
    title: 'No scheduling archaeology',
    body: 'Real availability on the profile. Pick a slot, send context, done — not five emails to find a Tuesday.',
  },
];

export const OLD_WAY_ROWS = [
  { label: 'Cost per hour', old: '$150+ consultants', bridge: 'Free volunteer sessions' },
  { label: 'Time to first call', old: 'Days to weeks', bridge: 'Minutes' },
  { label: 'Video', old: 'External Zoom link', bridge: 'Built into Bridge' },
  { label: 'Reviews', old: 'Hidden or curated', bridge: 'Public on every profile' },
];
