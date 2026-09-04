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
  { code: "en", label: "English", native: "English", locale: "en-IN", ready: true },
  { code: "hi", label: "Hindi", native: "हिन्दी", locale: "hi-IN", ready: true },
  { code: "bn", label: "Bengali", native: "বাংলা", locale: "bn-IN", ready: false },
  { code: "mr", label: "Marathi", native: "मराठी", locale: "mr-IN", ready: false },
  { code: "ta", label: "Tamil", native: "தமிழ்", locale: "ta-IN", ready: false },
  { code: "te", label: "Telugu", native: "తెలుగు", locale: "te-IN", ready: false },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", locale: "gu-IN", ready: false },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", locale: "kn-IN", ready: false },
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
