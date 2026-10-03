---
status: done
date: 2026-09-27
---

# Accessibility P1

Triage of what's left in [docs/ACCESSIBILITY.md](../ACCESSIBILITY.md) after
[accessibility-p0.md](accessibility-p0.md) fixed Sections 1–2. Each remaining
finding was re-checked against the current code (2026-09-27), not just the
audit text. Nothing left is as severe as what P0 fixed. The biggest remaining
gap is verification, not code.

## Step zero: VoiceOver pass

Nothing has been checked with a real screen reader yet. The rebuilt
`<dialog>` on `/projects` has the most platform behaviour and the least static
verifiability. A ~20 min VoiceOver pass (⌘F5) over `/`, `/projects`, `/posts`
and one post confirms P0 and the heading/landmark findings below before more
code lands.

## Items

**Do** = this batch. **Later** = worth it, medium effort, after the batch.
**Separate** = needs its own design. **Skip** = not worth it now.

| #   | Item                                                                                                               | Verdict  | Effort                                                                                            | Why                                                                                                                                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Enable `plugin:jsx-a11y/recommended` in `.eslintrc.json`                                                           | Do       | ~5 min + fixing what it flags. Already in `node_modules` via `eslint-config-next`, so no install. | Would have caught every P0 bug automatically. The only item that prevents new problems instead of fixing old ones.                                                                                                                                                                                 |
| 2   | Home page headings: `index.tsx:13` `<h3>` → `<h1>`; `BioPanel.tsx:73,91` `h4`/`h5` → `h2`/`h3`                     | Do       | ~15 min. Swap tags and the `> h4` / `> h5` selectors in `BioPanel.module.css`; pin BioPanel font. | `/` is the most-visited page and has no `h1`. Screen reader users navigate by headings. Sizes come from classes, not tags, so the `h1` swap is visually identical. See heading-levels note below for the BioPanel part.                                                                            |
| 3   | Underline links in post content (`.postContent a`) and the 404 link                                                | Do       | ~10 min. Copy `ProjectModal.module.css:189`, which already does this.                             | WCAG 1.4.1 failure: link green vs body black is 1.4:1, so colour alone doesn't mark links. On `/404` the only way off the page is an inline link that doesn't look like one. BioPanel links stay un-underlined on purpose — they're an easter egg (`.sneakyLink`).                                 |
| 4   | `rel="noopener"` on `ButtonLink.tsx:59`, `Footer.tsx:15,22`, `BioPanel.tsx:45`, and anchors in `projects.yaml`     | Do       | ~10 min, mechanical.                                                                              | Consistency only, not an accessibility fix. `noopener` only, no `noreferrer`: see the note below.                                                                                                                                                                                                  |
| 5   | Reduced-motion gate on `TRACK_CURSOR`: add `and (prefers-reduced-motion: no-preference)` to `usePostPreview.ts:25` | Do       | 1 line.                                                                                           | Largest motion on the site that ignores the reduced-motion setting.                                                                                                                                                                                                                                |
| 6   | Code blocks: `PreTag="div"` → `"pre"` and `tabIndex={0}` in `Code.tsx:85`                                          | Do       | ~15 min. Check styles don't depend on it being a `div`.                                           | Keyboard users currently can't scroll a horizontally overflowing code block, and code isn't announced as preformatted.                                                                                                                                                                             |
| 7   | Designed `:focus-visible` ring                                                                                     | Separate | Needs design: how focus looks on buttons, tiles, links and the `.selected` nav item.              | The browser default still works, so nothing is broken meanwhile. Makes focus consistent and on-palette per [DESIGN_LANGUAGE.md](../DESIGN_LANGUAGE.md).                                                                                                                                            |
| 8   | Lists: `ul`/`dl` for post list, project grid, nav, bio label/value pairs, modal links                              | Later    | 30–60 min. Changing markup can break grid and flex CSS.                                           | Screen readers would announce item counts. Moderate gain.                                                                                                                                                                                                                                          |
| 9   | `PostEntry.tsx`: `<h2>` inside `<span>`, whole row is one link, no `<time datetime>`                               | Later    | ~30 min.                                                                                          | The link's accessible name is title + date + blurb run together — the part screen reader users notice most.                                                                                                                                                                                        |
| 10  | Custom cursor (kept): hotspot `8 8` → `6 3`; `cursor: text` on prose                                               | Separate | Needs a custom pointer and I-beam drawn to match the arrow.                                       | Audit is out of date: cursor is committed, hotspot moved from `12 12`. Arrow tip in `public/arrowhead.svg` is at ~`(5.5, 3)`, so clicks still land ~5px low. Set on `:root`, so prose lost its I-beam. Deferred to a full custom cursor set: [FUTURE_WORK.md](../FUTURE_WORK.md#animation-polish). |
| 11  | Error branch in `[slug].tsx:26` renders outside `PageLayout`                                                       | Skip     | ~5 min.                                                                                           | `getStaticPaths` uses `fallback: false`, so a missing post gets the 404 page and this branch likely never renders. Fix only if already editing that file.                                                                                                                                          |
| 12  | Forced-colors / `prefers-contrast` handling                                                                        | Skip     | Unknown; hard to test without Windows High Contrast.                                              | Borders survive, so layout holds; only the pressed-button state is lost.                                                                                                                                                                                                                           |
| 13  | Marginal contrast: comment green, table hairline, modal scrim                                                      | Skip     | Small, but touches the palette.                                                                   | Comment green passes at 4.73:1, the hairline is arguably decorative, the scrim is a design choice. Revisit if the palette changes.                                                                                                                                                                 |
| 14  | Text resizing: modal `×` at `54px`, px widths and media queries                                                    | Skip     | `×` to `rem` is quick; converting widths and queries to `em` is large.                            | Only helps users who raise their default font size instead of zooming.                                                                                                                                                                                                                             |
| 15  | Modal close animation in Safari/Firefox                                                                            | Skip     | None.                                                                                             | Already in [FUTURE_WORK.md](../FUTURE_WORK.md#animation-polish); fixes itself once browsers ship `overlay`.                                                                                                                                                                                        |

## Notes

### #2 — heading levels

Heading tags carry structure; size comes from classes. Site convention is
already: one `h1` per page (`.pageheading` on `/posts` and `/projects`, the
post title on posts), and post bodies start at `##`.

On `/`, the welcome line becomes the `h1`. BioPanel sits directly under it, so
its heading should be `h2` and its section titles `h3`. `h3`/`h4` would skip a
level (`h1` → `h3`), which is the thing this item is fixing.

Visual catch: `globals.css:55-61` styles `h1, h2, h3` as Work Sans 800. BioPanel's
current `h4`/`h5` don't match that rule, so they render in Newsreader (inherited
from `div`). Moving them to `h2`/`h3` would switch them to Work Sans unless
`BioPanel.module.css` pins `font-family` and `font-weight` back.

Decision: `h2`/`h3`, with the rendered display kept identical to today.

### #4 — what `noopener` / `noreferrer` do

- **`noopener`**: a page opened with `target="_blank"` normally gets
  `window.opener`, a handle to your tab, and could use it to redirect your
  tab (e.g. to a phishing copy). `noopener` sets it to `null`. Since 2021,
  Chrome, Safari and Firefox apply `noopener` to every `target="_blank"` link
  by default, so adding it changes nothing in current browsers.
- **`noreferrer`**: stops the browser sending the `Referer` header, so GitHub,
  LinkedIn etc. can't see the visitor came from angeni.me. This one does change
  behaviour — your site stops showing up in their referrer analytics.

Neither affects accessibility. The accessibility part of `target="_blank"` is
that nothing tells users a new tab will open, which this item doesn't fix.
Decision: add `noopener` only. It makes the intent explicit at no cost;
`noreferrer` is left off so referrer analytics keep working.
`ProjectModal.tsx` keeps its existing `noopener noreferrer`.

## Proposed order

1. VoiceOver pass.
2. The **Do** items, one commit each, updating `ACCESSIBILITY.md` in the same
   commit (as in P0). #1 first so jsx-a11y can flag anything the rest miss.
3. **Later** items, if still wanted after 1–2. #7 gets its own design doc.
