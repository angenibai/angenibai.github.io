# Future Work

Notes from a 2026-08-22 review of the site, covering everything short of the
build-breaking issues (those are already fixed). Not in priority order within
each section except where noted.

## Blog post list page

Done — see `plans/POSTS_LIST_RECEIPT_PLAN.md`, which supersedes the catalogue
design in `plans/POSTS_LIST_CATALOGUE_PLAN.md`. `src/pages/posts/index.tsx`
renders each post as a bare two-line row (`src/components/PostEntry.tsx`:
title, dotted leader, date, italic blurb) with the splash image moved into a
hover panel (`src/components/PostPreviewPanel.tsx`); `pin`/`listed`
are respected in `getStaticProps`.

The hover panel was **reimplemented in JS** — see
`plans/POSTS_LIST_HOVER_PANEL_JS_PLAN.md`. `src/hooks/usePostPreview.ts` now
places it cursor-anchored and viewport-aware: it flips above the cursor near
the bottom of the viewport and clamps horizontally so the offset shadow can't
be sliced by `body { overflow-x: hidden }`, with ~100ms/200ms dwell timers so
sweeping the list stays calm. Touch and <640px are gated off exactly as before.

Still open:

- **Tags are deliberately not rendered.** They stay in frontmatter and are
  read by nothing on the list page — this is a design decision, not an
  oversight, so re-adding them needs a reason beyond "the data exists".
- **Tag filtering** — still wanted, and this layout takes it better than the
  card list did. A filtered receipt is still a receipt.
- **Real image dimensions at build time** via `image-size`, replacing the
  `640x480` upper-bound hint passed to `next/image` in `PostPreviewPanel`.
- **Pagination** — still out of scope.

## Per-post layout polish

`src/pages/posts/[slug].tsx`:
- The splash `<img>` (line ~47) has no `width`/`height`, so it causes layout
  shift as it loads (directly observed 2026-08-24 while reworking the
  splash-image header layout - the box visibly grows once the lazy-loaded
  image resolves). Reserve space with explicit dimensions or `next/image`.
  Note the header now sizes this image from its own intrinsic aspect ratio
  (`Post.module.css` `.postHeadingImageWrap img`, `height: auto`), so
  whatever fix lands here needs to keep that ratio-driven sizing rather
  than reintroducing a fixed/cropped box.

## Animation polish

- Done — buttons rise on hover and only depress once pressed; the state model
  is documented at the top of `src/styles/components/Button.module.css`, and
  project tiles follow it in `ProjectGrid.module.css`.
- Nav between pages could be more smooth than the current immediate switch
- Custom pointer?

## Responsive header

- Would be nice for it to be sticky or show up on the side when scrolling
  down posts.
- Could also have more interesting styling aka border lines

## Loading profile image

- Current home page profile has a loading... placeholder. It should be
  clickable, and once clicked the tile flips over to reveal the profile
  image.

## Image optimization

`public/img` is ~52MB; several PNG screenshots run 2–2.6MB each (e.g.
`sml-21.png`, the `easter-show-value/showbag-highlight-*.png` set). None of
this is optimized:

- `BioPanel.tsx` and `ProjectTile.tsx` already use `next/image` — fine as-is.
- Post splash images and every image inside post Markdown bodies are plain
  `<img>` tags, so both bypass `next/image`'s optimization (Next's linter
  flags the splash image at `[slug].tsx:47`). Markdown body images now do
  route through a custom renderer (`src/components/markdown/Image.tsx`,
  wired up via `components={{ img: Image }}` in `[slug].tsx`) - that part of
  the fix below is done - but that component still renders a plain `<img>`,
  so the `next/image` swap itself is still outstanding.
- Two-part fix:
  1. Compress/resize the source screenshots before they're committed — most
     are full-resolution macOS screenshots that could shrink 70–90% with no
     visible quality loss at display size.
  2. Swap the plain `<img>` in `src/components/markdown/Image.tsx` (and the
     splash image in `[slug].tsx`) for `next/image`.

## SEO

- `src/pages/posts/[slug].tsx` has no `NextSeo` call. Every individual post
  currently inherits the generic site-wide title/description from
  `DefaultSeo` in `_app.tsx`, and there's no per-post OG image — sharing a
  post link anywhere shows no useful preview. This is the biggest concrete
  SEO gap since posts are the main content type on the site.
- No `robots.txt` or `sitemap.xml` in `public/`. Low priority at this scale,
  but cheap to add (`next-sitemap` or a static file).

## BioPanel doesn't read from `_data/bio.yaml`

`src/components/BioPanel.tsx` has a commented-out `getStaticProps` with the
note `// for some reason "fs" can't be imported`, so it renders a hardcoded
`defaultContent` object that duplicates `_data/bio.yaml` by hand instead of
reading the file. Editing `bio.yaml` currently has no effect on the site.

The `fs` import fails because `getStaticProps` only works in `src/pages/*`,
not in a regular component like `BioPanel`. Fix: call `getBio()` (already
exported from `src/lib/api.ts`) inside `index.tsx`'s `getStaticProps`, and
pass the result down as the `content` prop that `BioPanel` already accepts —
no changes needed to `BioPanel` itself beyond removing `defaultContent`.

## Smaller cleanup items

- `src/components/ProjectTile.tsx` has a `// TODO: tag section, ...` comment
  — the `tags` field is authored in `_data/projects.yaml` but never rendered
  anywhere in the component.
- Confirm the actual deploy target. The repo is named
  `angenibai.github.io` (GitHub Pages naming convention), but there's no
  `output: "export"` in `next.config.js` and no GitHub Actions workflow —
  this is a full Next.js app, which GitHub Pages can't serve as-is.
  Worth confirming there's a working deploy pipeline before treating the
  build passing as "the site is live."
