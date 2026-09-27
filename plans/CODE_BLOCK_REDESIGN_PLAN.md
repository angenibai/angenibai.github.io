# Redesign code block & inline code styling on post pages

## Context

The blog post reading experience (`src/pages/posts/[slug].tsx`) currently renders code
badly for two independent reasons:

1. `src/styles/components/Code.module.css` already defines a themed `.codeBlock` class
   (dark green background, cream text) but it is **dead code** — `src/components/markdown/Code.tsx`
   never applies it. What actually renders is the stock `prism` theme from
   `react-syntax-highlighter` — default blue/pink/orange syntax colors, near-white
   background, no font-family override — which looks like an unstyled widget dropped
   into an otherwise deliberately-designed page (Work Sans headings, Newsreader serif body).
2. Inline code (single-backtick Markdown) has **zero CSS anywhere** in the codebase —
   it falls through to a plain `<code>` tag with no background, sizing, or font override,
   so it renders in the browser's default monospace font at full body size, jarringly
   different from the surrounding serif text.

There's also no monospace webfont loaded at all (only Work Sans + Newsreader are), and
long unwrapped lines in code blocks currently overflow with `overflow: scroll` and no
visible scroll affordance — confirmed live on `/posts/2023-04-08-easter-show-value`,
where a comment line runs off the right edge of the block.

Goal: give code (block + inline) an intentional, on-brand treatment — dark green panel
for blocks (reviving the intent of the dead CSS), a warm pill for inline code, a proper
paired monospace font, and wrapping instead of horizontal scroll.

User-confirmed direction (via question, not open for re-litigation):

- Code blocks: dark green panel, using `--color-primary-darker`.
- Font: IBM Plex Mono, for both inline and block code.
- Smaller code font-size relative to body text (body is `1.2rem` Newsreader in
  `.postContent p`, per `src/styles/Post.module.css:58` — mono reads bigger at the same
  nominal size, target ~0.85–0.9em of that).
- `white-space: pre-wrap` instead of horizontal scroll, with a sane fallback for
  genuinely unbreakable long tokens (e.g. URL literals).
- A new syntax token color palette extending the site's existing green/mauve/cream hue
  families, rather than Prism's default blue/pink/orange.

Technical approach and exact colors below were independently verified against the
installed `react-syntax-highlighter` source and WCAG contrast ratios (Plan-agent
validation pass) — see rationale inline.

## How `react-syntax-highlighter`'s `style` prop actually works (important gotcha)

The `style` object passed to `PrismLight` is **not CSS** — it's a JS object keyed by
token names (`keyword`, `string`, `comment`, etc., no leading dot) plus two structural
keys, `code[class*="language-"]` and `pre[class*="language-"]`. These get applied as
**inline `style` attributes** on the rendered elements — full stop, no CSS class on
those elements can ever override them, regardless of specificity. Concretely:

- Anything the theme object sets (`color`, `background`, `fontFamily`, `fontSize`,
  `whiteSpace`) must be set **in the theme object itself**, not via `Code.module.css`.
- `Code.module.css` (`.codeBlock`) should only carry things the theme object doesn't
  cover: `padding`, `border-radius`, `margin-bottom`, and an `overflow-wrap` fallback.
- The stock `prism` theme's `code[class*="language-"]` key sets `whiteSpace: "pre"` and
  `wordBreak`/`wordWrap: "normal"` — if the replacement object still carries those, they
  silently win over anything set elsewhere. The replacement must explicitly set
  `whiteSpace: 'pre-wrap'` in both the `code[...]` and `pre[...]` keys, and simply omit
  `wordBreak`/`wordWrap` so `Code.module.css`'s `overflow-wrap: anywhere` (on `.codeBlock code`,
  the actual rendered `<code>` tag, since `PreTag="div"`) isn't shadowed. Keep `tabSize: 4`
  from the stock theme.
- `customStyle` (a `SyntaxHighlighter` prop) is real but only merges onto the outer
  `PreTag` — it can't reach the `<code>` tag or token spans, so it's not a substitute for
  a full replacement theme object here.

## Changes

### 1. `src/pages/_app.tsx` — load IBM Plex Mono

Same pattern as the existing `Work_Sans`/`Newsreader` imports. IBM Plex Mono is **not** a
variable font in Google Fonts, so (unlike the other two) it needs an explicit `weight`:

```ts
import { IBM_Plex_Mono } from "next/font/google";

const ibm_plex_mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-mono",
});
```

Append `ibm_plex_mono.variable` to the existing `className` string on `<main>`.

### 2. `src/components/markdown/Code.tsx` — replace the theme object, wire up `.codeBlock`, style inline code

- Replace the `prism` import with a hand-authored theme object (same shape, full
  replacement rather than spreading over `prism`, since token-level entries need new
  colors anyway). Define it as a local `const` near the top of the file — single
  consumer, no need for a separate file.
- Structural keys:
  - `code[class*="language-"]` / `pre[class*="language-"]`: `background: "transparent"`
    (the panel bg comes from `.codeBlock` via className), `color: "#FAF8F0"`,
    `fontFamily: "var(--font-mono)"`, `fontSize: "0.85em"`, `whiteSpace: "pre-wrap"`,
    `tabSize: 4`. Omit `wordBreak`/`wordWrap` (see gotcha above).
  - Token colors (validated for ≥4.5:1 contrast against `#093426`, and checked pairwise
    for distinguishability):
    | token(s)                  | color     |
    | ------------------------- | --------- |
    | plain text / variable     | `#FAF8F0` |
    | punctuation, operator     | `#D9D2C4` |
    | comment, prolog           | `#79A08F` |
    | keyword, atrule           | `#E3B23C` |
    | string, char, attr-value  | `#D9B8CE` |
    | function, class-name      | `#8FCDB0` |
    | number, boolean, constant | `#E08E6D` |
- Apply `styles.codeBlock` on the `SyntaxHighlighter` `className` (combine with the
  existing language `className`, e.g. `` `${styles.codeBlock} ${className}` ``).
- In `Code.module.css`, remove the now-inert `.codeBlock code { color: ... }` rule
  (color is set in the theme object now) and add `.codeBlock code { overflow-wrap: anywhere; }`
  as the fallback for unbreakable long tokens. Update `.codeBlock` background to
  `var(--color-primary-darker)`, add `border-radius: 0.5rem`, increase `padding` slightly
  (e.g. `1rem`), keep `margin-bottom: 1rem`. Drop the old `overflow: scroll` — `pre-wrap`
  handles normal cases, `overflow-wrap: anywhere` handles the rest.
- Inline code branch (the `<code className={className} {...props}>` fallback when not a
  fenced block): add a new `.inlineCode` class, applied as
  ``className={`${styles.inlineCode} ${className || ""}`}``.

### 3. `src/styles/components/Code.module.css` — `.inlineCode`

```css
.inlineCode {
  background-color: #f0dfa8;
  border: 1px solid rgba(13, 75, 55, 0.15);
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: 0.85em;
  padding: 0.15em 0.4em;
  border-radius: 0.3em;
}
```

Rationale: the site already has an unused `--color-bg-yellow: #FFF4D7`, but validated
contrast against the `#FAF8F0` page background was only ~1.03 — effectively invisible as
a pill. `#F0DFA8` (deepened) plus a subtle border gives it real definition while staying
in the same warm-cream hue family. Text color reuses the existing `--color-primary` (dark
green on warm yellow, ~9:1 contrast).

### 4. No changes needed to `globals.css`

New colors are single-consumer (only used inside `Code.tsx`/`Code.module.css`), so they're
kept as local values there rather than added to the global `:root` palette — consistent
with not growing global tokens for narrow-purpose one-off colors.

## Verification

1. `npm run build` — confirm no type/lint errors from the new font import or theme object
   (the existing `as any` cast pattern on the `style` prop, already in place from the
   earlier build-fix pass, should still be needed/sufficient).
2. `npm run dev`, open `/posts/2023-04-08-easter-show-value` in a browser (this post has
   both a `def fetch_data():` block with a long comment line that previously overflowed,
   and inline code like `` `requests` ``, `` `get()` ``):
   - Code blocks render as a dark green rounded panel, IBM Plex Mono, visibly smaller
     than body text, with distinguishable syntax colors.
   - Inline code renders as a pill, clearly distinct from the cream page background.
   - Long lines don't wrap; the code panel scrolls horizontally instead, with a
     themed scrollbar (see below — this supersedes the original pre-wrap decision).

## Status

Implemented. **Note:** the `white-space: pre-wrap` decision in the Context/goal
above (lines 26, 34) was later superseded after checking real mobile rendering —
see the last bullet under "Follow-up refinements" below.

One correction to the plan surfaced during implementation: setting
`background: "transparent"` on the theme's `code[...]`/`pre[...]` keys (as
originally written above) doesn't let `.codeBlock`'s CSS background show through —
it's an inline style on the same element, so it wins over the CSS class and blanks
the panel entirely. Fixed by omitting `background` (and `padding`/`margin`) from
the theme object altogether, leaving those to `Code.module.css` as intended.

Follow-up refinements past the original plan, done in the same pass:

- `.postContent` max-width narrowed 800px → 640px, and `.codeBlock` given a
  24px bleed past the text column on each side (`margin: 0 -1.5rem 1rem` +
  matching horizontal padding) — both taken from measuring
  fireship.dev's post layout.
- Inline code recolored from the warm-yellow pill to a translucent green pill
  (`rgba(13, 75, 55, 0.3)` bg / `--color-primary-darker` text) to match the
  code panel's hue family.
- `keyword`/`atrule` token color changed from `#E3B23C` to `#EEC767`.
- `white-space` reverted from `pre-wrap` back to `pre` after checking mobile
  rendering: wrapping made narrow-viewport code cramped and hard to scan.
  `.codeBlock` now scrolls horizontally (`overflow-x: auto`) instead, with a
  themed scrollbar — mustard-yellow thumb (`#EEC767`, matching the keyword
  token color) on a `--color-primary` track, square-ish corners and a solid
  border rather than a default thin rounded bar, via `::-webkit-scrollbar-*`
  and Firefox's `scrollbar-color`. iOS Safari doesn't support scrollbar
  styling on overflow containers at all, so it falls back to the native
  overlay bar there regardless.
