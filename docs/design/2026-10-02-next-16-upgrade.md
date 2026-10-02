---
status: done
date: 2026-10-02
---

# Next 16 upgrade

## Problem

`npm audit` reports 2 high-severity findings through Next: Next 15.5.26 pins
`postcss` 8.4.31, which has 4 advisories. They can't be exploited here, because
PostCSS only runs at build time on CSS written in this repo. The only fix is
Next 16, though, so the findings stay in every audit until the site upgrades.
Of the 7 remaining findings, 5 come from `firebase` and have no upstream fix
yet.

The upgrade itself is mostly about linting. Next 16 removes `next lint`, stops
running lint in `next build`, and `eslint-config-next` 16 requires ESLint 9.
The repo is on ESLint 8.45 with `.eslintrc.json` and `eslint-config-next`
13.4.10, which is already 2 majors behind Next.

Two dependencies that are behind get upgraded along the way. React 18 gets no
more releases (18.3.1, April 2024, was the last). `react-markdown` 8.0.7
(April 2023) gets no fixes, and its types use the global `JSX` namespace that
`@types/react` 19 removes. Upstream closed the React 19 reports (#911, #920)
with "update `react-markdown`".

## Goals

- `next` and `@next/third-parties` on 16, and `npm audit` no longer reports
  `postcss`, `next` or `@next/third-parties`.
- `react-markdown` on 10 and React on 19.
- The exported site in `out/` is unchanged: same pages, same HTML apart from
  hashed asset names, and the same look on home, posts, a post with code blocks
  and images, projects and 404.
- `npm run lint` runs ESLint 9 with the same rule sets as today
  (`next/core-web-vitals` plus `jsx-a11y` recommended), and passes.
- A lint error still blocks a deploy, as it does today through `next build`.
- Packages used only by build tooling are in `devDependencies`.

## Non-goals

- New Next 16 features: React Compiler, Cache Components, App Router.
- Moving to `next.config.ts`.
- The `firebase` / `@grpc/grpc-js` findings, which are waiting on Firebase.
- New lint rules beyond what `eslint-config-next` 16 brings in through the
  existing presets.

## What Next 16 changes here

Checked against the [Next 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
and this repo:

| Next 16 change                                                     | Effect here                                                                                                    |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `next lint` removed; `next build` no longer lints                  | `npm run lint` breaks, and CI (which runs only `npm run build`) stops catching lint errors. See decision 1, 3. |
| `eslint-config-next` 16 needs ESLint 9 and the flat config format  | `.eslintrc.json` is replaced by `eslint.config.mjs`. See decision 1.                                           |
| Turbopack is the default for `next build`                          | `next.config.js` has no `webpack` key, so the build runs. The output may differ. See decision 4.               |
| `next dev` writes a managed block into `AGENTS.md`                 | Only when it detects an AI agent. See decision 5.                                                              |
| `next/image` defaults (`qualities`, `imageSizes`, `localPatterns`) | No effect: `images.unoptimized` is set and no local `src` has a query string.                                  |
| `scroll-behavior` no longer overridden                             | No effect: nothing in `src/` sets `scroll-behavior`.                                                           |
| React 18.2 still accepted for the Pages Router                     | Next and React can be upgraded in separate commits.                                                            |
| Build output drops page size metrics                               | Cosmetic.                                                                                                      |
| Node ≥ 20.9, TypeScript ≥ 5.1                                      | Local Node 23.6, CI Node 24, TypeScript 5.1.6: already compatible.                                             |

## Decisions

### 1. ESLint 9 with `eslint-config-next` 16 and a flat config

| Option                                                                      | Trade-off                                                                                                                                                                               |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. ESLint 9 + `eslint-config-next` 16 + flat config** (chosen)            | Matches what Next 16 expects and closes the 13-vs-15 version gap. Costs a config rewrite and fixes for whatever the newer plugins flag.                                                 |
| B. Keep ESLint 8 and `.eslintrc.json`; only change the script to `eslint .` | Smallest diff, but stays on ESLint 8, end-of-life since October 2024, and on a Next 13 lint config. ESLint 10 drops `.eslintrc` support entirely, so this only postpones the migration. |

ESLint 9 rather than 10 (the latest major, 10.11.0): `eslint-config-next` 16
accepts ESLint 10, but `eslint-plugin-react`, `eslint-plugin-jsx-a11y` and
`eslint-plugin-import`, which it depends on, only list ESLint up to 9 as
supported.

`eslint-config-next` 16 brings in `eslint-plugin-react-hooks` 7 and
`typescript-eslint` 8, which is where new findings would come from. They're
fixed in their own commit (see Order of changes), so the config migration
and the code fixes can be reviewed separately.

### 2. Build tooling packages move to `devDependencies`

`eslint`, `eslint-config-next`, `typescript` and the `@types/*` packages are
in `dependencies` today. For a static export the split has no runtime effect,
and CI's `npm ci` installs both. They move so `package.json` shows which
packages the site's code imports and which only the build uses.
`eslint-plugin-jsx-a11y` is added as a direct dev dependency, because the
flat config imports it by name rather than through `eslint-config-next`.

### 3. CI runs `npm run lint` before `npm run build`

`next build` no longer lints, so without this step a lint error would deploy.
One extra step in `deploy.yml`.

### 4. Keep Turbopack, unless the output is wrong

Turbopack might order CSS Modules or split chunks differently from webpack.
Each commit compares `out/` against a pre-upgrade baseline (page list, and
HTML with hashed asset names normalised) and checks the key pages by eye. If
Turbopack's output is wrong and not a quick fix, build with `--webpack` and
record that here.

### 5. Opt out of Next's managed `AGENTS.md` block; add a one-line pointer

In 16.3, `next dev` inserts a block into `AGENTS.md` when it detects an AI
agent, pointing at the docs bundled in `node_modules/next/dist/docs/`.
`agentRules: false` turns this off.

| Option                                    | Trade-off                                                                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Opt out; one-line pointer** (chosen) | `AGENTS.md` stays hand-written. The pointer has to be checked on future Next upgrades.                                                                        |
| B. Let `next dev` manage the block        | Next keeps the wording current. Adds instructions this repo didn't write, and `next dev` rewrites the file whenever the block's text drifts from its version. |

Next's docs recommend B, citing [nextjs.org/evals](https://nextjs.org/evals).
Those evals compare agents with and without `AGENTS.md`, and
[Vercel's write-up](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals)
compares a docs index in `AGENTS.md` with a docs skill. Neither compares the
block's wording with a short pointer, so the evidence supports pointing
agents at the bundled docs, which A does too. The eval tasks also target new
App Router APIs that this Pages Router site doesn't use.

### 6. `react-markdown` 10, with block code rendered by the `pre` component

Version 9 removed the `inline` prop that `Code.tsx` uses to tell a fenced
block from inline code.

| Option                                                                          | Trade-off                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. `pre` renders the figure and highlighter; `code` handles inline** (chosen) | Follows the Markdown structure: a fenced block is always `<pre><code>`, inline code never is. `[slug].tsx` already overrides `pre` (as a passthrough), so the override moves from there into the new component. |
| B. Treat code as a block when it has a `language-` class                        | Smallest change, but a fenced block without a language would render as inline `<code>`. `docs/ACCESSIBILITY.md` requires that case to stay a real `<pre>`.                                                      |
| C. Stay on 8 and patch its types locally                                        | No API change, but keeps a version that gets no fixes and has to be patched again on the next type change.                                                                                                      |

`remark-gfm` goes from 3 to 4 to match. `rehype-raw` 7 is already the right
version. `remark-images` is in `package.json`, but nothing imports it, so it's
removed.

### 7. React 19, in its own commit after the others

React 18 has no advantage over 19 here; the only reason to wait would be to
keep the change small. Every React-dependent package accepts 19
(`@fortawesome/react-fontawesome` 0.2.6, `react-markdown` 10, `next-seo`,
`react-syntax-highlighter` 16, `@next/third-parties` 16). It goes last, so any
breakage it causes is easy to attribute, and `react-markdown`'s types are
already fixed when it lands. `PostPreviewPanel` takes `ref` as a prop instead
of using `forwardRef`.

## Order of changes

One branch, four commits. Each passes `npm run lint` and `npm run build` on
its own, and is checked with the `out/` comparison from decision 4.

| #   | Commit                    | Changes                                                                                                                                                                                                                                                                              |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Next 16 and ESLint 9**  | Bumps; `eslint.config.mjs` replaces `.eslintrc.json`; `lint` script becomes `eslint .`; dev dependencies moved; CI lint step; `agentRules: false`; `AGENTS.md` and `docs/ACCESSIBILITY.md` updated. Rules that newly fail are turned off, with a comment saying commit 2 fixes them. |
| 2   | **Fix new lint findings** | Fix the code each rule turned off in commit 1 flagged, and remove the overrides. Skipped if nothing was turned off.                                                                                                                                                                  |
| 3   | **react-markdown 10**     | Bumps; `pre` component renders code blocks, `Code` renders inline code; `remark-images` removed.                                                                                                                                                                                     |
| 4   | **React 19**              | Bumps; `PostPreviewPanel` `ref` prop; any type fixes.                                                                                                                                                                                                                                |

## Version bumps

Latest versions on npm as of 2026-10-02:

| Package                            | From             | To      | Commit |
| ---------------------------------- | ---------------- | ------- | ------ |
| `next`                             | 15.5.26          | 16.3.8  | 1      |
| `@next/third-parties`              | 15.5.26          | 16.3.8  | 1      |
| `eslint-config-next`               | 13.4.10          | 16.3.8  | 1      |
| `eslint`                           | 8.45.0           | 9.39.x  | 1      |
| `eslint-plugin-jsx-a11y`           | (transitive)     | ^6.10.0 | 1      |
| `react-markdown`                   | 8.0.7            | 10.1.0  | 3      |
| `remark-gfm`                       | 3.0.1            | 4.0.1   | 3      |
| `remark-images`                    | 3.1.0            | removed | 3      |
| `react`, `react-dom`               | 18.2.0           | 19.3.0  | 4      |
| `@types/react`, `@types/react-dom` | 18.2.15 / 18.2.7 | 19.3.0  | 4      |

## Risks

- **`@fortawesome/react-fontawesome` 0.2.6 with `@types/react` 19.** Its
  `FontAwesomeIcon` return type is `JSX.Element`, inside its own `.d.ts`.
  `skipLibCheck` hides that, so it matters only if `tsc` reports an error in
  this repo's files.
- **Turbopack output.** Covered by the `out/` comparison (decision 4).
- **Code block markup.** Decision 6 moves where the figure is rendered. The
  `out/` diff on the post with code blocks
  (`2023-04-08-easter-show-value`) must show the same HTML as before.

## Outcome

- **Turbopack kept.** With CSS Module class hashes normalised, every page's
  markup matches the pre-upgrade build. The differences are in how assets
  are split and ordered: home and projects load one more page stylesheet,
  posts load one fewer JS chunk, and there is no `nomodule` polyfill script.
  Computed styles of every element matched on all checked pages.
- **`jsx-a11y` rules only.** Spreading `jsxA11y.flatConfigs.recommended` fails
  with "Cannot redefine plugin", so the config takes only its `rules`.
- **`react-hooks` 7 findings.** `set-state-in-effect` and `refs` flagged
  `ButtonLink` and `usePostPreview`. `ButtonLink` derives the shown press
  state instead of resetting it in an effect; `usePostPreview` reads
  reduced motion with `useSyncExternalStore` and writes `activeSlugRef` in a
  `setActive` callback instead of during render.
- **`react-markdown` 10 drops a stray attribute.** v8 wrote
  `node="[object Object]"` onto every code `<pre>` and inline `<code>`;
  v10 doesn't. `remark-gfm` 4 changes the footnote back-link label from
  "Back to content" to "Back to reference 1".
- **React 19 `<head>` order.** The viewport meta and JSON-LD move earlier in
  `<head>`; stylesheets keep their relative order. A `priority` splash image
  now also gets a `<link rel="preload" as="image">`.
- **Lint and errors.** `@next/next/no-img-element` is a warning, so a lint
  error check needs an error-level rule such as `jsx-a11y/alt-text`.
