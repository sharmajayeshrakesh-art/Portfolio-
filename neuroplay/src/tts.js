/**
 * tts.js — voice prompts via the Web Speech API.
 *
 * Android's on-device TTS engine speaks offline for languages the user has
 * installed, which is exactly our deployment target. Everything degrades
 * silently if speech is unavailable so it never blocks the UI.
 */

import { store } from "./store.js";
import { currentLocale } from "./i18n.js";

const synth = typeof speechSynthesis !== "undefined" ? speechSynthesis : null;
let _enabled = true;
let _voices = [];

export async function initTTS() {
  _enabled = (await store.getSetting("ttsEnabled", true)) !== false;
  if (!synth) return;
  const load = () => (_voices = synth.getVoices() || []);
  load();
  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = load;
}

export async function setTTS(on) {
  _enabled = !!on;
  await store.setSetting("ttsEnabled", _enabled);
  if (!_enabled) cancel();
}
export function ttsEnabled() { return _enabled; }

function pickVoice(locale) {
  if (!_voices.length && synth) _voices = synth.getVoices() || [];
  const lang = locale.toLowerCase();
  const short = lang.split("-")[0];
  return (
    _voices.find((v) => v.lang && v.lang.toLowerCase() === lang) ||
    _voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(short)) ||
    null
  );
}

/** Speak a phrase in the current (or given) locale. Cancels prior speech. */
export function speak(text, { locale, rate = 0.92, force = false } = {}) {
  if (!synth || !text) return;
  if (!_enabled && !force) return;
  try {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale || currentLocale();
    const v = pickVoice(u.lang);
    if (v) u.voice = v;
    u.rate = rate;      // calm, unhurried
    u.pitch = 1;
    synth.speak(u);
  } catch { /* no-op */ }
}

export function cancel() {
  try { synth && synth.cancel(); } catch { /* no-op */ }
}
