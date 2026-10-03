---
status: done
date: 2026-10-02
---

# Favicon and banner images

Two image files cost readers more bytes than the post page's JavaScript. The
JavaScript is covered in
[2026-10-02-build-time-markdown.md](2026-10-02-build-time-markdown.md). The
savings below are estimates from file sizes and trial conversions; neither
change has been measured with Lighthouse yet.

## Problem

- **The favicon.** `_app.tsx` links `/img/balloon-sloth/balloon-sloth.svg` as
  the icon on every page. The file is 316 kB, because it's an SVG wrapping two
  base64-encoded 900×900 PNGs. Lighthouse measured 232 kB of it downloaded on
  a first visit to any page. That's about twice the cost of the Markdown
  libraries (123.8 kB).
- **The easter-show banner.** `easter-show-value-banner.png` is a 1366 kB PNG
  at 1147×860, loaded with `priority` as the splash image.
  `optimize-images.sh` only touches images wider than 1600px, so it skipped
  this one. The page's largest-contentful-paint (when its main image appears)
  is 12.3 s, and this download is the likely cause (not confirmed: Lighthouse
  didn't report which element was the main image).

## Design

### Replace the favicon with small PNGs

Generate a 32×32 favicon (2 kB) and a 180×180 Apple touch icon (17 kB) from
`balloon-sloth-450.png`, and point `_app.tsx` at them. The sizes come from a
trial `sips` conversion. The 316 kB SVG stays in the repo, but no page links
it.

### Recompress the easter-show banner

Converting the banner to JPEG at quality 80 takes it from 1366 kB to 342 kB
(trial `sips` conversion). It's a photo-style banner, so JPEG artifacts
shouldn't be visible; check by eye before committing. Then update the post's
`splashImageSource`.

## Benefits (estimated)

- **Favicon:** about 213 kB less on a reader's first visit to any page. That
  is 232 kB served now, against 19 kB for both new icons together.
- **Banner:** about 1 MB less on the easter-show post. At Lighthouse's slow-4G
  speed (1.6 Mbps), 1 MB takes about 5 s to download, so the main image should
  appear several seconds sooner. Measure this after the change.

## Results (measured)

Lighthouse (performance only, mobile defaults) on the easter-show post, built
from the commit before and the commit after, each served locally with
`python3 -m http.server`.

Simulated throttling (Lighthouse's default model), median of 3 runs:

|                          | Before  | After          |
| ------------------------ | ------- | -------------- |
| Page weight              | 4.20 MB | 2.67 MB (-36%) |
| Largest contentful paint | 16.1 s  | 9.2 s          |
| First contentful paint   | 1.50 s  | 1.50 s         |
| Total blocking time      | 115 ms  | 100 ms         |
| Performance score        | 73-74   | 74             |

Real (DevTools) throttling, one run each:

|                          | Before | After  |
| ------------------------ | ------ | ------ |
| Largest contentful paint | 21.4 s | 4.0 s  |
| First contentful paint   | 2.55 s | 2.13 s |
| Performance score        | 60     | 79     |

- **The main image is the banner.** The after report names
  `easter-show-value-banner.jpg` (the splash `<img>`) as the
  largest-contentful-paint element, and its request is discoverable in the
  HTML and not lazy. So the banner download was the bottleneck this design
  guessed at.
- **Simulated throttling understates the gain.** The 9.2 s "after" figure comes
  from Lighthouse's estimate model; with real throttling the same page paints
  its main image in 4.0 s. The unthrottled observed time is 68 ms, so the
  remaining time is network throttling, not rendering. The real-throttling
  numbers are single runs, so treat the exact values as approximate.
- **Not measured:** the favicon's own effect. It isn't part of the page's
  paint metrics, and its saving (about 213 kB per first visit) shows up only
  in the page-weight total.

## Non-goals

- **The easter-show screenshots** (25 images, 9.4 MB), for two reasons:
  - they load lazily, so they don't hold up the banner;
  - JPEG only halves a screenshot (758 kB to 353 kB for
    `showbag-highlight-name.png`) and blurs its text, so they need a
    different approach.

## Components involved

- `src/pages/_app.tsx` (changed): favicon and Apple touch icon links.
- `public/img/balloon-sloth/` (new files): small favicon PNGs.
- `public/img/easter-show-value/` (new file): the banner as JPEG.
- `_data/posts/2023-04-08-easter-show-value.md` (changed): its
  `splashImageSource` points at the JPEG.

## Open questions

None. `optimize-images.sh` now also recompresses files over 300 KB that are
within the width limit, and its default width limit is 1200px (see
[the plan](../plan/2026-10-02-favicon-and-banner-images.md)).
