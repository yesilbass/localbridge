import { MENTORSHIP_CATEGORIES } from '../constants/mentorshipCategories';

const EXTRA = [
  'Software Engineering',
  'Marketing',
  'Parenting',
  'Immigration',
  'Islamic guidance',
  'Christian mentorship',
  'Personal finance',
  'Fitness',
  'Sobriety support',
  'Career coaching',
  'Marriage counseling',
  'Content creation',
  'Entrepreneurship',
  'Leadership',
  'Language learning',
  'Product management',
  'Data science',
  'UX design',
  'Public speaking',
  'Negotiation',
  'Work-life balance',
  'Burnout recovery',
  'Grief support',
  'ADHD coaching',
  'Remote work',
  'Salary negotiation',
  'College admissions',
  'Grad school applications',
  'Faith & spirituality',
  'Relationship advice',
  'Divorce recovery',
  'Single parenting',
  'Military transition',
  'Disability advocacy',
  'Mental health',
  'Nutrition',
  'Real estate',
  'Tax planning',
  'Nonprofit leadership',
  'Academic research',
];

const fromCategories = MENTORSHIP_CATEGORIES.flatMap((cat) => [
  cat.label,
  ...cat.subcategories.map((s) => s.label),
]);

export const EXPERTISE_SUGGESTIONS = [...new Set([...EXTRA, ...fromCategories])].sort((a, b) =>
  a.localeCompare(b),
);

export function filterExpertiseSuggestions(query, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return EXPERTISE_SUGGESTIONS.slice(0, limit);
  return EXPERTISE_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(0, limit);
}
