---
status: approved
date: 2026-09-29
---

# Post body lane

Prototype: https://claude.ai/artifact/33pvWu5eJR3HB4pGRAVBGF (options A–D;
chosen = B on desktop, D on mobile).

## Problem

The post body (`.postContent` in `Post.module.css`) is a 640px lane with 2px
side rules that break at every image and code block: their wrappers bleed
past the lane and paint noise over the rules (`Image.module.css`,
`Code.module.css`). In the Easter post that happens every two or three
paragraphs, so the frame reads as short fragments. Beyond that:

- The lane is a separate box 2rem below the header, not joined to it.
- The body uses none of the site's bold register (3px borders, solid offset
  shadows on nav, buttons, Footer, BioPanel). Its heaviest line is 2px and
  its table lines are 1px translucent.
- White screenshots sit on the cream with no edge.
- h2 rules are `fit-content`, so their length depends on the heading.
- Body line height is 1.6rem on 1.2rem text (1.33), tight for a serif.

## Goals

- Desktop: one continuous frame from header to end of post that never breaks.
- Mobile: no side rules; a plain column that is easy to read at 375px.
- Body text line length stays about where it is (~68 characters).
- Media and tables use the site's existing border and shadow steps, no new ones.

## Non-goals

- **Code block styling.** Panel colour, radius, and shadow stay as they are;
  logged in `docs/FUTURE_WORK.md` to revisit. Only the wrapper's bleed goes,
  because the bleed is what breaks the lane.
- Post header layout, content, or the 1040px header breakpoint.
- Wide-table overflow on mobile.

## Behaviour

Desktop (> 640px), "unbroken lane" (option B):

- The header's top and bottom rules go from 2px to 3px.
- The lane hangs directly off the header's bottom rule (no gap), is 720px
  max, has 3px left, right, and bottom rules, and closes with the bottom rule
  at the end of the post.
- Padding grows with the width (~2.5rem sides), so the text measure stays
  about the same as today's 640px lane.
- Images sit inside the lane, square-cornered, with a 3px border and 5px
  offset shadow (the Footer's depth). Nothing bleeds through the rules.

Mobile (≤ 640px), "open column" (option D):

- No side or bottom lane rules and no side padding; the header keeps its 3px
  rules and the body starts below it with a gap, as today.
- Images are full column width, same border and shadow as desktop. `main` is
  90% wide (`Layout.module.css`), so the gutter is ≥ 18px even at 375px and
  the 5px shadow fits without being clipped by `body { overflow-x: hidden }`.
- A 3px rule closes the end of the post.

Both:

- Body text line height 1.85rem (~1.55).
- Links in the body are underlined: 2px, 35% green, full green on hover.
- h2s: green, full column width, 3px top and bottom rules.
- Tables: 2px green outer border, 1px 35% green inner lines, header row
  filled green with cream text (as BioPanel's header).
- The divider ornaments above and below images, and `figure::after`, go.
  The bordered frame now separates the image on its own.
- `--easter-screenshot-width` (560px) still caps those screenshots; it fits
  inside the 720px lane's padding.

## Options considered

All four are in the prototype:

| Option                                                | Why not chosen                                                                                |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| A · Current                                           | The problem above.                                                                            |
| B · Unbroken lane                                     | Chosen for desktop.                                                                           |
| C · Lifted sheet (whole body as a panel, 10px shadow) | Boldest, but a 10px shadow down a long post was heavier than wanted.                          |
| D · Open column                                       | Chosen for mobile: at 375px the side rules and padding cost too much width for what they add. |

## Components involved

- `src/styles/Post.module.css` (changed): header rule weight, lane
  frame/width/padding, the mobile breakpoint, readability pass, table,
  figure.
- `src/styles/components/Image.module.css` (changed): drop bleed and
  ornaments; add the bordered, shadowed frame.
- `src/styles/components/Code.module.css` (changed, wrapper only): drop the
  bleed and noise patch. `.codeBlock` untouched.
- `docs/DESIGN_LANGUAGE.md` (changed): post-body images are now bordered with
  a 5px shadow, not flat rounded panels; body links underlined.

## Open questions

- Breakpoint: 640px matches the nav's mobile switch. Between 640px and
  ~800px the lane is 90% wide, not 720px; padding still leaves a normal
  measure, so no separate step planned.
