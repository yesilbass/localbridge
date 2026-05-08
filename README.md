# Bridge

Bridge is a paid mentorship marketplace that connects job seekers and early-career professionals with vetted industry mentors for one-on-one sessions. Users browse mentors, book via Stripe, complete an AI-guided intake call, join a live video session, and leave a review — all in one flow.

## Features

- **AI mentor matching** — OpenAI-powered goal-based matching with an animated live-demo widget on the landing page (`MentorMatchWizard`, `aiMatching.js`)
- **Mentor browse & profiles** — filterable mentor directory with tier badges, availability, reviews, and a booking widget
- **Session booking** — Stripe Checkout (price locked server-side); Google Calendar invite sent on confirmation
- **AI intake call** — voice-driven pre-session intake using the OpenAI Realtime API; answers saved to Supabase and surfaced to the mentor via `IntakeSummaryModal`
- **WebRTC video calls** — peer-to-peer video via the browser WebRTC APIs with Supabase Realtime signalling; includes mic/cam toggle, screen share, in-call chat, a collaborative whiteboard, and a session timer (`VideoCall.jsx`)
- **AI resume review** — PDF upload to Supabase Storage + Anthropic/OpenAI analysis with section-by-section scoring and improvement suggestions
- **Mentor subscriptions** — tiered subscription plans via Stripe Billing (`Pricing/`)
- **Reviews** — star ratings with averages maintained by a Postgres DB trigger (never computed client-side)
- **Notifications** — in-app notification panel (`NotificationPanel.jsx`) via Supabase Realtime
- **Session cancellations** — cancellation requests with monthly rate-limiting (`cancel-session.js`, `CancellationModal.jsx`)
- **Multi-step mentor onboarding** — availability, rate, bio, Google Calendar OAuth connect
- **Three design palettes × light/dark** — `modern-signal`, `grounded-guidance`, `quiet-authority`; route-driven via `routePalette.js` and `appearance.css`
- **Developer portal** — internal tooling at `/bridge-internal/*` outside the normal app layout

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4 (CSS-first, no config file) |
| Animation | `motion/react`, GSAP (scroll-linked), Three.js + React Three Fiber (3D) |
| Routing | `react-router-dom` v7 |
| Auth & DB | Supabase (Postgres + RLS + Auth + Storage + Realtime) |
| Video | WebRTC (native browser APIs) + Supabase Realtime (signalling) |
| Payments | Stripe — Checkout Sessions + Subscriptions (`stripe@22`) |
| Serverless API | Vercel Functions (`/api/*.js`) |
| Local dev server | Express 5 (`server/`) — mirrors the Vercel functions |
| Calendar | Google OAuth 2.0 + Google Calendar API |
| AI | OpenAI Realtime API (intake call) · OpenAI + Anthropic SDK (matching, resume review) |
| Deployment | Vercel (auto-deploy from `main`) |

## Project Structure

```
bridge/
├── api/                          # Vercel serverless functions (production)
│   ├── _lib/                     # Shared: JWT auth, CORS helper, calendar booking logic
│   ├── calendar-availability.js
│   ├── calendar-book.js
│   ├── cancel-session.js
│   ├── create-booking-checkout.js
│   ├── create-subscription-checkout.js
│   ├── finalize-checkout.js
│   ├── google-auth.js
│   ├── google-callback.js
│   └── realtime-session.js       # OpenAI Realtime API ephemeral key endpoint
├── client/
│   └── src/
│       ├── api/                  # Client-side data modules (one file per domain)
│       │   ├── supabase.js       # Singleton — never re-instantiate
│       │   ├── sessions.js · mentors.js · reviews.js · favorites.js
│       │   ├── aiMatching.js · aiResumeReview.js · aiUsage.js
│       │   ├── calendar.js · stripe.js · intake.js · cancellations.js
│       │   └── resumeStorage.js · mentorOnboarding.js · menteeProfile.js
│       ├── components/           # Shared UI (Navbar, Footer, ReviewModal, EmbeddedCheckoutPanel…)
│       ├── context/              # AuthContext + useAuth hook
│       ├── pages/
│       │   ├── landing/          # Hero, Bento, Manifesto, HowItWorks, Outcomes, FinalCta…
│       │   ├── dashboard/        # Mentee + mentor dashboards, session calendar, hooks
│       │   ├── mentor-profile/   # Profile page with booking widget
│       │   ├── Mentors/          # Browse/filter directory + AI match cards
│       │   ├── Pricing/          # Subscription tiers + comparison table
│       │   ├── VideoCall.jsx     # WebRTC video session
│       │   ├── IntakeCall.jsx    # OpenAI Realtime intake flow
│       │   ├── ResumeReview.jsx  # AI resume upload + analysis
│       │   ├── MentorOnboarding.jsx
│       │   ├── Settings.jsx · Profile.jsx · Login.jsx · Register.jsx
│       │   ├── About.jsx · DevPortal/
│       │   └── footer/           # Static pages (FAQ, Terms, Privacy…)
│       ├── utils/                # appearance.js, routePalette.js, mentorAvailability…
│       ├── constants/            # sessionTypes.js (single source of truth)
│       ├── index.css             # Tailwind v4 entry + all @utility definitions + keyframes
│       └── appearance.css        # 3 palettes × 2 themes — do not duplicate tokens
├── server/                       # Express 5 dev server (local only, mirrors /api)
│   └── routes/                   # sessions, calendar, googleAuth, stripe, support, cancellations
├── supabase/
│   ├── migrations/               # Versioned SQL migrations (apply via Supabase CLI)
│   ├── seeds/                    # mentor_tiers_seed.sql
│   └── functions/                # Edge functions (send-support-email…)
├── vercel.json                   # Rewrites + cache headers
└── package.json                  # Monorepo root — shared deps for Vercel serverless functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (test mode is fine for local dev)
- A [Google Cloud](https://console.cloud.google.com) project with the Calendar API and OAuth credentials
- An [OpenAI](https://platform.openai.com) API key

### Install dependencies

```bash
# From the repo root
npm install
cd client && npm install
```

### Configure environment

```bash
cp server/.env.example server/.env
```

Fill in `server/.env`:

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

Create `client/.env.local` for public client-side keys:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_OPENAI_API_KEY=sk-...
```

### Run locally

```bash
# From the repo root — starts Express API + Vite dev server concurrently
npm run dev
```

- **Client** → http://localhost:5173
- **API** → http://localhost:3001

### Build

```bash
npm run build
```

Output goes to `client/dist/`. Vercel picks this up automatically on every push to `main`.

## Database

Migrations live in `supabase/migrations/`. Apply via the Supabase CLI:

```bash
supabase db push
```

Seed mentor subscription tiers:

```bash
supabase db seed --file supabase/seeds/mentor_tiers_seed.sql
```

Key schema notes:
- `mentor_profiles.rating` is maintained by a Postgres trigger — never compute it client-side
- `mentor_profiles.id` ≠ `auth.users.id` — always query by profile UUID
- RLS is enforced on all user-owned tables; silent failures mean a missing policy, not a bug

## Deployment

Vercel auto-deploys from `main`. `vercel.json` routes named `/api/*` paths to their matching serverless function and falls back to `client/dist/index.html` for all other routes (SPA).

Manual deploy:

```bash
vercel --prod
```
