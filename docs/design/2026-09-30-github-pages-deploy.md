---
status: draft
date: 2026-09-30
---

# Deploying the Next.js site to GitHub Pages

## What

### Problem

angeni.me is still the Jekyll site. GitHub Pages builds it from the `master`
branch (Settings → Pages → Source is "Deploy from a branch"). The Next.js
redesign on `redesign-2023` builds, but nothing publishes it:
`next.config.js` has no `output: "export"`, and the repo has no workflow and
no Actions runs.

Merging `redesign-2023` into `master` as things stand would break the live
site. Pages would run Jekyll over a repo that no longer has `_config.yml`
or an `index.html`.

The redirect design (`2026-09-30-legacy-redirects.md`) already committed to
staying on GitHub Pages, and wrote its redirect pages as static files to fit
that.

### Goals

1. Pushing to `master` publishes the Next.js site to angeni.me, with no
   manual build step.
2. Every page URL works with and without a trailing slash. The version
   without the preferred form sends a redirect, and the page never 404s.
3. Canonical links, the sitemap and internal links all name the same URL
   form that Pages serves.
4. The old Jekyll URLs still redirect as the redirect design specifies.
5. The cutover never publishes a broken site, and it can be rolled back to
   the Jekyll site.

### Non-goals

- The RSS feed at `/feed.xml`, which ships separately. Existing feed
  subscribers stop getting updates from cutover until it lands.
- Moving off GitHub Pages (see Options considered).
- PR preview deploys.
- Trimming the `blog-reacts` API key. That's a post-cutover item in
  `docs/FUTURE_WORK.md`.

### Behaviour

- Given a commit is pushed to `master`, a workflow builds the site and
  deploys it. A failed build leaves the previous deployment live.
- Given a visitor opens `angeni.me/posts`, they get the posts list, via a
  redirect to `/posts/`.
- Given a visitor opens `angeni.me/posts/`, they get the posts list directly.
  Today this URL 404s on the Jekyll site.
- Given a visitor opens `/posts/2023-04-08-easter-show-value`, with or
  without the trailing slash, they get the post.
- Given a crawler reads any page, its canonical link and sitemap entry use
  the trailing-slash form, which is the URL Pages serves with a 200.
- Given a visitor opens an old Jekyll URL (`/2023/04/08/easter-show-value.html`,
  `/resume`, `/tags/data`), they land where the redirect design says.
- Given a visitor opens a path that doesn't exist, they get the site's styled
  404 page.

### Constraints

- GitHub Pages serves static files only: no server, no HTTP redirects of its
  own, and no rewrites.
- Every route is already static or SSG (checked with `npm run build`), and
  nothing uses `getServerSideProps`, API routes or middleware. Static export
  therefore changes nothing about what gets rendered.
- The custom domain `angeni.me` is set in the repo's Pages settings. With an
  Actions deployment, GitHub ignores any `CNAME` file in the output.
- Firestore reacts are keyed by post slug (`src/lib/reacts.ts`), not by URL.
  The URL form doesn't affect them.

## How

### Options considered

**How the build gets published**

| Option                                                                     | For                                                                                                                                                           | Against                                                                                                           |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **A. Actions workflow with the official Pages actions** (chosen)           | GitHub's documented path for static-site generators. No build output in git. Jekyll never runs, so `_next/` needs no `.nojekyll`. Domain comes from settings. | Needs the Pages source switched to "GitHub Actions", which must happen before the merge.                          |
| B. Workflow pushes `out/` to a `gh-pages` branch, Pages serves that branch | Keeps "Deploy from a branch" as the source.                                                                                                                   | Build output committed on every deploy. Needs `.nojekyll` and a `CNAME` in the output, plus a third-party action. |
| C. Move to another host (Firebase Hosting, Netlify)                        | Real 301s and clean-URL handling.                                                                                                                             | DNS change. Redoes the static redirect pages the redirect design built for Pages. Not needed to ship.             |

**URL form**

Next's static export names files after routes. With the default
`trailingSlash: false`, `/posts` becomes `posts.html` and each post becomes
`posts/<slug>.html`. So `out/` has both a `posts.html` file and a `posts/`
folder. Any list page with child pages under it produces the same pair.

| Option                                                                       | `/posts`                                                                                                                                          | `/posts/`                    | Canonical form |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------- |
| D. `trailingSlash: false` (current)                                          | Depends on how Pages chooses between `posts.html` and the `posts/` folder. Unverified: the live site has no file-and-folder pair to test against. | 404: no `posts/index.html`.  | no slash       |
| **E. `trailingSlash: true`** (chosen)                                        | 301 to `/posts/`, as Pages already does for folders (live `/tags` → `/tags/`).                                                                    | 200 from `posts/index.html`. | trailing slash |
| F. `false`, plus a build step that copies `posts.html` to `posts/index.html` | 200, if Pages picks the file (unverified, as in D).                                                                                               | 200 from the copy.           | no slash       |

E is the setting Next's docs describe for static hosts. Every static host
serves folder index files the same way, so E doesn't depend on Pages'
`.html` resolution at all. Its only cost is the trailing slash in URLs, and
the new site has no indexed URLs to migrate yet. F keeps slash-less URLs, but
it's a hand-written patch over Next's output and still relies on the
unverified behaviour in D.

### Chosen direction

**A + E.** `next build` does a static export with trailing slashes, and a
GitHub Actions workflow on `master` deploys `out/` with GitHub's Pages
actions.

**URL form.** Every page route is written as `<route>/index.html` and is
canonically addressed with a trailing slash. `absoluteUrl()` becomes the one
place that decides the form, so canonicals, OG URLs and the sitemap agree.
Internal `page:` redirects in `_data/redirects.yaml` (the `/tags/*` entries)
point at `/posts/` directly, avoiding a second hop. The old Jekyll URLs are
unaffected: the redirect generator writes them as explicit `.html` files in
`public/`, outside Next's routing.

**Cutover order**, so no broken site is ever live:

1. The export config and workflow land on `redesign-2023`, and the export is
   checked locally.
2. The Pages source is switched to "GitHub Actions". The Jekyll deployment
   stays live until a new deployment replaces it.
3. `redesign-2023` is merged into `master` and pushed. The workflow's first
   run replaces the Jekyll site.

Doing step 3 before step 2 is the failure the Problem section describes.

**Rollback:** switch the source back to "Deploy from a branch", pointed at a
branch cut from the last Jekyll commit (`318e3dd`).

**Local preview:** `next start` doesn't run with a static export, so
`npm run start` serves `out/` through a static file server instead.

### Components involved

- `next.config.js` (changed): `output: "export"`, `trailingSlash: true`.
  `images.unoptimized` stays.
- `.github/workflows/deploy.yml` (new): builds on push to `master` (and on
  manual trigger), then uploads and deploys `out/`.
- `src/lib/site.ts` (changed): `absoluteUrl()` returns the trailing-slash
  form for page paths. Its comment explains why.
- `_data/redirects.yaml` (changed): `/tags/*` destinations become `/posts/`.
- `package.json` (changed): `start` serves `out/`.
- Internal links written as raw HTML in `_data/` content, such as the post
  link in `_data/projects.yaml`, may need a trailing slash to avoid a
  redirect hop. The plan lists them.
- `AGENTS.md`, `docs/PUBLISHING.md` (changed): how the site deploys.
  `docs/FUTURE_WORK.md` (changed): the deploy-target item is removed.
- Repo settings (manual): Pages source → "GitHub Actions". Afterwards,
  confirm the custom domain and "Enforce HTTPS" are still set.

## Open questions

- Resolved before cutover: `master` has two commits that `redesign-2023`
  doesn't (`fe4e7d8`, `318e3dd`, both project content). Their content is
  already in `_data/projects.yaml`, and the merge's only conflict,
  `_data/projects.yml` (modify/delete), resolves by deleting that file.
- Left to the plan: whether `useRouteTransition`'s same-page check
  (`pathOf(url) === pathOf(window.location)`) needs to normalise trailing
  slashes, for a raw internal link that omits one.
