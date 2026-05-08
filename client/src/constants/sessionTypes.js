/**
 * Session types — 4 entries, each tied to a single palette token (`hueVar`)
 * for differentiation within whichever palette is currently active.
 *
 * Per the brand brief: "tints, borders, or icon color, not four loud hues."
 * SessionTypeCard renders icon-bg, border, tag, and selected ring from the
 * single hue per type, so all 4 cards stay coordinated inside any palette.
 *
 * `accent` keys (legacy Tailwind class strings) are preserved as `legacy*` for
 * any consumer still reading them — but new styling should consume `hueVar`.
 *
 * NEVER change the `key` values — they are part of backend validation.
 */
export const SESSION_TYPES = [
  {
    key: 'career_advice',
    icon: '🧭',
    name: 'Career Advice',
    tagline: 'When you’re staring at a fork in the road and want someone who’s picked one before.',
    description:
      'Big decisions, weird pivots, “is this industry for me?” stuff. They’ll walk you through how they thought about it—not generic ladder advice.',
    duration: '30 min',
    popular: false,
    /** Single palette token to derive bg/border/icon/ring tints from. */
    hueVar: 'var(--color-primary)',
    /** Legacy Tailwind class strings — left in place to avoid breaking older consumers. */
    accent: {
      border: 'border-l-amber-400',
      iconBg: 'bg-amber-50',
      tag: 'text-amber-800 bg-amber-50 border-amber-200',
      selectedRing: 'ring-amber-500/90',
      selectedBg: 'from-amber-50/80 to-orange-50/40',
      iconTint: 'text-amber-700',
    },
  },
  {
    key: 'interview_prep',
    icon: '🎯',
    name: 'Interview Prep',
    tagline: 'Practice with someone who’s actually sat on the other side of the table.',
    description:
      'Run answers out loud, get blunt feedback, and hear what interviewers actually care about in your lane—behavioral, technical, whatever you’re sweating.',
    duration: '30 min',
    popular: true,
    hueVar: 'var(--color-success)',
    accent: {
      border: 'border-l-emerald-400',
      iconBg: 'bg-emerald-50',
      tag: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      selectedRing: 'ring-emerald-500/90',
      selectedBg: 'from-emerald-50/80 to-teal-50/40',
      iconTint: 'text-emerald-700',
    },
  },
  {
    key: 'resume_review',
    icon: '📄',
    name: 'Resume Review',
    tagline: 'Red-pen energy: what to cut, what to bold, and what hiring managers skim for.',
    description:
      'Line-by-line pass from someone who hires or works next to hiring managers in your world. Less buzzwords, more “here’s what this line actually signals.”',
    duration: '45 min',
    popular: false,
    hueVar: 'var(--color-info)',
    accent: {
      border: 'border-l-sky-400',
      iconBg: 'bg-sky-50',
      tag: 'text-sky-800 bg-sky-50 border-sky-200',
      selectedRing: 'ring-sky-500/90',
      selectedBg: 'from-sky-50/80 to-indigo-50/30',
      iconTint: 'text-sky-700',
    },
  },
  {
    key: 'networking',
    icon: '🤝',
    name: 'Networking',
    tagline: 'How to reach out without being cringe, and where your mentor would actually intro you.',
    description:
      'Warm intro strategy, communities worth your time, and how to stay in touch without being annoying. Built for people who hate “networking” but still need humans.',
    duration: '30 min',
    popular: false,
    hueVar: 'var(--color-accent)',
    accent: {
      border: 'border-l-violet-400',
      iconBg: 'bg-violet-50',
      tag: 'text-violet-800 bg-violet-50 border-violet-200',
      selectedRing: 'ring-violet-500/90',
      selectedBg: 'from-violet-50/80 to-fuchsia-50/30',
      iconTint: 'text-violet-700',
    },
  },
];
