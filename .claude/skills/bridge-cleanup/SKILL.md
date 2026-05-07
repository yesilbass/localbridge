---
name: bridge-cleanup
description: >-
  Bridge code health: dead code removal, dependency hygiene, console cleanup,
  accessibility audit, performance audit, file size reduction, naming
  consistency, type safety, RLS audit, console.log purge, unused imports,
  duplicate logic consolidation. Use when refactoring, cleaning up, auditing
  the codebase, reducing bundle size, or preparing for an investor demo.
---

# Bridge code cleanup & efficiency

Cleanup is shipped polish. Investors notice tail-of-distribution issues:
dead code, console noise, broken aria attributes, layout shift, slow first
paint. This skill is the audit checklist.

## Scope discipline

When the user asks for "cleanup", clarify scope first if not obvious:

- A **file** (one component, one route)
- A **directory** (`pages/landing/`, `api/`)
- A **theme** (accessibility, perf, dead code)
- The **whole client** (full audit)

Pick one. Don't auto-expand. Cleanup that touches 80 files is rejectable.

## Universal cleanup pass (per file)

1. **Unused imports** — remove. Leverage ESLint output if running.
2. **Unused vars / fn args** — remove or prefix with `_` for intentional.
3. **`console.log` / `console.warn`** — remove unless the file is intentionally a debug surface (`pages/DevPortal/`).
4. **Commented-out blocks** — delete. Git history is the archive.
5. **Dead branches** — `if (false)`, unreachable `return`, unused props.
6. **Inline magic numbers** — promote to named const ONLY if used >1 place; otherwise leave (over-extracting hurts readability).
7. **Trailing whitespace / mixed indentation** — normalize to existing file style.

## Dependency hygiene

```bash
npm ls --prefix client --depth=0   # list direct deps
```

Audit candidates:

- `gsap` — used? (`grep -r "from 'gsap'" client/src`). If a single file uses it, that's fine. If unused, remove from `client/package.json`.
- `@react-three/*` + `three` — used in any current page? If only DevPortal, keep.
- `axios` — most calls go through `client.js`. Confirm before removing.
- Lucide icons — never `import * as Icons`. Always named.

Don't remove deps without searching the codebase exhaustively first
(`grep -r "from 'package-name'" client/src` and `api/` and `server/`).

## Bundle size wins (highest leverage first)

1. **Code-split routes**: `App.jsx` imports every page eagerly. Convert heavy pages (`VideoCall`, `MentorProfile`, `MentorOnboarding`, `Settings`, `ResumeReview`, `IntakeCall`) to `React.lazy` + `<Suspense fallback={<LoadingSpinner />}>`. Each is 50–100 KB.
2. **Lazy-load 3D**: `@react-three/fiber` is huge. Wrap any `<Canvas>` in `React.lazy`. Show a static SVG fallback.
3. **Drop unused Supabase methods** — `@supabase/supabase-js` tree-shakes okay but make sure you're not importing the whole `auth-helpers` separately.
4. **`googleapis`** in client — should NOT be in client bundle. If it appears, move calendar work to server endpoints.
5. **Remove `mockMentors.js`** from production bundle — guard imports with `if (import.meta.env.DEV)` or move to a route that's lazy-loaded.

Verify with `npm run build --prefix client` and inspect `client/dist/` chunk sizes.

## Accessibility audit (per page)

- [ ] Every `<img>` has `alt` (decorative = `alt=""`)
- [ ] Every icon-only `<button>` has `aria-label`
- [ ] Form `<input>` has associated `<label>` (visible or `aria-label`)
- [ ] Color contrast ≥ 4.5:1 on body text (use the token system; avoid `text-stone-500` on `bg-stone-100`)
- [ ] All interactive elements reachable via Tab, activate via Enter/Space
- [ ] Modal: focus trapped, Esc closes, focus restored on close
- [ ] No `tabindex` > 0 (positive tabindex breaks tab order)
- [ ] Headings in order (h1 → h2 → h3, no jumps)
- [ ] Live regions (`role="status"` / `role="alert"`) on async updates
- [ ] `:focus-visible` ring not disabled

Run Chrome Lighthouse a11y audit on the page after changes; aim ≥ 95.

## Performance audit (per page)

- [ ] First-paint hero is rendered in HTML, not after JS hydration delay
- [ ] No layout shift on async content (skeletons reserve dimensions)
- [ ] No animated `filter: blur()` on a paint-active element
- [ ] `will-change` is scoped, not global
- [ ] Below-the-fold sections use `content-visibility: auto`
- [ ] Images have `loading="lazy"` and explicit `width`/`height`
- [ ] `<Canvas>` (R3F) capped to `dpr={[1, 1.5]}` and `frameloop="demand"` if static
- [ ] No infinite animation paints when tab hidden (verify with `BridgeGlobalAtmosphere`-style pause)
- [ ] `tier === 'low'` path bypasses heavy effects

## Console / network audit

- [ ] No `console.log` shipped in any file outside `DevPortal/`
- [ ] No `console.error` swallowed without surfacing to UI
- [ ] No `fetch` left without `try/catch` or `.catch`
- [ ] No `?` query params with secrets (API keys, JWT) — only ids and view state

## RLS audit (when touching data)

For each table you read or write:

- [ ] SELECT policy: who can see this row?
- [ ] INSERT policy: required columns set on the client write?
- [ ] UPDATE policy: client only updates own rows?
- [ ] DELETE policy: hard delete vs soft (e.g. `cancellations`)?
- [ ] FK direction matches schema (`mentor_id` → `mentor_profiles.id`, NOT `auth.users.id`)

Note recurring RLS surprises in `CLAUDE.md` only if the user asks.

## Naming consistency

- React component files: PascalCase `.jsx` (`MentorAvatar.jsx`, `OnboardingModal.jsx`).
- Hooks: `useX.js` in `utils/` or `hooks/` (`useInView.js`, `useFooterOffset.js`).
- API modules: lowerCamelCase `.js` matching the domain (`mentors.js`, `aiMatching.js`).
- Constants: `SCREAMING_SNAKE` for true constants (`SESSION_TYPES`, `APPEARANCE_STORAGE_KEY`).
- CSS custom properties: kebab-case under prefixes `--bridge-*`, `--color-*`, `--lp-*`, `--p-*`, `--a-*`.

When you find a misnamed file, rename in one commit, fix imports in another.

## Duplicate logic consolidation

Common duplications to look for:

- Two functions both filtering mentors by `tier` — consolidate in `api/mentors.js`.
- Two reveal/scroll observer hooks — use existing `useInView` + `<Reveal>`.
- Two avatar fallback systems — use `MentorAvatar`.
- Two appearance/theme apply paths — use `applyAppearance()` from `utils/appearance.js`.
- Two date/time formatters — pick one, prefer `Intl.DateTimeFormat`.

Don't over-DRY. If two pieces look similar but evolve independently
(landing hero vs profile hero), keep them separate.

## File-size triggers

If a file exceeds these, consider splitting:

| File type | Soft cap |
|---|---|
| Page component | 600 lines |
| Reusable component | 300 lines |
| API module | 250 lines |
| Hook | 120 lines |
| CSS file | 800 lines (`index.css` is exempt — keep utilities centralised) |

Bridge has known offenders (`MentorProfile.jsx`, `Profile.jsx`, `VideoCall.jsx`,
`Settings.jsx`, `MentorOnboarding.jsx`). Split only when refactoring an
adjacent feature; don't refactor purely for line count.

## Type safety in JS-only repo

This repo is JSX, no TypeScript. Compensate with:

- JSDoc on exported functions in API modules and utils. Pattern from `appearance.js`:
  ```js
  /** @param {'light' | 'dark' | 'system'} preference */
  export function applyThemePreference(preference) { … }
  ```
- Inline assertions at boundaries where you can't trust input.
- Don't add TypeScript without explicit user approval — it's a project-wide change.

## ESLint must pass

```bash
npm run lint --prefix client
```

`eslint.config.js` includes `react-hooks` and `react-refresh` plugins.
Common warnings:

- `react-hooks/exhaustive-deps` — usually a real issue; either add the dep or extract a stable callback. The `useInView` exception (`// eslint-disable-next-line`) is intentional.
- `react-refresh/only-export-components` — only export the component from a `.jsx` file; helpers go elsewhere.

## Investor-demo readiness checklist

Run before any external demo:

- [ ] No console errors or warnings on landing, dashboard, mentor profile, video call init
- [ ] Lighthouse perf ≥ 85 on landing
- [ ] Lighthouse a11y ≥ 95
- [ ] Cold-cache landing first paint < 2 s on 4G throttle
- [ ] `npm run build` clean, no warnings
- [ ] Auth → register → login → book → cancel → review path works end-to-end
- [ ] All 3 palettes look right; theme toggle persists
- [ ] Mobile (Safari iOS, Chrome Android) sanity check
- [ ] No leaked `VITE_*` keys to wrong env
- [ ] All TODO comments tracked or removed

## Anti-patterns to delete on sight

- `eslint-disable` without a reason comment
- `// FIXME` older than two weeks
- `useEffect` with empty deps that calls a setState in a loop (infinite renders waiting to happen — review when found)
- `setTimeout(fn, 0)` (almost always papering over a render-order bug)
- `JSON.parse(JSON.stringify(x))` deep clone (use `structuredClone`)
- `.toString()` chains where template literals would do
- Inline arrow handlers on long-lived list items (use `useCallback` only when measuring shows real re-render cost)

## Final pass

Before declaring cleanup done:

1. `git diff --stat` — does the scope match what was asked?
2. Build + lint clean.
3. Manually click through every changed surface.
4. Summary to user: what was removed, why, anything intentionally deferred.
