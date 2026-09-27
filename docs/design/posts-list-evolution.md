---
status: done
---

# Posts list page

The `/posts` list went through three designs: a metadata-grid "Catalogue"
(built, then abandoned), a bare-text "Receipt" (adopted), and a JS
reimplementation of the Receipt's hover panel (a deliberate break from a
site-wide convention).

## Design decisions during implementation

### The Catalogue was abandoned for reading like a generic feed

Stacked up as a list, the metadata-grid design read as a generic news feed,
unlike the rest of the site's flat panels with hard keylines and solid offset
shadows — so it was rejected after being built, not iterated on. The design
itself: numbered entries (`No. 02`), a hairline metadata grid (`FILED UNDER` /
`WITH`), duotoned thumbnails that revealed full color on hover, and IBM Plex
Mono repurposed from code-only to small letterspaced caps for metadata labels
and figures. The Receipt design that replaced it went the opposite direction
— collapsing to bare text — rather than iterating on the grid.

Worth keeping in case a metadata-grid layout comes back: the duotone recipe
(grayscale + `mix-blend-mode: multiply` for the image, a `mix-blend-mode:
lighten` green overlay via `::after`, both guarded by `@media (hover: none)`
and `prefers-reduced-motion`) and the `No.` numbering rationale (build-time
index ascending by date, stable as new posts are added on top) were sound
ideas independent of the layout they were built for.

### The Receipt: what shipped differently from the plan

The Receipt design collapses the list to two-line text rows (title + dotted
leader + date, then an italic blurb), with the splash image moved entirely
into a hover panel modeled on `BioPanel`'s visual grammar (green border, hard
offset shadow, filled header bar). Two things measured differently once
built:

- **Panel width didn't follow the image.** The plan assumed
  `width: max-content` plus a 240–360px clamp would let the image's aspect
  ratio drive the panel's width. Measured, both panels came out at exactly
  360px — the excerpt paragraph's unwrapped width (~600px at 100 characters)
  always won the intrinsic-sizing contest. Fixed by making `.panel` a
  single-column grid (`grid-template-columns: max-content`) and having the
  text children opt out of contributing to that measurement via `width: 0;
min-width: 100%`, leaving only the image frame to set the column width.
  After the fix, a 4:3 splash produced a 262px panel and a 16:9 splash a
  339px panel, matching native ratios to three decimals.
- **The panel could overflow the bottom of the page at just two posts.** The
  plan assumed a page with only two posts near the top couldn't have this
  problem; measured, the document was 757px tall with `scrollHeight ===
clientHeight`, and the last row's panel ran to 787px — off-page and
  unreachable by scrolling. This is what motivated the JS reimplementation
  below, since pure CSS has no way to measure available viewport space.

Minor as-built notes: the responsiveness gate shipped at `640px`, not the
`900px` written in the original plan; the link's accessible name still
includes title + date + blurb (the panel itself is excluded, as intended, but
those three sit inside the anchor); and one post's excerpt happens to echo its
own blurb (a `_..._` dek at the top of the body) — accepted rather than
special-cased.

### The JS panel: a deliberate break from "no JS-driven layout"

The site's stated convention (recorded while designing the post-header
breakpoint) is a single static CSS breakpoint per component, no JS-measured
layout anywhere. The hover panel breaks this on purpose: CSS cannot measure
available viewport space, and that's what caused the Receipt's bottom-overflow
bug above. `src/hooks/usePostPreview.ts` measures the panel once per hover
activation and flips/clamps its position against the actual viewport.

Design choices worth keeping:

- **State is minimal by design.** React state holds only the active row's
  slug; continuous cursor tracking writes a `transform` directly to the DOM
  inside a `requestAnimationFrame`, so mousemove never triggers a re-render.
- **Placement and reveal are split across two nested elements** (an outer
  `.anchor` with the per-frame placement transform and no transition, an
  inner `.panel` with the existing opacity/translateY entrance). Putting both
  concerns on one element would apply the entrance easing to cursor-tracking
  too, and the panel would visibly lag the cursor.
- **`visibility: hidden`, never `display: none`, for the inactive state.**
  `display: none` would stop `next/image` from prefetching the splash image,
  so the first hover on each row would show an empty frame while it loads.
  Keeping the element in the layout tree (just invisible) preserves the
  eager-prefetch behavior the CSS-only version got for free, and also keeps
  `getBoundingClientRect()` measurable for placement math.
- **The first placement per activation must be synchronous, not
  rAF-deferred.** The show-timer callback measures and writes the initial
  `translate3d()` before flipping `activeSlug` on. Reordering that would let
  the `position: fixed` anchor paint one frame at its default top-left origin
  before the next animation frame moved it — a visible corner-flash on every
  first hover. rAF is only used for the continuous per-frame tracking updates
  after that.

As-built note: a dev-only measurement artifact (the panel briefly appeared to
collapse to `0×0`) turned out to be a stuck Next.js dev-mode FOUC guard
(`<style data-next-hide-fouc>`) left behind by rapid navigation plus a
mid-session `next dev` restart — not a real bug. `npm run build` output (which
emits no such style) and a clean dev tab both measured the panel correctly.
