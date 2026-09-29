# Future Work

Notes from a 2026-08-22 review of the site, covering everything short of the
build-breaking issues (those are already fixed). Not in priority order within
each section except where noted.

## Blog post list page

Done — see `docs/design/posts-list-evolution.md` for why the bare-text
"Receipt" design replaced the earlier metadata-grid "Catalogue".
`src/pages/posts/index.tsx` renders each post as a bare two-line row
(`src/components/PostEntry.tsx`: title, dotted leader, date, italic blurb)
with the splash image moved into a hover panel
(`src/components/PostPreviewPanel.tsx`); `pin`/`listed` are respected in
`getStaticProps`.

The hover panel was **reimplemented in JS** — see
`docs/design/posts-list-evolution.md` for why. `src/hooks/usePostPreview.ts`
now places it cursor-anchored and viewport-aware: it flips above the cursor
near the bottom of the viewport and clamps horizontally so the offset shadow can't
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

- **Code block styling — revisit.** Deliberately left out of the post body
  lane redesign (`docs/design/2026-09-29-post-body-lane.md`), which made
  body images square-cornered with a 3px border and 5px offset shadow. Code
  blocks are still rounded dark panels with no border or shadow, so the two
  kinds of media now differ. A green shadow barely shows against the dark
  green panel, so the fix probably isn't just copying the image frame.

## Animation polish

- Done — buttons rise on hover and only depress once pressed; the state model
  is documented at the top of `src/styles/components/Button.module.css`, and
  project tiles follow it in `ProjectGrid.module.css`.
- Nav between pages could be more smooth than the current immediate switch
- **Custom cursor set**: arrow, pointer and I-beam, all custom. Only the arrow
  exists today (`--cursor-default` on `:root` in `globals.css`); links, buttons
  and tiles show the system hand, and text shows no I-beam because the
  `:root` cursor inherits over it. `public/pointer.svg` exists but is unused;
  an I-beam SVG still needs drawing. `cursor: auto` can't be given custom
  images, so the I-beam has to be set explicitly on text elements
  (`url(...) x y, text`), covering whole blocks including padding. Also fix
  the arrow's hotspot at the same time: `8 8` → `6 3`, matching the tip of
  `arrowhead.svg`. Deferred from
  [accessibility P1](design/2026-09-27-accessibility-p1.md) #10.
- **Regression from the native-`<dialog>` project modal rebuild**: the
  scale-out close animation only plays in Chromium
  (`ProjectModal.module.css`, `.modalOverlay`'s `transition`). It needs the
  `overlay` CSS property to animate a `<dialog>` out of the top layer, and
  `overlay` has no Safari/Firefox support as of writing, so those browsers
  snap the modal shut instead. Full writeup in
  [ACCESSIBILITY.md](ACCESSIBILITY.md#1-blocking--projects-is-unusable-by-keyboard).
  Revisit once `overlay` ships elsewhere, or by delaying `close()` behind a
  `transitionend`/timeout.

## Responsive header

- Would be nice for it to be sticky or show up on the side when scrolling
  down posts.
- Could also have more interesting styling aka border lines

## Loading profile image

- Current home page profile has a loading... placeholder. It should be
  clickable, and once clicked the tile flips over to reveal the profile
  image.

## Image optimization

Done for the two cheap wins — see `docs/design/image-optimization.md` for
the deploy-target constraint that shaped the approach.

- `scripts/optimize-images.sh` (`npm run optimize-images`) resizes/recompresses
  any image over 1600px wide in place via ImageMagick, keeping filenames
  unchanged so no `_data/` reference needs updating. It's a maintenance
  script, not a one-off — run it before committing new screenshots.
- The post splash image (`src/pages/posts/[slug].tsx`) now uses `next/image`
  with real dimensions read at build time via `getImageDimensions()` in
  `src/lib/api.ts` (falls back to a plain `<img>` if the file can't be read).
- `next.config.js` sets `images.unoptimized: true`, anticipating a likely
  GitHub Pages static-export deploy (which requires this or a custom loader)
  — harmless under a Node host too, just skips the on-the-fly optimizer.

**Deliberately not done:** swapping the ~70 inline markdown-body screenshots
(`src/components/markdown/Image.tsx`) to `next/image`. Doing that correctly
needs real per-image dimensions, which for arbitrary markdown content means
regex-scanning raw markdown for image sources (a second, best-effort parser
alongside `react-markdown`'s own) and threading a src→dimensions map through
the `ReactMarkdown` `img` override — real complexity for a benefit
(layout-shift prevention) that's separate from the actual problem (load
lag), which the compression script already fixes regardless of which tag
renders the image. Markdown body images stay as plain `<img loading="lazy">`.
Revisit only if layout shift on those images becomes an actual complaint,
not by default.

## SEO

- `src/pages/posts/[slug].tsx` now sets a unique per-post `<NextSeo title>`
  (see [ACCESSIBILITY.md](ACCESSIBILITY.md#2-missing-names-states-and-page-titles)),
  but still has no per-post `description` or OG image — every post shares the
  generic site-wide description from `DefaultSeo` in `_app.tsx`, and there's
  no per-post OG image, so sharing a post link anywhere shows no useful
  preview. `PostMetadata.blurb` already exists and is unused; it's the
  obvious source for the description.
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
