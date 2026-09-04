/**
 * app.js — bootstrap + router + shared context.
 *
 * Boots the offline data layer, i18n and TTS, decides first-run vs returning,
 * and renders screens into #app. Screens are plain functions that return a DOM
 * node and receive a shared `ctx` with helpers.
 */

import { store } from "./store.js";
import { initI18n, setLanguage, currentLang, t, onLanguageChange } from "./i18n.js";
import { initTTS, speak, cancel } from "./tts.js";
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

function navigate(name, params = {}) {
  cancel(); // stop any in-progress speech on navigation
  const render = ROUTES[name] || ROUTES.home;
  // caregiver area is gated behind the PIN
  const gated = ["dashboard", "content", "report"];
  if (gated.includes(name) && !_caregiverUnlocked) {
    return renderInto(ROUTES.pin, { next: name, params });
  }
  location.hash = "#/" + name;
  renderInto(render, params);
}

function renderInto(render, params) {
  const node = render(ctx, params || {});
  mount(root, node);
}

async function boot() {
  await store.getSettings(); // warms the DB
  await initI18n();
  await initTTS();

  const savedMode = await store.getSetting("mode", "elder");
  document.documentElement.dataset.mode = savedMode;

  onLanguageChange(() => {
    // re-render current screen on language switch
    const cur = (location.hash.replace("#/", "") || "home").split("/")[0];
    navigate(ROUTES[cur] ? cur : "home");
  });

  const done = await store.getSetting("onboarded", false);
  navigate(done ? "home" : "onboarding");

  // register service worker (offline)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(new URL("../sw.js", import.meta.url), { scope: "./" }).catch(() => {});
  }
}

window.addEventListener("DOMContentLoaded", boot);
export { ctx };
