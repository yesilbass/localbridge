// Stable mock UUIDs so `/mentors/{id}` links remain consistent across renders.
// These are demo identifiers only; real database UUIDs replace them at integration time.
export const MENTORS_ROW1 = [
  { id: 'm-maya-chen',      name: 'Maya Chen',      title: 'Director of Product',  company: 'Linear',     co: 'Linear',     tags: ['PM Strategy', 'Promotion'],          rate: 95,  rating: 4.9, sessions: 86,  tone: 'amber',   online: true,  avatarUrl: null },
  { id: 'm-jordan-reeves',  name: 'Jordan Reeves',  title: 'Ex-FAANG Recruiter',   company: 'Google',     co: 'Google',     tags: ['Interview Prep', 'Offers'],          rate: 60,  rating: 4.8, sessions: 142, tone: 'orange',  online: false, avatarUrl: null },
  { id: 'm-elena-voss',     name: 'Elena Voss',     title: 'RN → UX Designer',     company: 'IDEO',       co: 'IDEO',       tags: ['Career Switch', 'Portfolio'],        rate: 45,  rating: 5.0, sessions: 58,  tone: 'rose',    online: true,  avatarUrl: null },
  { id: 'm-marcus-lee',     name: 'Marcus Lee',     title: 'Engineering Manager',  company: 'Stripe',     co: 'Stripe',     tags: ['EM Path', 'System Design'],          rate: 120, rating: 4.9, sessions: 203, tone: 'sky',     online: false, avatarUrl: null },
  { id: 'm-aisha-park',     name: 'Dr. Aisha Park', title: 'Biotech Founder',      company: 'Stanford',   co: 'Stanford',   tags: ['Fundraising', 'Science Biz'],        rate: 150, rating: 4.7, sessions: 37,  tone: 'violet',  online: true,  avatarUrl: null },
  { id: 'm-tom-rodriguez',  name: 'Tom Rodriguez',  title: 'VP of Sales',          company: 'Salesforce', co: 'Salesforce', tags: ['Enterprise Sales', 'SDR→AE'],        rate: 55,  rating: 4.8, sessions: 95,  tone: 'teal',    online: false, avatarUrl: null },
];

export const MENTORS_ROW2 = [
  { id: 'm-sarah-kim',      name: 'Sarah Kim',      title: 'Head of Design',       company: 'Airbnb',  co: 'Airbnb',  tags: ['Design Systems', 'Leadership'], rate: 85,  rating: 4.9, sessions: 64,  tone: 'pink',    online: true,  avatarUrl: null },
  { id: 'm-raj-patel',      name: 'Raj Patel',      title: 'Principal Engineer',   company: 'Meta',    co: 'Meta',    tags: ['Architecture', 'Staff Eng'],    rate: 110, rating: 4.8, sessions: 118, tone: 'emerald', online: false, avatarUrl: null },
  { id: 'm-camille-dubois', name: 'Camille Dubois', title: 'Brand Strategist',     company: 'Nike',    co: 'Nike',    tags: ['Brand', 'Creative Strategy'],   rate: 70,  rating: 5.0, sessions: 43,  tone: 'rose',    online: false, avatarUrl: null },
  { id: 'm-alex-wong',      name: 'Alex Wong',      title: 'Growth Lead',          company: 'Notion',  co: 'Notion',  tags: ['Growth', 'Retention'],          rate: 90,  rating: 4.7, sessions: 77,  tone: 'amber',   online: true,  avatarUrl: null },
  { id: 'm-diana-ferreira', name: 'Diana Ferreira', title: 'Data Science Manager', company: 'Spotify', co: 'Spotify', tags: ['ML', 'Analytics'],              rate: 100, rating: 4.9, sessions: 52,  tone: 'sky',     online: false, avatarUrl: null },
  { id: 'm-omar-hassan',    name: 'Omar Hassan',    title: 'Startup Founder',      company: 'YC W23',  co: 'YC W23',  tags: ['Fundraising', '0→1'],           rate: 130, rating: 4.8, sessions: 29,  tone: 'teal',    online: true,  avatarUrl: null },
];

export const ALL_MENTORS = [...MENTORS_ROW1, ...MENTORS_ROW2];

export function findMentor(id) {
  return ALL_MENTORS.find(m => m.id === id);
}

// HeroLiveMatch — four goal categories, three mentor ids each.
export const MATCH_GOALS = [
  { chip: 'Land my next PM role',
    mentorIds: ['m-maya-chen', 'm-alex-wong', 'm-jordan-reeves'] },
  { chip: 'Switch into engineering management',
    mentorIds: ['m-marcus-lee', 'm-raj-patel', 'm-diana-ferreira'] },
  { chip: 'Prep for a senior interview',
    mentorIds: ['m-jordan-reeves', 'm-marcus-lee', 'm-maya-chen'] },
  { chip: 'Take my company through fundraising',
    mentorIds: ['m-omar-hassan', 'm-aisha-park', 'm-tom-rodriguez'] },
];

// OutcomesSection — three featured testimonials with first-name + initial only.
// No company names in attribution; industry-only. Metric is short and concrete.
export const OUTCOMES = [
  {
    quote: "Two sessions with a former FAANG recruiter. She rewrote my “tell me about yourself” in ten minutes. Offer landed a week later — twenty percent over my last comp.",
    name: 'Tyler N.',
    role: 'Senior Engineer',
    industry: 'B2B SaaS',
    metric: '+32% TC',
    avatarUrl: null,
  },
  {
    quote: "I was terrified to leave finance. One session with someone who made the exact same jump saved me six months of second-guessing.",
    name: 'Priya S.',
    role: 'Product Manager',
    industry: 'fintech',
    metric: 'Switched industries',
    avatarUrl: null,
  },
  {
    quote: "Stuck at Senior for four years. My mentor called out exactly which work didn't count. Promoted in the next cycle.",
    name: 'Jordan E.',
    role: 'Staff Engineer',
    industry: 'developer tools',
    metric: 'IC → Staff',
    avatarUrl: null,
  },
];

