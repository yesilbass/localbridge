---
name: bridge-web-design
description: >-
  Bridge page design: information architecture, narrative arc, hero patterns,
  section rhythm, bento grids, pricing, comparison, responsive composition,
  background-to-foreground contrast safety, conversion paths, investor-grade
  polish. Use when building or restructuring any landing section, marketing
  page, dashboard view, profile layout, pricing tier, comparison block,
  conversion CTA, or full-page composition — and whenever a section reads
  cluttered, weak, or fails to convert.
---

# Bridge web design

Pages exist to move someone from a question to a decision. Bridge is
pre-revenue and pursuing investor approval; every public page must read as
a serious product, not a template. This skill is the architecture and the
discipline that gets pages there.

For component-level rules and the contrast-pair contract see `bridge-ui`.
For motion see `bridge-motion` and `bridge-transitions`.

---

## 1. Operating principle

A page is a sequence of **decisions for the reader**, not a stack of
sections. Before composing, write down the four-question answer:

1. **What is this?** (one sentence — the value proposition)
2. **For whom?** (who recognises themselves immediately)
3. **Why now?** (the wedge — what's broken with the alternative)
4. **What's next?** (the single action the reader takes)

If you cannot answer all four in one minute, do not compose yet. Pull copy
first; the layout follows the words.

---

## 2. The Bridge narrative arc

Every public page composes from this 8-beat arc. Drop beats — never
re-order. Drop more than half and the page loses its spine.

| # | Beat | Intent | Canonical example |
|---|---|---|---|
| 1 | **Hero** | Establish value prop, identity, first action | `pages/landing/HeroSection.jsx` |
| 2 | **Trust strip** | Borrow credibility (logos, press, badges) | `BrandStrip` |
| 3 | **Proof** | Show real usage (stats, mentor faces, live data) | `MentorMarqueeSection`, `StatsBentoSection` |
| 4 | **Story** | One opinion stated plainly; why this exists | `ManifestoSection` |
| 5 | **Mechanics** | How it works in concrete steps | `HowItWorksSection` |
| 6 | **Differentiation** | Bridge vs. alternative, side-by-side | `ComparisonSection` |
| 7 | **Outcomes** | What happens after — testimonial / case | `OutcomesSection` |
| 8 | **Final ask** | Restate the one action, larger | `FinalCtaSection` |

Internal product pages (Dashboard, Settings, Profile) compose from a
different vocabulary — see Section 8.

---

## 3. Section visibility contract (the most-broken thing)

Every section sits in a stack of paint layers. Foreground readability is a
function of **the chain from canvas → atmosphere → section background →
internal surfaces → text**. If any link in that chain reduces contrast below
the threshold, the section fails. Most "the text is invisible" reports
trace to this chain being broken.

### Contract per section

1. **Declare the section's surface explicitly.** Do not rely on transparency to inherit from canvas. Set `style={{ backgroundColor: 'var(--bridge-canvas)' }}` (or `var(--bridge-surface-muted)` for an alternating band).
2. **Atmosphere stays decorative.** Any aurora, gradient blob, or noise overlay must be `pointer-events-none aria-hidden absolute` — never above content z-index.
3. **Section atmosphere never darkens content area.** A 30%+ overlay over the section content area will fail contrast. Atmosphere belongs in the gutters or as a top/bottom band, not behind body copy.
4. **Internal surfaces obey the contrast-pair contract.** See `bridge-ui` Section 1. Cards, chips, and overlays inside the section choose pair class A, B, C, or D — never mixed.
5. **No translucent surfaces under body copy.** Headings can sit on `bg-white/5`-style overlays; paragraphs cannot — captions disappear when the underlying canvas shifts in dark mode or under aurora.

### When alternating section surfaces

Adjacent sections benefit from a faint surface change. Use:

- Section 1: `var(--bridge-canvas)`
- Section 2: `var(--bridge-surface-muted)`
- Section 3: `var(--bridge-canvas)` again

Never: arbitrary tints (`bg-stone-50`, `bg-gray-100`) — they break the
palette system. The Tailwind stone-* re-skin in `appearance.css` mostly
covers it, but a token reference is unambiguous.

### When using full-bleed dark sections (e.g. footer, manifesto)

Treat the whole section as **locked-dark** (pair class C from `bridge-ui`).
That means:

- Backgrounds use absolute color (`#111009`, navy, etc.) or a solid token.
- All text is `text-white` / `text-white/70` / `text-white/55` — never `--bridge-text-muted`.
- All borders are `border-white/10` (this is fine on a locked-dark surface).
- All chips inside follow Pair C.

Do not put `--bridge-text` anywhere inside a locked-dark section.

---

## 4. The hero

The hero is the only screen most readers see. Get it wrong and the rest of
the page is irrelevant. Get it right and the rest of the page closes the
sale.

### Anatomy (asymmetric split, copy-left visual-right)

- **Eyebrow row** — status pill or category tag. ≤ 6 words. `--color-primary` text.
- **Headline** — 2 lines max. First line plain, second line gradient-text accent. Single editorial italic moment optional on a separate sub-line.
- **Sub-headline** — one sentence, ≤ 30 words. Defines the wedge.
- **CTA pair** — exactly one primary, one secondary. Primary uses pair B (inverted-primary). Secondary uses pair A (adaptive ghost).
- **Trust row** — 3 items, each tiny icon + 4–6 words.
- **Visual** — interactive-feeling product surface (mentor card with floating chips, stat callouts, status dot). See `HeroPreviewCard` for the canonical anatomy. Never a screenshot.

### Sizing

- Section: `min-h-[94vh]`, `pt-28 pb-24 sm:px-8 lg:pt-36`
- Headline scale: `clamp(2.85rem, 7.6vw, 6rem)`
- Grid split: `lg:grid-cols-12` with copy `lg:col-span-7` and visual `lg:col-span-5`

### Copy discipline

- Each line of the headline ≤ 7 words.
- The wedge sentence names the alternative (e.g. "no subscriptions, no packages — just one session").
- The primary CTA verb is concrete: "Get started", "Book a session", "See mentors". Never "Learn more".
- The trust row carries proof, not feature claims: "No credit card", "Book in 60 seconds", "4.9/5 across 4,800+ sessions".

### What heroes never do

- Center the copy column on desktop (it looks like a static template).
- Use more than one font family in the headline.
- Use stock photography.
- Include more than 3 trust items.
- Animate every line on entrance — typing is for one accent line, fly-ins are subtle, the rest is `<Reveal>`.

---

## 5. Section composition primitives

Every non-hero section reuses this structural skeleton. Vary the inner
content; do not vary the bones.

```jsx
<section
  className="relative overflow-hidden py-24 sm:py-28 lg:py-32"
  style={{ backgroundColor: 'var(--bridge-canvas)' }}
>
  {/* optional ambient flourish, must be aria-hidden + pointer-events-none */}
  <div
    aria-hidden
    className="pointer-events-none absolute inset-x-0 top-0 h-40"
    style={{
      background:
        'linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 4%, transparent) 0%, transparent 100%)',
    }}
  />

  <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
    {/* Eyebrow */}
    <p
      className="text-[10px] font-black uppercase tracking-[0.32em]"
      style={{ color: 'var(--color-primary)' }}
    >
      Section eyebrow
    </p>

    {/* Heading */}
    <h2
      className="mt-3 max-w-3xl font-display font-black leading-[0.98] tracking-[-0.035em]"
      style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: 'var(--bridge-text)' }}
    >
      Headline with one <span style={{ color: 'var(--color-primary)' }}>accent</span>.
    </h2>

    {/* Support copy (max one sentence here) */}
    <p
      className="mt-7 max-w-xl"
      style={{ color: 'var(--bridge-text-secondary)' }}
    >
      One sentence. Specific.
    </p>

    {/* Content grid */}
  </div>
</section>
```

Wrap entrance animations with `<RevealOnScroll>` (in `pages/landing/`) or the
simpler `<Reveal>` (in `components/`). Do not write IntersectionObserver glue
inline.

---

## 6. Density rules

| Decision | Default |
|---|---|
| Eyebrow → heading | `mt-3` |
| Heading → support copy | `mt-7`–`mt-8` |
| Support copy → content grid | `mt-12`–`mt-14` |
| Body → CTA | `mt-9`–`mt-10` |
| Card grid gap | `gap-4 sm:gap-5 lg:gap-6` |
| Tier card grid gap | `gap-6 lg:gap-8` |
| Section → next section | rely on each section's `py-24+` only — never wrap with `space-y-*` |
| Container max width | `max-w-6xl` content · `max-w-7xl` wide · `max-w-bridge` (88rem) full · `max-w-3xl` prose |

If a card needs more density than `p-7 sm:p-9` allows, the card is
expressing two ideas — split.

---

## 7. Bento grids

When showing multiple proof points without ranking them, use a bento grid
(see `StatsBentoSection`).

Rules:

- Mobile: 1 column. `sm`: 2. `lg`: 4.
- Featured tile: `col-span-2 lg:row-span-2` — assigned to the strongest single number.
- Lock row height: `lg:auto-rows-[200px]` (or 220–240). Predictable aspect prevents the grid from looking ragged.
- Each tile: one stat, one verb, one micro-context. If a tile needs three lines of body, it's the wrong format — promote to a section.
- Surface: pair A (adaptive) — `var(--bridge-surface)` + 1 px ring inset + `shadow-bridge-card` or `shadow-bridge-glow`.
- Interior atmosphere: subtle radial in a corner, `aria-hidden`, never animated.

Bentos work because the eye can scan five tiles in the time it takes to
read one paragraph. Don't dilute that with text-heavy tiles.

---

## 8. Internal product pages (Dashboard, Profile, Settings, Mentor detail)

These pages do not follow the marketing arc. Use this vocabulary instead:

| Element | Pattern |
|---|---|
| Page header | One H1 + one short paragraph + optional primary action |
| Section | `mt-10–mt-14` between sections, no eyebrows |
| Data table | Uses `tabular-nums`, sticky header optional, row hover surface = `--bridge-surface-muted` |
| Tab bar | Horizontal, underline indicator in `--color-primary`, animated translateX |
| Empty state | Icon + 1-line headline + 1-line subtext + primary CTA |
| Filter row | Above results, sticky on scroll, segmented controls in `--bridge-surface-muted` |
| Action row | Sticky bottom on mobile, in-flow on desktop |

Maintain the same contrast-pair contract — every surface declares a pair.

---

## 9. Pricing & comparison

### Pricing grid

- Three tiers max. Center tier = "Most popular": primary border, lifted via `lift-md`, ribbon with `var(--color-primary)` background.
- Tier card composition: name (eyebrow) → price (`tabular-nums`, large) → per-period (caption) → divider → 5–8 feature bullets → primary CTA.
- Annual toggle (if present): pill switch above the grid; persist state in URL search param so the choice is shareable.
- Bullets use Lucide `Check` (success-color) for present, `X` (muted) for absent. Never plain text checkmarks.

### Comparison

- Two-column ("Bridge vs. them") or 4-column (Bridge plus three alternatives).
- Header row of the Bridge column: `var(--color-primary)` background, white text.
- Body cells: pair A. Negative cells use `line-through` + `var(--bridge-text-muted)`. Positive cells use solid `var(--bridge-text)` + Lucide `Check`.
- Footer row of the Bridge column: primary CTA inline.

---

## 10. Responsive ladder

| Breakpoint | Tailwind | Min width | Rule |
|---|---|---|---|
| Mobile | (default) | 0 | One-column. Headlines clamp to `2.85rem`. |
| sm | `sm:` | 640 | Two-column grids permitted. |
| md | `md:` | 768 | Use sparingly — most layouts flow lg directly from sm. |
| lg | `lg:` | 1024 | Asymmetric splits (`lg:grid-cols-12`), 4-col bento, full nav. |
| xl | `xl:` | 1280 | Marketing only — center wider container. |
| 2xl | `2xl:` | 1536 | Cap with `max-w-bridge`; do not let line-lengths exceed 80 ch. |

Type uses `clamp()`, not breakpoint switches. Padding scales with `sm:`/`lg:`
(`px-5 sm:px-8`). Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for
tiers; `lg:grid-cols-12` for asymmetric heroes.

Test breakpoints at: 320, 375, 414, 768, 1024, 1280, 1440, 1920. Most bugs
live at 320, 768, and 1280.

---

## 11. Atmosphere & contrast safety (read alongside section 3)

The global `BridgeGlobalAtmosphere` is fixed at `-z-10` with auroras, mesh,
and grain. Page-level atmosphere is additive.

Rules:

- Never stack more than two large blurred radials in a single viewport. Paint cost compounds.
- Section-local glow lives at the section edges (top band, bottom band, corners) — not behind body copy.
- Atmosphere alpha rule: any radial overlapping content area uses `≤ 6%` of the source color (`color-mix(in srgb, var(--color-primary) 6%, transparent)`). Above 6% and contrast erodes in the wrong palette.
- Atmosphere pauses when `document.hidden` (already handled in `BridgeGlobalAtmosphere`). Section-local atmosphere should not animate.
- Atmosphere is decorative — every gradient blob is `aria-hidden` and `pointer-events-none`.

When in doubt: less atmosphere, more contrast.

---

## 12. Conversion-path discipline

Every public page has a **one-action goal**. Identify it before designing:

- Landing → register / book a mentor
- Mentors index → open a mentor profile
- Mentor profile → book a session
- Pricing → start a plan
- Footer pages (FAQ, Help, Trust) → return to a primary product page

Conversion rules:

- Primary CTA appears in the hero, repeats in the final CTA section, and is reachable from the navbar at all times.
- Secondary CTA never duplicates the primary verb — it offers a softer path ("Browse mentors" alongside "Get started").
- No more than one primary CTA per viewport.
- Forms requesting commitment (email, payment) live near a trust signal (badge, count, testimonial).
- The action is the closest interactive element to the headline — a reader who scans for 3 seconds must see the CTA.

---

## 13. Investor-grade signal checklist

Before considering a page demo-ready:

- [ ] Hero answers the four questions in Section 1 in under 6 seconds of reading.
- [ ] Real numbers, not vanity ("4,800+ sessions", not "Many sessions").
- [ ] Three social-proof formats present somewhere (logos, stats, testimonials).
- [ ] One primary CTA repeated at top and bottom.
- [ ] No filler sections — each beat earns its place.
- [ ] Mobile parity at 375 width — no horizontal scroll, no clipped CTAs.
- [ ] All six visual states verified (3 palettes × 2 themes). Switch in DevTools by toggling `html.theme-dark` and `html[data-palette="…"]`.
- [ ] Lighthouse a11y ≥ 95, perf ≥ 85 on landing.
- [ ] Cold-cache first paint < 2 s on 4G throttle.
- [ ] No `console.error` warnings on any page in the public arc.

---

## 14. Performance — below-the-fold sections

Mirror the existing `landing-root` rule:

```css
.landing-root > section:nth-of-type(n+4){
  content-visibility: auto;
  contain-intrinsic-size: auto 800px;
}
```

Any long marketing page benefits. Keep hero / brand strip / first proof
section out of the rule — they're partially visible on tall screens and
their layout feeds scroll-trigger refs.

Other rules:

- Lazy-load 3D scenes (`<Canvas>`) behind `React.lazy`.
- Lazy-load heavy routes (`MentorProfile`, `VideoCall`) — code-splitting is the single biggest landing-perf win available.
- Defer non-critical fonts via `font-display: swap`.

---

## 15. Anti-patterns

- Centering a hero on desktop. Asymmetric splits read as product; centered reads as template.
- Repeating the same gradient blob behind every section.
- Text-heavy bento tiles.
- More than three trust items in a hero row.
- Using `<hr>` between sections — sections breathe via padding alone.
- Adding new section "templates" without using `<Reveal>` / `<RevealOnScroll>`.
- Pricing cards with feature lists longer than 8 bullets.
- Sub-headlines longer than 30 words.
- Animating section entrance with multiple effects (fade + slide + scale + rotate). Pick one.
- Stacking translucent surfaces 3+ layers deep — text disappears under aurora.

---

## 16. When restructuring an existing page

1. Print the four-question answer (Section 1).
2. Diff the rhythm against the 8-beat arc (Section 2). Drop, reorder, or combine before adding.
3. Pull the copy first. If a section's copy is < 8 words after editing, the section probably should not exist.
4. Verify the contrast chain (Section 3) for every section.
5. Confirm the conversion path (Section 12) — primary CTA reachable from every viewport.
6. Run the investor-grade checklist (Section 13).

---

## 17. When in doubt

Ship less. A page with five strong sections converts better than a page
with eight average sections. Trim before stacking.
