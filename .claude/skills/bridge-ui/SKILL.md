---
name: bridge-ui
description: >-
  Bridge UI system: contrast-pair contract, palette tokens, type, spacing,
  elevation, components (button, card, modal, form, chip, avatar), focus,
  accessibility, visibility audit. Use when designing or modifying any
  component, surface, button, card, modal, form, badge, chip, navbar,
  dropdown, tooltip, toast, avatar, or visual element — and whenever a
  text, font, button, or color looks wrong, invisible, washed out,
  low-contrast, or off-palette in any of the three Bridge palettes
  (modern-signal, grounded-guidance, quiet-authority).
---

# Bridge UI system

Bridge runs three palettes (`modern-signal`, `grounded-guidance`, `quiet-authority`)
across light and dark modes — six visual states, one component tree. The
investor pitch depends on every screen reading like one product across all
six. The most common failure is **text or buttons disappearing into the
background** because surface and text were chosen from incompatible
pairings. This skill exists to prevent that.

For page-level composition see `bridge-web-design`.
For motion see `bridge-motion` and `bridge-transitions`.

---

## 0. Color authority — respect the existing palette system

The Bridge codebase already owns its colors. Token values (`--color-primary`,
`--color-bg`, `--color-text`, the orange/amber/stone re-skin ramps, the
`--lp-*` landing gradient stops) are defined in **exactly two places** —
and only those two places:

- `client/src/appearance.css` — three global palettes (`modern-signal`, `grounded-guidance`, `quiet-authority`) × light + dark, plus the orange/amber/stone Tailwind re-skins.
- `client/src/pages/landing/index.jsx` — landing-route override (`html.is-landing-route`) that re-skins the same tokens for the marketing canvas.

Different routes legitimately resolve `--color-primary` to different hues —
that is the active palette-testing system, not a bug. Components **consume**
tokens; they never **define** them.

| Permitted | Not permitted |
|---|---|
| Reference any token in JSX or CSS (`var(--color-primary)`, `--bridge-text`, `--lp-grad-from`) | Add new color values inside a component's `style` |
| Add a new `@utility` in `index.css` that reads existing tokens | Edit token values in `appearance.css` without explicit user approval |
| Add a new palette-scoped CSS block when a new route needs one (mirror the landing pattern) | Hardcode hex/rgb in any component except locked artifacts (see Pair C / D) |
| Repair a component's pair class to fix bad contrast | Retune the palette to mask a pair-class bug |

If something "looks wrong" in a particular palette, the cause is **never** the
palette — it's a pair-class violation in the component (Section 1). Fix the
component. Do not change the palette.

If a new color is genuinely needed, ask the user which palette family it
belongs to, then add it across all three palettes × both themes in
`appearance.css` so the component works on every route.

---

## 1. The contrast-pair contract (the only rule that matters)

Every visible element has **two coupled decisions**: the surface beneath it
and the foreground (text, icon, border) on top. These are chosen **as a
pair**, never independently. Mixing pairs is the cause of every invisible-
text bug in this codebase.

There are exactly four legal pair classes. Pick one per element. Do not mix.

### A · Adaptive pair (default for app chrome)

Surface and foreground both follow the active palette and theme. Use this
for cards, panels, page sections, dashboard surfaces — anywhere the element
is "part of" the active palette.

```jsx
// Page card (adaptive)
<div
  style={{
    backgroundColor: 'var(--bridge-surface)',
    color: 'var(--bridge-text)',
    boxShadow: '0 0 0 1px var(--bridge-border) inset',
  }}
>
  <p style={{ color: 'var(--bridge-text-secondary)' }}>Body copy</p>
  <p style={{ color: 'var(--bridge-text-muted)' }}>Caption</p>
</div>
```

Permitted text tokens on adaptive surfaces (`--bridge-canvas`, `--bridge-surface`,
`--bridge-surface-raised`, `--bridge-surface-muted`):

- `--bridge-text` — primary
- `--bridge-text-secondary` — body
- `--bridge-text-muted` — captions, helper text
- `--color-primary` — accent words, eyebrows, links

### B · Inverted-primary pair (for primary actions)

Surface is the brand primary; foreground is its paired on-color. Both move
together because `--color-on-primary` is defined per-palette to guarantee
contrast against `--color-primary`.

```jsx
// Primary CTA
<button
  style={{
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
  }}
>
  Get started
</button>
```

Allowed only as a pair: `(--color-primary, --color-on-primary)`. **Never** put
`--bridge-text` on `--color-primary` — in some palettes both resolve to dark
values and the label disappears.

### C · Locked-dark pair (for floating chips, video toolbars, hero overlays)

Surface is intentionally dark in **both** light and dark mode (e.g.
`var(--lp-chip-bg)` resolves to `rgba(10,10,20,0.96)` light and
`rgba(7,7,15,0.92)` dark). Foreground must be **absolute white** or near-white,
**never** an adaptive token.

```jsx
// Floating chip on hero (locked dark surface)
<div
  style={{
    backgroundColor: 'var(--lp-chip-bg)',
    border: '1px solid var(--lp-chip-border)',
  }}
>
  <p className="text-white">98% AI Match</p>
  <p className="text-white/60">Maya · PM Strategy</p>
</div>
```

Allowed text on locked-dark: `text-white`, `text-white/90`, `text-white/70`,
`text-white/60`. Forbidden: `--bridge-text`, `--bridge-text-muted`,
`text-stone-*`, `text-slate-*`. Those become invisible in light mode.

### D · Locked-light pair (rare — print-style content blocks)

Surface is intentionally white/cream in both modes (e.g. an email-style
preview). Foreground must be absolute dark. Only use when the element
represents a fixed-light artifact (a paper letter, a screenshot frame).

```jsx
<div className="bg-white text-stone-900">…</div>
```

If you find yourself reaching for this outside of artifact previews, you
probably want adaptive (A) instead.

---

## 2. The visibility verification (run mentally before shipping any element)

For **every** colored text or icon you place, answer:

1. **Which surface is directly behind it?** Read the parent's `backgroundColor` or fall back to `var(--bridge-canvas)`.
2. **Which pair class is that surface?** A, B, C, or D.
3. **Is my foreground in the same class?** If yes, ship. If no, fix.

Failure modes this catches:

| Symptom | Cause | Fix |
|---|---|---|
| Text invisible in light mode | Adaptive text on locked-dark surface | Switch text to `text-white` or `text-white/70` |
| Button label gone in dark mode | `text-stone-900` on `var(--color-primary)` | Use `var(--color-on-primary)` |
| Caption washed out on hero overlay | `--bridge-text-muted` on dark gradient overlay | Use `text-white/60` (locked-dark pair) |
| Gradient text shows blank | Background-clip text without `color` fallback | Add `color: 'var(--bridge-text)'` as fallback |
| Icon-only button vanishes on hover | Hover surface == icon color | Re-pair the hover surface or change icon color |

---

## 3. Gradient-text safety

When using `text-gradient-bridge` or any `background-clip: text` pattern,
the text becomes transparent — if any gradient stop variable is undefined or
the browser falls back, the entire string disappears. Always provide a solid
fallback color.

```jsx
<span
  className="text-gradient-bridge"
  style={{ color: 'var(--bridge-text)' }}   // fallback before gradient overrides
>
  highlight
</span>
```

The same rule applies to `text-sheen`. Never ship gradient text without a
visible fallback color set in the same `style`.

---

## 4. Transparency stacking rule

`color-mix(... transparent)` and `bg-white/10` patterns multiply when nested.
A `color: var(--bridge-text-muted)` (already faded) inside a
`bg-bridge-surface-muted` panel inside an aurora region can fall to
~25% effective opacity — well below the 4.5:1 AA threshold.

Three concrete rules:

1. **Body copy never uses transparent foreground.** Solid `--bridge-text` or `--bridge-text-secondary` only.
2. **Captions** (`--bridge-text-muted`) only on **solid** surfaces (`--bridge-surface`, `--bridge-canvas`), never on `bg-white/5`-style translucent surfaces.
3. **Decorative chips** can use `text-white/60` only when the surface is locked-dark and the chip is non-essential context.

---

## 5. Token reference (read alongside `appearance.css`)

### Surfaces

| Token | Use |
|---|---|
| `--bridge-canvas` | Page background. Same as `--color-bg`. |
| `--bridge-surface` | Default card / panel. |
| `--bridge-surface-raised` | Modals, dropdowns, anything elevated. |
| `--bridge-surface-muted` | Insets, recessed wells, code blocks, secondary tiles. |
| `--lp-card-bg` | Mentor preview card on landing (locked surface). |
| `--lp-chip-bg` | Floating chips (locked-dark, both modes). |

### Text

| Token | Min contrast on adaptive surface |
|---|---|
| `--bridge-text` | 7:1+ (AAA) |
| `--bridge-text-secondary` | 4.5:1+ (AA) |
| `--bridge-text-muted` | 4.5:1 against `--bridge-surface`, **not** against translucent surfaces |
| `--bridge-text-faint` | Decorative only — never primary information |

### Brand & accents

| Token | Use |
|---|---|
| `--color-primary` | Primary CTAs, accent words, focus rings, eyebrows |
| `--color-primary-hover` | Hover state for primary |
| `--color-on-primary` | Text/icons on primary surface (paired only) |
| `--color-secondary` | Brand secondary (sparingly) |
| `--color-accent` | Tertiary accent — gold/cyan/teal per palette |

### Status (use as solid colors only)

| Token | Use |
|---|---|
| `--color-success` | Confirmation, positive change |
| `--color-warning` | Pending, attention |
| `--color-error` | Destructive, validation failure |
| `--color-info` | Neutral information |

For the always-emerald online dot the project hard-codes `#10B981` /
`#059669` — that's intentional (status conveys meaning across palettes).

### Borders

`--bridge-border` (default), `--bridge-border-strong` (emphasized). Always
solid; never `border-white/10` on adaptive surfaces because in light mode it
disappears.

### Tailwind orange/amber re-skin

`text-orange-*`, `bg-orange-*`, `border-orange-*`, gradient stops, ring
colors are re-skinned per palette via `appearance.css`. They are safe to use.
**Other Tailwind color families** (`sky`, `pink`, `fuchsia`, `slate-*`) are
not re-skinned and will not adapt — avoid them outside of locked-pair
contexts where their fixed hue is intentional.

`text-stone-*` and `bg-stone-*` are also re-skinned to bridge tokens
(see `appearance.css` lines 274–290) — safe to use.

---

## 6. Type system

Two families, one in 95% of cases.

- **`font-display`** (Outfit, sans) — body and UI default. Tight tracking (`-0.02em`). Heavy weights for hero (`font-black` 900), `font-bold` (700) for headings, `font-semibold` (600) for buttons, `font-medium` (500) for body.
- **`font-editorial`** (Instrument Serif italic) — single-word accent moments only (Landing hero, About hero). Never paragraphs. Never on UI surfaces.
- **`font-fraunces`** — reserved for editorial product moments; do not deploy without design intent.

Numbers must always use `tabular-nums` — ratings, prices, counts, durations,
phone numbers. This is non-negotiable; without it digits jitter as values
update.

Fluid scale (use `clamp` instead of breakpoint switches):

| Use | Scale |
|---|---|
| Hero headline | `clamp(2.85rem, 7.6vw, 6rem)` |
| Section heading | `clamp(2rem, 5vw, 4rem)` |
| Sub-headline / tagline | `clamp(1.5rem, 3.4vw, 2.4rem)` |
| Body | `15–17px`, `leading-[1.65]` |
| Caption | `12–13px`, `leading-snug` |
| Eyebrow / label | `10–11px`, `font-black uppercase tracking-[0.16em–0.32em]` |

Line-height: tighter for display (`leading-[0.96]–[1.02]`), looser for body
(`leading-[1.55]–[1.7]`). Never use Tailwind's default `leading-normal` for
body — too tall for tight type.

---

## 7. Spacing rhythm

Section vertical padding is the structural unit:

- Sections: `py-24 sm:py-28 lg:py-32`
- Subsections within a page: `py-16 sm:py-20`
- Card internal: `p-6` (compact), `p-7 sm:p-9` (standard), `p-9 sm:p-12` (hero)

Containers:

- `max-w-bridge` (88rem) — nav-aligned, wide hero/marketing
- `max-w-7xl` — most content
- `max-w-6xl` — denser content tiles
- `max-w-3xl` — long-form prose

Horizontal padding: `px-5 sm:px-8` is the project default.

Internal gap rhythm:

- Between chips: `gap-1.5`
- Card header items: `gap-2.5`–`gap-3.5`
- Body sections within a card: `gap-7`
- Eyebrow → heading: `mt-3`
- Heading → body: `mt-7`–`mt-8`
- Body → CTA: `mt-9`–`mt-10`

---

## 8. Elevation

Shadows are tiered, never freelanced. Use the existing utilities in
`client/src/index.css`. They encode warmth, ring, and falloff together.

| Utility | Use |
|---|---|
| `shadow-bridge-tile` | Flat interactive tile |
| `shadow-bridge-card` | Default card |
| `shadow-bridge-glow` | Hero / featured card |
| `shadow-bridge-float` | Modals, popovers, overlays |
| `shadow-bridge-accent` | Tier badges, primary-tinted highlights |

Never write raw `shadow-2xl shadow-black/30`. The Bridge shadow tier already
includes the inset ring, the soft drop, and the colored glow in one stack.

---

## 9. Components

### Button hierarchy (one-screen rule)

A view shows **at most one** primary CTA, **at most one** secondary, and
unlimited tertiary text links. If you need a third button, you have two
features fighting for the same screen — split them.

#### Primary

```jsx
<Link
  to="/somewhere"
  className="lp-cta group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-[15px] font-bold transition-all duration-300 hover:-translate-y-0.5 ring-bridge"
  style={{
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    boxShadow: '0 18px 40px -12px color-mix(in srgb, var(--color-primary) 60%, transparent)',
  }}
>
  <span className="relative z-10 flex items-center gap-2">
    Get started
    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
  </span>
</Link>
```

The `(primary, on-primary)` pairing is mandatory.

#### Secondary

Ghost with inset ring:

```jsx
style={{
  color: 'var(--bridge-text-secondary)',
  boxShadow: '0 0 0 1px var(--bridge-border) inset',
}}
```

Hover: switch background to `var(--bridge-surface-muted)`. Never recolor the
text on hover beyond `var(--bridge-text)`.

#### Tertiary

Plain text-button: `text-[14px] font-semibold` colored
`var(--bridge-text-secondary)`, hover to `var(--color-primary)`.

#### Destructive

Same shape as primary; surface = `var(--color-error)`; foreground = white
(this is a locked-dark pair — `--color-error` is dark in every palette).

### Card

- Radius ladder: `rounded-3xl` hero/featured · `rounded-2xl` default · `rounded-xl` inline pills.
- Surface: adaptive pair — `var(--bridge-surface)` + 1 px ring inset.
- Hover: `lift-sm` (–3 px) or `lift-md` (–6 px). Never animate `width`/`height`.
- Featured: animated gradient border via `border-gradient-bridge` + `animate-border-bridge`.
- Glow accent: `pointer-events-none absolute` blurred radial inside the card with `aria-hidden`.

### Modal / dialog

Match `OnboardingModal` / `FeedbackModal` / `ReviewModal` /
`CancellationModal`:

- Backdrop: `fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm`, click to close.
- Panel: `var(--bridge-surface-raised)` adaptive pair, `shadow-bridge-float`, `p-7 sm:p-9`, `rounded-3xl`.
- Enter: `animate-scale-in` (already in `index.css`).
- Required: `role="dialog"`, `aria-modal="true"`, labelled, focus trap, `Esc` closes, focus restored on close, body scroll locked while open.

### Form input

- Surface: `color-mix(in srgb, var(--bridge-surface) 70%, transparent)` on solid backgrounds, **solid `var(--bridge-surface)`** on translucent backgrounds.
- Border: `var(--bridge-border)` resting; `var(--color-primary)` focused, plus a 4 px focus ring `0 0 0 4px color-mix(in srgb, var(--color-primary) 18%, transparent)`.
- Label: `text-[12px] font-bold uppercase tracking-[0.16em]` colored `var(--bridge-text-muted)`. Always associated to the input.
- Helper text below: 13 px `var(--bridge-text-muted)` solid surface only.
- Error: border `var(--color-error)` + helper text in `var(--color-error)`. Never icon-only.
- Required indicator: `*` in `var(--color-primary)` next to label.

### Chips, badges, status pills

- Pill base: `rounded-full px-2.5 py-1 text-[10.5px] font-semibold`.
- Adaptive pill: surface `var(--bridge-surface-muted)`, ring inset, text `var(--bridge-text-secondary)`.
- Locked-dark chip (hero): see Pair C above.
- Status dot: `h-1.5 w-1.5 rounded-full` colored, optional `animate-ping` halo.
- Tier badge: `uppercase tracking-[0.10em–0.32em]` font-black.

### Avatar

Use `MentorAvatar` for mentor photos. Initials fallback uses gradient
`linear-gradient(135deg, var(--lp-grad-from), var(--lp-grad-to))` with
**absolute white** initials — locked-dark pair, never adaptive text.

### Iconography

`lucide-react` only. Sizes: `h-3.5 w-3.5` (chips), `h-4 w-4` (buttons),
`h-5 w-5` (large CTAs). Always named imports. Every icon-only button gets an
`aria-label`.

---

## 10. Focus, keyboard, accessibility

- Global `*:focus-visible` is set in `index.css`. Never disable it.
- For richer focus presentation use the `ring-bridge` utility on CTAs.
- Every interactive element: keyboard reachable, activates on `Enter` and `Space`.
- Modals: focus trap, `Esc` closes, focus restored.
- Live regions: `role="status"` for non-critical, `role="alert"` for errors.
- All animations short-circuit under `(prefers-reduced-motion: reduce)`.
- Tap targets ≥ 44 × 44 px on touch.

WCAG targets: body text ≥ 4.5:1, large text and UI ≥ 3:1. The token system
is tuned to hit these on adaptive pairs **only**. Locked pairs and
transparency stacks must be verified visually in all three palettes and
both themes.

---

## 11. Loading, empty, error — required for every data-bound view

| State | Pattern |
|---|---|
| Loading | `<LoadingSpinner />` or skeleton matching final layout dimensions |
| Empty | Icon + headline + one-line subtext + primary CTA |
| Error | `var(--color-error)` border, retry button, plain-language message |

Never render `null` for these states — that's a layout flash. Skeleton
height must match real-content height; otherwise the page jumps on swap.

---

## 12. Auditing and repairing existing UI (color, font, button bugs)

When the user reports "the button is invisible", "wrong text color", "wrong
font", "looks broken in dark mode", "off-palette", or asks for a UI cleanup,
run this audit in order. Each category maps back to the pair contract
(Section 1), the token reference (Section 5), or the type system (Section 6).

### A · Pair-class violations (the disappearing-text bug)

Pair-class mixing is the #1 visibility bug. Inspect these patterns:

```bash
# Locked-dark surfaces — text inside must be text-white*, never --bridge-text*
rg -n 'lp-chip-bg|--lp-card-bg' client/src

# text-white on adaptive surfaces — invisible in light mode
rg -n 'text-white' client/src/components client/src/pages

# --bridge-text* on --color-primary buttons — invisible in some palettes
rg -n -B2 -A2 'var\(--color-primary\)' client/src/components client/src/pages
```

For each hit, confirm surface and foreground share the same pair class (A, B,
C, or D from Section 1). Re-pair — never "adjust the color".

### B · Raw color literals in components

```bash
rg -n '#[0-9a-fA-F]{3,8}\b' client/src/components client/src/pages
rg -n 'rgb\(|rgba\(|hsl\(' client/src/components client/src/pages
```

For each match, classify:

- **Keep** — emerald online dot (`#10B981`, `#059669`), gold star fill (`#F59E0B`), gradient stops inside locked-dark chips, brand-locked artifacts.
- **Replace** — anything else. Map to the right token from Section 5.

### C · Non-palette Tailwind color families

Only `orange-*`, `amber-*`, and `stone-*` are re-skinned per palette in
`appearance.css`. Other families are fixed hues that won't follow the
palette.

```bash
rg -n 'text-(slate|gray|zinc|neutral|sky|blue|cyan|teal|emerald|green|lime|yellow|red|rose|pink|fuchsia|purple|violet|indigo)-[0-9]' client/src/components client/src/pages
rg -n 'bg-(slate|gray|zinc|neutral|sky|blue|cyan|teal|emerald|green|lime|yellow|red|rose|pink|fuchsia|purple|violet|indigo)-[0-9]' client/src/components client/src/pages
```

Replace with `--bridge-*` / `--color-*` tokens unless the fixed hue is
intentional (status indicators, locked artifacts).

### D · Font violations

`font-display` (Outfit) is the body and UI default — present on `<body>` so
you rarely need to set it. `font-editorial` is single-word accent only.
`font-fraunces` is reserved.

```bash
rg -n 'font-(sans|serif|mono)' client/src
rg -n 'font-editorial|font-fraunces' client/src
rg -n "fontFamily" client/src/components client/src/pages
```

- Tailwind default `font-sans` / `font-serif` / `font-mono` → switch to `font-display` or remove (Outfit is already the body default).
- `font-editorial` on a paragraph or UI chrome → demote to `font-display`.
- Any `fontFamily` literal in a `style` prop → wrong; use one of the three families.

### E · Button hierarchy violations

A single viewport may show **one primary, one secondary, unlimited tertiary
text links**. Anything more is competing actions.

For each page touched:

1. Count primary CTAs (`backgroundColor: 'var(--color-primary)'` or `lp-cta`). More than one in a viewport = split the page or demote one.
2. Secondary uses the ghost pattern: `box-shadow: 0 0 0 1px var(--bridge-border) inset`, text in `var(--bridge-text-secondary)`. Other patterns (`bg-white/10` on adaptive surface, hardcoded gray, raw `border-gray-200`) are wrong.
3. Destructive uses `var(--color-error)` background + white foreground. Other patterns are wrong.
4. Hover states never recolor the label below `var(--bridge-text)`.

### F · Focus-state regressions

Disabled focus rings break accessibility and demo polish.

```bash
rg -n 'focus:outline-none' client/src
rg -n 'focus-visible:outline-none' client/src
```

Every match must be followed by a visible focus state (`ring-bridge`,
`focus-visible:ring-*`, or an explicit `box-shadow`). If not, restore the
ring.

### Deliverable when running an audit

1. **Findings list** — `file:line` per violation, grouped by category (A–F).
2. **Fix plan** — one line per violation naming the target token/pair.
3. **Apply** — use `multi_edit` per file; keep diffs tight.
4. **Verify** — toggle `html.theme-dark` and `html[data-palette="modern-signal" | "grounded-guidance" | "quiet-authority"]` in DevTools on every touched page. Confirm text + buttons visible in all six states.

Never auto-fix what might be intentional (status colors, locked-dark gradient
stops, gold star fill, brand-locked chips). Always classify before replacing.

---

## 13. Pre-ship verification

Before declaring a UI change done, run this checklist:

- [ ] Every colored text/icon belongs to one pair class (A, B, C, or D) — no mixing.
- [ ] No `text-stone-*` / `--bridge-text*` on locked-dark surfaces.
- [ ] No `text-white` on adaptive surfaces (it disappears in light mode).
- [ ] Gradient text has a solid `color` fallback.
- [ ] Captions only sit on solid surfaces, never translucent.
- [ ] Numbers use `tabular-nums`.
- [ ] Loading + empty + error covered.
- [ ] `:focus-visible` ring intact on every interactive el.
- [ ] Reduced-motion path verified.
- [ ] Tap targets ≥ 44 px on touch.
- [ ] Component verified in **all six states**: light + dark × `modern-signal` + `grounded-guidance` + `quiet-authority`. Toggle by setting `html.theme-dark` and `html[data-palette="…"]` in DevTools.

If any check fails, fix at the **pair level**, not by adding overrides.
