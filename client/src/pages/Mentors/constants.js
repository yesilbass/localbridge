export const PAGE_SIZE = 12;

export const MENTOR_TIERS = [
  {
    name: 'Rising',
    rateRange: '$40 – $74',
    experienceDesc: '0 – 2 years · Early-career professionals with first-hand, current knowledge of modern hiring.',
    useCases: ['Resume and LinkedIn review', 'Entry-level interview prep', 'Job search strategy and targeting'],
    accentFrom: 'from-slate-400',
    accentTo: 'to-slate-300',
    badgeBg: 'bg-slate-100 dark:bg-slate-500/20',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-300 dark:border-slate-500/35',
    checkColor: 'text-slate-500 dark:text-slate-400',
    glowColor: 'rgba(100,116,139,0.28)',
  },
  {
    name: 'Professional',
    rateRange: '$75 – $114',
    experienceDesc: '3 – 6 years · Mid-career professionals with a proven track record and defined expertise.',
    useCases: ['Mid-level role transitions and promotions', 'Industry pivots and salary negotiation', 'Technical and behavioural interview coaching'],
    accentFrom: 'from-emerald-500',
    accentTo: 'to-teal-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    badgeBorder: 'border-emerald-300 dark:border-emerald-500/35',
    checkColor: 'text-emerald-600 dark:text-emerald-400',
    glowColor: 'rgba(16,185,129,0.28)',
  },
  {
    name: 'Senior',
    rateRange: '$115 – $164',
    experienceDesc: '7 – 12 years · Senior contributors who have hired, managed, and shaped organisational decisions.',
    useCases: ['Senior and staff-level interview prep', 'IC-to-management track coaching', 'High-stakes compensation negotiation'],
    accentFrom: 'from-sky-500',
    accentTo: 'to-blue-400',
    badgeBg: 'bg-sky-100 dark:bg-sky-500/20',
    badgeText: 'text-sky-800 dark:text-sky-300',
    badgeBorder: 'border-sky-300 dark:border-sky-500/35',
    checkColor: 'text-sky-600 dark:text-sky-400',
    glowColor: 'rgba(14,165,233,0.28)',
  },
  {
    name: 'Elite',
    rateRange: '$165 – $250+',
    experienceDesc: '13+ years · Executives and directors who have operated at the top of their fields.',
    useCases: ['VP, director, and C-suite preparation', 'Executive presence and board exposure', 'Strategic pivots for senior leaders'],
    accentFrom: 'from-amber-500',
    accentTo: 'to-orange-500',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    badgeText: 'text-white',
    badgeBorder: '',
    checkColor: 'text-amber-500 dark:text-amber-400',
    glowColor: 'rgba(245,158,11,0.32)',
    isElite: true,
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
  { label: 'Professional', value: 'professional' },
  { label: 'Senior', value: 'senior' },
  { label: 'Elite', value: 'elite' },
];

export const SORT_OPTIONS = [
  { label: 'Best reviewed', value: 'rating' },
  { label: 'Most experienced', value: 'experience' },
  { label: 'Most sessions', value: 'sessions' },
];

export function tierBadge(tier) {
  switch (tier) {
    case 'rising':       return 'bg-slate-500/10 text-slate-600 ring-1 ring-slate-400/30 dark:text-slate-300';
    case 'professional': return 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-400/30 dark:text-emerald-300';
    case 'senior':       return 'bg-sky-500/10 text-sky-700 ring-1 ring-sky-400/30 dark:text-sky-300';
    case 'elite':        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_2px_10px_color-mix(in srgb, var(--color-primary) 45%, transparent)]';
    default:             return 'bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-muted)] ring-1 ring-[var(--bridge-border)]';
  }
}

export function normalizeMentorId(id) {
  return id == null ? '' : String(id).toLowerCase();
}
