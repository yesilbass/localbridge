# Bridge — CLAUDE.md

Mentorship platform connecting job seekers with established professionals. React + Vite frontend, Express ESM backend, Supabase (Postgres) database. Deployed on Vercel.

---

## 0. Always-on execution doctrine (read first, every turn)

Bridge is pre-revenue and pursuing seed approval. Every change ships demo-ready. The diff is part of the founder's narrative — tight, opinionated, confident. No `// TODO`, no `console.log`, no half-states. If a change cannot ship demo-ready in this turn, raise it as a follow-up rather than smuggle it into the diff.

### 0.1 Token discipline (non-negotiable)

- **Parallel by default.** Independent reads, greps, and tool calls fire in one turn, never sequentially. Sequential is only justified when step N's output feeds step N+1.
- **Read once, remember.** A file read in this conversation is not re-read unless edited or known-changed.
- **Scope the read.** For files > 1000 lines (`MentorProfile.jsx`, `Profile.jsx`, `VideoCall.jsx`, `Settings.jsx`, `MentorOnboardingFlow.jsx`), grep first, then `read_file` with `offset` + `limit`. No full-file reads on large files.
- **Use `code_search` for unknown territory.** Delegate first-pass exploration to the subagent — it's cheaper than searching in-context.
- **No speculative work.** No "fix while I'm here", no adjacent refactors, no rename-for-clarity. Speculative edits double the diff and the verification cost.
- **No scratch files.** No helper scripts, progress notes, or `.md` artifacts unless the user asks or the task spans sessions.
- **Climb the uncertainty ladder in order:** file map → grep → `code_search` → scoped `read_file` → ask the user. Skipping to "ask the user" wastes their time; skipping to full-file reads wastes tokens.

### 0.2 Output discipline

**Silent execution is the default.** Do the work, ship the diff, stop. No explanation of what changed, what was wrong, what was fixed, or what to do next — unless the user explicitly asks ("explain", "walk me through", "why", "summarize", etc.).

Default response shape after a code change:

```
[citation block(s) for the changed code — @/abs/path:start-end]
[Run this — only if the user MUST run something to see the change]
[Followups — only if a real risk was deferred and the user needs to know]
```

No prose paragraph. No "what changed and why". No recap. If the user wants context, they'll ask.

Exceptions where one short line is allowed:

- The edit failed or was partially applied (you must say so — silence here violates the verification contract).
- The user asked a question, not for a code change (answer the question).
- A blocking ambiguity stopped you from coding (one-line question, 2–4 options).

That is the entire response. Never:

- Restate the user's request before answering.
- Open with "Let me…", "I'll…", "Great idea!", "You're absolutely right!".
- Re-explain the same thing in three formats (prose + bullets + table).
- Add comments to code unless asked.
- Use emojis unless asked.
- Use filler ("as discussed", "as you can see", "hopefully this helps").

When **proposing** instead of executing: lead with the recommendation, one paragraph of reasoning max, one concrete next step.

### 0.3 Change verification contract (fixes "I changed it but nothing changed")

A change is only **claimed** if it was actually written. Specifically:

1. **Every change claim cites the file by absolute path and line range** (`@/Users/.../file.ext:start-end`). No claim without a citation.
2. **Every edit goes through `edit` / `multi_edit` / `write_to_file`** — never describe a change in prose alone and call it done.
3. **After an edit, the response identifies exactly what shipped**: which file, which lines, which symbol. If the edit failed, say so explicitly — do not silently move on.
4. **If the user reports "I don't see the change"**: re-read the file at the cited lines first to verify what's actually on disk, then report the truth. Never re-edit blindly.
5. **Multi-file changes list every file touched.** No hidden edits.

### 0.4 Skill composition (always-on signal)

This baseline applies to every prompt. Domain skills (`bridge-ui`, `bridge-web-design`, `bridge-motion`, `bridge-data-flow`, `bridge-debugging`, `bridge-cleanup`, `bridge-ai-features`, `bridge-transitions`, `bridge-layout`, `shipping-features`) compose on top — most non-trivial tasks fire two or three together. If a UI/design/motion task is in scope, treat the relevant skill's contract as binding even if the skill description didn't auto-trigger.

---

## Stack & Key Package Versions

| Layer | Package | Version |
|---|---|---|
| Frontend | react / react-dom | ^19.2.4 |
| Frontend | vite | ^8.0.1 |
| Frontend | tailwindcss | ^4.2.2 |
| Frontend | react-router-dom | ^7.14.1 |
| Frontend | @supabase/supabase-js | ^2.103.3 |
| Frontend | axios | ^1.15.0 |
| Frontend | googleapis | ^171.4.0 |
| Frontend | lucide-react | ^0.400.0 |
| Frontend | motion | ^12.38.0 |
| Backend | express | ^5.2.1 |
| Backend | @supabase/supabase-js | ^2.103.3 |
| Backend | jsonwebtoken | ^9.0.3 |
| Backend | bcrypt | ^6.0.0 |
| Backend | googleapis | ^171.4.0 |
| Backend | express-validator | ^7.3.2 |

---

## Database Schema (Supabase / Postgres)

### `mentor_profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK (NOT the same as auth.users id — see Critical Rules) |
| user_id | uuid | Loose FK → auth.users (no constraint, allows seeding) |
| name | text | required |
| email | text | |
| title, company, industry, bio | text | |
| years_experience | int | |
| expertise | jsonb | array, default `[]` |
| rating | decimal(4,2) | default 0 |
| total_sessions | int | default 0 |
| available | boolean | default true |
| image_url, linkedin_url, github_url, website_url | text | |
| availability_schedule | jsonb | `{"weekly":{"0":["09:00",...],...},"timezone":"UTC"}` |
| tier | text | |
| session_rate | integer | |
| mentorship_description | text | Required for mentors; AI-tagged into pillars |
| mentorship_categories | jsonb | AI-derived pillar IDs (service-role write only) |
| mentorship_subcategories | jsonb | AI-derived subcategory IDs |
| why_i_mentor | text | Public motivation statement |
| onboarding_step | int | Post-approval wizard progress (0–5) |
| is_featured | boolean | Admin spotlight toggle |
| expertise_search | text | generated: `lower(expertise::text)` stored |
| created_at | timestamptz | default now() |
**RLS**: SELECT public (anon), INSERT/UPDATE own user only.

### `sessions`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| mentee_id | uuid | FK → auth.users ON DELETE CASCADE |
| mentor_id | uuid | FK → mentor_profiles ON DELETE RESTRICT |
| session_type | text | enum: `career_advice` `interview_prep` `resume_review` `networking` |
| scheduled_date | timestamptz | |
| status | text | enum: `pending` `accepted` `declined` `completed` `cancelled` |
| message | text | |
| video_room_url | text | Room identifier: `bridge-{sessionId}` (set on accept; truthy = "Join Call" visible) |
| created_at | timestamptz | |
**RLS**: SELECT mentee or mentor (via mentor_profiles join). INSERT authenticated mentees. UPDATE mentor only. Mentee can cancel own.

### `reviews`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| session_id | uuid | FK → sessions ON DELETE CASCADE |
| reviewer_id | uuid | FK → auth.users ON DELETE CASCADE |
| mentor_id | uuid | FK → mentor_profiles ON DELETE CASCADE |
| rating | int | CHECK 1–5 |
| comment | text | |
| created_at | timestamptz | |
**RLS**: SELECT public, INSERT authenticated, DELETE own.
**Rating trigger**: `update_mentor_rating()` recalculates `mentor_profiles.rating` on INSERT/UPDATE/DELETE. The client must NOT recalculate — RLS blocks direct mentor_profiles UPDATE from mentees.

### `favorites`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users ON DELETE CASCADE |
| mentor_id | uuid | FK → mentor_profiles ON DELETE CASCADE |
| created_at | timestamptz | |
**Constraint**: `UNIQUE(user_id, mentor_id)` **RLS**: SELECT/INSERT/DELETE own.

### `user_profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users, UNIQUE |
| personal_info | jsonb | default `{}` |
| experience, education, skills, achievements | jsonb | arrays, default `[]` |
| created_at / updated_at | timestamptz | auto-trigger on UPDATE |
**RLS**: SELECT/INSERT/UPDATE own.

### `user_settings`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users, UNIQUE |
| settings | jsonb | default `{}` |
| created_at / updated_at | timestamptz | |
**RLS**: SELECT/INSERT/UPDATE own.

### `mentee_profiles`
Stores AI onboarding output: `user_id`, `current_position`, `target_role`, `target_industry`, `years_experience`, `top_goals`, `session_types_needed`, `availability`, `bio_summary`, `updated_at`. RLS: own only.

### `ai_usage`
Tracks per-user AI feature consumption: `user_id`, `feature` (`resume_review` limit 1, `mentor_match` limit 3). See `client/src/api/aiUsage.js`.

### `community_posts` / `community_post_upvotes` / `community_comments`
Community product at `/community`. Pillar `category_id`, post types `question|win|discussion|resource`. Denormalized `upvotes` and `comment_count` maintained by triggers. **Not the same as `mentor_posts`.**

### `mentor_posts` / `mentor_badges`
Mentor value stack — short advice posts and earned badges on mentor profiles.

### Storage
Buckets: `resumes` (private), `mentor-avatars` (public read; create manually in Supabase dashboard). RLS: authenticated user can CRUD files prefixed `{user_id}/`.

---

## Critical Technical Rules

1. **`mentor_profiles.id` ≠ `auth.users.id`** — The mentor profile row has its own UUID PK. `user_id` column is the soft link to auth. Never use `auth.uid()` where a `mentor_profiles.id` (profile UUID) is expected.

2. **`getMentorById(mentorProfileId)` shape** — Queries `mentor_profiles` by `id` (not `user_id`). Returns `{ mentor, reviews: { count: total_sessions, average: rating } }` or `{ data: null, error }`. Callers must destructure `mentor`, not `data`.

3. **`SESSION_TYPES` source of truth** — Defined in `client/src/constants/sessionTypes.js`. Four keys exactly: `career_advice`, `interview_prep`, `resume_review`, `networking`. Server-side validation in `server/routes/sessions.js` mirrors this list. Never add a session type on only one side.

4. **`VITE_` prefix required** — All client-side env vars must be prefixed `VITE_` and accessed via `import.meta.env.VITE_*`. Never use `process.env` in client code.

5. **Never expose server secrets to the client** — `SUPABASE_SERVICE_ROLE_KEY` and `JWT_SECRET` are server-only. Client uses only `VITE_SUPABASE_ANON_KEY`.

6. **Supabase client singleton** — Always import from `client/src/api/supabase.js`. Never instantiate a second client.

7. **AI keys in client env** — `VITE_ANTHROPIC_API_KEY` and `VITE_OPENAI_API_KEY` are used directly in client code (not proxied). Be aware of exposure in browser builds.

8. **Video rooms** — Custom WebRTC video call at `/session/:sessionId/video`. Signaling via Supabase Realtime channel `video:{sessionId}`. Mentor = caller (sends offer), mentee = callee (sends answer). `video_room_url` is set to `bridge-{sessionId}` on accept (truthy flag to show "Join Call").

9. **Calendly scheduling** — Mentors connect Calendly via `client/src/api/calendly.js` and `api/calendly/`. Post-checkout scheduling uses embedded Calendly widget on `/booking/finalize`. Google Calendar was removed.

10. **Community = direct Supabase** — All community CRUD in `client/src/api/community.js`. No Vercel serverless function (12-function limit). RLS handles auth.

11. **Community posts ≠ mentor posts** — `community_posts` powers `/dashboard/community` (and `/community` redirect). `mentor_posts` is short mentor advice on profiles and `/community/posts`.

12. **Navigation** — Marketing: `Navbar.jsx` + `components/nav/` (`mainNavModel.js`, flat `navChrome.js`). Guest dropdowns: **Discover** (Find mentors), **Tools** (Resume review), **Company** (About Bridge, Blog, Careers, FAQ, Contact, Trust); flat **Pricing** + **Become a mentor**. Signed-in mentees: **Dashboard** + Discover (Mentors, Community), Tools, Company; flat **Pricing**. Mentors: **Dashboard**, **Company**, flat Community + Pricing. `/how-it-works` is not in navbar dropdowns — footer Platform column + landing links only. Dashboard: `DashboardTopBar.jsx` + `dashboardNavModel.js`. URL aliasing: `authNav.js` (`resolveAuthEntryPath`, `dashboardProductPath`). Extend the nav models; no flat link sprawl.

13. **Realtime sessions** — `POST /api/realtime-session` → OpenAI GA `POST /v1/realtime/client_secrets` (not beta `/v1/realtime/sessions`). Client uses `client_secret.value` in `useRealtimeCall.js`.

---

## Frontend File Map

### `client/src/api/`
| File | Purpose |
|---|---|
| supabase.js | Supabase client singleton (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY) |
| client.js | Axios instance → http://localhost:3001/api with JWT interceptor |
| mentors.js | getMentorById, getAllMentors (search/filter/sort), getFeaturedMentors, getIndustries |
| sessions.js | createSession, getMySession, updateSessionStatus, acceptSession (sets Jitsi URL) |
| reviews.js | createReview, getReviewsForMentor |
| favorites.js | getMyFavorites, toggleFavorite, addToFavorites, removeFromFavorites |
| menteeProfile.js | getMenteeProfile, upsertMenteeProfile, deleteMenteeProfile |
| mentorOnboarding.js | Mentor onboarding CRUD against mentor_profiles |
| calendly.js | Calendly OAuth, event types, availability |
| community.js | Community posts, upvotes, comments (direct Supabase) |
| mentorPosts.js | Mentor advice posts (separate from community) |
| mentorBadges.js | Mentor badge fetch |
| tagMentorCategories.js | AI pillar tagging via ai-proxy |
| verification.js | Mentor application submit, profile fetch |
| mentorAvatarStorage.js | mentor-avatars bucket upload |
| ai.js | callClaude() + callAIProxy() |
| aiMatching.js | getAIMatchedMentors() — OpenAI-based mentor ranking from mentee profile |
| aiResumeReview.js | getAIResumeReview() — Claude-based resume analysis |
| aiUsage.js | getUsageCount, hasReachedLimit, recordUsage per feature |
| resumeReview.js | saveResumeReview(userId, reviewData) to Supabase |
| resumeStorage.js | uploadResumeFile, removeResumeFile, getResumeSignedUrl (resumes bucket) |
| mockMentors.js | Static mock mentor data for dev |
| supportEmail.js | Feedback/support email send |

### `client/src/components/`
| File | Purpose |
|---|---|
| Navbar.jsx | Marketing/product top bar (auth, scroll hide, mobile drawer) |
| DashboardTopBar.jsx | Dashboard shell nav — grouped dropdowns by role |
| nav/mainNavModel.js | Marketing nav structure (Discover / Tools / Company; `/how-it-works` not in dropdowns) |
| nav/NavMenus.jsx | Desktop dropdowns + mobile accordions |
| nav/navChrome.js | Shared flat link/menu class strings |
| nav/dashboardNavModel.js | Dashboard flat nav links (mentee/mentor sets); logo = home |
| nav/DashboardNavMenus.jsx | Dashboard dropdown UI |
| Footer.jsx | App footer — Company / Resources / Platform / Tools + **Explore** pillar links (`/mentors?category=*`); no fake mentor counts |
| LoadingSpinner.jsx | Reusable spinner |
| MentorAvatar.jsx | Mentor photo with fallback |
| SessionTypeCard.jsx | Card for career_advice / interview_prep / resume_review / networking |
| MentorMatchWizard.jsx | Multi-step AI mentor-matching form |
| OnboardingModal.jsx | Mentee first-login onboarding modal |
| MentorOnboardingBanner.jsx | Dashboard banner for incomplete mentor onboarding |
| CalendlyInlineWidget.jsx | Embedded Calendly scheduling widget |
| FeedbackFAB.jsx | Floating feedback button |
| FeedbackModal.jsx | Feedback submission form |
| BridgeGlobalAtmosphere.jsx | Global visual theme/atmosphere |
| PageGutterAtmosphere.jsx | Page gutter visual effect |
| MagneticPointer.jsx | Custom cursor animation |
| Reveal.jsx | Scroll-triggered reveal animation |
| ScrollProgress.jsx | Scroll progress bar |

### `client/src/pages/` (top-level)
| File | Purpose |
|---|---|
| Landing.jsx | Public home page |
| pages/how-it-works/ | `/how-it-works` — dual-track hero + steps (`howItWorksData.js`) |
| Login.jsx | Auth — sign in |
| Register.jsx | Auth — sign up |
| Mentors.jsx | Mentor browse + AI matching |
| MentorProfile.jsx | Individual mentor detail + booking |
| BecomeMentor.jsx | Mentor recruitment landing |
| MentorApplication.jsx | Voice-first mentor application (`/apply/mentor`) |
| MentorOnboardingFlow.jsx | Post-approval mentor profile wizard |
| ResumeReview.jsx | AI resume review interface |
| Profile.jsx | User profile page |
| Settings.jsx | User settings |
| VideoCall.jsx | Custom WebRTC video session (Supabase Realtime signaling) |
| About.jsx | About page |
| Pricing.jsx | Pricing tiers |

### `client/src/pages/dashboard/`
| File | Purpose |
|---|---|
| Dashboard.jsx | Container — routes to mentee or mentor view |
| MenteeDashboardContent.jsx | Sessions, favorites, history for mentees |
| MentorDashboardContent.jsx | Incoming requests, schedule, earnings for mentors |
| DashboardSettingsPanel.jsx | In-dashboard settings |
| MentorAvailabilityModal.jsx | Set/edit availability schedule |
| dashboardShared.jsx | Shared constants & utilities |
| dashboardUtils.js | SESSION_TYPE_MAP (type → icon + color metadata) |
| useDashboardData.js | Hook: fetches sessions, profile, reviews |

### `client/src/pages/community/`
| File | Purpose |
|---|---|
| CommunityHub.jsx | Live feed + 8 pillar sidebar (`/community`) |
| CommunityCategory.jsx | Pillar feed with filters, sort, comments |
| communityShared.jsx | Post cards, create form, mentor badge, post type pills |
| MentorPostsPage.jsx | Mentor advice posts directory (`/community/posts`) |

### `client/src/constants/`
| File | Purpose |
|---|---|
| sessionTypes.js | Four session type keys — source of truth |
| mentorshipCategories.js | Re-exports 8 pillars from `shared/mentorshipCategories.js` |

### `client/src/pages/footer/`
About, Blog, Careers, Contact, Cookies, FAQ, Help, Privacy, Terms, Trust — static informational pages. (Footer `Community.jsx` is marketing copy — not the product `/community` hub.)

---

## What's Fully Working

- Supabase auth (sign up, sign in, session persistence)
- Mentor discovery: browse, search, filter by industry, sort
- Mentor profile detail page with reviews
- Session booking (create, accept/decline, cancel, complete)
- Custom WebRTC video call rooms (peer-to-peer, no 3rd-party service)
- Favorites (add/remove/list)
- AI mentor matching (OpenAI ranking)
- AI resume review (Claude)
- AI onboarding wizard (mentee_profiles)
- Calendly OAuth + embedded scheduling widget
- Voice-first mentor application + post-approval onboarding wizard
- Community hub + pillar feeds (direct Supabase, quiet-authority palette)
- Mentor value stack (badges, mentor posts, impact stats, session action items)
- Mentorship category taxonomy + AI tagging
- Dashboard (mentee + mentor views)
- Resume upload/storage (Supabase bucket)
- 30 seeded mentor profiles across industries
- Landing, About, Pricing, footer static pages

---

## In Progress — Do Not Overwrite

| Branch | Owner | Work |
|---|---|---|
| `feature/dashboard` / `review/omar-dashboard` | **Omar** | Dashboard improvements — do not merge or rebase without coordination |
| `feature/review-system` | **Irshad** | Review system — do not touch `reviews` table logic or ReviewModal |
| `feature/sprint2-mentor-flow` | **Muaz** | Sprint 2 mentor onboarding + profile flow |

---

## Sprint 2 Goals

| Person | Goal |
|---|---|
| Muaz | Mentor profile flow polish, onboarding improvements, calendar integration hardening |
| Omar | Dashboard v2 — session management UI, mentor earnings view |
| Irshad | Review system — post-session review prompt, review display on mentor profile |

---

## Git Rules

- **No direct pushes to `main`** — all changes via PR
- **PRs required** for all feature work; at least one team member must review
- **No credentials in code** — no API keys, tokens, or passwords committed; use `.env` files (already in `.gitignore`)
- Branch naming: `feature/<name>` or `fix/<name>`
- Keep feature branches up to date with `main` via merge (not rebase unless agreed)
- Resolve merge conflicts before requesting review

---

## Environment Variables

### Server (`server/.env`)
```
PORT
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
STRIPE_SECRET_KEY
CALENDLY_CLIENT_ID
CALENDLY_CLIENT_SECRET
CALENDLY_REDIRECT_URI
CLIENT_URL
CLIENT_URL_PROD
```

### Client (`client/.env`)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SERVER_URL
VITE_ANTHROPIC_API_KEY
VITE_OPENAI_API_KEY
```
