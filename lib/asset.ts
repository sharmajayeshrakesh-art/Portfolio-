/**
 * Prefix a public asset path with the deploy base path.
 * On GitHub Pages the site is served under /<repo>, but a plain <img src> does
 * NOT get Next's basePath applied automatically — so we do it here.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(path: string) {
  if (!path.startsWith("/")) return path;
  return `${BASE}${path}`;
}
