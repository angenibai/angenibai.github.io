# Future Work

Notes from a 2026-08-22 review of the site, covering everything short of the
build-breaking issues (those are already fixed). Not in priority order within
each section except where noted.

## Blog post list page

`src/pages/posts/index.tsx` currently renders just a linked title per post
(see `src/styles/Post.module.css` — each tile is an empty 200px box). Post
frontmatter already carries `date`, `tags`, `splashImageSource`, and `pin`
(`src/types/index.tsx` `PostMetadata`), none of which are used on this page.

- Show the publish date and a short excerpt/description per post.
- Show a thumbnail (`splashImageSource`) per tile.
- Respect `pin: true` (sort pinned posts first) and `listed: false` (exclude
  from the list) — both are authored in post frontmatter but currently
  ignored everywhere.
- Consider showing tags, at least as a filter or visual label.

## Per-post layout polish

`src/pages/posts/[slug].tsx`:
- The splash `<img>` (line ~42) has no `width`/`height`, so it causes layout
  shift as it loads. Reserve space with explicit dimensions or `next/image`.

## Image optimization

`public/img` is ~52MB; several PNG screenshots run 2–2.6MB each (e.g.
`sml-21.png`, the `easter-show-value/showbag-highlight-*.png` set). None of
this is optimized:

- `BioPanel.tsx` and `ProjectTile.tsx` already use `next/image` — fine as-is.
- Post splash images and every image inside post Markdown bodies are plain
  `<img>` tags. Markdown images go through `react-markdown` with no custom
  image renderer, so they bypass `next/image` entirely (Next's linter flags
  this at `[slug].tsx:42`).
- Two-part fix:
  1. Compress/resize the source screenshots before they're committed — most
     are full-resolution macOS screenshots that could shrink 70–90% with no
     visible quality loss at display size.
  2. Add a custom `img` renderer to the `ReactMarkdown` `components` prop in
     `[slug].tsx`, the same pattern already used for `code` → `Code.tsx`, so
     body images route through `next/image` too.

## SEO

- `src/pages/posts/[slug].tsx` has no `NextSeo` call. Every individual post
  currently inherits the generic site-wide title/description from
  `DefaultSeo` in `_app.tsx`, and there's no per-post OG image — sharing a
  post link anywhere shows no useful preview. This is the biggest concrete
  SEO gap since posts are the main content type on the site.
- No `robots.txt` or `sitemap.xml` in `public/`. Low priority at this scale,
  but cheap to add (`next-sitemap` or a static file).

## BioPanel doesn't read from `_data/bio.yaml`

`src/components/BioPanel.tsx` has a commented-out `getStaticProps` with the
note `// for some reason "fs" can't be imported`, so it renders a hardcoded
`defaultContent` object that duplicates `_data/bio.yaml` by hand instead of
reading the file. Editing `bio.yaml` currently has no effect on the site.

The `fs` import fails because `getStaticProps` only works in `src/pages/*`,
not in a regular component like `BioPanel`. Fix: call `getBio()` (already
exported from `src/lib/api.ts`) inside `index.tsx`'s `getStaticProps`, and
pass the result down as the `content` prop that `BioPanel` already accepts —
no changes needed to `BioPanel` itself beyond removing `defaultContent`.

## Smaller cleanup items

- `src/components/ProjectTile.tsx` has a `// TODO: tag section, ...` comment
  — the `tags` field is authored in `_data/projects.yaml` but never rendered
  anywhere in the component.
- `src/components/Nav.tsx` has a large commented-out nav block that can be
  deleted now that `NavLinks` covers the same links.
- Confirm the actual deploy target. The repo is named
  `angenibai.github.io` (GitHub Pages naming convention), but there's no
  `output: "export"` in `next.config.js` and no GitHub Actions workflow —
  this is a full Next.js app, which GitHub Pages can't serve as-is. `angeni.me`
  is a custom domain per the README, so it's likely actually deployed via
  Vercel (there's a `public/vercel.svg` asset) with DNS pointed at it — but
  worth confirming there's a working deploy pipeline before treating the
  build passing as "the site is live."
