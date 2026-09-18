/**
 * sw.js — offline shell, and the receiving end of the Android share sheet.
 *
 * The share target is the reason this app exists, and it lives here because a
 * POST cannot be handled by a page: Android posts multipart form data to the
 * manifest's share action, and only a service worker can intercept it, keep the
 * file, and redirect somewhere the app can pick it up.
 *
 * Everything is resolved against `self.registration.scope` rather than written
 * as an absolute path. This ships under /Portfolio-/expense/, so a leading "/"
 * anywhere here would point at the domain root and quietly break the whole
 * flow.
 */

const VERSION = "tally-v3";
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

// Deliberately not versioned: an update must not throw away an image that the
// share sheet handed over seconds ago.
const SHARE_CACHE = "tally-share";
const SHARE_KEY = "shared-image";
const SHARE_TEXT_KEY = "shared-text";

const SCOPE = self.registration.scope;
const inScope = (path) => new URL(path, SCOPE).href;

const SHELL = [
  "",
  "index.html",
  "manifest.json",
  "styles/app.css",
  "src/base.js",
  "src/app.js",
  "src/store.js",
  "src/ui.js",
  "src/categories.js",
  "src/parse.js",
  "src/ocr.js",
  "src/csv.js",
  "src/home.js",
  "src/plan.js",
  "src/gym.js",
  "src/gymscreen.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/monochrome-512.png",
].map(inScope);

// The OCR engine and its language data are large and come from a CDN. Caching
// them on first use is what turns "needs a connection" into "works in airplane
// mode" for every run after the first.
const RUNTIME_HOSTS = ["cdn.jsdelivr.net", "tessdata.projectnaptha.com"];

/* ---------- lifecycle ---------- */

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // reload: skip the HTTP cache, so a deploy is actually picked up.
    await Promise.allSettled(SHELL.map((u) => cache.add(new Request(u, { cache: "reload" }))));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL_CACHE, RUNTIME_CACHE, SHARE_CACHE]);
    const names = await caches.keys();
    await Promise.all(names.filter((n) => !keep.has(n)).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

/* ---------- the share target ---------- */

/** A Blob or File — checked by behaviour, because a share can arrive with an
 *  empty or generic MIME type and still be a perfectly good screenshot. */
const isFile = (v) => v && typeof v === "object" && typeof v.arrayBuffer === "function";

async function handleShare(request) {
  const received = { fields: [], fileType: null, title: "", text: "" };

  try {
    const form = await request.formData();
    received.fields = [...form.keys()];
    received.title = String(form.get("title") || "");
    received.text = String(form.get("text") || "");

    // "image" is the field name declared in the manifest. Senders relabel it,
    // and Android hands screenshots over with a generic type often enough that
    // filtering on image/* alone silently drops real ones — so: the declared
    // field, else an image-typed part, else ANY file at all. The page decodes
    // it; if it is not really an image, that is where it fails, visibly.
    let file = form.get("image");
    if (!isFile(file)) {
      const files = [...form.values()].filter(isFile);
      file = files.find((f) => String(f.type || "").startsWith("image/")) || files[0] || null;
    }

    const cache = await caches.open(SHARE_CACHE);

    if (isFile(file)) {
      received.fileType = file.type || "unknown";
      await cache.put(
        inScope(SHARE_KEY),
        new Response(file, { headers: { "Content-Type": file.type || "application/octet-stream" } }),
      );
    }

    // Kept whether or not a file came too: it is the fallback the page reads,
    // and the record of what arrived when nothing usable did.
    await cache.put(inScope(SHARE_TEXT_KEY), new Response(JSON.stringify(received), {
      headers: { "Content-Type": "application/json" },
    }));
  } catch {
    // A failed hand-off should still open the app rather than show a browser
    // error page — the page copes with finding nothing waiting for it.
  }

  // 303 so the browser follows with a GET; a 302 would re-issue the POST.
  return Response.redirect(inScope("?shared=1"), 303);
}

/* ---------- fetching ---------- */

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone()).catch(() => {});
  return res;
}

/**
 * The shell is served cache-first, with no background revalidation.
 *
 * Revalidating every asset on every launch was costing ~150KB of network per
 * open to confirm files that cannot have changed: the precache is pinned to
 * VERSION, so a deploy bumps the name, install re-fetches everything with
 * `cache: "reload"`, and activate drops the old cache. Nothing in the current
 * cache is ever stale.
 *
 * On a good connection that waste is invisible. On the 2 KB/s this app is
 * actually used on, it is the difference between opening instantly and
 * appearing to hang. Updates still arrive: the browser byte-compares sw.js on
 * every navigation, which is the one request worth making.
 */
async function shellFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone()).catch(() => {});
    return res;
  } catch {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method === "POST" && url.pathname.endsWith("/share")) {
    event.respondWith(handleShare(request));
    return;
  }

  if (request.method !== "GET") return;

  if (RUNTIME_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  if (url.origin !== location.origin || !url.href.startsWith(SCOPE)) return;

  // A navigation anywhere in scope resolves to the single-page shell, so a
  // deep link or a cold launch offline still opens the app.
  if (request.mode === "navigate") {
    event.respondWith(shellFirst(new Request(inScope("index.html")), SHELL_CACHE));
    return;
  }

  event.respondWith(shellFirst(request, SHELL_CACHE));
});
