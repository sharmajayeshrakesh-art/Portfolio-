/** @type {import('next').NextConfig} */

// For GitHub Pages project sites the app is served under /<repo>. The Pages
// workflow sets PAGES=1 so local dev/build stay at the root.
const repo = "Portfolio-";
const isPages = process.env.PAGES === "1";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  basePath: isPages ? `/${repo}` : "",
  assetPrefix: isPages ? `/${repo}/` : "",
  trailingSlash: true,
  // Exposed to the client so plain <img> tags can prefix public assets.
  env: { NEXT_PUBLIC_BASE_PATH: isPages ? `/${repo}` : "" },
};

export default nextConfig;
