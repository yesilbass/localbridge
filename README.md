# Bridge

Bridge is a paid mentorship marketplace that connects job seekers and early-career professionals with vetted industry mentors for one-on-one sessions. Users browse mentors by goal, book time via Stripe, join a video call, and leave a review — all in one flow.

## Features

- **AI mentor matching** — goal-based chip selector with live animated match demo on the landing page
- **Mentor profiles** — rate, bio, availability, Google Calendar integration
- **Session booking** — Stripe Checkout with price locked server-side; calendar invite sent on confirmation
- **Video calls** — Jitsi-based in-app video with a realtime AI intake call (OpenAI Realtime API)
- **Resume review** — async resume upload + AI-generated feedback
- **Subscriptions** — mentor subscription tiers via Stripe billing
- **Reviews** — star ratings with DB-trigger-computed averages
- **Settings & onboarding** — multi-step mentor onboarding, Google OAuth calendar connect
- **Three design palettes** — `modern-signal`, `grounded-guidance`, `quiet-authority` with light/dark themes

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, motion/react, GSAP, Three.js / R3F |
| Auth & DB | Supabase (Postgres + RLS + Row-Level Security) |
| Payments | Stripe (Checkout Sessions + Subscriptions) |
| Serverless API | Vercel Functions (`/api/*.js`) |
| Local dev server | Express 5 (`server/`) |
| Calendar | Google OAuth 2.0 + Google Calendar API |
| AI | OpenAI Realtime API (intake call), OpenAI (resume review) |
| Deployment | Vercel (auto-deploy from `main`) |

## Project Structure

```
bridge/
├── api/                        # Vercel serverless functions
│   ├── _lib/                   # Shared helpers (auth, CORS, calendar booking)
│   ├── calendar-availability.js
│   ├── calendar-book.js
│   ├── cancel-session.js
│   ├── create-booking-checkout.js
│   ├── create-subscription-checkout.js
│   ├── finalize-checkout.js
│   ├── google-auth.js
│   ├── google-callback.js
│   └── realtime-session.js
├── client/                     # React + Vite app
│   └── src/
│       ├── api/                # Client-side API modules (supabase, stripe, calendar…)
│       ├── components/         # Shared UI components
│       └── pages/              # Route-level pages (landing, dashboard, mentors, etc.)
├── server/                     # Express dev server (local only)
├── supabase/                   # Migrations, seeds, edge functions
├── vercel.json                 # Vercel routing + cache headers
└── package.json                # Monorepo root (shared serverless deps)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account
- A [Google Cloud](https://console.cloud.google.com) project with the Calendar API enabled
- An [OpenAI](https://platform.openai.com) API key

### Install dependencies

```bash
# From the repo root — installs root + client deps
npm install && cd client && npm install
```

### Configure environment

```bash
cp server/.env.example server/.env
```

Fill in `server/.env`:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only, never expose to client) |
| `JWT_SECRET` | Secret used to sign/verify session JWTs |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | `http://localhost:3001/auth/google/callback` for local dev |
| `CLIENT_URL` | Frontend origin, e.g. `http://localhost:5174` |
| `PORT` | Express port (default `3001`) |

The client reads public Supabase credentials from `client/.env.local` (create this file):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Run locally

```bash
# Start both the Express API and Vite dev server concurrently
npm run dev
```

- **Client** → http://localhost:5174
- **API** → http://localhost:3001

### Build for production

```bash
npm run build
```

Output goes to `client/dist/`. Vercel picks this up automatically on push to `main`.

## Database

Migrations live in `supabase/migrations/`. Apply them via the Supabase CLI:

```bash
supabase db push
```

Seed mentor tiers:

```bash
supabase db seed --file supabase/seeds/mentor_tiers_seed.sql
```

## Deployment

The project deploys to Vercel. `vercel.json` routes `/api/*` requests to the serverless functions in `/api/` and falls back to `client/dist/index.html` for all other routes (SPA routing).

To deploy manually:

```bash
vercel --prod
```
