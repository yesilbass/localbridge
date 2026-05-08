---
name: bridge-motion
description: >-
  Bridge animation craft — choreography, spring physics, scroll narrative,
  atmospheric depth, perfTier gating, reduced-motion design, GSAP, R3F/Three,
  motion/react. Use when adding, tuning, or debugging any animation, scroll
  effect, hero entrance, micro-interaction, parallax layer, breathing
  background, marquee, gradient border, sheen, magnetic pointer, 3D scene,
  or sequence of coordinated motion. Use when motion needs to land at the
  level of Linear, Stripe, Apple, or Awwwards-tier sites.
---

# Bridge motion craft

Animation is product narrative. A great Bridge moment makes a reader feel
"this is alive, this is precise, this is competent." That feeling closes
seed rounds. Decorative motion does the opposite — it screams template.

Every animation in Bridge must satisfy three things at once: serve a
purpose, run at 60 fps on a mid-tier laptop, and degrade beautifully when
disabled. This skill is how.

---

## 1. The four motion principles (apply to every animation)

1. **Intent** — every motion answers "what does the user understand because of this?" If you cannot finish that sentence, cut the motion.
2. **Physicality** — UI elements have implied mass. Heavy things (cards, hero panels) lag and overshoot lightly. Light things (chips, dots) lead and snap. Sprung motion conveys this; tweens cannot.
3. **Choreography over isolation** — multiple elements moving together with timing offsets read as orchestration. Each element starting on its own reads as chaos.
4. **Restraint** — fewer, sharper motions outperform more, softer ones. One hero entrance with anticipation beats five fade-ups.

---

## 2. The 12 principles, applied to UI

Disney's 12 principles map cleanly to interface motion. Use these as
mental checks, not rules.

| Principle | Bridge UI translation |
|---|---|
| Squash & stretch | Buttons compress on press (`scale(0.97)` on `:active`); chips lift on hover. |
| Anticipation | Hero card pulls back ~4 px before launching forward on entrance. |
| Staging | Hero copy appears first; visual ~80–120 ms later. Eyes lock on copy, then visual confirms. |
| Straight-ahead vs. pose-to-pose | Use pose-to-pose (motion `initial → animate`) for entrances; straight-ahead (GSAP scroll-linked) for parallax. |
| Follow-through & overlapping | Card lands; chips overshoot ~6%, settle. Light follows heavy. |
| Slow in & slow out | Default ease `cubic-bezier(0.16, 1, 0.3, 1)`. Never `linear` for UI motion. |
| Arcs | Drawer slides on a curve, not a straight line, when distance > 200 px. |
| Secondary action | Status dot pulses while card slides — secondary action reinforces aliveness. |
| Timing | Entrances 220–320 ms, exits 160–220 ms (~25% faster). Never identical. |
| Exaggeration | Reserved for hero moments. Seed pitch: yes. Settings dropdown: no. |
| Solid drawing | Layout never breaks during animation (no `width`/`height` morph except for accordion `auto`). |
| Appeal | Spring physics over tween wherever the eye dwells. |

---

## 3. The decision matrix — spring vs. tween vs. CSS keyframe

| Need | Pick | Why |
|---|---|---|
| Element entering a viewport (fade + rise) | `<Reveal>` (`components/Reveal.jsx`) | Cheapest, IO-driven, no spring cost. |
| Hero card / large entrance | `motion.div` spring | Mass + damping conveys weight. |
| Hover lift on a card | CSS `lift-sm` / `lift-md` | No JS overhead. |
| Modal open/close | `motion.div` + `AnimatePresence` | Coupled enter/exit timing. |
| Drawer slide | `motion.aside` spring `{ stiffness: 320, damping: 36, mass: 0.7 }` | Drawers feel physical. |
| Marquee / infinite | CSS keyframe (`b-ticker`) | Compositor thread, not main. |
| Aurora / breathing blob | CSS keyframe (`bridge-aurora`, `bridge-blob-breathe`) | GPU-cheap, pause on tab hidden. |
| Scroll-linked progress | GSAP + ScrollTrigger | Frame-locked to scroll. |
| 3D / depth scene | R3F (`@react-three/fiber`) | True 3D when warranted. |
| Counter / number animation | `useCountUp` (`landingHooks.js`) | rAF-driven, eases natively. |
| Cursor-driven tilt / magnet | `data-tilt`, `data-magnet`, `data-cursor-glow` | Delegated by `MagneticPointer`. |

When two options would work, pick the one with less JavaScript on the
critical path.

---

## 4. Spring physics — tuned for this UI

Spring physics is what separates Bridge from a template. Three tuned
presets cover 90% of cases:

```js
// SNAPPY — buttons, chips, micro-interactions
{ type: 'spring', stiffness: 220, damping: 26, mass: 0.55 }

// HERO — large cards, headlines, drawer slides
{ type: 'spring', stiffness: 180, damping: 22, mass: 0.7 }

// SETTLE — modals, gentle reveals
{ type: 'spring', stiffness: 140, damping: 20, mass: 1.0 }
```

For tween work (page enter, scroll-linked fades): `{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }`.

### Reading the parameters

- **`stiffness`** — how aggressively it pulls toward target (higher = faster).
- **`damping`** — how much it resists oscillation (higher = less bounce).
- **`mass`** — perceived weight (higher = lazier, more inertia).

For a brand-new spring: start from one of the three presets and adjust one
parameter at a time, by 10–20% increments. Random tuning produces motion
that feels off without you knowing why.

---

## 5. Choreography patterns

### A · Cascade (parent staggers children)

Use for lists, grids, hero copy lines, feature bullets.

```jsx
const container = {
  hidden: { opacity: 1 },
  show:   { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

<motion.ul variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
  {items.map(i => <motion.li key={i.id} variants={item}>{i.label}</motion.li>)}
</motion.ul>
```

Stagger interval: 50–80 ms for tight lists, 100–140 ms for hero beats.

### B · Lead-follow (mass-aware)

Heavy element starts; light element follows ~80–120 ms behind.

```jsx
<motion.div {...heroCardSpring} />              {/* heavy — leads */}
<motion.div {...chipSpring(0.10)} />            {/* light — follows */}
<motion.div {...chipSpring(0.18)} />            {/* lighter — trails */}
```

The 100 ms gap reads as orchestration. Without it, the elements collide
visually.

### C · Coordinated entrance (hero pattern)

The Bridge hero (`pages/landing/HeroSection.jsx`) is the canonical
reference. Read it before composing a new hero. Beats:

1. Eyebrow pill fades in (~0 ms delay).
2. Headline first line types (~60–90 ms initial delay).
3. Headline accent line types after first completes.
4. Tagline fades up (~40 ms after typing starts).
5. Sub-paragraph fades up (~80 ms).
6. CTA group rises in (~120 ms).
7. Trust row rises in (~160 ms).
8. Mentor preview card flies in from the right (~60 ms — it leads visually).

The card fly-in is *first* in render order so the eye locks on the
visible end-state of the hero before reading the copy.

### D · Continuity (the same element across states)

When an element changes role between states (card on grid → modal on
detail), use `layoutId` to morph rather than fade-and-replace.

```jsx
<motion.div layoutId={`mentor-${id}`}>…</motion.div>
```

See `bridge-transitions` Section 5 for the full pattern.

---

## 6. Scroll-linked storytelling (GSAP)

Scroll-linked motion turns a page into a narrative. Use it for hero
unfolding, section pinning, parallax layers, depth shifts.

### Setup

```jsx
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

useGSAP(() => {
  gsap.to('.parallax-layer-back', {
    yPercent: -30,
    ease: 'none',
    scrollTrigger: {
      trigger: rootRef.current,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.5,        // 0.5s lag — feels physical, not glued
    },
  });
}, { scope: rootRef });
```

Always scope GSAP to a ref via `useGSAP({ scope })` so the cleanup of
ScrollTrigger instances is automatic.

### Patterns

| Effect | Scroll-trigger setup |
|---|---|
| Parallax (background drifts up) | `yPercent: -20 to -40`, `scrub: 0.5` |
| Pin section while inner content animates | `pin: true`, `start: 'top top'`, `end: '+=80%'` |
| Reveal on scroll progress | `scrub: true`, animate `opacity` + `y` |
| Counter that ticks with scroll | `scrub: 0.3`, `onUpdate` writes to text |
| Horizontal scroll inside vertical page | `pin: true` + tween `x`, `end: '+=' + container.width` |

### Pitfalls

- Never `scrub: true` (instant) on a long animation — it ties FPS to scroll velocity. Use `scrub: 0.3 → 1`.
- `pin: true` causes layout if not paired with `pinSpacing: false` when the pinned section is full-bleed.
- ScrollTrigger refresh on resize is built in — don't add window listeners.

---

## 7. Atmospheric depth (the parallax-without-asset trick)

True depth comes from layering elements at different "distances" from
the camera. Bridge already has the building blocks:

| Layer | Source | Speed |
|---|---|---|
| Far ambient (auroras) | `BridgeGlobalAtmosphere` | Stationary or 30%-speed parallax |
| Mid background (page mesh) | `body::before` in `appearance.css` | Stationary |
| Section-local glow | section's `pointer-events-none absolute` div | 50–70% speed |
| Content | the section itself | 100% (default) |
| Foreground accents (chips, badges) | floating UI | 110–130% (overshoots scroll) |

Implementing the foreground over-shoot:

```js
gsap.to('.hero-chip', {
  yPercent: 8,
  ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
});
```

This makes the chip drift down ~8% relative to the page as the user
scrolls — small, but legible as depth.

---

## 8. Performance gating (the perfTier curve)

`usePerfTier()` returns `'low' | 'mid' | 'high'`. Every non-trivial
animation branches on this:

- **`low`** — render at rest, no spring, no scroll-link, no 3D. Animation is replaced by static end-state.
- **`mid`** — lighter spring (snappier), reduced travel distance, no GSAP scrub on long tracks, R3F disabled.
- **`high`** — full effect.

The `pages/landing/HeroSection.jsx` `flyIn()` function is the canonical
implementation:

```js
const tier = usePerfTier();
const isLow = tier === 'low';
const isMid = tier === 'mid';

const flyIn = (from, delay = 0) => {
  if (isLow) return { initial: from0, animate: from0, transition: { duration: 0 } };
  const scale = isMid ? 0.6 : 1;
  return {
    initial: { ...from, x: from.x * scale, y: from.y * scale },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: { type: 'spring', stiffness: isMid ? 220 : 180, damping: 24, delay },
  };
};
```

### Tab-hidden pause

Long-running infinite animations must pause when `document.hidden`. Pattern
in `BridgeGlobalAtmosphere`:

```js
const [paused, setPaused] = useState(document.hidden);
useEffect(() => {
  const onVis = () => setPaused(document.hidden);
  document.addEventListener('visibilitychange', onVis);
  return () => document.removeEventListener('visibilitychange', onVis);
}, []);
const playState = paused ? 'paused' : 'running';
// pass playState into style.animationPlayState
```

Skipping this drains battery on background tabs.

---

## 9. Reduced-motion design (not a fallback — a craft)

`prefers-reduced-motion: reduce` is not "no motion". It is "essential
motion only, gentle". Bridge handles this in three ways:

### A · The global rule (already in `index.css`)

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This kills all CSS keyframes and transitions automatically. Custom JS
animation must short-circuit explicitly.

### B · `motion/react` short-circuit

```jsx
const reduceMotion = useReducedMotion();
const transition = reduceMotion ? { duration: 0 } : { type: 'spring', ... };
```

### C · GSAP short-circuit

```jsx
useGSAP(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // ... animations
}, { scope });
```

When motion is reduced, replace it with **immediate end-state with
crossfade** (300 ms opacity), not abrupt cut. Reduced-motion users still
deserve hierarchy and feedback.

---

## 10. Magnetic pointer + tilt (cursor-driven)

`MagneticPointer.jsx` is mounted globally and delegates pointer events.
Add data attributes to opt in:

| Attribute | Effect |
|---|---|
| `data-tilt="6"` | 3D tilt up to 6° on cursor proximity |
| `data-magnet="8"` | Magnetic pull up to 8 px toward cursor |
| `data-cursor-glow` | CSS vars `--mx`, `--my` set on hover for radial gradient |

Pair with the existing CSS utilities `tilt-card`, `magnetic`, `cursor-glow`.
Do not write per-component pointer listeners — the delegation pattern is
already there.

---

## 11. WebGL / 3D (when to escalate)

R3F + Three is reserved for hero-grade moments where 2D cannot deliver:

- A spinning mentor card that hints at depth.
- A particle field reactive to cursor.
- A loading scene with motion blur.

Rules when you do reach for `<Canvas>`:

```jsx
import { lazy, Suspense } from 'react';
const HeroScene = lazy(() => import('./HeroScene'));

<Suspense fallback={<HeroFallback />}>
  <HeroScene />
</Suspense>
```

- **Lazy-load** — never block first paint with a Three bundle.
- **`dpr={[1, 1.5]}`** — cap pixel ratio on retina (huge perf win).
- **`frameloop="demand"`** — render on interaction if scene is mostly static.
- **Disable on `tier === 'low'`** — return a static SVG / image fallback.
- **Cleanup geometries and materials** in `useEffect` cleanup; otherwise the GPU leaks.

If you cannot justify the bundle cost, do not add Three. Animated SVG or
CSS often delivers 80% of the impact at 5% of the weight.

---

## 12. Audio-sync hooks (hero reveal / button feedback)

Bridge does not ship audio yet, but the architecture should not preclude
it. When animations may eventually pair with audio:

- Tie animation timing to **tempo grids** (60, 120, 240, 480 ms beats).
- Group entrances by beat (all "first beat" elements at 0 ms, "second beat" at 240 ms, etc.).
- Avoid arbitrary delays like `delay: 137` — round to the nearest tempo step.

This makes audio integration a single config change later, instead of a
re-timing project.

---

## 13. The Bridge animation library (use these — don't reinvent)

CSS utilities (`client/src/index.css`):

| Utility | Effect |
|---|---|
| `animate-page-enter` | Subtle fade + rise on route mount |
| `animate-pop-in` | Dropdown / FAB pop |
| `animate-scale-in` | Modal enter |
| `animate-pulse-soft` | Status dot |
| `animate-bridge-aurora` | Ambient breathing halo |
| `animate-blob-breathe` | Organic blob morph |
| `animate-gradient-shift` | Moving mesh background |
| `animate-float-3d` | Floating feature card |
| `animate-border-bridge` | Conic-gradient animated border (`border-gradient-bridge`) |
| `animate-slide-x` | Marquee track |
| `bridge-shine-overlay` | Diagonal sheen on premium cards |
| `btn-sheen` | Hover sweep on CTAs |
| `text-sheen` | Gradient text shimmer |
| `tilt-card` | 3D tilt surface |
| `magnetic` | Cursor-pull element |
| `cursor-glow` | Radial gradient that tracks cursor |
| `lift-sm` / `lift-md` | Hover lift presets |
| `hero-float-a` / `hero-float-b` | Hero chip drift (in `HeroSection.jsx`) |

Component utilities:

| Component | Effect |
|---|---|
| `<Reveal>` (`components/Reveal.jsx`) | Cheapest fade-up on viewport entry |
| `<RevealOnScroll>` (`pages/landing/`) | Variant-aware reveal (`left`, `right`, `up`) |
| `<TiltCard>` (`pages/landing/`) | 3D pointer-tilt wrapper |
| `<MagneticWrapper>` | Magnetic pull wrapper |
| `useCountUp(target, duration)` | rAF-driven counter |
| `useScrollProgress()` | 0–1 scroll position |
| `usePerfTier()` | Device tier hook |

If you need a new keyframe, add it to `index.css` as `@keyframes` plus an
`@utility animate-name { … }` wrapper. Do not put keyframes in component
`<style>` blocks unless the keyframe is tightly coupled to that component
(e.g. `hero-float-a` in `HeroSection`).

---

## 14. Canonical micro-interaction specs

| Element | Hover | Active / Press | Focus |
|---|---|---|---|
| Primary CTA | `translateY(-2px)` + shadow growth + sheen sweep | `translateY(0)` + dimmer shadow + scale 0.98 | `ring-bridge` |
| Secondary CTA | bg → `surface-muted` | scale 0.98 | `ring-bridge` |
| Card | `lift-sm` (-3 px) or `lift-md` (-6 px) | none | outline ring |
| Icon button | bg → `surface-muted`, icon scale 1.05 | scale 0.96 | ring |
| Chip | scale 1.04 | scale 0.98 | ring |
| Link | underline appears OR color → `--color-primary-hover` | none | ring |
| Modal close (X) | bg → `surface-muted`, rotate(90deg) | scale 0.9 | ring |
| Tab | underline grows from center | scale 0.98 | ring |

Hover transitions: 200–260 ms with `cubic-bezier(0.2, 0.9, 0.32, 1)`.
Active transitions: 90–120 ms ease-out.

---

## 15. Verification ladder

Before declaring an animation done:

1. **Reduced-motion path**: toggle the OS setting; the animation should mostly disappear, replaced by a 300 ms crossfade or static end-state.
2. **`tier === 'low'` path**: simulate via `navigator.deviceMemory` mock or test on a real low-end device. Confirm fly-ins are bypassed and 3D is replaced.
3. **Tab-hidden pause**: switch tabs, return; CPU profile should show no work while hidden.
4. **CPU throttle 4×** in DevTools: animation should still feel smooth, no dropped frames over 60 fps target.
5. **All six visual states**: 3 palettes × 2 themes; animation timing, easing, and gradients should all read correctly. Gradient borders use palette tokens; verify colors flow.
6. **No `will-change` lingering** post-animation. Inspect the element after motion completes; `will-change` should be `auto`.

---

## 16. Anti-patterns (auto-reject)

- Animating `width`, `height`, `top`, `left`, `padding` (use `transform` + `opacity`).
- Animating `filter: blur()` on a paint-active element (causes recompositing storms).
- Persistent `will-change: transform` on elements not currently animating.
- More than two simultaneous large blurred radials in one viewport.
- Springs without damping (oscillates forever).
- `easing: 'linear'` for UI motion (only valid for parallax / scrubs).
- Using `motion.div` purely for `whileHover` with no spring or layout reason — CSS `:hover` is cheaper.
- New animation libraries (`framer-motion`, `react-spring`, `lottie`) when motion + GSAP cover the case.
- Identical enter and exit duration (exits should be ~25% faster).
- Stagger > 200 ms between siblings (the page feels glacial).
- Re-running entrance on every state change — gate with `viewport={{ once: true }}` or a `useState` flag.

---

## 17. When in doubt

Pick the smaller motion. A precise 200 ms fade outperforms a sprawling
600 ms multi-element ballet that nobody waits to finish. Trim before
adding.
