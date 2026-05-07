---
name: bridge-debugging
description: >-
  Bridge debugging discipline: root-cause analysis, minimal upstream fixes,
  Bridge-specific gotchas (RLS, palette tokens, perfTier, mentor_profiles
  vs auth.users id, Supabase singleton, Stripe ports, Tailwind v4 caveats).
  Use when something is broken, throwing, returning wrong data, looking
  wrong, mispainting, mistransitioning, failing in dev/prod, or when the
  user reports a bug.
---

# Bridge debugging discipline

Fix the cause, not the symptom. Then make sure it can't regress.

## The 5-step loop

1. **Reproduce** with exact steps — get an error message or a wrong-output sample.
2. **Localize** — narrow to the file/function. Use parallel `grep` + `read`. Don't refactor while exploring.
3. **Hypothesize** the root cause. Write it in one sentence to yourself.
4. **Smallest fix** — single-line ideal. Touch only what the cause demands.
5. **Verify** — re-run the repro, confirm gone, confirm no other path broke.

## Common Bridge gotchas (check these first)

### 1. `mentor_profiles.id` ≠ `auth.users.id`

Symptom: queries return null, "mentor not found", or you're updating the
wrong row. Fix: pass the **mentor profile UUID** (from the row), not the
`user.id` from auth. `getMentorById()` returns `{ data: { mentor, reviews } }`
— destructure `.data.mentor`, not `.data`.

### 2. Client-side update on `mentor_profiles.rating` silently fails

RLS only allows the row owner to update. Mentee writes are dropped.
Aggregation belongs in a Postgres `AFTER INSERT OR UPDATE OR DELETE ON reviews`
trigger. Don't paper over with admin keys client-side.

### 3. Palette token not switching

Symptom: dark mode applied but a section stays light, or new palette
doesn't retint a component. Causes:

- Hardcoded color in a `style={{ color: '#…' }}` — replace with `var(--bridge-text)`.
- Tailwind `text-stone-900` / `bg-white` literal — swap for token or for `text-orange-*`/`amber-*` (which the appearance system re-skins) or use `style={{ color: 'var(--bridge-text)' }}`.
- Component renders before `applyPalette` runs — verify in `App.jsx` that the route effect path is reached.

### 4. Animation feels janky

Open DevTools → Performance → record. If you see long paint frames:

- Animated `filter: blur()` somewhere (auroras don't *animate* the filter — they animate transform with a static filter applied).
- `will-change` left on a static element after animation.
- Layout-property animation (`height`, `top`, `left`).
- Multiple GPU layers stacked unnecessarily — `translate3d(0,0,0)` on every element creates a layer cost.

Always test on `tier === 'low'` to confirm the gating is in place.

### 5. `process is not defined` in client

Someone wrote `process.env.X` in `client/src/`. Replace with
`import.meta.env.VITE_X` and ensure `.env` has it prefixed.

### 6. "Missing Supabase environment variables" thrown at module load

`client/src/api/supabase.js` throws on missing `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY`. Check `client/.env`. Restart Vite after editing.

### 7. Stripe redirect lands on wrong port

`CLIENT_URL` in `server/.env` must equal the actual tab origin (5173 vs 5174).
The `return_url` is built from it. Restart the server after editing.

### 8. CORS blocked in dev

API on `:3001`, client on `:5173/5174`. Vite proxies `/api/*` automatically
(see `client/vite.config.js`). If you used `fetch('http://localhost:3001/api/...')`
explicitly, switch to relative `fetch('/api/...')`.

### 9. Tailwind class isn't applying

This is Tailwind v4 — check:

- The class is in a string literal (Tailwind only scans literals).
- Conditional classes use `clsx`/template strings, not array `.join()` of dynamic values.
- New `@utility` was added to `index.css` and Vite hot-reloaded.
- No typos in arbitrary values: `text-[15px]` works, `text-[15 px]` does not.

### 10. RLS denial mystery

Check the **RLS policy** for the table in the Supabase dashboard or
`supabase/migrations/*.sql`. Common: `INSERT` policy expects `auth.uid()` to
match a column the client didn't set. Add the column on the client write or
fix the policy via copy-paste SQL.

### 11. Realtime / video signaling silent

WebRTC channel is `video:{sessionId}` via Supabase Realtime. If signal flies
nowhere: confirm the channel name on both sides matches, mentor sends offer,
mentee sends answer. `video_room_url` truthy = "Join Call" visible.

### 12. AI usage limit confusion

`client/src/api/aiUsage.js` enforces per-feature limits (`resume_review` = 1,
`mentor_match` = 3). If user can't trigger AI, check the row in `ai_usage`
table — record may be stale.

### 13. Hot reload but stale data

If you swap `.env` or migrate the schema mid-session, the Supabase client and
React state both keep stale data. Hard reload the page.

### 14. Build passes locally, fails on Vercel

Most common: `process.env` in client (works in Node SSR check but not Vite
production), or a file imported with wrong-case path on case-insensitive Mac
filesystem. `git mv` to fix.

### 15. Strict-mode double-fetch

React 19 strict mode runs effects twice in dev. If you're seeing two POSTs
on mount, that's expected in dev only. Production runs once. Don't disable
strict mode.

## Don't auto-run dangerous commands

- No `rm -rf` or destructive `git` (`reset --hard`, `clean -fd`) without explicit user approval.
- No `npm install` of a new package without surfacing it.
- No SQL on the user's Supabase project. Hand them the SQL to paste.
- No deploy commands (`vercel --prod`, `git push`) unless asked.

## Logging discipline

When debugging:

- Add `console.log('[domain] message', { vars })` with a domain prefix, not bare `console.log(x)`.
- Remove every diagnostic `console.log` before handing off. Search for `console.log` in your diff.
- Replace temporary `try/catch` traces with proper error returns.

## Bisecting unknown failures

1. Did this work yesterday? `git log --oneline -n 20` and skim subjects.
2. `git bisect` between known-good and broken if the regression isn't obvious.
3. Or `git stash` your local changes and confirm if the bug is also in `main`.

## Reading errors fast

- React: ignore the first 5–10 stack frames (framework internals); find the first frame that mentions a path under `client/src/`.
- Supabase errors include `code` (`PGRST116` = no row, `42501` = RLS) and `message`. Match `code` first, message second.
- Vite errors include the file + line; click through. ESM "Cannot use import outside a module" usually = wrong file extension or missing `"type": "module"`.

## Defensive code policy

Don't sprinkle `?.` and `??` everywhere "to be safe". Each defensive
operator either:

- Reflects a real nullable boundary (network result, untyped JSON), **or**
- Is a band-aid hiding a logic error. Find the logic error.

If you find yourself writing `data?.user?.profile?.name ?? 'Unknown'` in a
view, push the resolution upstream into the API layer.

## Regression prevention

When you fix a bug, leave behind one of:

- A `// TODO:` comment ONLY if the user has asked for one — otherwise none.
- A small inline assertion (`if (!x) throw new Error('…')`) at the boundary that would have caught it earlier.
- A doc-style comment in `CLAUDE.md` if it's a recurring foot-gun. (Ask the user before editing `CLAUDE.md`.)

## Verification before declaring done

- Repro path is now green.
- One adjacent path you suspect could share the bug is also green.
- No new lint warnings on the touched file.
- Build still passes (`npm run build --prefix client`) for substantive client fixes.
- Diff is small and obvious — if it isn't, you fixed a symptom, not a cause. Try again.
