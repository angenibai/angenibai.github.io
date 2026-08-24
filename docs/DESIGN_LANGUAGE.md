# Design Language

Notes on the visual identity of angeni.me, written after the code block/inline
code redesign (see `CODE_BLOCK_REDESIGN_PLAN.md`) surfaced the conventions
below across several rounds of changes. Read this before styling anything new
— the goal is to extend the existing system, not introduce a parallel one.

One-line description: a small, considered print publication — closer to a
retro Japanese magazine or hardcover book than a typical web app. Flat color
panels, hard keylines, warm paper tone, bold display type. Nothing here is
soft, blurred, or gradient-based.

## Color palette is closed — extend by shade, not by hue

Every color in use is a named token in `src/styles/globals.css:9-15`:

| Token | Value | Role |
|---|---|---|
| `--color-primary` | `#0D4B37` | deep green — body links, headings, borders |
| `--color-primary-darker` | `#093426` | code block panels |
| `--color-accent` | `#93748A` | dusty mauve — sparingly used accent |
| `--color-bg-white` | `#FAF8F0` | warm cream — page background |
| `--color-bg-yellow` | `#FFF4D7` | pale yellow — currently unused |
| `--color-black` | `#292929` | body text |

That's five hues, and green does most of the work. When a new UI element
needs a color — a syntax token, a scrollbar thumb, a pill background — the
answer should be a lighter/darker/more-transparent step *within* one of
these families, not a new hue. The syntax highlighting palette added in
`src/components/markdown/Code.tsx` (comment green, string mauve, keyword
mustard) and the code-block scrollbar thumb (`#EEC767`) are both deliberately
mustard/green/mauve variants, not arbitrary "nice" colors.

If you're tempted to reach for a generic bright accent (electric blue, hot
pink, neon green) — that's the tell you're about to break the palette.

## Opacity: hardcoded rgba, not `color-mix()`

The codebase doesn't use CSS `color-mix()` or alpha-channel custom
properties. Opacity is spelled out by hand against the token's known RGB
value: `rgba(13, 75, 55, 0.3)` (primary green at 30%, inline code background)
and `#0d4b378d` (primary green as an 8-digit hex, table borders in
`Post.module.css`). Follow this convention — it's a small thing, but it's
consistent everywhere it appears.

## Borders and keylines, not shadows

Structure is drawn with visible borders, not `box-shadow` or blur:
- `--border-width: 3px` on nav links (`Nav.module.css`)
- `1px solid #0d4b378d` hairlines on post tables
- Code blocks and post-body images are flat panels with a hard
  `border-radius` (`0.5rem`), no drop shadow

If something needs visual separation from what's around it, reach for a
border or a solid color-block boundary before a shadow.

## Typography pairing is the core signature

Three families, one job each — don't add a fourth without strong reason:
- **Work Sans** (`--font-work-sans`) — bold display headings, geometric sans
- **Newsreader** (`--font-newsreader`) — serif body text, old-style
- **IBM Plex Mono** (`--font-mono`) — code, inline and block

The mono face sits deliberately *between* the other two registers:
technical enough to read as code, but not so sterile it clashes with the
serif body. It's sized relative to body text (~0.85–0.9em of the paragraph
size) rather than at a fixed rem value, so it stays subordinate to prose
even though it's visually distinct — see `src/components/markdown/Code.tsx`
and `Post.module.css:58` for the reference sizing relationship.

## Where to be bold vs. where to be quiet

Prose stays calm: cream background, dark green/black text, generous line
height, no decoration. Boldness is spent in small, functional, isolated
spots — a scrollbar thumb, a syntax keyword, a nav button's border — never
smeared across a whole surface. Concretely: the code block scrollbar thumb
is a saturated mustard yellow sitting in a dark green track, deliberately
high-contrast and impossible to miss, while the code panel and the
surrounding page stay in the quiet green/cream register. That contrast is
intentional — don't soften a functional accent element into blending with
its surroundings just because it looks "loud" in isolation.

## Texture

The page background carries a subtle noise texture (`public/noise-2.svg`,
applied via `body { background-image }` in `globals.css`) — a print-grain
cue reinforcing the physical-publication feel. Flat digital gradients or
glassmorphism/blur effects would work against this; avoid them.
