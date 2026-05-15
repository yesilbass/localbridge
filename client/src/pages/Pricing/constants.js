export const ANNUAL_DISCOUNT = 0.2;

export const STUDENT_DISCOUNT = 0.5;
export const STUDENT_EMAIL_DOMAINS = ['.edu'];
export function isStudentEmail(email) {
  if (!email) return false;
  const domain = (email.split('@')[1] ?? '').toLowerCase();
  return STUDENT_EMAIL_DOMAINS.some((d) => domain.endsWith(d));
}

// Four mentor tiers assigned algorithmically by Bridge.
// Boundaries match server/routes/dev.js → computeTierAndRate().
//
//  Rising       $40–$74    0–2 yrs   any education
//  Professional $75–$114   3–6 yrs   typically Bachelors
//  Senior       $115–$164  7–12 yrs  typically Masters / MBA
//  Elite        $165–$250+ 13+ yrs   advanced degree + senior score
//
// Rates are not set by mentors — they are derived from education, years, and verification score.
export const MENTOR_TIERS = [
  {
    name: 'Rising',
    rateRange: '$40 – $74',
    yearsRange: '0 – 2 years',
    highlight: 'Best for first-role seekers',
    experienceDesc: 'Early-career professionals on their way up. Fully verified through Bridge — they have first-hand, current knowledge of modern hiring and what it actually takes to break in.',
    useCases: [
      'Resume and LinkedIn profile review',
      'Entry-level and new-grad interview prep',
      'Job search strategy and application targeting',
      'Navigating your first 90 days in a new role',
      'Real expectations from someone who just navigated the same path',
    ],
    whoTheyAre: 'Recent graduates and professionals in their first two years, identity-verified and background-checked through Bridge.',
    accent: 'slate',
    halo: 'rgba(100,116,139,0.22)',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
    edgeClass: 'border-slate-300/35 dark:border-slate-400/20',
    bgClass: 'bg-gradient-to-br from-slate-50/50 via-[var(--bridge-surface)] to-slate-50/20 dark:from-slate-500/8 dark:via-[var(--bridge-surface)] dark:to-slate-500/[0.03]',
    accentBar: 'bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400',
  },
  {
    name: 'Professional',
    rateRange: '$75 – $114',
    yearsRange: '3 – 6 years',
    highlight: 'Most booked tier',
    experienceDesc: 'Mid-career professionals with a proven track record and a defined area of expertise. Strong enough to advise on career moves they have personally navigated.',
    useCases: [
      'Mid-level role transitions and promotion strategy',
      'Industry pivots leveraging transferable skills',
      'Salary negotiation and compensation benchmarking',
      'Technical and behavioural interview coaching',
      'Building a professional brand and expanding your network',
    ],
    whoTheyAre: 'Professionals 3–6 years into their careers, typically holding a Bachelors degree, verified through Bridge\'s algorithmic review.',
    accent: 'emerald',
    halo: 'rgba(16,185,129,0.25)',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    edgeClass: 'border-emerald-300/35 dark:border-emerald-400/25',
    bgClass: 'bg-gradient-to-br from-emerald-50/40 via-[var(--bridge-surface)] to-emerald-50/20 dark:from-emerald-500/10 dark:via-[var(--bridge-surface)] dark:to-emerald-500/[0.04]',
    accentBar: 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400',
  },
  {
    name: 'Senior',
    rateRange: '$115 – $164',
    yearsRange: '7 – 12 years',
    highlight: 'Best for career acceleration',
    experienceDesc: 'Senior contributors and functional leaders with meaningful organisational scope. They have hired, managed, and made the kinds of decisions your next role will require.',
    useCases: [
      'Senior and staff-level interview preparation',
      'Promotion from individual contributor to management track',
      'Cross-functional influence and executive communication',
      'High-stakes compensation negotiation ($150K–$300K range)',
      'Strategic career pivots for established professionals',
    ],
    whoTheyAre: 'Professionals 7–12 years into their careers, commonly holding Masters or MBA credentials, verified through Bridge\'s full algorithmic review.',
    accent: 'sky',
    halo: 'rgba(14,165,233,0.25)',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    edgeClass: 'border-sky-300/35 dark:border-sky-400/25',
    bgClass: 'bg-gradient-to-br from-sky-50/40 via-[var(--bridge-surface)] to-sky-50/20 dark:from-sky-500/10 dark:via-[var(--bridge-surface)] dark:to-sky-500/[0.04]',
    accentBar: 'bg-gradient-to-r from-sky-500 via-sky-400 to-blue-400',
  },
  {
    name: 'Elite',
    rateRange: '$165 – $250+',
    yearsRange: '13+ years',
    highlight: 'For high-stakes decisions',
    experienceDesc: 'Executives, directors, and advanced-degree specialists who have operated at the top of their fields and shaped industries, organisations, and teams at scale.',
    useCases: [
      'VP, director, and C-suite role preparation and positioning',
      'Executive presence, stakeholder influence, and board exposure',
      'Compensation strategy at the $300K–$600K+ level',
      'Entrepreneurship, exits, and portfolio career planning',
      'Strategic pivots for senior leaders changing industries',
    ],
    whoTheyAre: 'Executives and senior specialists with 13+ years of experience, frequently holding MBA, PhD, JD, or MD credentials, scored in the top tier of Bridge\'s verification algorithm.',
    accent: 'amber',
    halo: 'color-mix(in srgb, var(--color-primary) 45%, transparent)',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_18px_color-mix(in srgb,var(--color-primary)_45%,transparent)]',
    edgeClass: 'border-amber-400/45 ring-1 ring-amber-400/22',
    bgClass: 'bg-gradient-to-br from-amber-50/55 via-[var(--bridge-surface)] to-orange-50/35 dark:from-amber-500/12 dark:via-[var(--bridge-surface)] dark:to-orange-500/8',
    accentBar: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500',
    isElite: true,
  },
];

export const COMPARISON_ROWS = [
  { label: 'Browse directory & profiles',       free: true,        starter: true,        pro: true,        premium: true },
  { label: 'View ratings & reviews',            free: true,        starter: true,        pro: true,        premium: true },
  { label: 'Save & shortlist mentors',          free: '5',         starter: 'Unlimited', pro: 'Unlimited', premium: 'Unlimited' },
  { label: 'Session booking',                   free: true,        starter: true,        pro: true,        premium: true },
  { label: 'Session recap & notes',             free: false,       starter: true,        pro: true,        premium: true },
  { label: 'Calendar sync',                     free: false,       starter: true,        pro: true,        premium: true },
  { label: 'AI mentor matching',                free: '3 uses',    starter: 'Unlimited', pro: 'Unlimited', premium: 'Unlimited' },
  { label: 'AI resume review',                  free: '1 use',     starter: true,        pro: true,        premium: true },
  { label: 'Priority in mentor request queues', free: false,       starter: false,       pro: true,        premium: true },
  { label: 'Early access to new mentors',       free: false,       starter: false,       pro: true,        premium: true },
  { label: 'Priority support',                  free: false,       starter: false,       pro: false,       premium: true },
  { label: 'Dedicated account manager',         free: false,       starter: false,       pro: false,       premium: true },
  { label: 'Mentor sessions billed separately', free: true,        starter: true,        pro: true,        premium: true },
];

export const FAQ_ITEMS = [
  {
    q: 'How are mentor rates determined?',
    a: 'Rates are assigned algorithmically by Bridge based on each mentor\'s verified education, years of experience, and application score — not set by the mentor. This keeps pricing objective and consistent. Mentors can submit a rate review request from their dashboard if they believe their assignment is inaccurate.',
  },
  {
    q: 'What is the difference between the four tiers?',
    a: 'Rising mentors are 0–2 years into their careers — current, practical knowledge of modern hiring. Professional mentors have 3–6 years with an established track record. Senior mentors have 7–12 years and often hold advanced degrees. Elite mentors have 13+ years and have operated at the executive or specialist level. Every tier is verified — the names reflect career depth, not quality.',
  },
  {
    q: 'Are mentor sessions included in my subscription?',
    a: 'No. Subscriptions unlock platform features like unlimited saves, priority matching, and calendar sync. Mentor sessions are paid separately at the mentor\'s assigned rate when you book.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes. Upgrade or downgrade anytime. Upgrades take effect immediately and are prorated. Downgrades apply at the next billing cycle.',
  },
  {
    q: 'How does Bridge verify mentors?',
    a: 'Every mentor submits a verified application including work history, education credentials, government ID, and a motivation essay scored algorithmically. Only candidates who clear our verification threshold are approved. Identity is confirmed through document upload and — once fully enabled — a third-party background check.',
  },
  {
    q: 'What about refunds?',
    a: 'Cancel anytime and you won\'t be billed again. For mid-cycle subscription refunds or session disputes, contact support — we handle these case by case.',
  },
];

export function tierMonthlyEquivalent(monthly, annual) {
  if (monthly === 0) return 0;
  if (!annual) return monthly;
  return Math.round(monthly * (1 - ANNUAL_DISCOUNT));
}
