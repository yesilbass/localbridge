export const HIW_TRACKS = [
  {
    id: 'sessions',
    label: 'On-demand sessions',
    tagline: 'From signup to video call in under five minutes.',
    bullets: [
      'Volunteer mentors — session time stays free',
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
    title: 'Create your account',
    body: 'Sign up in seconds. Tell Bridge what role you are targeting — optional AI intake shapes better matches later.',
    visual: 'signup',
  },
  {
    num: '02',
    title: 'Find a mentor who gets it',
    body: 'Browse vetted mentors by industry and session type, or let AI rank the best fits. Every profile shows reviews, expertise, and live availability.',
    chip: 'Browse or AI match',
    visual: 'discover',
  },
  {
    num: '03',
    title: 'Book a real slot — not a maybe',
    body: 'Pick a topic, choose a time on their calendar, add context, and send the request. No scheduling ping-pong.',
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
    body: 'AI reads your profile against mentor expertise and returns a short list with reasons — not a random directory scroll.',
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
    body: 'Priority matching, faster queue placement, and early access when new mentors join — for when you are booking every week.',
    chip: 'See pricing',
    visual: 'priority',
  },
];
