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

- `src/components/Reacts.tsx` (new): the bar, Firestore subscription and writes.
- `src/lib/firebase.ts` (new): Firebase app/Firestore init with the `blog-reacts` web config.
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
