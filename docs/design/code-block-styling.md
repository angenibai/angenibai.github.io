---
status: done
---

# Code block & inline code styling

The code block look described here is superseded by
[`2026-10-02-code-blocks.md`](2026-10-02-code-blocks.md). The notes on how
`react-syntax-highlighter` applies styles still hold.

Rationale from giving post-page code (block and inline) an on-brand
treatment: dark green panel for blocks, IBM Plex Mono, a warm pill for inline
code.

## Design decisions during implementation

### `react-syntax-highlighter`'s `style` prop is not CSS

The theme object passed to `PrismLight` is a JS object keyed by token name
(plus two structural keys, `code[class*="language-"]` and
`pre[class*="language-"]`) that gets applied as **inline `style` attributes**
on the rendered elements. No CSS class can ever override an inline style,
regardless of specificity — so anything the theme object sets (`color`,
`background`, `fontFamily`, `fontSize`, `whiteSpace`) has to live in the theme
object itself, and `Code.module.css` can only carry what the theme object
doesn't touch (padding, border-radius, margin, an `overflow-wrap` fallback).

Setting `background: "transparent"` in the theme object didn't work: it was
meant to let `.codeBlock`'s CSS background show through, but the inline style
always wins over the CSS class, so it blanked the panel instead. Fixed by
omitting `background`/`padding`/`margin` from the theme object entirely,
leaving those to the CSS module — the original intent.

### `white-space: pre-wrap` — reverted after checking mobile

`.codeBlock` scrolls horizontally instead of wrapping, because wrapping made
narrow-viewport code cramped and hard to scan once checked against real
mobile rendering. That's a reversal: the original direction — wrapping
instead of horizontal scroll, to avoid an affordance-less scrollbar — was
explicitly user-confirmed and marked "not open for re-litigation" in the
plan, and had already shipped before the mobile check reversed it. The
scrollbar itself is themed (mustard-yellow thumb matching the keyword token
color, square-ish corners, solid border) via `::-webkit-scrollbar-*` and
Firefox's `scrollbar-color`; iOS Safari doesn't support scrollbar styling on
overflow containers, so it falls back to the native overlay bar there
regardless.

The lesson worth keeping: a direction confirmed against a mockup or a desktop
browser can still fail on real content at a real viewport width, and finding
that out is a legitimate reason to depart from an otherwise-settled decision.
