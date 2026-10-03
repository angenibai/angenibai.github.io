import site from "../../_data/site.json";

export default site;

// Pages end in "/" to match trailingSlash in next.config.js, since that's
// the URL GitHub Pages serves without a redirect. A path whose last segment
// has an extension, like /feed.xml, is a file and keeps its name.
const isFile = (path: string) => /\.[^/]*$/.test(path);

export const absoluteUrl = (path: string) =>
  path.endsWith("/") || isFile(path)
    ? `${site.url}${path}`
    : `${site.url}${path}/`;
