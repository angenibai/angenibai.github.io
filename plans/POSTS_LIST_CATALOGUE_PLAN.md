# Posts list page — "The Catalogue"

## Context

`src/pages/posts/index.tsx` currently renders each post as an empty 200px
bordered box containing only a linked title. Post frontmatter already carries
`date`, `tags`, `splashImageSource`, `author`, `pin` and `listed` — none of
which reach the page. `docs/FUTURE_WORK.md` flags all of this.

The goal is a posts index in the spirit of the reference material (Olive
Ateliers' hairline metadata grid, the Redheads matchbox's ruled label rows):
a **printed catalogue of entries** rather than a grid of cards. Structure comes
from rules and keylines; metadata is part of the composition, not a subtitle.

The key tie-in: `.postHeading` in `src/styles/Post.module.css` — the existing
individual post header — is _already_ this layout. Top and bottom `2px` green
dividers, text column on the left, image column on the right behind a left
divider, a hairline `.postSubtitle` rule inside the text column, stacking to a
single column below 1040px. **Each catalogue row is that header, shrunk.**
Clicking a row opens it into its own full-size version. No new visual system.

Decisions already made: catalogue rows (not cards), **no read time**, blurb
comes from a new `blurb` frontmatter field, splash thumbnails are duotoned
green-on-cream and reveal full colour on hover.

## Row anatomy

```
═══════════════════════════════════════════════════════════════════  2px divider

  No. 02                              2023 · 04 · 08    ┌──────────────┐
                                                        │              │
  Easter Showbags for                                   │   duotone    │
  MAXIMUM VALUE                                         │   thumbnail  │
  ───────────────────────────────────────────────       │              │
  I bought every showbag price list and did maths       │              │
  at them until a winner fell out.                      └──────────────┘

  ┌────────────────────┬────────────────────┐
  │ FILED UNDER        │ WITH               │      ← hairline metadata grid
  │ data               │ Ada Luong          │        1px #0d4b378d cells
  └────────────────────┴────────────────────┘        mono caps labels

═══════════════════════════════════════════════════════════════════
```

- `No. NN` — build-time index, ascending by date (oldest = `No. 01`), so
  numbers are stable as new posts are added on top.
- Date rendered as `2023 · 04 · 08` in mono, right-aligned — echoes the
  poster references' date columns and reads as catalogue data, not prose.
- The rule under the title mirrors `.postSubtitle`'s existing hairline.
- `WITH` cell only renders when a new `coauthors` frontmatter field is
  non-empty; `FILED UNDER` only when `tags` is non-empty. Empty cells are
  omitted, not left blank.

`author.name` is free-text prose (e.g. `"Angeni Bai and Ada Luong (ft.
Edwina Adisusila)"` on the hackathon post) and isn't rendered anywhere
today — there's no existing parsing to lean on, and printing it verbatim in
a metadata cell would run long and not match the catalogue's terse register.
`coauthors` is a separate, catalogue-only field: a **list** of short-form
names, authored per post independent of `author.name` (which keeps its full
prose form for whatever eventually renders post-page attribution). The
`WITH` cell renders one name per line (e.g. `Ada Luong` on its own line,
a second co-author below it), rather than joining them into a sentence —
consistent with the cell reading as catalogue data, not prose.

## Typography decision to record

`docs/DESIGN_LANGUAGE.md` currently assigns IBM Plex Mono exactly one job:
code. This design gives it a second — **small letterspaced caps for metadata
labels and figures** (`No. 02`, `FILED UNDER`, the date). That is the single
most load-bearing borrowing from the Olive Ateliers reference, and it is a
deliberate extension of the system rather than a fourth family. Update the
"Typography pairing" section of `DESIGN_LANGUAGE.md` to say so, at
~`0.75rem`, `letter-spacing: 0.08em`, `text-transform: uppercase`.

The row hover tint finally uses `--color-bg-yellow` (`#FFF4D7`), documented
in the palette table as "currently unused".

## Files

**New — `src/components/PostEntry.tsx`**
One catalogue row. Props: `post: PostData`, `index: number`. Renders a single
`<Link>` wrapping the whole row (one large click target) containing the text
column and, when `splashImageSource` is set, the thumbnail column.

**New — `src/styles/components/PostEntry.module.css`**
Row + container styles. Mirrors `.postHeading`'s divider register
(`var(--divider-width)` green top/bottom, `border-left` on the image column)
and its 1040px stacking breakpoint so list and post page agree.

Duotone (classic two-layer recipe, no image reprocessing, fully reversible):

```css
.thumbWrap {
  position: relative;
  isolation: isolate; /* blends stay inside the wrap */
  background-color: var(--color-bg-white);
}
.thumbWrap img {
  filter: grayscale(1) contrast(1.08);
  mix-blend-mode: multiply;
}
.thumbWrap::after {
  /* lifts shadows to green */
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--color-primary);
  mix-blend-mode: lighten;
  pointer-events: none;
}
.entry:hover .thumbWrap img {
  filter: none;
  mix-blend-mode: normal;
}
.entry:hover .thumbWrap::after {
  opacity: 0;
}
```

Guard both: `@media (hover: none)` shows full colour at rest (touch devices
never fire hover), `@media (prefers-reduced-motion: reduce)` drops the
transitions.

Thumbnails are `aspect-ratio: 4 / 3; object-fit: cover` in a fixed ~260px
column. Cropping is correct _here_ even though the post hero deliberately
avoids it (`Post.module.css` comments) — uniform rows are the point of a
catalogue, and the two splash images are 16:9 and 4:3 respectively.

**Modified — `src/pages/posts/index.tsx`**
Swap the inline tile for `<PostEntry>`. In `getStaticProps`, extend the
existing sort to also:

- filter out `metadata.listed === false`
- assign `No.` indices by ascending date
- sort `pin: true` first, then descending date

All three fields are authored today and ignored everywhere
(`docs/FUTURE_WORK.md`).

**Modified — `src/styles/Post.module.css`**
Delete `.postsContainer` and `.postTile` — the list page will no longer share
the post page's module. Everything else in the file is used by `[slug].tsx`
and stays untouched.

**Modified — `src/types/index.tsx`**
Add `blurb?: string` and `coauthors?: string[]` to `PostMetadata`. While
here, fix the existing mismatch flagged in exploration: the type declares
`author?: { name: string; email: string }` but the YAML authors `homepage`,
not `email`.

**Modified — both `_data/posts/*.md`**
Add `blurb:` and `coauthors:` lines under "Recommended front matter",
following the inline-comment documentation style already used in
`2023-04-08-easter-show-value.md`. `blurb`: one sentence each, written to
work as the catalogue blurb. `coauthors`: a YAML list of short-form names
for the `WITH` cell (one per line in the rendered cell), independent of
`author.name` — omit/leave empty on the Easter Show post (solo, so no
`WITH` cell), set to `[Ada Luong]` on the hackathon post. If either field
is absent/empty the corresponding line/cell is simply omitted — no
auto-derived excerpt or name-parsing.

**Modified — `docs/DESIGN_LANGUAGE.md`**
Record the mono-as-metadata-label role and the `--color-bg-yellow` hover tint.

**Modified — `docs/FUTURE_WORK.md`**
Strike the "Blog post list page" items this closes.

## Thumbnail loading

`next.config.js` sets no `output: "export"`, so `next/image` optimisation is
available; the site does not currently use it anywhere. Use `next/image` for
these thumbnails specifically — `easter-show-value-banner.png` is 1.4 MB and
would otherwise be downloaded in full to fill a 260px box. Explicit
`width`/`height` are required. If this turns out to conflict with how the site
is deployed, the fallback is a plain `<img loading="lazy">` and a resized
asset committed alongside the original.

## Out of scope

The individual post page's own header is left as-is — it is the reference the
list is matching, not a target for change. Tag _filtering_, pagination, and a
tag-pill component are not part of this; tags render as plain text in the
`FILED UNDER` cell.

## Verification

1. `npm run build` — type-checks and catches the `PostMetadata` change.
2. `npm run dev`, open `/posts`, and confirm against the two real posts:
   - both rows render with number, date, title, blurb, metadata grid
   - `Summarise My Hackathon` shows a `WITH` cell; `Easter Showbags` does not
   - thumbnails read green-on-cream at rest and go full colour on hover
   - row tints pale yellow on hover; whole row is clickable
3. Resize across the 1040px breakpoint — rows stack image-under-text, and the
   image column's divider rotates from left rule to top rule, matching what
   `.postHeading` already does on the post page.
4. Open a post from the list and confirm the row reads as a miniature of the
   header it opens into — same divider weights, same column split.
5. Screenshot `/posts` at ~1440px and ~700px via the Chrome MCP tools for a
   side-by-side against the current page.
6. Temporarily set `listed: false` on one post, confirm it disappears from the
   list, then set `pin: true` on the older post and confirm it sorts first.
   Revert both.
