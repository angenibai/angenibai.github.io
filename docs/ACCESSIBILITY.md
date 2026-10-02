# Accessibility

Notes from a 2026-09-09 accessibility review of the site — a static read of
`src/`, `src/styles/` and the four posts in `_data/posts/`. This is a living
record: findings move with the code as they are fixed rather than being
re-audited from scratch, so a "Fix" that has landed is written as what changed
and why, not as an open recommendation. See
[docs/design/accessibility-p0.md](design/accessibility-p0.md) for the design
decisions from working through Sections 1 and 2.

The short version: **the content layer is in good shape and the projects page
is not**. All 71 post-body images carry real descriptive alt text, contrast
passes essentially everywhere, and `prefers-reduced-motion` is respected in
every file that animates. But `/projects` cannot be operated by keyboard at
all, and a handful of controls have no accessible name.

Findings are ordered by severity. Section 5 records what already works, so a
future change doesn't quietly undo it.

## 1. Blocking — `/projects` is unusable by keyboard

**Fixed — `src/components/ProjectTile.tsx`.** The tile was a `<div onClick>`
with no `tabIndex`, no `role`, and no key handler. It was the only way to open
a project, so the entire page was unreachable by keyboard, and a screen reader
announced it as a plain block of text with no hint that it did anything.
`cursor: pointer` (`ProjectGrid.module.css:39`) advertised it to mouse users
only. This was the most severe issue on the site.

Landed as a card with a stretched button inside the heading, not a `<button>`
wrapping the whole tile:

```tsx
<div className={styles.projectTile}>
  <div className={styles.tileContent}>
    <h2 className={styles.tileHeader}>
      <button
        type="button"
        className={styles.tileButton}
        aria-haspopup="dialog"
        onClick={onClick}
      >
        {content.name}
      </button>
    </h2>
    <p className={styles.tileDescription}>{content.shortDescription}</p>
  </div>
</div>
```

**Why not wrap the whole tile in a `<button>`.** `<button>` takes phrasing
content only, so `<h2>`/`<p>` inside one is invalid — but the decisive reason
is ARIA's _presentational children_: `role="button"` drops the roles of all
descendants and flattens the subtree to a text string for the accessible name.
A heading inside a button is therefore never exposed as a heading at all, in
any browser, so wrapping the whole tile would have cost the project names
their place in the heading outline (and dropped them from a screen reader's
heading rotor) without buying anything — the same problem exists whether the
heading tag is real or swapped for a styled `<span>`. It would also have made
each tile's accessible name the title and description concatenated; with the
button holding only the name, the name is just the name and the description
reads as adjacent text.

`::after { position: absolute; inset: 0 }` on `.tileButton` stretches the
click target over the whole card (`.projectTile` gains `position: relative` as
its containing block), so the hit area doesn't shrink to the title text.
`aria-expanded` was deliberately **not** added, despite describing the
open/closed state that already exists as `isExpanded` — it's the right
attribute for a disclosure, but focus moves into the modal and the tile
becomes inert behind it, so `aria-haspopup="dialog"` already carries the
useful part. The dead `close` prop (`ProjectTile.tsx:9`, and
`projects/index.tsx:51`) and unused `defaultTileContent` were removed in the
same commit.

**Known cost:** the stretched overlay sits over the title and description, so
neither can be selected with the mouse. Inherent to the pattern — the
alternative is a click target the size of the title text.

**Fixed — `src/components/ProjectModal.tsx:32-39`.** The close control was
also a `<div onClick>`, and its only content was `&times;`. Not focusable, not
keyboard-operable, and even if it had been, its accessible name would have
been the multiplication sign. It borrowed `buttonStyles.button`, so it
inherited a `:focus-visible` rule (`Button.module.css:68`) it could never
actually receive. Now `<button type="button" aria-label="Close">`, with the
usual reset (`background: none`, `font: inherit`, `border: none`) added to
`.modalCloseButton` (`ProjectModal.module.css`), since that class was written
assuming a div. `.modalCloseIcon`'s `font-size: 54px` still sizes the glyph the
same — that literal px value itself is the separate Section 4 text-resizing
finding, untouched here.

This landed as its own commit ahead of the `<dialog>` rework below: it makes
the modal keyboard-_dismissable_ one step before it becomes keyboard-
_reachable_.

**Fixed — `src/components/ProjectModal.tsx`.** The dialog had no dialog
semantics: no `role="dialog"`, no `aria-modal`, no `aria-labelledby` pointing
at its `<h2>`, no Escape handling (there was not a single `onKeyDown` anywhere
in `src/`), no focus moved into it on open, no focus trap, no focus restored on
close, and the page behind stayed in the tab order. Dismissal was click-outside
only, i.e. mouse-exclusive.

Rebuilt on a native `<dialog>` driven by `showModal()` / `close()` in an
effect keyed on `isOpen`. `role="dialog"`, `aria-modal`, Escape, focus
containment, backdrop inertness and top-layer stacking all now come from the
platform rather than a hand-rolled focus trap; the `<h2>` carries
`id="project-modal-title"` and the dialog points `aria-labelledby` at it. The
existing `@starting-style` scale animation moved onto `.modalOverlay[open]`.
Focus restoration uses a `useRef` on the last-clicked tile in
`src/pages/projects/index.tsx`, though `dialog.close()` already restores focus
to it on its own in current browsers — the ref is belt-and-braces and covers
the keyboard-Escape path identically.

The closed overlay stays genuinely hidden from assistive tech, as before, but
that invariant is now platform-owned rather than an explicit `display: none`:
the UA stylesheet's `dialog:not([open]) { display: none }` is what does it,
which is why `.modalOverlay`'s base rule deliberately does not declare
`display` at all — only `.modalOverlay[open] { display: flex }`.

**The close animation across browsers.** The element leaves the top layer the
instant `close()` is called, so the exit animation relies on two transitions:

```css
transition:
  display 0.3s allow-discrete,
  overlay 0.3s allow-discrete;
```

`display ... allow-discrete` keeps the dialog drawn for 0.3s after `close()`,
which gives the `transform` transition on `.modalPanel` time to play. That is
what makes the scale-out work, and it is supported in Chromium, Safari 18+ and
Firefox 129+. `overlay ... allow-discrete` only keeps the dialog in the top
layer during those 0.3s; a browser that doesn't support it ignores that line
and the animation still plays. The open animation needs neither —
`@starting-style` on `transform` doesn't involve the top layer.

Not yet verified against a real screen reader — see the closing note at the
end of this document.

## 2. Missing names, states and page titles

**Fixed — `src/components/Footer.tsx:13-22`.** The GitHub and LinkedIn links
contain only a `<FontAwesomeIcon>`, and `@fortawesome/fontawesome-svg-core`
marks the SVG it generates `aria-hidden="true"`, so both links had an **empty
accessible name**: a screen reader announced "link", twice, with nothing else.
This was the clearest WCAG 4.1.2 / 2.4.4 failure in the component tree. Now
`aria-label="GitHub"` / `aria-label="LinkedIn"` on the `<a>` elements.

> These are also the `target="_blank"` instances from Section 4, now with
> `rel="noopener"` — see the Section 4 entry for why `noopener` only.

**Fixed — `src/pages/posts/[slug].tsx`.** There was no `NextSeo` call, so every
post inherited `title="angeni bai"` from `DefaultSeo` (`_app.tsx:30`). Every
page under `/posts/*` therefore shared one non-unique title, which failed WCAG
2.4.2 (Page Titled). Now each post renders
`<NextSeo title={`${metadata.title} | angeni bai`} />`, matching the pattern
`projects/index.tsx` already used. The remaining SEO gap — no per-post
description or OG image — is not an accessibility failure and stays open in
[FUTURE_WORK.md](FUTURE_WORK.md#seo).

**Fixed — `src/components/ButtonLink.tsx`.** The current page used to be
conveyed only by the `.selected` fill and sink; `aria-current="page"` appeared
nowhere in the codebase, so a screen reader user could not tell which page
they were on. Now `aria-current={isSelected ? "page" : undefined}` is threaded
through both the external `<a>` and internal `<Link>` branches, alongside the
`isSelected` prop they already took. `ButtonLink` is only used by
`NavLinks.tsx`, so nothing there needed to change.

**Fixed — `src/pages/posts/[slug].tsx:62`.** The plain-`<img>` fallback branch
used `alt={metadata.splashImageCaption}` without the `|| ""` that line 51 has.
The caption is absent on every current post, so React omitted the attribute
entirely, producing an `<img>` with **no `alt` attribute at all** — which,
unlike `alt=""`, fails WCAG 1.1.1 and makes screen readers fall back to the
filename. Now matches line 51.

**Fixed — nested `<main>` elements, `src/pages/_app.tsx:46`.** This wrapped
every page in a `<main>` used only to carry the font CSS variables, and
`Layout.tsx:12` / `PageLayout.tsx:15` rendered a second one inside it. Two
`main` landmarks is invalid per the HTML content model, and it also nested
`header` and `footer` inside a `main`, costing them their top-level landmark
semantics. This was pulled forward from Section 3 into this batch because the
skip link below needs an unambiguous `<main>` to target. Now the outer element
is a `<div>` — it only ever existed to hold class names.

**Fixed — no skip link, `src/components/PageLayout.tsx`.** Keyboard users had
to tab the site title plus three nav buttons on every page before reaching
content (WCAG 2.4.1, Bypass Blocks). There was also nothing to build one from:
neither `<main>` had an `id`, and `globals.css` had no `.sr-only` /
`.visually-hidden` utility. Now `PageLayout` renders a `.skip-link` anchor as
its first child, pointing at `#main-content`, which the `<main>` carries along
with `tabIndex={-1}` — required, because without it the fragment target is not
focusable and Chrome/Safari move the scroll position but not focus, so the
next Tab would return to the top of the nav. `globals.css` gained both a
`.skip-link` rule (off-screen until `:focus`, then painted on-palette) and a
general-purpose `.visually-hidden` utility for anything hidden-but-announced
in future, so the next person doesn't add a second one.

`Layout.tsx` (home) is deliberately untouched: it renders no `<header>`, so
there is nothing to skip past — `NavLinks` already sits inside its `<main>`.
That gap is the Section 3 "home page" structural finding, not this one. Only
`/posts`, `/posts/*`, `/projects` and `/404` go through `PageLayout` and get
the skip link. For scale, the entire codebase contains exactly four ARIA
attributes before this batch, all of them `aria-hidden="true"`.

## 3. Document structure

**Fixed — the home page had no `h1`.** `src/pages/index.tsx:13` opened at
`<h3>` and `BioPanel.tsx:73,91` continued at `h4` / `h5` — heading levels
chosen for size rather than structure (`.bigText` is 3rem,
`Home.module.css:33`). Now the welcome line is an `h1`, BioPanel's heading is
`h2`, and its section titles are `h3`, matching the site's one-`h1`-per-page
convention with no skipped level. `BioPanel.module.css` pins `font-family`,
`font-weight` (and, on the title header, `line-height`) back to how the old
`h4`/`h5` rendered, since `globals.css`'s `h1, h2, h3` rule would otherwise
switch them from Newsreader to Work Sans. Rendered display is unchanged.

Home still uses the bare `Layout` rather than `PageLayout`, so it has no
`<header>` or `<footer>` landmark and `NavLinks` sits loose inside `<main>` —
that part is untouched.

**Nothing on the site is marked up as a list.** The post list
(`posts/index.tsx:24-41`), project grid (`projects/index.tsx:43-55`), nav links
(`NavLinks.tsx:13-29`), bio label/value pairs (`BioPanel.tsx:95-109`) and modal
links (`ProjectModal.tsx:69-91`) are all divs. No `<ul>`, `<ol>` or `<dl>`
appears anywhere in `src/`, so assistive tech never announces an item count.
The two label/value structures are description lists in everything but markup.

**`src/components/PostEntry.tsx:31-32`** — an `<h2>` inside a `<span>`, which
accepts phrasing content only. Browsers parse it and it renders fine, but it
fails validation and is fragile. Separately, the whole row is one link wrapping
the heading, date and blurb, so the link's accessible name is all three
concatenated, and the `·`-separated numeric date (`formatDate`, `:9-16`) reads
ambiguously aloud. No `<time datetime>` is used anywhere on the site.

**Fixed — `src/components/markdown/Code.tsx`, `src/pages/posts/[slug].tsx`.**
The original finding here was partly wrong: react-markdown already wraps a
fenced block in its own `<pre>`, so the DOM was `<pre><div wrapper><div
PreTag><code>` — `<pre>` semantics existed, but a `<div>` nested inside a
`<pre>` is invalid, and the actual problem was that nothing in that chain was
focusable, so a horizontally scrolling block could not be scrolled by
keyboard. Now `[slug].tsx` unwraps react-markdown's own `<pre>` (`pre:
({ children }) => <>{children}</>` in its `components` map), and `Code.tsx`
makes the syntax highlighter's own `PreTag` the `<pre>` (was `"div"`), with
`tabIndex={0}` on it — it's the right element for the tab stop since
`.codeBlock` (`overflow-x: auto`) is the scroll container. Every non-inline
block now goes through `SyntaxHighlighter`, defaulting to `language="text"`
when there's no language class, so an un-languaged fenced block (none exist
today) still renders as a real `<pre>` instead of falling through to the
inline-`<code>` branch. Inline code correctly uses `<code>`.

**`src/pages/posts/[slug].tsx:26`** — the error branch renders a bare `<h2>`
outside `PageLayout`: no landmarks, no `h1`, no nav, no way out.

**Fixed — `.eslintrc.json`.** Previously extended only `next/core-web-vitals`;
`jsx-a11y` was not enabled, which is the root reason the div-as-button and
unnamed-link problems above went uncaught. Now extends
`plugin:jsx-a11y/recommended` too — the single highest-leverage preventive
change on this list, since it would have flagged items 1 and 2 automatically.
A dry run against the current codebase flagged exactly one thing:
`ProjectModal.tsx`'s `<dialog onClick>` backdrop-click handler
(`click-events-have-key-events`, `no-noninteractive-element-interactions`), a
false positive — the keyboard equivalent is Escape, which `<dialog>` handles
natively and `onClose` already catches. Suppressed with an
`eslint-disable-next-line` and a comment recording why, placed before the
opening `<dialog` tag (a disable comment inside the attribute list doesn't
take — ESLint attributes the error to the `JSXOpeningElement`'s own start
line, not to the individual attribute line).

## 4. Colour, focus and motion

**Fixed — prose links were distinguished from body text by colour alone.**
`globals.css:132-136` sets `a { text-decoration: none }`, with an underline
only on `:hover` (`:138-140`). Link green `#0D4B37` inside body black `#292929`
is a **~1.4:1** difference. WCAG 1.4.1 (Use of Color) wants at least 3:1 when
colour is the only distinction, plus a non-colour cue available to keyboard and
touch users — which `:hover` is not. It bit hardest at `src/pages/404.tsx:15`,
where an unadorned inline link is the only way off the page.

Now `.postContent a` (`Post.module.css`) and `.subheading a`
(`Error.module.css`) underline links in post bodies and on `/404`, matching
`ProjectModal.module.css:189` (`.modalPanel a`), which already did exactly
this. Scoped to prose, so nav buttons, post-list rows and the masthead are
untouched — those read as interactive from their own shape.

**`.sneakyLink` stays deliberately un-underlined.** `globals.css:142-149` gives
it no colour change, no weight change, and explicitly cancels the inherited
hover underline. This is an intentional design decision, not an oversight, and
it should survive the fix above. Recorded honestly: the riskiest instance is
`BioPanel.tsx:42-48`, a mid-sentence outbound link on "kanzi apples" with no
cue in any state, which also opens in a new tab unannounced. The masthead title
(`Nav.tsx:10`) is contextually discoverable in a way a mid-prose link is not,
so if one instance ever gets revisited, that is the one.

**No designed focus indicator.** The good news first: `outline: none` appears
**nowhere** in `src/styles/`, so the browser default focus ring is intact
site-wide. But nothing is designed either — the codebase's one focus rule,
`Button.module.css:68-74`, just re-applies the 2px hover lift, cancels the
underline, and excludes `.selected`, so the current page's nav button gets no
custom treatment at all.

> Fix: an explicit `:focus-visible` outline in `globals.css` — e.g.
> `3px solid var(--color-primary)` with `outline-offset: 2px` — so focus is
> consistent and on-palette rather than browser-dependent against cream.

**Fixed — `target="_blank"` without `rel="noopener"`.** `ButtonLink.tsx`,
`Footer.tsx` (both links), `BioPanel.tsx`, and the raw-HTML anchors in
`_data/projects.yaml` (`:8`, `:9`, `:125-129`, `:142`, `:143`, `:181`, `:196`,
two on `:196`) now carry `rel="noopener"`, matching `ProjectModal.tsx`, which
already got `rel` right (it keeps `noopener noreferrer`, unchanged).
`noopener` only, not `noreferrer`: since 2021 every major browser applies
`noopener` to `target="_blank"` by default, so this changes nothing in
current browsers, but `noreferrer` would additionally stop the `Referer`
header, which would hide angeni.me from GitHub/LinkedIn/etc.'s referrer
analytics — left off on purpose. Neither affects accessibility; the
accessibility part of `target="_blank"` (nothing tells users a new tab will
open) is still open. `_data/bio.yaml` also had a `target="_blank"` not
originally listed here — same fix. `_data/projects.yaml:143,181` still use `"here"` as the link
text (WCAG 2.4.4) — untouched, a separate issue from `rel`.

**Three marginal contrast cases.** Everything else passes comfortably (see
Section 5), but worth recording:

| Where                                                             | Ratio   | Note                                                                                                                         |
| ----------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Syntax comment green `#79A08F` on `#093426` (`Code.tsx:52`)       | 4.73:1  | The narrowest passing margin on the site, at ~15px. Any darkening of the panel or lightening of the green drops it below AA. |
| Table hairline `#0d4b378d` (`Post.module.css:140,149`)            | 2.97:1  | Just under the 3:1 non-text threshold (WCAG 1.4.11). Arguably decorative.                                                    |
| Modal scrim `rgba(255,255,255,0.4)` (`ProjectModal.module.css:7`) | ~1.03:1 | Visually inert — nothing signals the page behind is inactive.                                                                |

**No `prefers-contrast` or forced-colors handling anywhere.** This matters more
than usual here because depth and press-state are carried by `box-shadow`
(`Button.module.css:41-50`), which Windows High Contrast Mode discards
entirely, along with `background-color`. The `border` declarations survive so
structure holds, but the pressed-vs-resting distinction does not.

**Motion is well handled, with one remaining gap.** `prefers-reduced-motion`
is respected in all five files that animate. Those blocks remove the
`transition` but leave the `transform: translate(...)` on `:hover` /
`:active` (`Button.module.css:41-50,58-66`, `ProjectGrid.module.css:50-58,69-76`),
so elements still jump — minor, since an instant jump beats eased motion.

**Page transitions (`src/hooks/useRouteTransition.ts`) are gated in JS, not
CSS.** With reduced motion on, the hook doesn't start a view transition at
all and navigation is plain Next.js, so the page never sits frozen on the old
snapshot while the next route loads. Same `MOTION_QUERY` string as
`usePostPreview.ts`. The hook also takes over internal link clicks and
Back/Forward from `next/link` and Next's popstate handler (see its header
comment); it still navigates through `router.push`/`replace`, so Next's route
announcer is unaffected.

**Fixed — `src/hooks/usePostPreview.ts`.** `TRACK_CURSOR` drove per-frame
`translate3d` cursor tracking and honoured no motion preference, making it
the largest un-gated motion on the site. Adding `prefers-reduced-motion` to
`CAPABILITY_QUERY` was considered and rejected — that query also gates
whether the panel is enabled at all, so it would have disabled the panel
entirely rather than just its tracking. Instead, a second media query
(`MOTION_QUERY`, `"(prefers-reduced-motion: no-preference)"`) is tracked in
its own `trackCursor` state, the same pattern `enabled` already uses, and
gates only the `onMouseMove` cursor-follow call. With reduced motion on, the
panel still appears on row entry/focus, placed once instead of following the
cursor.

**Text resizing.** `ProjectModal.module.css:109` sets `font-size: 54px` on the
close `×` — the only literal-px font size in the codebase, and it is on a
dismiss control, so it will not scale with a user's browser font-size
preference. `BioPanel.module.css` hard-codes widths around text that does scale
(`290px`, `240×320px` image frame, `80px` / `185px` label and value columns).
Every media query is px-based, so layouts reflow on page zoom but not for a
user who only raises their default font size.

**Custom cursor** (currently uncommitted, `globals.css:20`). `cursor` is an
inherited property and this is set on `:root`, so prose loses its text I-beam
site-wide — the cue that text is selectable, which the site's elaborate
`::selection` styling (`:171-222`) now advertises to nobody. The hotspot is
also wrong: `arrowhead.svg` is 24×24 with its point at roughly `(5.5, 3)`, but
the declared hotspot is `12 12`, the centre of the box, so clicks land about
9px off in both axes — a precision problem for anyone with a motor impairment.
A custom cursor also won't scale with OS pointer-size settings. Both SVGs are
untracked, so committing `globals.css` without them silently falls back to
`auto`.

## 5. What already works — don't regress it

- `<Html lang="en">` (`_document.tsx:5`), and the viewport meta permits zoom
  (`_app.tsx:39-44`) — no `maximum-scale`, no `user-scalable=no`.
- **All 71 post-body images carry descriptive alt text**, and it is genuinely
  good: _"Diagram showing the pipeline from the frontend receiving the input,
  sending the video id to the server…"_. Only three are weak ("Majik" ×2,
  "this is fine"). The two charts in the Easter Show post have generic alt, but
  each is immediately followed by a paragraph stating what it shows, so the
  information is not lost.
- Post bodies start at `##` and nest correctly under the page's `h1`.
- The embedded YouTube iframe has `title="YouTube video player"`, and the four
  `<figure>` / `<figcaption>` pairs are properly associated.
- Decorative ornaments are correctly `aria-hidden`: the nav slash divider
  (`Nav.tsx:14`), and the dot leader and pin marker (`PostEntry.tsx:30,33`).
  Note the pin means "pinned" is conveyed by shape alone with no text
  equivalent — a deliberate trade, but worth knowing.
- `markdown/Image.tsx:9` guarantees an `alt` attribute always exists, so a
  markdown author who omits one gets a decorative image, never a filename.
- **The posts-list hover panel is the best-built thing on the site.** It is
  `aria-hidden="true"` with `alt=""` because it duplicates content already in
  the row's link, it has keyboard parity via `onFocus`/`onBlur`, it is
  `pointer-events: none`, it is capability-gated to
  `(hover: hover) and (min-width: 640px)`, and the reasoning is documented
  inline. Use it as the reference for how to add a decorative affordance.
- **Text contrast passes everywhere.** `#0D4B37` on `#FAF8F0` is 9.5:1;
  `#292929` on `#FAF8F0` is 13.7:1; every `.invertColor` cream-on-green pairing
  is 9.5:1; and every syntax token in `Code.tsx:49-63` clears 4.5:1 on the
  `#093426` panel. Task-list checkboxes pair colour with a `✔` glyph
  (`globals.css:95-106`) rather than relying on fill alone.
- No `outline: none` anywhere; `prefers-reduced-motion` in all five animating
  files, plus the page transitions (JS-gated, Section 4); the closed modal is genuinely hidden from assistive tech rather than
  merely transparent — now via the native `<dialog>`'s own
  `dialog:not([open]) { display: none }`, so `.modalOverlay`'s base rule must
  keep not declaring `display` itself (see Section 1).
- `--color-accent` (`#93748A`) is **unused**. At 3.87:1 on cream it fails AA
  for normal text — if it is ever adopted, restrict it to large text or
  non-text UI.
- Each project tile's heading stays a real `<h2>` even though it also holds
  the click target (`ProjectTile.tsx`). If this ever gets "simplified" back to
  a `<button>` wrapping the whole card, the project names disappear from the
  heading outline — see the presentational-children reasoning under Section 1.

---

This started as a static, read-only review; Sections 1 and 2 (plus the
nested-`<main>` finding pulled forward from Section 3) have since been fixed,
see [docs/design/accessibility-p0.md](design/accessibility-p0.md) for why.
Nothing here has been verified against a real screen reader or in a browser,
though. A pass with VoiceOver (⌘F5) on `/`, `/projects`, `/posts` and one post
is the natural next step — particularly on `/projects`, since the rebuilt
`<dialog>` is the piece with the most platform behaviour and the least static
verifiability, and to confirm the remaining landmark and heading findings in
Section 3.
