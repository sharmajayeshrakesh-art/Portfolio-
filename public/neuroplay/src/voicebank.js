/**
 * voicebank.js — pre-recorded speech, so the app does not depend on the
 * phone's robotic TTS engine.
 *
 * Why this exists: the Web Speech API can only ever sound as good as the
 * engine installed on the device, and on a budget Android that is usually an
 * old formant engine. A ChatGPT-quality voice is a neural model running on a
 * server — which we cannot use, because this app must work in airplane mode.
 *
 * The way real kiosk and accessibility products solve this is to ship the
 * audio. NeuroPlay speaks a largely FIXED set of phrases, so each one can be
 * rendered once by a good neural voice (or recorded by an actual person) and
 * bundled. At runtime we just play a file: human-sounding, instant, offline,
 * and identical on every phone.
 *
 * Clips are addressed by a hash of the phrase, so no call site has to change —
 * speak() splits what it is given into phrases and plays a recording for each
 * one that has it. Anything genuinely dynamic (dates, counts, a relative's
 * name) has no clip and falls back to synthesis.
 */

let _lang = null;
let _ids = new Set();
let _ext = "mp3";
let _audio = null;
let _seq = 0;
let _index = null;      // which languages have a bank at all          // bumped on cancel, so a stopped clip never chains onward

/**
 * Normalise a phrase before hashing: collapse whitespace and drop trailing
 * sentence punctuation. Call sites join phrases with full stops ("Game
 * complete. Well done"), while the recordings are made from the raw
 * translation strings — this is what makes the two match.
 * Must stay identical to norm() in scripts/build-voicebank.py.
 */
export function norm(text) {
  return String(text).replace(/\s+/g, " ").trim().replace(/[.!?।\s]+$/u, "");
}

/** FNV-1a over UTF-8. Must match clip_id() in the generator script exactly. */
export function clipId(text) {
  const bytes = new TextEncoder().encode(norm(text));
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** Inlined clips (single-file offline build) take priority over fetching. */
function inlined(lang, id) {
  const bank = globalThis.__NP_AUDIO__;
  return bank && bank[lang] && bank[lang][id];
}

export async function loadVoicebank(lang) {
  if (_lang === lang) return _ids.size;
  _lang = lang;
  _ids = new Set();
  _ext = "mp3";

  const bank = globalThis.__NP_AUDIO__;
  if (bank && bank[lang]) {
    _ids = new Set(Object.keys(bank[lang]));
    return _ids.size;
  }
  try {
    // One tiny index says which languages have recordings, so a build with no
    // voicebank makes exactly one request and never 404s per language.
    if (!_index) {
      const ir = await fetch(new URL("../audio/index.json", import.meta.url));
      _index = ir.ok ? ((await ir.json()).langs || []) : [];
    }
    if (!_index.includes(lang)) return 0;
    const res = await fetch(new URL(`../audio/${lang}/manifest.json`, import.meta.url));
    if (res.ok) {
      const j = await res.json();
      _ids = new Set(j.ids || []);
      if (j.ext) _ext = String(j.ext).replace(/[^a-z0-9]/gi, "");
    }
  } catch { /* no voicebank for this language — synthesis will cover it */ }
  return _ids.size;
}

/** Which language the loaded clips are in (null if none loaded). */
export function voicebankLang() { return _lang; }
export function clipCount() { return _ids.size; }

export function hasClip(text) {
  return _ids.size > 0 && _ids.has(clipId(text));
}

/**
 * Play the recording for this phrase.
 * `onend` fires when it finishes (or immediately on failure) so the caller can
 * move on to the next phrase. Returns false if there is no recording.
 */
export function playClip(text, { rate = 1, onend } = {}) {
  const id = clipId(text);
  if (!_ids.has(id)) return false;
  stopClip();
  const mySeq = ++_seq;
  const src = inlined(_lang, id) || new URL(`../audio/${_lang}/${id}.${_ext}`, import.meta.url).href;
  try {
    const a = new Audio(src);
    _audio = a;
    // keep it natural: only slow down, never speed up past normal
    a.playbackRate = rate < 0.95 ? 0.9 : 1;
    const done = () => {
      if (mySeq !== _seq) return;      // superseded or cancelled
      _audio = null;
      onend && onend();
    };
    a.addEventListener("ended", done, { once: true });
    a.addEventListener("error", done, { once: true });
    a.play().catch(done);
    return true;
  } catch {
    return false;
  }
}

export function stopClip() {
  _seq++;                       // invalidate any pending "finished" callback
  if (_audio) {
    const a = _audio;
    _audio = null;
    try { a.pause(); } catch { /* no-op */ }
  }
}
