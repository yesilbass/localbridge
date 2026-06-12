import { Shield, Settings, BarChart3, HardDrive, CreditCard, CalendarDays, Type } from 'lucide-react';

export const SECTIONS = [
  { id: 'what-are-cookies', title: '1. What are cookies?' },
  { id: 'essential', title: '2. Essential cookies' },
  { id: 'local-storage', title: '3. Browser local storage' },
  { id: 'third-party', title: '4. Third-party services' },
  { id: 'fonts', title: '5. Fonts' },
  { id: 'not-used', title: "6. What we don't use" },
  { id: 'dnt', title: '7. Do Not Track' },
  { id: 'consent', title: '8. Consent & withdrawal' },
  { id: 'managing', title: '9. Managing preferences' },
  { id: 'changes', title: '10. Changes to this policy' },
  { id: 'questions', title: '11. Questions?' },
];

export const ESSENTIAL_COOKIES = [
  {
    name: 'Authentication session',
    provider: 'Supabase',
    purpose: 'Keeps you signed in between page loads. Supabase issues an access token (short-lived, ~1 hour) and a refresh token that silently renews the session for up to several weeks of continued use.',
    duration: 'Access token ~1 hour; refresh token rotates while active',
    type: 'Essential',
  },
  {
    name: 'Sign-in security token',
    provider: 'Supabase',
    purpose: 'One-time cryptographic token used during sign-in to prevent request forgery. Discarded after login completes.',
    duration: 'Session',
    type: 'Essential',
  },
];

export const THIRD_PARTY = [
  {
    Icon: CreditCard,
    title: 'Stripe',
    body: "When you reach a checkout page, Stripe.js loads and sets cookies used for fraud detection and device fingerprinting. These cookies are essential to completing secure payment. Stripe's privacy policy governs their use.",
    policy: 'stripe.com/privacy',
    cookies: [
      { name: '__stripe_mid', purpose: 'Persistent device identifier for fraud prevention', duration: '1 year (per Stripe documentation)', type: 'Essential' },
      { name: '__stripe_sid', purpose: 'Short-lived session identifier for fraud detection', duration: '30 minutes', type: 'Essential' },
    ],
  },
  {
    Icon: CalendarDays,
    title: 'Calendly',
    body: "The embedded Calendly scheduling widget loads only on pages where you can book a session. When it loads, Calendly (and Cloudflare, which fronts Calendly's network) set cookies used for widget session state and bot detection.",
    policy: 'calendly.com/legal/privacy-notice',
    cookies: [
      { name: '__cf_bm', purpose: 'Cloudflare bot detection', duration: '30 minutes', type: 'Essential' },
      { name: 'calendly_session', purpose: 'Widget session state and timezone', duration: 'Session', type: 'Functional' },
    ],
  },
  {
    Icon: Type,
    title: 'Google Fonts',
    body: 'Bridge loads display and body fonts from the Google Fonts CDN (fonts.googleapis.com and fonts.gstatic.com). Google Fonts does not set cookies on the requesting page, but the font request itself transmits standard HTTP metadata — your IP address and user-agent — to Google, governed by their privacy policy.',
    policy: 'policies.google.com/privacy',
    cookies: [],
  },
];

export const NOT_USED = [
  'Google Analytics or any other analytics platform',
  'Facebook Pixel or any advertising network',
  'Hotjar, FullStory, or any session replay tool',
  'Intercom, Drift, or any third-party chat widget',
  'Any retargeting or cross-site tracking technology',
];

export const LOCAL_STORAGE_KEYS = [
  { key: 'bridge-appearance', label: 'Theme preference', desc: "Remembers whether you've selected light mode, dark mode, or system default." },
  { key: 'bridge_onboarded', label: 'Onboarding state', desc: "Remembers that the first-login welcome flow has been shown, so it doesn't appear again." },
  { key: 'bridge-cookie-consent', label: 'Cookie consent', desc: "Records that you've acknowledged the cookie banner. Clearing this value re-shows the banner on your next visit." },
  { key: 'bridge_notif_read', label: 'Notification state', desc: "Tracks which in-app notifications you've already read." },
  { key: 'bridge_recently_viewed_mentors', label: 'Recently viewed mentors', desc: 'Stores the last few mentor profiles you visited so the browser can surface them as quick links.' },
];

export const BROWSER_INSTRUCTIONS = [
  { name: 'Chrome', steps: 'Settings → Privacy and security → Third-party cookies (or Cookies and other site data). Use "See all site data and permissions" to find bridge and clear its cookies and storage.' },
  { name: 'Firefox', steps: 'Settings → Privacy & Security → Cookies and Site Data → Manage Data. Search for bridge and remove. Use Developer Tools → Storage to inspect localStorage.' },
  { name: 'Safari', steps: 'Settings → Privacy → Manage Website Data. Search for bridge and remove. On iOS: Settings app → Safari → Advanced → Website Data.' },
  { name: 'Edge', steps: 'Settings → Cookies and site permissions → Manage and delete cookies and site data → See all cookies and site data. Search for bridge and remove.' },
];

export const ICONS = { Shield, Settings, BarChart3, HardDrive };
