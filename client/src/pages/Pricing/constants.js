import { PAID_PLAN_NAMES, PLAN_MONTHLY_USD } from '../../../../shared/subscriptionPlans.js';

export const ANNUAL_DISCOUNT = 0.2;

export const STUDENT_DISCOUNT = 0.5;
export const STUDENT_EMAIL_DOMAINS = ['.edu'];
export function isStudentEmail(email) {
  if (!email) return false;
  const domain = (email.split('@')[1] ?? '').toLowerCase();
  return STUDENT_EMAIL_DOMAINS.some((d) => domain.endsWith(d));
}

/** Paid subscription plan names — must match Stripe checkout + finalize-checkout. */
export const PAID_PLANS = PAID_PLAN_NAMES;

export { PLAN_MONTHLY_USD };

export const COMPARISON_PLANS = [
  { id: 'free', name: 'Free', monthly: 0, ctaGuest: 'Sign up free', ctaUser: 'Current plan', href: '/register' },
  { id: 'plus', name: 'Plus', monthly: PLAN_MONTHLY_USD.Plus, cta: 'Choose Plus', planKey: 'Plus' },
  { id: 'pro', name: 'Pro', monthly: PLAN_MONTHLY_USD.Pro, cta: 'Choose Pro', planKey: 'Pro', featured: true },
];

export const COMPARISON_SECTIONS = [
  {
    id: 'access',
    label: 'Mentor access',
    sub: 'Always free — never pay per session',
    rows: [
      { label: 'Volunteer mentor sessions',  free: true,        plus: true,        pro: true },
      { label: 'Browse directory & reviews', free: true,        plus: true,        pro: true },
    ],
  },
  {
    id: 'tools',
    label: 'AI & workflow',
    sub: 'What Plus and Pro unlock',
    rows: [
      { label: 'Saved mentors',              free: '5',         plus: 'Unlimited', pro: 'Unlimited' },
      { label: 'AI mentor matching',         free: '3 total',   plus: 'Unlimited', pro: 'Unlimited' },
      { label: 'AI resume review',           free: '1 total',   plus: 'Unlimited', pro: 'Unlimited' },
      { label: 'Calendar sync',              free: false,       plus: true,        pro: true },
      { label: 'Session notes & recaps',     free: false,       plus: true,        pro: true },
    ],
  },
  {
    id: 'pro',
    label: 'Pro advantages',
    sub: 'Priority when you are booking often',
    rows: [
      { label: 'Priority AI matching',             free: false, plus: false, pro: true },
      { label: 'Priority in mentor request queue', free: false, plus: false, pro: true },
      { label: 'Early access to new mentors',      free: false, plus: false, pro: true },
      { label: 'Priority support',                 free: false, plus: false, pro: true },
    ],
  },
];

/** @deprecated use COMPARISON_SECTIONS — kept for any flat consumers */
export const COMPARISON_ROWS = COMPARISON_SECTIONS.flatMap((section) => section.rows);

export const FAQ_ITEMS = [
  {
    q: 'Are mentor sessions really free?',
    a: 'Yes — always. Bridge mentors volunteer their time. You never pay per session. Subscriptions unlock career tools — AI matching, resume review, and booking workflow — at a fraction of what premium mentorship platforms charge.',
  },
  {
    q: 'What am I paying for on Plus or Pro?',
    a: 'Platform tools, not mentor time. Plus ($49/mo) adds unlimited AI matching, resume reviews, calendar sync, and session notes. Pro ($79/mo) adds priority matching, faster queue placement, and early access to new mentors.',
  },
  {
    q: 'How does this compare to GrowthMentor or ADPList?',
    a: 'GrowthMentor charges $50–$150/month for unlimited mentor access plus AI tools. ADPList is free but ad-supported with no AI career stack. Bridge keeps mentor hours free on every plan and charges for the AI + workflow layer instead.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes. Upgrade or downgrade anytime. Upgrades take effect immediately and are prorated. Downgrades apply at the next billing cycle.',
  },
  {
    q: 'What about refunds?',
    a: "Cancel anytime and you won't be billed again. Mid-cycle refunds are handled case by case — email support.",
  },
];

export function tierMonthlyEquivalent(monthly, annual) {
  if (monthly === 0) return 0;
  if (!annual) return monthly;
  return Math.round(monthly * (1 - ANNUAL_DISCOUNT));
}
