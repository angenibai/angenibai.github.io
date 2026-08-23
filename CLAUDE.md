# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Docs index

- [docs/DESIGN_LANGUAGE.md](docs/DESIGN_LANGUAGE.md) — the site's visual identity: color palette, typography pairing, borders-not-shadows, and where boldness vs. restraint belongs. Read before styling any new UI.
- [docs/FUTURE_WORK.md](docs/FUTURE_WORK.md) — open items from a full-site review, not yet scheduled.
- `plans/` — one-off implementation plans for specific features/changes (as opposed to ongoing notes, which live in `docs/`), kept after implementation as a record of decisions and gotchas encountered.

## What this is

Angeni Bai's personal website (angeni.me), a Next.js (Pages Router) + TypeScript site. Content (projects, bio, blog posts) is authored as YAML/Markdown in `_data/` rather than hardcoded in components.

## Commands

```
npm run dev     # start dev server
npm run build   # production build (also type-checks)
npm run start   # serve the production build
npm run lint    # next lint (eslint-config-next)
```

There is no test suite configured in this repo.

## Architecture

**Content lives in `_data/`, not in `src/`.** Pages read content at build time via `src/lib/api.ts`, which parses YAML (`_data/projects.yaml`, `_data/bio.yaml`) and Markdown-with-frontmatter blog posts (`_data/posts/*.md`, parsed with `gray-matter`). All post/project/bio content changes belong in `_data/`, not in page components.

- `getAllProjects()` / `getBio()` — parse the corresponding YAML file.
- `getAllPosts()`, `getPostBySlug()`, `getFileData()`, `getPaths()` — read and parse `_data/posts/*.md`. The filename (minus `.md`) is the post's slug and its route.
- Post frontmatter fields are documented inline in `_data/posts/2023-04-08-easter-show-value.md` (required: `layout`, `title`, `date`; recommended: `tags`, `splashImageSource`, `splashImageCaption`; optional: `updated`, `author`, `pin`, `listed`, `index`). The shape is typed in `src/types/index.tsx` (`PostMetadata`, `ProjectContent`).
- `longDescription` fields in `projects.yaml` are raw HTML strings, not Markdown.

**Post rendering**: `src/pages/posts/[slug].tsx` uses `getStaticProps`/`getStaticPaths` (SSG, `fallback: false`) and renders Markdown via `react-markdown` with `remark-gfm` and `rehype-raw` (so raw HTML in post bodies is allowed). Code blocks are rendered through the custom `src/components/markdown/Code.tsx` component (syntax highlighting via `react-syntax-highlighter`).

**Layout split**: `src/components/Layout.tsx` is a bare wrapper used only by the home page (`src/pages/index.tsx`). `src/components/PageLayout.tsx` wraps `Nav` + content + `Footer` and is used by all other pages (posts, projects). Use `PageLayout` for any new top-level page other than the homepage.

**Styling**: CSS Modules per-component under `src/styles/components/`, plus page-level modules directly under `src/styles/` (`Home.module.css`, `Post.module.css`, etc.) and global styles in `src/styles/globals.css`. Fonts (`Work Sans`, `Newsreader`, `IBM Plex Mono`) are loaded via `next/font/google` in `src/pages/_app.tsx` and exposed as CSS variables. See [docs/DESIGN_LANGUAGE.md](docs/DESIGN_LANGUAGE.md) for the color/typography/border conventions before adding new styles.

**Path alias**: `@/*` maps to `src/*` (see `tsconfig.json`).

**Images** referenced from `_data/` content live under `public/img/<project-or-post-slug>/`.

## Leftover directories

`vendor/`, `.bundle/`, and `_site/` are remnants of a prior Jekyll-based version of this site. They're gitignored and unused by the current Next.js app — ignore them.
