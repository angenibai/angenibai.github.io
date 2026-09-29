---
status: approved
date: 2026-09-29
---

# SEO metadata and crawler control

## Problem

The redesign drops almost all the page metadata the live Jekyll site had.
Every page shares one description (`"angeni's website"`, `DefaultSeo` in
`src/pages/_app.tsx`); post pages set only a title
(`src/pages/posts/[slug].tsx`); there are no OG image, canonical, or
`og:url` tags, so a pasted post link previews as a bare title or URL. There is
no `robots.txt` or `sitemap.xml` in `public/`, and the `index: false`
frontmatter documented in the post template is read by nothing.

Out of scope here but tracked in `docs/FUTURE_WORK.md`: redirects from old
Jekyll URLs, and the RSS feed.

## Goals

1. **Name search.** Searching "angeni bai" surfaces the home page with title
   `angeni bai` and description `welcome to angeni's corner of the internet`,
   and `Person` structured data ties the site to the GitHub and LinkedIn
   profiles already linked in `Footer.tsx`.
2. **Shared post links.** A pasted post link previews with the post's title,
   `blurb`, and `splashImageSource`. Home, projects, and the posts list
   preview as text only (title + description, no image).
3. **Post search results** can show publish date and author, via `Article`
   structured data on each post.
4. **Crawler access.**
   - Search engines may crawl everything; `sitemap.xml` lists home, projects,
     posts list, and every `listed` post.
   - Known AI **training** crawlers (e.g. `GPTBot`, `ClaudeBot`, `CCBot`,
     `Google-Extended`, `Applebot-Extended`) and AI **search-index** crawlers
     (e.g. `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`) are
     disallowed in `robots.txt`.
   - **User-triggered** AI fetchers (`ChatGPT-User`, `Claude-User`,
     `Perplexity-User` — someone asking an assistant about the site) are
     allowed.
   - A post with `listed: false` is left out of the sitemap; a post with
     `index: false` renders `<meta name="robots" content="noindex">`. The two
     flags stay independent.
   - Every page has a canonical URL on `https://angeni.me`.
5. **No new upkeep.** A new post gets all of the above from frontmatter
   already written (`title`, `date`, `blurb`, `splashImageSource`, `listed`,
   `index`). No per-post SEO fields, no hand-maintained sitemap.

## Non-goals

- Generated OG images (title drawn onto a template at build time).
- Fallback share image for non-post pages.
- Per-project pages or tag pages.
- Server-side bot blocking — `robots.txt` only binds crawlers that honour it.
- Redirects and RSS (see `docs/FUTURE_WORK.md`).
- App Router (`src/app/`) — the project stays Pages Router only for now.

## Constraints

- Deploy target is still unconfirmed (`docs/FUTURE_WORK.md`, "Confirm the
  actual deploy target"). Everything must work under both `next start` and a
  static export — no request-time rendering, which rules out a
  `getServerSideProps` or API-route sitemap.
- OG image and canonical URLs must be absolute, so the site origin needs to be
  defined once rather than hardcoded per page.
- `next-seo` is already the metadata mechanism on every page; stay with it.

## robots.txt and sitemap.xml

`robots.txt` doesn't depend on content, so it's a **static file in
`public/`**. The crawler lists change rarely and are easiest to review as
plain text.

`sitemap.xml` does depend on content (which posts exist and are `listed`).
Options:

| Option | For | Against |
|---|---|---|
| **A. `next-sitemap`** (postbuild CLI) | Common, off the shelf | Its JS config can't import `src/lib/api.ts`, so `listed` filtering means a second frontmatter parser; output location needs care under static export |
| **B. Build script run with `tsx`, hooked as `prebuild`** | Imports `getAllPosts()` directly (`tsx` resolves the `@/` alias from `tsconfig.json`), so `listed` logic lives in one place; `npm run build` runs it automatically; RSS can later be added to the same script | New dev dependency (`tsx`); generated file in `public/` must be gitignored |
| **C. App Router metadata routes** | Built into Next | Rejected — no `src/app/` for now |

Plain `node` (v23 strips types) can't replace `tsx`: it doesn't resolve the
`@/` alias that `src/lib/api.ts` uses.

**Chosen: B.** It's the only remaining option that reuses `getAllPosts()`
without a second frontmatter parser, which goal 5 depends on. The generated
`public/sitemap.xml` is gitignored and rebuilt on every `npm run build`; it
won't exist under `npm run dev`, which is fine.

## Components involved

- `src/lib/api.ts` (changed): gains `getListedPosts()`, moving the
  `listed !== false` filter out of `src/pages/posts/index.tsx`'s
  `getStaticProps` so the posts page and the sitemap script share one
  definition of "unlisted". Lands as its own commit before the rest.
- **Site config** (new, e.g. `src/lib/site.ts`): origin, site name, author
  name, social profile URLs. Single source for absolute URLs; used by pages
  and the build script.
- `src/pages/_app.tsx` (changed): `DefaultSeo` gets the home description as
  the site default, plus `og:site_name` and twitter card defaults.
- `src/pages/index.tsx` (changed): canonical and `Person` structured data.
- `src/pages/posts/[slug].tsx` (changed): description from `blurb`, OG image
  from `splashImageSource` (with the dimensions already read at build time),
  `og:type` article with publish date, `Article` structured data, canonical,
  and `noindex` when `index: false`.
- `src/pages/posts/index.tsx`, `src/pages/projects/index.tsx`,
  `src/pages/404.tsx` (changed): canonical; 404 gets `noindex`.
- `public/robots.txt` (new, committed): crawler policy + sitemap pointer.
- `scripts/` build script (new) + `prebuild` in `package.json`: writes
  `public/sitemap.xml`.
- `.gitignore` (changed): `public/sitemap.xml`.
- `AGENTS.md` (changed): note the prebuild step under Commands.

## Open questions

None.
