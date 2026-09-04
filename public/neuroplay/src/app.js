/**
 * app.js — bootstrap + router + shared context.
 *
 * Boots the offline data layer, i18n and TTS, decides first-run vs returning,
 * and renders screens into #app. Screens are plain functions that return a DOM
 * node and receive a shared `ctx` with helpers.
 */

import { store } from "./store.js";
import { initI18n, setLanguage, currentLang, t, onLanguageChange } from "./i18n.js";
import { initTTS, speak, cancel, refreshVoicebank } from "./tts.js";
import { mount } from "./ui.js";

import { renderOnboarding } from "./screens/onboarding.js";
import { renderHome } from "./screens/home.js";
import { renderGamesMenu } from "./screens/games-menu.js";
import { renderPin } from "./screens/caregiver/pin.js";
import { renderDashboard } from "./screens/caregiver/dashboard.js";
import { renderContent } from "./screens/caregiver/content.js";
import { renderReport } from "./screens/caregiver/report.js";
import { renderGame } from "./screens/games/runner.js";
import { renderMemory } from "./screens/memory/memory.js";
import { renderEmergency } from "./screens/memory/emergency.js";
import { renderSettings } from "./screens/settings.js";
import { renderTour } from "./screens/tour.js";
import { renderProgress } from "./screens/progress.js";
import { renderCalm } from "./screens/calm.js";
import { renderVoiceStudio } from "./screens/caregiver/voice.js";
import { renderUpdate } from "./screens/caregiver/update.js";
import { calmSettings, inWindow, stampCalm, dismissedToday } from "./calm.js";
import { el } from "./ui.js";
import { showSplash } from "./screens/splash.js";
import { applyStoredTheme } from "./theme.js";

const root = document.getElementById("app");

const ROUTES = {
  onboarding: renderOnboarding,
  home: renderHome,
  games: renderGamesMenu,
  game: renderGame,
  pin: renderPin,
  dashboard: renderDashboard,
  content: renderContent,
  report: renderReport,
  memory: renderMemory,
  emergency: renderEmergency,
  settings: renderSettings,
  tour: renderTour,
  progress: renderProgress,
  calm: renderCalm,
  voicestudio: renderVoiceStudio,
  update: renderUpdate,
};

const ctx = {
  t,
  speak,
  store,
  get lang() { return currentLang(); },
  async setLang(code) { await setLanguage(code); },
  get mode() { return document.documentElement.dataset.mode || "elder"; },
  setMode(m) {
    document.documentElement.dataset.mode = m;
    store.setSetting("mode", m);
  },
  navigate,
};

let _caregiverUnlocked = false;
ctx.isCaregiverUnlocked = () => _caregiverUnlocked;
ctx.unlockCaregiver = () => { _caregiverUnlocked = true; };
ctx.lockCaregiver = () => { _caregiverUnlocked = false; };

let _route = null;
let _syncCalm = null;      // set once the stored calm settings are loaded

function navigate(name, params = {}) {
  cancel(); // stop any in-progress speech on navigation
  const render = ROUTES[name] || ROUTES.home;
  // caregiver area is gated behind the PIN
  const gated = ["dashboard", "content", "report", "voicestudio", "update"];
  if (gated.includes(name) && !_caregiverUnlocked) {
    return renderInto(ROUTES.pin, { next: name, params });
  }
  _route = name;
  location.hash = "#/" + name;
  renderInto(render, params);
  // Landing on home is the moment to check the sundowning window — waiting for
  // the next minute tick would let someone sit on a bright home screen at 6pm.
  if (name === "home" && _syncCalm) _syncCalm();
}

/* Follow hash changes, so a deep link like #/settings works on an already
   open app and the Android back button steps back through screens. */
window.addEventListener("hashchange", () => {
  const name = (location.hash.replace("#/", "").split("/")[0] || "home").trim();
  if (ROUTES[name] && name !== _route) navigate(name);
});

function renderInto(render, params) {
  const node = render(ctx, params || {});
  mount(root, node);
}

async function boot() {
  const splash = showSplash({ name: "NeuroPlay", tagline: "Play a little every day" });

  await store.getSettings(); // warms the DB
  await initI18n();
  await initTTS();

  const savedMode = await store.getSetting("mode", "elder");
  document.documentElement.dataset.mode = savedMode;

  // Day / Night / Automatic
  await applyStoredTheme();

  // Display size — Balanced is the default; Large is opt-in.
  const size = await store.getSetting("displaySize", "balanced");
  if (size === "large") document.documentElement.dataset.size = "large";
  else delete document.documentElement.dataset.size;

  // Sundowning: dim the whole app while the window is open, and re-check on a
  // slow timer so an app left running crosses into it on its own. Four in the
  // afternoon is when this starts to matter; nobody will be tapping a button.
  const calmCfg = await calmSettings();
  const syncCalm = _syncCalm = async () => {
    const open = inWindow(calmCfg);
    stampCalm(open);
    if (open && calmCfg.auto && _route === "home" && !(await dismissedToday())) {
      navigate("calm");
    }
  };
  setInterval(syncCalm, 60000);

  /* The daily-update nudge. A static app cannot wake itself, so this is
     honestly what it says it is: a reminder shown while the app is open,
     once a day, dismissible. */
  const dayStamp = () => new Date().toISOString().slice(0, 10);
  async function maybeRemind() {
    const at = await store.getSetting("updateReminderAt", null);
    if (!at || document.querySelector(".remind-bar")) return;
    if ((await store.getSetting("updateRemindedOn", null)) === dayStamp()) return;
    const [h, m] = String(at).split(":").map(Number);
    const now = new Date();
    if (now.getHours() * 60 + now.getMinutes() < h * 60 + (m || 0)) return;
    await store.setSetting("updateRemindedOn", dayStamp());
    const bar = el("div.remind-bar", {}, [
      el("span", { text: t("update_title") }),
      el("button.btn.btn-primary", {
        text: t("update_send"),
        onclick: () => { bar.remove(); navigate("update"); },
      }),
      el("button.remind-x", { "aria-label": t("close"), text: "\u00d7", onclick: () => bar.remove() }),
    ]);
    document.body.appendChild(bar);
  }
  setInterval(maybeRemind, 60000);

  onLanguageChange((code) => {
    refreshVoicebank(code);
    const cur = (location.hash.replace("#/", "") || "home").split("/")[0];
    navigate(ROUTES[cur] ? cur : "home");
  });

  // localise the splash for returning users, then reveal the first screen
  splash.setText(t("app_name"), t("app_tagline"));

  // register service worker (offline) — doesn't block the splash.
  // Skipped in the single-file build, which is already fully self-contained.
  try {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register(new URL("../sw.js", import.meta.url), { scope: "./" }).catch(() => {});
    }
  } catch { /* no service worker on file:// */ }

  const done = await store.getSetting("onboarded", false);
  const toured = await store.getSetting("tourDone", false);
  await splash.done();

  // Honour a deep link like #/settings once the user is set up — handy for
  // demos and for sending someone straight to a particular screen.
  const wanted = (location.hash.replace("#/", "").split("/")[0] || "").trim();
  if (done && toured && ROUTES[wanted]) navigate(wanted);
  else navigate(!done ? "onboarding" : !toured ? "tour" : "home");
  await syncCalm();
  await maybeRemind();
}

window.addEventListener("DOMContentLoaded", boot);
export { ctx };
