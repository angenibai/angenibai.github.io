---
status: done
---

# Smooth the post-header row→column breakpoint

## Context

The post page header (`.postHeading` in `src/styles/Post.module.css`, rendered
by `src/pages/posts/[slug].tsx`) lays the title/date column and the splash
image side-by-side, switching to a stacked layout on narrow screens. Before
this change, that switch was _implicit_: both columns shared `flex: 1 1
320px; min-width: 320px;` inside a `flex-wrap: wrap` row, so the wrap only
fired once the container could no longer fit both at their hard 320px floor.
That produced two problems:

1. Right before the wrap fired, both columns got squeezed down toward 320px
   together, so the image rendered in an uncomfortably short, cramped band
   for a stretch of viewport widths just above the breakpoint — the
   transition felt abrupt rather than smooth.
2. After wrapping, `.postHeadingImageWrap`'s `border-left` (a vertical
   divider meant for side-by-side layout) stayed vertical even though the
   image was now stacked below the text — it should become a horizontal
   `border-top` to match `.postHeading`'s own top/bottom divider register
   (`docs/DESIGN_LANGUAGE.md`: structure is drawn with hard keylines, not
   ambient effects — the divider orientation should read as intentional).

The desired behavior: switch to column layout as soon as the row layout
would force the image row's height below the text column's own natural
height — i.e. switch _before_ the image gets squashed next to the text, not
only once both hit the 320px floor. This should be a single static CSS
`@media` breakpoint (matching the site's existing convention — see
`Home.module.css:26` and `Nav.module.css:6`, both simple single `max-width`
breakpoints, no container queries or JS-driven layout anywhere in the
codebase), not a JS/ResizeObserver-measured layout.

## Investigation (live-measured against the dev server)

- Both real posts' splash images are landscape: `easter-show-value-banner.png`
  is 1147×860 (ratio 1.334), `summarise-my-lecture-intro.jpg` is 1920×1080
  (ratio 1.778).
- Measured the text column's true unstretched height (decoupled from
  `align-items: stretch`) across both real titles: it steps in clean
  56px increments per line (`108 + 56×N`), where 56px is exactly the h1's
  `line-height: 3.5rem`.
- Computed, per real post, the container width at which the image column's
  height (`colWidth / aspectRatio`) equals the text column's natural height.
  The Easter Show post (4:3 image + longer title, so it runs taller both
  because the image is more square _and_ the title wraps to more lines) is
  the binding case: crossover at container width ≈890px, i.e. viewport
  width ≈989px (container = 90vw below the 1100px cap on `.main`, see
  `src/styles/components/Layout.module.css`).
- Chose `max-width: 1040px` as the breakpoint: ~50px buffer above the
  989px raw crossover, so the switch happens visibly before the squeeze,
  not right at the edge. Sanity-checked: above 1222px viewport, `.main`
  is already capped at 1100px container width, safely clear of the 890px
  crossover, so row mode is never at risk at wide desktop sizes.
- No portrait/near-square splash image exists yet to validate against, but a
  taller-than-landscape image only clears the crossover _more_ comfortably
  (the binding constraint was specifically the wide/landscape case), so this
  breakpoint stays conservative-safe in that direction.

## What changed

`src/styles/Post.module.css`:

1. Made the row/column switch explicit on `.postHeading` (`flex-direction:
row; flex-wrap: nowrap;` instead of relying on wrap-triggered min-width).
   `.postHeadingText` / `.postHeadingImageWrap` keep their row-mode `flex: 1
1 320px; min-width: 320px;` — it still governs the even 50/50 split above
   the breakpoint, now purely as a backstop the media query is tuned to
   prevent from ever biting.
2. Added `@media (max-width: 1040px)`:
   - `.postHeading { flex-direction: column; }`
   - `.postHeadingText, .postHeadingImageWrap { flex: 0 1 auto; min-width:
0; }` — necessary because `flex-basis` and `min-width` mean different
     axes once `flex-direction` flips to column (`flex-basis` would
     otherwise size _height_ to 320px; `min-width` would only constrain
     width, moot once stacked full-width). `align-items: stretch` on
     `.postHeading` still applies correctly to fill the cross axis (width)
     in column mode without an override.
   - `.postHeadingImageWrap { border-left: none; border-top:
var(--divider-width) solid var(--color-primary); }` — swaps the
     divider from vertical to horizontal, reusing the existing token.

Confirmed no knock-on issues: `overflow: hidden` on the image wrap stays a
harmless no-op (the image never overflows its aspect-matched box);
`.postHeadingText`'s `justify-content: space-between` has no effect once the
block's height is natural instead of stretched (no extra space to
distribute).

## Verification

- Live in the dev server (`npm run dev`) against both real posts. The
  sandboxed browser tooling used for this session couldn't resize its
  viewport above ~700px CSS width, so row-mode (>1040px) was verified via
  computed-stylesheet inspection (`document.styleSheets`) confirming the
  base rule is `flex-flow: row` outside the media query and the override
  only applies under 1040px — the actual visual full-desktop-width row
  layout should get a quick manual eyeball check next time this page is
  viewed on a normal screen, since "does it look right" past ~1040px is a
  judgment call the numbers alone don't fully settle.
- Confirmed live at ~700px viewport (`/posts/2023-04-08-easter-show-value`):
  column layout, `border-top` present (2px), `border-left` gone (0px),
  image renders full-width uncropped at its real aspect ratio below the
  title/date block.
- Confirmed `/posts/2021-08-12-summarise-my-lecture` (no `splashImageSource`)
  renders unaffected — no header image block, no regression.
- `npm run build` and `npm run lint` both pass; only pre-existing warning
  (`no-img-element` on the header `<img>`, unrelated to this change).
