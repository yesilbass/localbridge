export const ANNUAL_DISCOUNT = 0.2;

export const MENTOR_TIERS = [
  {
    name: 'Rising',
    rateRange: '$40–$70',
    yearsRange: '0 – 4',
    experienceDesc: 'Early-career professionals and recent grads who have earned their first real wins.',
    useCases: [
      'First job search and resume polish',
      'Breaking into competitive entry-level roles',
      'Building professional habits and early momentum',
    ],
    accent: 'emerald',
    halo: 'rgba(16,185,129,0.30)',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    edgeClass: 'border-emerald-300/35 dark:border-emerald-400/25',
    bgClass: 'bg-gradient-to-br from-emerald-50/40 via-[var(--bridge-surface)] to-emerald-50/20 dark:from-emerald-500/10 dark:via-[var(--bridge-surface)] dark:to-emerald-500/[0.04]',
    accentBar: 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400',
  },
  {
    name: 'Established',
    rateRange: '$75–$120',
    yearsRange: '5 – 9',
    experienceDesc: 'Mid-career contributors with a proven track record and a clear area of focus.',
    useCases: [
      'Mid-level to senior career transitions',
      'Navigating promotion cycles and leveling up',
      'Changing industries or switching functions',
    ],
    accent: 'sky',
    halo: 'rgba(14,165,233,0.30)',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    edgeClass: 'border-sky-300/35 dark:border-sky-400/25',
    bgClass: 'bg-gradient-to-br from-sky-50/40 via-[var(--bridge-surface)] to-sky-50/20 dark:from-sky-500/10 dark:via-[var(--bridge-surface)] dark:to-sky-500/[0.04]',
    accentBar: 'bg-gradient-to-r from-sky-500 via-sky-400 to-blue-400',
  },
  {
    name: 'Expert',
    rateRange: '$125–$175',
    yearsRange: '10 – 15',
    experienceDesc: 'Senior leaders with deep functional expertise and meaningful organizational scope.',
    useCases: [
      'Senior or staff-level interview preparation',
      'Executive communication and cross-functional influence',
      'High-stakes career pivots and role expansions',
    ],
    accent: 'violet',
    halo: 'rgba(139,92,246,0.30)',
    badgeClass: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
    edgeClass: 'border-violet-300/35 dark:border-violet-400/25',
    bgClass: 'bg-gradient-to-br from-violet-50/40 via-[var(--bridge-surface)] to-violet-50/20 dark:from-violet-500/10 dark:via-[var(--bridge-surface)] dark:to-violet-500/[0.04]',
    accentBar: 'bg-gradient-to-r from-violet-500 via-violet-400 to-purple-400',
  },
  {
    name: 'Elite',
    rateRange: '$180–$250',
    yearsRange: '15 +',
    experienceDesc: 'C-suite executives and industry-defining practitioners at the top of their fields.',
    useCases: [
      'VP and C-suite transition coaching',
      'Board-level presence and strategic positioning',
      'Legacy career decisions, exits, and portfolio moves',
    ],
    accent: 'amber',
    halo: 'rgba(234,88,12,0.45)',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_18px_rgba(234,88,12,0.45)]',
    edgeClass: 'border-amber-400/45 ring-1 ring-amber-400/22',
    bgClass: 'bg-gradient-to-br from-amber-50/55 via-[var(--bridge-surface)] to-orange-50/35 dark:from-amber-500/12 dark:via-[var(--bridge-surface)] dark:to-orange-500/8',
    accentBar: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500',
    isElite: true,
  },
];

export const COMPARISON_ROWS = [
  { label: 'Browse directory & profiles',    free: true,        starter: true,        pro: true,        premium: true },
  { label: 'View ratings & reviews',         free: true,        starter: true,        pro: true,        premium: true },
  { label: 'Mentor favorites',               free: '10',        starter: 'Unlimited', pro: 'Unlimited', premium: 'Unlimited' },
  { label: 'Direct messages with mentors',   free: false,       starter: true,        pro: true,        premium: true },
  { label: 'Session recap notes',            free: false,       starter: true,        pro: true,        premium: true },
  { label: 'Calendar sync',                  free: false,       starter: true,        pro: true,        premium: true },
  { label: 'Priority mentor matching',       free: false,       starter: false,       pro: true,        premium: true },
  { label: 'Priority in request queues',     free: false,       starter: false,       pro: true,        premium: true },
  { label: 'Early access to new mentors',    free: false,       starter: false,       pro: true,        premium: true },
  { label: 'Priority support',               free: false,       starter: false,       pro: false,       premium: true },
  { label: 'Mentor sessions booked separately', free: true,     starter: true,        pro: true,        premium: true },
];

export const FAQ_ITEMS = [
  {
    q: 'Can I switch plans later?',
    a: 'Yes. Move up or down between tiers whenever. Upgrades are prorated, downgrades kick in at the next billing cycle.',
  },
  {
    q: 'Do mentors set their own rates?',
    a: 'Yes. Each mentor has their own booking rate shown on their profile. Subscription plans do not include mentor sessions.',
  },
  {
    q: 'Are mentor sessions included in subscriptions?',
    a: 'No. Subscriptions cover Bridge platform access and features. Mentor sessions are paid separately when booked.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: "The Free tier already covers real usage. If we add trials later we'll say so clearly.",
  },
  {
    q: 'What about refunds?',
    a: "Cancel anytime and you won't be billed again. For mid-cycle refunds, contact support — we handle these case by case.",
  },
];

export function tierMonthlyEquivalent(monthly, annual) {
  if (monthly === 0) return 0;
  if (!annual) return monthly;
  return Math.round(monthly * (1 - ANNUAL_DISCOUNT));
}
