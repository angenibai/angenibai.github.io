# Fix post-frame gap texture mismatch + add image divider ornament

## Context

The post page's code blocks and images bleed past the post's vertical frame
border (`.postContent`'s `border-left`/`border-right` in
`src/styles/Post.module.css`) since they're wider than the text column. To
keep the border from cutting off flush against their edges, both are wrapped
in a component (`Code.tsx`/`Code.module.css`, `Image.tsx`/`Image.module.css`)
whose own vertical padding paints over the border for a bit before/after the
content, creating a visible "gap."

That mask currently uses a flat `background-color: var(--color-bg-white)`.
The user flagged that this doesn't match the *true* page background, which
is textured (`body` in `globals.css` layers `noise-2.svg`, a seamless
`feTurbulence` grain, on top of the flat color). A flat patch reads as a
visibly different rectangle against the grainy page.

Investigation (confirmed live in the dev server via temporary DOM/style
injection — no repo files touched during this investigation):
- `noise-2.svg` has no intrinsic width/height, only a `viewBox="0 0 400
  400"`. With `background-size` left at its default `auto` (as `body`
  currently has it), each element sizes the image independently — a large
  box like `body` stretches it very differently than a short wrapper strip.
  That's the actual mismatch the user spotted (not just phase/position, but
  effective grain *scale*). A first fix attempt (just adding the same
  `background-image` to the wrappers, no explicit size) still had this flaw.
- The real fix: give **both** `body` and the wrapper elements the same
  explicit `background-size` (e.g. `400px 400px`), so all of them tile the
  same fixed-scale pattern instead of each auto-stretching independently.
  Tested live — with matching sizes, the grain is pixel-continuous across
  the wrapper/body boundary (zoomed screenshots show no seam). Also
  confirmed that adding this explicit size to `body` alone doesn't
  perceptibly change the homepage's existing look (spot-checked before vs.
  after) — this is a legitimate, low-risk touch to the shared rule, not a
  redesign of the page background.
- `background-attachment: fixed` was considered and rejected: `body` uses
  the default `scroll` attachment (texture scrolls with page content); if
  only the wrapper used `fixed`, its texture would stay pinned to the
  viewport while `body`'s scrolls away underneath, visibly drifting apart
  during scroll. Both stay on default `scroll`.

Separately, the user asked for images (not code blocks) to get a small
top/bottom divider ornament inside that gap — shorter than the h2 dividers
— to visually "set the image apart," and for `<figcaption>` (used in one
real post) to sit *inside* that bracket rather than below it.

## Approach

### 1. Shared background-size fix (texture match)

`src/styles/globals.css` — add an explicit size to the existing `body` rule
so it's no longer auto-stretched per-viewport:
```css
body {
  background-color: var(--color-bg-white);
  background-image: url("/noise-2.svg");
  background-size: 400px 400px;
}
```

`src/styles/components/Image.module.css` and
`src/styles/components/Code.module.css` — add the same image + the same
explicit size to `.imageWrapper` / `.codeBlockWrapper` (which already carry
`background-color: var(--color-bg-white)`):
```css
background-image: url("/noise-2.svg");
background-size: 400px 400px;
```

### 2. Image divider ornament + caption-in-bracket

`src/styles/components/Image.module.css` — change `.imageWrapper` from a
row flex (`justify-content: center`) to a column flex
(`flex-direction: column; align-items: center`), and add short, centered,
medium-weight (`var(--divider-width)`, matching the h2 divider weight)
rules via `::before`/`::after`, clearly shorter than the h2 dividers
(which run `width: fit-content` against heading text, typically 8–20+rem):
```css
.imageWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-bg-white);
  background-image: url("/noise-2.svg");
  background-size: 400px 400px;
  margin: 0 calc(-1.5rem - var(--border-width)) 1rem;
  padding: 1.25rem 0; /* bumped from 0.75rem — same value already used by
                          the h2 divider's own padding, reusing an existing
                          number rather than inventing a new one */
}
.imageWrapper::before,
.imageWrapper::after {
  content: "";
  display: block;
  width: 3rem;
  border-top: var(--divider-width) solid var(--color-primary);
}
.imageWrapper::before { margin-bottom: 0.75rem; }
.imageWrapper::after { margin-top: 0.75rem; }
```

Real posts use raw `<figure><img/><figcaption/></figure>` HTML (confirmed
in `_data/posts/2021-08-12-summarise-my-lecture.md`), and `.postContent
figure`/`.postContent figcaption` in `Post.module.css` already style that
case (figure is `display:flex; flex-direction:column; align-items:stretch`
so the image wrapper's bleed still reaches full width; figcaption is a
green pill that overlaps the image by `margin-top: -0.5rem`). For that
case, the closing divider must render *after* the figcaption, not right
after the image — otherwise the caption ends up below/outside the bracket.
Fix (tested live, confirmed correct ordering and no doubled rule):

`Image.module.css` — suppress the wrapper's own closing divider specifically
when it's inside a `<figure>` (plain tag selector, no cross-module
reference needed since `figure` isn't a CSS-modules class):
```css
figure > .imageWrapper::after {
  content: none;
}
```

`src/styles/Post.module.css` — add the closing divider to `figure` itself
instead, so it always lands after the last child (the image when there's no
caption is fine since this only fires *inside* `figure`, which by
definition holds a caption in this codebase; still safe either way since
`figure::after` is last-in-DOM regardless of caption presence):
```css
.postContent figure::after {
  content: "";
  display: block;
  width: 3rem;
  margin: 0.75rem auto 0;
  border-top: var(--divider-width) solid var(--color-primary);
  align-self: center; /* figure's align-items:stretch would otherwise
                          left-align a fixed-width flex item */
}
```

Also retune `.postContent figcaption`'s existing `margin-top: -0.5rem` to
`-0.75rem` in the same file — tested live, keeps the caption pill snug
against the image under the new, slightly larger gap padding.

### 3. Code blocks: texture fix only, no divider ornament

Recommended default (not explicitly contested by the user, who focused on
the texture bug and caption placement): code blocks get step 1's background
fix only, and keep their current plain wrapper — no `::before`/`::after`
rules. Rationale: the dark, rounded (`border-radius: 0.5rem`), syntax-
colored panel already reads as a strong, self-contained visual block
against the cream page on its own. Stacking the same rule-ornament next to
it would put two competing "framing" devices back-to-back in a small area,
cutting against `docs/DESIGN_LANGUAGE.md`'s "boldness in small, isolated
spots... never smeared" principle. If the user wants the ornament there
too after seeing the images, it's a small, symmetric follow-up.

## Future optimization (not doing now)

Every `.imageWrapper`/`.codeBlockWrapper` instance references the same
`/noise-2.svg` `feTurbulence` filter. Checked: this adds no new network
requests (same URL as `body`'s existing background, browsers dedupe fetches
to one URL per page), and giving `body` and all wrappers the same explicit
`background-size: 400px 400px` (step 1 above) means every usage rasterizes
to the identical 400×400 output, so browsers can likely reuse one cached
rasterized tile everywhere rather than re-running the turbulence filter per
element. Worst case if that reuse doesn't happen in some browser: a handful
of extra small rasterizations per post (e.g. ~25 on the longest post today)
— not expected to be perceptible, but unverified without profiling.

If this ever needs to be a non-issue rather than a "probably fine": swap
`noise-2.svg`'s live `feTurbulence` filter for a small pre-rendered raster
tile (PNG, baked from the same filter) so every usage is a plain bitmap
decode+tile instead of procedural computation. Everything else in this plan
(sizes, wrapper structure, dividers) would stay identical — only the
`url()` target changes. Deferred for now; revisit if real-device profiling
or a much larger post ever suggests it's warranted.

## Files

- `src/styles/globals.css` — `body` background-size
- `src/styles/components/Image.module.css` — texture fix, column layout,
  before/after dividers, figure suppression rule
- `src/styles/components/Code.module.css` — texture fix only
- `src/styles/Post.module.css` — `figure::after` closing divider,
  `figcaption` margin retune

## Verification

Already spot-checked live via temporary `<style>` injection in the running
dev server (no files modified) on both existing posts:
- `/posts/2023-04-08-easter-show-value` — bare images and code blocks:
  confirmed seamless texture across the gap/body boundary at zoomed
  resolution, confirmed no regression to the homepage's existing texture
  with the explicit `background-size` on `body`.
- `/posts/2021-08-12-summarise-my-lecture` — the one real `<figure>` +
  `<figcaption>` case: confirmed ordering is top divider → image → caption
  pill → bottom divider (caption inside the bracket), no doubled divider.

After implementing for real, re-run the same checks by loading both posts
in the dev server and zooming into the gap regions, plus `npm run lint` (a
new declaration only, no new lint surface expected beyond what's already
clean).

## Update (2026-08-24): figcaption restyled, splash-header work split out

Implemented as planned, then the user asked for two follow-ups in a later
session:

- The figcaption's green pill (`background-color`/`color`/`padding` in
  `.postContent figcaption`, described above) didn't read well - replaced
  with plain italic dark-green text (`color: var(--color-primary);
  font-style: italic`, no background/padding). `margin-top` stayed negative
  (now `-0.5rem`, down from `-0.75rem` - less pull-up needed without the
  pill's own vertical padding) so it still sits snug under the image inside
  the divider bracket.
- Images also picked up `border-radius: 0.5rem` on
  `.imageWrapper img` (`Image.module.css`), matching the code block's
  corner radius.
- A separate, unrelated mobile-squashing complaint about the *post
  header's* splash image (`.postHeadingImageWrap` in `Post.module.css` -
  not touched by this plan, which only covers in-body images/code blocks)
  turned into its own redesign: `.postHeading` moved from CSS grid to
  `flex-wrap`, and the splash image now sizes from its own intrinsic aspect
  ratio instead of being force-cropped. That `flex-wrap`-based breakpoint
  was itself replaced later (2026-08-24) with an explicit, measured
  `@media` breakpoint - see `plans/POST_HEADER_BREAKPOINT_PLAN.md` for the
  full writeup; not documented further here since it's a different
  component.

## Update (2026-08-24): reverted customWidth mechanism, replaced with a
## per-post scoped variable

A prior session added a `customWidth` opt-in for the easter show post (a
few screenshots there need a shared width narrower than their natural
size, e.g. the `showbag-highlight-*.png` set): a `.imageWrapper
img:global(.customWidth)` rule in `Image.module.css` reading a
`--post-image-custom-width` variable meant to be declared once in `:root`
in `globals.css`.

The user reconsidered this before ever setting that `:root` value: a
site-wide global variable for one post's screenshot width is hardcoding at
the wrong altitude - `globals.css` shouldn't need to know about a single
post's content. Discussed alternatives (inline `style="width: ..."` per
image vs. a CSS variable scoped closer to the content); landed on a
middle ground:

- Removed the `customWidth` class/rule from `Image.module.css` entirely -
  no markdown-facing class needed.
- Declared `--easter-screenshot-width: 560px` directly on `.postContent`
  in `Post.module.css` instead of `globals.css` `:root`. Custom property
  names aren't hashed by CSS Modules, so it's still referenceable verbatim
  from raw HTML in the markdown body.
- The per-post prefix (`--easter-*`) is the scoping mechanism, not the
  selector - `.postContent` is shared layout for every post, so this is
  still technically global to all posts, just declared in a more relevant
  file than `globals.css`. The user explicitly accepted this trade-off
  rather than plumbing true per-post CSS scope (e.g. a slug-based
  selector or an inline variable on a markdown wrapper div) for what's a
  handful of screenshots in one post.
- Tagging is still outstanding: the `showbag-highlight-*` `<img>` tags in
  `_data/posts/2023-04-08-easter-show-value.md` need
  `style="width: var(--easter-screenshot-width)"` added by hand; not done
  yet as of this update.
