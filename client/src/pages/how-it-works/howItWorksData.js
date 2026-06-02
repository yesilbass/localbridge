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
    title: 'Browse or get matched',
    body: "Browse the mentor directory by skill, industry, or career goal. Or describe your situation and get matched to someone whose experience lines up with what you're facing.",
    visual: 'discover',
  },
  {
    num: '02',
    title: 'Book a session',
    body: 'Pick a time that works for you. Scheduling is handled automatically — no back-and-forth emails, no chasing someone down.',
    visual: 'book',
  },
  {
    num: '03',
    title: 'Have the conversation',
    body: "A live video session with someone who's actually been through what you're facing. Not a course. Not a chatbot. A real person.",
    visual: 'call',
  },
  {
    num: '04',
    title: 'Leave with a next step',
    body: "Your mentor sets clear action items before you leave. They're saved in your dashboard so you don't lose momentum after the call.",
    visual: 'nextsteps',
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
