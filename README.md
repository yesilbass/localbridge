# Bridge

Bridge is a paid mentorship marketplace connecting job seekers and early-career professionals with vetted industry mentors for one-on-one sessions. Users browse mentors, book via Stripe, complete an AI-guided intake call, join a live video session, and leave a review — all in one flow.

## Features

- **Mentor browse & profiles** — filterable directory with tier badges (Rising / Professional / Senior / Elite), session rates, availability, and a booking widget
- **Two-phase mentor onboarding** — application flow (LinkedIn verification, diploma upload, degree level, references) → admin review → profile completion; rates and tiers assigned by a server-side scoring algorithm
- **Admin review panel** — internal dashboard at `/admin` to approve or reject mentor applications, view scoring breakdowns, and manage mentor status
- **AI mentor matching** — OpenAI-powered goal-based matching with an animated live-demo widget on the landing page (`MentorMatchWizard`, `aiMatching.js`)
- **Session booking** — Stripe Checkout (price locked server-side); Calendly integration for scheduling; Google Calendar invite sent on confirmation
- **AI intake call** — voice-driven pre-session intake using the OpenAI Realtime API; answers saved to Supabase and surfaced to the mentor
- **WebRTC video calls** — peer-to-peer video via browser WebRTC APIs with Supabase Realtime signalling; includes mic/cam toggle, screen share, in-call chat, collaborative whiteboard, and session timer
- **AI resume review** — PDF upload to Supabase Storage + Claude/OpenAI analysis with section-by-section scoring and improvement suggestions
- **Mentor subscriptions** — tiered subscription plans via Stripe Billing with student discount (50% off for `.edu` emails, auto-applied at checkout)
- **Reviews** — star ratings with averages maintained by a Postgres trigger (never computed client-side)
- **Notifications** — in-app notification panel via Supabase Realtime
- **Session cancellations** — cancellation requests with monthly rate-limiting
- **Three design palettes × light/dark** — `modern-signal`, `grounded-guidance`, `quiet-authority`; route-driven palette switching via `routePalette.js` and `appearance.css`
- **i18n** ⚠️ **(incomplete)** — language toggle with auto-translation via OpenAI (`gpt-4o-mini`), cached in `localStorage`. Only a subset of pages and components are wired up; most pages (dashboard, onboarding, mentor profile, settings, auth, footer pages, etc.) still render fully in English regardless of the selected language. Full coverage is a pending task.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4 (CSS-first, no config file) |
| Animation | `motion/react`, GSAP (scroll-linked), Three.js + React Three Fiber (3D) |
| Routing | `react-router-dom` v7 |
| Auth & DB | Supabase (Postgres + RLS + Auth + Storage + Realtime) |
| Video | WebRTC (native browser APIs) + Supabase Realtime (signalling) |
| Payments | Stripe — Checkout Sessions + Subscriptions (`stripe@22`) |
| Scheduling | Calendly (embedded widget + webhook) |
| Serverless API | Vercel Functions (`/api/*.js`) |
| Local dev server | Express 5 (`server/`) — mirrors the Vercel functions |
| Calendar | Google OAuth 2.0 + Google Calendar API |
| AI | OpenAI Realtime API (intake call) · OpenAI `gpt-4o-mini` (matching, translation) · Anthropic Claude (resume review) |
| Deployment | Vercel (auto-deploy from `main`) |

## Project Structure

```
bridge/
├── api/                              # Vercel serverless functions (production)
│   ├── _lib/                         # Shared: JWT auth, CORS helper, calendar logic
│   ├── admin/[action].js             # Admin: approve/reject mentor applications
│   ├── calendly/                     # Calendly webhook handlers
│   ├── verification/                 # Mentor verification helpers
│   ├── ai-proxy.js                   # AI proxy endpoint
│   ├── cancel-session.js
│   ├── create-booking-checkout.js
│   ├── create-subscription-checkout.js   # Applies student discount for .edu emails
│   ├── finalize-checkout.js
│   └── realtime-session.js           # OpenAI Realtime API ephemeral key endpoint
├── client/
│   └── src/
│       ├── api/                      # Client-side data modules (one file per domain)
│       │   ├── supabase.js           # Singleton — never re-instantiate
│       │   ├── sessions.js · mentors.js · reviews.js · favorites.js
│       │   ├── aiMatching.js · aiResumeReview.js · aiUsage.js
│       │   ├── calendar.js · stripe.js · intake.js · cancellations.js
│       │   └── resumeStorage.js · mentorOnboarding.js · menteeProfile.js
│       ├── components/               # Shared UI
│       │   ├── Navbar.jsx · Footer.jsx · LoadingSpinner.jsx
│       │   ├── MentorMatchWizard.jsx · ReviewModal.jsx · EmbeddedCheckoutPanel.jsx
│       │   ├── MentorApplicationPending.jsx · TierDisputeModal.jsx
│       │   ├── NotificationPanel.jsx · CancellationModal.jsx
│       │   ├── CalendlyInlineWidget.jsx · CalendarSuccessToast.jsx
│       │   └── MagneticPointer.jsx · BridgeGlobalAtmosphere.jsx · Reveal.jsx
│       ├── content/                  # i18n content strings + auto-translation
│       │   ├── en.js                 # English source strings (all namespaces)
│       │   └── index.jsx             # ContentProvider + useContent() hook
│       ├── context/                  # AuthContext + useAuth hook
│       ├── i18n/                     # useI18n() hook + language toggle
│       ├── pages/
│       │   ├── landing/              # Hero, Bento, Manifesto, HowItWorks, Outcomes, FinalCta…
│       │   ├── dashboard/            # Mentee + mentor dashboards, session calendar, hooks
│       │   ├── mentor-profile/       # Profile page with booking widget + TierBadge
│       │   ├── onboarding/mentor/    # Two-phase mentor onboarding
│       │   │   └── verify/           # Application: LinkedIn, resume, diploma, references (9 steps)
│       │   ├── admin/                # Internal admin review panel
│       │   ├── Mentors/              # Browse/filter directory + AI match cards
│       │   ├── Pricing/              # Subscription tiers + student discount banner
│       │   ├── VideoCall.jsx         # WebRTC video session
│       │   ├── IntakeCall.jsx        # OpenAI Realtime intake flow
│       │   ├── ResumeReview.jsx      # AI resume upload + analysis
│       │   ├── MentorOnboarding.jsx  # Legacy onboarding entry point
│       │   ├── Settings.jsx · Profile.jsx · Login.jsx · Register.jsx
│       │   ├── About.jsx · DevPortal/ · why-us/ · refs/
│       │   └── footer/               # Static pages (FAQ, Terms, Privacy…)
│       ├── utils/                    # appearance.js, routePalette.js, mentorAvailability…
│       ├── constants/                # sessionTypes.js (single source of truth)
│       ├── index.css                 # Tailwind v4 entry + all @utility definitions + keyframes
│       └── appearance.css            # 3 palettes × 2 themes — do not duplicate tokens
├── server/                           # Express 5 dev server (local only, mirrors /api)
│   └── routes/                       # sessions, calendar, googleAuth, stripe, cancellations, dev
├── supabase/
│   ├── migrations/                   # Versioned SQL migrations (apply via Supabase CLI)
│   ├── seeds/                        # mentor_tiers_seed.sql
│   └── functions/                    # Edge functions (send-support-email…)
├── vercel.json                       # Rewrites + cache headers
└── package.json                      # Monorepo root — shared deps for Vercel serverless functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (test mode is fine for local dev)
- A [Google Cloud](https://console.cloud.google.com) project with the Calendar API and OAuth credentials
- An [OpenAI](https://platform.openai.com) API key
- An [Anthropic](https://console.anthropic.com) API key

### Install dependencies

```bash
# From the repo root
npm install
cd client && npm install
```

### Configure environment

Create `server/.env`:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **server-side only, never expose to client** |
| `JWT_SECRET` | Secret used to sign/verify session JWTs |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | `http://localhost:3001/auth/google/callback` for local dev |
| `CLIENT_URL` | Frontend origin, e.g. `http://localhost:5173` |
| `PORT` | Express port (default `3001`) |

Create `client/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

### Run locally

```bash
# From the repo root — starts Express API + Vite dev server concurrently
npm run dev
```

- **Client** → http://localhost:5173 (or 5174)
- **API** → http://localhost:3001

### Build

```bash
cd client && npm run build
```

Output goes to `client/dist/`. Vercel picks this up automatically on every push to `main`.

## Database

Migrations live in `supabase/migrations/`. Apply via the Supabase CLI:

```bash
supabase db push
```

Key schema notes:
- `mentor_profiles.rating` is maintained by a Postgres trigger — never compute it client-side
- `mentor_profiles.id` ≠ `auth.users.id` — always query by profile UUID, not auth UID
- `mentor_profiles.mentor_status` drives visibility: `null` (seeded/demo) and `active` are public; `pending` / `under_review` show the waiting screen; `rejected` allows re-application
- RLS is enforced on all user-owned tables; silent write failures indicate a missing policy
- Session types are defined in `client/src/constants/sessionTypes.js` — four values: `career_advice`, `interview_prep`, `resume_review`, `networking`

## Mentor Onboarding Flow

New mentor accounts go through a three-phase process before appearing on the platform:

**Phase 1 — Verification application** (`/onboarding/mentor/verify`)
Mentor fills out a multi-step form: welcome → LinkedIn URL → resume upload → diploma upload + degree level → professional email → references → identity check → interview questions → review & submit. On submit, `mentor_status` is set to `pending` and the mentor sees a waiting screen. They can return to edit their application while pending.

**Phase 2 — Admin review** (`/admin`)
An admin reviews the submission, views the scoring breakdown, and either approves or rejects. On approval, `mentor_status` is set to `active` and the server-side algorithm assigns a tier and session rate automatically — the mentor cannot set their own rate.

**Phase 3 — Profile completion**
After approval the mentor is prompted to complete their public profile: bio, photo, availability schedule, and optional Google Calendar OAuth connect. Once complete, their profile appears in the mentor directory.

### Tier & Rate Algorithm

Rates are assigned server-side in `server/routes/dev.js` — mentors cannot set their own rate. Scoring factors: years of experience, education level (`degree_level` field), LinkedIn verification, and calculated score. Tiers: **Rising** → **Professional** → **Senior** → **Elite**.

## Deployment

Vercel auto-deploys from `main`. `vercel.json` routes `/api/*` paths to their matching serverless function and falls back to `client/dist/index.html` for all other routes (SPA).

Manual deploy:

```bash
vercel --prod
```

## Team

| Person | Area |
|---|---|
| Muaz | Mentor profile flow, onboarding, calendar integration |
| Omar | Dashboard v2 — session management, mentor earnings view |
| Irshad | Review system — post-session prompt, review display |

## Contributing & Legal

- [CONTRIBUTING.md](CONTRIBUTING.md) — branching model, PR checklist, commit conventions
- [ARCHITECTURE.md](ARCHITECTURE.md) — system design, data flow, key decisions
- [SECURITY.md](SECURITY.md) — vulnerability reporting and security policy
- [LICENSE](LICENSE)
