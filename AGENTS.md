# AGENTS.md

Guidance for coding agents working in this repository.

## What this is

Angeni Bai's personal website (angeni.me): a Next.js (Pages Router) +
TypeScript site, statically exported and deployed to GitHub Pages on push to
`main` (see the [README](README.md#deploy)).

## Where to look

- [docs/DESIGN_LANGUAGE.md](docs/DESIGN_LANGUAGE.md) — the site's visual
  identity. Read before styling any new UI.
- [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) — accessibility gaps ranked by
  severity, and what already works so it doesn't regress.
- [docs/PUBLISHING.md](docs/PUBLISHING.md) — checklist for publishing a native
  or Substack post, and for changing the Firestore rules.
- [docs/FUTURE_WORK.md](docs/FUTURE_WORK.md) — open items, not yet scheduled.
- `docs/design/` — design docs for larger changes, including mid-implementation
  deviations a diff wouldn't explain.
- `docs/plan/` — working plans for a change in progress; not committed by
  default once the change ships.
- `package.json` scripts — the commands. Some scripts (`optimize-images`,
  `reacts:init`) document their flags and prerequisites in their source under
  `scripts/`.
- `node_modules/next/dist/docs/` — Next.js docs for the installed version; check
  them before relying on remembered Next APIs.

## Working in the codebase

- **Content lives in `_data/`, not `src/`.** Posts, projects, bio, site config
  and redirects are YAML/Markdown/JSON there; pages read them at build time
  through `src/lib/`. Post frontmatter is documented in
  `_data/posts/2023-04-08-easter-show-value.md`.
- **Checks:** there is no test suite. `npm run build` (which type-checks) and
  `npm run lint` are the checks to run.
- **Generated files:** the sitemap, RSS feed and redirect pages in `public/` are
  written by `prebuild` and gitignored. A new entry in `_data/redirects.yaml`
  also needs its output path added to `.gitignore`.
- **URLs end in `/`** (`trailingSlash`). Write internal paths with the slash and
  build absolute URLs with `absoluteUrl()` from `src/lib/site.ts`.
- **New pages** use `PageLayout`; `Layout` is for the home page only.
- **Images** go under `public/img/<slug>/`; run `npm run optimize-images` before
  committing them.
- **Ignore** `vendor/`, `.bundle/` and `_site/`: gitignored leftovers from the
  old Jekyll site.
