/* NeuroPlay service worker — offline-first app shell.
   Bump CACHE when files change to roll the cache over. */
const CACHE = "neuroplay-v8";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./styles/app.css",
  "./assets/icon.svg",
  "./assets/icon-maskable.svg",
  "./src/app.js",
  "./src/store.js",
  "./src/catalog.js",
  "./src/session.js",
  "./src/analytics.js",
  "./src/seed.js",
  "./src/i18n.js",
  "./src/tts.js",
  "./src/voicebank.js",
  "./src/icons.js",
  "./src/ui.js",
  "./src/charts.js",
  "./src/theme.js",
  "./src/progress.js",
  "./src/screens/chrome.js",
  "./src/screens/splash.js",
  "./src/screens/settings.js",
  "./src/screens/tour.js",
  "./src/screens/progress.js",
  "./src/screens/onboarding.js",
  "./src/screens/home.js",
  "./src/screens/games-menu.js",
  "./src/screens/caregiver/pin.js",
  "./src/screens/caregiver/dashboard.js",
  "./src/screens/caregiver/content.js",
  "./src/screens/caregiver/report.js",
  "./src/screens/games/runner.js",
  "./src/screens/games/pattern.js",
  "./src/screens/games/number.js",
  "./src/screens/games/word-recall.js",
  "./src/screens/games/orientation.js",
  "./src/screens/games/card-match.js",
  "./src/screens/games/money.js",
  "./src/screens/memory/memory.js",
  "./src/screens/memory/emergency.js",
  "./audio/index.json",
  "./i18n/en.json",
  "./i18n/hi.json",
  "./i18n/as.json",
  "./i18n/ne.json",
];

/* Voice recordings, if the voicebank has been generated. They are listed in
   a per-language manifest rather than here, so precaching means reading it
   first — otherwise the app would only sound human until the phone goes
   offline, which is exactly when it matters most. */
async function audioUrls() {
  let langs = [];
  try {
    const ir = await fetch("./audio/index.json", { cache: "no-cache" });
    if (ir.ok) langs = (await ir.json()).langs || [];
  } catch { /* no voicebank in this build */ }
  const urls = [];
  await Promise.all(langs.map(async (l) => {
    try {
      const res = await fetch(`./audio/${l}/manifest.json`, { cache: "no-cache" });
      if (!res.ok) return;
      const { ids = [], ext = "mp3" } = await res.json();
      if (!ids.length) return;
      urls.push(`./audio/${l}/manifest.json`, ...ids.map((id) => `./audio/${l}/${id}.${ext}`));
    } catch { /* no voicebank for this language */ }
  }));
  return urls;
}

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(async (c) => {
        await Promise.allSettled(SHELL.map((u) => c.add(u)));
        const extra = await audioUrls();
        await Promise.allSettled(extra.map((u) => c.add(u)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
