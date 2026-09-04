/**
 * tts.js — voice prompts via the Web Speech API.
 *
 * Speech quality comes from the device's own TTS engine, so we cannot ship a
 * neural voice in a 100 KB offline app. What we CAN control is most of what
 * makes synthetic speech sound robotic:
 *
 *   1. Voice choice — devices often default to a low-quality formant engine
 *      even when a far better neural voice is installed. We rank and pick.
 *   2. Phrasing — one long flat utterance sounds mechanical. We split on
 *      sentence boundaries and queue them, which restores natural pauses.
 *   3. Pace — elders need unhurried speech, but too slow sounds droning.
 *
 * The caregiver can also pick any installed voice by hand in Settings.
 */

import { store } from "./store.js";
import { currentLocale } from "./i18n.js";

const synth = typeof speechSynthesis !== "undefined" ? speechSynthesis : null;

let _enabled = false;
let _voices = [];
let _voiceURI = null;      // explicit choice, if the user made one
let _rate = 0.95;          // 0.85 = slow, 0.95 = natural

/* Names that usually mark a modern neural/enhanced voice. */
const GOOD = /(neural|natural|enhanced|premium|wavenet|journey|studio|siri|google)/i;
/* Names that usually mark the old buzzy formant engines. */
const POOR = /(espeak|pico|compact|eloquence|festival|robot)/i;

export async function initTTS() {
  _enabled = (await store.getSetting("ttsEnabled", false)) === true;
  _voiceURI = await store.getSetting("voiceURI", null);
  _rate = Number(await store.getSetting("speechRate", 0.95)) || 0.95;
  if (!synth) return;
  const load = () => (_voices = synth.getVoices() || []);
  load();
  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = load;
}

export function ttsEnabled() { return _enabled; }
export async function setTTS(on) {
  _enabled = !!on;
  await store.setSetting("ttsEnabled", _enabled);
  if (!_enabled) cancel();
}

export function speechRate() { return _rate; }
export async function setSpeechRate(r) {
  _rate = Number(r) || 0.95;
  await store.setSetting("speechRate", _rate);
}

export async function setVoice(uri) {
  _voiceURI = uri || null;
  await store.setSetting("voiceURI", _voiceURI);
}
export function currentVoiceURI() { return _voiceURI; }

function allVoices() {
  if (!_voices.length && synth) _voices = synth.getVoices() || [];
  return _voices;
}

/** Score a voice for a locale — higher is better. */
function score(v, locale) {
  const want = locale.toLowerCase();
  const base = want.split("-")[0];
  const lang = (v.lang || "").toLowerCase().replace("_", "-");
  let s = -1000;
  if (lang === want) s = 100;
  else if (lang.startsWith(base)) s = 60;
  else return -1000;                       // wrong language: never use
  if (GOOD.test(v.name)) s += 30;
  if (POOR.test(v.name)) s -= 40;
  if (v.localService) s += 6;              // keeps working offline
  if (v.default) s += 2;
  return s;
}

/** Voices usable for a locale, best first — powers the Settings picker. */
export function listVoices(locale = currentLocale()) {
  return allVoices()
    .map((v) => ({ v, s: score(v, locale) }))
    .filter((x) => x.s > -1000)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.v);
}

function pickVoice(locale) {
  const list = allVoices();
  if (_voiceURI) {
    const chosen = list.find((v) => v.voiceURI === _voiceURI);
    if (chosen) return chosen;             // honour an explicit choice
  }
  return listVoices(locale)[0] || null;
}

/**
 * Break text into speakable phrases. Queuing short utterances gives real
 * pauses at full stops and commas, which is most of what stops speech
 * sounding like a machine reading a wall of text.
 * Handles the Devanagari danda (।) alongside Latin punctuation.
 */
function phrases(text) {
  return String(text)
    .split(/(?<=[.!?।])\s+|\s+·\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Speak a phrase in the current (or given) locale. Cancels prior speech. */
export function speak(text, { locale, rate, force = false } = {}) {
  if (!synth || !text) return;
  if (!_enabled && !force) return;
  try {
    synth.cancel();
    const lang = locale || currentLocale();
    const voice = pickVoice(lang);
    const parts = phrases(text);
    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = lang;
      if (voice) u.voice = voice;
      u.rate = rate || _rate;
      u.pitch = 1;                          // natural; raising it sounds shrill
      u.volume = 1;
      // a touch slower on the opening phrase, so it is easy to catch
      if (i === 0 && parts.length > 1) u.rate = (rate || _rate) * 0.97;
      synth.speak(u);
    });
  } catch { /* speech unavailable — stay silent rather than break the UI */ }
}

export function cancel() {
  try { synth && synth.cancel(); } catch { /* no-op */ }
}
