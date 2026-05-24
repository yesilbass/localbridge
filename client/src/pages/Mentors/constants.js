export const PAGE_SIZE = 8;
/** Browse list — wide row cards */
export const MENTORS_PAGE_MAX = 'min(102rem, calc(100vw - 1.5rem))';

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

export const SORT_OPTIONS = [
  { label: 'Best reviewed', value: 'rating' },
  { label: 'Most experienced', value: 'experience' },
  { label: 'Most sessions', value: 'sessions' },
];

export function normalizeMentorId(id) {
  return id == null ? '' : String(id).toLowerCase();
}
