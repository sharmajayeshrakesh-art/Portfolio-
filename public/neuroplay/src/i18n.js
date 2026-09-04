/**
 * i18n.js — offline localisation.
 *
 * One JSON file per language under /i18n. English is always loaded as the
 * fallback so a partially-translated language can never show a blank string.
 * Adding a language = drop in a new JSON and add it to LANGUAGES.
 */

import { store } from "./store.js";

// bcp47 locale is used for both fonts and text-to-speech voice selection.
// `ready` marks a fully-translated language. Others appear in the picker to
// show the architecture but are disabled until a native-reviewed file lands.
export const LANGUAGES = [
  // --- widely spoken across India ---
  { code: "en", label: "English",   native: "English",   locale: "en-IN", region: "india", ready: true },
  { code: "hi", label: "Hindi",     native: "हिन्दी",      locale: "hi-IN", region: "india", ready: true },
  { code: "bn", label: "Bengali",   native: "বাংলা",      locale: "bn-IN", region: "india", ready: false },
  { code: "mr", label: "Marathi",   native: "मराठी",      locale: "mr-IN", region: "india", ready: false },
  { code: "ta", label: "Tamil",     native: "தமிழ்",      locale: "ta-IN", region: "india", ready: false },
  { code: "te", label: "Telugu",    native: "తెలుగు",     locale: "te-IN", region: "india", ready: false },
  { code: "gu", label: "Gujarati",  native: "ગુજરાતી",    locale: "gu-IN", region: "india", ready: false },
  { code: "kn", label: "Kannada",   native: "ಕನ್ನಡ",      locale: "kn-IN", region: "india", ready: false },

  // --- North East India ---
  { code: "as", label: "Assamese",  native: "অসমীয়া",     locale: "as-IN", region: "ne", ready: true },
  { code: "ne", label: "Nepali",    native: "नेपाली",      locale: "ne-NP", region: "ne", ready: true },
  { code: "brx", label: "Bodo",     native: "बड़ो",        locale: "brx-IN", region: "ne", ready: false },
  { code: "mni", label: "Manipuri", native: "মৈতৈলোন্",   locale: "mni-IN", region: "ne", ready: false },
  { code: "kha", label: "Khasi",    native: "Ka Ktien Khasi", locale: "kha-IN", region: "ne", ready: false },
  { code: "lus", label: "Mizo",     native: "Mizo ṭawng", locale: "lus-IN", region: "ne", ready: false },
  { code: "grt", label: "Garo",     native: "A·chik",     locale: "grt-IN", region: "ne", ready: false },
  { code: "trp", label: "Kokborok", native: "Kokborok",   locale: "trp-IN", region: "ne", ready: false },
];

export const REGIONS = [
  { id: "india", tKey: "region_india" },
  { id: "ne", tKey: "region_ne" },
];

const _cache = {};
let _current = "en";
let _fallback = null;
const _listeners = new Set();

async function load(code) {
  if (_cache[code]) return _cache[code];
  // The offline single-file build embeds the dictionaries up front, because
  // fetch() is blocked on file:// origins.
  const pre = globalThis.__NP_I18N__ && globalThis.__NP_I18N__[code];
  if (pre) { _cache[code] = pre; return pre; }
  const res = await fetch(new URL(`../i18n/${code}.json`, import.meta.url));
  if (!res.ok) throw new Error(`missing i18n ${code}`);
  const json = await res.json();
  _cache[code] = json;
  return json;
}

export async function initI18n() {
  _fallback = await load("en");
  const saved = await store.getSetting("language", null);
  if (saved) await setLanguage(saved, false);
  return _current;
}

export async function setLanguage(code, persist = true) {
  try {
    await load(code);
    _current = code;
  } catch {
    _current = "en"; // graceful fallback
  }
  if (persist) await store.setSetting("language", _current);
  document.documentElement.lang = _current;
  _listeners.forEach((fn) => fn(_current));
  return _current;
}

export function onLanguageChange(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

export function currentLang() {
  return _current;
}
export function currentLocale() {
  return (LANGUAGES.find((l) => l.code === _current) || LANGUAGES[0]).locale;
}

/** Translate a key, with {name} style interpolation and English fallback. */
export function t(key, vars) {
  const dict = _cache[_current] || {};
  let str = dict[key];
  if (str == null && _fallback) str = _fallback[key];
  if (str == null) str = key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }
  }
  return str;
}


/* ---------------------------------------------------------------------
 * Dates. Intl has no data for several Indian languages (Assamese among
 * them) and silently falls back to English, which would leave "Friday"
 * sitting in the middle of an Assamese screen. When a language file ships
 * its own calendar names we use those, and fall back to Intl otherwise.
 * ------------------------------------------------------------------- */
function names(key) {
  const dict = _cache[_current] || {};
  return Array.isArray(dict[key]) ? dict[key] : null;
}

export function fmtWeekday(date = new Date()) {
  const w = names("weekdays");
  if (w) return w[date.getDay()];
  return new Intl.DateTimeFormat(currentLocale(), { weekday: "long" }).format(date);
}

export function fmtWeekdayNarrow(date = new Date()) {
  const w = names("weekdays");
  if (w) return [...w[date.getDay()]][0];
  return new Intl.DateTimeFormat(currentLocale(), { weekday: "narrow" }).format(date);
}

export function fmtDayMonth(date = new Date()) {
  const m = names("months");
  if (m) return `${date.getDate()} ${m[date.getMonth()]}`;
  return new Intl.DateTimeFormat(currentLocale(), { day: "numeric", month: "long" }).format(date);
}
