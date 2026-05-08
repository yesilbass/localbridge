export const PAGE_SIZE = 12;

export const MENTOR_TIERS = [
  {
    name: 'Rising',
    rateRange: '$40–$70',
    experienceDesc: '0–4 years · Early-career professionals and recent grads who have earned their first real wins.',
    useCases: ['First job search and resume polish', 'Breaking into competitive entry-level roles', 'Building professional habits and early momentum'],
    accentFrom: 'from-emerald-500',
    accentTo: 'to-emerald-400',
    cardBg: 'bg-emerald-50/80 dark:bg-emerald-500/6',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-500/15',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-300 dark:border-emerald-500/30',
    checkColor: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-400/50',
    glowColor: 'rgba(16,185,129,0.22)',
  },
  {
    name: 'Established',
    rateRange: '$75–$120',
    experienceDesc: '5–9 years · Mid-career contributors with a proven track record and a clear area of focus.',
    useCases: ['Mid-level to senior career transitions', 'Navigating promotion cycles and leveling up', 'Changing industries or switching functions'],
    accentFrom: 'from-sky-500',
    accentTo: 'to-sky-400',
    cardBg: 'bg-sky-50/80 dark:bg-sky-500/6',
    badgeBg: 'bg-sky-100 dark:bg-sky-500/15',
    badgeText: 'text-sky-700 dark:text-sky-300',
    badgeBorder: 'border-sky-300 dark:border-sky-500/30',
    checkColor: 'text-sky-600 dark:text-sky-400',
    hoverBorder: 'hover:border-sky-400/50',
    glowColor: 'rgba(14,165,233,0.22)',
  },
  {
    name: 'Expert',
    rateRange: '$125–$175',
    experienceDesc: '10–15 years · Senior leaders with deep functional expertise and meaningful organizational scope.',
    useCases: ['Senior or staff-level interview preparation', 'Executive communication and cross-functional influence', 'High-stakes career pivots and role expansions'],
    accentFrom: 'from-violet-500',
    accentTo: 'to-violet-400',
    cardBg: 'bg-violet-50/80 dark:bg-violet-500/6',
    badgeBg: 'bg-violet-100 dark:bg-violet-500/15',
    badgeText: 'text-violet-700 dark:text-violet-300',
    badgeBorder: 'border-violet-300 dark:border-violet-500/30',
    checkColor: 'text-violet-600 dark:text-violet-400',
    hoverBorder: 'hover:border-violet-400/50',
    glowColor: 'rgba(139,92,246,0.22)',
  },
  {
    name: 'Elite',
    rateRange: '$180–$250',
    experienceDesc: '15+ years · C-suite executives and industry-defining practitioners at the top of their fields.',
    useCases: ['VP and C-suite transition coaching', 'Board-level presence and strategic positioning', 'Legacy career decisions, exits, and portfolio moves'],
    accentFrom: 'from-amber-500',
    accentTo: 'to-orange-500',
    cardBg: 'bg-amber-50/80 dark:bg-amber-500/6',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    badgeText: 'text-white',
    badgeBorder: '',
    checkColor: 'text-amber-600 dark:text-amber-400',
    hoverBorder: 'hover:border-amber-400/50',
    glowColor: 'rgba(245,158,11,0.28)',
  },
];

export const INDUSTRIES = [
  { label: 'All', value: '' },
  { label: 'Technology', value: 'technology' },
  { label: 'Finance', value: 'finance' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Data Science', value: 'data science' },
  { label: 'Education', value: 'education' },
  { label: 'Law', value: 'law' },
];

export const TIERS = [
  { label: 'All tiers', value: '' },
  { label: 'Rising', value: 'rising' },
  { label: 'Established', value: 'established' },
  { label: 'Expert', value: 'expert' },
  { label: 'Elite', value: 'elite' },
];

export const SORT_OPTIONS = [
  { label: 'Best reviewed', value: 'rating' },
  { label: 'Most experienced', value: 'experience' },
  { label: 'Most sessions', value: 'sessions' },
];

export function tierBadge(tier) {
  switch (tier) {
    case 'rising':      return 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-400/30 dark:text-emerald-300';
    case 'established': return 'bg-sky-500/10 text-sky-600 ring-1 ring-sky-400/30 dark:text-sky-300';
    case 'expert':      return 'bg-violet-500/10 text-violet-600 ring-1 ring-violet-400/30 dark:text-violet-300';
    case 'elite':       return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_2px_10px_color-mix(in srgb, var(--color-primary) 45%, transparent)]';
    default:            return 'bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-muted)] ring-1 ring-[var(--bridge-border)]';
  }
}

export function normalizeMentorId(id) {
  return id == null ? '' : String(id).toLowerCase();
}
