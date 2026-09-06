# Image optimization

## Problem

Images noticeably lag on load. `public/img` was 53MB across 119 files (97
PNGs, ~92% of the bytes), with the largest offenders being raw macOS Retina
screenshots embedded directly in blog posts — e.g.
`easter-show-value/showbag-*.png` (3164×2062, 1.5–2.0MB each) and
`summarise-my-lecture/sml-*.png` (several 1.4–2.6MB) — served at native
resolution via plain `<img>` tags with no resizing. Already flagged in
`docs/FUTURE_WORK.md`.

## Deploy-target constraint

The site's eventual deploy target is undecided but GitHub Pages (static
export) is likely. That mode requires `images.unoptimized: true` (or a
custom loader) since there's no server to run Next's on-the-fly image
optimizer — so `next/image`'s runtime resizing/format-negotiation can't be
relied on either way. This shaped the whole approach: **the real fix is
pre-shrinking the source files**, and `next/image` is only worth adopting
where it's cheap to do correctly (forced width/height → no layout shift,
native lazy-loading).

## What was built

1. **`scripts/optimize-images.sh`** (`npm run optimize-images`) — bash,
   using ImageMagick (`magick`/`identify`, already present via Homebrew on
   this machine, no new dependency). Resizes any `.png`/`.jpg`/`.jpeg` wider
   than `--max-width` (default 1600px = 2x a ~800px content column) down to
   that width, strips metadata, and recompresses
   (`png:compression-level=9` for PNG — lossless, just max encoder effort;
   `-quality 82` for JPEG — standard "visually lossless" default). Filenames
   and extensions are never changed, so no `_data/projects.yaml` or
   `_data/posts/*.md` reference needs updating. Already-small images are
   skipped, making reruns idempotent. Supports `--dry-run`.

   Verified via `npm run optimize-images -- --dry-run`: correctly flagged
   all 50 oversized files (matching the known large offenders — `sml-21.png`,
   all `showbag-highlight-*.png`, `who-guessed-play.png`, the `diy-reacts`
   screenshots) and correctly skipped everything already ≤1600px.

   **Not run for real in the planning/implementation session** — actually
   shrinking the committed images is a separate, deliberate step to run
   later, not bundled into this change.

2. **`next.config.js`**: added `images: { unoptimized: true }`, anticipating
   the likely GitHub Pages static export.

3. **Splash image → `next/image`** (`src/pages/posts/[slug].tsx`): added
   `getImageDimensions(srcPath)` to `src/lib/api.ts` (new `image-size`
   dependency), reading intrinsic width/height from the file under
   `public/` at build time. `getStaticProps` calls it for
   `metadata.splashImageSource` and passes the result as
   `splashImageDimensions`. The component renders `next/image` with those
   real dimensions and `priority` (it's above-the-fold, so eager-loading
   beats lazy-loading for LCP) when dimensions were found, falling back to
   the original plain `<img loading="lazy">` if the read failed (bad path,
   missing file) — keeps the build resilient rather than throwing.

   `image-size` v2's `imageSize()` takes a `Uint8Array`, not a file path —
   read via `fs.readFileSync` first, same pattern as the rest of `api.ts`.

## Deliberately deferred

Swapping the ~70 inline markdown-body screenshots
(`src/components/markdown/Image.tsx`) to `next/image` was scoped and then
cut after discussion. Doing it correctly needs real dimensions for
arbitrary markdown images, which means regex-scanning raw markdown content
for `![alt](src)` and `<img src="...">` (a second, best-effort parser
alongside `react-markdown`'s own — any syntax variant it misses silently
falls back, so `next/image` coverage there would be best-effort, not
guaranteed) and threading a `{src: {width,height}}` map through the
`ReactMarkdown` `img` override. That's real complexity added to
`api.ts`-style build code for a benefit (layout-shift prevention) that's
separate from the actual complaint (load lag) — which the compression
script fixes regardless of which tag renders the image. Left as plain
`<img loading="lazy">`, unchanged. See `docs/FUTURE_WORK.md` for the
pointer — don't re-propose this as an oversight without a concrete reason
(e.g. layout shift on those images becomes an actual complaint).

## Verification performed

- `npm run build` — succeeds, no type/lint errors.
- `npm run optimize-images -- --dry-run` — reported the expected 50 files
  with plausible projected savings; correctly idempotent (skips anything
  ≤1600px).

Not performed in this session (by design): running the resize for real,
and a dev-server visual pass on live post pages.
