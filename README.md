# Bridge

A paid mentorship marketplace connecting job seekers and early-career professionals with vetted industry mentors. Mentees browse mentors, book a session via Stripe, complete an AI-guided intake call, join a live video session, and leave a review — all in one flow.

---

## Features

- **Mentor discovery** — filterable directory with tier badges, session rates, availability, and AI-powered goal-based matching
- **Two-phase mentor onboarding** — 9-step verification application (LinkedIn, diploma, references, identity) → admin review → profile completion; tiers and rates assigned server-side by a scoring algorithm
- **Admin review panel** — approve or reject mentor applications at `/admin`, with scoring breakdowns
- **Session booking** — Stripe Checkout (price locked server-side); Calendly integration for scheduling; Google Calendar invite sent on confirmation
- **AI intake call** — voice-driven pre-session intake via the OpenAI Realtime API; answers surfaced to the mentor on their dashboard
- **Live video sessions** — peer-to-peer WebRTC video with mic/camera toggle, screen share, in-call chat, collaborative whiteboard, and session timer; no third-party video SDK
- **AI resume review** — PDF upload to Supabase Storage + Claude analysis with section-by-section scoring and improvement suggestions
- **Mentor subscriptions** — tiered plans via Stripe Billing; 50% student discount auto-applied for `.edu` emails
- **Reviews** — star ratings with averages maintained by a Postgres trigger
- **Favorites** — save and manage preferred mentors
- **In-app notifications** — real-time notification panel via Supabase Realtime
- **Three design palettes** — `modern-signal`, `grounded-guidance`, `quiet-authority`; route-driven palette switching with light and dark variants

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4 (CSS-first) |
| Routing | react-router-dom v7 |
| Animation | motion/react, GSAP, Three.js + React Three Fiber |
| Auth & Database | Supabase (Postgres + RLS + Auth + Realtime + Storage) |
| Payments | Stripe — Checkout Sessions + Subscriptions |
| Scheduling | Calendly (embedded widget + webhook) |
| Video | Native browser WebRTC + Supabase Realtime (signalling) |
| Calendar | Google OAuth 2.0 + Google Calendar API |
| AI | OpenAI Realtime API · OpenAI GPT-4o-mini · Anthropic Claude Sonnet |
| API (production) | Vercel Serverless Functions (`api/`) |
| API (local dev) | Express 5 (`server/`) — mirrors `api/` |
| Deployment | Vercel (auto-deploy from `main`) |

---

## Project Structure

```
bridge/
├── api/                    # Vercel serverless functions (production)
│   ├── _lib/               # Shared: JWT auth, CORS, calendar booking logic
│   ├── admin/              # Approve / reject mentor applications
│   ├── calendly/           # Calendly OAuth + webhook handlers
│   ├── verification/       # Mentor verification pipeline endpoints
│   ├── utils/              # User name lookup, room slug, cron helpers
│   ├── create-booking-checkout.js
│   ├── create-subscription-checkout.js
│   ├── finalize-checkout.js
│   ├── cancel-session.js
│   ├── realtime-session.js
│   └── ai-proxy.js
├── client/
│   └── src/
│       ├── api/            # Client data modules — one file per domain
│       ├── components/     # Shared UI components
│       ├── context/        # AuthContext + useAuth hook
│       ├── pages/          # Route-level page components
│       ├── constants/      # sessionTypes.js — source of truth for session type keys
│       ├── utils/          # routePalette.js, helpers
│       ├── index.css       # Tailwind v4 entry + custom utilities + keyframes
│       └── appearance.css  # Palette tokens (3 palettes × 2 themes)
├── server/                 # Express 5 — local dev API server (mirrors api/)
├── supabase/
│   ├── migrations/         # Versioned SQL migrations
│   └── seeds/
└── vercel.json             # Rewrites, cache headers, security headers
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Access to the shared Supabase project (ask Berk)
- Stripe test-mode keys
- Google Cloud project with Calendar API and OAuth 2.0 credentials
- OpenAI API key (GPT-4o and Realtime API access)
- Anthropic API key (Claude Sonnet access)

### Install

```bash
# Install root + API dependencies
npm install

# Install frontend dependencies
cd client && npm install
```

### Configure Environment

You need two `.env` files. Never commit either one.

**`server/.env`**

```
PORT=3001
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
STRIPE_SECRET_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
CLIENT_URL=http://localhost:5173
```

**`client/.env.local`**

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_SERVER_URL=http://localhost:3001
VITE_OPENAI_API_KEY=
VITE_ANTHROPIC_API_KEY=
```

### Run Locally

```bash
# From the repo root — starts Express API (port 3001) + Vite dev server (port 5173)
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:3001

---

## Deployment

Vercel auto-deploys from `main`. `vercel.json` routes `/api/*` to their matching serverless functions and falls back to `client/dist/index.html` for all other paths.

Manual deploy:

```bash
vercel --prod
```

When adding new environment variables, add them to the Vercel project under **Settings → Environment Variables** in addition to your local `.env` files.

---

## Database

Supabase Postgres. Schema is versioned in `supabase/migrations/` and applied with `supabase db push`. Core tables:

| Table | Purpose |
|---|---|
| `mentor_profiles` | Mentor public data, tier, rate, availability, verification status |
| `sessions` | Booked sessions between mentees and mentors |
| `reviews` | Post-session ratings; averages maintained by a Postgres trigger |
| `favorites` | Saved mentors per user |
| `user_profiles` | Mentee personal info, experience, education, skills |
| `mentee_profiles` | AI onboarding output used for mentor matching |
| `user_settings` | Per-user app preferences |
| `ai_usage` | Per-user AI feature usage tracking and limits |

RLS is enabled on all tables. Row-level policies restrict reads and writes to authenticated owners except where public access is explicitly granted (e.g. mentor profile reads).

---

## Team

| Person | Area |
|---|---|
| Berk | Project lead, infrastructure, deployment |
| Muaz | Mentor profile flow, onboarding, calendar integration |
| Omar | Dashboard v2 — session management, mentor earnings view |
| Irshad | Review system — post-session prompt, review display |

---

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — end-to-end system design, data flow, and key technical decisions
- [CONTRIBUTING.md](CONTRIBUTING.md) — branching model, PR checklist, code standards, commit conventions
- [SECURITY.md](SECURITY.md) — vulnerability reporting and security policy
- [LICENSE](LICENSE)
