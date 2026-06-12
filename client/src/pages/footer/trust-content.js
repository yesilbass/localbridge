import {
  Shield, Lock, Database, Flag,
  UserCheck, FileSearch,
  Eye, Trash2,
} from 'lucide-react';

export const TOC_SECTIONS = [
  { label: 'Safety Measures', id: 'safety-measures' },
  { label: 'Prohibited Conduct', id: 'prohibited-conduct' },
  { label: 'Community Standards', id: 'community-standards' },
  { label: 'Your Data & Privacy', id: 'data-privacy' },
  { label: 'Report a Concern', id: 'report' },
  { label: 'What Happens Next', id: 'what-happens-next' },
  { label: 'Appeals', id: 'appeals' },
];

export const PROHIBITED = [
  { label: 'Harassment & threats', desc: 'Any threatening, intimidating, or abusive communication — including in session, in messages, or in community posts.' },
  { label: 'Discrimination', desc: 'Discriminatory conduct based on race, ethnicity, gender, gender identity, sexual orientation, religion, disability, age, or national origin.' },
  { label: 'Misrepresented credentials', desc: 'Claiming qualifications, titles, or experience you do not have. Mentor profiles are subject to verification.' },
  { label: 'Unauthorized recording', desc: 'Recording a video or audio session without the explicit consent of all participants. This violates our Terms and may be illegal in your jurisdiction.' },
  { label: 'Off-platform payments', desc: 'Arranging paid sessions or coaching outside Bridge. This is a material breach of our Terms and results in permanent suspension.' },
  { label: 'Fraud & impersonation', desc: 'Creating fake accounts, impersonating real people or organizations, or using Bridge for any deceptive financial scheme.' },
  { label: 'Sharing private information', desc: "Disclosing another user's personal or confidential information without authorization." },
  { label: 'Platform abuse', desc: "Scraping, crawling, reverse-engineering, or otherwise attacking Bridge's infrastructure or other users' accounts." },
];

export const WHAT_WE_DO = [
  {
    icon: Shield,
    badge: 'Verification',
    title: 'Multi-step mentor verification',
    desc: 'Every mentor goes through an application that includes identity verification, professional email and LinkedIn checks, a short voice interview, and reference review. Each component is scored individually and the final decision is made by a founder, not an algorithm.',
  },
  {
    icon: FileSearch,
    badge: 'Verification',
    title: 'Background checks (where available)',
    desc: 'In jurisdictions where the integration is available, mentor applicants may be asked to authorize a consumer background report through a licensed reporting agency. Where this check is run, the applicable disclosures and applicant rights apply.',
  },
  {
    icon: Lock,
    badge: 'Infrastructure',
    title: 'Encrypted infrastructure',
    desc: 'All traffic is encrypted end-to-end with TLS. Passwords are hashed with industry-standard one-way hashing — we never store or transmit them in plain text. Database access is enforced row-by-row, so each user can only see their own data. Video calls connect directly between participants; no video or audio ever touches our servers.',
  },
  {
    icon: Database,
    badge: 'Privacy',
    title: 'Your data, your control',
    desc: "You can export or delete your account and all personal data at any time from settings. We don't sell data. We don't run ads. Resume files are kept in private, encrypted storage and shared only through temporary access links generated for you.",
  },
  {
    icon: Eye,
    badge: 'AI',
    title: 'Transparent AI processing',
    desc: 'AI features (resume review, mentor matching, voice intake) send specific data to our AI providers. We disclose what is sent for each feature, enforce per-user rate limits, and keep an audit log of every AI call. AI outputs are estimates — useful as guidance, not as certified assessments.',
  },
  {
    icon: Flag,
    badge: 'Reporting',
    title: 'Direct reporting line',
    desc: 'Safety reports go straight to a small founder-led team via the form on this page. We aim to respond within one business day. All reports receive a ticket ID for tracking, and you can submit without providing an email.',
  },
];

export const STANDARDS_GROUPED = [
  {
    label: 'Respectful conduct',
    items: [
      'Communicate respectfully in all sessions, messages, and community posts',
      'Do not discriminate based on race, gender, sexuality, religion, disability, or background',
      'Report concerns rather than retaliating directly against other users',
    ],
  },
  {
    label: 'Honesty & privacy',
    items: [
      'Accurately represent your identity, professional experience, and credentials',
      'Do not share confidential information from sessions outside the platform',
    ],
  },
  {
    label: 'Sessions & community',
    items: [
      'Cancel promptly if you cannot attend a scheduled session',
      'Obtain explicit consent before sharing files or screen-recording a session',
      'Use community spaces for genuine career discussion — no spam or self-promotion',
    ],
  },
];

export const AFTER_REPORT = [
  { step: '1', label: 'Acknowledgement', desc: 'You receive a ticket ID by email (if you provided one). Reports without an email are acknowledged in the form.' },
  { step: '2', label: 'Review', desc: 'A founder reviews the report, typically within one business day. For safety emergencies, we act faster.' },
  { step: '3', label: 'Action', desc: 'Depending on findings: a warning, temporary restriction, permanent suspension, or escalation to law enforcement where required.' },
  { step: '4', label: 'Follow-up', desc: 'We notify the reporting party of the outcome — typically within five business days of the decision — where doing so does not compromise the privacy of those involved.' },
];

export const DATA_CONTROLS = [
  { icon: Eye, label: 'Access your data', desc: 'Request a copy of all personal data we hold about you via email.' },
  { icon: FileSearch, label: 'Correct your data', desc: 'Update inaccurate profile information directly in your account settings.' },
  { icon: Database, label: 'Export your data', desc: 'Download a portable copy of your data by emailing mentors.bridge@gmail.com.' },
  { icon: Trash2, label: 'Delete your account', desc: 'Delete your account and all personal data from Settings → Account → Delete account. Data is removed within 30 days.' },
];

export const SECTION_SUMMARIES = {
  'safety-measures': 'The systems and processes Bridge uses to protect every member of the community.',
  'prohibited-conduct': 'Actions that violate our Terms of Service and may result in suspension or legal escalation.',
  'community-standards': 'The baseline expectations for how all members engage on Bridge.',
  'data-privacy': "Bridge collects only what's necessary to operate the platform. You keep full control.",
  report: 'Submit a confidential safety report directly to a founder. All reports are reviewed personally.',
  'what-happens-next': "Here's what we do after you file a report, and when you can expect a response.",
  appeals: "Disagree with a decision? Here's how to request a review.",
};

export const BADGE_COLORS = {
  Verification: { bg: 'color-mix(in srgb, #6366f1 12%, transparent)', text: '#6366f1' },
  Infrastructure: { bg: 'color-mix(in srgb, #0ea5e9 12%, transparent)', text: '#0ea5e9' },
  Privacy: { bg: 'color-mix(in srgb, #10b981 12%, transparent)', text: '#10b981' },
  AI: { bg: 'color-mix(in srgb, #f59e0b 12%, transparent)', text: '#d97706' },
  Reporting: { bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', text: 'var(--color-primary)' },
};

export const CONCERN_TYPES = [
  'Conduct issue',
  'Harassment or discrimination',
  'Misrepresented credentials',
  'Unauthorized recording',
  'Fraud or platform misuse',
  'Privacy violation',
  'Off-platform payment solicitation',
  'Other',
];
