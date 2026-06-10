import {
  Shield, Lock, Eye, FileCheck, Database, UserCheck, Trash2, Scale, Globe2, Slash
} from 'lucide-react';

export const EMAIL = 'mentors.bridge@gmail.com';
export const LAST_UPDATED = 'June 7, 2026';

export const SECTIONS = [
  {
    id: 'collection',
    title: '1. Information We Collect',
    content: {
      type: 'groups',
      groups: [
        {
          label: 'You provide directly',
          items: [
            'Name, email address, and password',
            'Profile information: title, company, bio, LinkedIn, GitHub, website, and photo',
            'Resume files (PDF, up to 5 MB — stored privately in Supabase storage)',
            'Session booking messages and session notes',
            'Community posts, comments, and reviews',
            'Voice audio during the Mentor application interview (transcribed in real-time; audio not retained by Bridge — see §4 for OpenAI-side handling)',
            'Support, feedback, and safety report submissions',
            'Emails you send to mentors.bridge@gmail.com (retained in our support inbox for as long as needed to resolve the matter and meet record-keeping obligations)',
          ]
        },
        {
          label: 'Generated through platform use',
          items: [
            'Session history, booking status, and scheduling data',
            'Saved (favorited) mentor records',
            'AI feature usage counts and token metadata (for rate limiting)',
            'Mentor onboarding wizard progress and step completion',
            'Subscription status, plan type, billing identifiers, and trial dates from Stripe',
            'Stripe checkout metadata: session type, price, user ID, mentor ID, mentor name',
            'Calendly scheduling data: event URI, invitee URI, join URL, cancel/reschedule URLs',
            'In-app messages between Mentors and Mentees (stored in our database)',
          ]
        },
        {
          label: 'Inferred data',
          items: [
            'Experience level and seniority signals inferred from your resume content during AI resume review',
            'Suggested target industries and roles derived from your stated goals during AI mentor matching',
            'Expertise pillar tags applied to Mentor profiles by our category-tagging AI based on your stated mentorship description',
          ]
        },
        {
          label: 'Mentor verification data',
          items: [
            'Identity verification run results and component scores (identity, government ID, professional email, LinkedIn, resume AI, expertise interview, reference, track record)',
            'Background check results provided by Checkr (where applicable)',
            'Professional reference submissions from named third parties, including AI-generated authenticity scores',
            'Voice interview transcripts and AI evaluation outputs stored in your mentor profile record',
          ]
        },
        {
          label: 'Cookies and local storage',
          items: [
            'Supabase authentication cookies that maintain your login session',
            'Browser localStorage entries for theme, onboarding state, cookie-consent state, and recently viewed mentors (see §8 and our Cookie Policy for the full inventory)',
          ]
        },
        {
          label: 'Technical and device data',
          items: [
            'IP address (logged by Vercel infrastructure and our server)',
            'Browser type and approximate location (inferred from IP at the network level)',
            'API request timestamps and error logs',
            'Record-level timestamps on all database rows',
          ]
        },
      ]
    }
  },
  {
    id: 'usage',
    title: '2. How We Use Your Information',
    content: {
      type: 'mixed',
      body: 'We use your information to: operate the platform and match you with Mentors; process payments and manage subscriptions; enable scheduling, video calls, and in-app messaging; personalize your experience; enforce our Terms and detect fraud; respond to support requests; improve platform performance and safety; and comply with legal obligations. We analyze anonymized, aggregated usage patterns to improve our product.',
      callout: 'We do not sell your personal data. We do not run advertising. We do not use your data for any purpose unrelated to operating and improving Bridge.'
    }
  },
  {
    id: 'legal-basis',
    title: '3. Legal Basis for Processing (GDPR)',
    content: {
      type: 'groups',
      groups: [
        {
          label: 'Contract performance',
          items: [
            'Account creation, authentication, and profile management',
            'Booking, scheduling, and running Sessions',
            'Payment processing and subscription management',
            'In-app messaging between Mentors and Mentees',
          ]
        },
        {
          label: 'Legitimate interest',
          items: [
            'Fraud detection, abuse prevention, and platform safety',
            'Mentor verification scoring and reference authenticity checks',
            'Aggregate product analytics and performance monitoring',
            'Security logging (IP, request metadata, error traces)',
          ]
        },
        {
          label: 'Consent',
          items: [
            'Use of optional AI features (resume review, mentor matching, voice application)',
            'Optional marketing or product-update communications, where offered',
            'Non-essential cookies, where a consent banner is presented',
          ]
        },
        {
          label: 'Legal obligation',
          items: [
            'Retaining financial and tax records (IRS, applicable tax authorities)',
            'Responding to lawful subpoenas, court orders, and law-enforcement requests',
            'Honoring data-subject rights requests within statutory deadlines',
          ]
        },
      ]
    }
  },
  {
    id: 'transfers',
    title: '4. International Data Transfers',
    content: {
      type: 'text',
      paragraphs: [
        'Bridge runs on US-hosted infrastructure. Your data is stored and processed in the United States, including by Supabase (AWS US-East), Vercel, Stripe (US), OpenAI (US), and Anthropic (US).',
        'If you access Bridge from the European Union, United Kingdom, Switzerland, or another jurisdiction with cross-border transfer rules, your personal data is transferred to the United States. We rely on Standard Contractual Clauses (SCCs) or equivalent transfer mechanisms with our subprocessors where required.',
        'By creating an account and using Bridge from outside the United States, you acknowledge and accept this international transfer. If you do not consent to this transfer, do not use the service.',
      ]
    }
  },
  {
    id: 'third-parties',
    title: '5. Third-Party Services',
    content: {
      type: 'groups',
      groups: [
        {
          label: 'Infrastructure',
          items: [
            'Supabase (Supabase Inc.): PostgreSQL database, authentication, real-time signaling, and file storage. Hosted on AWS in the US-East region.',
            'Vercel: serverless function hosting and static asset delivery. Vercel logs IP addresses and request metadata per their privacy policy.',
          ]
        },
        {
          label: 'Payments',
          items: [
            'Stripe: all payment processing. Your card number is never sent to or stored by Bridge. Stripe is a Level 1 PCI DSS service provider — the highest tier of payment-card security certification. Stripe receives: your email, checkout metadata (session type, price, user ID, mentor ID), and subscription details.',
            'Stripe sets its own first- and third-party cookies during checkout to enable fraud detection and session continuity. See our Cookie Policy for details and Stripe\'s privacy policy for their independent processing.',
          ]
        },
        {
          label: 'Scheduling',
          items: [
            'Calendly: session scheduling via embedded widget. When you book, your name and email are sent to Calendly. Bridge receives booking details (event time, join URL, cancellation and reschedule links) via a signature-verified webhook. Calendly\'s privacy policy governs their independent processing.',
          ]
        },
        {
          label: 'AI providers',
          items: [
            'OpenAI: mentor matching (mentee profile + resume text), voice application transcription, reference authenticity scoring, and resume content extraction.',
            'Anthropic (Claude API): resume review analysis, mentor bio refinement, and expertise category tagging.',
            'We rely on the OpenAI API Data Usage Policy and the Anthropic Commercial Terms of Service as of June 2026, under which API submissions are not used to train provider models. We re-verify this status at each material policy revision and will notify users by email at least 30 days before any change that would broaden how your data is used.',
          ]
        },
        {
          label: 'Email and support',
          items: [
            'Web3Forms: support, feedback, and safety report submissions are relayed to mentors.bridge@gmail.com via the Web3Forms API. Your message and any contact information you provide are included in the relay. Web3Forms processes form submissions on its own infrastructure — see their privacy policy for residency, retention, and security details.',
          ]
        },
        {
          label: 'Background checks',
          items: [
            'Checkr (Consumer Reporting Agency): Where applicable, Mentor applicants may be subject to background reports via Checkr\'s FCRA-compliant process. Checkr\'s own privacy policy and user rights disclosures apply.',
          ]
        },
        {
          label: 'CDN',
          items: [
            'Google Fonts CDN: font files are loaded from Google\'s servers. Standard HTTP request metadata (IP address, browser user-agent) is sent to Google per their privacy policy.',
          ]
        },
      ]
    }
  },
  {
    id: 'ai-processing',
    title: '6. AI Features & External Data Processing',
    content: {
      type: 'text',
      paragraphs: [
        'Several Bridge features transmit your data to external AI providers. By using these features, you accept that your information leaves Bridge\'s infrastructure and is processed under those providers\' data policies.',
        'Resume review: your full resume PDF (up to 5 MB) is sent to Anthropic\'s Claude API. We receive a structured analysis (score, grade, section feedback) and display it to you. Usage limit: 1 per account lifetime.',
        'Mentor matching: your mentee profile (current role, target role, goals, years of experience) and, optionally, extracted resume text are sent to OpenAI to rank mentor recommendations. Usage limit: 3 per account.',
        'Voice mentor application: during the Mentor application, your audio is streamed in real-time to OpenAI\'s Realtime API for transcription. The resulting transcript and AI evaluation are stored in our database as part of your application record. Bridge does not retain the audio after the call ends. OpenAI may retain Realtime API audio on their side for up to 30 days for abuse-monitoring purposes per their default retention policy at the time of writing; see OpenAI\'s API data usage and retention documentation for the current terms.',
        'Reference authenticity scoring: text submitted by your professional references undergoes AI-based authenticity scoring via OpenAI\'s API. Reference text is processed as part of the Mentor verification pipeline.',
        'All AI feature calls are logged by user ID, feature name, and token counts for rate limiting purposes. These logs are retained for up to 12 months.',
      ]
    }
  },
  {
    id: 'video-comms',
    title: '7. Video Sessions & Communications',
    content: {
      type: 'text',
      paragraphs: [
        'Video sessions use a direct peer-to-peer WebRTC connection. Video and audio streams are transmitted directly between participants\' devices and never pass through or are stored on Bridge\'s servers.',
        'Bridge does not record, store, or have access to video or audio from sessions. Connection setup (signaling) uses Supabase Realtime channels that carry only connection metadata — SDP offers and ICE candidates — not media content.',
        'In-app messaging between Mentors and Mentees is stored in our database. Messages are accessible to both participants and are subject to our data retention policy.',
        'Community posts, comments, and upvotes are stored in our database and visible to all authenticated users on the platform.',
      ]
    }
  },
  {
    id: 'rights',
    title: '8. Your Rights & Controls',
    content: {
      type: 'rights',
      intro: 'You can exercise any of these rights at any time through your account settings or by emailing mentors.bridge@gmail.com. We respond to all requests within 30 days.',
      rights: [
        { icon: Eye, label: 'Access', desc: 'Request a copy of all personal data we hold about you' },
        { icon: FileCheck, label: 'Correct', desc: 'Update inaccurate or incomplete information in your profile' },
        { icon: Database, label: 'Export', desc: 'Download your data in a portable, machine-readable format (GDPR portability)' },
        { icon: Trash2, label: 'Delete', desc: 'Delete your account and have your personal data removed within 30 days' },
        { icon: UserCheck, label: 'Object', desc: 'Opt out of specific processing, including AI features and non-essential use' },
        { icon: Lock, label: 'Restrict', desc: 'Restrict processing while a dispute or correction request is open (GDPR Art. 18)' },
        { icon: Shield, label: 'No automated decisions', desc: 'Request human review of any decision made solely by automated means (see §10)' },
        { icon: Slash, label: 'No sale or sharing', desc: 'Opt out of "sale" or "sharing" of personal information under CCPA — Bridge does not engage in either by default' },
        { icon: Scale, label: 'Lodge a complaint', desc: 'EU / UK / Swiss users may complain to their local data-protection supervisory authority' },
      ],
      footnote: 'EU, UK, Swiss, and California residents have additional statutory rights described above and in §12. We honor all requests regardless of your country of residence.'
    }
  },
  {
    id: 'security',
    title: '9. Security Measures',
    content: {
      type: 'security',
      body: 'We apply security controls at every layer of the stack. No system is 100% secure, but we follow best practices and limit access to your data on a need-to-know basis. If we discover a personal data breach that is likely to affect you, we will notify you and the relevant supervisory authority within 72 hours of becoming aware of it, in line with the GDPR standard.',
      badges: [
        { label: 'TLS in transit', note: 'All traffic encrypted end-to-end' },
        { label: 'bcrypt passwords', note: 'Hashed with cost factor 10; never stored in plain text' },
        { label: 'Row-Level Security', note: 'Postgres RLS enforced on every table; users can only access their own data' },
        { label: 'JWT authentication', note: 'Tokens signed server-side; service credentials never sent to the browser' },
        { label: 'Private storage', note: 'Resume files in a private Supabase bucket; access via short-lived signed URLs only' },
        { label: '72-hour breach notice', note: 'GDPR-standard incident notification commitment' },
      ]
    }
  },
  {
    id: 'automated-decisions',
    title: '10. Automated Decision-Making',
    content: {
      type: 'text',
      paragraphs: [
        'Mentor verification is the only area of Bridge where automated scoring contributes to a decision that affects you. The verification run combines weighted scores across eight components: identity, government ID, professional email, LinkedIn, resume AI, expertise interview, reference authenticity, and track record.',
        'Clear approvals and clear rejections may be applied automatically based on the component scores. Borderline cases, disputes, and any decision a founder considers material are reviewed by a human reviewer before being finalized.',
        'AI mentor matching and AI resume review produce recommendations and feedback only. They never gate access to the platform or make decisions about your account.',
        'You have the right to request human review of any decision made about you that you believe was made solely on the basis of automated processing. Email mentors.bridge@gmail.com with the subject line "Automated decision review" and we will respond within 30 days.',
      ]
    }
  },
  {
    id: 'cookies-storage',
    title: '11. Cookies & Local Storage',
    content: {
      type: 'text',
      paragraphs: [
        'Bridge sets Supabase authentication cookies (HttpOnly, SameSite=Lax, Secure in production) to maintain your login session. These are essential and cannot be disabled.',
        'Stripe.js and the Calendly scheduling widget may set their own first-party or third-party cookies when loaded on payment or scheduling pages. These are governed by Stripe\'s and Calendly\'s privacy policies respectively.',
        'We use browser localStorage to store client-side preferences that are never transmitted to our servers: your theme preference (bridge-appearance), onboarding modal dismissal (bridge_onboarded), cookie consent state (bridge_cookie_consent), notification read state (bridge_notif_read), and a recently viewed mentors list (bridge_recently_viewed_mentors). Your cookie-consent choice is recorded in localStorage; you can withdraw consent at any time by clearing your browser storage for this site.',
        'Bridge does not use analytics cookies, advertising tracking pixels, heatmap scripts, session replay tools, or any third-party marketing technology. See our Cookie Policy for the full inventory.',
      ]
    }
  },
  {
    id: 'retention',
    title: '12. Data Retention',
    content: {
      type: 'text',
      paragraphs: [
        'We retain your personal data while your account is active and for a reasonable period afterward to handle disputes, enforce our Terms, and comply with legal obligations.',
        'Account deletion: when you delete your account, personal data is removed within 30 days. Financial transaction records (required for tax compliance) are retained for 7 years per IRS requirements. Verification data may be retained where legally required.',
        'Session and review data: after account deletion we retain pseudonymized session metadata — booking timestamps, session type, duration, completion status, and rating values with the originating user_id stripped — for platform safety and product analytics. This data is pseudonymized rather than fully anonymized: re-identification by combining fields is theoretically possible, so we treat it as personal data subject to this policy.',
        'Mentor reference submissions: the contact details and submitted reference text provided by your named references are retained for the lifetime of your Mentor account plus 12 months, then deleted. References may also request deletion of their submission at any time by emailing mentors.bridge@gmail.com.',
        'Voice interview transcripts: transcripts stored in your Mentor profile record are deleted within 30 days of account deletion.',
        'AI usage logs: token counts and feature usage metadata are retained for up to 12 months for billing audit and rate-limiting purposes.',
        'Resume files: stored in a private Supabase bucket and deleted immediately upon account deletion or when you remove them manually from settings.',
      ]
    }
  },
  {
    id: 'children',
    title: '13. Children\'s Privacy',
    content: {
      type: 'text',
      paragraphs: [
        'Bridge is not directed at users under 18 years of age. We do not knowingly collect personal information from minors.',
        'For US users specifically: in compliance with the Children\'s Online Privacy Protection Act (COPPA), we do not knowingly collect, use, or disclose personal information from children under 13. If we learn that we have collected information from a child under 13 without verifiable parental consent, we will delete that information promptly. Parents or guardians who believe their child under 13 has provided us with personal information may contact mentors.bridge@gmail.com to request deletion.',
        'If you believe any minor has created an account on Bridge, email mentors.bridge@gmail.com immediately. We will investigate and remove the account and all associated data promptly.',
      ]
    }
  },
  {
    id: 'ccpa',
    title: '14. California Residents (CCPA/CPRA)',
    content: {
      type: 'text',
      paragraphs: [
        'If you are a California resident, the California Consumer Privacy Act, as amended by the CPRA, gives you specific rights regarding your personal information. This section describes those rights and how Bridge handles your data.',
        'Categories of personal information collected: identifiers (name, email, account ID, IP address); commercial information (subscription and billing records); internet activity (request logs, error traces); professional or employment-related information (resume content, work history); inferences drawn from the above (experience level, target roles, expertise tags); and audio data limited to the Mentor voice-application interview.',
        'Sources: directly from you when you create an account or use the platform; automatically generated when you interact with Bridge; from Mentor reference contacts you nominate; and from third-party verification services (e.g., Checkr) you authorize.',
        'Business purposes: operating and securing the platform; matching Mentees with Mentors; processing payments; verifying Mentor applicants; responding to support requests; preventing fraud and abuse; meeting legal obligations.',
        'Third parties we share with: Supabase, Vercel, Stripe, Calendly, OpenAI, Anthropic, Web3Forms, Checkr, and Google Fonts CDN as described in §5. Each is bound by their own privacy policy and, where applicable, by data-processing terms with Bridge.',
        'Retention: as described in §12.',
        'Sale and sharing: Bridge does not sell personal information and does not share personal information for cross-context behavioral advertising. There is therefore no "Do Not Sell or Share My Personal Information" toggle to present; the answer is "we don\'t" by default.',
        'To exercise your CCPA rights (know, delete, correct, opt-out, limit use of sensitive PI, non-discrimination), email mentors.bridge@gmail.com. You may designate an authorized agent in writing to make requests on your behalf.',
      ]
    }
  },
  {
    id: 'changes',
    title: '15. Changes to This Policy',
    content: {
      type: 'text',
      paragraphs: [
        'We may update this policy as Bridge evolves. Material changes — those that affect how your data is used or shared — will be communicated by email at least 30 days before they take effect. The "last updated" date at the top of this page always reflects the currently effective version.',
      ]
    }
  },
  {
    id: 'contact',
    title: '16. Contact & Privacy Requests',
    content: {
      type: 'contact',
      email: EMAIL,
      note: 'Bridge is a small team. We do not currently maintain a separate Data Protection Officer role — the founders directly handle all privacy requests at the email above. For EU/UK users requiring a designated representative under GDPR Art. 27, contact us at the same address and we will route your request appropriately.',
    }
  },
];

export const TLDR = [
  {
    icon: Database,
    heading: 'What we collect',
    items: [
      'Name, email, and profile information',
      'Session history and booking data',
      'Resume files (private, encrypted at rest)',
      'Voice interview transcript (Mentors only)',
      'Payment metadata via Stripe (not your card)',
    ]
  },
  {
    icon: Shield,
    heading: 'What we never do',
    items: [
      'Sell or share your personal data',
      'Record or store video/audio sessions',
      'Share data without consent or legal compulsion',
      'Use your data for advertising or model training',
    ]
  },
  {
    icon: UserCheck,
    heading: 'You can always',
    items: [
      'Access and export all your data',
      'Correct inaccurate information',
      'Delete your account and data fully',
      'Opt out of AI features at any time',
      'Request human review of automated decisions',
    ]
  },
];

export const CHIPS = [
  { icon: Lock, label: 'TLS + bcrypt' },
  { icon: FileCheck, label: 'Row-Level Security' },
  { icon: Eye, label: 'Zero data sales' },
  { icon: Globe2, label: 'GDPR & CCPA ready' },
];
