import site from "../../_data/site.json";

export default site;

// No trailing slash, matching Next's default routing, so canonicals and
// sitemap entries name the same URL.
export const absoluteUrl = (path: string) =>
  path === "/" ? `${site.url}/` : `${site.url}${path}`;
