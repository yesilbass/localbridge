# Contributing to Bridge

Bridge is a proprietary, closed-source mentorship platform. This document is for the
**internal development team only**: Berk, Muaz, Omar, and Irshad.

External contributions are not accepted. If you have found a security issue, see
[SECURITY.md](SECURITY.md) instead.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Branch & PR Workflow](#branch--pr-workflow)
- [Active Branches — Do Not Touch](#active-branches--do-not-touch)
- [Code Standards](#code-standards)
- [Database Rules](#database-rules)
- [Environment Variables](#environment-variables)
- [Secrets Policy](#secrets-policy)
- [Commit Messages](#commit-messages)
- [Reporting Bugs](#reporting-bugs)

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Access to the shared Supabase project (ask Berk for credentials)
- Stripe test-mode keys
- Google Cloud project with the Calendar API and OAuth 2.0 credentials enabled
- OpenAI API key (GPT-4o and Realtime API access required)
- Anthropic API key (Claude Sonnet access required)

### Install

```bash
# From the repo root — installs root + serverless function deps
npm install

# Install frontend deps
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
# From the repo root — starts Express API (port 3001) + Vite dev server (port 5173) concurrently
npm run dev
```

---

## Project Structure

```
bridge/
├── api/              # Vercel serverless functions (production API)
│   └── _lib/         # Shared: JWT auth helper, CORS helper, calendar booking logic
├── client/
│   └── src/
│       ├── api/      # Client-side data modules — one file per domain
│       ├── components/
│       ├── context/  # AuthContext + useAuth
│       ├── pages/
│       ├── utils/
│       ├── constants/ # sessionTypes.js — single source of truth for session type keys
│       ├── index.css  # Tailwind v4 entry + all @utility definitions + keyframes
│       └── appearance.css  # Palette tokens (3 palettes × 2 themes) — do not duplicate
├── server/           # Express 5 dev server — mirrors /api for local development
├── supabase/
│   ├── migrations/   # Versioned SQL — apply via Supabase CLI
│   └── seeds/
└── vercel.json       # Rewrites and cache headers
```

See [README.md](README.md) for the full breakdown and [ARCHITECTURE.md](ARCHITECTURE.md)
for system design decisions.

---

## Branch & PR Workflow

### Branch Naming

| Pattern | Use case |
|---------|----------|
| `feature/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `review/<name>` | Peer review iterations |
| `chore/<name>` | Tooling, deps, non-user-facing changes |

### Rules

1. **No direct pushes to `main`.** Every change goes through a pull request.
2. **At least one team member must review and approve** before merging.
3. **Keep `main` green.** Do not merge a PR that breaks the Vercel build.
4. **Branch from `main`** unless you are building on top of another in-progress feature
   (coordinate with the branch owner in that case).
5. **Keep branches up to date with `main`** via merge — not rebase — unless the whole
   team agrees otherwise.
6. **Resolve all merge conflicts before requesting review.**
7. **Delete the branch after merging.**

### Pull Request Checklist

Before marking a PR ready for review:

- [ ] Code runs locally without errors
- [ ] No `console.log` left in the diff
- [ ] No hardcoded secrets, API keys, or `.env` values
- [ ] All new env vars documented in README.md and this file
- [ ] No `// TODO` comments — open a GitHub issue instead
- [ ] Database changes have a matching migration in `supabase/migrations/`
- [ ] Session type changes updated in both `client/src/constants/sessionTypes.js`
      and `server/routes/sessions.js`

---

## Active Branches — Do Not Touch

These branches have ongoing work. Do not merge, rebase, force-push, or modify them
without coordinating with the branch owner first.

| Branch | Owner | Work in Progress |
|--------|-------|-----------------|
| `feature/dashboard` / `review/omar-dashboard` | Omar | Dashboard v2 — session management UI, mentor earnings view |
| `feature/review-system` | Irshad | Review system — post-session review prompt, review display on mentor profile |
| `feature/sprint2-mentor-flow` | Muaz | Mentor onboarding polish, profile flow, calendar integration hardening |

---

## Code Standards

### General

- **No `console.log` in committed code.** Remove all debug logs before opening a PR.
- **No `// TODO` comments.** Open a GitHub issue and link it if something needs follow-up.
- **No commented-out code.** Git history preserves deleted code — just delete it.
- **No speculative changes.** Only touch what your PR is about. Adjacent "while I'm here"
  edits belong in their own PR.
- Code must be demo-ready before merging to `main`. No half-states, no loading spinners
  with no data, no broken flows.

### Frontend

- **Tailwind v4 is CSS-first** — there is no `tailwind.config.js`. Add custom utilities
  with `@utility` in `client/src/index.css`. Do not create a config file.
- **Use palette tokens** defined in `client/src/appearance.css` for all colors. Never
  hardcode a hex or RGB value in a component.
- **`VITE_` prefix required** for all client env vars. Never use `process.env` in
  client-side code — it does not exist in Vite builds.
- **Supabase singleton** — always import from `client/src/api/supabase.js`. Never
  instantiate a second Supabase client anywhere in the frontend.
- **`mentor_profiles.id` ≠ `auth.users.id`** — these are different UUIDs. Query mentor
  profiles by the profile `id` (the PK), not by `auth.uid()` or `user_id`.
- **`getMentorById` return shape** — returns `{ mentor, reviews }`, not `{ data }`.
  Destructure accordingly.

### Session Types

Session types are defined in exactly one place:
`client/src/constants/sessionTypes.js`

Four values: `career_advice`, `interview_prep`, `resume_review`, `networking`.

If you need to add a session type, you must update:
1. `client/src/constants/sessionTypes.js`
2. `server/routes/sessions.js` (validation mirror)

Adding it in only one place will cause silent failures or validation errors.

### AI Features

AI API keys must be handled with care:

- Never log them
- Never pass them through any user-controlled code path
- Never include them in error messages or API responses

### Animation & Motion

- Use `motion/react` (not `framer-motion` directly — the package has been renamed).
- Gate heavy animations behind `perfTier` — do not run Three.js or complex GSAP
  sequences on low-end devices.
- Always provide a `prefers-reduced-motion` fallback.

---

## Database Rules

### Schema Changes

All schema changes must go through a migration file:

```bash
# Create a new migration
supabase migration new <descriptive-name>
# Edit the generated file in supabase/migrations/
# Apply locally
supabase db push
```

Never alter the production Supabase schema directly through the dashboard SQL editor
for structural changes — only for emergency hotfixes, and document what you did.

### Critical Rules

| Rule | Why |
|------|-----|
| `mentor_profiles.rating` is maintained by a Postgres trigger | Never recalculate it client-side — RLS blocks mentee writes to mentor_profiles and concurrent inserts will race |
| `mentor_profiles.id` ≠ `auth.users.id` | Different UUID PKs. Always use the profile id when joining or querying |
| RLS is enforced at the Postgres layer | Silent write failures (no error thrown, no rows updated) almost always mean a missing or wrong RLS policy |
| Session types are a shared enum | Defined in `client/src/constants/sessionTypes.js` and mirrored in server validation |
| Supabase service role key is server-only | Never reference `SUPABASE_SERVICE_ROLE_KEY` in any client file |

---

## Environment Variables

When you add a new env var:

1. Add it to `server/.env` (server-side) or `client/.env.local` (client-side).
2. Update the variable table in [README.md](README.md).
3. Update this file's Configure Environment section above.
4. If deploying to Vercel, add it to the Vercel project's environment variables
   in the dashboard (Settings → Environment Variables). Ask Berk for access.
5. Never commit a `.env` file — they are in `.gitignore`.

---

## Secrets Policy

- **Never commit credentials.** API keys, JWT secrets, service role keys, Stripe keys,
  and OAuth client secrets must never appear in any committed file.
- `.env` and `.env.local` files are already in `.gitignore`. Keep them there.
- If you accidentally commit a secret:
  1. **Rotate the key immediately** — treat it as compromised from the moment it was pushed.
  2. Notify Berk immediately.
  3. Use `git filter-repo` or GitHub's secret scanning tools to scrub the history.
  4. Force-push the cleaned history and notify all team members to re-clone or re-fetch.

Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `STRIPE_SECRET_KEY`,
`GOOGLE_CLIENT_SECRET`) must never appear in any file under `client/`.

---

## Commit Messages

Write commits in the imperative mood. Keep the subject line under 72 characters.
Use a blank line to separate the subject from any additional body.

**Format:** `type: short description`

| Type | When to use |
|------|-------------|
| `feat` | New user-visible feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring with no behavior change |
| `chore` | Deps, tooling, config, non-user-facing |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |

**Examples:**

```
feat: add student discount auto-apply for .edu emails at checkout

fix: mentor profile rating not updating after new review

refactor: extract calendar booking logic into shared api/_lib helper

chore: update stripe to v22, migrate deprecated checkout APIs

docs: add architecture overview and database decision notes
```

---

## Reporting Bugs

Open a GitHub issue with:

- **What you expected** to happen
- **What actually happened** (include any error messages verbatim)
- **Steps to reproduce** — be specific
- **Browser and OS** if it's a UI bug
- **Environment** — local dev or production?

For security vulnerabilities, see [SECURITY.md](SECURITY.md) — never open a public
issue for a security bug.
