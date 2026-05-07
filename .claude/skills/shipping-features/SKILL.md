---
name: shipping-features
description: >-
  Bridge feature-shipping doctrine: precision execution loop (plan, explore,
  edit, verify, hand-off), parallel reads, surgical diffs, no helper scripts,
  no boilerplate, investor-grade polish on every change. Use when adding,
  modifying, refactoring, or extending any feature, page, component, hook,
  context, API route, server endpoint, Vercel handler, or backend logic.
  Use whenever speed and quality both matter — which is every coding task.
---

# Shipping features on Bridge — execution doctrine

Bridge is racing for seed approval. Every diff is part of the pitch. This
skill is the operating loop that keeps tokens low, diffs surgical, and
output investor-ready on the first pass.

Pair with `bridge-context` (always-on) and the relevant domain skill
(`bridge-ui`, `bridge-motion`, `bridge-data-flow`, `bridge-ai-features`,
etc.).

---

## 1. The five-phase loop (every coding task)

```
Plan  →  Explore  →  Edit  →  Verify  →  Hand-off
```

Each phase has a token budget, a tool set, and an exit criterion. Skipping
a phase or letting one bloat is the source of every wasted turn.

### Plan (≤ 2% of total turns)

- Write 3–5 bullets internally: files to touch, contracts that change, risks.
- Identify which sibling skills compose with this task.
- Decide the verification path before writing code.
- Exit when you can name the smallest diff that reaches done.

### Explore (≤ 25% of token budget)

- Fire all independent reads, greps, and `code_search` calls in **one turn**.
- Use `offset`/`limit` for files > 1000 lines.
- Stop when the relevant code, contracts, and conventions are loaded.
- Do not explore "around" the task — bounded reads only.

### Edit (the bulk of the work)

- Use `edit` for one targeted change, `multi_edit` for several in one file.
- `old_string` includes 2–3 lines of context for uniqueness.
- Imports go at the top in a separate edit if not already present.
- Never reformat or reorder unrelated code.

### Verify (≤ 10% of total turns)

- The cheapest applicable check first (visual diff scan → lint → build → manual).
- If a path looks risky, add or update the smallest possible test.
- Confirm the user-visible behaviour matches expectation.

### Hand-off (one short response)

- One paragraph: what changed and why.
- Citation block(s) for the changed lines.
- Run-this commands only if the user must execute (SQL, env, deploy).
- Followups only if real risks were deferred.

If a phase runs long, you are doing the wrong thing in it. Re-plan instead
of pushing through.

---

## 2. Parallelism doctrine

Independent operations fire in **one turn**. This is the single biggest
productivity multiplier.

### Parallel-by-default checklist

Are these tool calls independent of each other's output? If yes, parallel.

- Three `read_file` calls on different files.
- A `grep` and a `read_file` on related-but-unread file.
- Reading a component plus all its consumers (use `grep` to list first, then parallel reads).
- Listing a directory plus reading the file you already know is needed.

### Sequential-required

- A grep result feeds the path of the next read.
- An edit completes, then re-read to verify.
- A `code_search` result lists files, then read those files.

If unsure, default to parallel. The cost of an unused result is small;
the cost of an extra round-trip is large.

---

## 3. Edit discipline

### A · Smallest diff that reaches done

The right diff has the property: removing any line breaks the fix. If lines
can be removed without breaking the change, remove them.

### B · No drive-by refactors

Do not rename for clarity, reorganise imports, or extract helpers unless the
task requires it. Drive-by changes:

- Inflate the diff by 3–10×.
- Risk breaking unrelated code.
- Hide the real change inside cosmetic noise.
- Make code review harder.

If you spot a real bug while editing, mention it in the hand-off as a
followup. Do not fold it into the current diff.

### C · No new files unless required

Co-locate with siblings. Landing sections live in `pages/landing/`, shared
UI in `components/`, API calls in `api/`. New top-level files are a smell —
they usually duplicate or fork an existing pattern.

### D · No helper scripts

Do not create `scripts/fix-foo.mjs`, `tools/migrate-x.js`, or one-shot
runners. Solve in-place. The exception: a migration the user explicitly
asked for.

### E · No comments unless asked

The codebase has minimal inline narration. New comments stand out as noise
and signal "I am Claude". Match the existing style.

---

## 4. Investor-grade polish bar (every shipped change)

Every UI-facing change must satisfy this bar before hand-off:

- [ ] **Token-driven colors.** Surface and foreground belong to the same pair class (see `bridge-ui` Section 1).
- [ ] **All six visual states verified** (3 palettes × 2 themes).
- [ ] **`prefers-reduced-motion` honoured** on every animation.
- [ ] **`usePerfTier()` gating** on any animation heavier than opacity + 1-axis translate.
- [ ] **Focus-visible** on every interactive element.
- [ ] **`aria-*`** on icon-only buttons, modals, live regions.
- [ ] **Loading + empty + error** states present for any data fetch. Never happy-path-only.
- [ ] **No layout shift** on async content (skeleton matches final dimensions).
- [ ] **Tabular numbers** (`tabular-nums`) on any stat, count, price, duration.
- [ ] **Mobile parity** at 375 px — no horizontal scroll, no clipped CTAs.
- [ ] **No leftover `console.log`** or `debugger` statements.
- [ ] **No emoji** in code, file names, or commits.

Backend changes:

- [ ] **No client exposure** of service-role keys, JWT secrets, Stripe secret keys.
- [ ] **RLS-aware**: writes that depend on `auth.uid()` ownership confirmed.
- [ ] **Validation**: `express-validator` on inbound payloads.
- [ ] **Errors**: structured `{ error: { code, message } }` not bare strings.

---

## 5. Output template (after a change)

```
[1 short paragraph naming what changed and the user-visible effect]

[citation: @/path/to/file.jsx:start-end]
[citation: @/path/to/another.jsx:start-end]

[Run this — only if action required]

[Followups — only if real risks deferred]
```

Examples of bad openers (never use):

- "I'll now make the changes you requested…"
- "Great suggestion! Let me…"
- "As you can see, the approach is…"
- "Here is a summary of what was done:"

The diff is the proof. The paragraph orients. The followups are honest.
Nothing else.

---

## 6. Decision shortcuts (when to do what)

| Situation | Decision |
|---|---|
| Two ways to solve are equally good | Pick the one with the smaller diff |
| Existing pattern conflicts with stated best practice | Match the existing pattern; raise the conflict as a followup |
| New feature would benefit from a library you'd add | Don't add the library; reuse what's there or implement manually |
| Reasonable to ask user a clarifying question OR pick a default | Pick the default and state the assumption in the hand-off |
| Edge case is unlikely but possible | Document with a one-line followup; do not over-engineer |
| Change spans 5+ files | Break into a plan and confirm scope before editing |
| Quick fix vs. proper fix and the user said "fix" | Proper fix unless they specified speed |

---

## 7. Common task templates

### A · "Add a new section to the landing page"

1. Read `client/src/pages/landing/index.jsx` (offset to the composition area).
2. Read one similar existing section (e.g. `OutcomesSection.jsx`) for shape.
3. Create new file at `client/src/pages/landing/<Name>Section.jsx`.
4. Compose using `<RevealOnScroll>` and palette tokens.
5. Import + place in `index.jsx`.
6. Verify in DevTools across all six visual states.

### B · "Fix a bug on a page"

1. `bridge-debugging` skill governs the loop.
2. Reproduce → localise → hypothesise → smallest fix → verify.
3. Most fixes are 1–5 lines. If the fix is large, you are repairing a symptom — re-plan.

### C · "Refactor a long file for readability"

1. Confirm scope with the user (which file, which boundary).
2. Extract along seams that already exist (sections, sub-components).
3. Keep external API unchanged.
4. Build + lint after the move.

### D · "Hook up a new API call from the client"

1. New function in `client/src/api/<domain>.js` next to peers.
2. Use `supabase` singleton or the axios `client.js` (decide by domain).
3. Return `{ data, error }` shape consistent with neighbours.
4. Wire into the consuming component with loading + empty + error states.
5. RLS-check: confirm the policy permits the operation.

### E · "Add a server route or Vercel function"

1. New handler in `server/routes/<domain>.js` (Express) and matching `api/<name>.js` (Vercel).
2. Use `lib/supabaseAdmin.js` for service-role operations.
3. Validate input with `express-validator`.
4. Return structured errors.
5. Mount in `server/app.js` if Express; Vercel auto-discovers `api/*`.

---

## 8. Anti-patterns (auto-reject)

- Wrapping working code in `try/catch` to "be safe" without a real error path.
- `console.log` left in committed code.
- Defaulting unknown enums to a string ("default to `pending`") — let it surface.
- `import * as Icons from 'lucide-react'` — always named imports.
- Inline `<style jsx>` global CSS leakage.
- Re-implementing `useInView`, `<Reveal>`, `motion.div` fade-in, `applyPalette()`. Use what's there.
- New Tailwind config file (this is v4).
- New Supabase client instance.
- Hardcoded URLs to `localhost:3000` (the API is on `:3001`).
- Asking for permission to perform basic exploration.
- Output that explains what the code does instead of letting the code speak.

---

## 9. When to escalate to the user

Stop and ask only when:

- The user's intent has two genuinely incompatible interpretations.
- The change requires a destructive operation (`rm -rf`, schema migration, force push).
- An external secret or paid API is involved and not yet configured.
- The work spans more than ~10 files and the user has not framed it as such.

In every other case, decide and proceed. State your assumption in the
hand-off so the user can correct in one message.

---

## 10. What "done" looks like

- The diff is the smallest possible change for the requested behaviour.
- The change works in all six visual states for any UI surface touched.
- Lint and build pass for the touched files.
- The hand-off is one paragraph plus citations.
- Nothing was added that the user did not ask for.

If any of these is false, the task is not done — close the gap before
declaring completion.
