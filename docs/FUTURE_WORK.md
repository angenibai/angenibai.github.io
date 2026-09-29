# Future Work

Notes from a 2026-09-30 review of the site, covering everything short of the  
build-breaking issues (those are already fixed). Not in priority order within  
each section except where noted.

## Blog post list page

See `docs/design/posts-list-evolution.md` for the current design.

- **Tags are deliberately not rendered.** They stay in frontmatter and are
  read by nothing on the list page — this is a design decision, not an
  oversight, so re-adding them needs a reason beyond "the data exists".
- **Tag filtering** — still wanted, and this layout takes it better than the
  card list did. A filtered receipt is still a receipt.
- **Real image dimensions at build time** via `image-size`, replacing the
  `640x480` upper-bound hint passed to `next/image` in `PostPreviewPanel`.
- **Pagination** — still out of scope.

## Per-post layout polish

- **Code block styling — revisit.** Deliberately left out of the post body
  lane redesign (`docs/design/2026-09-29-post-body-lane.md`), which made
  body images square-cornered with a 3px border and 5px offset shadow. Code
  blocks are still rounded dark panels with no border or shadow, so the two
  kinds of media now differ. A green shadow barely shows against the dark
  green panel, so the fix probably isn't just copying the image frame.

## Animation polish

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

- Could also have more interesting styling aka border lines

## Loading profile image

- Current home page profile has a loading... placeholder. It should be
  clickable, and once clicked the tile flips over to reveal the profile
  image.

## SEO

- **Redirect old Jekyll post URLs before the redesign goes live.** The live
  Jekyll site's sitemap indexes posts at `/YYYY/MM/DD/<slug>.html`
  (`/2023/04/08/easter-show-value.html`,
  `/2021/08/12/summarise-my-hackathon.html` — now slug
  `2021-08-12-summarise-my-lecture`), plus `/tags/*` and `/feed.xml`. The new
  routes are `/posts/<date>-<slug>`, so every indexed URL 404s on cutover.
  Needs 301s via `redirects()` in `next.config.js` on a Node host, or
  meta-refresh + canonical stub pages under static export — depends on the
  unconfirmed deploy target (see "Confirm the actual deploy target" below).
  `/2021/09/06/hsc-physics.html` is deliberately deprecated (post stays in
  git history only); let it 404.
- **RSS feed.** The Jekyll site serves `/feed.xml`; the new site has none,
  so existing feed subscribers stop getting posts on cutover. Generate it at
  build time from `getListedPosts()` and serve it at the same `/feed.xml`
  path so subscribers carry over without a redirect.
  `scripts/generate-sitemap.ts` already runs as `prebuild` with the listed
  posts in hand, so that's the natural place to write it.

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

- Project `tags` are authored in `_data/projects.yaml` but never rendered —
  neither `ProjectTile.tsx` nor `ProjectModal.tsx` reads them.
- Confirm the actual deploy target. The repo is named
  `angenibai.github.io` (GitHub Pages naming convention), but there's no
  `output: "export"` in `next.config.js` and no GitHub Actions workflow —
  this is a full Next.js app, which GitHub Pages can't serve as-is.
  Worth confirming there's a working deploy pipeline before treating the
  build passing as "the site is live."

## Reacts on posts

Original website had a reaction system connected to Firebase. Connect this here as well.
