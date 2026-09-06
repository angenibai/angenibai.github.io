/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Likely deploy target is GitHub Pages (static export), which requires
    // this or a custom loader - the built-in on-the-fly optimizer needs a
    // server. Harmless under a Node host too: images just skip the
    // optimizer there instead of erroring.
    unoptimized: true,
  },
}

module.exports = nextConfig
