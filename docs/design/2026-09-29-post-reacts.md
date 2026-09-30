---
status: approved
date: 2026-09-29
---

# Post reacts

## Problem

The Jekyll site on `master` had a "Reacc" bar under each post: six react
buttons (like, laugh, love, surprised, angry, sad) with live counts, stored in
Firestore (`master:_includes/post/react.html`). The Next.js site has no
equivalent, so the new site would drop the feature and hide the existing
counts (542 reacts on the hackathon post).

How the old one worked, and what carries over:

- Firebase project `blog-reacts`, collection `reacts`, one doc per post with
  the six counters plus `total`, bumped with `increment(±1)`.
- Doc ID was `slugify(location.pathname)`. With no Jekyll `permalink` set,
  that was `/2023/04/08/easter-show-value.html` → `2023-04-08-easter-show-value-html`.
- It used `updateDoc`, which fails on a missing doc, so each new post needed
  its doc created by hand in the console (`master:README.md`).
- It also called Firebase `getAnalytics()` (`G-ERK7C98S4X`), a second stream
  alongside the GA added in `1c61753` (`G-CYM1C4XG1B`).

Current docs (read via the public REST API, 2026-09-29):

| Doc ID                                   | total | Post on new site?                           |
| ---------------------------------------- | ----- | ------------------------------------------- |
| `2021-08-12-summarise-my-hackathon-html` | 542   | yes, currently named `summarise-my-lecture` |
| `2023-04-08-easter-show-value-html`      | 11    | yes                                         |
| `2021-09-06-hsc-physics-html`            | 22    | no                                          |
| `2021-07-22-hello-html`                  | 1     | no                                          |

## Goals

- Every native post page shows the Reacc bar with its existing counts.
- Clicking a button increments that react and `total`, and all open viewers
  see the new count live. Clicking again toggles it back off. Reacting more
  than once across reloads is fine.
- A new post gets its doc from one documented command, with no hand-typed
  console fields.
- The Firestore rules live in this repo, and `surprised` is range-checked
  like the other reacts.
- A post can opt out with `reacts: false` in frontmatter.

## Non-goals

- Substack posts (`externalLink` set) get no reacts. Readers react on
  Substack, and the `/posts/<slug>` stub is rarely visited.
- No per-visitor state (no `localStorage`, no auth).
- No Firebase Analytics. GA via `@next/third-parties` covers it.
- No change to the reaction set or the "Reacc" heading.

## Chosen direction

**Doc key = `${slug}-html`, no Firestore migration.** The post filename
slug on the new site equals the old Jekyll date-path slug minus the `.html`,
so appending `-html` finds every existing doc. Alternatives:

| Option                         | Cost                                                                                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Key by `${slug}-html` (chosen) | A suffix left over from Jekyll, explained in one comment. No data changes, and the old site keeps working until the new one deploys.                     |
| Migrate docs to bare-slug keys | Copy 2 docs by hand (or with an authed script) at deploy time. Old-site reacts written between the copy and the deploy are lost unless done in lockstep. |

The key is derived from the slug, not the URL, so a later route change
doesn't orphan counts.

**Rename the hackathon post back.** `_data/posts/2021-08-12-summarise-my-lecture.md`
→ `2021-08-12-summarise-my-hackathon.md` so its slug matches the 542-react
doc. Its image folder `public/img/summarise-my-lecture/` can stay as is.

**Client component using the `firebase` npm SDK (Firestore only).**
It renders the bar, subscribes with `onSnapshot` for live counts, and
writes with `updateDoc` increments on `total` plus the react's field. If
the post's doc is missing, the bar is hidden and a `console.warn` names the
missing doc, so a forgotten setup step shows up in dev instead of as
buttons that silently fail. The pressed/unpressed toggle is only
in-page state (`aria-pressed`). A failed write reverts the toggle, as before.

**Styling** follows `docs/DESIGN_LANGUAGE.md` (borders, not the old
Bootstrap outline buttons). The exact look is decided at plan/prototype time.

## Components involved

- `src/components/Reacts.tsx` (new): a light wrapper that lazy-loads the panel
  (see [Loading](#loading)).
- `src/components/ReactsPanel.tsx` (new): the bar, the Firebase init with the
  `blog-reacts` web config, and the Firestore subscription and writes.
- `src/lib/reacts.ts` (new): the react list and the doc key. It has no
  Firebase imports.
- `src/styles/components/Reacts.module.css` (new): styling.
- `src/pages/posts/[slug].tsx` (changed): renders `Reacts` under the body
  unless `externalLink` is set or `reacts === false`.
- `src/types/index.tsx` (changed): `reacts?: boolean` on `PostMetadata`.
- `_data/posts/2023-04-08-easter-show-value.md` (changed): document `reacts` in the frontmatter reference comments.
- `_data/posts/2021-08-12-summarise-my-lecture.md` (renamed): see above.
- `package.json` (changed): add `firebase` and the `reacts:init` script.
- `scripts/reacts-init.*` (new): the new-post setup script.
- `firestore.rules`, `firebase.json`, `.firebaserc` (new): rules under version control.
- `AGENTS.md` (changed): the new-post reacts step.

## Security rules

The live rules (last deployed 2021-11-16, not in any repo) allow on
`reacts/{post}`:

- `read`: anyone.
- `create`, `delete`: nobody. This is why new posts needed a console step.
- `update`: at most two fields change, and `total`, `angry`, `laugh`,
  `like`, `love`, `sad` each move by at most 1 and stay ≥ 0.

`surprised` is missing from the `withinOne` checks, so anyone can set it
to any number in one write. `total` is also not required to change, so a
write can bump two reacts without touching `total`.

**Decisions:**

- Keep `create: false`. Visitors never create docs.
- Add `surprised` to the `withinOne` checks.
- Require `total` to be one of the changed fields on every update.
- Move the rules into this repo as `firestore.rules`, with `firebase.json`
  and `.firebaserc` (project `blog-reacts`). Deploy with
  `npx firebase-tools deploy --only firestore:rules`.

## New-post setup script

`npm run reacts:init` lists the native posts in `_data/posts/` (no
`externalLink`, `reacts` not `false`) and creates a zeroed doc (seven
fields at 0) for each one that has none. It never touches existing docs,
so it is safe to re-run. It writes with your own Google credentials
through the Firestore API. Authenticated project-owner requests bypass
security rules, so `create: false` doesn't block it. The step is
documented in `AGENTS.md` next to the post frontmatter notes.

## Loading

The Firebase SDK must not slow the initial page load. With a static import,
`/posts/[slug]` first-load JS was 376 kB (264 kB page chunk). Firestore alone
was about 230 kB of that, and Substack stubs paid for it too, since they share
the route.

**Decision:** `Reacts.tsx` loads `ReactsPanel.tsx` with
`next/dynamic(..., { ssr: false })`. Anything that imports `firebase/*` lives
in `ReactsPanel.tsx`, so the SDK becomes its own chunk. The page renders and
hydrates without it. The chunk is fetched once `Reacts` mounts on the client,
and the panel appears when the first snapshot arrives. Posts that don't
render `Reacts` (Substack stubs, `reacts: false`) never fetch it. After the
change, first-load JS is 237 kB (124 kB page chunk), measured 2026-09-30.

This works on GitHub Pages. Code splitting emits static chunk files, and the
browser requests them itself, so it needs no server.

**Rejected: load on scroll** (an `IntersectionObserver` that mounts the panel
only near the bottom of the post). It would save the download and the
Firestore connection for readers who never reach the end. But the goal is
only to not block the initial load, and the dynamic import does that alone,
with less code. It's worth revisiting if Firestore reads or mobile data
become a concern.

## Implementation notes

Decided during implementation (2026-09-30), and not visible from the diff alone:

- **Look:** chosen from prototyped options. It's a framed panel (3px border,
  5px offset shadow, green header band with heading and total) on
  `--color-bg-white`. Each react is a compact cell with the emoji and count
  on one line, and a visually hidden label so the button reads as "Like 4".
  It's 6 across, and 3×2 below 480px of bar width via a container query. The
  focus ring is primary green. Mauve was tried and rejected.
- **Placement:** the panel straddles the post column's bottom edge. The column
  drops its bottom border (`.hasReacts`), and the `Reacts` wrapper's
  `::before` draws the side borders down to the panel's midline and the
  bottom border along it. The wrapper renders even while the panel is
  loading or hidden, so the column never ends without its bottom edge. A
  panel inside the column, and a separate card below it, were both tried
  first.
