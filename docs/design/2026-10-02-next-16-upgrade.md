---
status: draft
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

## Goals

- `next` and `@next/third-parties` on 16, and `npm audit` no longer reports
  `postcss`, `next` or `@next/third-parties`.
- The exported site in `out/` is unchanged: same pages, same HTML apart from
  hashed asset names, and the same look on home, posts, a post with code blocks
  and images, projects and 404.
- `npm run lint` runs ESLint 9 with the same rule sets as today
  (`next/core-web-vitals` plus `jsx-a11y` recommended). The existing
  `eslint-disable-next-line` comments still refer to rules that exist, and
  lint passes.
- A lint error still blocks a deploy, as it does today through `next build`.
- React on 19, as a separate step after Next 16 is verified (see Chosen
  direction).

## Non-goals

- New Next 16 features: React Compiler, Cache Components, App Router.
- Moving to `next.config.ts`.
- The `firebase` / `@grpc/grpc-js` findings, which are waiting on Firebase.
- New lint rules beyond what `eslint-config-next` 16 brings in through the
  existing presets.

## What changes, and what doesn't

Checked against the [Next 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
and this repo:

| Next 16 change                                                     | Effect here                                                                                                                                                                                   |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next lint` removed; `next build` no longer lints                  | `npm run lint` breaks, and CI (which runs only `npm run build`) stops catching lint errors. Main work.                                                                                        |
| `eslint-config-next` 16 needs ESLint 9 and the flat config format  | `.eslintrc.json` is replaced by `eslint.config.mjs`.                                                                                                                                          |
| Turbopack is the default for `next build`                          | `next.config.js` has no `webpack` key, so the build won't refuse to run. The output might still differ (CSS Modules ordering, chunking), so the exported pages get compared before and after. |
| `next dev` writes a managed block into `AGENTS.md`                 | Only when an AI agent runs `next dev`. Turned off with `agentRules: false`; a one-line pointer in `AGENTS.md` replaces it.                                                                    |
| `next/image` defaults (`qualities`, `imageSizes`, `localPatterns`) | No effect: `images.unoptimized` is set and no local `src` has a query string.                                                                                                                 |
| `scroll-behavior` no longer overridden                             | No effect: nothing in `src/` sets `scroll-behavior`.                                                                                                                                          |
| React 18.2 still accepted for the Pages Router                     | Next can be upgraded without React.                                                                                                                                                           |
| Build output drops page size metrics                               | Cosmetic.                                                                                                                                                                                     |
| Node ≥ 20.9, TypeScript ≥ 5.1                                      | Local Node 23.6, CI Node 24, TypeScript 5.1.6 — already compatible.                                                                                                                           |

## Options considered

**Lint migration**

| Option                                                                      | Trade-off                                                                                                                                                                                              |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A. ESLint 9 + `eslint-config-next` 16 + flat config** (chosen)            | Matches what Next 16 expects and fixes the existing 13-vs-15 version gap. Costs a config rewrite and fixes for whatever the newer plugins flag.                                                        |
| B. Keep ESLint 8 and `.eslintrc.json`; only change the script to `eslint .` | Smallest diff, but stays on ESLint 8, which has been end-of-life since October 2024, and on a Next 13 lint config. ESLint 10 drops `.eslintrc` support entirely, so this only postpones the migration. |

**React 19**

React 18 has no advantage over 19 here; the only reason to wait would be to
keep the change small. Moving to 19 also looks cheap: every React-dependent
package accepts 19 (`@fortawesome/react-fontawesome` 0.2.6, `react-markdown`
8, `next-seo`, `react-syntax-highlighter` 16, `@next/third-parties` 16). React
18 itself gets no more releases: 18.3.1 (April 2024) was the last. The risk is
a breakage that's hard to attribute, and that goes away if React gets its own
step and commit, verified after Next 16.

## Chosen direction

One branch, three commits. Each commit passes `npm run lint` and
`npm run build` on its own, because CI will run both.

1. **Next 16 and ESLint 9.** Version bumps, the flat config, the CI lint step
   and the doc updates. Any rule that newly fails on existing code is turned
   off in `eslint.config.mjs`, with a comment saying the next commit fixes it.
   Then compare `out/` from before and after (page list, and HTML with hashed
   asset names normalised), and check the key pages by eye. If Turbopack's
   output is wrong and not a quick fix, build with `--webpack` instead and
   record that here.
2. **Fix the new lint findings.** Fix the code each rule turned off in
   commit 1 flagged, and remove those overrides. If a fix changes runtime
   behaviour, check the affected page.
3. **React 19.** Version bumps, type fixes and the `ref` prop change, then
   repeat the `out/` comparison from commit 1.

## Version bumps

Latest versions on npm as of 2026-10-02:

| Package                            | From             | To     | Commit |
| ---------------------------------- | ---------------- | ------ | ------ |
| `next`                             | 15.5.26          | 16.3.8 | 1      |
| `@next/third-parties`              | 15.5.26          | 16.3.8 | 1      |
| `eslint-config-next`               | 13.4.10          | 16.3.8 | 1      |
| `eslint`                           | 8.45.0           | 9.39.x | 1      |
| `react`, `react-dom`               | 18.2.0           | 19.3.0 | 3      |
| `@types/react`, `@types/react-dom` | 18.2.15 / 18.2.7 | 19.3.0 | 3      |

ESLint 9 rather than 10, which is the latest major (10.11.0):
`eslint-config-next` 16 accepts ESLint 10, but `eslint-plugin-react`,
`eslint-plugin-jsx-a11y` and `eslint-plugin-import`, which it depends on, only
list ESLint up to 9 as a supported version.

`eslint-config-next` 16 also brings in newer plugins it depends on, notably
`eslint-plugin-react-hooks` 7 and `typescript-eslint` 8. Those are where new
lint findings would come from.

## Expected changes

**Commit 1: Next 16 and ESLint 9**

- `package.json` / `package-lock.json`: the bumps above; the `lint` script
  becomes `eslint .`.
- `.eslintrc.json` → `eslint.config.mjs`: the same two presets,
  `core-web-vitals` from `eslint-config-next` and `jsx-a11y` recommended, in the
  flat config format. ESLint 9 doesn't read `.gitignore`, so the config also
  ignores the build output and the leftover Jekyll folders (`vendor/`, `_site/`).
  The four `eslint-disable-next-line` comments in `src/` must still refer to
  rules that exist.
- `.github/workflows/` deploy workflow: `npm run lint` before `npm run build`.
- `next.config.js`: `agentRules: false`, so `next dev` doesn't append its
  managed block to `AGENTS.md` when it detects an AI agent. Next 16.3.8 checks
  this setting in `server/lib/start-server.js`.
- `AGENTS.md`: update the `npm run lint` comment, and add one line to the Docs
  index pointing agents at the docs bundled with the installed Next version,
  `node_modules/next/dist/docs/`.
- `docs/ACCESSIBILITY.md`: update the reference to `.eslintrc.json`.
- No changes expected in `src/`.

**Commit 2: new lint findings**

- Whatever the newer plugins flag; unknown until commit 1 runs lint.

**Commit 3: React 19**

- `package.json` / `package-lock.json`: the React bumps above.
- `src/components/PostPreviewPanel.tsx`: takes `ref` as a prop instead of
  using `forwardRef`.
- Possible type fixes around `react-markdown` (see Risks).

## Risks

- **`react-markdown` 8 types with `@types/react` 19.** `react-markdown` 8's
  type files use the global `JSX` namespace, which `@types/react` 19 removes.
  `Code.tsx` imports `ReactMarkdownProps` from those types. `skipLibCheck` hides
  errors inside the type files themselves, but the types `Code.tsx` relies on
  may stop resolving. If they do, prefer a small fix in this repo's types;
  upgrading `react-markdown` to a newer major changes its API and would be a
  separate change. `@fortawesome/react-fontawesome` 0.2.6 has the same issue
  in one place (`JSX.Element` as `FontAwesomeIcon`'s return type).
- **Turbopack output.** Covered by the `out/` comparison in commit 1.
