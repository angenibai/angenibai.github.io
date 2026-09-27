---
status: done
---

# Post frame texture & header breakpoint

Two related pieces of the post page (`src/pages/posts/[slug].tsx`,
`src/styles/Post.module.css`) evolved together: the gap where code blocks and
images bleed past the post's vertical frame border, and the header's
row→column breakpoint.

## Design decisions during implementation

### The texture mismatch was a scale problem, not a color problem

Code blocks and images are wrapped in a component whose own padding masks the
post frame's border for a bit before/after the content, painting over it with
`background-color: var(--color-bg-white)`. That flat patch didn't match the
page's actual grainy background (`noise-2.svg`, a seamless `feTurbulence`
pattern layered on `body`).

The mismatch wasn't phase or position — it was that `noise-2.svg` has no
intrinsic width/height, only a `viewBox`. With `background-size` left at its
default `auto`, every element sizes the image independently, so `body` (a
large box) stretches the same SVG very differently than a short wrapper
strip. A first attempt that just added the same `background-image` to the
wrappers with no explicit size still had this flaw. The actual fix: give
`body` and the wrapper elements the same explicit `background-size` (e.g.
`400px 400px`) so everything tiles the identical fixed-scale pattern —
confirmed live as pixel-continuous across the wrapper/body boundary at zoomed
resolution, with no perceptible change to the homepage's existing look.

`background-attachment: fixed` was considered and rejected for the wrappers:
`body` uses the default `scroll` attachment, so if only the wrapper used
`fixed`, its texture would stay pinned to the viewport while `body`'s texture
scrolled away underneath — visibly drifting apart during scroll.

### Code blocks deliberately don't get the image divider ornament

Images got a short top/bottom divider ornament inside the texture gap; code
blocks got the texture fix only, with no ornament. The dark, rounded,
syntax-colored code panel already reads as a strong, self-contained visual
block against the cream page. Stacking the same rule-ornament next to it
would put two competing "framing" devices back-to-back in a small area,
cutting against `docs/DESIGN_LANGUAGE.md`'s principle that boldness belongs
in small, isolated spots — never smeared. If code blocks need the ornament
too after living with the images for a while, it's a small, symmetric
follow-up, not a default.

### Figcaption: pill reverted to plain italic text

`<figcaption>` is plain italic dark-green text, no background or padding —
reverted from a green pill overlapping the image, which shipped with the
divider ornament but didn't read well in practice. A smaller, later
correction than the original design, made after seeing it live rather than
predicted upfront.

### `customWidth`: reverted for being scoped at the wrong altitude

An early pass added a `customWidth` opt-in class (`Image.module.css`) reading
a `--post-image-custom-width` CSS variable meant to be declared once in
`globals.css`'s `:root`, for a handful of Easter-show-post screenshots that
needed a shared narrower width. This was reverted _before_ that `:root` value
was ever set: a site-wide global variable for one post's screenshot width is
hardcoding at the wrong altitude — `globals.css` shouldn't need to know about
a single post's content.

The landed middle ground: `--easter-screenshot-width: 560px` is declared
directly on `.postContent` in `Post.module.css` instead of `globals.css`'s
`:root`. CSS custom property names aren't hashed by CSS Modules, so it's still
referenceable verbatim from raw HTML in the markdown body. The `--easter-*`
name prefix is the actual scoping mechanism, not the selector — `.postContent`
is shared layout for every post, so this is still technically global, just
declared in a more locally-relevant file. This was an explicit trade-off,
accepted rather than plumbing true per-post CSS scope (a slug-based selector
or an inline variable on a markdown wrapper div) for what's a handful of
screenshots in one post.

### Header breakpoint: measured, not guessed

The post header's title/date column and splash image switched from row to
column layout implicitly, via `flex-wrap` triggered only once both columns
hit a hard `min-width: 320px` floor — which squeezed the image into an
uncomfortably short band for a range of widths just above the wrap point, and
left a divider (`border-left`, meant for side-by-side layout) still vertical
after wrapping instead of rotating to a top divider.

The fix is a single static `@media (max-width: 1040px)` breakpoint (matching
the site's existing convention of simple `max-width` breakpoints, no
container queries or JS-driven layout), chosen by measuring the two real
posts' splash image ratios and title heights, then computing the container
width at which the image column's height would equal the text column's
natural height. The binding case (the post with the more square image and
longer title) crossed over at ~989px viewport width; 1040px was chosen as a
~50px buffer so the switch happens visibly before the squeeze rather than
right at the edge. This flex-wrap-based header layout itself replaced an
earlier CSS-grid version from a separate mobile-squashing fix, and was later
folded back into the same header component rather than kept as a separate
concern.
