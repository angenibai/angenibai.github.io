# Publishing

## Native post

1. Add `_data/posts/YYYY-MM-DD-<slug>.md`, copying the frontmatter reference
   block from `2023-04-08-easter-show-value.md`. The filename is both the URL
   and the reacts key, so don't rename it after publishing: the counts would
   stay under the old key.
2. Put images in `public/img/<slug>/` and run `npm run optimize-images`.
3. Preview with `npm run dev`.
4. Run `npm run reacts:init`. It needs `gcloud auth login` with the
   `blog-reacts` owner account, once per machine. Without this step the react
   bar stays hidden and the browser console warns about the missing doc.
5. Run `npm run build` and `npm run lint`.
6. Commit and merge. Deploy: TBD. `next.config.js` expects a GitHub Pages
   static export, but there's no deploy workflow yet.

## Substack post

1. Add a `_data/posts/YYYY-MM-DD-<slug>.md` entry with `externalLink` set to
   the Substack URL, and a one-line body linking to it (see
   `2026-07-31-chasing-summer.md`).
2. Put the splash image in `public/img/substack/` and run
   `npm run optimize-images`.
3. No reacts step: Substack posts don't get a react bar.

## Firestore rules

Edit `firestore.rules`, then deploy with
`npx firebase-tools deploy --only firestore:rules` (logged in with
`npx firebase-tools login` as the `blog-reacts` owner).
