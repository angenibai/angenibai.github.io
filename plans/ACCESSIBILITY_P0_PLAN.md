# Accessibility P0 plan

Addresses **Sections 1 and 2** of [docs/ACCESSIBILITY.md](../docs/ACCESSIBILITY.md)
in full, plus the nested-`<main>` fix from Section 3 (pulled forward because the
skip link needs an unambiguous target).

Nine commits, ordered so the cheap independent fixes land first and the modal
rework — the only one with real regression surface — lands last. Every commit
builds and is independently shippable.

Out of scope for this batch: Sections 3 (apart from nested `<main>`) and 4, and
enabling `jsx-a11y` in `.eslintrc.json`. Adjacent one-liners that fall inside
files being touched are noted per commit but **not** included, so each commit
stays one finding.

## Keeping the audit honest

**Every commit updates `docs/ACCESSIBILITY.md` in the same commit as the code.**
The audit is written as a static read with the standing claim "Nothing here has
been fixed; every 'Fix' below is a recommendation" — the moment that stops being
true the file becomes actively misleading, so it moves with the code rather than
in a cleanup pass at the end.

The convention, applied per commit:

- Rewrite the finding from a recommendation into a record of what landed, in
  past tense, keeping the file/line references current.
- Preserve the reasoning. The audit's value is that it explains _why_ each thing
  was a failure; a fixed finding that just says "fixed" loses that, and the next
  person to touch the file re-derives it or breaks it.
- Anything discovered while fixing that the audit got wrong or missed gets
  written down, including where the fix has a cost (see commit 9).
- Commit 1 also amends the preamble and the Section 5 framing so the document's
  own description of itself stays accurate.

Section 5 ("What already works — don't regress it") is append-only here: fixes
that establish a new invariant worth protecting get a line there.

## Commits

### 1. `fix missing alt attribute on post splash fallback`

`src/pages/posts/[slug].tsx:62` — `alt={metadata.splashImageCaption}` →
`alt={metadata.splashImageCaption || ""}`, matching line 51.

`splashImageCaption` is empty or absent on all four current posts, so React
currently drops the attribute entirely and screen readers announce the filename.
WCAG 1.1.1. One word.

_Doc:_ rewrite the finding; amend the preamble's "Nothing here has been fixed"
to describe the file as a living record with a fix log rather than a pure audit.

### 2. `add accessible names to footer social links`

`src/components/Footer.tsx:13,16` — add `aria-label="GitHub"` and
`aria-label="LinkedIn"` to the two `<a>` elements.

FontAwesome marks its generated SVG `aria-hidden="true"`, so both links
currently have an empty accessible name and announce as bare "link". WCAG 4.1.2
/ 2.4.4.

> Adjacent, not included: these are also the `target="_blank"` without
> `rel="noopener noreferrer"` instances from Section 4. Leaving the Section 4
> entry pointing at them.

### 3. `give each post a unique page title`

`src/pages/posts/[slug].tsx` — add `<NextSeo title={...} />` inside
`PageLayout`, following the pattern already used by `projects/index.tsx:33`:

```tsx
<NextSeo title={`${metadata.title} | angeni bai`} />
```

Every `/posts/*` page currently inherits `title="angeni bai"` from `DefaultSeo`
(`_app.tsx:30`). WCAG 2.4.2. `/`, `/posts`, `/projects` and `/404` are already
correct — this is the only page missing it.

> Adjacent, not included: `description={metadata.blurb}` and `openGraph`. Those
> belong to the SEO item in [FUTURE_WORK.md](../docs/FUTURE_WORK.md#seo), not to
> the 2.4.2 failure.

_Doc:_ also narrow the FUTURE_WORK SEO bullet, which currently claims the whole
`NextSeo` call is missing — after this it is only the description and OG image.

### 4. `mark the current nav item with aria-current`

`src/components/ButtonLink.tsx:57,61` — add
`aria-current={isSelected ? "page" : undefined}` to both the external `<a>` and
the internal `<Link>` branches.

`isSelected` already exists and already drives `.selected`; this threads the
programmatic equivalent alongside it. `ButtonLink` is used only by `NavLinks`,
and `isSelected` defaults to `false`, so nothing else changes. No change needed
in `NavLinks.tsx` itself.

### 5. `un-nest the main landmark`

`src/pages/_app.tsx:46` — `<main className={...}>` → `<div className={...}>`.

That element exists only to carry the three font CSS variables. `Layout.tsx:12`
and `PageLayout.tsx:15` render the real `<main>` inside it, so every page ships
two `main` landmarks and has its `<header>` and `<footer>` nested inside a
`main`, costing them top-level landmark status.

Verification: nothing in `src/styles/` targets a bare `main` element selector
(checked), so this is purely structural.

_Doc:_ move this out of Section 3 and into the fix log; Section 3's remaining
structural findings stay open.

### 6. `add a skip link`

Three pieces:

- `src/styles/globals.css` — add a `.visually-hidden` utility (the codebase has
  none) and a `.skip-link` rule that is off-screen until `:focus`, then paints
  on-palette:

  ```css
  .skip-link {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 2000;
  }
  .skip-link:focus {
    left: 1rem;
    top: 1rem;
    padding: 0.5rem 1rem;
    background-color: var(--color-bg-white);
    border: var(--border-width) solid var(--color-primary);
  }
  ```

- `src/components/PageLayout.tsx` — `id="main-content"` and `tabIndex={-1}` on
  the `<main>`. The `tabIndex` is required: without it the fragment target is
  not focusable and Chrome/Safari move the scroll position but not focus, so the
  next Tab returns to the top of the nav.

- `src/components/PageLayout.tsx` — the skip link as the first child, before
  `<Nav />`.

**`Layout.tsx` (home) is deliberately left alone.** It renders no `<header>`, so
there is nothing to skip past — `NavLinks` already sits inside its `<main>`.
That is a Section 3 structural finding, not this one.

WCAG 2.4.1. Applies to `/posts`, `/posts/*`, `/projects` and `/404`.

Verification: Tab from a fresh page load on `/posts` — first stop should be the
skip link, visible; Enter should land focus on the page heading region, and the
next Tab should go to content, not back to the masthead.

_Doc:_ the audit notes there is no `.sr-only` utility to build a skip link from;
record that `.visually-hidden` now exists so the next person reaches for it
rather than adding a second one.

### 7. `make the close control on the project modal a real button`

`src/components/ProjectModal.tsx:32-37` — the `<div onClick>` becomes
`<button type="button" aria-label="Close">`.

Kept small and separate from commit 9 on purpose: it is self-contained, and it
makes the modal keyboard-_dismissable_ one commit before it becomes keyboard-
_reachable_. It also stops the element inheriting `buttonStyles.button`'s
`:focus-visible` rule (`Button.module.css:68`) that it can currently never
receive.

`ProjectModal.module.css:99-113` needs the usual button reset —
`background: none`, `font: inherit`, `border: none` — since `.modalCloseButton`
was written assuming a div. Watch that `.modalCloseIcon`'s `font-size: 54px`
still sizes the glyph the same.

> Adjacent, not included: that literal `54px` is the Section 4 text-resizing
> finding.

### 8. `make project tiles keyboard-operable`

The card keeps its heading; a button inside the heading is stretched over the
whole card so the click target does not shrink.

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

**Why not wrap the whole tile in the button.** `<button>` takes phrasing content
only, so `<h2>`/`<p>` inside one is invalid — but the decisive reason is ARIA's
_presentational children_: `role="button"` drops the roles of all descendants and
flattens the subtree to a text string for the accessible name. A heading inside a
button is therefore not exposed as a heading at all, so wrapping would have cost
the project names their place in the heading outline without buying anything. It
would also have made each tile's accessible name the title and description
concatenated; with the button holding only the name, the name is just the name
and the description is read as adjacent text.

Also in this commit:

- `onClick` on `ProjectPanelTileProps:8` → `MouseEventHandler<HTMLButtonElement>`.
- Delete the dead `close` prop (`:9`, and the matching `close={() => handleClose()}`
  at `projects/index.tsx:51`). It is declared, passed, and never destructured.
- Delete `defaultTileContent` (`:12-17`), likewise unreferenced.
- The intermediate `<div className={styles.tileHeader}>` and
  `<div className={styles.tileDescription}>` wrappers collapse onto the `<h2>`
  and `<p>` themselves.

**`src/styles/components/ProjectGrid.module.css`:**

- `.projectTile` keeps every visual declaration it has and gains
  `position: relative` — the overlay's containing block.
- New `.tileButton`: button reset (`font: inherit`, `color: inherit`,
  `background: none`, `border: none`, `padding: 0`, `text-align: left`,
  `width: 100%`, `appearance: none`), the two-line clamp moved off `.tileHeader`
  (`display: -webkit-box`, `-webkit-line-clamp: 2`, `-webkit-box-orient: vertical`,
  `overflow: hidden`), and the stretcher:

  ```css
  .tileButton::after {
    content: "";
    position: absolute;
    inset: 0;
  }
  ```

- `.tileHeader` keeps only `margin-bottom: 0.5rem`; `.tileDescription` is
  unchanged.
- `.projectTile:hover` and `:not(.isSelected):active` (`:52`, `:69-76`) work
  **unchanged** — both pseudo-classes match ancestors of the element being
  hovered or activated, and the `::after` overlay covers the tile including its
  padding, so the whole card still lifts and sinks as one.
- The `h2`/`p` colour-inversion rules (`:60-66`) also work unchanged: the button
  inherits colour from the `<h2>`.
- One addition — a focus indicator for the card rather than just the button's
  text box:

  ```css
  .projectTile:has(.tileButton:focus-visible) {
    /* same lift as :hover */
  }
  ```

- Keep `<div>` as the tile's outer element rather than `<article>`.
  `globals.css:42` sizes `div` (and not `article`) at `1.1rem`, so switching the
  element would quietly change the inherited font-size the `<h2>`'s `em`-based UA
  size computes against. Marking up the grid as a list is a Section 3 finding and
  belongs with that work.

**Known cost:** the stretched `::after` sits over the title and description, so
neither can be selected with the mouse. That is inherent to the pattern and the
reason it is worth naming — the alternative is a click target the size of the
title text.

Verification: Tab through `/projects` — every tile should be one stop, Enter and
Space should both open the modal, the focus ring should frame the whole card, and
hover/press should behave exactly as before from anywhere on the card.

_Doc:_ Section 1's first finding becomes a record, keeping the presentational-
children reasoning so nobody "simplifies" it back to a wrapping button. Section 5
gains the invariant.

### 9. `rebuild the project modal on native <dialog>`

The largest commit, and the only one that regresses something.

**`src/components/ProjectModal.tsx`**

```tsx
const dialogRef = useRef<HTMLDialogElement>(null);

useEffect(() => {
  const dialog = dialogRef.current;
  if (!dialog) return;
  if (isOpen && !dialog.open) dialog.showModal();
  else if (!isOpen && dialog.open) dialog.close();
}, [isOpen]);
```

- Outer `<div className={styles.modalOverlay}>` → `<dialog>` with the same
  class, `ref={dialogRef}`, and `aria-labelledby="project-modal-title"` pointing
  at the `<h2>` on `:30` (which gains that `id`; a constant is safe — exactly one
  modal is mounted per page).
- **No hand-written `role="dialog"` or `aria-modal`.** `showModal()` supplies
  both, plus Escape, focus containment, backdrop inertness and top-layer
  stacking.
- `onClose={onClose}` on the `<dialog>`. Load-bearing: Escape closes the element
  natively without going through React, so without this handler `isModalOpen`
  and `selectedProject` stay stale and the tile behind keeps its sunk state.
  Re-entrancy is safe — the effect's `dialog.close()` fires `onClose` →
  `handleClose()` → sets already-false state → no re-render.
- `handleOverlayClick` retargets: with a single `<dialog>` there is no separate
  backdrop node, so a backdrop click has `event.target === dialogRef.current`.
  This only works if the dialog element carries no padding or border of its own —
  all panel chrome stays on the inner `.modalPanel`, which is already how it is
  built.
- Prop types: `onClose` on `ProjectModalProps:9` is
  `MouseEventHandler<HTMLDivElement>`, but the parent passes `() => handleClose()`
  and ignores the event. Retype it `() => void` rather than chasing it across
  three event types.

**`src/pages/projects/index.tsx`** — focus restoration:

```tsx
const lastTileRef = useRef<HTMLButtonElement | null>(null);

const handleProjectClick = (idx: number, e: MouseEvent<HTMLButtonElement>) => {
  lastTileRef.current = e.currentTarget;
  ...
};

const handleClose = () => {
  ...
  lastTileRef.current?.focus();
};
```

`dialog.close()` restores focus to the previously-focused element on its own in
current browsers, which is the same tile — the explicit call is belt-and-braces
and covers the keyboard-Escape path identically.

**`src/styles/components/ProjectModal.module.css`:**

- `.modalOverlay` must **not** declare `display` in its base rule. The UA
  stylesheet's `dialog:not([open]) { display: none }` is what keeps the closed
  modal genuinely hidden from assistive tech, which the audit explicitly says to
  preserve. Set `display: flex` under `.modalOverlay[open]` only.
- `.modalOverlay` becomes the full-viewport scrim: `width/height: 100%`,
  `max-width/max-height: none`, `margin: 0`, `border: none`, `padding: 0`,
  keeping the existing `rgba(255,255,255,0.4)` background. Leave `::backdrop`
  transparent — the dialog covers it, and keeping the scrim on the dialog is what
  makes the backdrop click detectable.
- Swap the animation selectors from `.modalOverlay.modalOpen` to
  `.modalOverlay[open]`, including inside `@starting-style` (`:46-50`). The
  `modalOpen` class and the `isOpen && styles.modalOpen` template on `:24` go
  away.
- `z-index: 1000/1001` (`:10`, `:36`) can go — the top layer outranks all
  stacking contexts.
- Keep the `prefers-reduced-motion` block (`:52-74`), retargeted to `[open]`.

#### Regression: the close animation, outside Chromium

Animating a native `<dialog>` _out_ requires transitioning the `overlay` property
with `allow-discrete`, because the element leaves the top layer the instant
`close()` is called:

```css
transition:
  display 0.3s allow-discrete,
  overlay 0.3s allow-discrete;
```

`overlay` is Chromium-only as of writing. **In Safari and Firefox the modal will
snap shut instead of scaling out.** The open animation is unaffected everywhere —
`@starting-style` on `transform` needs no top-layer participation.

This is a real regression against the hand-rolled overlay, which animated out in
every browser, and it is the price of getting Escape, the focus trap, backdrop
inertness and top-layer stacking from the platform instead of owning ~60 lines of
focus-trap code. Worth taking now, worth revisiting.

Recorded in three places so it cannot be lost:

- an inline comment on the `transition` in `ProjectModal.module.css`, since that
  is where someone will be standing when they wonder why;
- a note in `docs/ACCESSIBILITY.md` under the rewritten Section 1 finding — the
  audit should carry the costs of its own recommendations, not just the wins;
- a bullet under **Animation polish** in `docs/FUTURE_WORK.md`, cross-referencing
  both, so it sits in the queue of things to revisit rather than only in the
  file it affects.

Revisit paths, when it comes up: wait for `overlay` to ship in Safari/Firefox
(no code change needed — it starts working); or delay the actual `close()` call
behind a `transitionend`/timeout while driving the exit with a class, which
re-introduces a small amount of the hand-rolled state we are deleting here.

#### Verification (worth doing by hand)

- Escape closes the modal, and the tile behind loses its sunk state.
- Focus returns to the tile that opened it, via both Escape and the close button.
- Tab inside the open modal cycles within it and never reaches the nav or footer.
- Backdrop click still closes; a click on the panel does not.
- The scale-in animation still plays in all three browsers, and is suppressed
  under reduced motion.
- Scale-out plays in Chrome and is expected to snap in Safari/Firefox — confirm
  it snaps cleanly rather than flickering or leaving the scrim behind.
- With the modal closed, the first project's text is not reachable by Tab and
  does not appear in the accessibility tree.

## After this batch

The audit's closing note stands: none of this has been checked against a real
screen reader. A VoiceOver pass on `/projects` after commit 9 is the highest-value
follow-up, since the dialog is the piece with the most platform behaviour and the
least static verifiability.

Deferred, in rough order of what I'd take next: `jsx-a11y` in `.eslintrc.json`
(one line, prevents this whole class recurring), prose link underlines (WCAG
1.4.1, and `/404`'s only exit is an unadorned inline link), the missing
`rel="noopener noreferrer"` set, and `usePostPreview.ts`'s ungated cursor
tracking.
