---
status: approved
date: 2026-10-02
---

# Custom cursor set

Picks up [FUTURE_WORK.md](../FUTURE_WORK.md)'s "Custom cursor
set", deferred from [accessibility P1](2026-09-27-accessibility-p1.md) #10.
Options were prototyped in a live test page (cursor lab artifact,
https://claude.ai/artifact/7wLxQ4osYt7Mgdw7NS3ZCi) and chosen by eye.

## Problem

Only the arrow is custom. It's set on `:root` and inherited everywhere, but
browsers' default styles give links the system hand, so moving onto a link
switches from the cream arrow to a system cursor. Prose has no I-beam, because
the inherited cursor overrides `auto`. The arrow's hotspot is `8 8`, but its
tip is at about `(5.5, 3)`, so clicks land about 3px right of and 5px below
the visible tip.

## Outcome

Two cursors, both drawn from the existing arrow:

| State                                           | Glyph                                                                                   | Hotspot |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- | ------- |
| Default (everywhere, including prose)           | Lifted: cream fill, ink outline, solid 1.5px ink offset shadow                          | `6 3`   |
| Clickable (links, buttons, tiles)               | Pressed: the same arrow moved 1.5px down and right onto where its shadow was, no shadow | `7 4`   |
| Left mouse button held (any click, drag-select) | Pressed                                                                                 | `7 4`   |

The press is the same move `Button` makes when clicked (it drops by its shadow
depth and the shadow disappears). Hovering something clickable looks like
pressing it, so the custom hand isn't needed. Holding the mouse button down
anywhere also presses, so dragging out a selection looks pressed too.

## Decisions

- **Ink, not primary green.** Every other offset shadow on the site is green
  (2px to 10px steps). The cursor is the exception, because the lifted and
  pressed states only work as a pair if both use the same colour. With a green
  lifted arrow pressing into an ink outline, the colour also changed on hover,
  and the drop alone read better.
- **The pressed state stays unfilled.** A green fill made the 24px arrow look
  like a dark blob. With the outline unchanged and only the shadow disappearing,
  the press reads more clearly.
- **No I-beam.** The site has no form fields, so the I-beam would only mark
  prose as selectable. Prototype I-beams with an offset shadow looked muddy,
  since a stem about 1.5px wide plus a 1.5px offset smears into one shape.
  Solid ones worked, but we didn't want a third glyph in the set. Cost:
  nothing signals that text can be selected before the first drag. The site's
  `::selection` styling still shows once selection starts.
- **Pressing while the button is held needs JavaScript.** CSS can't tell when
  the mouse is down over arbitrary text: `:active` doesn't reliably switch the
  cursor during a drag. A small hook toggles a `pressing` class on `<html>`
  between `pointerdown` and `pointerup`, and a CSS rule shows the pressed cursor
  while that class is on. In the prototype, Chrome switched the cursor during a
  drag-select. Safari and Firefox are untested. If a browser ignores the change
  mid-drag, it shows the lifted arrow, which is today's behaviour.
- **The press applies to every left click, not only over text.** Then
  "pressed" always means you're acting on something, and there's no list of
  text elements to keep in sync.
- **No listeners on touch-only devices.** The hook returns early unless
  `(hover: hover)` matches, the same check `Button.module.css` uses. It still
  ships in the `_app` bundle (a few hundred bytes). Loading it with a dynamic
  `import()` would add a request on desktop to save that on mobile. Inside the
  hook, `pointerType === "mouse"` ignores finger presses on touchscreen laptops.
- **Fallback is `default`, not `auto`.** If an SVG fails to load, `auto` would
  bring back the system I-beam over text, which contradicts the decision above.

- **The SVGs are inlined as data URIs in `globals.css`, not served from
  `public/`.** Browsers fetch a cursor image only the first time it's shown,
  and show the fallback cursor until it arrives. In Safari this showed as a
  flash of the system cursor on first hover and after page loads. The dev
  server sends `Cache-Control: max-age=0`, so it happened on every page load
  there. With the SVG inside the stylesheet, the image is available as soon as
  the CSS is. Cost: about 1KB more CSS, and the glyphs are edited as
  URL-encoded strings (`#` → `%23`, `<` → `%3C`, `>` → `%3E`).

## Known costs

Custom cursors don't scale with the OS pointer-size accessibility setting, so
users who enlarge their cursor get the 24px one. This is recorded in
[ACCESSIBILITY.md](../ACCESSIBILITY.md).
