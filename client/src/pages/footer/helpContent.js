import { UserCheck, Users, Video, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import { COMPANY_EMAIL } from '../../config/contact';

export const ARTICLES = {

  // ── For Mentees ──────────────────────────────────────────────────────────────

  'creating-account': {
    categoryId: 'mentees',
    category: 'For Mentees',
    title: 'Creating an account',
    body: `Click Sign up in the top-right corner, enter your email and a password, and confirm your email when the verification message arrives.\n\nYou can browse all mentor profiles without an account. You only need to sign in when you want to book a session, so we can send your meeting link and reminders.\n\nIf the confirmation email does not arrive within five minutes, check your spam folder. Still nothing? Email ${COMPANY_EMAIL} and we'll sort it manually.`,
  },

  'finding-mentor': {
    categoryId: 'mentees',
    category: 'For Mentees',
    title: 'Finding the right mentor',
    body: `Open Mentors from the navigation bar. Filter by industry, role, or expertise, or use AI Matching from your dashboard if you've completed the goal-setting wizard.\n\nRead the full bio and mentorship description — not just the job title. Check reviews if the mentor has completed sessions, and look at their availability before getting attached to a specific profile.\n\nThe AI match results are ranked using your mentee profile (current role, target role, goals). The more complete your profile, the better the ranking. See [AI mentor matching](article:ai-matching) for details.`,
  },

  'first-session': {
    categoryId: 'mentees',
    category: 'For Mentees',
    title: 'Booking your first session',
    body: `On a mentor's profile, choose a session type — Career Advice, Interview Prep, Resume Review, or Networking. Then pick an open slot from their calendar, add a short note about what you want to cover, and complete checkout.\n\nAfter checkout you're directed to Calendly to confirm the time. The session appears as "pending" in your dashboard until the mentor accepts. Once accepted, the Join Call button appears.\n\nIf you're not yet subscribed, booking may start a 7-day free trial. You won't be charged until day 8. See [Subscription & free trial](article:subscription) for details.`,
  },

  'preparing-session': {
    categoryId: 'mentees',
    category: 'For Mentees',
    title: 'Preparing for a session',
    body: `Pick one concrete outcome you want by the end of the call — not five. Put it in your booking note when you schedule, so the mentor can prepare.\n\nIf you want feedback on a resume, deck, or specific work sample, upload it to your profile at least a day before. The mentor can access your uploaded resume during the call through the file-sharing feature.\n\nTest your camera and microphone about ten minutes before. See [Pre-call checklist](article:pre-call-checklist) for a full readiness walkthrough. Join from Chrome, Firefox, or Safari on desktop for screen sharing.`,
  },

  'ai-matching': {
    categoryId: 'mentees',
    category: 'For Mentees',
    title: 'How AI mentor matching works',
    body: `AI matching ranks the mentor directory based on your profile. Complete the goal-setting wizard in your dashboard (Dashboard → Recommendations) to enable it. The wizard asks for your current role, target role, target industry, years of experience, and top goals.\n\nWhen you run a match, your profile — and optionally the text extracted from your uploaded resume — is sent to OpenAI's API, which scores each mentor's profile against your goals and returns a ranked list of up to five recommendations.\n\nMatching is limited to 3 uses per account. Results are suggestions, not guarantees. Browse the full directory if the matches don't feel right. Your data is sent to OpenAI per their API data policy; see [our Privacy Policy](route:/privacy) for details.`,
  },

  'resume-review': {
    categoryId: 'mentees',
    category: 'For Mentees',
    title: 'Using AI resume review',
    body: `AI resume review sends your uploaded PDF resume (up to 5 MB) to Anthropic's Claude API and returns a numeric score, letter grade, and section-by-section analysis covering contact info, summary, experience, skills, education, and formatting.\n\nTo use it: upload your resume in Dashboard → Resume Review, select your experience level (entry/mid/senior), and click Analyze. Results typically appear within 30 seconds.\n\nThis feature is limited to 1 use per account lifetime. The analysis is a probabilistic AI output — not a certified professional review. Treat it as a useful second opinion, not a definitive score. Your resume PDF is transmitted to Anthropic; see [our Privacy Policy](route:/privacy) for how that data is handled.`,
  },

  // ── For Mentors ──────────────────────────────────────────────────────────────

  'become-mentor': {
    categoryId: 'mentors',
    category: 'For Mentors',
    title: 'How to apply as a mentor',
    body: `Go to Become a Mentor from the navigation (or /apply/mentor) and complete the application. The application uses a voice-based interview format — you answer questions about your background, why you want to mentor, and your area of expertise.\n\nYour audio is transcribed in real-time and an AI-generated evaluation is produced alongside the transcript. Both are stored in your application record and reviewed by a founder.\n\nApplications are reviewed manually. You'll receive an email about your application status typically within 3–5 business days. Approved applicants are taken through a separate onboarding flow before going live.`,
  },

  'mentor-onboarding': {
    categoryId: 'mentors',
    category: 'For Mentors',
    title: 'Completing your mentor profile',
    body: `After approval, your dashboard will show a profile completion banner. The onboarding wizard walks through five steps:\n1. Basic profile info\n2. Expertise tags\n3. Your mentorship description\n4. Scheduling setup\n5. Profile review\n\nYour mentorship description is the most important field — write 2–4 sentences about the kinds of problems you're best positioned to help with. The platform uses an AI model to automatically categorize your mentorship focus into pillars and subcategories based on this description.\n\nComplete all five steps before your profile goes live. Incomplete profiles are not shown to mentees.`,
  },

  'mentor-calendly': {
    categoryId: 'mentors',
    category: 'For Mentors',
    title: 'Connecting your Calendly calendar',
    body: `Go to Dashboard → Availability and click Connect Calendly. You'll be taken through Calendly's OAuth authorization flow. Grant the requested permissions, then return to Bridge — your event types will load automatically.\n\nChoose which event type mentees should use for booking. Bridge creates a Calendly webhook subscription that updates your session records whenever a booking is confirmed, cancelled, or rescheduled. Your Calendly access token is stored server-side only.\n\nIf you want to disconnect Calendly later, go to Dashboard → Availability → Disconnect. This removes stored tokens and disables booking until you reconnect.`,
  },

  'mentor-sessions': {
    categoryId: 'mentors',
    category: 'For Mentors',
    title: 'Managing incoming session requests',
    body: `When a mentee books and completes checkout, a session appears in your dashboard with status "pending." You'll see their name, session type, and the note they wrote. Accept or decline from Dashboard → Sessions.\n\nAccepting a session sets the video room URL and notifies the mentee. The Join Call button appears for both parties. Declining sends the mentee a notification and frees the slot.\n\nIf you need to cancel after accepting, do it through Calendly using the original event link, or contact us. Mentee-initiated cancellations are handled automatically.`,
  },

  'mentor-video-tips': {
    categoryId: 'mentors',
    category: 'For Mentors',
    title: 'Tips for running a great session',
    body: `Read the mentee's booking note before the call and have 1–2 questions ready. Most mentees arrive knowing what they want to talk about but don't know how to structure it — helping them prioritize in the first 3 minutes is the highest-leverage thing you can do.\n\nUse screen sharing (the monitor icon in the video toolbar) if you want to walk through the mentee's resume, LinkedIn, or code. The whiteboard tool (pencil icon) is useful for drawing frameworks or career path diagrams.\n\nThe call recording is off by default and there's no way to turn it on from Bridge — video is peer-to-peer and never touches our servers. If you want to share a reference doc after the call, message the mentee through the platform.`,
  },

  // ── Video & Audio ─────────────────────────────────────────────────────────

  'pre-call-checklist': {
    categoryId: 'video',
    category: 'Video & Audio',
    title: 'Pre-call checklist',
    body: `Before every session, go through this list:\n\n**Supported browsers**: Chrome 90+, Firefox 88+, Safari 15+. Edge works but is not recommended for screen sharing. Mobile browsers support basic video but not screen sharing.\n\n**Camera & microphone permissions**:\n- Chrome: click the camera icon in the address bar, or go to Settings → Privacy → Site Settings → Camera\n- Firefox: click the lock icon in the address bar → Permissions\n- Safari: Safari → Settings → Websites → Camera and Microphone\n- Make sure Bridge is set to "Allow," not "Block."\n\n**Internet speed**: Minimum 3 Mbps download / 1.5 Mbps upload for stable video. Test at fast.com before important calls. If possible, use a wired Ethernet connection.\n\n**Before joining**:\n1. Close bandwidth-heavy apps (streaming video, large downloads, cloud backups)\n2. Clear your browser cache if you've had issues before\n3. Test your camera and mic in your OS system preferences to confirm the right devices are selected\n4. Join 2–3 minutes early and confirm your video preview looks correct in the lobby\n\nIf something does go wrong mid-call, see [Troubleshooting technical issues](article:technical).`,
  },

  'join-call': {
    categoryId: 'video',
    category: 'Video & Audio',
    title: 'Joining your video session',
    body: `Once the mentor accepts your booking, Dashboard → Sessions shows a Join Call button for the session. Click it at the scheduled time. The session opens in your browser — no app download required.\n\nIf the Join Call button isn't visible yet, the session may still be pending mentor acceptance. Check that the mentor has accepted; if the session is accepted and the button is missing, refresh your dashboard.\n\nFor the best experience, join from a laptop or desktop on Chrome, Firefox, or Safari. The mentor role (who initiates the call connection) is assigned automatically — the mentor's browser sends the first connection offer.`,
  },

  'in-call-features': {
    categoryId: 'video',
    category: 'Video & Audio',
    title: 'In-call features',
    body: `Bridge's video call includes several tools in the bottom toolbar:\n- **Mic / Camera toggle**: mute or turn off video at any time\n- **Screen sharing**: share your entire screen or a specific window. Desktop only — not available on mobile browsers\n- **Whiteboard / Drawing**: annotate over the call with colored markers, useful for diagrams and frameworks\n- **In-call chat**: send text messages that both parties can see during the call\n- **Resume sharing**: the mentor can access your uploaded resume directly from the session — no need to send files by email\n- **Audio device selector**: switch microphone or speaker mid-call using the settings icon\n\nAll of these features are peer-to-peer. Nothing is recorded or stored by Bridge.`,
  },

  'technical': {
    categoryId: 'video',
    category: 'Video & Audio',
    title: 'Troubleshooting technical issues',
    body: `**During a call** — if video freezes or audio drops:\n1. Refresh the page and rejoin from Dashboard → Sessions → Join Call\n2. If the problem continues, try a different browser (Chrome is most reliable)\n3. Check your internet connection — switch from Wi-Fi to Ethernet if possible\n4. Close other tabs and apps to free up memory and bandwidth\n5. Open an incognito window to rule out browser extension interference\n\n**Audio echoes**: mute yourself when not speaking, or use headphones.\n\n**Screen sharing fails**: try a different browser; mobile browsers don't support it.\n\n**Waiting for the other person**: if you've been in the session room for 5+ minutes and they haven't joined, they may be experiencing a connection issue. Send an in-app message from your dashboard.\n\nFor a clean setup before the call, see [Pre-call checklist](article:pre-call-checklist).\n\nStill stuck? Email ${COMPANY_EMAIL} and include: which browser you're using, what you see on screen, and what you've already tried.`,
  },

  'no-show-policy': {
    categoryId: 'video',
    category: 'Video & Audio',
    title: 'No-show & late arrival policy',
    body: `**If you cannot attend**: Cancel at least 1 hour before the session using the cancel link in your confirmation email or Dashboard → Sessions → Cancel. This frees the mentor's slot.\n\n**Cancellation refunds**:\n- Cancelled more than 1 hour before: full refund\n- Cancelled within 1 hour of start: refund at mentor's discretion\n- No cancellation at all (no-show): no refund\n\n**Mentee no-show**: If you don't join within 15 minutes of the scheduled start without cancelling, the session is counted as a no-show. Three or more no-shows may temporarily restrict your ability to book.\n\n**Mentor no-show**: If your mentor doesn't join within 15 minutes, email ${COMPANY_EMAIL} with the session time and mentor name. You'll receive a full refund and priority rebooking. A confirmed no-show without prior communication is grounds for mentor removal from the platform.\n\n**Late arrival**: Sessions start on time. If you're more than 10 minutes late, the mentor may end the call. The remaining time is not added to a future session.`,
  },

  // ── Account & Community ──────────────────────────────────────────────────────

  'updating-profile': {
    categoryId: 'account',
    category: 'Account & Community',
    title: 'Updating your profile',
    body: `Go to Dashboard → Profile to change your name, photo, bio, headline, or links. Changes save in place.\n\nTo change your email or password, open Dashboard → Settings → Account. Email changes require confirmation from the new address. Password changes take effect immediately and sign out other devices.\n\nProfile photos are uploaded to a public bucket — anything you upload may be seen by anyone visiting your profile. Use a clear, professional image.`,
  },

  'notifications': {
    categoryId: 'account',
    category: 'Account & Community',
    title: 'Notifications',
    body: `Bridge sends two kinds of notifications:\n- **Email**: booking confirmations, mentor acceptance/decline, session reminders (24 h and 1 h before), trial reminders, billing receipts, and replies to your messages\n- **In-app**: a tray in the top bar surfaces new messages, session status changes, and review prompts\n\nTransactional emails (booking confirmations, billing) cannot be disabled — they're required for the service to function. Reminder cadence and marketing email preferences can be managed in Dashboard → Settings → Notifications.\n\nIf you're not receiving emails, check your spam folder and add ${COMPANY_EMAIL} to your contacts.`,
  },

  'reviews-ratings': {
    categoryId: 'account',
    category: 'Account & Community',
    title: 'Reviews and ratings',
    body: `**Leaving a review (mentees)**: After a session is marked completed, a review prompt appears in your dashboard. Rate the session 1–5 stars and add an optional comment. Reviews are public on the mentor's profile.\n\nYou can only review a session you booked, and only once per session. You can delete your own review at any time from Dashboard → Reviews.\n\n**How reviews appear (mentors)**: Your overall rating is the average of all your reviews and is recalculated automatically by the platform whenever a review is added, edited, or deleted. Individual reviews appear on your public profile with the reviewer's first name and date.\n\nIf a review violates our community guidelines (harassment, off-topic, personal information), report it via [Trust & Safety](route:/trust).`,
  },

  'messaging': {
    categoryId: 'account',
    category: 'Account & Community',
    title: 'Messaging another user',
    body: `In-app messaging is available between a mentee and a mentor once they have a booked session together. Open Dashboard → Messages, choose the thread, and send.\n\nMessages are stored on Bridge so both parties can see the history. They are not end-to-end encrypted — staff may review messages when investigating safety reports.\n\nKeep conversations on-platform. Moving paid work off Bridge violates the [Terms of Service](route:/terms) (12-month exclusivity) and may result in account suspension.`,
  },

  'reporting-user': {
    categoryId: 'account',
    category: 'Account & Community',
    title: 'Reporting another user',
    body: `Use the right channel:\n- **Trust & Safety**: harassment, harmful content, off-platform payment requests, or anything that makes you feel unsafe. Go to [Trust & Safety](route:/trust) for the report form\n- **Contact**: billing disputes, account access issues, refund requests, or anything else. Use [Contact](route:/contact)\n- **Help center**: how-to questions about using the platform (you're here)\n\nReports to Trust & Safety are reviewed by a founder, typically within 24 hours. We do not share the reporter's identity with the reported user.`,
  },

  // ── Billing & Account ────────────────────────────────────────────────────────

  'subscription': {
    categoryId: 'billing',
    category: 'Billing & Account',
    title: 'Subscription & free trial',
    body: `Mentor time is always free — mentors volunteer. The Bridge subscription unlocks platform features: full mentor directory access, AI matching, AI resume review (1 lifetime use), community access, in-app messaging, and all future features.\n\nNew subscribers start with a 7-day free trial. You won't be charged until day 8. A reminder is sent on day 5. Cancel anytime during the trial at no charge.\n\nMonthly and annual plans are available. Annual plans are billed upfront and work out cheaper per month. Students with a verified .edu email get a reduced rate applied automatically at checkout. See [Pricing](route:/pricing) for current amounts.`,
  },

  'session-cost': {
    categoryId: 'billing',
    category: 'Billing & Account',
    title: 'What does a session cost?',
    body: `The mentor portion of a session is free — mentors volunteer their time. What you pay for is access to the Bridge platform.\n\nMost mentees use Bridge through a monthly or annual subscription. A 7-day free trial is included on first signup, so your first session can be free if you cancel before day 8.\n\nFor current subscription prices, the student discount, and one-off session pricing where available, see [Pricing](route:/pricing).`,
  },

  'student-discount': {
    categoryId: 'billing',
    category: 'Billing & Account',
    title: 'Student discount',
    body: `Bridge offers a reduced subscription rate for verified students. The discount is applied automatically at checkout when you use an email address ending in .edu.\n\nIf your school uses a non-.edu domain, email ${COMPANY_EMAIL} with proof of enrollment (a screenshot of your student ID or enrollment confirmation) and we'll apply the discount manually.\n\nThe student rate applies to both monthly and annual plans. It renews at the student rate as long as you remain on the plan.`,
  },

  'manage-billing': {
    categoryId: 'billing',
    category: 'Billing & Account',
    title: 'Manage or cancel your subscription',
    body: `Dashboard → Billing opens the Stripe customer portal, where you can update your payment card, view and download past invoices, switch between monthly and annual plans, or cancel.\n\nCancel before day 8 of a trial and you owe nothing. Cancelling a paid subscription stops future charges; your access continues until the end of the current billing period. Your account and session history are not deleted.\n\nIf you cancel and later resubscribe, the free trial is not available again. Contact ${COMPANY_EMAIL} if you have a billing dispute.`,
  },

  'cancellation-refunds': {
    categoryId: 'billing',
    category: 'Billing & Account',
    title: 'Session refund policy',
    body: `**Before a session starts**: Cancel more than 1 hour before the scheduled start time for a full refund. Use the cancellation link in your Calendly confirmation email or Dashboard → Sessions → Cancel.\n\n**After a session completes**: If you're unsatisfied with a completed session, email ${COMPANY_EMAIL} within 48 hours. We review each case individually.\n\n**Subscription fees**: Non-refundable after the free trial ends, except where required by law. Cancelling a subscription stops future charges but does not refund the current period.\n\nFor detailed policy terms, see the [Terms of Service](route:/terms).`,
  },

  'delete-account': {
    categoryId: 'billing',
    category: 'Billing & Account',
    title: 'Deleting your account',
    body: `Go to Dashboard → Settings → Account → Delete account. Confirm the deletion in the prompt. Your account is deactivated immediately.\n\nPersonal data (name, email, profile, session history, messages) is permanently deleted within 30 days. Financial transaction records are retained for 7 years for tax compliance. Resume files in your private storage bucket are deleted immediately.\n\nDeletion is permanent. If you might want to return, consider cancelling your subscription instead, which keeps your account and history intact. Questions? Email ${COMPANY_EMAIL}.`,
  },
};

export const CATEGORIES = [
  {
    id: 'mentees',
    Icon: UserCheck,
    name: 'For Mentees',
    sub: 'Finding mentors, booking sessions, and AI tools.',
    keys: ['creating-account', 'finding-mentor', 'first-session', 'preparing-session', 'ai-matching', 'resume-review'],
  },
  {
    id: 'mentors',
    Icon: Users,
    name: 'For Mentors',
    sub: 'Applying, onboarding, Calendly, and managing sessions.',
    keys: ['become-mentor', 'mentor-onboarding', 'mentor-calendly', 'mentor-sessions', 'mentor-video-tips'],
  },
  {
    id: 'video',
    Icon: Video,
    name: 'Video & Audio',
    sub: 'Pre-call checklist, in-call features, troubleshooting, no-show policy.',
    keys: ['pre-call-checklist', 'join-call', 'in-call-features', 'technical', 'no-show-policy'],
  },
  {
    id: 'account',
    Icon: SettingsIcon,
    name: 'Account & Community',
    sub: 'Profile, notifications, reviews, messaging, and reporting.',
    keys: ['updating-profile', 'notifications', 'reviews-ratings', 'messaging', 'reporting-user'],
  },
  {
    id: 'billing',
    Icon: CreditCard,
    name: 'Billing & Account',
    sub: 'Subscription, what it costs, student discount, refunds, deleting your account.',
    keys: ['subscription', 'session-cost', 'student-discount', 'manage-billing', 'cancellation-refunds', 'delete-account'],
  },
];

// Hardcoded today. Replace with view-count-driven ordering once analytics exists.
export const POPULAR_KEYS = [
  'first-session',
  'pre-call-checklist',
  'subscription',
  'ai-matching',
  'technical',
  'cancellation-refunds',
];

// Precomputed since articles are static. { activeKey: [key, key, key] }
export const RELATED_KEYS = Object.fromEntries(
  Object.keys(ARTICLES).map((key) => {
    const { categoryId } = ARTICLES[key];
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    const related = cat ? cat.keys.filter((k) => k !== key).slice(0, 3) : [];
    return [key, related];
  }),
);

const DIACRITIC = /\p{Diacritic}/gu;
export function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(DIACRITIC, '');
}
