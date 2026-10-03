// Write public/feed.xml, an RSS 2.0 feed of the listed posts. It is served at
// the same path as the old Jekyll feed, so existing subscribers carry over.
// Items carry a short description rather than the full post, so readers click
// through to the site (or to Substack for posts with an `externalLink`).
// Runs as `prebuild`; run it alone with `npm run feed`. The output is
// gitignored.
//
// Usage: tsx scripts/generate-feed.ts

import fs from "fs";
import path from "path";
import { getListedPosts } from "@/lib/api";
import site, { absoluteUrl } from "@/lib/site";

const escapeXml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const main = () => {
  const posts = getListedPosts().sort((a, b) =>
    b.metadata.date.localeCompare(a.metadata.date),
  );

  const items = posts
    .map(({ slug, excerpt, metadata }) => {
      const link = metadata.externalLink ?? absoluteUrl(`/posts/${slug}`);
      // Substack posts only hold a "find this on Substack" line in their body,
      // so the blurb is the better description when there is one.
      const description = metadata.blurb ?? excerpt ?? "";
      const creator = metadata.author?.name ?? site.author;

      return `    <item>
      <title>${escapeXml(metadata.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(metadata.date).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(creator)}</dc:creator>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escapeXml(site.description)}</description>
    <language>en-au</language>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  fs.writeFileSync(path.join(process.cwd(), "public/feed.xml"), xml);
};

main();
