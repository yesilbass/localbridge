# Bridge — Architecture

Bridge is a paid mentorship marketplace: job seekers book one-on-one video sessions with
vetted industry professionals, with AI-assisted matching, an OpenAI Realtime intake call,
Stripe payments, Calendly scheduling, and a built-in WebRTC video room.

This document covers the end-to-end system architecture — how every major layer is
structured, why key decisions were made, and what to know before touching each area.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Deployment & Hosting](#2-deployment--hosting)
3. [Frontend](#3-frontend)
4. [API Layer](#4-api-layer)
5. [Database](#5-database)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Payments — Stripe](#7-payments--stripe)
8. [Video Calls — WebRTC](#8-video-calls--webrtc)
9. [AI Features](#9-ai-features)
10. [Calendly Integration](#10-calendly-integration)
11. [Mentor Onboarding Pipeline](#11-mentor-onboarding-pipeline)
12. [Community](#12-community)
13. [Storage](#13-storage)
14. [Design System](#14-design-system)
15. [Local Development](#15-local-development)
16. [Key Constraints & Non-Obvious Decisions](#16-key-constraints--non-obvious-decisions)

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (user)                          │
│              React 19 + Vite 8 + Tailwind CSS v4                │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
          ┌──────────────────┴──────────────────┐
          │                                     │
          ▼                                     ▼
┌─────────────────────┐             ┌──────────────────────────────┐
│  Vercel Serverless  │             │    Supabase (managed cloud)  │
│  Functions /api/*   │             │                              │
│                     │             │  ┌──────────────────────┐    │
│  JWT auth on all    │◄────────────┤  │ Postgres + RLS       │    │
│  protected routes   │  SQL via    │  │ Auth (JWTs)          │    │
│                     │  supabase-js│  │ Realtime (WebSockets)│    │
│  _lib/              │             │  │ Storage (resumes,     │    │
│   auth.js           │             │  │  mentor-avatars)     │    │
│   allowedOrigins.js │             │  └──────────────────────┘    │
│   calendly.js       │             └──────────────────────────────┘
└──────────┬──────────┘
           │ HTTPS
    ┌──────┴────────────────────────────────┐
    │          Third-party services         │
    │                                       │
    │  Stripe          (payments)           │
    │  Calendly        (mentor scheduling)  │
    │  OpenAI          (matching, intake,   │
    │                   mentor application) │
    │  Anthropic Claude (resume review)     │
    └───────────────────────────────────────┘
```

**Request flow (typical authenticated action):**

1. Browser sends a request with a `Bearer <JWT>` header to `/api/<endpoint>`.
2. The Vercel Function runs `api/_lib/auth.js` which verifies the JWT (using
   `SUPABASE_SERVICE_ROLE_KEY` to call Supabase Auth's `getUser`).
3. After auth passes, the function performs a Supabase DB query (using the service role
   client — bypasses RLS for server-side trust) or calls a third-party API.
4. Response returned to the browser.

Supabase Auth also issues JWTs directly to the browser for client-side queries, where
RLS policies provide the authorization layer.

---

## 2. Deployment & Hosting

### Vercel

Everything runs on Vercel:

- **Frontend**: Static build output from `client/dist/` — Vite builds the React SPA,
  Vercel serves it from the CDN edge.
- **API**: Files in `api/*.js` are deployed as individual Vercel Serverless Functions
  (Node.js runtime). Each file = one endpoint.
- **Routing**: `vercel.json` maps `/api/*` requests to their matching function and
  falls back to `client/dist/index.html` for all other paths (SPA fallback).

Auto-deploy triggers on every push to `main`. Preview deployments are created for PRs.

### `vercel.json` structure

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/client/dist/index.html" }
  ]
}
```

### Why Vercel Functions instead of the Express server in production?

The `server/` directory (Express 5) exists for **local development only**. It mirrors
the API surface of the Vercel Functions so the team can develop without deploying. In
production, only the `api/` directory is served — there is no persistent Express process.
This means every API request in production is stateless and cold-starts on each
invocation. Do not rely on in-memory state between requests.

---

## 3. Frontend

### Stack

| Concern | Choice |
|---------|--------|
| UI library | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (CSS-first, no config file) |
| Routing | react-router-dom v7 |
| Animation | motion/react (Framer Motion API), GSAP (scroll), Three.js + React Three Fiber (3D) |
| HTTP (legacy) | Axios (via `client/src/api/client.js` — mostly superseded by direct Supabase calls) |

### Routing

All routes are defined in `client/src/App.jsx` (or the main router file). The SPA
fallback in `vercel.json` ensures that direct URL navigation and browser refresh work
for all client-side routes.

Key routes:

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `Landing.jsx` | Public |
| `/mentors` | `Mentors.jsx` | Public browse |
| `/mentor/:id` | `MentorProfile.jsx` | `id` = `mentor_profiles.id` (profile UUID) |
| `/dashboard` | `Dashboard.jsx` | Auth required — routes to mentee or mentor view |
| `/dashboard/community` | `CommunityHub.jsx` | Auth — primary community shell |
| `/dashboard/community/:categoryId` | `CommunityCategory.jsx` | Auth — pillar feed |
| `/community`, `/community/:categoryId` | `CommunityEntryGate` | Redirect to dashboard when signed in |
| `/become-a-mentor` | `BecomeMentor.jsx` | Public marketing |
| `/apply/mentor` | `MentorApplication.jsx` | Voice-first mentor application |
| `/onboarding/mentor` | `MentorOnboardingFlow.jsx` | Post-approval profile wizard |
| `/session/:sessionId/video` | `VideoCall.jsx` | Auth required |
| `/intake/:sessionId` | `IntakeCall.jsx` | Auth required |
| `/admin/verification` | Admin panel | Admin role required |
| `/resume` | `ResumeReview.jsx` | Public (embedded in dashboard for mentees) |

### Navigation chrome

Two shells — do not conflate:

| Shell | Component | When shown |
|-------|-----------|------------|
| Marketing / product | `Navbar.jsx` + `components/nav/*` | All routes except `/dashboard/*`, video, auth pages |
| Dashboard | `DashboardTopBar.jsx` + `dashboardNavModel.js` | `/dashboard/*` only |

**Marketing nav** (`mainNavModel.js`): grouped dropdowns with flat underline active state (`navChrome.js`) — no pill bubbles.

| Role | Primary | Dropdowns | Flat links | CTA |
|------|---------|-----------|------------|-----|
| Guest | — | **Company** → About Bridge, Trust & safety; **Resources** → FAQ, Help, Contact | How it works, Pricing, Become a mentor | **Browse mentors** → `/mentors` (in `Navbar.jsx`) |
| Signed-in mentee | Dashboard | **Discover** → Mentors, Community; **Tools** → Resume review; **Company** → full company set (About, Blog, Careers, FAQ, Contact, Trust) | Pricing | — |
| Mentor | Dashboard | **Company** (full set) | Community, Pricing | — |

`/how-it-works` is a guest flat link (not inside dropdowns). Also reachable via footer **Platform → How it works**, landing sections, or direct URL. `/mentors` is public without login; booking still requires auth.

**Footer** (`Footer.jsx`): newsletter + **Company**, **Resources**, **Platform** (Browse mentors, How it works, AI matching), **Tools**, and **Explore** (browse + four mentorship category query links — not the legacy four session-type labels).

**Auth routing** (`authNav.js`): `resolveAuthEntryPath()` sends signed-in users from `/mentors`, `/resume`, `/pricing`, `/community`, etc. to dashboard equivalents. `presentAsMarketingGuest()` is `!user` — logged-in users always see authenticated chrome on public URLs.

**Dashboard nav** (`DashboardTopBar.jsx`): flat top-bar links (no dropdowns). Logo → `/dashboard` (no separate Dashboard tab). Mentee links: Mentors, Community, Sessions, Messages, Saved, Resume. Mentor links: Sessions, Messages, Community, Availability, Earnings, Reviews.

### State Management

There is no global state library (no Redux, no Zustand). State is managed through:

- **`AuthContext`** (`client/src/context/`) — the single global context. Provides
  `user`, `session`, `profile`, `isMentor`, `signIn`, `signOut`. Wraps the entire app.
- **`useAuth()`** hook — consumed everywhere auth state is needed.
- **Local component state** — `useState` / `useReducer` for all UI-local state.
- **Server state** — fetched on mount via Supabase calls in `client/src/api/`. No
  caching layer (no React Query, no SWR) — data is re-fetched per component mount.

### Data Modules (`client/src/api/`)

Each file owns one domain. They call Supabase directly or hit `/api/*` endpoints:

| File | Domain |
|------|--------|
| `supabase.js` | Supabase client singleton — import from here everywhere |
| `mentors.js` | Mentor discovery, profile fetch, featured mentors |
| `sessions.js` | Create, fetch, status updates, accept/decline |
| `reviews.js` | Create review, fetch reviews for a mentor |
| `favorites.js` | Add/remove/list favorites |
| `menteeProfile.js` | AI onboarding output (mentee_profiles table) |
| `verification.js` | Mentor application submit + profile fetch; onboarding wizard writes `mentor_profiles` directly |
| `calendly.js` | Calendly OAuth, event types, availability |
| `community.js` | Community posts, upvotes, comments (direct Supabase — no API layer) |
| `mentorPosts.js` | Mentor advice posts (profile/directory — separate from community) |
| `mentorBadges.js` | Mentor badge fetch |
| `tagMentorCategories.js` | AI category tagging via `ai-proxy` |
| `verification.js` | Mentor application submit, profile row fetch |
| `stripe.js` | Create booking checkout, create subscription checkout |
| `ai.js` | Direct Anthropic SDK wrapper |
| `aiMatching.js` | OpenAI mentor ranking from mentee profile |
| `aiResumeReview.js` | Claude resume analysis |
| `aiUsage.js` | Per-user AI feature usage tracking and limits |
| `resumeStorage.js` | Supabase Storage upload/delete/signed URL for resumes |
| `cancellations.js` | Session cancellation requests |

### Design System

See [Section 14 — Design System](#14-design-system).

---

## 4. API Layer

### Vercel Functions (`api/`)

Each file in `api/` is an independent serverless function:

```
api/
├── _lib/
│   ├── auth.js              # verifyToken(req) — JWT verification helper
│   ├── allowedOrigins.js    # CORS allowlist + applyCors() helper
│   ├── calendly.js          # Calendly OAuth + API helpers
│   └── verification/        # Scoring, orchestrator, AI evaluators
├── admin/
│   └── review/[action].js   # list, detail, decide, mentor-flags
├── calendly/[action].js     # OAuth callback, event types, disconnect
├── calendly-webhook.js      # Calendly scheduling webhooks
├── verification/[action].js # Mentor application + verification pipeline
├── ai-proxy.js              # OpenAI/Anthropic proxy (matching, resume, mentor_tag)
├── booking-confirm-scheduled.js
├── cancel-session.js
├── create-booking-checkout.js
├── create-subscription-checkout.js
├── finalize-checkout.js
├── realtime-session.js      # Ephemeral OpenAI Realtime key (intake + mentor application)
└── utils/[action].js        # user-names, mentor-room-slug, cron, dev portal, checkr-webhook
```

**Exactly 12 serverless functions** (Hobby limit). Mentor category tagging uses `ai-proxy` action `mentor_tag` — not a separate function. Community uses direct Supabase client queries — no function.

### Auth on Every Protected Endpoint

All endpoints that touch user data, payments, or AI features follow this pattern:

```js
import { verifyToken } from './_lib/auth.js';
import { applyCors } from './_lib/allowedOrigins.js';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { user, error } = await verifyToken(req);
  if (error) return res.status(401).json({ error: 'Unauthorized' });

  // ... handler logic using user.id
}
```

`verifyToken` extracts the `Authorization: Bearer <jwt>` header and calls Supabase
Auth's `getUser()` to validate it. The user's `id` from the token is used for all
ownership checks — never trust a userId from the request body.

### CORS

`api/_lib/allowedOrigins.js` maintains the allowlist: the production Vercel domain and
`http://localhost:5173` for local dev. No wildcard origins. `applyCors()` is called at
the top of every function handler.

### Local Dev — Express Server (`server/`)

The `server/` directory is an Express 5 application that mirrors the `/api` surface
locally. It exists because Vercel CLI's `vercel dev` has limitations and a persistent
dev server is easier to work with. The Express routes in `server/routes/` are kept in
sync with the logic in `api/`. When modifying an API endpoint, update both.

---

## 5. Database

### Supabase (Postgres)

All persistent data lives in a single Supabase Postgres project. The schema is
versioned in `supabase/migrations/`. Apply changes with `supabase db push`.

### Core Tables

#### `mentor_profiles`

The central table for the mentor side of the platform.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | **PK — not the same as `auth.users.id`** |
| `user_id` | uuid | Soft FK → `auth.users` (no DB constraint, allows seeded data) |
| `mentor_status` | text | `null`/`active` = visible; `pending`/`under_review` = waiting; `rejected` = can reapply |
| `tier` | text | `rising`, `professional`, `senior`, `elite` — assigned server-side |
| `session_rate` | integer | USD cents — assigned server-side, not editable by mentor |
| `rating` | decimal(4,2) | **Maintained by Postgres trigger — never compute client-side** |
| `total_sessions` | int | Maintained by trigger |
| `expertise` | jsonb | Array of skill strings |
| `availability_schedule` | jsonb | Legacy weekly schedule (Calendly is primary scheduling) |
| `mentorship_description` | text | Free-text mentorship focus; AI-tagged into pillars |
| `mentorship_categories` | jsonb | AI-derived pillar IDs (service-role write only) |
| `why_i_mentor` | text | Public motivation statement |
| `onboarding_step` | int | Post-approval wizard progress (0–5) |
| `is_featured` | boolean | Admin spotlight toggle |

**Critical**: `mentor_profiles.id` and `auth.users.id` are different UUIDs. A mentor
has both a Supabase Auth account (`auth.users.id`) and a mentor profile row
(`mentor_profiles.id`). Always use the profile `id` when querying sessions, reviews,
or displaying mentor data. Use `user_id` only when linking a profile to its auth account.

#### `sessions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `mentee_id` | uuid | FK → `auth.users` |
| `mentor_id` | uuid | FK → `mentor_profiles.id` |
| `status` | text | `pending` → `accepted` / `declined`; `accepted` → `completed` / `cancelled` |
| `video_room_url` | text | Set to `bridge-{sessionId}` on accept. Truthy = "Join Call" visible |
| `session_type` | text | One of the four session type keys |

#### `reviews`

Ratings are written here by mentees after a session. A Postgres trigger (AFTER INSERT
OR UPDATE OR DELETE) recalculates `mentor_profiles.rating` as the AVG of all reviews
for that mentor. **The client never updates `mentor_profiles.rating` directly** — RLS
blocks it and concurrent inserts would race.

#### `user_profiles`

Stores mentee personal info, experience, education, skills, and achievements as jsonb.
Updated via the Profile page.

#### `mentee_profiles`

Stores AI onboarding output: `target_role`, `target_industry`, `top_goals`,
`session_types_needed`, etc. Written by the AI Mentor Match Wizard. Used by the
AI matching feature to rank mentors.

#### `ai_usage`

Tracks per-user AI feature consumption to enforce limits:
- `resume_review` — limit 1 per user
- `mentor_match` — limit 3 per user

#### `favorites`

Simple join table: `user_id` + `mentor_id`, with a `UNIQUE` constraint. Toggle via
`addToFavorites` / `removeFromFavorites` in `client/src/api/favorites.js`.

#### `community_posts` / `community_post_upvotes` / `community_comments`

Authenticated community product at `/community`. Organized around career-focused categories
(from `shared/mentorshipCategories.js`). Post types: `question`, `win`, `discussion`,
`resource`. Upvote and comment counts are maintained by Postgres triggers — never
updated client-side.

**Not the same as `mentor_posts`** — short advice written by mentors on profiles and
the `/community/posts` directory.

#### `mentor_posts` / `mentor_badges`

Mentor value stack: advice posts and earned badges on mentor profiles. Separate tables,
separate UI from community.

### Row Level Security (RLS)

RLS is enabled on all user-owned tables. Key policies:

| Table | Rule |
|-------|------|
| `mentor_profiles` | SELECT: public (anyone can read). INSERT/UPDATE: own `user_id` only. |
| `sessions` | SELECT: mentee or mentor (via `mentor_profiles` join). INSERT: authenticated mentees. UPDATE: mentor only. Mentee can cancel own. |
| `reviews` | SELECT: public. INSERT: authenticated. DELETE: own reviewer only. |
| `favorites` | SELECT/INSERT/DELETE: own `user_id` only. |
| `user_profiles` | SELECT/INSERT/UPDATE: own `user_id` only. |
| `mentee_profiles` | Own `user_id` only. |
| `ai_usage` | Own `user_id` only. |
| `community_posts` | SELECT: public. INSERT: own `author_id`. DELETE: own only. |
| `community_post_upvotes` | SELECT: public. INSERT/DELETE: own `user_id`. |
| `community_comments` | SELECT: public. INSERT: own `author_id`. DELETE: own only. |

Silent write failures (no error thrown, zero rows affected) almost always indicate a
missing or incorrect RLS policy.

---

## 6. Authentication & Authorization

### Supabase Auth

Supabase Auth handles the entire auth lifecycle:

- Sign up with email + password → Supabase creates a row in `auth.users`
- Sign in → Supabase issues a JWT (`access_token`) and a refresh token
- Token refresh → handled automatically by the Supabase JS client
- Sign out → tokens revoked

The Supabase JS client on the frontend (`client/src/api/supabase.js`) persists the
session in `localStorage` and exposes `supabase.auth.onAuthStateChange()` which
`AuthContext` subscribes to.

### Role Detection

There is no separate `roles` table. A user is considered a mentor if they have a
`mentor_profiles` row where `user_id` matches their auth UID. `AuthContext` performs
this check on login and exposes `isMentor` to the rest of the app.

### JWT Flow (API requests)

1. `AuthContext` holds the current Supabase `session.access_token`.
2. Client-side API modules pull the token from Supabase:
   ```js
   const { data: { session } } = await supabase.auth.getSession();
   const token = session.access_token;
   ```
3. Requests to `/api/*` include `Authorization: Bearer <token>`.
4. The Vercel Function calls `verifyToken(req)` → Supabase Auth `getUser(token)` →
   returns the verified user. If invalid or expired, returns 401.

---

## 7. Payments — Stripe

### Booking Flow (one-time session)

```
User clicks "Book" on mentor profile
        │
        ▼
POST /api/create-booking-checkout
  - JWT verified → user confirmed
  - Session rate looked up server-side from mentor_profiles
  - Stripe Checkout Session created (price locked server-side)
  - Returns { url } for redirect
        │
        ▼
User completes Stripe Checkout
        │
        ▼
Stripe redirects to /success?session_id=...
        │
        ▼
POST /api/finalize-checkout
  - JWT verified
  - Stripe session confirmed (payment_status === 'paid')
  - Bridge session row created in Supabase (status: 'pending')
  - User schedules via embedded Calendly widget on `/booking/finalize`
```

**Price lock**: The session price is fetched from `mentor_profiles.session_rate` on
the server in `create-booking-checkout.js`. The client cannot pass or modify the price.
This closes the price manipulation vector.

### Subscription Flow (mentee plan)

Bridge has a single subscription plan for mentees — available as monthly ($29/mo) or
annual ($19/mo equivalent, billed as $228/year). Subscriptions are created via
`/api/create-subscription-checkout.js`. The plan unlocks messaging, community access,
AI tools (mentor matching, resume review), and all platform features. Mentor sessions
themselves are always free (mentors volunteer). Pricing is enforced server-side only.
Student discount (50% off forever) is auto-applied for `.edu` email addresses.
Subscription status is stored in `user_settings.settings` (Stripe subscription ID,
plan, trial dates, renewal date). Mentors do not subscribe — they are never shown the
pricing page.

### Client-side

`client/src/api/stripe.js` calls both checkout endpoints with `Authorization` headers.
The client receives a Stripe Checkout URL and redirects — it never handles card data
directly.

---

## 8. Video Calls — WebRTC

Bridge uses native browser WebRTC APIs for peer-to-peer video. No third-party video
SDK (no Jitsi, no Daily, no Twilio Video).

### Architecture

```
Mentor (caller)              Supabase Realtime               Mentee (callee)
     │                      channel: video:{sessionId}             │
     │── offer ─────────────────────────────────────────────────► │
     │                                                             │
     │ ◄─────────────────────────────────────────────── answer ───│
     │                                                             │
     │── ICE candidates ◄──────────────────────────── ICE candidates
     │                                                             │
     └─────────── direct peer-to-peer media stream ───────────────┘
```

**Signaling**: Supabase Realtime channel `video:{sessionId}` carries the SDP offer,
SDP answer, and ICE candidates between the two peers. Once the WebRTC connection is
established, all media flows directly between browsers — Supabase only carries the
handshake.

**Roles**: The mentor is always the caller (sends the offer). The mentee is always
the callee (sends the answer). This is enforced in `VideoCall.jsx` using `isMentor`.

**Room identifier**: `sessions.video_room_url` is set to `bridge-{sessionId}` when
the mentor accepts the session. Its truthy value is the signal to show the "Join Call"
button on the dashboard — the actual WebRTC room is determined by the `sessionId`.

**Features**: mic toggle, camera toggle, screen share, in-call text chat, collaborative
whiteboard, session timer.

**Component**: `client/src/pages/VideoCall.jsx`

---

## 9. AI Features

### Mentor Matching — OpenAI

**File**: `client/src/api/aiMatching.js`
**Model**: `gpt-4o-mini`
**Trigger**: User completes the AI Mentor Match Wizard (`MentorMatchWizard.jsx`)

Flow:
1. Wizard collects mentee goals, target role, industry, session types needed.
2. `getAIMatchedMentors()` fetches all available mentors from Supabase, builds a prompt
   with the mentee profile + mentor list, and asks OpenAI to rank and explain the top
   matches.
3. Returns a ranked list with personalized explanations displayed on the Mentors page.

**Usage limit**: 3 uses per user (tracked in `ai_usage` table).

### Resume Review — Claude

**File**: `client/src/api/aiResumeReview.js`
**Model**: `claude-sonnet-4-20250514` (via direct Anthropic SDK)
**Trigger**: User uploads a PDF on the Resume Review page

Flow:
1. PDF uploaded to Supabase Storage (`resumes` bucket) via `resumeStorage.js`.
2. Signed URL retrieved.
3. PDF contents + prompt sent to Claude for section-by-section analysis.
4. Structured JSON response rendered in `ResumeReview.jsx`.

**Usage limit**: 1 use per user (tracked in `ai_usage` table).

### Intake Call & Mentor Application — OpenAI Realtime (GA)

**Files**: `client/src/pages/IntakeCall.jsx`, `client/src/pages/MentorApplication.jsx`, `client/src/hooks/useRealtimeCall.js`, `api/realtime-session.js`
**Model**: `gpt-realtime-1.5` (voice via WebRTC)
**Triggers**: Pre-session intake (`sessionType` + `sessionId`); mentor application (`type: mentor_application`)

Flow:
1. Client `POST /api/realtime-session` with JWT and body (intake or mentor-application fields).
2. Server calls OpenAI **`POST /v1/realtime/client_secrets`** (GA API — not the deprecated beta `/v1/realtime/sessions` shape) and returns `{ client_secret: { value, expires_at } }`.
3. Client uses `client_secret.value` for WebRTC SDP exchange at `POST https://api.openai.com/v1/realtime?model=gpt-realtime-1.5`.
4. Voice interview runs with server-side instructions + optional tool calls (`complete_intake`, `complete_application`).
5. Usage tracked in `ai_usage` (`realtime_session` / `realtime_mentor_application` rate limits).

### i18n Auto-translation — OpenAI

**Model**: `gpt-4o-mini`
Partially wired — a subset of pages support language switching with AI-powered
translation cached in `localStorage`. Full coverage is a pending task.

### Cost Controls

- `aiUsage.js` enforces per-feature per-user limits before any AI call is made.
- Realtime API keys are ephemeral (short-lived, issued server-side) — the permanent
  key is never sent to the browser.

---

## 10. Calendly Integration

Mentors connect Calendly for scheduling after a mentee completes Stripe checkout.

### OAuth Flow

```
Mentor clicks "Connect Calendly" in dashboard
        │
        ▼
GET /api/calendly/auth (or local server mirror)
  - JWT verified, mentor ownership confirmed
  - Redirect to Calendly OAuth
        │
        ▼
Callback stores tokens + event type on mentor_profiles
        │
        ▼
Mentee schedules on /booking/finalize via embedded Calendly widget
        │
        ▼
Calendly webhook + booking-confirm-scheduled write scheduled_date to sessions
```

**Files**: `api/calendly/[action].js`, `api/calendly-webhook.js`,
`api/booking-confirm-scheduled.js`, `client/src/api/calendly.js`,
`client/src/components/CalendlyInlineWidget.jsx`

Google Calendar OAuth was removed; some legacy `google_refresh_token` columns may remain in older rows.

---

## 11. Mentor Onboarding Pipeline

New mentors go through a three-phase pipeline before appearing on the platform.

### Phase 1 — Application (`/become-a-mentor` → `/apply/mentor`)

Public marketing page leads to a **voice-first application** using the OpenAI Realtime API
(same ephemeral-key pattern as intake calls). The AI conducts a structured conversation and
calls `complete_application` to persist application data. On submit: `mentor_status` set
to `pending` / `under_review`. A legacy document-verification backend still exists
(`api/verification/`, reference tokens) but the primary client entry is the voice flow.

### Phase 2 — Admin Review (`/admin/verification`)

Admin sees pending applications with scoring breakdown. Approve or reject via
`POST /api/admin/review/[action]`:

- **Approve**: `mentor_status` → `active`. Application fields copied to profile. Tier/rate
  algorithm may run. User redirected to `/onboarding/mentor`.
- **Reject**: `mentor_status` → `rejected`. Mentor can re-apply.

### Phase 3 — Profile Completion (`/onboarding/mentor`)

5-step post-approval wizard: photo, bio, expertise, Calendly connect, review.
Progress stored in `mentor_profiles.onboarding_step`. Once complete, mentor appears in
directory (with `onboarding_complete` and active status).

### Visibility Logic

`getAllMentors()` filters by `onboarding_complete: true` and `mentor_status` in
`['active', null]`. Pending or rejected profiles are never shown publicly.

---

## 12. Community

Bridge Community is the between-sessions engagement layer. Auth required.
`/community` and `/community/:categoryId` redirect signed-in users to **`/dashboard/community`** via `CommunityEntryGate` (`client/src/components/routing/RouteGuards.jsx`). Unauthenticated users go to `/login?redirect=/community`.

### Data model

- **`community_posts`** — pillar `category_id`, `post_type`, title, body, denormalized
  `upvotes` and `comment_count`
- **`community_post_upvotes`** — unique per user/post; trigger syncs count
- **`community_comments`** — flat comments (no nesting); trigger syncs count

All CRUD via `client/src/api/community.js` direct to Supabase. Author enrichment joins
`user_profiles.personal_info` for display names and `mentor_profiles` (where
`mentor_status = 'active'`) for the **Mentor** badge.

### UI

| Route | Component | Notes |
|-------|-----------|-------|
| `/dashboard/community` | `CommunityHub.jsx` | Primary shell — live feed + category sidebar |
| `/dashboard/community/:categoryId` | `CommunityCategory.jsx` | Pillar feed, type filters, sort, inline comments |
| `/community`, `/community/:categoryId` | `CommunityEntryGate` | Redirect to dashboard routes when signed in |

Palette: `quiet-authority` (same as dashboard). Pillar IDs from `MENTORSHIP_CATEGORIES`.

**Separate feature:** `mentor_posts` at `/community/posts` and on mentor profiles — do not conflate.

---

## 13. Storage

### Supabase Storage

**`resumes` bucket** — private. RLS: files prefixed `{user_id}/`.

**`mentor-avatars` bucket** — public read. RLS: authenticated upload to `{user_id}/*`.
Created manually in Supabase dashboard (not via SQL migration).

**Operations** (via `client/src/api/resumeStorage.js`, `mentorAvatarStorage.js`):
- `uploadResumeFile(userId, file)` — uploads to `resumes/{userId}/{filename}`
- `getResumeSignedUrl(userId, filename)` — generates a short-lived signed URL
- `removeResumeFile(userId, filename)` — deletes the file

Resume files are uploaded for AI analysis (Resume Review feature) and as part of the
mentor verification application.

---

## 14. Design System

### Three Palettes

Bridge ships three complete design palettes, switchable per route:

| Palette | Identity | Primary use |
|---------|----------|-------------|
| `modern-signal` | Bold, high-contrast, electric blue | Landing, marketing |
| `grounded-guidance` | Warm, professional, earth tones | Mentor profiles, booking |
| `quiet-authority` | Minimal, cool-grey, understated | Dashboard, settings |

Each palette has a light and dark variant — 6 total themes.

**Source of truth**: `client/src/appearance.css` — all color tokens defined here as
CSS custom properties. Never hardcode a color anywhere in a component.

**Route switching**: `client/src/utils/routePalette.js` maps route patterns to palette
names. The palette is applied as a class on the `<html>` or `<body>` element.

### Tailwind v4

Bridge uses Tailwind CSS v4, which is CSS-first — there is no `tailwind.config.js`.
Custom utilities are defined with `@utility` in `client/src/index.css`. If you need
to add a custom utility, add it there.

### Animation Tiers

Heavy animations (Three.js 3D scenes, GSAP scroll sequences) are gated behind a
`perfTier` check. Low-end devices skip them. Always provide a `prefers-reduced-motion`
fallback for all motion.

---

## 15. Local Development

```bash
# Install all deps
npm install && cd client && npm install

# Start both servers (Express API + Vite dev server)
npm run dev
```

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001

The Express server (`server/`) reads from `server/.env`. The Vite dev server reads
from `client/.env.local`. Both files must be populated before `npm run dev` will work
fully.

Supabase is always the shared cloud project — there is no local Supabase instance in
standard use. All team members hit the same dev database.

---

## 16. Key Constraints & Non-Obvious Decisions

| Constraint | Why |
|-----------|-----|
| `mentor_profiles.id` ≠ `auth.users.id` | The mentor profile is a separate entity with its own UUID PK. `user_id` is the soft link to auth. This allows seeded demo mentors without corresponding auth accounts. |
| No client-side rating calculation | `mentor_profiles` UPDATE is RLS-restricted to the row's own user, so a mentee write would silently fail. Concurrent inserts would race. A Postgres trigger is the only correct solution. |
| Prices locked server-side | The session rate is read from `mentor_profiles.session_rate` on the server before creating the Stripe Checkout Session. The client cannot pass or influence the price — this closes the price manipulation attack vector. |
| Realtime API key never sent to client | `OPENAI_API_KEY` is server-only. Client `POST /api/realtime-session` → OpenAI GA `client_secrets` → ephemeral `client_secret.value` for WebRTC. |
| Nav stays under 12 functions | Grouped menus in `Navbar` + `DashboardTopBar`; product URLs map to dashboard via `client/src/utils/authNav.js` — no extra API routes. |
| Express dev server mirrors Vercel Functions | Vercel Functions are stateless and have a cold start. The Express server gives a better local dev experience while the `api/` files remain the production source of truth. Keep both in sync. |
| No direct pushes to `main` | Vercel auto-deploys every push to `main`. A broken push goes straight to production. PRs with peer review are the only gate. |
| Supabase singleton | A second Supabase client would create a separate auth session, breaking token sharing between the auth context and data modules. Always import from `client/src/api/supabase.js`. |
| Community has no API layer | Direct Supabase + RLS keeps Vercel at the 12-function limit. Do not add serverless functions for community CRUD. |
| `community_posts` ≠ `mentor_posts` | Community is the authenticated hub at `/community`. Mentor posts are short advice on profiles — different tables and UI. |
| `mentor_status: null` shows publicly | Seeded demo mentors have no `mentor_status`. The query treats `null` the same as `active` so demo data appears without requiring every seed row to be updated. Real mentors always go through the onboarding pipeline and receive an explicit `active` status. |
