// Static content for the About page. No JSX, no hooks — pure data.

/** Shared vertical rhythm — tighter on small screens (aligned with /why-us). */
export const ABOUT_SECTION_PAD =
  'py-16 sm:py-20 md:py-24 lg:py-32';

export const ABOUT_CONTACT_SECTION_PAD =
  'py-16 sm:py-20 md:py-24 lg:py-28';

export const PRINCIPLES = [
  {
    number: '01',
    title: 'Outcome over credential.',
    body:
      'We screen mentors on the work they shipped, not the logos on their resume. A staff engineer at a Series B beats a title at a household name.',
    tag: 'How we vet',
  },
  {
    number: '02',
    title: 'One hour, one price.',
    body:
      'Every rate visible on every profile. No packages, no retainers, no \u201Ccontact us for pricing.\u201D If we can\u2019t say it on the page, we don\u2019t believe it ourselves.',
    tag: 'How we charge',
  },
  {
    number: '03',
    title: 'Reviews stay unfiltered.',
    body:
      'Three-star calls show up next to five-star ones. Mentors see the same feedback the next mentee sees. We don\u2019t remove posts \u2014 we let the work speak.',
    tag: 'How we earn trust',
  },
  {
    number: '04',
    title: 'Build slow, ship sharp.',
    body:
      'We add a feature when a mentor or mentee asks for it twice. Every line of the product earns its place. Nothing ships to look busy.',
    tag: 'How we build',
  },
];

export const TIMELINE_ENTRIES = [
  {
    date: 'Jan 2026',
    live: true,
    title: 'First conversation.',
    body:
      'Five operators, one shared frustration. We spent a weekend sketching what we wished had existed when we were stuck.',
    cta: { label: 'Join the waitlist', to: '/register' },
  },
  {
    date: 'Mar 2026',
    live: false,
    title: 'First mentor signed.',
    body:
      'A senior PM we\u2019d looked up to for years agreed to take paid hours through a tool that didn\u2019t exist yet. We had a month to ship one.',
  },
  {
    date: 'Apr 2026',
    live: false,
    title: 'First booked session.',
    body:
      '$60. One hour. The mentee got an offer the same week. We knew what we were building.',
  },
  {
    date: 'May 2026',
    live: false,
    title: 'Public launch.',
    body:
      'Opening to operators across product, engineering, design, and founder roles. Every mentor hand-vetted before they go live.',
  },
  {
    date: 'Q3 2026',
    live: false,
    title: 'Cohort tools.',
    body:
      'Bookable group sessions for teams hiring or restructuring. Same operators, same rate clarity, more value per hour.',
  },
];

export const TEAM_FEATURED = {
  name: 'Muaz Sadique',
  initials: 'MS',
  discipline: 'Engineering',
  role: 'Co-founder',
  focus: 'Product & engineering',
  bio:
    'Muaz leads product and engineering at Bridge. Before Bridge, he shipped consumer and developer tools at early-stage startups and contributed to open-source projects used by thousands of teams.',
  linkedinUrl: null,
  githubUrl: null,
};

export const TEAM_SMALL = [
  {
    name: 'Ahmet Yesilbas',
    initials: 'AY',
    role: 'Co-founder',
    focus: 'Growth & partnerships',
    linkedinUrl: null,
    githubUrl: null,
  },
  {
    name: 'Aayush Patel',
    initials: 'AP',
    role: 'Co-founder',
    focus: 'Pricing',
    linkedinUrl: null,
    githubUrl: null,
  },
  {
    name: 'Omar Aydah',
    initials: 'OA',
    role: 'Co-founder',
    focus: 'Mentor experience',
    linkedinUrl: null,
    githubUrl: null,
  },
  {
    name: 'Irshad Muse',
    initials: 'IM',
    role: 'Co-founder',
    focus: 'Community & ops',
    linkedinUrl: null,
    githubUrl: null,
  },
];
