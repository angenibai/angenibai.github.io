# Future Work

Notes from a 2026-09-30 review of the site, covering everything short of the  
build-breaking issues (those are already fixed). Not in priority order within  
each section except where noted.

## Blog post list page

See `docs/design/posts-list-evolution.md` for the current design.

- **Real image dimensions at build time** via `image-size`, replacing the
  `640x480` upper-bound hint passed to `next/image` in `PostPreviewPanel`.
- **Pagination** — still out of scope.

## Tags

- **Post tags are deliberately not rendered on the list page.** They stay in
  frontmatter and are read by nothing there — this is a design decision, not an
  oversight, so re-adding them needs a reason beyond "the data exists". See
  `docs/design/posts-list-evolution.md`.
- **Project tags** are authored in `_data/projects.yaml` but never rendered —
  neither `ProjectTile.tsx` nor `ProjectModal.tsx` reads them.
- **Tag filtering** — still wanted, and the posts list layout takes it better
  than the card list did. A filtered receipt is still a receipt.
- **Tag pages don't exist yet**, so the old Jekyll `/tags/*` URLs in
  `_data/redirects.yaml` point to `/posts`. Repoint them at the real tag pages
  when those are added.

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

## Responsive header

- Could also have more interesting styling aka border lines

## Loading profile image

- Current home page profile has a loading... placeholder. It should be
  clickable, and once clicked the tile flips over to reveal the profile
  image.

## Post reacts: trim the Firebase key after deploy

The `blog-reacts` browser API key allows Cloud Firestore, Firebase Management
and Firebase Installations. The last two are only for the old Jekyll site's
Firebase Analytics (`getAnalytics()`), which is still live on angeni.me. It
also allows Identity Toolkit, though nothing uses Auth. Once the new site
replaces the old one, nothing needs those three, so narrow the key to Cloud
Firestore API only (Cloud Console → APIs & Services → Credentials). The key
doesn't protect Firestore itself, since Firestore ignores it. That's done by
`firestore.rules`. See `docs/design/2026-09-29-post-reacts.md`.
