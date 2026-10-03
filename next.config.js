/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Stops next dev from writing its own block into AGENTS.md and CLAUDE.md.
  agentRules: false,
  // Static export for GitHub Pages, which serves files only. Each page is
  // written as <route>/index.html, so /posts and /posts/<slug> never collide
  // as a file and a folder.
  output: "export",
  trailingSlash: true,
  images: {
    // Export can't use the built-in optimizer, which needs a server.
    unoptimized: true,
  },
};

module.exports = nextConfig;
