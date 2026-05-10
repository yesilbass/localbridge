// Static content for the Why Us page. No JSX, no hooks — pure data.
// Diagrams for MECHANISMS live in MechanismSection.jsx because they
// need JSX and icons.

export const BELIEFS = [
  {
    oldWay: 'Sell the package. Lock the customer in for six months.',
    ourWay: 'One hour, one price, no lock-in.',
    because:
      'If we cannot earn the rebook, we have not earned the relationship. The hour is the unit of trust.',
  },
  {
    oldWay: 'Curate the testimonials. Hide the bad reviews.',
    ourWay: 'Every review, in the order they came in.',
    because:
      'A page of perfect five-stars is not a recommendation, it is a marketing budget. We publish the threes.',
  },
  {
    oldWay:
      'Coaches with frameworks. Career experts with certifications.',
    ourWay:
      'Operators with scars. People who have done your job.',
    because:
      'Frameworks are downstream of having shipped. Anyone charging for advice without the receipts is selling theatre.',
  },
  {
    oldWay: 'Custom pricing. Contact sales.',
    ourWay: 'The rate is on the profile. Always.',
    because:
      'Hidden pricing is a tax on people without networks. The whole point of Bridge is to not be that.',
  },
];

export const ALTERNATIVES = [
  {
    iconName: 'MessageCircle',
    label: 'LinkedIn cold DM',
    headline: 'A message into the void.',
    priceLabel: '$0 \u2014 and worth it',
    timeLabel: 'Three weeks for a maybe',
    outcomeLabel: 'Two replies in fifty',
  },
  {
    iconName: 'Briefcase',
    label: 'Six-month coaching package',
    headline: '$1,200 before you know if it fits.',
    priceLabel: '$1,200 / 6 months',
    timeLabel: 'Locked in week one',
    outcomeLabel: 'Generic frameworks',
  },
  {
    iconName: 'PlayCircle',
    label: 'Course or content library',
    headline: 'Advice from no one in particular.',
    priceLabel: '$200 / library',
    timeLabel: 'Self-paced \u2014 by yourself',
    outcomeLabel: 'No one to ask',
  },
];

export const RECEIPTS = [
  {
    number: '97%',
    label: 'Would rebook',
    caption: 'Measured one week after every session.',
  },
  {
    number: '3.2 min',
    label: 'Average time to book',
    caption: 'From profile click to scheduled hour.',
  },
  {
    number: '$0',
    label: 'Subscription fees',
    caption: 'We will not charge a monthly retainer.',
  },
];

export const MECHANISMS = [
  {
    num: '01',
    title: 'Hand-vetted, not self-serve.',
    body:
      'Every mentor goes through a three-step vetting: role verification, two reference calls, a sample session. No badge-buying, no signup-and-list.',
    enforces: 'Belief 03',
    diagram: 'vetting-pills',
  },
  {
    num: '02',
    title: 'Pricing on the profile, in the URL.',
    body:
      'Every mentor\u2019s hourly rate is rendered server-side in the page meta. Search engines see it. You see it before you click. Sales calls don\u2019t change it.',
    enforces: 'Belief 04',
    diagram: 'url-bar',
  },
  {
    num: '03',
    title: 'Reviews publish in arrival order, threes included.',
    body:
      'No moderation queue, no curation layer. The chronological feed on every profile is the actual chronological feed. Mentors see their threes the same minute the page does.',
    enforces: 'Belief 02',
    diagram: 'review-feed',
  },
];

export const COMMITMENTS = [
  {
    iconName: 'BadgeCheck',
    title: 'Flat hourly rate, on every profile.',
    body: 'No tiers, no enterprise pricing, no annual minimums.',
    stamp: 'We will not.',
  },
  {
    iconName: 'Eye',
    title: 'Every review, including the threes.',
    body: 'Bad reviews stay. Good reviews are not edited. Period.',
    stamp: 'We will.',
  },
  {
    iconName: 'ShieldOff',
    title: 'No subscriptions, no retainers.',
    body: 'You pay for the hours you book. That is the entire bill.',
    stamp: 'We will not.',
  },
  {
    iconName: 'Handshake',
    title: 'If a session doesn\u2019t earn the rebook, it\u2019s on us.',
    body:
      'Refunded inside one click. No support ticket, no phone tree.',
    stamp: 'We will.',
  },
];

export const AUDIENCE_FOR = [
  'You are choosing between two job offers next week.',
  'You are interviewing at staff level and one round is failing.',
  'You are switching industries and want a sanity check.',
  'You are raising a seed round and need a pre-pitch.',
  'You manage a team and your one-on-ones aren\u2019t landing.',
];

export const AUDIENCE_NOT_FOR = [
  'You want a six-month relationship with weekly check-ins.',
  'You want a coach to keep you accountable to your habits.',
  'You want generic career advice with no specific question.',
  'You want a free reply to a LinkedIn DM.',
];
