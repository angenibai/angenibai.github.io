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

| Token                    | Value     | Role                                       |
| ------------------------ | --------- | ------------------------------------------ |
| `--color-primary`        | `#0D4B37` | deep green — body links, headings, borders |
| `--color-primary-darker` | `#093426` | code block panels                          |
| `--color-accent`         | `#93748A` | dusty mauve — sparingly used accent        |
| `--color-bg-white`       | `#FAF8F0` | warm cream — page background               |
| `--color-black`          | `#292929` | body text                                  |

That's five hues, and green does most of the work. When a new UI element
needs a color — a syntax token, a scrollbar thumb, a pill background — the
answer should be a lighter/darker/more-transparent step _within_ one of
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
and `rgba(13, 75, 55, 0.35)` (post table cell borders in `Post.module.css`).
Follow this convention — it's a small thing, but it's consistent everywhere
it appears.

## Borders and keylines; shadows only solid and offset

Structure is drawn with visible borders, not blur:

- `--border-width: 3px` on nav links, as the bottom rule of the desktop
  running head that pins once the masthead scrolls away (`Nav.module.css`),
  and on the post body lane, joined directly to the header on desktop
  (`Post.module.css`), and as the rule across the top of each year group on
  the posts list (`PostList.module.css`)
- `--divider-width: 2px`, including as a dotted dot leader that follows the
  last line of the title to the date on the posts list rows
  (`PostEntry.module.css`), and as post tables' outer border
- `1px solid rgba(13, 75, 55, 0.35)` hairlines on post table cells
- Code blocks are flat panels with a hard `border-radius` (`0.5rem`), no drop
  shadow (see `docs/FUTURE_WORK.md`); post-body images are square-cornered
  with a `3px` border and `5px` offset shadow (below)

The rule is _no blurred_ shadows, not no shadows. Solid zero-blur offset
shadows in the primary green are used deliberately, at a scale that tracks how
much the element should lift off the page: `2px` (Button), `3px` (ProjectGrid
inner tiles), `5px` (Footer, tiles, post-body images, and the mobile nav menu
box), `10px` (BioPanel, and the posts list hover panel).

If something needs visual separation from what's around it, reach for a border
or a solid color-block boundary before a shadow; if it needs to sit _above_ the
page, use a solid offset shadow at one of those steps.

## Typography pairing is the core signature

Three families, one job each — don't add a fourth without strong reason:

- **Work Sans** (`--font-work-sans`) — bold display headings, geometric sans
- **Newsreader** (`--font-newsreader`) — serif body text, old-style
- **IBM Plex Mono** (`--font-mono`) — code, inline and block

The mono face sits deliberately _between_ the other two registers:
technical enough to read as code, but not so sterile it clashes with the
serif body. It's sized relative to body text (~0.85–0.9em of the paragraph
size) rather than at a fixed rem value, so it stays subordinate to prose
even though it's visually distinct — see `src/components/markdown/Code.tsx`
and `Post.module.css:58` for the reference sizing relationship.

The posts list year labels are Newsreader 400 in ink: a section label in the
body serif, not a Work Sans heading.

Mono is **code-only**. An earlier version of the posts list used it for a
metadata register — letterspaced caps for a `No. 02` index and `FILED
UNDER`/`WITH` labels — and the list redesign
(`docs/design/posts-list-evolution.md`) removed it: dates there are Newsreader
now. Keep it that way unless there's a strong reason. Metadata set in the
serif reads as part of the page rather than as a second system bolted on.

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
