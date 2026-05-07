---
name: bridge-context
description: >-
  Bridge project DNA + token discipline + output discipline. Loads stack,
  schema, file map, palette system, RLS rules, env vars, and the "do less,
  better" execution doctrine before any work. Use at the start of every
  Bridge task — feature work, bug fixes, refactors, design changes, AI
  features, mentor/session/review/payment flows, dashboard, video, calendar,
  data work, or anything touching the codebase. Use whenever the task is
  ambiguous, when efficiency matters, or when output quality must be
  investor-grade on the first pass.
---

# Bridge — operating context (load before any work)

This is the always-on amplifier. It frontloads what every Bridge task needs
so Claude does not re-discover the same facts repeatedly. It also enforces
the response and execution discipline that keeps token cost low while
quality stays at investor-pitch level.

For the matching domain skill, see Section 7. They compose: most tasks fire
two or three skills together.

---

## 1. Mission frame

Bridge is pre-revenue and pursuing seed approval. Two consequences:

- **Every change ships demo-ready.** No `// TODO`, no `console.log`, no half-states. The next investor walk-through could start now.
- **Output is pitch material.** The diff is part of the founder's narrative. Tight, opinionated, and confident — not exploratory or apologetic.

If a change cannot ship demo-ready in the same turn it is proposed, raise it
as a follow-up rather than smuggling it into the diff.

---

## 2. Stack (memorise — do not re-discover)

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 8 + Tailwind v4 (CSS-first, **no `tailwind.config.js`**) |
| Motion | `motion/react` (Framer-style API), GSAP for scroll-linked, R3F + Three for 3D |
| State | React hooks + `AuthContext` (`client/src/context/`) |
| Routing | `react-router-dom@7` |
| Backend | Express 5 (`server/`) + Vercel serverless mirrors (`api/`) |
| Data | Supabase (Postgres + Auth + Storage + Realtime) |
| Payments | Stripe (embedded checkout), `stripe@22` |
| AI | Anthropic SDK + OpenAI SDK direct from client (`VITE_*` keys) |
| Deploy | Vercel (`vercel.json` rewrites `/api/*`) |

Vite dev port: **5173 or 5174**. Server: **3001**. Never `:3000`.

---

## 3. The 10 inviolable rules

1. **Tailwind v4** — utilities, `@utility`, `@theme` live in `client/src/index.css`. There is no `tailwind.config.js`. New utilities go through `@utility name { … }`.
2. **Palette tokens, not raw colors.** Read `var(--color-*)`, `var(--bridge-*)`, `var(--lp-*)`. The `bridge-ui` skill has the full contract. Tokens are owned by `client/src/appearance.css` and the landing override in `client/src/pages/landing/index.jsx` — components consume, never define.
3. **Three palettes × two themes.** `modern-signal`, `grounded-guidance`, `quiet-authority` × light / dark. Components must work in all six. Verify by toggling `html.theme-dark` and `html[data-palette="…"]` in DevTools.
4. **Client env**: `VITE_*` only via `import.meta.env`. **Never `process.env`** in `client/`.
5. **Server secrets** (`SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `STRIPE_SECRET_KEY`) live in `server/.env` only. Never expose to client.
6. **Supabase singleton** — always `import supabase from '../api/supabase'`. Never `createClient` twice.
7. **`mentor_profiles.id` ≠ `auth.users.id`.** `getMentorById()` queries by profile UUID. Returns `{ data: { mentor, reviews }, error }` — destructure `mentor`, not `data`.
8. **Session types** — four keys, source of truth `client/src/constants/sessionTypes.js`: `career_advice`, `interview_prep`, `resume_review`, `networking`. Mirror in server validation.
9. **RLS-first thinking.** Client writes can silently fail. Aggregations like `mentor_profiles.rating` are DB triggers, never client-side.
10. **Performance gating.** Animations heavier than opacity + 1-axis translate respect `usePerfTier()` and `prefers-reduced-motion`.

---

## 4. File map (entry points — go straight here)

```
client/src/
  api/                 ← supabase calls (one file per domain)
    supabase.js        ← singleton; never re-instantiate
    mentors.js sessions.js reviews.js favorites.js
    ai.js aiMatching.js aiResumeReview.js aiUsage.js
    calendar.js stripe.js intake.js cancellations.js
    menteeProfile.js mentorOnboarding.js resumeStorage.js
  components/          ← reusable UI (Navbar, Footer, MagneticPointer, Reveal …)
  pages/
    landing/           ← Hero, Bento, Manifesto, HowItWorks, FinalCta, …
    dashboard/         ← mentee + mentor views, hooks, modals
    footer/            ← static informational pages
    Mentors/ Pricing/ DevPortal/
    Login.jsx Register.jsx MentorProfile.jsx Profile.jsx Settings.jsx
    VideoCall.jsx IntakeCall.jsx MentorOnboarding.jsx ResumeReview.jsx
  context/             ← AuthContext + hooks
  utils/               ← appearance, routePalette, useInView, mentorAvailability
  constants/           ← sessionTypes (single source of truth)
  index.css            ← Tailwind v4 entry + ALL @utility utilities + keyframes
  appearance.css       ← 3 palettes × 2 themes (do not duplicate tokens)
  App.jsx              ← routes + palette/route binding
server/
  routes/              ← express handlers (sessions, calendar, googleAuth, stripe, support)
  middleware/          ← auth, supabaseAuth
  lib/supabaseAdmin.js ← service-role client (server only)
api/                   ← Vercel serverless wrappers — same handlers as server/
supabase/migrations/   ← canonical SQL; do NOT auto-run, hand to user
```

### Task → entry-point shortcuts

| If the task involves… | Start at… |
|---|---|
| Mentor browse / search / filter | `client/src/api/mentors.js`, `client/src/pages/Mentors/` |
| Booking, accept/decline, cancel | `client/src/api/sessions.js`, `client/src/api/cancellations.js`, `server/routes/sessions.js` |
| Reviews | `client/src/api/reviews.js`, `client/src/components/ReviewModal.jsx` |
| AI mentor matching | `client/src/api/aiMatching.js` (OpenAI) |
| AI resume review | `client/src/api/aiResumeReview.js`, `client/src/api/resumeStorage.js`, `client/src/pages/ResumeReview.jsx` |
| AI intake call | `client/src/pages/IntakeCall.jsx`, `api/prompts/intakePrompt.js` |
| Video call | `client/src/pages/VideoCall.jsx` (WebRTC + Supabase Realtime) |
| Calendar / Google OAuth | `client/src/api/calendar.js`, `server/routes/googleAuth.js`, `server/routes/calendar.js` |
| Stripe / payments | `client/src/api/stripe.js`, `server/routes/stripe.js`, `client/src/components/EmbeddedCheckoutPanel.jsx`. See `.cursor/skills/adding-stripe/SKILL.md`. |
| Landing | `client/src/pages/landing/` |
| Dashboard | `client/src/pages/dashboard/` |
| Auth | `client/src/context/AuthContext.jsx`, `Login.jsx`, `Register.jsx` |
| Settings / appearance | `client/src/pages/Settings.jsx`, `client/src/utils/appearance.js` |
| New @utility / animation keyframe | `client/src/index.css` |
| New palette / theme tweak | `client/src/appearance.css` (touch with care) |

When the answer is in the file map, read that file directly. Skip the
exploration round.

---

## 5. Token discipline (this is where most context is wasted)

These rules apply to every task. They are non-negotiable.

### A · Parallel exploration is the default

If you need three independent file reads, three greps, or any combination of
non-dependent tool calls, **fire them in one turn**, not three. Sequential
calls are only justified when output of step N feeds step N+1.

Right:

```
turn 1: read A, read B, read C, grep X    ← all in parallel
turn 2: edit A based on findings
```

Wrong:

```
turn 1: read A
turn 2: read B  ← independent of A; should have been parallel
turn 3: read C
```

### B · Read once, remember

Once a file has been read in this conversation, do not re-read it unless you
have edited it or have explicit reason to believe it changed. Re-reading
costs as much as the first read.

### C · Scope the read

For files > 1000 lines (`MentorProfile.jsx`, `Profile.jsx`, `VideoCall.jsx`,
`Settings.jsx`, `MentorOnboarding.jsx`):

- Use `grep` first to locate the symbol or section.
- Then `read_file` with `offset` + `limit`.
- Avoid full-file reads on large files — they cost ~5–10× more tokens for the same answer.

### D · Use `code_search` for unknown territory

When the task references a symbol you cannot place from the file map,
delegate first-pass exploration to the `code_search` subagent. It runs
parallel grep/read in a separate context and returns line ranges. Far
cheaper than searching in-context.

### E · No speculative work

Do not "fix while I'm here". Do not refactor adjacent code. Do not rename
variables for clarity unless asked. Speculative edits double the diff,
double the verification cost, and risk breaking unrelated paths.

### F · No unnecessary intermediate files

Do not create scratch markdown, helper scripts, or progress notes unless
the user asks or the task spans multiple sessions. The workspace stays clean.

### G · No re-explanation

After completing a task, do not re-explain what was done in three formats
(prose paragraph, then bullet list, then table). One terse summary, end.

---

## 6. Output discipline

### Default response shape after a code change

```
[1 short paragraph: what changed and why]

[citation block(s) for the changed code]

[Run this — only if user must run something. Otherwise omit.]

[Followups — only if there are real risks deferred. Otherwise omit.]
```

That is the entire response. No preamble ("I'll now…"), no acknowledgement
("Great idea!"), no recap of what they asked. Citation format is
`@/abs/path:start-end`.

### When proposing instead of executing

- Lead with the recommendation, not the analysis.
- One paragraph of reasoning, max.
- One concrete next step the user can approve.

### Never

- Restate the user's request before answering.
- Open with "Let me…" or "I'll…" — just do it.
- Use emojis unless the user asked.
- Add comments to code unless the user asked.
- Add filler like "as discussed", "as you can see", "hopefully this helps".

---

## 7. Companion-skill triggers

Most non-trivial tasks fire **`bridge-context` plus one or two domain skills**.
Compose them rather than choosing.

| User intent or symptom | Skills to use |
|---|---|
| "Build / refactor / add a feature" | `shipping-features` |
| "Design / component / button / look / form" | `bridge-ui` |
| "Page / section / hero / layout / pricing" | `bridge-web-design` |
| "Animate / scroll effect / parallax / 3D / micro-interaction" | `bridge-motion` |
| "Transition / route change / modal open / morph / list reorder" | `bridge-transitions` |
| "Bug / broken / wrong / error / disappearing" | `bridge-debugging` (+ relevant domain) |
| "Cleanup / refactor / dead code / a11y / perf audit" | `bridge-cleanup` |
| "Wrong color / wrong font / off-palette / invisible" | `bridge-ui` (audit section) |
| "AI / Claude / OpenAI / prompt / mentor matching / resume review" | `bridge-ai-features` |
| "Supabase / query / RLS / realtime / storage / data" | `bridge-data-flow` |
| "Stripe / payment / checkout / subscription" | `.cursor/skills/adding-stripe/SKILL.md` |

Multi-skill triggers (the common case):

| Task | Compose |
|---|---|
| "Fix the broken hero animation" | `bridge-debugging` + `bridge-motion` |
| "Add booking flow with optimistic UI" | `shipping-features` + `bridge-data-flow` + `bridge-transitions` |
| "Cleanup the mentor profile page" | `bridge-cleanup` + `bridge-ui` (audit) |
| "New AI suggestion modal" | `shipping-features` + `bridge-ai-features` + `bridge-ui` + `bridge-transitions` |

---

## 8. Common command shortcuts

```bash
# Lint
npm run lint --prefix client

# Build (catches type/import errors)
npm run build --prefix client

# Dev (run rarely — usually a session is already open)
npm run dev                          # both apps via concurrently
npm run dev --prefix client          # client only
npm run dev --prefix server          # server only

# Search the client by symbol
rg -n 'symbol' client/src

# Find files by name
fd 'pattern' client/src
```

Do not run dev servers without checking active terminals first. Read open
processes before starting one.

---

## 9. Uncertainty ladder (use in order)

1. **File map (Section 4)** — canonical entry point.
2. **`grep` / `rg`** — locate the symbol or string.
3. **`code_search` subagent** — broader exploration if the answer is dispersed.
4. **`read_file` with `offset`/`limit`** — load only the relevant block.
5. **Ask the user** — only when intent is genuinely ambiguous. Pose one focused question with 2–4 concrete options. Never ask about implementation details Claude can decide.

Skipping straight to step 5 wastes the user's time. Skipping steps 1–4 in
favour of a full file read wastes tokens. Climb the ladder.

---

## 10. What this skill saves you on every task

- ~3–5k tokens of re-exploration (no re-reading `CLAUDE.md` end-to-end).
- ~1–2k tokens of re-discovery of the design-token system on UI tasks.
- 1+ round-trip avoiding the `mentor_profiles.id` vs `auth.uid()` mistake.
- 1+ round-trip avoiding `process.env` in client code.
- Multiple round-trips of preamble, recap, and clarification questions.

The savings compound: one well-aimed task is cheaper than three exploratory
ones, and the diff lands in production-ready shape on the first pass.
