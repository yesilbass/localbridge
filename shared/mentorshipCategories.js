// Used for mentee filtering, AI matching, and server-side categorization.
// Mentors do not select from this list.

export const MENTORSHIP_CATEGORIES = [
  {
    id: 'career',
    label: 'Career & Professional',
    icon: 'briefcase',
    subcategories: [
      { id: 'career_development', label: 'Career development' },
      { id: 'interview_prep', label: 'Interview prep' },
      { id: 'resume_personal_brand', label: 'Resume & personal brand' },
      { id: 'entrepreneurship', label: 'Entrepreneurship & startups' },
      { id: 'leadership', label: 'Leadership & management' },
      { id: 'networking', label: 'Networking' },
      { id: 'freelancing', label: 'Freelancing & consulting' },
      { id: 'tech_careers', label: 'Tech & software careers' },
      { id: 'creative_careers', label: 'Creative & media careers' },
    ],
  },
  {
    id: 'education',
    label: 'Education',
    icon: 'school',
    subcategories: [
      { id: 'college_applications', label: 'College applications' },
      { id: 'grad_school', label: 'Grad & professional school' },
      { id: 'academic_tutoring', label: 'Academic tutoring' },
      { id: 'language_learning', label: 'Language learning' },
      { id: 'first_gen', label: 'First-generation student support' },
    ],
  },
  {
    id: 'finances',
    label: 'Finances',
    icon: 'coin',
    subcategories: [
      { id: 'personal_finance', label: 'Personal finance & budgeting' },
      { id: 'home_buying', label: 'Home buying' },
      { id: 'investing_basics', label: 'Investing basics' },
      { id: 'debt_management', label: 'Debt management' },
      { id: 'small_business_finance', label: 'Small business finances' },
    ],
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    icon: 'heart-pulse',
    subcategories: [
      { id: 'fitness', label: 'Fitness & training' },
      { id: 'nutrition', label: 'Nutrition' },
      { id: 'sleep_recovery', label: 'Sleep & recovery' },
      { id: 'sobriety', label: 'Sobriety & recovery support' },
    ],
  },
  {
    id: 'relationships',
    label: 'Relationships & Family',
    icon: 'heart-handshake',
    subcategories: [
      { id: 'marriage', label: 'Marriage mentorship' },
      { id: 'premarital', label: 'Pre-marital guidance' },
      { id: 'parenting', label: 'Parenting' },
      { id: 'dating', label: 'Dating & relationships' },
      { id: 'divorce_coparenting', label: 'Divorce & co-parenting' },
      { id: 'grief', label: 'Grief & loss' },
      { id: 'fertility', label: 'Fertility & family planning' },
    ],
  },
  {
    id: 'faith',
    label: 'Faith & Spirituality',
    icon: 'sun',
    subcategories: [
      { id: 'islamic', label: 'Islamic mentorship' },
      { id: 'christian', label: 'Christian mentorship' },
      { id: 'jewish', label: 'Jewish mentorship' },
      { id: 'mindfulness', label: 'Mindfulness & spirituality' },
      { id: 'purpose', label: 'Finding purpose & meaning' },
    ],
  },
  {
    id: 'life',
    label: 'Life Navigation',
    icon: 'compass',
    subcategories: [
      { id: 'immigration', label: 'Immigration & settling in a new country' },
      { id: 'first_gen_success', label: 'First-generation success' },
      { id: 'veterans', label: 'Veterans & service member transition' },
      { id: 'retirement', label: 'Retirement & next chapter' },
      { id: 'disability', label: 'Disability & chronic illness navigation' },
      { id: 'reentry', label: 'Incarceration reentry support' },
    ],
  },
  {
    id: 'creative',
    label: 'Creative & Skills',
    icon: 'palette',
    subcategories: [
      { id: 'creative_arts', label: 'Creative arts (writing, music, photography, film)' },
      { id: 'coding', label: 'Self-taught coding & bootcamp support' },
      { id: 'content_creation', label: 'Content creation & audience building' },
      { id: 'maker_crafts', label: 'Maker skills & crafts' },
    ],
  },
];

const categoryById = new Map(MENTORSHIP_CATEGORIES.map((c) => [c.id, c]));
const subcategoryById = new Map(
  MENTORSHIP_CATEGORIES.flatMap((c) => c.subcategories.map((s) => [s.id, { ...s, categoryId: c.id }])),
);

export function getCategoryLabel(id) {
  return categoryById.get(id)?.label ?? id;
}

export function getCategoryLabels(ids) {
  if (!Array.isArray(ids)) return [];
  return ids.map(getCategoryLabel).filter(Boolean);
}

export function getSubcategoryLabel(id) {
  return subcategoryById.get(id)?.label ?? id;
}

export function getCategoryById(id) {
  return categoryById.get(id) ?? null;
}

export function getSubcategoriesForCategory(categoryId) {
  return categoryById.get(categoryId)?.subcategories ?? [];
}

export function isValidCategoryId(id) {
  return categoryById.has(id);
}

export function isValidSubcategoryId(id) {
  return subcategoryById.has(id);
}

export const VALID_CATEGORY_IDS = new Set(MENTORSHIP_CATEGORIES.map((c) => c.id));
export const VALID_SUBCATEGORY_IDS = new Set(subcategoryById.keys());
