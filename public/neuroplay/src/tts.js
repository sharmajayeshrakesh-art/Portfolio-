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
import { currentLocale, currentLang } from "./i18n.js";
import { loadVoicebank, playClip, stopClip, clipCount, voicebankLang } from "./voicebank.js";

const synth = typeof speechSynthesis !== "undefined" ? speechSynthesis : null;

let _enabled = false;
let _voices = [];
let _voiceURI = null;      // explicit choice, if the user made one
let _rate = 0.95;          // 0.85 = slow, 0.95 = natural
let _gen = 0;              // bumped on cancel, so an old queue stops advancing
let _useBank = true;       // play recordings when we have them

/* Names that usually mark a modern neural/enhanced voice. */
const GOOD = /(neural|natural|enhanced|premium|wavenet|journey|studio|siri|google)/i;
/* Names that usually mark the old buzzy formant engines. */
const POOR = /(espeak|pico|compact|eloquence|festival|robot)/i;

export async function initTTS() {
  _enabled = (await store.getSetting("ttsEnabled", false)) === true;
  _useBank = (await store.getSetting("useVoicebank", true)) !== false;
  await loadVoicebank(currentLang());
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

/* Recordings vs the phone's own engine. Choosing a device voice in Settings
   turns the recordings off — otherwise the picker would appear to do nothing,
   which is the exact confusion this whole feature set out to fix. */
export function usingVoicebank() { return _useBank && clipCount() > 0; }
export async function setUseVoicebank(on) {
  _useBank = !!on;
  await store.setSetting("useVoicebank", _useBank);
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

/** Re-point the voicebank after a language change. */
export async function refreshVoicebank(lang) {
  return loadVoicebank(lang || currentLang());
}
/** How many pre-recorded clips are available for the current language. */
export function voicebankSize() { return clipCount(); }

/** One synthesised phrase, calling `then` when the engine finishes with it. */
function sayOne(part, lang, rate, then) {
  try {
    const voice = pickVoice(lang);
    const u = new SpeechSynthesisUtterance(part);
    // Use the VOICE's own language. Forcing a different lang here makes most
    // engines quietly discard the chosen voice and fall back to the system
    // default — which is why picking a voice appeared to do nothing.
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    else u.lang = lang;
    u.rate = rate;
    u.pitch = 1;                            // natural; raising it sounds shrill
    u.volume = 1;
    if (then) { u.onend = then; u.onerror = then; }
    synth.speak(u);
  } catch {
    then && then();
  }
}

/** Speak a phrase in the current (or given) locale. Cancels prior speech. */
export function speak(text, { locale, rate, force = false } = {}) {
  if (!text) return;
  if (!_enabled && !force) return;

  cancel();
  const gen = ++_gen;
  const lang = locale || currentLocale();
  const r = rate || _rate;
  const parts = phrases(text);

  // The voicebank holds recordings for ONE language at a time. If the caller
  // asked for a different locale — previewing a language during setup, say —
  // stay on synthesis rather than play a recording in the wrong language.
  const bank = voicebankLang();
  const usable = _useBank && clipCount() > 0 &&
    (!locale || String(locale).toLowerCase().startsWith(bank || "\u0000"));

  if (!usable) {
    // No recordings: queue every phrase at once. Queuing short utterances
    // gives real pauses at full stops, which is most of what stops speech
    // sounding like a machine reading a wall of text.
    if (!synth) return;
    try { parts.forEach((part, i) => sayOne(part, lang, i === 0 && parts.length > 1 ? r * 0.97 : r)); }
    catch { /* speech unavailable — stay silent rather than break the UI */ }
    return;
  }

  // With recordings in hand we walk the phrases one at a time, playing the
  // human voice where we have it and synthesising only the bits that vary
  // (a date, a count, a relative's name). Mixed, but never robotic throughout.
  // Clips are trimmed of dead air, so without this they would run into each
  // other. A short breath between phrases is what makes a queue of recordings
  // sound like someone talking rather than a list being read out.
  const BREATH = 190;
  let i = 0;
  const next = (pause) => {
    if (gen !== _gen || i >= parts.length) return;
    if (pause) { setTimeout(() => { if (gen === _gen) next(0); }, BREATH); return; }
    const part = parts[i++];
    if (playClip(part, { rate: r, onend: () => next(BREATH) })) return;
    if (!synth) { next(0); return; }
    sayOne(part, lang, r, () => next(0));
  };
  next(0);
}

export function cancel() {
  _gen++;                                   // abandon any queued phrases
  stopClip();
  try { synth && synth.cancel(); } catch { /* no-op */ }
}
