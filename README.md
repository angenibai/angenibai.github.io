# angenibai.github.io

Check out the website at [angeni.me](https://angeni.me)

## Develop

```
npm install
npm run dev     # dev server
npm run build   # static export into out/
npm run start   # preview the export
```

See [AGENTS.md](AGENTS.md) for the full command list and architecture, and
[docs/PUBLISHING.md](docs/PUBLISHING.md) for writing a post.

## Deploy

Pushing to `master` runs `.github/workflows/deploy.yml`, which builds the
static export and publishes `out/` to GitHub Pages. Check the Actions tab if a
change doesn't appear. The Pages source must stay "GitHub Actions". The custom
domain `angeni.me` is set in Settings → Pages, not a `CNAME` file. Page URLs
end in `/`.

## Rollback

Re-run the workflow on an earlier commit from the Actions tab
(`workflow_dispatch` on that ref), or revert and push.
