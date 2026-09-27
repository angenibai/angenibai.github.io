---
status: done
---

# Image optimization

Rationale from fixing image load lag (`public/img` was 53MB across 119 files,
mostly raw Retina screenshots served at native resolution).

## Design decisions during implementation

### The deploy target decided the approach

The real fix is pre-shrinking source files (`scripts/optimize-images.sh`, run
manually before committing new screenshots), not leaning on `next/image` to
resize at request time. Static export — the likely deploy target, though the
final host was (and may still be) undecided — requires
`images.unoptimized: true` (or a custom loader), since there's no server to
run Next's on-the-fly image optimizer; `next/image`'s runtime
resizing/format-negotiation can't be relied on regardless of which host is
picked. `next/image` was still adopted where it was cheap to do correctly —
the post splash image, which has one known source file to read real
dimensions from at build time — just not for compression itself.

### Markdown-body images: scoped, then deliberately cut

Swapping the ~70 inline markdown-body screenshots
(`src/components/markdown/Image.tsx`) to `next/image` was scoped and then cut
after discussion. Doing it correctly needs real dimensions for arbitrary
markdown images, which means regex-scanning raw markdown for `![alt](src)`
and `<img src="...">` as a second, best-effort parser alongside
`react-markdown`'s own, then threading a `src → {width,height}` map through
the `ReactMarkdown` `img` override — real complexity added to `api.ts`-style
build code for a benefit (layout-shift prevention) that's separate from the
actual complaint (load lag), which the compression script already fixes
regardless of which tag renders the image.

Markdown body images stay as plain `<img loading="lazy">`. This was a
considered trade-off, not a gap — don't re-propose it as an oversight without
a concrete reason (e.g. layout shift on those images becomes an actual
complaint). See `docs/FUTURE_WORK.md` for the open pointer.
