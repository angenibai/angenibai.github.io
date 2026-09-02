# Posts list hover panel — cursor-anchored, viewport-aware

## Context

`/posts` renders bare text rows with the splash image in a hover panel
(`src/components/PostPreviewPanel.tsx`), built pure-CSS per
`plans/POSTS_LIST_RECEIPT_PLAN.md`. The panel is `position: absolute` on the
row at `top: calc(100% + 0.25rem); left: 0` — always below, always left-aligned.

CSS can't measure, and that's a live bug, not a someday one. The receipt plan's
own "as built" notes (departure 2) measured it: at 1440×900 the `/posts`
document is 757px with `scrollHeight === clientHeight`, and the last row's panel
runs to 787px — the `with …` line and the offset shadow are off the page and
**cannot be scrolled to**. At two posts.

The fix is the deferred item already recorded in
`plans/POSTS_LIST_RECEIPT_PLAN.md` Part 3 and `docs/FUTURE_WORK.md`:
reimplement the reveal in JS so it can measure available space.

**Settled in conversation:**

- **Fully cursor-anchored, tracking continuously.** The panel follows the
  pointer in both axes, not pinned to the row's left edge.
- **Flip against the viewport**, not the document — flip above the cursor when
  the panel would pass the bottom of the visible window.
- **Horizontal clamp.** Cursor-anchoring destroys the receipt plan's "≤360px
  inside an 880px list can never overflow" guarantee; `src/styles/globals.css`
  sets `body { overflow-x: hidden }`, so an overflowing panel is silently sliced
  rather than scrollable. Clamping is required, not polish.
- **Dwell timers** — ~100ms before showing, ~200ms grace before hiding.
- **Per-row panels kept.** `visibility: hidden` (not `display: none`) is what
  makes `next/image` prefetch every splash image so the first hover is never an
  empty frame. A shared panel would trade that away.
- **Grace zones / safe triangle dropped.** They exist so the cursor can travel
  into the popup; this panel is `aria-hidden`, `pointer-events: none`, has
  nothing clickable, and moves away from the pointer by definition.
- **Touch/narrow unchanged.** Both existing gates stay.

**Convention break, deliberate:** `plans/POST_HEADER_BREAKPOINT_PLAN.md` records
"no JS-driven layout anywhere in the codebase". This breaks it, for the reason
above.

---

## Approach

React state holds only `activeSlug` — it changes once per row entry. Continuous
cursor tracking writes `transform` imperatively to the DOM node inside a
`requestAnimationFrame`, so mousemove never triggers a React render.

Placement and reveal are split across two nested elements so they don't fight:
an outer `.anchor` carries `position: fixed` and the per-frame placement
transform with **no transition**; the inner `.panel` keeps all appearance plus
the existing `0.12s` opacity/translateY entrance. Putting both on one element
would make the 0.12s ease apply to placement too, and the panel would visibly
lag the cursor.

A single `activeSlug` at the list level preserves the "only one panel ever
visible" invariant that `pointer-events: none` currently provides for free —
important because the 200ms hide grace and 100ms show delay overlap when
sweeping between rows.

### Placement math

Inputs: `clientX`/`clientY`, the panel's cached `{width, height}`, and
`document.documentElement.clientWidth`/`clientHeight` (not `window.innerWidth` —
excludes scrollbars).

```
OFFSET = 16   // gap from cursor
MARGIN = 12   // min gap from viewport edge
SHADOW = 10   // box-shadow: 10px 10px extends past the border box
```

- **Vertical:** `y = clientY + OFFSET`. If
  `y + height + SHADOW + MARGIN > viewportH`, flip: `y = clientY - OFFSET - height`.
  Then `y = max(y, MARGIN)`.
- **Horizontal:** `x = clientX + OFFSET`, clamped to
  `[MARGIN, viewportW - width - SHADOW - MARGIN]`. Near the right edge the panel
  slides left and sits under the cursor — harmless, since `pointer-events: none`
  means it can't steal hover.
- Measure the panel **once per activation** via `getBoundingClientRect()` and
  cache it; content is fixed for the duration of one row's hover. The rect is
  valid despite `visibility: hidden` — another reason not to use `display: none`.

### Scroll

Coordinates are viewport-relative and the panel is `fixed`, so scrolling without
moving the mouse would leave it stranded while the row moves. Hide on scroll
(clear `activeSlug`); simplest and calmest.

### Keyboard

`:focus-within` currently reveals the panel. Preserve it: on `focus`, feed the
same placement function the row's `getBoundingClientRect()` — `clientX = rect.left`,
`clientY = rect.bottom` — so flip and clamp apply identically.

---

## Files

**New — `src/hooks/usePostPreview.ts`** (new directory, one file)

Exports the hook plus a pure `computePlacement({ x, y, width, height, viewportW, viewportH })`
returning `{ x, y, flipped }`, kept separate so the math is readable in isolation.

The hook owns: `activeSlug` state; a `Map<slug, HTMLElement>` of registered
anchor nodes; show/hide timer refs; a rAF handle; a cached panel size ref; an
`enabled` flag from `matchMedia("(hover: hover) and (min-width: 640px)")` with a
`change` listener. Returns `activeSlug`, `getRowProps(slug)`
(`onMouseEnter`/`onMouseMove`/`onMouseLeave`/`onFocus`/`onBlur`) and
`getPanelProps(slug)` (`ref`, `data-visible`). All handlers no-op when
`enabled` is false, so phones attach nothing.

**`src/pages/posts/index.tsx`** — call the hook and spread `getRowProps(slug)`
onto `.row`, `getPanelProps(slug)` onto the panel. `getStaticProps` untouched.
State-in-page matches the existing precedent in `src/pages/projects/index.tsx`,
the only other interactive page in the codebase.

**`src/components/PostPreviewPanel.tsx`** — wrap the existing panel in an
`.anchor` div; `forwardRef` to that div; pass `data-visible` through. Inner
markup, `aria-hidden`, `alt=""` and the `next/image` 640×480 hint all unchanged.

**`src/styles/components/PostPreviewPanel.module.css`**

- New `.anchor { position: fixed; top: 0; left: 0; z-index: 2; pointer-events: none; }`
  — no transition on it.
- `.panel` drops `position: absolute`, `top`, `left`, `z-index`, `pointer-events`
  (they move to `.anchor`); keeps border, `10px 10px` shadow, sizing, `opacity`,
  `visibility`, the `translateY(4px)` entrance and `0.12s` transition.
- Reveal rule moves in here:
  `.anchor[data-visible="true"] .panel { opacity: 1; visibility: visible; transform: none; }`
  — same file, so the cross-module `data-post-panel` bridge is no longer needed
  and gets deleted.
- Keep `@media (hover: none) { .panel { display: none } }` verbatim — this is
  what stops phones downloading splash images.
- Keep the `prefers-reduced-motion` block — it targets `.panel`, and `.anchor`'s
  placement transform is untransitioned anyway.

**`src/styles/PostList.module.css`** — delete the
`@media (hover: hover) and (min-width: 640px)` reveal block and the
`data-post-panel` explanation comment. Keep `.row { position: relative }` — it's
still the containing block for `PostEntry`'s absolutely-positioned `.pin`.

**Docs** — `docs/FUTURE_WORK.md`: move the "Reimplement the hover panel in JS"
item from open to done, pointing at this file.
`plans/POSTS_LIST_RECEIPT_PLAN.md`: mark "as built" departure 2 (bottom
overflow) resolved and Part 3's first two deferred items done.

---

## Rendering & performance impact

**At rest, nothing changes.** Still SSG; `getStaticProps` untouched, no new data
in `__NEXT_DATA__`. The only markup delta is one wrapper `<div>` per row. The
panel is already out of flow, so `absolute → fixed` reflows nothing — rows,
spacing, dot leader and pin lay out identically. Splash images still download on
page load, exactly as today (`visibility: hidden` preserved).

**Two real regressions, both accepted:**

- Hovering before hydration no-ops, where the CSS version worked as soon as the
  stylesheet landed. Short window on a static page, but real. No bundle cliff —
  Pages Router already hydrates every page, so the cost is the hook itself.
- Placement now depends on JS, so a JS error breaks the reveal entirely rather
  than degrading. Keep the hook small and total.

**Lag — the three failure modes and how the design avoids each:**

1. *React render per mousemove.* State holds only `activeSlug` (changes once per
   row entry); tracking writes `transform` to the DOM inside a rAF.
2. *Transitioning the placement transform.* The reason placement and reveal are
   split across two elements. Sharing one element would apply the existing
   `0.12s ease` to placement and make the panel visibly trail the cursor — lag by
   construction, not by cost.
3. *Layout thrash.* `getBoundingClientRect()` is a forced sync layout read;
   cached once per activation, never per frame.

Per frame that leaves a single `transform` write on a `fixed` element —
compositor-only, no layout, no repaint of the card.

**Residual risk is feel, not frames.** A 360px bordered card with a hard 10px
offset shadow sliding continuously is busier than one that lands and holds. Keep
the tracking mode a single constant in the hook so switching to place-on-enter is
a one-line change if it reads as restless.

---

## Notes / gotchas

- The receipt plan's responsiveness table says 900px; commit `b656b3b` shipped
  **640px**. Use 640 and correct the plan text.
- Don't switch to `display: none` for the hidden state anywhere — it breaks both
  the image prefetch and the `getBoundingClientRect()` measurement.
- Set the placement transform on the *outer* node only. Any transition on
  `.anchor` reintroduces cursor lag.
- Clear both timers and the rAF handle in the hook's cleanup.
- **First placement per activation must be synchronous.** The show-timer
  callback measures, writes the `translate3d()` to `.anchor`, *then* calls
  `setActiveSlug`. If the state update ran first, the `fixed` `.anchor` would
  paint one frame at its `top:0; left:0` origin (viewport top-left) before the
  next rAF moved it to the cursor — a visible corner flash on every first hover.
  rAF is only for the subsequent per-frame tracking updates. (`reveal()` in
  `src/hooks/usePostPreview.ts`.)

---

## As built

Shipped as planned. Notes:

- **Not a bug — dev-only measurement artifact.** During browser verification
  the panel appeared to collapse to `0×0` while hidden, which would have broken
  both the `getBoundingClientRect()` measurement and the image prefetch. It was
  a stuck `<style data-next-hide-fouc>body{display:none}</style>` — Next.js's
  dev-mode FOUC guard, normally removed the moment hydration completes, left
  behind by repeated rapid navigations plus a mid-session `next dev` restart. In
  a clean tab (and in `npm run build`, which emits no such style) the hidden
  panel measures `262×356`, `.imageFrame` measures `238×180` from the `640×480`
  hint before the image loads, and the splash image reports `complete` on page
  load with no hover. The `visibility: hidden` premise holds.
- Verified: `npm run build` type-checks; bottom-flip (panel flips above the
  cursor near the viewport bottom, shadow on-screen); right-edge clamp (panel
  right + 10px shadow stays inside the viewport); cursor tracking; first-hover
  image prefetch.
- `computePlacement` returns `{ x, y }` only — no `flipped`; it had no consumer
  and no standalone meaning.

---

## Verification

`npm run build` first — it type-checks. Then `npm run dev` and drive it in a
browser:

1. **Bottom flip** — resize to a short window (≈1440×700) so the last row's
   panel has no room below. It must flip above the cursor, fully on-screen,
   shadow included. This is the live bug from departure 2; confirm it's gone.
2. **Right clamp** — at ~1024px wide, hover the right end of a long title. The
   panel's right edge plus its 10px shadow must stay inside the viewport, not
   sliced by `overflow-x: hidden`.
3. **Tracking** — the panel follows the cursor across a row with no visible lag
   and no jitter; flip direction switches cleanly mid-row near the boundary.
4. **Dwell** — sweep the cursor quickly down the list: no strobe, no panel for
   rows merely passed over. Move slowly between two rows: no blink to empty in
   the 1.75rem gap. Never more than one panel visible.
5. **Scroll** — hover a row, scroll without moving the mouse: the panel hides
   rather than stranding.
6. **First hover** — hard reload, hover immediately. The image must already be
   there, not fetch on hover (regression check on the `visibility: hidden`
   prefetch).
7. **Keyboard** — Tab through the rows; the panel appears near each focused row
   and respects flip/clamp.
8. **Touch/narrow** — device emulation and a <640px window: no panel, no splash
   image requests in the network panel, date wraps to its own line.
9. **Reduced motion** — with `prefers-reduced-motion: reduce`, the panel cuts in
   with no fade or translate, and placement still works.
