/**
 * familyvoice.js — the app speaking in a relative's own voice.
 *
 * The ask was "voice-cloned kinship guidance". Cloning is the wrong tool here
 * and we should be plain about why: a model good enough to clone a voice does
 * not run on a ₹6,000 phone in airplane mode, and cloning a family member so
 * an app can address a confused patient in their voice is a consent problem
 * before it is an engineering one — the patient cannot tell it is not really
 * their daughter speaking.
 *
 * Recording the daughter gets the same clinical benefit with none of that.
 * Familiar-voice prompting is a real technique: a known voice is processed
 * along better-preserved pathways than a stranger's, so instructions land when
 * a synthetic prompt does not, and it is calming rather than merely clearer.
 *
 * Mechanically it is the voicebank one layer up. A recording is stored against
 * the same phrase hash the bundled clips use, so it simply wins:
 *
 *     family recording  →  bundled clip  →  device speech synthesis
 *
 * Everything stays in IndexedDB. No upload, no model, no account.
 */

import { store } from "./store.js";
import { clipId } from "./voicebank.js";

let _lang = null;
let _ids = new Set();
let _urls = new Map();     // id -> object URL, made once and reused
let _audio = null;
let _seq = 0;
let _enabled = true;

/**
 * The phrases worth recording, most valuable first.
 *
 * Recording 200 lines is something nobody finishes; these 24 cover the
 * greeting, every piece of encouragement, and the emergency and orientation
 * prompts — which is most of what the patient actually hears in a day. The
 * screen records them in this order so a caregiver who stops after ten
 * minutes has still covered the phrases that matter.
 */
export const CORE_KEYS = [
  "greeting_morning", "greeting_afternoon", "greeting_evening",
  "well_done", "good_try", "lets_continue",
  "start_playing", "game_complete", "play_again",
  "app_tagline", "tap_to_hear", "play_games",
  "memory_help", "reminders", "emergency", "call_now",
  "word_odd_prompt", "game_money_prompt", "game_pattern_desc",
  "orient_q_day", "orient_q_part", "orient_q_season",
  "play_today_hint", "guide_voice_sample",
];

/** Best recording format this browser can actually produce. */
export function recorderMime() {
  if (typeof MediaRecorder === "undefined") return null;
  for (const m of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return "";
}

export function canRecord() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && recorderMime() !== null);
}

export async function initFamilyVoice(lang) {
  _enabled = (await store.getSetting("familyVoiceOn", true)) !== false;
  return loadFamilyVoice(lang);
}

export async function loadFamilyVoice(lang) {
  if (_lang !== lang) {
    for (const url of _urls.values()) URL.revokeObjectURL(url);
    _urls.clear();
  }
  _lang = lang;
  _ids = new Set();
  try {
    const rows = await store.voiceClipsFor(lang);
    for (const r of rows) if (r && r.blob) _ids.add(r.id);
  } catch { /* first run, or the store is not there yet */ }
  return _ids.size;
}

export function familyVoiceCount() { return _ids.size; }
export function familyVoiceOn() { return _enabled && _ids.size > 0; }
export async function setFamilyVoiceOn(on) {
  _enabled = !!on;
  await store.setSetting("familyVoiceOn", _enabled);
}

export function hasFamilyClip(text) {
  return _enabled && _ids.has(clipId(text));
}

/** Who recorded these, shown to the caregiver. */
export function speakerName() { return store.getSetting("familyVoiceName", null); }
export function setSpeakerName(name) { return store.setSetting("familyVoiceName", name || null); }

async function urlFor(id) {
  if (_urls.has(id)) return _urls.get(id);
  const row = await store.voiceClip(id);
  if (!row || !row.blob) return null;
  const url = URL.createObjectURL(row.blob);
  _urls.set(id, url);
  return url;
}

/**
 * Play the family recording for this phrase.
 * Returns true if one exists — the caller should then do nothing else.
 * Fetching the blob is async, so `onend` also fires if playback never starts,
 * which keeps a queue of phrases moving rather than stalling on a bad clip.
 */
export function playFamilyClip(text, { onend } = {}) {
  const id = clipId(text);
  if (!_enabled || !_ids.has(id)) return false;
  stopFamilyClip();
  const mySeq = ++_seq;
  urlFor(id).then((url) => {
    if (mySeq !== _seq) return;
    if (!url) { onend && onend(); return; }
    const a = new Audio(url);
    _audio = a;
    const done = () => {
      if (mySeq !== _seq) return;
      _audio = null;
      onend && onend();
    };
    a.addEventListener("ended", done, { once: true });
    a.addEventListener("error", done, { once: true });
    a.play().catch(done);
  }).catch(() => onend && onend());
  return true;
}

export function stopFamilyClip() {
  _seq++;
  if (_audio) {
    const a = _audio;
    _audio = null;
    try { a.pause(); } catch { /* no-op */ }
  }
}

/** Store one recording against a phrase. */
export async function saveFamilyClip({ lang, text, blob }) {
  const id = clipId(text);
  await store.saveVoiceClip({ id, lang, text, blob, at: Date.now() });
  const old = _urls.get(id);
  if (old) { URL.revokeObjectURL(old); _urls.delete(id); }
  if (lang === _lang) _ids.add(id);
  return id;
}

export async function removeFamilyClip(lang, text) {
  const id = clipId(text);
  await store.deleteVoiceClip(id);
  const old = _urls.get(id);
  if (old) { URL.revokeObjectURL(old); _urls.delete(id); }
  _ids.delete(id);
}

/** For previewing a single recording in the studio. */
export async function previewFamilyClip(text) {
  const id = clipId(text);
  const url = await urlFor(id);
  if (!url) return false;
  stopFamilyClip();
  const a = new Audio(url);
  _audio = a;
  a.play().catch(() => {});
  return true;
}
