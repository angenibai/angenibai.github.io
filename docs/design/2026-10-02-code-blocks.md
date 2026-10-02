---
status: approved
date: 2026-10-02
---

# Code blocks

Chosen from a clickable prototype (desktop post lane and 375px phone):
<https://claude.ai/artifact/RaPXTy1xegv2b9JySYGR8R>. Supersedes the look in
`code-block-styling.md`; that doc's notes on how `react-syntax-highlighter`
applies styles still hold.

## Problem

- The syntax palette leans on mustard and mauve, which no longer suit the
  site.
- The mustard-on-green scrollbar doesn't match the page and project-modal
  scrollbars (thin, primary green at 20%, transparent track; see the
  `scrollbars` branch).
- Code renders at about 12.7px, not the intended ~15px. `Code.tsx` sets
  `fontSize: "0.85em"` on both `pre[class*="language-"]` and
  `code[class*="language-"]`, and the `code` sits inside the `pre`, so the
  reduction applies twice.

## Non-goals

- Inline code (`.inlineCode`) is unchanged.
- No new languages, line numbers, copy button, or line wrapping. Blocks keep
  scrolling sideways (`code-block-styling.md` explains why).

## Design

### Block: captioned

- A square block (no `border-radius`) in a 3px `--color-primary` frame.
- A strip across the top names the language. It has a cream background, green
  text in Work Sans 600 at about 0.72rem, uppercase with 0.1em letter-spacing,
  and a 3px green rule underneath.
- The label is the fence language (` ```python ` gives "PYTHON"), which
  `Code.tsx` already parses into `match[1]`.
- The strip is an opaque cream surface, so it gets the `noise-2.svg` grain,
  as the nav does. The prototype strip didn't have it.

### Panel: ink at 90%

- The background is `rgba(41, 41, 41, 0.9)`: `--color-black` at 90%, so the
  page's cream and grain show through faintly.
- Over cream, this reads as about `#3E3E3D`. The contrast figures below are
  measured against that.
- No new hue is added; it uses the existing ink token. `--color-primary-darker`
  loses its "code block panels" role.

### Syntax: duotone

The text is cream, separated by weight, italic and opacity. Literals get one
pale green.

| Tokens                                                         | Colour                      | Style  | Contrast |
| -------------------------------------------------------------- | --------------------------- | ------ | -------- |
| plain text, variables, functions, class names                  | `#FAF8F0`                   |        | 10.1:1   |
| keywords, at-rules                                             | `#FAF8F0`                   | 600    | 10.1:1   |
| strings, chars, attribute values, numbers, booleans, constants | `#9FD3BA`                   |        | 6.4:1    |
| punctuation, operators                                         | `rgba(250, 248, 240, 0.55)` |        | 4.3:1    |
| comments                                                       | `rgba(250, 248, 240, 0.45)` | italic | 3.4:1    |

`#9FD3BA` is a light step of the green family, so it stays inside the closed
palette. Bold keywords and italic comments need IBM Plex Mono 600 and 400
italic. `_app.tsx` loads only 400 and 500 today, so two font files are added.

### Size: 13.5px

- Set `0.767em` once, on the `pre`. That is 13.5px against the post `div`'s
  1.1rem (17.6px).
- The `code` element inherits the size (`1em`).
- The size is relative rather than `0.84375rem`, so code stays tied to the
  prose size (see `DESIGN_LANGUAGE.md`).

### Scrollbar

- `scrollbar-width: thin` and
  `scrollbar-color: rgba(250, 248, 240, 0.25) transparent`. This is the page
  bar's approach, with cream as the thumb colour because the panel is dark.
- The `::-webkit-scrollbar` rules are removed. Chrome 121+ ignores them once
  the standard properties are set, so in current Chrome the "chunky ribbon"
  already isn't drawn.
- Safari ignores `scrollbar-color` and keeps its default bar (as noted in the
  scrollbars plan). iOS doesn't style overflow scrollbars at all.

## Components touched

- `src/components/markdown/Code.tsx`: the theme object (token colours,
  weights, italic, single font size) and the caption strip markup.
- `src/styles/components/Code.module.css`: the frame, strip, panel and
  scrollbar.
- `src/pages/_app.tsx`: the Plex Mono weights and style.
- `docs/DESIGN_LANGUAGE.md`:
  - The palette table's `--color-primary-darker` role.
  - The mustard/mauve syntax and scrollbar mentions.
  - The "bold vs. quiet" paragraph, which holds up the mustard thumb as its
    example of a functional accent. The new bar is deliberately quiet, so that
    example needs replacing.

## Open questions

- **Comment and punctuation contrast.** Both fall under WCAG AA's 4.5:1 for
  text: comments at 3.4:1 and punctuation at 4.3:1. Raising both to 60%
  opacity gives 4.8:1. The 45% and 55% values were chosen by eye in the
  prototype, so this needs a decision.
- **Fences with no language.** Either hide the strip or show "TEXT".
  Recommendation: hide it. All 10 fences in current posts are ` ```python `,
  so this only affects future posts.
- **Scrollbar thumb visibility.** The 25% thumb is 2.0:1 against the panel.
  Scrollbars aren't text, but WCAG's 3:1 for non-text UI would need about 35%.
  It matches the page bar, which is just as faint.
