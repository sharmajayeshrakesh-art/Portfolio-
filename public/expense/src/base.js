/**
 * base.js — the one place that knows where the app is deployed.
 *
 * This ships into a GitHub Pages subfolder (/Portfolio-/expense/), so every URL
 * the app builds — service worker, share action, cached shell — has to resolve
 * against that folder. Anything written as "/something" would resolve against
 * the domain root and 404, which is the single most common way a subfolder PWA
 * breaks.
 *
 * import.meta.url already carries the real deployed location, so deriving from
 * it means the same build works at the domain root, in this subfolder, and on
 * localhost with no configuration.
 */

export const APP_NAME = "Kharcha";

/** Absolute URL of the app folder, with a trailing slash. */
export const BASE = new URL("../", import.meta.url);

/** Resolve a path inside the app folder. `url("sw.js")` → ".../expense/sw.js" */
export function url(path) {
  return new URL(String(path).replace(/^\/+/, ""), BASE).href;
}

/** Cache name holding the image handed over by the Android share sheet. */
export const SHARE_CACHE = "kharcha-share";

/** Key inside SHARE_CACHE. Must match sw.js. */
export const SHARE_KEY = "shared-image";
