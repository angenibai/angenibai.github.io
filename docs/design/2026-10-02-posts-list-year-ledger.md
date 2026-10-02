---
status: approved
date: 2026-10-02
---

# Posts list: year ledger

Prototype: https://claude.ai/artifact/1HaD5WXBpKX7d4JEvnTgvZ (chosen = B · Year
ledger, rule dotted 2px, placement "follows last line", year Newsreader 400
ink, date `31 · 07`).

## Problem

Each `/posts` row is one `flex-wrap` line holding the title, the dotted
leader and the date (`PostEntry.module.css`, `.line`). Where it wraps depends
on each title's length, so at one width (around 600px) rows break three
different ways: one stays on a single line, one drops the date below the
title, and one drops the leader and date together. It only looks right on
wide desktop and on narrow phones.

## Goals

- At any width, every row uses the same layout. A change of layout happens
  at one fixed breakpoint, for all rows at once, never per title.
- The date never wraps under the title. A long title wraps inside its own
  column, and the dotted leader runs from the end of its last line to the
  date.
- Keep the Receipt's character: green Work Sans titles, italic serif blurb,
  2px dotted leader, hover panel unchanged.

## Non-goals

- The hover preview panel (`PostPreviewPanel`, `usePostPreview`): it still
  attaches per row and is untouched.
- Tags, filtering, or pagination.

## Chosen direction

Posts are grouped by year. Each year group is a two-column grid with a 3px
solid green rule across its top: the year in a 5rem left column, the year's
posts in the right column.

- **Year label:** Newsreader 400, ink (`--color-black`), 1.5rem, tabular
  figures. Being in the body serif and ink makes it a section label rather
  than another green title.
- **Row:** a two-column grid, title (`minmax(0, 1fr)`) and date (`auto`),
  aligned on the title's last baseline. The date column can't wrap, so a
  long title wraps within its own column.
- **Leader:** a zero-width-advance pseudo-element after the title text
  (`width: W; margin-right: -W`), with a 2px dotted bottom border, clipped by
  the title cell's `overflow: hidden`. Because it adds no width to the line,
  it never forces a line break; it always starts where the last line of the
  title ends. A mask leaves a small gap after the last word. The title cell
  has about 2rem of right padding: text wraps before it, but the leader
  still paints into it, so a title that fills its column still gets 2rem of
  dots. That keeps the current design's 2rem minimum leader. Without it, a
  title exactly as wide as its column shows no dots, which happened in the
  Safari test.
- **Date:** day first, then month, `DD · MM` (`31 · 07`). The year group
  supplies the year. Tabular figures so the column lines up.
- **Narrow (≤ 560px viewport):** the year moves above its group (smaller,
  same rule) and titles drop to 1.3rem. One media query, matching the
  site's one-static-breakpoint-per-component convention. The prototype used
  520px for the title size and 560px for the year; this doc unifies them at
  560px.

Spacing from the prototype: 2.5rem between year groups, 1.5rem between rows
within a group, 1.25rem between the year column and the posts.

**Pinned posts** go in their own group above the years: same grid and 3px
rule, no year label, the existing square pin marker kept. Within the year
groups, posts stay in reverse date order. No post is pinned today, so the
group only renders when one is.

### Browser support

Checked in Safari 26.6.2 with a test page using the leader and grid rules
from this design:

- `CSS.supports("align-items", "last baseline")` is true.
- On a two-line title the date sits on the second line: its bottom is 5px
  above the title's bottom, and its top is 43px below the title's top.
- The leader adds no height, and a title that just fits stays on one line.
- `mask-image` is supported.

MDN's compatibility data lists `last baseline` for flexbox only (Safari and
iOS 16.2, Chrome 108, Firefox 52) and has no grid entry, so support in older
Safari versions isn't known. A browser that rejects the value drops the
declaration, and the date sits level with the title's first line. Phone
widths were checked by eye in phone-sized viewports and look fine.

### Options considered

| Option                          | Verdict   | Why                                                                          |
| ------------------------------- | --------- | ---------------------------------------------------------------------------- |
| A · Flat list, last-line leader | Runner-up | Same fix without grouping; the full date column leaves titles less room      |
| B · Year ledger                 | Chosen    | Shorter dates free up width; grouping suits an archive of a few posts a year |
| C · Kicker (date above title)   | Rejected  | One layout everywhere, but loses the table-of-contents leader                |
| D · Margin date (left column)   | Rejected  | No leader; reads less like the current design                                |

Rule styles tried: hairline 1px, solid 2px and 3px, none. Placements tried:
centred beside the title, a fixed short dash before the date, a full-width
under-rule. The 2px dotted leader following the last line was kept.

## Components involved

- `src/pages/posts/index.tsx` (changed): splits pinned posts into their own
  group, groups the rest by year, and renders a group around the existing
  rows.
- `src/styles/PostList.module.css` (changed): year group grid, year label,
  3px rule, narrow-width stacking.
- `src/components/PostEntry.tsx` (changed): `formatDate` gives `DD · MM`; the
  date gets a `<time dateTime>` so assistive tech gets the full date rather
  than "31 · 07".
- `src/styles/components/PostEntry.module.css` (changed): `.line` becomes the
  two-column grid, the leader span becomes a pseudo-element on the title.
- `docs/DESIGN_LANGUAGE.md` (changed): note the year rule and the year
  label's serif/ink treatment under borders and typography.

## Accessibility

Year labels become `h2` and post titles `h3`, so screen reader users can jump
between years. Visual styles come from the module classes, so the change of
heading level doesn't change the look.

## Open questions

None.
