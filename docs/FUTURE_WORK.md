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

## Smaller cleanup items

- Project `tags` are authored in `_data/projects.yaml` but never rendered —
  neither `ProjectTile.tsx` nor `ProjectModal.tsx` reads them.
- Tag pages don't exist yet, so the old Jekyll `/tags/*` URLs in
  `_data/redirects.yaml` point to `/posts`. Repoint them at the real tag pages
  when those are added.

## Post reacts: trim the Firebase key after deploy

The `blog-reacts` browser API key allows Cloud Firestore, Firebase Management
and Firebase Installations. The last two are only for the old Jekyll site's
Firebase Analytics (`getAnalytics()`), which is still live on angeni.me. It
also allows Identity Toolkit, though nothing uses Auth. Once the new site
replaces the old one, nothing needs those three, so narrow the key to Cloud
Firestore API only (Cloud Console → APIs & Services → Credentials). The key
doesn't protect Firestore itself, since Firestore ignores it. That's done by
`firestore.rules`. See `docs/design/2026-09-29-post-reacts.md`.
