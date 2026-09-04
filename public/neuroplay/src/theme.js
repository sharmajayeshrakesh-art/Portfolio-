/**
 * theme.js — Day / Night / Automatic.
 *
 * "Automatic" is dusk-aware: night from 6pm to 6am, which is the whole point
 * of the palette. Whatever the preference, we always stamp a concrete
 * data-theme on <html> so the CSS only ever deals with "day" or "night".
 */

import { store } from "./store.js";

export const THEMES = ["day", "night", "auto"];

export function resolveTheme(pref) {
  if (pref === "day" || pref === "night") return pref;
  const h = new Date().getHours();
  return h >= 18 || h < 6 ? "night" : "day";
}

export function stamp(pref) {
  document.documentElement.dataset.theme = resolveTheme(pref);
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
