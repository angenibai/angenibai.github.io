---
status: draft
date: 2026-10-02
---

# Build-time Markdown

Render post Markdown to HTML during the build instead of in the reader's
browser. Same posts, same libraries, same output; the libraries stop shipping
to the browser. Image weight on the same pages is covered separately in
[2026-10-02-favicon-and-banner-images.md](2026-10-02-favicon-and-banner-images.md).

All numbers were measured on this branch's static export (`next build`,
served locally).

## Problem

`/posts/[slug]` has 125 kB (gzipped) of its own JavaScript. Every other page
has 2–4 kB. Almost all of it is the four libraries that turn Markdown into
HTML:

| Library | Gzipped | What needs it |
|---|---|---|
| react-markdown | 35.5 kB | every post |
| rehype-raw (bundles a full HTML parser) | ~59 kB | raw HTML in the hackathon and easter-show posts (`<figure>`, `<iframe>`, `<img>`) |
| remark-gfm | ~11 kB | `- [x]` checklists (hackathon) and tables (easter show) |
| react-syntax-highlighter + 5 languages | 19.6 kB | the 10 code blocks in the easter-show post |
| **Together** | **123.8 kB** | |

Every library is used by at least one post, so none of them can be dropped.
None of them needs to run in the browser, though: `Code.tsx` and `Image.tsx`
output plain markup with no state or event handlers, and the static export
already contains each post's rendered HTML. On load, the browser downloads
the libraries, re-parses the post's Markdown, and rebuilds HTML identical to
what's already on the page.

GitHub Pages makes this worse for returning readers. It sends
`cache-control: max-age=600` on every file (checked on angeni.me), so after
10 minutes the browser has to re-check the library code with the server
before reusing it.

## Design

`getStaticProps` already runs only at build time. It renders the Markdown
with the same react-markdown setup through `renderToStaticMarkup` and passes
the HTML string to the page, which inserts it with `dangerouslySetInnerHTML`.
Next drops code used only by `getStaticProps` from the browser bundle, so the
four libraries stop shipping. Posts, the libraries and `Code.tsx`/`Image.tsx`
stay as they are.

Before, in `[slug].tsx`:

```tsx
// getStaticProps
props: { source: content, ... }

// page
<div className={...}>
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeRaw] as PluggableList}
    components={{ pre: ({ children }) => <>{children}</>, code: Code, img: Image }}
  >
    {source}
  </ReactMarkdown>
</div>
```

After:

```tsx
// src/lib/renderPost.tsx: imported only by getStaticProps
export const renderPost = (source: string) =>
  renderToStaticMarkup(
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw] as PluggableList}
      components={{ pre: ({ children }) => <>{children}</>, code: Code, img: Image }}
    >
      {source}
    </ReactMarkdown>,
  );

// [slug].tsx
props: { html: renderPost(content), ... }

<div className={...} dangerouslySetInnerHTML={{ __html: html }} />
```

## Benefits

The figures compare a prototype of this design with the current build. Each
is the median of 3 Lighthouse runs, simulating a mid-range phone on slow 4G.

| Post | Build | Text appears | Main image appears | Blocking time | Total download |
|---|---|---|---|---|---|
| hackathon | now | 2.07 s | 4.42 s | 141 ms | 2660 kB |
| | build-time | 2.07 s | 3.31 s | 32 ms | 2552 kB |
| easter show | now | 1.06 s | 12.31 s | 187 ms | 2998 kB |
| | build-time | 1.06 s | 11.94 s | 35 ms | 2888 kB |
| chasing summer | now | 0.91 s | 2.72 s | 36 ms | 899 kB |
| | build-time | 0.91 s | 2.86 s | 8 ms | 786 kB |

- **Post route JavaScript:** 125 kB → 4.88 kB. The total JavaScript for a
  reader's first post goes from 243 kB to 123 kB.
- **Blocking time** (how long the phone is too busy to respond to taps and
  scrolls) drops by 75–80% on every post. The absolute saving is largest on
  long posts: 109 ms on the hackathon post, 152 ms on the easter-show post.
- **Text appears at the same time**, because the export already contained the
  post's HTML.
- **Main image:** 1.1 s sooner on the hackathon post and 0.4 s sooner on the
  easter-show post, because the phone isn't busy with the libraries while the
  image loads. The chasing-summer difference (+0.14 s) is within run-to-run
  noise.

## Trade-offs

- **Payload size:** each post's page data carries HTML instead of Markdown,
  which is slightly larger. Measured gzipped, the hackathon post's body goes
  from 14.2 kB of Markdown to 14.7 kB of HTML, and the easter-show post's from
  6.7 kB to 8.8 kB.
- **No React inside post bodies:** components in a post can't use state,
  hooks or event handlers. Nothing does today; the
  [future embeds](#future-javascript-embeds-in-posts) section covers what to
  do when one needs to.
- **CSS modules need an explicit import:** `Code.module.css` and
  `Image.module.css` would only be imported by build-time code. The prototype
  imported both from `[slug].tsx` and the code-block CSS shipped. I didn't
  test whether Next drops them without that import, so the page keeps both
  imports.
- **Hydration:** React doesn't compare HTML inserted with
  `dangerouslySetInnerHTML` against the server render, so the post body can't
  cause a hydration mismatch.
- **`dangerouslySetInnerHTML`:** safe here because all post content is
  written by the site owner. That assumption has to change if posts ever take
  outside input.

## Option considered: a parsed tree rendered in the browser

The other approach was to build the parsed HTML tree at build time, send it to
the page as JSON, and turn it into React in the browser with
`hast-util-to-jsx-runtime` (10.1 kB). Posts would stay React, so a custom tag
like `<demo-chart>` could map straight to a component.

It wasn't chosen, for two reasons:
- **The page data is bigger.** The hackathon post's tree is 16.1 kB, against
  14.7 kB as HTML, and that's before syntax highlighting.
- **Highlighting would have to be redone.** Keeping react-syntax-highlighter
  in the browser costs 19.6 kB. Highlighting at build time instead means
  rewriting the inline-style theme in `Code.tsx`.

This design plus the embed approach below covers the same future need with
less change.

## Future: JavaScript embeds in posts

Not built now. The approach, if a post needs it:
- **In the post:** a placeholder such as `<div data-embed="skate-map"></div>`.
- **In the post page:** a table maps embed names to components, each loaded
  with `next/dynamic`. After render, the page mounts each component into its
  placeholder.
- **Cost:** a post only downloads the code for the embeds it uses, and posts
  without embeds download nothing extra.

A raw `<script>` in a post's Markdown is unreliable today and stays that way:
it runs on a direct visit, because it's in the static HTML, but not after
client-side navigation from `/posts`, because React 18 doesn't execute
scripts it inserts. Iframes, such as the hackathon post's YouTube embed, work
either way.

## Not proposed

- **Google Analytics** (164 kB, every page): a deliberate choice, not waste.
- **The hackathon post's YouTube iframe** (about 850 kB of player script):
  could become a click-to-load placeholder, but it's one post. Revisit if
  more video embeds are added.

## Components involved

- `src/lib/renderPost.tsx` (new): renders post Markdown to an HTML string at
  build time.
- `src/pages/posts/[slug].tsx` (changed): passes HTML instead of Markdown and
  inserts it; imports the two component CSS modules.
- `src/types/index.tsx` (changed): `PostData` carries HTML instead of
  Markdown.
