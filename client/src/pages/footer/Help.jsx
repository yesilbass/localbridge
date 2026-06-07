import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ArrowLeft, ChevronRight,
  Video, UserCheck, Users, CreditCard
} from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';
import { useContent } from '../../content';
import { COMPANY_EMAIL } from '../../config/contact';

const EYEBROW = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  color: 'var(--color-primary)',
};

const HAIRLINE = { borderBottom: '1px solid var(--bridge-border)' };

const ARTICLES = {

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
    body: `Open Mentors from the navigation bar. Filter by industry, role, or expertise, or use AI Matching from your dashboard if you've completed the goal-setting wizard.\n\nRead the full bio and mentorship description — not just the job title. Check reviews if the mentor has completed sessions, and look at their availability before getting attached to a specific profile.\n\nThe AI match results are ranked using your mentee profile (current role, target role, goals). The more complete your profile, the better the ranking. See the AI Matching article for details.`,
  },

  'first-session': {
    categoryId: 'mentees',
    category: 'For Mentees',
    title: 'Booking your first session',
    body: `On a mentor's profile, choose a session type — Career Advice, Interview Prep, Resume Review, or Networking. Then pick an open slot from their calendar, add a short note about what you want to cover, and complete checkout.\n\nAfter checkout you're directed to Calendly to confirm the time. The session appears as "pending" in your dashboard until the mentor accepts. Once accepted, the Join Call button appears.\n\nIf you're not yet subscribed, booking may start a 7-day free trial. You won't be charged until day 8. See Subscription & free trial for details.`,
  },

  'preparing-session': {
    categoryId: 'mentees',
    category: 'For Mentees',
    title: 'Preparing for a session',
    body: `Pick one concrete outcome you want by the end of the call — not five. Put it in your booking note when you schedule, so the mentor can prepare.\n\nIf you want feedback on a resume, deck, or specific work sample, upload it to your profile at least a day before. The mentor can access your uploaded resume during the call through the file-sharing feature.\n\nTest your camera and microphone about ten minutes before. See the Video & Audio Troubleshooting article for a full readiness checklist. Join from Chrome, Firefox, or Safari on desktop for screen sharing.`,
  },

  'ai-matching': {
    categoryId: 'mentees',
    category: 'For Mentees',
    title: 'How AI mentor matching works',
    body: `AI matching ranks the mentor directory based on your profile. Complete the goal-setting wizard in your dashboard (Dashboard → Recommendations) to enable it. The wizard asks for your current role, target role, target industry, years of experience, and top goals.\n\nWhen you run a match, your profile — and optionally the text extracted from your uploaded resume — is sent to OpenAI's API, which scores each mentor's profile against your goals and returns a ranked list of up to five recommendations.\n\nMatching is limited to 3 uses per account. Results are suggestions, not guarantees. Browse the full directory if the matches don't feel right. Your data is sent to OpenAI per their API data policy; see our Privacy Policy for details.`,
  },

  'resume-review': {
    categoryId: 'mentees',
    category: 'For Mentees',
    title: 'Using AI resume review',
    body: `AI resume review sends your uploaded PDF resume (up to 5 MB) to Anthropic's Claude API and returns a numeric score, letter grade, and section-by-section analysis covering contact info, summary, experience, skills, education, and formatting.\n\nTo use it: upload your resume in Dashboard → Resume Review, select your experience level (entry/mid/senior), and click Analyze. Results typically appear within 30 seconds.\n\nThis feature is limited to 1 use per account lifetime. The analysis is a probabilistic AI output — not a certified professional review. Treat it as a useful second opinion, not a definitive score. Your resume PDF is transmitted to Anthropic; see our Privacy Policy for how that data is handled.`,
  },

  // ── For Mentors ──────────────────────────────────────────────────────────────

  'become-mentor': {
    categoryId: 'mentors',
    category: 'For Mentors',
    title: 'How to apply as a mentor',
    body: `Go to Become a Mentor from the navigation (or /apply/mentor) and complete the application. The application uses a voice-based interview format — you answer questions about your background, why you want to mentor, and your area of expertise.\n\nYour audio is transcribed in real-time and an AI-generated evaluation is produced alongside the transcript. Both are stored in your application record and reviewed by a founder.\n\nApplications are reviewed manually. You'll receive an email about your application status within a few business days. Approved applicants are taken through a separate onboarding flow before going live.`,
  },

  'mentor-onboarding': {
    categoryId: 'mentors',
    category: 'For Mentors',
    title: 'Completing your mentor profile',
    body: `After approval, your dashboard will show a profile completion banner. The onboarding wizard walks through five steps: basic profile info, expertise tags, your mentorship description, scheduling setup, and profile review.\n\nYour mentorship description is the most important field — write 2–4 sentences about the kinds of problems you're best positioned to help with. The platform uses an AI model to automatically categorize your mentorship focus into pillars and subcategories based on this description.\n\nComplete all five steps before your profile goes live. Incomplete profiles are not shown to mentees.`,
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

  'video-readiness': {
    categoryId: 'video',
    category: 'Video & Audio',
    title: 'Video call readiness checklist',
    body: `Before every session, go through this list:\n\n**Supported browsers**: Chrome 90+, Firefox 88+, Safari 15+. Edge works but is not recommended for screen sharing. Mobile browsers support basic video but not screen sharing.\n\n**Camera & microphone permissions**:\n- Chrome: click the camera icon in the address bar, or go to Settings → Privacy → Site Settings → Camera\n- Firefox: click the lock icon in the address bar → Permissions\n- Safari: Safari → Settings → Websites → Camera and Microphone\nMake sure Bridge is set to "Allow," not "Block."\n\n**Internet speed**: Minimum 3 Mbps download / 1.5 Mbps upload for stable video. Test at fast.com before important calls. If possible, use a wired Ethernet connection.\n\n**Before joining**:\n1. Close bandwidth-heavy apps (streaming video, large downloads, cloud backups)\n2. Clear your browser cache if you've had issues before: Settings → More tools → Clear browsing data → Cached images and files\n3. Test your camera and mic in your OS system preferences to confirm the right devices are selected\n4. Join 2–3 minutes early and confirm your video preview looks correct in the lobby\n\n**During call troubleshooting**:\n- If video or audio drops, refresh the page and rejoin from your dashboard\n- If audio echoes, mute yourself when not speaking, or use headphones\n- If screen sharing fails, try a different browser\n- Open an incognito/private window to rule out browser extension conflicts`,
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
    body: `Bridge's video call includes several tools in the bottom toolbar:\n\n- **Mic / Camera toggle**: mute or turn off video at any time\n- **Screen sharing**: share your entire screen or a specific window. Desktop only — not available on mobile browsers\n- **Whiteboard / Drawing**: annotate over the call with colored markers, useful for diagrams and frameworks\n- **In-call chat**: send text messages that both parties can see during the call\n- **Resume sharing**: the mentor can access your uploaded resume directly from the session — no need to send files by email\n- **Audio device selector**: switch microphone or speaker mid-call using the settings icon\n\nAll of these features are peer-to-peer. Nothing is recorded or stored by Bridge.`,
  },

  'technical': {
    categoryId: 'video',
    category: 'Video & Audio',
    title: 'Troubleshooting technical issues',
    body: `If video freezes or audio drops during a call:\n1. Refresh the page and rejoin from Dashboard → Sessions → Join Call\n2. If the problem continues, try switching to a different browser (Chrome is most reliable)\n3. Check your internet connection — switch from Wi-Fi to Ethernet if possible\n4. Close other tabs and apps to free up memory and bandwidth\n5. Open an incognito window to rule out browser extension interference\n\nIf you've been waiting in the session room for 5+ minutes and the other person hasn't joined, they may be experiencing a connection issue. Send an in-app message from your dashboard.\n\nStill stuck? Email ${COMPANY_EMAIL} and include: which browser you're using, what you see on screen, and what you've already tried.`,
  },

  'no-show-policy': {
    categoryId: 'video',
    category: 'Video & Audio',
    title: 'No-show & late arrival policy',
    body: `**If you cannot attend**: Cancel at least 1 hour before the session using the cancel link in your confirmation email or Dashboard → Sessions → Cancel. This frees the mentor's slot.\n\n**Cancellation refunds**:\n- Cancelled more than 1 hour before: full refund\n- Cancelled within 1 hour of start: refund at mentor's discretion\n- No cancellation at all (no-show): no refund\n\n**Mentee no-show**: If you don't join within 15 minutes of the scheduled start without cancelling, the session is counted as a no-show. Three or more no-shows may temporarily restrict your ability to book.\n\n**Mentor no-show**: If your mentor doesn't join within 15 minutes, email ${COMPANY_EMAIL} with the session time and mentor name. You'll receive a full refund and priority rebooking. A confirmed no-show without prior communication is grounds for mentor removal from the platform.\n\n**Late arrival**: Sessions start on time. If you're more than 10 minutes late, the mentor may end the call. The remaining time is not added to a future session.`,
  },

  // ── Billing & Account ────────────────────────────────────────────────────────

  'subscription': {
    categoryId: 'billing',
    category: 'Billing & Account',
    title: 'Subscription & free trial',
    body: `Mentor time is always free — mentors volunteer. The Bridge subscription unlocks platform features: full mentor directory access, AI matching, AI resume review (1 lifetime use), community access, in-app messaging, and all future features.\n\nNew subscribers start with a 7-day free trial. You won't be charged until day 8. A reminder is sent on day 5. Cancel anytime during the trial at no charge.\n\nMonthly and annual plans are available. Annual plans are billed upfront and work out cheaper per month. Students with a verified .edu email get a reduced rate applied automatically at checkout. See Pricing for current amounts.`,
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
    body: `**Before a session starts**: Cancel more than 1 hour before the scheduled start time for a full refund. Use the cancellation link in your Calendly confirmation email or Dashboard → Sessions → Cancel.\n\n**After a session completes**: If you're unsatisfied with a completed session, email ${COMPANY_EMAIL} within 48 hours. We review each case individually.\n\n**Subscription fees**: Non-refundable after the free trial ends, except where required by law. Cancelling a subscription stops future charges but does not refund the current period.\n\nFor detailed policy terms, see our Terms of Service → Section 6.`,
  },

  'delete-account': {
    categoryId: 'billing',
    category: 'Billing & Account',
    title: 'Deleting your account',
    body: `Go to Dashboard → Settings → Account → Delete account. Confirm the deletion in the prompt. Your account is deactivated immediately.\n\nPersonal data (name, email, profile, session history, messages) is permanently deleted within 30 days. Financial transaction records are retained for 7 years for tax compliance. Resume files in your private storage bucket are deleted immediately.\n\nDeletion is permanent. If you might want to return, consider cancelling your subscription instead, which keeps your account and history intact. Questions? Email ${COMPANY_EMAIL}.`,
  },
};

const CATEGORIES = [
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
    sub: 'Technical checklist, in-call features, troubleshooting, no-show policy.',
    keys: ['video-readiness', 'join-call', 'in-call-features', 'technical', 'no-show-policy'],
  },
  {
    id: 'billing',
    Icon: CreditCard,
    name: 'Billing & Account',
    sub: 'Subscription, student discount, refunds, deleting your account.',
    keys: ['subscription', 'student-discount', 'manage-billing', 'cancellation-refunds', 'delete-account'],
  },
];

const POPULAR_KEYS = [
  'first-session',
  'video-readiness',
  'subscription',
  'ai-matching',
  'technical',
  'cancellation-refunds',
];

function renderArticleBody(body) {
  return body.split('\n\n').map((block, bi) => {
    const lines = block.split('\n');
    const isList = lines.length > 1 && lines.slice(1).every((l) => l.startsWith('- ') || /^\d+\./.test(l));
    if (isList) {
      const heading = lines[0];
      const items = lines.slice(1);
      return (
        <div key={bi}>
          {heading && !heading.startsWith('- ') && !(/^\d+\./).test(heading) && (
            <p
              className="mb-2 font-semibold"
              style={{ color: 'var(--bridge-text)' }}
              dangerouslySetInnerHTML={{
                __html: heading.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              }}
            />
          )}
          <ul className="space-y-1.5">
            {items.map((item, ii) => (
              <li key={ii} className="flex items-start gap-2">
                <span
                  className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 60%, transparent)' }}
                />
                <span
                  dangerouslySetInnerHTML={{
                    __html: item.replace(/^- /, '').replace(/^\d+\.\s*/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <p
        key={bi}
        dangerouslySetInnerHTML={{
          __html: block.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--bridge-text);font-weight:600">$1</strong>').replace(/\n/g, '<br />')
        }}
      />
    );
  });
}

function ArticleList({ keys, onSelect }) {
  return (
    <ul className="mt-4 border-t border-[var(--bridge-border)]">
      {keys.map((key, i) => {
        const article = ARTICLES[key];
        const last = i === keys.length - 1;
        return (
          <li key={key} style={!last ? HAIRLINE : undefined}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(key)}
              className="group flex w-full items-center justify-between gap-3 py-4 text-left focus:outline-none focus-visible:underline"
            >
              <span className="text-base font-semibold text-[var(--bridge-text)]">{article.title}</span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)] transition group-hover:translate-x-0.5"
                aria-hidden
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function relatedArticleKeys(activeKey) {
  const { categoryId } = ARTICLES[activeKey];
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return [];
  return cat.keys.filter((k) => k !== activeKey).slice(0, 3);
}

export default function Help() {
  const { s } = useContent();
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return Object.entries(ARTICLES).filter(
      ([, a]) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q),
    );
  }, [search]);

  if (active) {
    const article = ARTICLES[active];
    const related = relatedArticleKeys(active);

    return (
      <main className={`${pageShell} px-4 py-16 sm:px-6 sm:py-20 lg:px-8`}>
        <article className="mx-auto max-w-[700px]">
          <nav className="mb-8 flex items-center gap-2 text-[13px]" aria-label="Breadcrumb">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActive(null)}
              className="flex items-center gap-1 font-medium text-[var(--bridge-text-muted)] transition hover:text-[var(--bridge-text)] focus:outline-none focus-visible:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Help center
            </button>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--bridge-text-muted)]" aria-hidden />
            <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{article.category}</span>
          </nav>

          <p className="mb-4" style={EYEBROW}>
            {article.category}
          </p>
          <h1
            className="font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', lineHeight: 1.08 }}
          >
            {article.title}
          </h1>

          <div className="mt-8 space-y-5 text-base leading-[1.8] text-[var(--bridge-text-secondary)] sm:text-[17px]">
            {renderArticleBody(article.body)}
          </div>

          {related.length > 0 && (
            <div className="mt-12 border-t border-[var(--bridge-border)] pt-10">
              <p className="mb-4 text-base font-semibold text-[var(--bridge-text)]">Related articles</p>
              <ul>
                {related.map((key, i) => {
                  const rel = ARTICLES[key];
                  const last = i === related.length - 1;
                  return (
                    <li key={key} style={!last ? HAIRLINE : undefined}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setActive(key)}
                        className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold text-[var(--bridge-text)] focus:outline-none focus-visible:underline"
                      >
                        {rel.title}
                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)]" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <p className="mt-12 border-t border-[var(--bridge-border)] pt-10 text-base leading-[1.8] text-[var(--bridge-text-secondary)] sm:text-lg">
            Policy questions?{' '}
            <Link
              to="/faq"
              className="font-semibold underline underline-offset-4 transition hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              Read the FAQ
            </Link>
            . Safety concern?{' '}
            <Link
              to="/trust"
              className="font-semibold underline underline-offset-4 transition hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              Trust & Safety
            </Link>
            . Still need help?{' '}
            <a
              href="/contact"
              className="font-semibold underline underline-offset-4 transition hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              {s.common.contactSupport}
            </a>
            .
          </p>
        </article>
      </main>
    );
  }

  const showBrowse = !search.trim();

  return (
    <main className={`${pageShell} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <div className="mx-auto max-w-4xl">
        <Reveal className="mb-12 border-b border-[var(--bridge-border)] pb-12">
          <span className="mb-3 block" style={EYEBROW}>
            Guides
          </span>
          <h1
            className="font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', lineHeight: 1.08 }}
          >
            Help center
          </h1>
          <p className="mt-3 max-w-xl text-base leading-[1.7] text-[var(--bridge-text-muted)]">
            Step-by-step guides for using Bridge. Policy questions and platform overviews →{' '}
            <Link to="/faq" className="font-semibold underline underline-offset-4" style={{ color: 'var(--color-primary)' }}>
              FAQ
            </Link>
            .
          </p>

          <div className="relative mt-8">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--bridge-text-muted)]"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search — video call, no-show, Calendly, refund, AI matching…"
              aria-label="Search help articles"
              className="w-full rounded-lg border border-[var(--bridge-border)] bg-transparent py-4 pl-12 pr-4 text-lg text-[var(--bridge-text)] outline-none placeholder:text-[var(--bridge-text-muted)] transition focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
        </Reveal>

        {!showBrowse ? (
          <div>
            <p className="mb-6 text-base text-[var(--bridge-text-muted)]">
              {results.length} result{results.length !== 1 && 's'}
            </p>
            {results.length === 0 ? (
              <p className="py-10 text-base text-[var(--bridge-text-secondary)]">
                Nothing matched &ldquo;{search}&rdquo;. Try the{' '}
                <Link to="/faq" className="font-semibold underline underline-offset-4" style={{ color: 'var(--color-primary)' }}>
                  FAQ
                </Link>{' '}
                or{' '}
                <Link to="/contact" className="font-semibold underline underline-offset-4" style={{ color: 'var(--color-primary)' }}>
                  contact us
                </Link>
                .
              </p>
            ) : (
              <ul className="border-t border-[var(--bridge-border)]">
                {results.map(([key, a], i) => {
                  const last = i === results.length - 1;
                  return (
                    <li key={key} style={!last ? HAIRLINE : undefined}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSearch('');
                          setActive(key);
                        }}
                        className="group flex w-full items-center justify-between gap-4 py-5 text-left focus:outline-none focus-visible:underline"
                      >
                        <div className="min-w-0">
                          <p style={EYEBROW}>{a.category}</p>
                          <p className="mt-1 text-base font-semibold text-[var(--bridge-text)]">{a.title}</p>
                        </div>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)] transition group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <>
            <Reveal className="mb-10">
              <p
                className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{ color: 'var(--color-primary)' }}
              >
                Popular articles
              </p>
              <div
                className="overflow-hidden rounded-2xl"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                }}
              >
                {POPULAR_KEYS.map((key, i) => {
                  const article = ARTICLES[key];
                  const last = i === POPULAR_KEYS.length - 1;
                  return (
                    <div key={key} style={!last ? HAIRLINE : undefined}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setActive(key)}
                        className="group flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none focus-visible:underline"
                      >
                        <div className="min-w-0">
                          <p
                            className="text-[11px] font-bold uppercase tracking-[0.14em]"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {article.category}
                          </p>
                          <p className="mt-0.5 text-[15px] font-semibold text-[var(--bridge-text)]">
                            {article.title}
                          </p>
                        </div>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)] transition group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2">
              {CATEGORIES.map((cat, ci) => {
                const Icon = cat.Icon;
                return (
                  <Reveal key={cat.id} delay={ci * 40}>
                    <div
                      className="overflow-hidden rounded-2xl"
                      style={{
                        backgroundColor: 'var(--bridge-surface)',
                        boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                      }}
                    >
                      <div className="px-5 pt-5 pb-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              aria-hidden
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                              style={{
                                backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                              }}
                            >
                              <Icon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                            </span>
                            <h2 className="font-display text-lg font-bold text-[var(--bridge-text)]">
                              {cat.name}
                            </h2>
                          </div>
                          <span
                            className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                              color: 'var(--bridge-text-muted)'
                            }}
                          >
                            {cat.keys.length}
                          </span>
                        </div>
                        <p className="text-[13px] text-[var(--bridge-text-muted)]">{cat.sub}</p>
                      </div>
                      <ArticleList keys={cat.keys} onSelect={setActive} />
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={160}>
              <div
                className="mt-14 rounded-2xl p-8 sm:p-10"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                }}
              >
                <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                  Still need help?
                </h2>
                <p className="mt-3 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                  Can't find what you're looking for? A real person reads every message — we'll get
                  back to you within 24–48 hours.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                  >
                    Contact us
                  </Link>
                  <Link
                    to="/trust"
                    className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                      color: 'var(--color-primary)',
                      boxShadow:
                        'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)'
                    }}
                  >
                    Trust & Safety
                  </Link>
                </div>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </main>
  );
}
