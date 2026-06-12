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
            'Resume files (PDF, up to 5 MB)',
            'Session booking messages and session notes',
            'Community posts, comments, and reviews',
            'Voice audio captured during the Mentor application interview, used to produce a transcript stored on your application record',
            'Support, feedback, and safety report submissions',
            'Email correspondence you send to our support address',
          ]
        },
        {
          label: 'Generated through platform use',
          items: [
            'Session history, booking status, and scheduling data',
            'Saved (favorited) mentor records',
            'AI feature usage records used for rate limiting and abuse prevention',
            'Mentor onboarding progress',
            'Subscription status, plan type, and billing identifiers received from our payment processor',
            'In-app messages between Mentors and Mentees',
          ]
        },
        {
          label: 'Inferred data',
          items: [
            'Experience level signals inferred from your resume during AI resume review',
            'Suggested target industries and roles derived from goals you provide during AI mentor matching',
            'Expertise tags applied to Mentor profiles based on the description you submit',
          ]
        },
        {
          label: 'Mentor verification data',
          items: [
            'Verification results and component scores across identity, credentials, references, and track record',
            'Background check results provided by Checkr (where applicable)',
            'Professional reference submissions from third parties you nominate',
            'Voice interview transcripts and reviewer notes attached to your application',
          ]
        },
        {
          label: 'Cookies and local storage',
          items: [
            'A first-party authentication cookie that keeps you signed in',
            'Local browser storage for preferences such as theme, dismissed prompts, and recently viewed mentors (see §11 and our Cookie Policy)',
          ]
        },
        {
          label: 'Technical and device data',
          items: [
            'IP address logged by our hosting infrastructure',
            'Browser type and approximate location inferred from IP at the network level',
            'Request timestamps and error logs used for diagnostics and security',
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
      body: 'We use your information to operate the platform and match you with Mentors, process payments and manage subscriptions, enable scheduling, video sessions, and in-app messaging, personalize your experience, respond to support requests, enforce our Terms, detect fraud, improve platform safety and performance, and comply with our legal obligations. Where we analyze usage to improve the product, we do so on aggregated data.',
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
            'Mentor verification and reference authenticity checks',
            'Aggregate product analytics and performance monitoring',
            'Security logging and incident response',
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
            'Retaining financial and tax records as required by law',
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
        'Bridge operates on infrastructure located in the United States. Your data is stored and processed in the US, including by the third-party providers listed in §5.',
        'If you access Bridge from the European Union, United Kingdom, Switzerland, or another jurisdiction with cross-border transfer rules, your personal data is transferred to the United States. Where required, we rely on Standard Contractual Clauses or an equivalent transfer mechanism with our subprocessors.',
        'By creating an account and using Bridge from outside the United States, you acknowledge and accept this international transfer. If you do not consent to it, please do not use the service.',
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
            'Supabase: database, authentication, and file storage.',
            'Vercel: application hosting and content delivery.',
          ]
        },
        {
          label: 'Payments',
          items: [
            'Stripe: processes all payments. Your card number is never sent to or stored by Bridge. Stripe receives the information necessary to complete the transaction and may set its own cookies during checkout, governed by Stripe\'s privacy policy.',
          ]
        },
        {
          label: 'Scheduling',
          items: [
            'Calendly: powers session scheduling. When you book, your name and email are shared with Calendly so it can confirm the booking. Bridge receives the resulting booking details. Calendly\'s privacy policy governs its independent processing.',
          ]
        },
        {
          label: 'AI providers',
          items: [
            'OpenAI: powers mentor matching, voice application transcription, reference authenticity scoring, and resume text extraction.',
            'Anthropic: powers resume review analysis, mentor bio refinement, and expertise tagging.',
            'Under both providers\' commercial API terms in effect as of the date above, content sent via the API is not used to train their models. We monitor these terms and will notify users by email at least 30 days before any change that would materially broaden how your data may be used.',
          ]
        },
        {
          label: 'Email and support',
          items: [
            'A form-relay service is used to deliver support, feedback, and safety report submissions to our support inbox.',
          ]
        },
        {
          label: 'Background checks',
          items: [
            'Checkr: where applicable, Mentor applicants may be subject to background reports via Checkr\'s FCRA-compliant process. Checkr\'s privacy policy and applicable consumer disclosures apply.',
          ]
        },
        {
          label: 'Fonts',
          items: [
            'Google Fonts: web fonts are served from Google. Standard request metadata such as IP address and user agent is shared with Google per its privacy policy.',
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
        'Several Bridge features transmit your data to external AI providers. By using these features you accept that the information you submit leaves Bridge\'s infrastructure and is processed under those providers\' data policies.',
        'Resume review: your resume PDF is sent to Anthropic to produce a structured analysis that is returned to you and saved on your account.',
        'Mentor matching: your stated goals, current and target roles, years of experience, and (if you opt in) extracted resume text are sent to OpenAI to rank mentor recommendations.',
        'Voice mentor application: during the Mentor application, your audio is streamed to OpenAI\'s realtime API for transcription. The resulting transcript and the reviewer-facing evaluation are saved on your application record. Bridge does not retain the audio after the call ends. OpenAI may temporarily retain audio on its side for abuse monitoring under its own data-retention policy.',
        'Reference authenticity scoring: text submitted by professional references is processed by OpenAI as part of Mentor verification.',
        'AI feature calls are logged by account, feature name, and request size for rate limiting and abuse prevention. These logs are retained for up to 12 months.',
      ]
    }
  },
  {
    id: 'video-comms',
    title: '7. Video Sessions & Communications',
    content: {
      type: 'text',
      paragraphs: [
        'Video sessions use a direct peer-to-peer connection between participants\' devices. Video and audio streams are not routed through or stored on Bridge\'s servers.',
        'Bridge does not record, store, or have access to the video or audio of a session. The connection-setup signals exchanged to establish a session contain technical connection metadata only, not media.',
        'In-app messages between Mentors and Mentees are stored in our database and remain accessible to both participants, subject to our retention policy.',
        'Community posts, comments, and upvotes are stored in our database and visible to authenticated users on the platform.',
      ]
    }
  },
  {
    id: 'rights',
    title: '8. Your Rights & Controls',
    content: {
      type: 'rights',
      intro: 'You can exercise any of these rights through your account settings or by writing to us at the address in §16. We respond to verified requests within 30 days.',
      rights: [
        { icon: Eye, label: 'Access', desc: 'Request a copy of the personal data we hold about you' },
        { icon: FileCheck, label: 'Correct', desc: 'Update inaccurate or incomplete information' },
        { icon: Database, label: 'Export', desc: 'Receive your data in a portable, machine-readable format' },
        { icon: Trash2, label: 'Delete', desc: 'Delete your account and have your personal data removed within 30 days' },
        { icon: UserCheck, label: 'Object', desc: 'Opt out of specific processing, including optional AI features' },
        { icon: Lock, label: 'Restrict', desc: 'Restrict processing while a dispute or correction is open (GDPR Art. 18)' },
        { icon: Shield, label: 'Human review', desc: 'Request human review of any decision made solely by automated means (see §10)' },
        { icon: Slash, label: 'No sale or sharing', desc: 'Opt out of the "sale" or "sharing" of personal information; we do not engage in either by default' },
        { icon: Scale, label: 'Lodge a complaint', desc: 'EU, UK, and Swiss users may complain to their local data-protection authority' },
      ],
      footnote: 'EU, UK, Swiss, and California residents have additional statutory rights described above and in §14. We honor all requests regardless of where you live.'
    }
  },
  {
    id: 'security',
    title: '9. Security Measures',
    content: {
      type: 'security',
      body: 'We apply security controls across the stack and limit access to your data on a need-to-know basis. No system is fully secure, but if we discover a personal data breach that is likely to affect you, we will notify you and the relevant supervisory authority within 72 hours of becoming aware of it, in line with the GDPR standard.',
      badges: [
        { label: 'Encrypted in transit', note: 'TLS on every connection' },
        { label: 'Hashed passwords', note: 'Salted and hashed; never stored in plain text' },
        { label: 'Database access controls', note: 'Authorization rules enforce per-user data isolation' },
        { label: 'Token-based auth', note: 'Server-issued session tokens; service credentials kept off the client' },
        { label: 'Private file storage', note: 'Resume files served via short-lived signed URLs only' },
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
        'Mentor verification is the only area of Bridge where automated scoring contributes to a decision that meaningfully affects you. The verification process combines weighted scores across several components, including identity, credentials, references, and track record.',
        'Clear approvals and clear rejections may be applied automatically based on those scores. Borderline cases, disputes, and any decision a reviewer considers material are reviewed by a person before they are finalized.',
        'AI mentor matching and AI resume review produce recommendations and feedback only. They do not gate access to the platform or make decisions about your account.',
        'You have the right to request human review of any decision about you that you believe was made solely on the basis of automated processing. Write to us at the address in §16 with the subject line "Automated decision review" and we will respond within 30 days.',
      ]
    }
  },
  {
    id: 'cookies-storage',
    title: '11. Cookies & Local Storage',
    content: {
      type: 'text',
      paragraphs: [
        'Bridge sets an authentication cookie to keep you signed in. This cookie is essential to the service and cannot be disabled while you are logged in.',
        'Stripe and Calendly may set their own cookies when their payment or scheduling components load on the relevant pages. These are governed by Stripe\'s and Calendly\'s privacy policies.',
        'We use your browser\'s local storage to remember client-side preferences that are not transmitted to our servers, such as your theme choice, dismissed prompts, cookie-consent state, and a short list of mentors you recently viewed. You can clear this at any time by clearing site data in your browser.',
        'Bridge does not use analytics cookies, advertising pixels, heatmaps, session replay, or third-party marketing trackers. See our Cookie Policy for the full list.',
      ]
    }
  },
  {
    id: 'retention',
    title: '12. Data Retention',
    content: {
      type: 'text',
      paragraphs: [
        'We retain your personal data while your account is active and for a reasonable period afterward to handle disputes, enforce our Terms, and comply with our legal obligations.',
        'Account deletion: when you delete your account, personal data is removed within 30 days. Financial transaction records are retained for as long as tax and accounting law requires, typically up to seven years. Verification records may be retained where the law requires.',
        'Session and review data: after account deletion we keep session metadata such as booking time, session type, duration, completion status, and rating values, with personally identifying fields stripped. This data is pseudonymized rather than fully anonymized, so we continue to treat it as personal data covered by this policy.',
        'Mentor reference submissions: the contact details and submitted reference text provided by your nominated references are retained for the lifetime of your Mentor account plus 12 months, then deleted. References may request deletion of their submission at any time.',
        'Voice interview transcripts stored on your Mentor application are deleted within 30 days of account deletion.',
        'AI usage logs are retained for up to 12 months for rate limiting and audit purposes.',
        'Resume files are deleted immediately when you remove them from settings or when your account is deleted.',
      ]
    }
  },
  {
    id: 'children',
    title: '13. Children\'s Privacy',
    content: {
      type: 'text',
      paragraphs: [
        'Bridge is not directed at users under 18 years of age, and we do not knowingly collect personal information from minors.',
        'For US users, in compliance with the Children\'s Online Privacy Protection Act (COPPA), we do not knowingly collect, use, or disclose personal information from children under 13. If we learn that we have collected information from a child under 13 without verifiable parental consent, we will delete that information promptly. A parent or guardian who believes their child under 13 has provided us with information may contact us to request deletion.',
        'If you believe a minor has created an account on Bridge, please contact us. We will investigate and remove the account and associated data.',
      ]
    }
  },
  {
    id: 'ccpa',
    title: '14. California Residents (CCPA / CPRA)',
    content: {
      type: 'text',
      paragraphs: [
        'If you are a California resident, the California Consumer Privacy Act, as amended by the CPRA, gives you specific rights regarding your personal information. This section summarizes those rights and how Bridge handles your data.',
        'Categories of personal information we collect: identifiers such as name, email, account ID, and IP address; commercial information such as subscription and billing records; internet activity such as request logs and error traces; professional information such as resume content and work history; inferences drawn from the above; and audio data limited to the Mentor voice-application interview.',
        'Sources: directly from you, automatically generated through your use of Bridge, from references you nominate, and from third-party verification services you authorize.',
        'Business purposes: operating and securing the platform, matching Mentees with Mentors, processing payments, verifying Mentor applicants, responding to support requests, preventing fraud and abuse, and meeting legal obligations.',
        'Third parties we share with: the providers listed in §5. Each is bound by its own privacy policy and, where applicable, by data-processing terms with Bridge.',
        'Retention: as described in §12.',
        'Sale and sharing: Bridge does not sell personal information and does not share personal information for cross-context behavioral advertising.',
        'To exercise your CCPA rights (to know, delete, correct, opt out, limit use of sensitive personal information, and not be retaliated against for exercising your rights), write to us at the address in §16. You may designate an authorized agent in writing to make requests on your behalf.',
      ]
    }
  },
  {
    id: 'changes',
    title: '15. Changes to This Policy',
    content: {
      type: 'text',
      paragraphs: [
        'We may update this policy as Bridge evolves. Material changes, meaning changes that affect how your data is used or shared, will be communicated by email at least 30 days before they take effect. The date at the top of this page always reflects the version currently in force.',
      ]
    }
  },
  {
    id: 'contact',
    title: '16. Contact & Privacy Requests',
    content: {
      type: 'contact',
      email: EMAIL,
      note: 'For privacy questions or to exercise any of the rights described above, please write to us at the address above. For EU and UK users requiring a designated representative under GDPR Art. 27, contact us at the same address and we will route your request.',
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
      'Resume files (private storage)',
      'Voice interview transcript (Mentors only)',
      'Payment metadata from our processor (never your card number)',
    ]
  },
  {
    icon: Shield,
    heading: 'What we never do',
    items: [
      'Sell or share your personal data',
      'Record or store video or audio of your sessions',
      'Disclose your data without consent or legal compulsion',
      'Use your data for advertising or AI model training',
    ]
  },
  {
    icon: UserCheck,
    heading: 'You can always',
    items: [
      'Access and export your data',
      'Correct inaccurate information',
      'Delete your account and data',
      'Opt out of AI features',
      'Request human review of automated decisions',
    ]
  },
];

export const CHIPS = [
  { icon: Lock, label: 'Encrypted in transit' },
  { icon: FileCheck, label: 'Access controls' },
  { icon: Eye, label: 'No data sales' },
  { icon: Globe2, label: 'GDPR & CCPA ready' },
];
