---
name: bridge-layout
description: >-
  Bridge layout craft — alignment, placement, spatial composition, visual
  weight, focal hierarchy, optical centering, baseline grid, 8-point system,
  CSS Grid vs Flexbox decisions, aspect ratios, container queries, stacking
  contexts, z-index discipline, asymmetric balance, edge tension, negative
  space. Use when anything looks misaligned, off-center, crooked, lopsided,
  cramped, floating, mispositioned, or visually unbalanced — and whenever
  composing a new section, dashboard view, modal, card, table, list, or
  any layout where spatial relationships matter.
---

# Bridge layout craft

The difference between an investor saying "this looks like a real product"
and "this looks like a side project" is alignment. Spacing, placement, and
visual weight are felt before they are seen. Bridge cannot afford even one
section that reads as crooked.

For tokens / surfaces / typography see `bridge-ui`. For section-to-section
narrative see `bridge-web-design`. For motion through layouts see
`bridge-motion`.

---

## 1. The four spatial principles

1. **Alignment is communication.** Every shared edge, baseline, or center says "these belong together". Mis-alignment says "I am still building this".
2. **Optical beats mathematical.** The eye does not measure pixels. Symmetric pixel placement often *looks* off; small adjustments make it *look* right.
3. **Weight balances composition.** Heavy elements (large, dark, dense) on one side need counterweight on the other — or deliberate asymmetry that earns the imbalance.
4. **Negative space is structure.** White space is not "leftover" — it is the frame that makes content readable, the rhythm that makes pages scan.

---

## 2. The 8-point grid (Bridge's spacing system)

Tailwind uses a 4 px base unit (`1` = 4 px, `2` = 8 px, `4` = 16 px). Bridge
in practice operates on an **8-point grid** — every meaningful spacing
value is a multiple of 8 px (with 4 px allowed for fine adjustments only).

| Token | px | Use |
|---|---|---|
| `gap-1.5` | 6 | Inline chip groups (the 4 px exception) |
| `gap-2` | 8 | Tightest legal gap |
| `gap-2.5` | 10 | Header rows (chip ↔ label) |
| `gap-3` | 12 | Card field rows |
| `gap-3.5` | 14 | Dense card content |
| `gap-4` | 16 | Default card grid |
| `gap-5` | 20 | Wider card grid (`sm:`) |
| `gap-6` | 24 | Tier card grid |
| `gap-7` | 28 | Within-card section breaks |
| `gap-8` | 32 | Wide tier card grid (`lg:`) |
| `mt-9` | 36 | Body → CTA |
| `mt-10` | 40 | Section internal break |
| `py-24` | 96 | Section vertical padding (mobile) |
| `py-32` | 128 | Section vertical padding (desktop) |

Avoid `gap-2.5` next to `gap-3` in the same composition — the difference
reads as accidental. Pick one rhythm per composition and stick to it.

---

## 3. Optical alignment vs mathematical alignment

Mathematical alignment puts the geometric center of two elements at the
same point. Optical alignment puts their *visual* centers there. The two
agree only when both elements have the same visual weight on each axis.

### When optical alignment matters

| Situation | What to do |
|---|---|
| Icon next to text in a button | Text baseline aligns with icon center, not icon baseline. `inline-flex items-center gap-2`. |
| Triangle / arrow inside a circle | Shift triangle ~1 px toward the open side (right-pointing → 1 px right) so it appears centered. |
| Right-pointing chevron in a menu row | Add `pr-3` to the chevron's container so it doesn't kiss the edge. |
| Heading above body copy | Use `mb-3`–`mb-7` not vertical center; vertical center makes headings feel detached. |
| Large number with a small label | Number's baseline aligns with mid-height of label, not its baseline. |
| Avatar circle next to a single line of text | `flex items-center` is fine. Multi-line text — align avatar to first line baseline. |
| Centered text in a button | Add 1–2 px more bottom padding than top. Type sits visually high in its line box. |

### Implementation patterns

```jsx
// Icon + text — optically centered via flex
<button className="inline-flex items-center gap-2 px-4 py-2.5">
  <Plus className="h-4 w-4" />
  <span>Add mentor</span>
</button>

// Stat with label — number baseline at label mid-height
<div>
  <p className="text-3xl font-bold tabular-nums">2,400</p>
  <p className="-mt-0.5 text-[10px] uppercase tracking-[0.2em]">Mentors</p>
</div>

// Right chevron in row — extra right padding
<a className="flex items-center justify-between pl-4 pr-3 py-3">
  <span>Account settings</span>
  <ChevronRight className="h-4 w-4" />
</a>
```

The `-mt-0.5` and `pr-3` adjustments are the optical corrections. They
look small in code; they look enormous in the rendered UI.

---

## 4. Vertical rhythm (baseline grid)

Type sits on a baseline. When baselines align across columns, the page
reads as a system. When they drift, the page reads as drafts stacked
together.

### Bridge's baseline rules

- Match `line-height` to multiples of the spacing unit. Body at `leading-[1.65]` × 16 px = 26.4 px → round visually to `mt-7` (28 px) gaps so the next line lands on grid.
- Headings break the baseline deliberately. `leading-[0.96]` is tighter than the body baseline; recover with explicit `mt-` after the heading.
- Inputs and buttons share the same line-box height (44 px = `py-3` with 14 px text). This makes form rows align with text rows.
- Card internal sections separate by `mt-7` (28 px) regardless of inner content height.

### When precision matters

For dense content (tables, lists with many rows), enforce a single
`leading` value (`leading-7` = 28 px) so every row consumes one grid cell.

```jsx
<table className="w-full text-[14px] leading-7">
  <thead>
    <tr className="text-left">
      <th className="font-semibold">Mentor</th>
      <th className="font-semibold">Sessions</th>
      <th className="font-semibold tabular-nums">Rating</th>
    </tr>
  </thead>
  <tbody>{rows.map(r => <Row key={r.id} {...r} />)}</tbody>
</table>
```

`leading-7` × 14 px text = 28 px row height = 8-grid aligned.

---

## 5. Visual weight and balance

Every element has a weight derived from area, color contrast, and
typographic prominence. Layouts feel balanced when weight resolves
across the composition.

### Weight scale (rough)

| Heavy | Light |
|---|---|
| Large | Small |
| Dark on light | Light on light |
| Filled | Outlined |
| Bold | Regular |
| Saturated | Desaturated |
| Centered | Edge-anchored |
| Single big element | Many small elements |

### Balance patterns

- **Symmetric balance** — equal weight on each side of a center axis. Use for forms, modals, footers, "calm" sections.
- **Asymmetric balance** — unequal weight that resolves through contrast. Use for hero (heavy left, accent right), product reveals, dashboards.
- **Radial balance** — content emanating from a focal point. Rare in Bridge; use for dashboards with a primary metric and surrounding sub-metrics.
- **Tension** — deliberate imbalance that creates energy. Use sparingly; one section per page max.

The Bridge hero is asymmetric: heavy left (headline + sub + CTAs) is
counterweighted by the floating preview card and chips on the right.
The preview card sits ~5–8% higher than the text column's vertical
center to create lift, not stillness.

---

## 6. Focal point hierarchy

Every layout has a primary focal point — the thing the eye lands on
first. Most have a secondary, sometimes a tertiary. More than three and
the layout reads as cluttered.

### The Z-pattern (text-heavy pages)

Eye scans top-left → top-right → diagonal down → bottom-left → bottom-right.
Place primary CTA at top-right (navbar) and bottom-right (final CTA).
Place hero headline at top-left.

### The F-pattern (content-heavy lists)

Eye scans down the left edge, with horizontal sweeps shrinking. Place
section eyebrows and key info on the left. Action buttons on the right
of each row.

### Single focal point

For dashboards or stat-driven sections: one big number or visual
anchors the layout; everything else is supporting.

### Implementing focal hierarchy

| Tool | Use |
|---|---|
| Size | The most important thing is the largest |
| Color | Primary focus uses `var(--color-primary)`; secondary uses default text |
| Position | Above the fold, top-left, or center |
| Contrast | Higher contrast for the focal element |
| White space | Surround the focal element with more space than its neighbours |

---

## 7. Edge tension

How close should an element sit to the canvas edge? Bridge defaults:

| Element | Distance from edge |
|---|---|
| Section content | `px-5 sm:px-8` (20 px / 32 px) — never closer |
| Card content within section | inherits section padding |
| Card content within card | `p-7 sm:p-9` (28 px / 36 px) |
| Text within card | inherits card padding; never `p-0` |
| Floating chip near a card | `-left-3 -top-7` (overlaps card edge by ~12 px) |
| Modal panel within viewport | `inset-4` minimum (16 px) on mobile |
| Sticky bottom CTA on mobile | `bottom-4` plus `pb-[env(safe-area-inset-bottom)]` |

Elements that touch the edge feel cramped. Elements that overlap the
edge (chips, badges) feel intentional and floating — but only if they
are explicitly positioned with `absolute` and meaningful negative
offsets.

---

## 8. CSS Grid vs Flexbox vs absolute (decision matrix)

| Need | Tool |
|---|---|
| Single row of inline items, gap | `flex gap-` |
| Single row, items aligned across multiple containers | Grid (so columns line up) |
| Asymmetric two-column layout (hero) | `lg:grid-cols-12` with `col-span-7` / `col-span-5` |
| Bento with featured tile | `lg:grid-cols-4 lg:auto-rows-[200px]` + `col-span-2 lg:row-span-2` |
| Card with header / body / footer | `flex flex-col` with `mt-auto` on the footer |
| Floating chip overlapping a card | `relative` parent + `absolute` chip with negative offsets |
| Centered content with sidebar | `lg:grid-cols-[1fr_auto]` (auto column right-anchored) |
| Equal-height tier cards | Grid (auto-fit not needed if tier count is fixed) |
| Wrapping pill list | `flex flex-wrap gap-1.5` |
| Sticky table header | `sticky top-0` + `z-10` on `<thead>` |
| Modal centered in viewport | `fixed inset-0` + `flex items-center justify-center` OR `top-1/2 left-1/2 -translate-1/2` |
| Sliding drawer | `fixed top-0 right-0 h-full w-80` |
| Reversible direction (RTL prep) | `inline-start` / `inline-end` logical props |

### When to reach for absolute

Absolute positioning is right when:

- The element overlays others (chips, badges, glow accents).
- It must escape the document flow (modals, overlays).
- Its position relates to a specific anchor (cursor, target).

It is wrong when:

- A flex/grid layout would do.
- It hides layout shifts under the rug (these become bugs at different viewport widths).

---

## 9. Aspect ratio control

Layout shift (CLS) is one of the worst polish failures. Lock aspect
ratios on anything that loads asynchronously.

```jsx
// Image with locked ratio
<div className="aspect-[4/3] overflow-hidden rounded-2xl">
  <img src={url} alt="" className="h-full w-full object-cover" />
</div>

// Video iframe
<div className="aspect-video">
  <iframe className="h-full w-full" />
</div>

// Mentor avatar
<div className="aspect-square h-14 w-14 rounded-2xl bg-gradient-to-br from-[var(--lp-grad-from)] to-[var(--lp-grad-to)]">
  …
</div>
```

Tailwind utilities: `aspect-square`, `aspect-video`, `aspect-[N/M]`.
Always pair with `object-cover` for images so they fill without stretch.

---

## 10. Stacking contexts and z-index

Z-index without a stacking-context discipline becomes a war. Bridge's
hierarchy:

| Layer | z-index | Examples |
|---|---|---|
| Atmospheric (behind everything) | `-z-10` | `BridgeGlobalAtmosphere` aurora |
| Default flow | `0` | Sections, cards, content |
| Page chrome | `10` | Sticky table headers, ScrollProgress |
| Floating UI | `20`–`50` | Tooltips, popover menus, FAB |
| Navigation | `40`–`60` | Navbar (fixed), breadcrumb sticky |
| Backdrop | `100` | Modal backdrop |
| Modal panel | `101` | Modal content above its backdrop |
| Toast | `110` | Above modals (errors must always be visible) |

### Rules

- Create a new stacking context (`isolation: isolate` or `position: relative; z-index: 0`) on every section that contains absolutely-positioned children. Otherwise z-index leaks across sections.
- Don't go past `z-110` without a reason. The hierarchy above covers every legitimate case.
- `pointer-events: none` on decorative absolute layers so they don't intercept clicks.
- Floating elements (chips, badges) inherit the parent's stacking context — keep them inside their visual parent.

---

## 11. Asymmetric layouts (the Bridge signature)

Symmetry reads as default. Asymmetry, done right, reads as designed.
Bridge leans asymmetric for hero, dashboards, and feature highlights.

### Pattern: Heavy-left, accent-right

```jsx
<section className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
  <div className="lg:col-span-7">
    {/* heavy: headline + sub + CTAs + trust */}
  </div>
  <div className="lg:col-span-5">
    {/* accent: floating product visual */}
  </div>
</section>
```

The 7/5 split (≈ 58/42) is more interesting than 6/6. The eye lingers
on the heavier side and confirms with the accent.

### Pattern: Stat hero with anchor

```jsx
<section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
  <div className="lg:col-span-2">
    {/* big stat */}
  </div>
  <div>
    {/* small supporting stats */}
  </div>
</section>
```

### Pattern: Editorial split (image + caption)

```jsx
<section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
  <div className="lg:col-span-5 lg:col-start-2">
    {/* image */}
  </div>
  <div className="lg:col-span-5 lg:col-start-8">
    {/* caption */}
  </div>
</section>
```

Notice the start offsets — content doesn't start at column 1; it floats
toward the visual center with negative tension on each side.

---

## 12. Negative space (the part nobody talks about)

White space is design, not absence. Bridge uses three negative-space
tiers:

- **Micro** — within a card, between rows. `gap-2` to `gap-4`. Maintains scannability.
- **Macro** — between sections. `py-24` to `py-32`. Establishes rhythm.
- **Hero** — around the focal element. The hero card sits in 30–40% empty area on each side. The eye has nowhere else to go.

### Rules

- Add negative space, don't subtract content. If a section feels cramped, remove a bullet, not a margin.
- The space on the left of the headline matches the space on the right of the visual. Mismatched gutters look broken.
- A button surrounded by ~24 px of empty space reads as "primary". A button kissing the next element reads as "form field".

---

## 13. Container queries (when to use)

Container queries scope responsive behaviour to a parent's size, not the
viewport's. Use them when:

- A card that appears at multiple sizes (sidebar, main content, modal) needs different layouts at each.
- A list item should reflow when the list itself narrows (regardless of viewport).

```jsx
<div className="@container">
  <div className="flex flex-col @md:flex-row @md:items-center">
    {/* stacks until container is ≥ 28 rem, then row */}
  </div>
</div>
```

Tailwind v4 supports `@container` natively. Do not enable per-element
unless needed — viewport-scoped responsive (`sm:`, `lg:`) covers 90% of
cases.

---

## 14. Logical properties (RTL preparation)

Bridge ships LTR today but the code should not actively block RTL.
Prefer logical CSS properties for sided spacing:

| Physical | Logical |
|---|---|
| `margin-left` | `margin-inline-start` (`ms-*` in Tailwind) |
| `margin-right` | `margin-inline-end` (`me-*`) |
| `padding-left` | `padding-inline-start` (`ps-*`) |
| `padding-right` | `padding-inline-end` (`pe-*`) |
| `text-align: left` | `text-align: start` (Tailwind: `text-start`) |

Where direction is irrelevant (vertical only, all four sides), continue
using `mt-*`, `mb-*`, `p-*`. RTL doesn't flip vertical.

---

## 15. Centering — pick the right technique

| Need | Technique |
|---|---|
| Center a single child horizontally | `mx-auto` |
| Center inline content | `text-center` |
| Center flex items both axes | `flex items-center justify-center` |
| Center a fixed/absolute element | `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` |
| Center modal in viewport | `fixed inset-0 flex items-center justify-center` (better than translate when modal width varies) |
| Center grid item | `place-self-center` on the item, or `place-items-center` on the grid |
| Vertically center text in a button | `flex items-center` (text already centers horizontally inside its line box) |

Don't reach for translate when flex would do — translate creates a
stacking context and can interfere with layout animations.

---

## 16. Truncation and overflow

Long content breaks layouts unless handled. Decide per element:

| Behaviour | Class |
|---|---|
| Single-line truncate with ellipsis | `truncate` (requires explicit width) |
| Multi-line clamp (3 lines) | `line-clamp-3` |
| Allow horizontal scroll | `overflow-x-auto` (use sparingly) |
| Hide overflow | `overflow-hidden` |
| Wrap long words | `break-words` or `break-all` (last resort) |

For mentor names, titles, company — use `truncate`. For bios — `line-clamp-2`
or `line-clamp-3`. For URLs in cards — `break-all`.

The component must reserve enough width for its truncate to be
meaningful (`min-w-0` on the flex parent, `flex-1` on the truncating
child).

---

## 17. Mobile-specific alignment

| Issue | Fix |
|---|---|
| Sticky CTA covered by iOS home indicator | `pb-[env(safe-area-inset-bottom)]` |
| Status bar overlap on iOS notch devices | `pt-[env(safe-area-inset-top)]` for full-bleed sections |
| Tap targets < 44 px | Bump to `min-h-[44px]` and `min-w-[44px]` |
| Horizontal scroll from accidental overflow | `overflow-x-clip` on `<html>` or root container |
| Buttons too close together (mis-tap) | `gap-3` minimum between adjacent tappable buttons |
| Bottom sheet covering content | `padding-bottom` reserved for the sheet's height |

Test at 375 px (iPhone), 320 px (small Android), 414 px (iPhone Pro Max),
768 px (tablet portrait). 320 finds most issues.

---

## 18. Layout debugging

When a layout looks "off" but the cause isn't obvious:

1. **Outline everything**: temporarily add `outline outline-1 outline-red-500` to the suspect tree. Misalignment usually shows immediately.
2. **Check the box model**: DevTools → Computed → look for unexpected `padding` or `margin`.
3. **Find the stacking context**: an element that should be on top isn't — search up the parent tree for `transform`, `filter`, `isolation`, or non-`auto` `z-index` that creates a context boundary.
4. **Subpixel rounding**: a 1 px gap that won't go away — `position: absolute` with non-integer coordinates causes subpixel shifts. Round to whole pixels.
5. **Flex shrink trap**: a flex child overflowing — set `min-w-0` on it; default `min-width: auto` prevents shrinking.
6. **Grid gap before fr**: `auto-fit` with `minmax(200px, 1fr)` plus `gap-4` — gap eats track space, so `200px` minimum may not fit. Use `minmax(0, 1fr)` if widths can compress.

---

## 19. Anti-patterns (auto-reject)

- Centering hero copy on desktop (asymmetric is the Bridge signature).
- Inconsistent spacing rhythm in the same composition (`gap-3` next to `gap-5` for similar elements).
- Pixel-precise mathematical alignment when optical alignment is needed.
- Z-index ladders past 100 without a documented reason.
- `position: absolute` without a `position: relative` parent (escapes to `<body>` and breaks).
- Magic-number margins (`mt-[27px]`) — always use a token or a token-derived value (e.g. `mt-[calc(theme(spacing.7)-1px)]` if truly needed).
- Hover-only feedback on tappable elements (mobile breaks).
- Truncation without `min-w-0` on the flex parent.
- Aspect ratios on async content forgotten (causes CLS).
- Decorative SVGs without `pointer-events-none` (intercept clicks).
- Symmetric padding on type ("centered text" looks high in its line box).
- Negative-space starvation — content butting up against section edges.

---

## 20. Verification ladder

Before declaring a layout done:

1. **Outline pass**: add red outlines, check edges align.
2. **Optical center pass**: icons centered with text, chevrons not edge-kissing.
3. **8-grid pass**: every spacing value is a multiple of 8 (4 with reason).
4. **Weight pass**: focal element clearly heaviest, asymmetric balance resolves.
5. **Negative space pass**: micro/macro/hero spaces all distinct.
6. **Width sweep**: 320, 375, 414, 768, 1024, 1280, 1440. No horizontal scroll, no cropped CTAs, no broken truncation.
7. **Stacking context**: every overlay sits at the right z-index; no leaks.
8. **CLS sweep**: throttle network → 3G → confirm aspect ratios hold.
9. **All six visual states**: 3 palettes × 2 themes (alignment doesn't change but visual weight may shift with palette darkness).

If any check fails, fix at the alignment layer — not by adding magic
margins to compensate.
