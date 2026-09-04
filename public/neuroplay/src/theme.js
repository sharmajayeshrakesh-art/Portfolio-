/**
 * theme.js — Day ("Sand and Clay") / Night ("Warm Night") / Automatic.
 *
 * "Automatic" switches at dusk: night from 6pm to 6am. Whatever the
 * preference, we always stamp a concrete data-theme on <html> so the CSS only
 * ever deals with "day" or "night", and we keep the browser/Android status
 * bar colour in step so the app does not sit under a mismatched strip.
 */

import { store } from "./store.js";

export const THEMES = ["day", "night", "auto"];

export function resolveTheme(pref) {
  if (pref === "day" || pref === "night") return pref;
  const h = new Date().getHours();
  return h >= 18 || h < 6 ? "night" : "day";
}

/* Status-bar colour per theme — the band colour each palette is built on. */
const BAR = { day: "#7c4020", night: "#533020" };

export function stamp(pref) {
  const theme = resolveTheme(pref);
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", BAR[theme]);
}

export async function applyStoredTheme() {
  const pref = await store.getSetting("theme", "auto");
  stamp(pref);
  return pref;
}

export async function setTheme(pref) {
  await store.setSetting("theme", pref);
  stamp(pref);
  return pref;
}

export function themePref() {
  return store.getSetting("theme", "auto");
}
