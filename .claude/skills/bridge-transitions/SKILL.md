---
name: bridge-transitions
description: >-
  Bridge transition craft — route hand-offs, modal lifecycle, shared-element
  morphs (FLIP / layoutId), context-aware exits, list operations, optimistic
  updates with rollback, loading state hierarchy, form choreography,
  AnimatePresence patterns. Use when wiring any enter/exit, route change,
  modal lifecycle, drawer, dropdown, tab swap, accordion, list update,
  toast, skeleton swap, optimistic UI, or any state-to-state morph in
  Bridge.
---

# Bridge transition craft

Transitions are the connective tissue between states. They tell the user
"this is the same thing, just changed". Get them right and the product
feels real-time. Get them wrong and every interaction feels like a page
reload.

This skill is the choreography of state changes. For atomic motion
primitives (springs, scroll-linked, perfTier) see `bridge-motion`.

---

## 1. The four transition rules

1. **Continuity over flash.** If something is the same object before and after, it must morph (translate / scale), not fade-and-replace. The eye tracks identity through motion.
2. **Exit completes before re-render.** Use `AnimatePresence` and `mode="wait"` for one-at-a-time, or `mode="popLayout"` for overlapping.
3. **Asymmetric timing.** Enter is 220–320 ms ease-out. Exit is 160–220 ms ease-in (~25% faster). Symmetric timing reads as a video reversal, not a transition.
4. **Reduced-motion still tells the story.** Collapse to a 200 ms opacity crossfade plus an end-state translate of ≤ 4 px. Never zero-feedback "snap" between states.

---

## 2. The transition pyramid (pick the right tool)

```
                    layoutId / FLIP        ← shared element across views
                  /                  \
            AnimatePresence       motion.div  ← single element enter/exit
           /     spring          \   spring
       CSS keyframe            CSS transition  ← hover, focus, simple state
       (animate-pop-in)        (transition-all)
```

Decide top-down. Most cases live at the bottom (CSS transition or simple
`motion.div` springs). Reach for `layoutId` only when the same element
exists on both sides of the transition.

---

## 3. Route transitions

### Already wired (do not duplicate)

`App.jsx` keys the page wrapper on `location.pathname`, so React remounts
the page on route change, and the `animate-page-enter` utility (in
`index.css`) runs a fade-up keyframe.

```jsx
<div
  key={location.pathname}
  className="animate-page-enter"
>
  <Routes>…</Routes>
</div>
```

Do not add a second route-level animation library on top of this. If a
route needs hero-grade orchestration, gate it on a `ready` flag inside the
page component (see Section 4).

### Per-page hero coordination

The pattern from `pages/landing/index.jsx`: a `ready` flag delays internal
hero springs by ~60 ms so the route transition completes before the hero
fly-ins fire.

```jsx
const [ready, setReady] = useState(false);
useEffect(() => { const t = setTimeout(() => setReady(true), 60); return () => clearTimeout(t); }, []);
return <HeroSection ready={ready} />;
```

This eliminates the first-paint jitter on cold loads. Use it for any page
with > 3 internal entrance animations.

### Palette transitions across routes

Palette change via `applyPalette()` flips `html[data-palette]`. CSS
variables retint instantly. The body has a 240 ms `transition` on
`background-color` and `color` to soften the swap.

Do not add transitions to every individual surface. They multiply into
thousands of property animations on theme switch and cause main-thread
stalls.

---

## 4. Modal / dialog lifecycle (full pattern)

```jsx
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

function MyModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed left-1/2 top-1/2 z-[101] w-[min(92vw,540px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl p-7 sm:p-9"
            style={{
              backgroundColor: 'var(--bridge-surface-raised)',
              boxShadow: '0 60px 120px -30px rgba(0,0,0,0.4), 0 0 0 1px var(--bridge-border) inset',
            }}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            …
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Required behaviour

- `role="dialog"`, `aria-modal="true"`, labelled.
- Focus moves into the modal on open; returns to the trigger on close.
- `Esc` closes. Backdrop click closes (unless destructive form).
- Body scroll locked while open; restored on unmount.
- Backdrop and panel both have exit animations — never one without the other (snap-out reads as broken).
- Click-stop on the panel so backdrop click doesn't bubble.

Existing modals to mirror: `OnboardingModal`, `FeedbackModal`,
`ReviewModal`, `CancellationModal`, `MentorAvailabilityModal`,
`NotificationPanel`.

### Context-aware exits (advanced)

If the modal was opened from a specific element (an inline button on a
card), the modal can exit *toward* that element rather than to center. Use
`layoutId` for the lift-from-card pattern, or compute the trigger's
bounding rect on open and animate `x`, `y` to it on exit.

```jsx
const [originRect, setOriginRect] = useState(null);
const onTriggerClick = (e) => {
  setOriginRect(e.currentTarget.getBoundingClientRect());
  setOpen(true);
};
// in modal exit:
exit={{ opacity: 0, scale: 0.5, x: originRect ? originRect.left - centerX : 0, y: originRect ? originRect.top - centerY : 0 }}
```

This is reserved for hero moments; standard modals exit centered.

---

## 5. Shared-element transitions (FLIP / layoutId)

The same element exists on both sides of a state change (card on grid →
expanded card on detail; collapsed item → expanded item). `motion/react`'s
`layoutId` makes this two lines:

```jsx
// In the grid
<motion.div layoutId={`mentor-${id}`} className="mentor-card">…</motion.div>

// In the detail view (or expanded modal)
<motion.div layoutId={`mentor-${id}`} className="mentor-card-expanded">…</motion.div>
```

Both elements share the layout animation. Their position and size morph
together when one mounts as the other unmounts.

### Use sparingly

Reserved for headlining transitions: grid → detail, list → focus mode.
Layout animations are expensive — running them on a 50-card grid drops FPS.

### Caveats

- IDs must be globally unique within the React tree at any given time. Two `mentor-12` mounted simultaneously will fight.
- `layoutId` triggers `layout` animation on every property — set `transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}` to control timing.
- Avoid combining `layoutId` with `whileHover` on the same element — the hover transform competes with the layout interpolation.

### FLIP (manual fallback)

When `layoutId` is too heavy or you need fine-grained control, run FLIP
manually:

1. **First** — measure source rect.
2. **Last** — render destination, measure rect.
3. **Invert** — apply transform that places destination at source visually.
4. **Play** — animate transform to identity.

Use the Web Animations API for FLIP (`element.animate(...)`) — it stays on
the compositor thread and is cheaper than React-driven layout animation.

---

## 6. Drawer / sheet / popover

### Drawer (right-side or bottom)

```jsx
<motion.aside
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', stiffness: 320, damping: 36, mass: 0.7 }}
/>
```

Springs make drawers feel physical. Same `AnimatePresence` + backdrop +
focus-trap pattern as modals.

### Bottom sheet (mobile)

`y: '100%'` source; add a drag handle at the top; on drag-down past 50%
of height, dispatch close.

### Popover / dropdown / FAB menu

Use the existing `animate-pop-in` utility:

```jsx
<div
  role="menu"
  className="absolute right-0 top-full mt-2 animate-pop-in rounded-xl"
  style={{
    backgroundColor: 'var(--bridge-surface-raised)',
    boxShadow: '0 12px 28px -12px rgba(0,0,0,0.18), 0 0 0 1px var(--bridge-border) inset',
  }}
>
  …
</div>
```

160 ms scale + fade with `transform-origin: top right`. Outside-click closes.
`Esc` closes. Focus trapped inside the menu while open.

---

## 7. Tab / accordion choreography

### Tab swap (different children, same height container)

```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, x: 8 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -8 }}
    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
  >
    {tabContent[activeTab]}
  </motion.div>
</AnimatePresence>
```

The directional `x` offset (in by 8 px from one side, out by 8 px to the
other) reads as forward/backward; pure crossfade reads as a flicker.

### Accordion (height auto)

```jsx
<motion.div
  initial={false}
  animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
  transition={{
    height:  { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
    opacity: { duration: 0.18 },
  }}
  style={{ overflow: 'hidden' }}
>
  {children}
</motion.div>
```

Animating to `height: 'auto'` is one of the few cases where layout
animation is acceptable. Keep contents simple — avoid nested `auto`
heights, which interpolate unevenly.

### Tab indicator (sliding underline)

```jsx
<motion.div
  layoutId="tab-underline"
  className="absolute bottom-0 h-0.5"
  style={{ backgroundColor: 'var(--color-primary)' }}
  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
/>
```

`layoutId` makes the underline glide between tabs as the active state
changes — cheap, satisfying, branded.

---

## 8. List operations (add, remove, reorder)

```jsx
<AnimatePresence mode="popLayout">
  {items.map((item) => (
    <motion.li
      key={item.id}
      layout
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {item.label}
    </motion.li>
  ))}
</AnimatePresence>
```

- `layout` animates position changes (sort / insert).
- `mode="popLayout"` means exits do not block new items appearing — siblings shift to fill the space immediately.
- Stagger insert by `transition={{ delay: index * 0.04 }}` only for the *first* render; subsequent inserts should be immediate.

### Drag-to-reorder

`motion/react`'s `Reorder.Group` + `Reorder.Item` handles HTML5-free
drag-to-sort. Pair with `layout` for the inter-item slide.

---

## 9. Toast lifecycle

- **Enter**: `pop-in` from above-right, 200 ms.
- **Linger**: 4–6 s for info, 7+ s for error, sticky for action-required.
- **Exit**: 200 ms fade + slide-up.
- **Stack**: gap-2, new toasts insert at the top.
- **Pause on hover/focus**: auto-dismiss timer clears on `onMouseEnter`/`onFocus`, restarts on leave.
- **Roles**: `role="status"` for info, `role="alert"` for errors, `role="alertdialog"` if it requires a button click.

```jsx
<AnimatePresence mode="popLayout">
  {toasts.map((t) => (
    <motion.div
      key={t.id}
      role={t.kind === 'error' ? 'alert' : 'status'}
      layout
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {t.content}
    </motion.div>
  ))}
</AnimatePresence>
```

---

## 10. Loading state hierarchy

Loading is a transition between "no data" and "data". Get the hierarchy
right:

| Wait time | Pattern |
|---|---|
| < 200 ms | Show nothing. The result lands without flicker. |
| 200 ms – 1 s | Skeleton matching final layout dimensions. Crossfade to content. |
| 1 s – 5 s | Skeleton + an indeterminate accent (subtle pulse on a key element). |
| > 5 s | Determinate progress (percentage, step count) plus a "this is taking longer than usual" message at 10 s. |

**Skeleton match rule**: the skeleton occupies the same width and height
as the final content. Otherwise the page jumps when content arrives —
the worst possible loading experience.

```jsx
{loading ? (
  <div className="space-y-3">
    <div className="h-6 w-1/2 animate-pulse rounded bg-[var(--bridge-surface-muted)]" />
    <div className="h-4 w-full animate-pulse rounded bg-[var(--bridge-surface-muted)]" />
    <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--bridge-surface-muted)]" />
  </div>
) : (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }}>
    {content}
  </motion.div>
)}
```

Spinners (`<LoadingSpinner />`) are reserved for indeterminate, non-content
operations: a button that's submitting, an API call inside an interaction.

---

## 11. Optimistic updates with rollback motion

When the user takes an action whose outcome is predictable (favourite a
mentor, react to a message), update the UI **before** the server confirms.
On failure, animate back to the previous state.

```jsx
async function toggleFavorite(mentorId) {
  // optimistic
  setFavorites((f) => new Set(f).add(mentorId));
  try {
    await addToFavorites(mentorId);
  } catch (err) {
    // rollback with motion
    setFavorites((f) => {
      const next = new Set(f);
      next.delete(mentorId);
      return next;
    });
    showToast({ kind: 'error', content: 'Could not add favourite. Try again.' });
  }
}
```

The UI animation that reflects "added" should run on the optimistic state
change. The rollback then runs the reverse animation. To the user, success
feels instant; failure feels recoverable.

### When to skip optimistic

- Destructive actions (delete account, cancel session) — confirm first.
- Payment / Stripe — never optimistic.
- Cross-user effects (booking that another user sees in realtime) — wait for confirmation.

---

## 12. Form-state choreography

Forms are sequences of micro-transitions. Each one is a small choreography:

| Trigger | Transition |
|---|---|
| Field focus | Border color shifts to `--color-primary`, focus ring fades in over 180 ms |
| Field invalid | Border color shifts to `--color-error` over 180 ms; helper text accordion-expands below |
| Field valid (after error) | Border returns to `--bridge-border`, helper text accordion-collapses |
| Submit click | Button label crossfades to spinner without resizing the button (use fixed `min-width`) |
| Submit success | Button background morphs to `--color-success` over 240 ms; label changes after morph completes |
| Submit failure | Button shake (3 small `x` oscillations over 240 ms) + error toast |

The shake-on-error is one of the most effective micro-transitions in any
form — it directs attention to the failure without interrupting flow.

```jsx
const shake = {
  initial: { x: 0 },
  animate: { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } },
};
<motion.button variants={shake} animate={errored ? 'animate' : 'initial'}>…</motion.button>
```

---

## 13. Skeleton → content swap (the polish detail)

The crossfade between skeleton and content should be one frame "behind"
the layout settle. Pattern:

```jsx
<motion.div
  initial={{ opacity: 0, y: 4 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
>
  {content}
</motion.div>
```

The `y: 4` start gives a tiny rise that signals "this is the real thing",
not a static replacement. Skeleton fades out (160 ms) before content fades
in — they overlap by ~80 ms. Pure cross-fade reads as a flicker.

---

## 14. Page → modal hand-off

If a card opens a quick-view modal (without route change), use `layoutId`
so the modal grows from the card's bounding rect:

```jsx
// On the card
<motion.div layoutId={`quickview-${id}`}>
  <h3>{name}</h3>
  …
</motion.div>

// In the modal panel (when open)
<motion.div layoutId={`quickview-${id}`}>
  <h3>{name}</h3>
  …
</motion.div>
```

If the card opens a full route, do **not** also try `layoutId` — combining
React Router's unmount with `layoutId` is fragile. Use a standard route
transition.

---

## 15. Quick-pick decision matrix

| Situation | Pattern |
|---|---|
| Route change | `key={pathname}` + `animate-page-enter` (already wired) |
| Show / hide modal | `AnimatePresence` + scale + translate spring |
| Show / hide popover | `animate-pop-in` utility |
| Tab swap | `AnimatePresence mode="wait"` + small `x` directional shift |
| Accordion | `motion.div` animating to `height: auto` |
| List edits | `AnimatePresence mode="popLayout"` + `layout` |
| Toast | local `AnimatePresence` per toast in a stack |
| Skeleton → content | conditional render, fade + 4 px rise |
| Page → detail with shared el | `layoutId` |
| Optimistic action | local state update first, rollback animation on failure |
| Hover state | CSS `transition` only (no `motion`) |
| Tab indicator | `motion.div layoutId="tab-underline"` |
| Drag-to-reorder list | `Reorder.Group` + `Reorder.Item` |

---

## 16. Anti-patterns (auto-reject)

- Animating modal exit but not backdrop exit (snap-out feels broken).
- Long enter (> 320 ms) on a list with > 6 items — staggered entries pile up.
- Cross-fading text content in tab swap (looks like a flicker — use a directional `x` shift).
- Animating `height: auto` for content that may exceed viewport — cost is enormous; prefer fixed-max with overflow scroll.
- Letting a parent animation re-fire when children change — wrap children in their own `AnimatePresence`.
- `layoutId` on hover-animating elements (the two animations fight).
- Showing a spinner for < 200 ms loads (causes flicker).
- Skeleton dimensions that don't match content dimensions (layout shift).
- Symmetric enter and exit timing (reads as reversal).
- Optimistic updates on destructive or financial actions.

---

## 17. Verification ladder

Before declaring a transition done:

1. **Slow network**: throttle to "Slow 3G" in DevTools. Loading hierarchy should kick in (skeleton → indeterminate accent → message).
2. **Reduced motion**: confirm transitions become 200 ms opacity crossfades, not zero-feedback snaps.
3. **Failure path**: force the API call to fail. Optimistic updates should roll back with motion. Toasts should announce.
4. **Rapid open/close**: spam the trigger. `AnimatePresence` should not orphan elements; no zombie modals.
5. **All six visual states**: 3 palettes × 2 themes — transition timings unchanged, gradient borders animate, focus rings appear in the correct color.
6. **Keyboard only**: `Tab` reaches every interactive element, `Esc` closes modals/drawers, focus restored to trigger on close.

If any check fails, fix at the transition layer — not by adding extra
state to mask the gap.
