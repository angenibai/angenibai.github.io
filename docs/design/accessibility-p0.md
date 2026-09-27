---
status: done
---

# Accessibility P0

Design rationale from fixing Sections 1–2 of [docs/ACCESSIBILITY.md](../ACCESSIBILITY.md),
plus the nested-`<main>` fix pulled forward from Section 3.

## Design decisions during implementation

### `docs/ACCESSIBILITY.md` moves with the code, not after it

A fixed finding that just says "fixed" loses the reasoning behind it, and the
next person to touch the file either re-derives it or breaks it. So every fix
commit updates the audit in the same commit as the code, rewriting the finding
from a recommendation into a past-tense record that keeps the _why_. The
audit's preamble states this as a standing claim ("nothing here has been fixed
unless recorded"), so letting it drift out of sync would make the file
actively misleading, not just stale.

### Project tiles: a button around the text, not around the whole tile

`ProjectTile` makes the card keyboard-operable with a `<button>` around just
the heading, stretched over the whole card via `::after { inset: 0 }`, rather
than wrapping the entire tile (heading + description) in one button.

Two reasons, the second decisive:

- `<button>` only permits phrasing content, so a `<h2>`/`<p>` pair inside one
  is invalid HTML.
- ARIA's _presentational children_: `role="button"` flattens all descendant
  roles into a single text string for the accessible name. A heading inside a
  button stops being exposed as a heading at all. Wrapping the whole tile
  would have dropped every project name from the page's heading outline, and
  made each tile's accessible name the title and description concatenated
  instead of just the title.

Known cost, accepted: the stretched `::after` overlay sits over the title and
description, so neither is mouse-selectable. That's inherent to the
click-target-stretching pattern; the alternative is a click target the size of
the title text.

### Native `<dialog>` for the project modal — a deliberate cross-browser regression

Rebuilding `ProjectModal` on `<dialog>` + `showModal()` trades ~60 lines of
hand-rolled focus-trap/Escape/backdrop-inertness code for the platform's own,
and removes the risk of ever getting that hand-rolled version subtly wrong.

**The cost:** animating a `<dialog>` closed requires transitioning the
`overlay` CSS property (the element leaves the top layer the instant
`close()` is called), and `overlay` was Chromium-only at the time. In Safari
and Firefox the modal snaps shut instead of scaling out; the open animation is
unaffected everywhere since `@starting-style` needs no top-layer support.

This was accepted as worth taking now, worth revisiting later — recorded in
three places on purpose (an inline CSS comment, a note under the relevant
`docs/ACCESSIBILITY.md` finding, and a `docs/FUTURE_WORK.md` bullet) so the
audit carries the cost of its own recommendation rather than only the win.
Revisit paths: wait for `overlay` to ship in Safari/Firefox (no code change
needed), or delay the `close()` call behind a `transitionend`/timeout driven
by a class — which reintroduces some of the hand-rolled state this rebuild
was removing.
