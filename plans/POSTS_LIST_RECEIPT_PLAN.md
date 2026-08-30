# Posts list page — "The Receipt"

## Context

`/posts` currently renders each post as a catalogue row (`src/components/PostEntry.tsx`):
title, blurb, a bordered metadata grid of tags and co-authors, and a duotoned
thumbnail. It works, but stacked up it reads as a generic news feed — not like
the rest of angeni.me, which is flat panels with hard 3px keylines and solid
offset drop shadows.

This redesign goes the opposite way from a feed: **the list collapses to bare
text, and the one thing text can't carry — the splash image — moves into a
hover panel.**

Decisions settled in conversation, carried in here:

- **No mono anywhere.** The catalogue's IBM Plex Mono metadata register is
  reverted; mono goes back to code-only. Dates are serif.
- **No `No.` column** — redundant against the date.
- **No row boxes.** No per-row rules, no padding, no background tint. Hover
  underlines the post's text.
- **Tags are not rendered at all** (data stays in frontmatter).
- **Blurb on the row** — italic, smaller. **Author in the panel.**
- **Pins sort to the top** with a marker.
- **Splash image keeps its native ratio.** The panel fixes height; width follows.
- **Panel anchored under the hovered post, pure CSS.**
- **No seeded fake posts.** Build and judge against the two real posts.

---

# Part 1 — The Vision

## The page

One column, full width, at every screen size. No rail, no sidebar, no grid, no
rules. Just text on cream.

```
   posts
   some thoughts were thought


     Easter Showbags for MAXIMUM VALUE  ·············   2023 · 04 · 08
     Number 9 will shock you!!

     Summarise My Hackathon  ······················    2021 · 08 · 12
     Uni assignments, YouTube detours, and vote-counting drama.
```

## The row

Two lines. **Every row is the same shape** — that regularity is what makes a
list this bare still read as a structure.

- **Title** — Work Sans bold, ~1.5rem, `--color-primary`.
- **Leader** — flex-grow spacer with a 2px *dotted* green bottom border, nudged
  down ~0.35em to sit on the baseline rather than under the descenders. The only
  non-text mark on the page, and the thing that makes it an index rather than a
  paragraph of titles.
- **Date** — Newsreader, ~0.9rem, `--color-black`, right-aligned.
- **Blurb** — line two, Newsreader **italic**, ~0.95rem, `--color-black`.
- **Pin marker** — small filled green square in the left gutter, pinned only.

Blurb rather than author on line two because every post has a blurb but most are
solo-authored — an author line would leave most rows with no second line, and
row height would flip up and down the list.

**Hover:** the title and blurb underline, and the panel fades in. That's all —
no tint, no rule change. The underline is also what `globals.css` already does
for every link on the site (`a:hover { text-decoration: underline }`), so this
is the site's own idiom rather than a new one.

## The panel

`BioPanel`'s grammar: 3px green border, `10px 10px` solid green shadow, 9px
padding, filled green header bar with cream text, 3px-bordered image frame.

```
┌────────────────────────────┐
│  SUMMARISE MY HACKATHON    │ ← filled green bar, cream text
│  ┌──────────────────────┐  │
│  │     splash image     │  │ ← native ratio, FULL COLOUR
│  └──────────────────────┘  │
│  In second year we had a   │ ← ~100-char excerpt of the post body
│  group assignment that…    │
│  with    Ada Luong         │ ← only when coauthors is non-empty
└────────────────────────────┘
   ▚▚ 10px 10px solid shadow
```

**Fixed height, variable width.** The image frame is a fixed height and the
image's own ratio sets its width, so nothing is ever cropped. A 16:9 splash
makes a wider panel than a 4:3 one. Panel width is clamped between ~240px and
~360px so a portrait image can't squeeze the excerpt into a column of single
words — inside those bounds the image sits centred on cream.

The excerpt is the post's **actual opening**, not the blurb — so the row and the
panel say different things rather than the panel echoing the line you're already
pointing at.

No duotone. The panel only exists during hover, so there's no "at rest" state
for a duotone to occupy. Full colour makes it the single moment of real colour on
an otherwise green-and-cream page.

## Where the panel lands

Anchored to the post you're pointing at: it drops **directly below that row,
aligned to its left edge**, overlapping whatever is beneath.

```
     Easter Showbags for MAXIMUM VALUE  ····  2023 · 04 · 08
     Number 9 will shock you!!

     Summarise My Hackathon  ·············    2021 · 08 · 12
     ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
     Uni assignments, YouTube detours, and vote-counting drama.
     ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
     ┌──────────────────────────┐
     │ SUMMARISE MY HACKATHON   │
     │ ┌──────────────────────┐ │
     │ │     splash image     │ │
     │ └──────────────────────┘ │
     │ In second year we had a  │
     │ with    Ada Luong        │
     └──────────────────────────┘▚▚
```

Left-aligned at ≤360px inside an 880px list, so it can never run off the right
edge — no horizontal edge logic needed at all.

## Responsiveness

| Width | Behaviour |
|---|---|
| ≥900px, hover-capable | Full layout, panel enabled |
| <900px **or** touch | Panel `display: none`; date wraps onto its own line |

Gated on `@media (hover: hover) and (min-width: 900px)` — keying off the actual
input capability, not guessing from viewport width. On touch the panel markup is
`display: none` so phones never download the splash images.

Nothing is lost without the panel: everything in it is one tap away on the post
itself. Inlining thumbnails on mobile would rebuild the card list this design is
getting rid of.

---

# Part 2 — Implementation

Ordered so each step is independently checkable.

## 1. `src/lib/api.ts` — derive the excerpt

Add a module-level `toExcerpt(markdown: string): string` and call it in
`getPostBySlug`, returning `excerpt` alongside `slug`/`source`/`metadata`.

Strip **before** truncating — post bodies don't start with clean prose, and
`rehype-raw` means raw HTML is legal anywhere in them:

1. fenced code blocks ```` ```…``` ````
2. images `![alt](src)` — must run *before* the link rule
3. links `[text](href)` → `text`
4. raw HTML tags `<[^>]+>`
5. leading heading markers `^#{1,6}\s+`
6. emphasis/quote marks `` *_`> ``
7. collapse whitespace, trim

Then slice to ~100 chars, cut back to the last space, append `…`.

> **Existing waste this fixes.** `getPostBySlug` returns the full body as
> `source`, `getAllPosts` returns all of them, and `posts/index.tsx` passes the
> whole array into props — so **every post's complete markdown currently ships
> to the browser inside `__NEXT_DATA__` on the list page.** Step 3 drops it.

## 2. `src/types/index.tsx` — types

- Add `excerpt?: string` to `PostData`.
- Add `export type PostListItem = Omit<PostData, "source">` for the list page's
  props, so the omission is enforced by the compiler rather than by discipline.

No frontmatter changes anywhere — the excerpt is derived from the body.

## 3. `src/pages/posts/index.tsx` — data and layout

Stays a **server component with no client state** — the panel is pure CSS.

In `getStaticProps`:
- **Delete** `IndexedPostData`, `byAscendingDate`, and the `listIndexBySlug` map.
- **Keep** the `listed !== false` filter and the pinned-first-then-descending-date
  sort exactly as they are — neither is part of the numbering machinery.
- **Add** `({ source, ...rest }) => rest`, typed as `PostListItem[]`.

Component keeps `PageLayout`, the `pageHeader`/`pageheading`/`subheading` markup
and `NextSeo` unchanged. Each item renders as:

```jsx
<div className={listStyles.row} key={post.slug}>
  <PostEntry post={post} />
  <PostPreviewPanel post={post} />
</div>
```

The panel is a **sibling of the link, not a child** — keeping it outside the
anchor keeps the link's accessible name to just the title.

Staying with `div`s rather than `ul`/`li`: `globals.css` styles `li` and `ul`
globally (`display: list-item`, `padding-inline-start: 40px`, `margin-bottom`),
and overriding all of it costs more than the semantics gain.

## 4. `src/components/PostEntry.tsx` — rewrite as the row

Props narrow to `{ post: PostListItem }` — the `index` prop goes.

Keep `formatDate` as-is (it already produces `2023 · 04 · 08`). Delete
`formatIndex`, the `next/image` import, the thumbnail block, and the metadata grid.

```jsx
<Link href={`/posts/${slug}`} className={styles.entry}>
  {metadata.pin && <span className={styles.pin} aria-hidden="true" />}
  <span className={styles.line}>
    <h2 className={styles.title}>{metadata.title}</h2>
    <span className={styles.leader} aria-hidden="true" />
    <span className={styles.date}>{formatDate(metadata.date)}</span>
  </span>
  {metadata.blurb && <p className={styles.blurb}>{metadata.blurb}</p>}
</Link>
```

## 5. `src/styles/PostList.module.css` — new page-level module

`posts/index.tsx` currently imports `@/styles/components/PostEntry.module.css`
purely to reach `.postList` — a page-level container style living inside a
component module. Split it out. A page-level module directly under `src/styles/`
also matches the convention CLAUDE.md documents (`Home.module.css`,
`Post.module.css`), and gives page-level styling somewhere to grow.

Owns:

- `.postList` — `width: 90%; max-width: 880px; display: flex;
  flex-direction: column; gap: 1.75rem;` **no borders.**
- `.row` — `position: relative` (the panel's containing block).
- the panel reveal rules (see below).

### The cross-module gotcha

`.row:hover .panel` **cannot** be written across two CSS Module files. CSS
Modules hashes class names per file, so a `.panel` written inside
`PostList.module.css` compiles to `PostList_panel__abc` — a different name from
the `PostPreviewPanel_panel__xyz` the panel component actually renders. The rule
silently matches nothing.

Use a plain `data-` attribute as the cross-module hook. Attribute selectors are
not hashed, so this works without `:global` or leaking unhashed class names:

```css
/* PostList.module.css */
.row { position: relative; }

@media (hover: hover) and (min-width: 900px) {
  .row:hover [data-post-panel],
  .row:focus-within [data-post-panel] {
    opacity: 1;
    visibility: visible;
    transform: none;
  }
}
```

The panel component renders `<div data-post-panel className={styles.panel}>`.
Each module then owns exactly one concern: `PostList` owns page layout *and the
interaction between* its two children, `PostEntry` owns the row's internals,
`PostPreviewPanel` owns the panel's own appearance and resting state.

## 6. `src/styles/components/PostEntry.module.css` — rewrite

**Delete:** `.mono`, `.eyebrow`, `.metaGrid`, `.metaCell`, `.metaValue`,
`.metaLine`, `.thumbWrap` and the whole duotone block, the full-green hover
inversion, and the 1040px stacking breakpoint.

**Keep:** only the `prefers-reduced-motion` guard. `.postList` moves to
`PostList.module.css` (step 5), and this module no longer exports anything the
page imports.

New rules:

- `.entry` — `display: block`, `text-decoration: none`, no padding, no border.
- `.line` — `display: flex; align-items: baseline; flex-wrap: wrap; gap: 0.75rem`.
- `.title` — `flex: 0 1 auto`, Work Sans bold, 1.5rem, `--color-primary`.
- `.leader` — `flex: 1 1 2rem; min-width: 2rem;
  border-bottom: var(--divider-width) dotted var(--color-primary);
  margin-bottom: 0.35em;`
- `.date` — `flex: 0 0 auto`, Newsreader, 0.9rem, `--color-black`.
- `.blurb` — Newsreader **italic**, 0.95rem, `--color-black`, `margin-top: 0.35rem`.
- `.pin` — `position: absolute; left: -1.25rem;` 0.5rem filled
  `--color-primary` square.
- `.entry:hover .title, .entry:hover .blurb` — `text-decoration: underline`.
  Applied to the two prose elements specifically, not the whole row, so the date
  and the dotted leader stay clean. The leader deliberately does **not** change
  on hover — the underline is the cue, and two simultaneous gestures compete.

**Click target.** With the padding gone the target is the text block itself
(~two lines). `.entry` stays `display: block` so the full width of both lines is
clickable, including the leader gap.

**Wrapping caveat:** when a title wraps to two lines, CSS cannot hang the leader
off the title's *last* line box, so the spacer sits vertically centred beside the
block. Accept it — truncating a title on an index page is worse than a slightly
imperfect rule, and both real titles are short.

**Figures:** Newsreader's numerals are proportional, so `2021` and `2023` may
differ in width. It doesn't matter because the date is **right-aligned** and the
leader absorbs the slack — only the right edge must line up, which
right-alignment guarantees.

## 7. `src/components/PostPreviewPanel.tsx` — new

Forked from `BioPanel`, not parameterised from it — same look, different data
shape, and generalising one small panel into a config-driven component costs
more than ~40 duplicated lines.

```jsx
<div className={styles.panel} aria-hidden="true">
  <div className={styles.header}><h3>{metadata.title}</h3></div>
  {metadata.splashImageSource && (
    <div className={styles.imageFrame}>
      <Image src={metadata.splashImageSource} alt="" width={640} height={480} />
    </div>
  )}
  {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
  {!!metadata.coauthors?.length && (
    <p className={styles.with}>
      <span className={styles.withLabel}>with</span>
      {metadata.coauthors.join(", ")}
    </p>
  )}
</div>
```

**On the `width`/`height` props and native ratio.** `next/image` requires both,
but the real intrinsic dimensions aren't known without reading the files. Pass
`640×480` as an upper-bound hint — it only drives srcset candidate selection and
the pre-load aspect-ratio reservation. The **rendered** ratio comes from CSS
(`height: <fixed>; width: auto`), which resolves against the *actual loaded
image's* intrinsic ratio, so nothing is cropped or distorted. The brief pre-load
mis-ratio is invisible because the panel is hidden and absolutely positioned.

This keeps optimisation (the 1.4MB `easter-show-value-banner.png` is served at
~640px instead of full size) with no new dependency. The clean upgrade, if the
approximation ever bites, is reading real dimensions at build time with
`image-size` — noted in Part 3, not done here.

`aria-hidden` and `alt=""` because the panel duplicates the destination page.

## 8. `src/styles/components/PostPreviewPanel.module.css` — new

```
.panel {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  width: max-content;
  min-width: 240px;
  max-width: 360px;
  border: var(--border-width) solid var(--color-primary);
  box-shadow: 10px 10px var(--color-primary);
  background-color: var(--color-bg-white);
  padding: 9px;
  opacity: 0;  visibility: hidden;  pointer-events: none;
  transform: translateY(4px);
  transition: opacity .12s ease, transform .12s ease;
  z-index: 2;
}
/* The reveal (:hover / :focus-within) lives in PostList.module.css, which owns
   the .row wrapper - see step 5 on why it can't be written here. */
.imageFrame {
  height: 180px;
  border: var(--border-width) solid var(--color-primary);
  display: flex;  justify-content: center;
  background-color: var(--color-bg-white);
}
.imageFrame img { height: 100%; width: auto; max-width: 100%; }
```

Five things that are load-bearing and easy to get wrong:

- **`pointer-events: none` is mandatory.** The panel overlaps rows. Without it,
  it steals hover from the row beneath → the row loses `:hover` → the panel
  hides → the row regains hover → **flicker loop**. Most likely bug in the
  feature. It also makes "cursor moves onto the panel" behave correctly: the
  cursor falls through to whichever row is underneath, that row's panel takes
  over, the old one hides — so only one panel is ever visible.
- **`visibility: hidden` + `opacity: 0`, never `display: none`.** A
  `display: none` panel never fetches its lazy image, so the *first* hover on
  each row shows an empty frame while it downloads. Keeping it in the layout tree
  loads images up front, which at two posts and ~640px renditions is nothing.
- **`:focus-within`** (in the `PostList` reveal rule) gives keyboard users the
  panel with no extra markup.
- **`height` on the frame, `width: auto` on the image** is what preserves the
  native ratio. Don't add `object-fit: cover` — that's the cropping this is
  avoiding.
- **`width: max-content` + min/max clamp** is what makes panel width follow the
  image while keeping the excerpt readable.

Header bar, border and label styling copy `BioPanel.module.css` directly.

Responsive gate: the reveal rules are already inside
`@media (hover: hover) and (min-width: 900px)` in `PostList.module.css`, so the
panel simply never shows below that. Add here:

```
@media (hover: none) { .panel { display: none } }
```

so touch devices don't download the splash images at all. Plus
`prefers-reduced-motion` to drop the transform and cut straight in.

## 9. `docs/` and `plans/`

- **`docs/DESIGN_LANGUAGE.md`** — three edits: (a) correct "borders and
  keylines, not shadows" to say what the code actually does, since solid
  zero-blur offset shadows are used at a deliberate scale (`2px` Button, `3px`
  ProjectGrid inner, `5px` Footer/tile, `10px` BioPanel) and the real rule is *no
  blurred* shadows; (b) narrow the mono role back to code-only, since the
  "metadata labels and figures" paragraph describes the `PostEntry.tsx` this
  rewrites and will have no callers; (c) add the dot leader as a keyline form.
- **This file** — update in place if the build departs from it, so the record
  matches what was actually shipped. `plans/POSTS_LIST_CATALOGUE_PLAN.md` stays
  as-is: it documents the design this one supersedes, and its duotone recipe and
  numbering rationale are still worth keeping.
- **`docs/FUTURE_WORK.md`** — update the "Blog post list page" section; record
  tags/filtering as deliberately unrendered rather than merely out of scope, and
  add the JS panel item below.

---

# Part 3 — Deferred

Recorded so none of it gets lost:

- **Reimplement the panel in JS, matching Wikipedia's behaviour.** *(the notable
  one)* Verified from the live page: Wikipedia's previews are the `ext.popups`
  ResourceLoader module — entirely JavaScript, with the preview content fetched
  per-hover from the REST summary API rather than living in the HTML (article
  links carry only a plain `title=` attribute). A version here would keep the
  content pre-rendered (no fetch needed) but add what CSS structurally cannot do:
  **measuring available space and repositioning** — flipping the panel above the
  row near the bottom of the viewport, and nudging it horizontally to stay in
  view. Also worth borrowing are its dwell timers (a short delay before showing,
  a grace period before hiding) which make rapid cursor movement across a list
  feel much calmer than a pure `:hover` reveal.
- **Bottom-of-viewport flipping** — subsumed by the above. With two posts near
  the top of a tall page the panel cannot overflow the bottom, so nothing is
  written now. A pure-CSS stopgap if the list grows before the JS work happens:
  `:nth-last-child(-n+2) .panel { top: auto; bottom: 100% }`.
- **Real image dimensions at build time** via `image-size`, replacing the
  `640×480` hint in step 6.
- **Tag filtering.** This layout takes it better than the card list did — a
  filtered receipt is still a receipt.
- **A longer excerpt** if ~100 chars reads as too thin once it's real.
- **Splash image dimensions on the post page** (`docs/FUTURE_WORK.md` layout
  shift item) — untouched here.

---

# Verification

Against the two real posts. `npm run build` first — it type-checks, and the
`PostListItem` change will catch a stray `source`.

1. **Row layout** — `/posts` at 1440px: two rows of bare text, no rules or boxes
   anywhere, dotted leader between title and right-aligned date, italic blurb
   underneath.
2. **Hover** — title and blurb underline; date and leader unchanged; panel fades
   in below the row, left-aligned to it.
3. **Panel content** — full-colour image at its **native ratio** (compare against
   the source file; the 16:9 and 4:3 splashes should produce visibly different
   panel widths), excerpt reads as *prose* with no stray markdown/HTML/heading
   marks, `Summarise My Hackathon` shows `with Ada Luong` and `Easter Showbags`
   does not.
4. **No flicker** — sweep the cursor slowly then quickly down the list. Never
   strobes, never more than one panel visible.
5. **First hover** — hard-reload, hover immediately. The image must already be
   there, not fetch on first hover.
6. **Payload** — view source on `/posts`: `__NEXT_DATA__` contains excerpts but
   **not** full post bodies.
7. **Keyboard** — tab through the list; the panel follows focus via
   `:focus-within`.
8. **Responsive** — 1440 / 1000 / 900 / 899 / 700px. Panel disappears at 899px;
   below that the date wraps cleanly onto its own line. No horizontal page scroll
   at any width (`body { overflow-x: hidden }` in `globals.css` could otherwise
   clip the panel's offset shadow — confirm it doesn't).
9. **Touch** — device emulation: no panel, and no splash image requests in the
   network tab.
10. **Pin** — temporarily set `pin: true` on
    `2021-08-12-summarise-my-lecture.md`, confirm it sorts above the 2023 post
    with a legible marker, then revert.
11. **Reduced motion** — with the OS setting on, the panel cuts in without
    transform or fade.

---

# As built — departures from this plan

Recorded per step 9. Everything not listed here shipped as written above.

## 1. `width: max-content` alone did not make the image drive panel width

Step 8's premise was that `width: max-content` + the 240–360px clamp would let
the image set the panel's width. Measured, it didn't: **both panels came out at
exactly 360px.** The excerpt paragraph's max-content width is its *unwrapped*
length (~600px at 100 characters), so the excerpt always won the measurement and
every panel clamped to `max-width`. Verification step 3's "visibly different
panel widths" failed.

The fix keeps the intent and needs no JS. `.panel` becomes a grid with
`grid-template-columns: max-content`, and the three text children opt out of the
intrinsic measurement:

```css
.header, .excerpt, .with { width: 0; min-width: 100%; }
```

`width: 0` is what the column measures; `min-width: 100%` is what actually gets
painted. Only `.imageFrame` is left contributing, so the column resolves to the
image's width at a 180px height. Measured after the change:

| Post | Splash ratio | Image rendered | Panel width |
|---|---|---|---|
| Easter Showbags | 1.333 (4:3) | 232×174 | **262px** |
| Summarise My Hackathon | 1.778 (16:9) | 309×174 | **339px** |

Rendered ratios match native to three decimals, so the `640×480` hint and
`height`/`width: auto` do preserve the native ratio as described.

## 2. The panel already overflows the bottom of the page — at two posts

Part 3 assumed this could not happen yet: *"With two posts near the top of a
tall page the panel cannot overflow the bottom."* The page isn't tall. At a
1440×900 window `/posts` is **757px** of document with `scrollHeight ===
clientHeight`, and the last row's panel runs to **787px** — so the bottom of it,
including the `with Ada Luong` line and the offset shadow, is off the page and
**cannot be scrolled to.** Widening the panel per departure 1 makes it taller,
which makes this slightly worse.

Left unfixed deliberately, because every available fix is a visible design
tradeoff the plan didn't authorise: the `:nth-last-child(-n+2)` stopgap flips
*both* rows when there are only two, sending the first row's panel up into the
page header; and bottom-padding the list to lengthen the document opens a large
gap above the footer for a hover-only benefit. This is the strongest argument
for the deferred JS reimplementation — it is a live problem now, not a
someday-when-the-list-grows one.

## 3. Minor

- **Pin marker at very narrow widths.** `.pin` at `left: -1.25rem` (20px) sits
  in a gutter that is 5% of the viewport (the list is `width: 90%`). Below about
  400px the gutter is under 20px and `body { overflow-x: hidden }` clips the
  marker. Not reachable in a desktop browser (Chrome won't size a window below
  ~500px) but real on a phone.
- **Font variable.** Step 6 calls for Newsreader on `.date`/`.blurb`; the
  variable is `--font-newsreader`. There is no `--font-serif`.
- **Link accessible name.** Step 3 says keeping the panel outside the anchor
  keeps the link's accessible name "to just the title". The panel is excluded as
  intended, but the name is still title + date + blurb, since those are inside
  the anchor. Unchanged from the previous design.
- **The Summarise excerpt does echo its blurb**, since that post opens with a
  `_..._` dek repeating it. Accepted deliberately rather than special-cased.
  Whitespace collapsing joins it to the next paragraph, so the 100-char slice
  runs past the echo into new prose.
- Step 8's cross-reference to "the `640×480` hint in step 6" means step 7.

## Verification results

Passed: 1 (row layout), 2 (hover), 3 (panel content — after departure 1),
4 (no flicker: the panel is never the hit-target at any point across its area,
`pointer-events: none` confirmed computed), 5 (images `complete` before any
hover), 6 (`__NEXT_DATA__` carries excerpts, no `source`; the page HTML dropped
to ~9.9KB), 7 (`:focus-within` reveals on keyboard focus), 10 (pin sorts first,
8×8 marker in the gutter), 11 (rule emitted).

Partly verified: 8 — 1440/1000/900/899 checked directly (gate flips off at
899px, no horizontal overflow at any width). Chrome will not size a window below
~500px, so phone widths were exercised by narrowing the list container instead:
at 420/340/280px the date drops to its own line and stays flush right. 9 (touch)
was verified as the emitted `@media (hover: none) { display: none }` rule rather
than by real device emulation.
