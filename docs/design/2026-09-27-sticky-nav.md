---
status: approved
date: 2026-09-27
---

# Sticky nav

## What

### Problem

The header (`Nav.tsx`) scrolls away with the page, so on a long post the only
way back to projects/posts is scrolling to the top. Pinning the header as it is
doesn't work: it's ~110px tall on desktop, and ~150px on mobile, where title and
buttons stack (`Nav.module.css` `@media (max-width: 640px)`). The nav buttons are
also large on mobile.

### Goals

- On every `PageLayout` page, the nav is reachable at any scroll position.
- At the top of the page, desktop looks exactly as it does today.
- Pinned chrome is ~64px on desktop and one button on mobile.
- Nothing jumps: showing or hiding the pinned chrome never shifts page content.
- Stays inside the design language: keylines and solid offset shadows, no blur,
  noise texture carried onto any opaque surface.
- Keyboard and screen-reader use at least as good as today.

### Non-goals

- Home page (`index.tsx` uses `Layout` + inline `NavLinks`, no `Nav`) — unchanged.
- New nav destinations or reordering links.
- Hide-on-scroll-down / show-on-scroll-up behaviour.

### Behaviour

Desktop (> 640px), "running head":

- Given the top of a page, the full masthead shows as today and nothing is pinned.
- When the masthead has scrolled out of view, a slim bar (~64px) slides down
  from the top: small "angeni bai" (~1.5rem), the slash, small buttons, and a
  3px `--color-primary` bottom rule.
- When scrolling back up so the masthead re-enters, the bar slides away.

Mobile (≤ 640px), "floating menu button":

- Given the top of a page, the masthead is "angeni bai" on the left and a
  `menu` button on the right. The large button row is gone.
- When scrolled, there's no bar: only the `menu` button stays pinned top-right,
  12px from the edges, styled as the site `.button` (2px border, 2px offset
  shadow, press behaviour) on cream + noise.
- When tapped, the button reads `close` and a box opens below it, right-aligned:
  3px border, 5px offset shadow, cream + noise, the three links stacked
  full-width as `.button`s with the current page filled.
- The box closes on `close`, Escape, a tap outside it, or following a link.
  Focus moves to the first link on open and back to the button on close.

Both:

- Tabbing or skip-linking to content never lands under pinned chrome.
- `prefers-reduced-motion`: bar and box appear without sliding/scaling.
- The project modal still covers everything, including pinned chrome.

### Constraints

- `globals.css` sets `overflow-x: hidden` on both `html` and `body`, which makes
  `body` a scroll container that never scrolls, so `position: sticky` inside it
  won't stick. Needs to become `overflow-x: clip` (or be removed from one of
  the two). Not yet verified in the browser.
- z-index: above `PostPreviewPanel` (`z-index: 2`), below `ProjectModal`.
- Opaque surfaces use the same `noise-2.svg` background as `body`. The noise is
  random, so the tile doesn't need aligning with the page's.
- No new dependencies.

## How

### Options considered

Prototyped as artifacts (not committed):

- Desktop — https://claude.ai/artifact/Mgbf6TNaoV5YeA8y1YtZZh: A running
  head, B double rule, C floating box, D pin the whole header. **A chosen**: B
  stacked too many rules against the post heading's own; C let text show round
  the box and put buttons in a box; D cost the most reading space.
- Mobile — https://claude.ai/artifact/DAS3z532eUKdrhcodpiT5H: 1 bar + dropdown,
  2 bar + side drawer, 3 floating button only, 4 smaller inline buttons.
  **3 chosen, with the word toggle** (`menu`/`close`) rather than a hamburger —
  the site has no iconography and the nav is already text buttons.

### Chosen direction

**Desktop running head is a second, zero-height copy of the header**, not the
real header shrinking. It's `position: sticky; top: 0` with a negative
bottom margin equal to its height, hidden above the viewport until an
`IntersectionObserver` on the masthead reports it has left view. Shrinking the
real header in place would change its height mid-scroll and shift content,
which is the jump the goals rule out.

**Mobile uses one button, not two.** The prototype had a toggle inside the
masthead plus a separate floating one that appeared on scroll. On the site the
button can be a single `position: fixed` element at top-right from the start,
with the masthead sized so it sits level with "angeni bai" at scroll 0. Same
look, one focus target, no swap. (If aligning it at scroll 0 looks off, fall
back to the prototype's two-button swap.)

**Menu is a disclosure, not an ARIA menu.** The prototype used `role="menu"`,
which promises arrow-key menu semantics we don't implement. On the site: a
`<button aria-expanded aria-controls>` toggling a `<nav>` with plain links.
The button's accessible name is its visible text (`menu`/`close`) — no
`aria-label` override, so voice-control users can say what they see.

**Scroll offset**: `scroll-padding-top` on `html` covers the pinned chrome
height (running-head height on desktop, button height + inset on mobile), so
skip-link and Tab never land underneath.

**Running head a11y**: while hidden it's `inert` so Tab skips it; while shown
it's a normal nav. The masthead nav stays in the tree too, so there are
briefly two nav landmarks — accepted; label the running head's differently if
it reads badly in VoiceOver.

### Components involved

- `src/components/Nav.tsx` (changed): renders the masthead, the desktop running
  head, and the mobile menu button + box; owns the observer and open state.
- `src/components/NavLinks.tsx` (changed): accepts a size/variant so the same
  links render large (masthead), small (running head), or stacked (menu box).
- `src/styles/components/Nav.module.css` (changed): running head, menu button,
  menu box, and the 640px split.
- `src/styles/globals.css` (changed): `overflow-x: clip`; `scroll-padding-top`.
- `src/components/ButtonLink.tsx` / `Button.module.css`: reused as-is; the menu
  toggle uses `.button` styling on a `<button>`.
- `docs/DESIGN_LANGUAGE.md` (changed): note the sticky chrome as another use of
  the 3px rule and 5px shadow steps.

## Open questions

- Does `overflow-x: clip` still stop sideways scrolling on mobile? The rule
  came in with the create-next-app boilerplate (`651b0dc`), not a specific fix,
  so there's no known case it guards. Check in the browser at 375px on a post
  with a wide table/code block during implementation.

Resolved:

- iPhone safe area: no change needed. The viewport meta (`_app.tsx`) has no
  `viewport-fit=cover`, so Safari keeps the page, and any `position: fixed`
  element, clear of the notch itself.
