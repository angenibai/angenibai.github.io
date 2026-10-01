---
status: done
date: 2026-09-30
---

# Redirects from the Jekyll site's URLs

## Problem

angeni.me is still served by the Jekyll build on `master`, via GitHub Pages.
When the Next.js build replaces it, every URL below 404s unless something
takes its place. All of them currently return 200:

- **Posts** at `/YYYY/MM/DD/<slug>.html`, which are indexed in the live
  sitemap. The new routes are `/posts/<date>-<slug>`.
- **Tag pages** at `/tags/<tag>`, also in the live sitemap. The new site has
  no tag pages yet.
- **Short links** `/r`, `/resume`, `/pf` and `/roll`, which redirect to
  external URLs. Jekyll generates them from `pages/redirects/*.md` using
  `_layouts/redirect.html`, so they disappear with the Jekyll build. `/resume`
  and `/r` point to the resume, which is likely linked from outside the site.
  `/pf` is no longer needed and is dropped.

Separately, the hackathon post was renamed in the redesign: its slug is
`2021-08-12-summarise-my-lecture`, but its title is still "Summarise My
Hackathon" and its old URL used `summarise-my-hackathon`. The slug goes back
to `2021-08-12-summarise-my-hackathon` before cutover, so the post's URL
matches its title and the redirect maps old slug to same slug.

The site stays on GitHub Pages, which serves static files only, so real HTTP
301s are not available.

## Goals

1. Every old URL in the table below lands on its new destination in one hop.
2. Google moves each old post's index entry and ranking signals to the new
   post URL.
3. Short links behave as they do today, and search engines don't index them.
4. All redirects are listed in one data file under `_data/`, so adding one is
   a data change, not a code change.

## Non-goals

- Tag pages. `/tags/*` goes to `/posts` until tags are implemented. At that
  point, change those entries to point at the real tag pages.
- `/feed.xml`. `scripts/generate-feed.ts` serves it at the same path, so it
  needs no redirect.
- Old asset paths (`/assets/img/...`). They are not in the sitemap, and
  nothing suggests they are linked from outside the site.
- Deploy pipeline (`output: "export"` and a GitHub Actions workflow). It is
  tracked separately in `docs/FUTURE_WORK.md`. The redirect pages are plain
  files in `public/`, so they work under both `next start` and a static export.

## Redirect map

| Old URL                                                                                 | Destination                                   | Kind       |
| --------------------------------------------------------------------------------------- | --------------------------------------------- | ---------- |
| `/2023/04/08/easter-show-value.html`                                                    | `/posts/2023-04-08-easter-show-value`         | post       |
| `/2021/08/12/summarise-my-hackathon.html`                                               | `/posts/2021-08-12-summarise-my-hackathon`    | post       |
| `/2021/09/06/hsc-physics.html`                                                          | none, 404 (deprecated post)                   | —          |
| `/tags/data`, `/tags/game-dev`, `/tags/hackathon`, `/tags/high-school`, `/tags/web-dev` | `/posts`                                      | page       |
| `/r`, `/resume`                                                                         | the Google Drive resume URL                   | short link |
| `/pf`                                                                                   | none, 404 (no longer needed)                  | —          |
| `/roll`                                                                                 | `https://www.youtube.com/watch?v=dQw4w9WgXcQ` | short link |

## Behaviour

- Given a visitor opens `/2023/04/08/easter-show-value.html`, they land on
  `/posts/2023-04-08-easter-show-value` immediately, with no visible
  intermediate page.
- Given Googlebot crawls an old post URL, it sees a 0-second meta-refresh,
  which Google treats as a permanent redirect, plus a canonical link to the
  new URL. The old URL drops out of results and the new one inherits its
  signals.
- Given someone pastes an old post URL into Slack or LinkedIn, the preview
  shows the post's title, blurb and splash image. Those scrapers don't follow
  meta-refresh, so the redirect page carries the post's OG tags itself.
- Given a visitor opens `/resume`, they go to the Drive file. The page is
  `noindex`, so `angeni.me/resume` doesn't appear in search results.
- Given JavaScript is disabled or the meta-refresh is blocked, the page shows
  a plain link to the destination.
- Given a post redirect names a slug that doesn't exist in `_data/posts/`, the
  build fails, which catches renamed or deleted posts.

## Chosen direction

At build time, generate one static HTML page per old URL from a redirect map
in `_data/`. Each page contains:

- a 0-second `<meta http-equiv="refresh">` to the destination,
- a `location.replace()` script, so the redirect doesn't add a history entry,
- a visible fallback link,
- for posts and pages: `<link rel="canonical">` to the absolute destination
  URL, and for posts also the title and OG tags from the post's frontmatter,
- for short links: `<meta name="robots" content="noindex">`, matching the
  current Jekyll layout.
- Google Analytics on every page, as in the Jekyll layout. It's best effort:
  the redirect doesn't wait for it, so some visits aren't counted.

Posts and pages don't get `noindex`, because it would contradict the
canonical link.

**File paths:** each page is written at the file path GitHub Pages would
serve for the old URL. Checked against the live site: `/resume` is served
from `resume.html` (`/resume/` 404s), and `/tags/data` from `tags/data.html`.
So an extensionless old URL `/x` becomes `x.html`, and a `.html` URL keeps
its path. That is the same mapping Next's static export uses for its own
routes (`/posts/foo` → `posts/foo.html`).

**Generator:** it runs as part of `prebuild`, next to the sitemap script
(which already has the post list), and writes into `public/`. The generated
files are gitignored, the same as `public/sitemap.xml`. `next dev` serves the
`.html` paths as-is. Extensionless paths like `/resume` only resolve on
GitHub Pages, or on a local static server that tries `.html`.

Kinds in the map:

- `post`: the destination is a post slug. The generator resolves it to
  `/posts/<slug>`, reads title/blurb/splash for OG tags, and fails the build
  if the slug is missing.
- `page`: an internal path, with a canonical link and no OG tags.
- `short link`: an external URL, with `noindex` and no canonical link.

Keep the redirect pages permanently. They are a few hundred bytes each, and
Google recommends keeping redirects for at least a year.

## Components involved

- `_data/redirects.yaml` (new): the redirect map. Each entry has an old path,
  a destination (post slug, internal path or external URL) and a kind.
- `src/lib/api.ts` (changed): gains a reader for the redirect map, alongside
  the existing YAML readers.
- `scripts/generate-redirects.ts` (new), or an extension of
  `scripts/generate-sitemap.ts`: writes the redirect pages into `public/`.
  Which one is decided in the plan.
- `package.json` (changed): `prebuild` also runs the redirect generator.
- `.gitignore` (changed): ignores the generated redirect pages.
- `_data/posts/2021-08-12-summarise-my-lecture.md` (renamed) to
  `2021-08-12-summarise-my-hackathon.md`. The link to it in
  `_data/projects.yaml` is updated to match. The image folder
  `public/img/summarise-my-lecture/` keeps its name, because the Summarise My
  Lecture project entry uses it too.
- `docs/FUTURE_WORK.md` (changed): the redirect item is removed once this
  ships. A new tag-pages item notes that the `/tags/*` redirects need
  updating when tag pages exist.

## Open questions

- Resolved in the plan: generated pages are listed in `.gitignore` by path,
  and the generator refuses to overwrite a file it didn't write.
