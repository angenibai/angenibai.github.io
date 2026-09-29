// Write public/sitemap.xml from the listed posts plus the top-level pages.
// Runs as `prebuild`, so `npm run build` always ships a current sitemap; run
// it alone with `npm run sitemap`. The output is gitignored.
//
// Usage: tsx scripts/generate-sitemap.ts

import fs from "fs";
import path from "path";
import { getListedPosts } from "@/lib/api";
import { absoluteUrl } from "@/lib/site";

const PAGE_PATHS = ["/", "/projects", "/posts"];

const main = async () => {
  const posts = await getListedPosts();

  const entries: { path: string; lastmod?: string }[] = [
    ...PAGE_PATHS.map((pagePath) => ({ path: pagePath })),
    ...posts.map((post) => ({
      path: `/posts/${post.slug}`,
      lastmod: (post.metadata.updated ?? post.metadata.date).slice(0, 10),
    })),
  ];

  // Slugs are filenames and dates are ISO strings, so nothing here needs XML
  // escaping.
  const urls = entries
    .map(({ path: entryPath, lastmod }) => {
      const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
      return `  <url><loc>${absoluteUrl(entryPath)}</loc>${lastmodTag}</url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  fs.writeFileSync(path.join(process.cwd(), "public/sitemap.xml"), xml);
};

main();
