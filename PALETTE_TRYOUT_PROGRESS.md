# Color Palette Tryout — Progress & Handoff

Branch: `feature/color-palette-tryout` (off `main`)
Status: working-tree changes only, **no commits yet**.
Diff size: 60 files changed, ~1015 insertions / ~960 deletions.

---

## What this build does

3 palette directions live simultaneously, each scoped to a route group, so all
three can be evaluated in real product context without rebuilding.

- **Modern Signal** (indigo `#4338CA`) — `/`, `/login`, `/register`, `/about`, `/pricing`
- **Grounded Guidance** (teal `#0B5F56`) — `/mentors`, `/mentors/:id`, `/resume`, `/onboarding`, all `/<footer>/*`
- **Quiet Authority** (blue `#175CD3`) — `/dashboard`, `/profile`, `/settings`, `/session/:id/video`, `/intake/:id`

Mapping derived from the GPT-5 "Best Showcase" notes (see prior research).
The mapping lives in `client/src/utils/routePalette.js` — change there if you
want to stress-test by swapping which palette is on which route group.

---

## Architecture

Three layers, all in `client/src/appearance.css`:

- **Layer A — Semantic palette tokens (`--color-*`).** Defined per-palette ×
  per-theme via `html[data-palette="..."]` selectors. 6 selector blocks total
  (3 palettes × light + dark). Tokens: `primary`, `primary-hover`, `secondary`,
  `accent`, `bg`, `surface`, `surface-raised`, `surface-muted`, `border`,
  `border-strong`, `text`, `text-secondary`, `text-muted`, `success`,
  `warning`, `error`, `info`, `on-primary`.
- **Layer B — `--bridge-*` rebinding.** Existing `--bridge-canvas`,
  `--bridge-surface`, `--bridge-text`, `--bridge-accent`, atmosphere meshes,
  shadow rings, gutters, scrollbar etc. are now derived from `--color-*` —
  every existing consumer auto-switches per palette.
- **Layer C — Tailwind orange-N / amber-N re-skin.** Inside each
  `[data-palette]` block, every orange/amber Tailwind utility (`bg-orange-500`,
  `from-orange-600`, `border-amber-200`, `ring-orange-500`, etc.) is
  re-mapped to a 50–900 ramp pulled from the active palette. The codebase's
  thousands of legacy orange-led class strings track the active palette
  without per-file edits.

Per-route palette is applied to `<html data-palette="…">` from `App.jsx`'s
`useEffect` so portals/modals (`FeedbackFAB`, `NotificationPanel`,
`MentorTiersModal`, `OnboardingModal`, `ReviewModal`, `CancellationModal`)
inherit it via the cascade — no portal wrappers needed.

Default palette = Modern Signal (set on `html` so unmatched routes / pre-mount
paint render correctly).

---

## Files added

- `client/src/utils/routePalette.js` — pathname → palette name resolver +
  human label helper (`paletteLabel`).
- `client/src/components/PaletteDevBadge.jsx` — DEV-only fixed badge in the
  bottom-right corner showing `<palette> · <theme>`. Gated on
  `import.meta.env.DEV` so it never ships to production. Mounted in `App.jsx`.

## Files materially edited (token-wired)

- `client/src/appearance.css` — full rewrite around 3-palette system.
- `client/src/index.css` — focus rings, scroll progress, selection,
  cursor-glow, hero-mesh utility, shadow tiers, `text-gradient-bridge`,
  `border-gradient-bridge`, scrollbars, `l-pulse-ring` keyframes — all
  reference `var(--color-*)` now.
- `client/src/utils/appearance.js` — added `applyPalette()`,
  `PALETTE_NAMES`, `DEFAULT_PALETTE`.
- `client/src/App.jsx` — applies palette on `<html>` per pathname; mounts
  `<PaletteDevBadge />`.
- `client/src/components/BridgeGlobalAtmosphere.jsx` — aurora layers
  → `--color-primary` / `--color-accent` / `--color-secondary`.
- `client/src/components/LoadingSpinner.jsx` — halo + arcs + B-mark gradient
  → palette tokens.
- `client/src/components/MentorAvatar.jsx` — replaced 12 hardcoded Tailwind
  bg-* classes with 12 deterministic palette-token mixes (still
  name-stable per mentor).
- `client/src/components/SessionTypeCard.jsx` + `client/src/constants/sessionTypes.js`
  — 4 session types now differentiate via a single `hueVar` per type
  (primary / success / info / accent), tints + borders + icon color, not four
  loud hues. `SESSION_TYPES.key` values untouched (backend contract preserved).
- `client/src/pages/landing/HeroSection.jsx` — hero CTA pulse / neon ring /
  cta glow / grid / drop-shadows in the embedded `<style>` block all driven
  by tokens.
- `client/src/pages/landing/IntroLoader.jsx` — molten gradient + SVG stops +
  ember particles → palette gradient (white → accent → primary → primary-hover
  → secondary). Sparkles/star pinpoints are `#ffffff` (light dots regardless
  of palette).
- `client/src/pages/landing/FinalCtaSection.jsx` — template-literal alpha
  expressions converted to `color-mix` (regex couldn't bind dynamic alphas).
- `client/src/pages/dashboard/MenteeDashboardContent.jsx` /
  `MentorDashboardContent.jsx` — "no session" hero banner gradient → palette.
- `client/src/pages/dashboard/dashboardCinematic.jsx` — goal-meter SVG ring
  stops → palette.
- `client/src/pages/IntakeCall.jsx` — AI orb (speaking/listening) and
  question-pace dots → palette.

## Files mass-rewritten via mechanical sweep

A one-shot Python regex pass converted **358 `rgba(...)` triples** of the
brand-orange / amber family across **50 files** to `color-mix(in srgb,
var(--color-X) N%, transparent)`. Mapping used:

| RGB triple | Token |
|---|---|
| `rgb(234, 88, 12)` (orange-600) | `--color-primary` |
| `rgb(180, 80, 10)` | `--color-primary` |
| `rgb(140, 55, 8)` | `--color-primary-hover` |
| `rgb(100, 45, 8)` | `--color-secondary` |
| `rgb(251, 146, 60)` (orange-400) | `--color-primary` |
| `rgb(253, 186, 116)` (orange-300) | `--color-accent` |
| `rgb(254, 215, 170)` (orange-200) | `--color-accent` |
| `rgb(253, 230, 138)` (amber-200) | `--color-accent` |
| `rgb(251, 191, 36)` (amber-400) | `--color-accent` |
| `rgb(255, 247, 237)` / `(255, 237, 213)` | `--color-on-primary` |
| `rgb(28, 25, 23)` (stone-900 baked shadows) | `--color-secondary` |

Files touched by the sweep: see git diff. DevPortal/* was excluded.

---

## Files deliberately NOT touched

Per WIP guardrails:

- `client/src/pages/dashboard/{useDashboardData,SessionCalendar,MentorAvailabilityModal,IntakeSummaryModal,dashboardLive}.jsx` — color-class re-skin via Layer C only, no manual edits (Omar's WIP).
- `client/src/pages/MentorOnboarding.jsx` — Layer C only (Muaz's WIP).
- `client/src/components/ReviewModal.jsx` — Layer C only (Irshad's reviews WIP); only the global RGB sweep ran here.
- `client/src/pages/VideoCall.jsx` — color tokens via Layer C only; no signaling logic touched.
- `client/src/pages/DevPortal/*` — explicitly out of scope.

## Hardcoded hex deliberately preserved

These are intentional UI signals, not brand chrome — they read correctly
across all 3 palettes:

- `#f59e0b` star fills in `MentorProfile.jsx`, `Mentors/MentorCard.jsx` (rating stars are universally amber, like LinkedIn / Yelp / Google).
- Tier badge colors in `Mentors/MentorTiersModal.jsx` (Rising = emerald, Established = sky, Expert = violet, Master = amber).
- `DRAW_COLORS` in `VideoCall.jsx` — drawing-tool palette options, not brand chrome.
- Score-band colors in `ResumeReview.jsx` — score-tier signaling.

---

## What's pending

1. **Browser verification of the golden path** by you (the human):
   `Landing → Register → Mentors → MentorProfile → book a session → Dashboard → accept request → Join Call`. Walk it in light + dark mode, confirm the dev badge shows palette switching at each route group.
2. **Dashboard status badges** (`pending` / `accepted` / `declined` /
   `completed` / `cancelled`) and "Join Call" button — these mostly rely on
   `bg-emerald-*`, `bg-sky-*`, `bg-rose-*`, etc. which Layer C does NOT
   re-skin (they aren't orange/amber). Visually they should still look
   coherent because the surrounding chrome is palette-aware, but if you want
   them palette-tied, point them at semantic tokens (`--color-success` /
   `--color-info` / `--color-warning` / `--color-error`). Files:
   `client/src/pages/dashboard/dashboardShared.jsx`, `Dashboard.jsx`.
3. **Top-2 stress test:** once you narrow to two palettes, swap which palette
   is on the dashboard vs. the mentor profile (one-line change in
   `routePalette.js`) to evaluate how the same `SessionTypeCard`, status
   badges, and CTAs look under the other palette.

---

## How to resume in Cursor

1. **Stop any leftover dev server** (this session already killed its own):
   ```bash
   pkill -f vite; pkill -f 'node --watch'
   ```
2. **Open the workspace in Cursor**, switch to the `feature/color-palette-tryout` branch (already checked out).
3. **Start dev:**
   ```bash
   cd client && npm run dev
   ```
4. **One-shot prompt to paste into Cursor's chat** so it picks up the same context:

   > Continuing the 3-palette tryout build on branch
   > `feature/color-palette-tryout`. Read `PALETTE_TRYOUT_PROGRESS.md` at the
   > repo root for full context: architecture, page-to-palette mapping, what's
   > been refactored, and what's pending. Don't commit yet. The next steps
   > are: (1) walk the golden path and report any visual regressions,
   > (2) optionally migrate dashboard status badges to semantic tokens, and
   > (3) prepare a final diff summary so I can decide which palette wins.

5. **Switch palettes manually for stress-testing:** edit
   `client/src/utils/routePalette.js`. The dev badge (bottom-right) shows the
   active palette name + theme on every route, so you can see the result
   immediately on HMR.
6. **Switch theme** (light/dark) via the existing Settings page or by
   toggling the `theme-dark` class on `<html>` in DevTools.

---

## How to evaluate

1. Visit each route group with the dev badge visible:
   - Landing, Pricing, Register, Login, About → **Modern Signal**
   - Mentors browse, a mentor profile, Resume, Mentor onboarding, About,
     footer pages → **Grounded Guidance**
   - Dashboard, Profile, Settings, a video call URL, intake URL →
     **Quiet Authority**
2. For each, watch the same recurring components: Navbar pill / brand mark,
   Footer CTA, `SessionTypeCard`, `MentorAvatar`, `LoadingSpinner`,
   `BridgeGlobalAtmosphere`, focus rings on inputs, the scroll-progress
   bar, status pills.
3. Repeat in dark mode.
4. After narrowing to a top-2: swap the dashboard mapping to your other
   finalist in `routePalette.js` and re-walk the dashboard + a mentor
   profile to stress-test the same chrome under both palettes.

## Follow-up (after a winner is chosen)

- Delete the two losing `[data-palette="..."]` blocks (light + dark) from
  `appearance.css`.
- Delete `routePalette.js` + the `applyPalette` call in `App.jsx`; keep the
  winner as the only `--color-*` set on `html`.
- Delete `PaletteDevBadge.jsx` and its mount in `App.jsx`.
- Remove `PALETTE_NAMES` / `DEFAULT_PALETTE` / `applyPalette` from
  `utils/appearance.js`.
- Update marketing imagery / OG cards / logo PNGs to match the winner's hue.
- Decide on dashboard status-badge token policy and finish that sweep.
- Delete this file (`PALETTE_TRYOUT_PROGRESS.md`).
