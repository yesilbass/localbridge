# Bridge

A paid mentorship marketplace connecting job seekers and early-career professionals with vetted industry mentors. Mentees browse mentors, book a session via Stripe, schedule via Calendly, complete an AI-guided intake call, join a live video session, and leave a review — all in one flow.

---

## Project Status — Shipped (for AI context)

> **Last updated:** May 24, 2026 (community, mentor application, grouped nav, OpenAI Realtime GA). Copy this section when briefing an AI on what Bridge has already built.

Bridge is pre-revenue, demo-ready, and deployed on Vercel from `main`. The stack is React 19 + Vite 8 + Tailwind v4 (client), Supabase (auth, Postgres, RLS, Realtime, Storage), Stripe (session checkout + subscriptions), Calendly (scheduling), and Vercel serverless functions (`api/`). Local dev uses Express 5 in `server/` as an API mirror.

### End-to-end flows that work

| Flow | Status |
|---|---|
| Sign up / sign in (Supabase Auth) | ✅ |
| Browse mentors → filter, sort, industry, search | ✅ |
| AI mentor matching wizard (OpenAI, usage limits) | ✅ |
| View mentor profile → book session (Stripe Checkout, price locked server-side) | ✅ |
| Post-payment scheduling (embedded Calendly widget on `/booking/finalize`) | ✅ |
| Mentor accepts/declines session requests | ✅ |
| AI intake call before session (`/intake/:sessionId`, voice + text fallback) | ✅ |
| Live video session (`/session/:sessionId/video`, WebRTC + Supabase Realtime signalling) | ✅ |
| Permanent mentor meet lobby (`/meet/:slug`, knock → admit → video room) | ✅ |
| Post-session review + Postgres trigger for mentor rating averages | ✅ |
| Favorites (save/remove mentors) | ✅ |
| Subscription plan (Stripe Billing, single plan; 50% student discount for `.edu`) | ✅ |
| Subscription-gated messaging (mentee ↔ mentor, Realtime inbox) | ✅ |
| AI resume review (PDF upload + Claude analysis) | ✅ |
| Resume upload → AI extract to pre-fill user profile | ✅ |
| Mentor Calendly OAuth + availability setup | ✅ |
| Mentor earnings view + session history | ✅ |
| Session cancellation (modal + server-side rate limits) | ✅ |
| Admin verification queue (`/admin/verification`) | ✅ |
| Third-party reference submission (`/refs/:token`) | ✅ |
| Blog (public listing + author write at `/blog/write`, admin at `/admin/blog`) | ✅ |
| In-app feedback FAB + support email | ✅ |
| i18n (7 languages: en, es, fr, it, de, ar, tr) | ✅ |
| Three design palettes + light/dark/system appearance | ✅ |
| Mentorship category taxonomy + AI tagging | ✅ |
| Mentor value stack (badges, mentor posts, session action items) | ✅ |
| Community hub + category feeds (questions, wins, discussions, resources) | ✅ |
| Voice-first mentor application (`/apply/mentor`) + post-approval onboarding | ✅ |

### All routes

**Public marketing**

| Route | Page |
|---|---|
| `/` | Landing — hero, how-it-works strip, audience fit, waitlist, FAQ accordion (`pages/landing/`) |
| `/company` | Company story, beliefs, comparison, proof, team, CTA |
| `/how-it-works` | Sessions track explainer — centered hero, four steps, close CTA (`pages/how-it-works/`; `howItWorksData.js`) |
| `/pricing` | Single-plan pricing, FAQ, embedded Stripe checkout |
| `/resume` | AI resume review |
| `/mentors` | Mentor directory (+ AI match wizard) |
| `/mentors/:id` | Mentor profile (book, favorite, message, reviews) |
| `/blog` | Published posts |
| `/become-a-mentor` | Mentor recruitment landing |
| `/careers`, `/faq`, `/contact`, `/help`, `/trust` | Footer pages — FAQ uses sticky section nav; Help/Contact/Trust use shared marketing shell |
| `/privacy`, `/terms`, `/cookies` | Legal |

Legacy redirects: `/about` and `/why-us` → `/company`.

**Auth**

| Route | Page |
|---|---|
| `/login`, `/register` | Supabase auth |

**Product (authenticated)**

| Route | Page |
|---|---|
| `/dashboard/*` | Role-aware dashboard shell (see below) |
| `/community`, `/dashboard/community` | Community hub — live feed + category cards (`quiet-authority`); signed-in users use dashboard shell |
| `/community/:categoryId`, `/dashboard/community/:categoryId` | Pillar feed — filter, sort, inline comments |
| `/community/posts` | Mentor advice posts directory (separate from community posts) |
| `/profile`, `/settings` | Standalone profile + settings |
| `/booking/finalize` | Stripe finalize → Calendly scheduling |
| `/intake/:sessionId` | Pre-session AI intake |
| `/session/:sessionId/video` | WebRTC video room |
| `/meet/:slug` | Mentor permanent lobby |
| `/refs/:token` | Reference form for mentor verification |
| `/apply/mentor` | Voice-first mentor application (OpenAI Realtime) |
| `/onboarding/mentor` | Post-approval mentor profile wizard |

**Admin / internal**

| Route | Page |
|---|---|
| `/admin/verification` | Split-pane mentor application review |
| `/admin/blog` | Blog admin |
| `/blog/write` | Author blog editor |
| `/bridge-internal/*` | Dev portal (password-gated ops dashboard) |

### Dashboard (`/dashboard/*`)

Shared: home (now strip, next session, at-a-glance), sessions, profile, settings, notification panel, first-login onboarding modal, post-call review modal.

**Top bar (flat links):** logo returns to dashboard home; mentees see Mentors, Community, Sessions, Messages, Saved, Resume; mentors see Sessions, Messages, Community, Availability, Earnings, Reviews. `DashboardTopBar.jsx` + `dashboardNavModel.js`.

**Mentee-only:** saved mentors, browse mentors (embedded), mentor profile (embedded), resume review (embedded), messages, plan/pricing (embedded), billing, community at `/dashboard/community`.

**Mentor-only:** availability (Calendly connect + event type), earnings, reviews, profile health card, community at `/dashboard/community`.

Role is derived from auth metadata (`accountRole`) with an in-dashboard role toggle.

### Video call features (shipped)

Pre-join device preview, mic/camera toggle, screen share, in-call text chat with file attachments, collaborative whiteboard, session timer, connection quality indicators, end-call → review prompt. Signalling via Supabase Realtime channel `video:{sessionId}`. Mentor = caller (offer), mentee = callee (answer). No third-party video SDK.

### AI features (shipped)

| Feature | Provider | Limit |
|---|---|---|
| Mentor matching ranking | OpenAI GPT-4o-mini | 3 uses (`ai_usage`) |
| Resume review | Anthropic Claude Sonnet | 1 use |
| Intake call (voice) | OpenAI Realtime API (GA `client_secrets` via `api/realtime-session.js`) | Per session |
| Intake summary | OpenAI via `ai-proxy` | Per session |
| Resume → profile extract | OpenAI via `ai-proxy` | On upload |
| Mentor verification scoring | Server-side AI in `api/_lib/verification/` | Per application |

Client AI keys use `VITE_OPENAI_API_KEY` and `VITE_ANTHROPIC_API_KEY` (browser-exposed by design).

### Payments & subscriptions

- **Session booking:** `create-booking-checkout` → Stripe Checkout → `finalize-checkout` creates `sessions` row → Calendly widget for scheduling → `booking-confirm-scheduled` + Calendly webhook write `scheduled_date`.
- **Subscriptions:** `create-subscription-checkout` → Stripe Billing → status stored in `user_settings.settings`. One plan (monthly or annual) unlocks messaging, community, AI tools, and all platform features. 50% student discount auto-applied for `.edu` emails.

### Database (Supabase Postgres)

Core tables: `mentor_profiles`, `sessions`, `reviews`, `favorites`, `user_profiles`, `mentee_profiles`, `user_settings`, `ai_usage`, `mentor_conversations`, `mentor_messages`, `blog_posts`, `cancellation_requests`, `mentor_verification_runs`, `mentor_verification_steps`, `mentor_references`, `mentor_review_queue`, `admins`, `mentor_badges`, `mentor_posts`, `community_posts`, `community_post_upvotes`, `community_comments`.

RLS on all tables. **`mentor_profiles.id` ≠ `auth.users.id`** — always use profile UUID for mentor FKs. Review rating averages and community upvote/comment counts are maintained by Postgres triggers (not client-side).

**Community vs mentor posts:** `community_posts` powers the authenticated `/community` product feature. `mentor_posts` is short advice written by mentors on profiles and `/community/posts` — different tables, different UI.

Migrations live in `supabase/migrations/`. Recent expansion migrations: `20260525120000_mentor_categories.sql`, `20260525130000_mentor_value_stack.sql`, `20260525140000_community.sql`, `20260525150000_mentor_application.sql`, `20260525160000_community_enhancements.sql`.

### API (Vercel serverless — `api/`)

| Endpoint area | Files (12 functions total) |
|---|---|
| Auth helper | `_lib/auth.js` (JWT via Supabase) |
| Stripe | `create-booking-checkout`, `create-subscription-checkout`, `finalize-checkout`, `cancel-session` |
| Calendly | `calendly/[action]`, `calendly-webhook`, `booking-confirm-scheduled` |
| AI | `realtime-session`, `ai-proxy` (`mentor_tag`, matching, intake, resume) |
| Verification | `verification/[action]`, `admin/review/[action]` (includes `mentor-flags`) |
| Utils | `utils/[action]` (user lookup, room slug, cron, dev portal) |

Community CRUD goes through **direct Supabase client queries** (`client/src/api/community.js`) — no serverless function; RLS handles auth. **12 serverless functions max** on Hobby — see `api/` inventory below.

All protected routes require `Authorization: Bearer <supabase_jwt>`.

### Design system

Three route-driven palettes: `modern-signal`, `grounded-guidance`, `quiet-authority`. Each has light + dark variants via `appearance.css` tokens (`--bridge-*`, `--color-primary`). Dashboard uses cinematic aurora backgrounds. Landing has its own scoped palette CSS.

### Not yet shipped / partial

| Item | Notes |
|---|---|
| Legacy 9-step verification wizard UI | Replaced by voice-first `/apply/mentor`; backend verification pipeline + admin panel + reference form still exist |
| Google Calendar | Removed in favor of Calendly; some legacy DB columns/copy may remain |
| Social OAuth (Google/GitHub sign-in) | UI placeholders only |
| Push notifications | Settings toggles exist; no push delivery |
| Mentor open applications | FAQ says invitation-only; DevPortal has mentor queue for ops |
| `client/src/api/client.js` (Axios) | Dead code — direct Supabase + fetch used instead |
| Cancellation API in production | `cancellation_requests` table exists; Vercel endpoint may 404 — see `client/src/api/cancellations.js` |

### Critical rules (do not break)

1. `getMentorById(id)` queries `mentor_profiles.id` (profile UUID), returns `{ mentor, reviews }`.
2. `SESSION_TYPES` source of truth: `client/src/constants/sessionTypes.js` — four keys only: `career_advice`, `interview_prep`, `resume_review`, `networking`.
3. Supabase client singleton: always import from `client/src/api/supabase.js`.
4. Never expose `SUPABASE_SERVICE_ROLE_KEY` or `JWT_SECRET` to the client.
5. Production API = `api/` only; `server/` is local dev.

---

## Features

- **Mentor discovery** — filterable directory with session rates, availability indicators, and AI-powered goal-based matching
- **Mentor application & onboarding** — voice-first application at `/apply/mentor` (OpenAI Realtime) → admin review → 5-step profile wizard at `/onboarding/mentor`; tiers and rates assigned server-side by a scoring algorithm
- **Community** — authenticated hub at `/dashboard/community` (aliases from `/community`) with live feed and category sub-communities; questions, wins, discussions, and resources with upvotes and flat comments; active mentors get a trust badge
- **Grouped navigation** — guest marketing nav: **Company** + **Resources** dropdowns, flat **How it works** / **Pricing** / **Become a mentor**, **Browse mentors** CTA → `/mentors`; signed-in mentees: **Dashboard** + Discover / Tools / Company; mentors: **Dashboard** + Company + flat Community / Pricing. `/how-it-works` also in footer **Platform** and landing. Dashboard uses flat `DashboardTopBar` links (underline chrome, not pills).
- **Mentor value stack** — impact stats, earned badges, short advice posts on profiles, session action items, featured mentor spotlight
- **Admin review panel** — approve or reject mentor applications at `/admin`, with scoring breakdowns
- **Session booking** — Stripe Checkout (price locked server-side); Calendly integration for scheduling (OAuth, embedded widget, webhook)
- **AI intake call** — voice-driven pre-session intake via the OpenAI Realtime API; answers surfaced to the mentor on their dashboard
- **Live video sessions** — peer-to-peer WebRTC video with mic/camera toggle, screen share, in-call chat, collaborative whiteboard, and session timer; no third-party video SDK
- **AI resume review** — PDF upload to Supabase Storage + Claude analysis with section-by-section scoring and improvement suggestions
- **Mentee subscription** — one plan (monthly $29 or annual $19/mo) via Stripe Billing; unlocks messaging, community, and AI tools; 50% student discount auto-applied for `.edu` emails; mentor sessions are always free
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
| Scheduling | Calendly (OAuth, embedded widget, webhook) |
| Video | Native browser WebRTC + Supabase Realtime (signalling) |
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
│       ├── components/     # Shared UI (Navbar, DashboardTopBar, nav/ menus)
│       │   └── nav/        # mainNavModel, NavMenus, navChrome, dashboardNavModel
│       ├── context/        # AuthContext + useAuth hook
│       ├── pages/          # Route-level page components
│       │   ├── how-it-works/  # index (hero), HowItWorksSteps, HowItWorksContrast, howItWorksData
│       │   ├── landing/       # HeroSection, WaitlistSection, FAQSection, landingData
│       │   ├── footer/        # FAQ (sticky section nav), Help, Contact, Trust, legal
│       │   └── community/  # CommunityHub, CommunityCategory, communityShared
│       ├── constants/      # sessionTypes.js, mentorshipCategories.js
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
- Calendly developer account (OAuth app for mentor scheduling)
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
| `community_posts` | Community feed posts (category, type, upvotes, comment_count) |
| `community_post_upvotes` | Per-user upvotes; trigger syncs `community_posts.upvotes` |
| `community_comments` | Flat comments on community posts; trigger syncs `comment_count` |
| `mentor_badges` | Earned mentor badges (trigger-awarded) |
| `mentor_posts` | Short mentor advice posts (profile/directory — not community) |

RLS is enabled on all tables. Row-level policies restrict reads and writes to authenticated owners except where public access is explicitly granted (e.g. mentor profile reads, community read).

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
