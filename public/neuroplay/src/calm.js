/**
 * calm.js — sundowning support.
 *
 * Sundowning is a real clinical pattern, not a mood: agitation, confusion and
 * fear that rise in the late afternoon and evening, thought to follow the
 * disruption of the circadian clock that comes with dementia. It is one of the
 * most common reasons families stop coping at home.
 *
 * What actually helps is well established and unglamorous — steady low light,
 * reduced stimulation, a familiar voice, orientation ("you are at home, it is
 * evening, dinner is soon"), and slow paced breathing. None of that needs a
 * server, and all of it fits an offline app.
 *
 * Two halves live here:
 *   1. knowing when the window is, and dimming the whole app inside it
 *   2. an ambient sound bed, generated rather than shipped — a few hundred
 *      bytes of Web Audio instead of a licensed music file, and it never
 *      loops audibly because it is not a loop.
 */

import { store } from "./store.js";

const DEFAULT_START = 16;   // 4pm
const DEFAULT_END = 20;     // 8pm

export async function calmSettings() {
  return {
    start: Number(await store.getSetting("calmStart", DEFAULT_START)),
    end: Number(await store.getSetting("calmEnd", DEFAULT_END)),
    auto: (await store.getSetting("calmAuto", true)) !== false,
    sound: (await store.getSetting("calmSound", true)) !== false,
  };
}

export async function setCalmSetting(key, value) {
  return store.setSetting(key, value);
}

/** Is `date` inside the configured sundowning window? */
export function inWindow(cfg, date = new Date()) {
  const h = date.getHours() + date.getMinutes() / 60;
  return cfg.start <= cfg.end
    ? h >= cfg.start && h < cfg.end
    : h >= cfg.start || h < cfg.end;      // window crossing midnight
}

/** Dim and warm the whole app while the window is open. */
export function stampCalm(on) {
  if (on) document.documentElement.dataset.calm = "1";
  else delete document.documentElement.dataset.calm;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

/** "Not now" holds for the rest of today, not forever. */
export async function dismissedToday() {
  return (await store.getSetting("calmDismissed", null)) === todayKey();
}
export async function dismissToday() {
  return store.setSetting("calmDismissed", todayKey());
}

/** Count how often calm mode was actually needed — the caregiver summary uses
    this, and a rising count is itself worth a family knowing about. */
export async function noteCalmOpened() {
  const log = (await store.getSetting("calmLog", {})) || {};
  log[todayKey()] = (log[todayKey()] || 0) + 1;
  for (const k of Object.keys(log)) {                     // keep a month
    if (k < new Date(Date.now() - 31 * 864e5).toISOString().slice(0, 10)) delete log[k];
  }
  await store.setSetting("calmLog", log);
}
export async function calmLog() {
  return (await store.getSetting("calmLog", {})) || {};
}

/* ---------------------------------------------------------------------------
   Ambient bed — generated, never a shipped audio file.

   Filtered noise reads as "room tone" or soft rain, and two quiet sine tones a
   fifth apart give it somewhere to sit without becoming a tune. Slow, offset
   drift on the gains means no phrase ever repeats, so there is no loop point
   for a restless listener to fix on. Everything fades, because a sound that
   starts or stops abruptly is startling — the opposite of the point.
--------------------------------------------------------------------------- */
export function createAmbience() {
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return null;
  let ctx = null, master = null, nodes = [];

  function noiseBuffer(c) {
    const len = c.sampleRate * 4;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    // Pink-ish noise: warmer and far less hissy than white, which matters a
    // lot when the listener is already agitated.
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.0990460;
      b1 = 0.96300 * b1 + w * 0.2965164;
      b2 = 0.57000 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.16;
    }
    return buf;
  }

  function drift(param, base, depth, seconds, phase) {
    const lfo = ctx.createOscillator();
    const amp = ctx.createGain();
    lfo.frequency.value = 1 / seconds;
    lfo.type = "sine";
    amp.gain.value = depth;
    param.value = base;
    lfo.connect(amp).connect(param);
    lfo.start(ctx.currentTime + phase);
    nodes.push(lfo, amp);
  }

  return {
    async start() {
      if (ctx) return;
      ctx = new AC();
      if (ctx.state === "suspended") { try { await ctx.resume(); } catch { /* needs a tap */ } }
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer(ctx);
      noise.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 620;               // takes the edge off entirely
      lp.Q.value = 0.4;
      const ng = ctx.createGain();
      ng.gain.value = 0.5;
      noise.connect(lp).connect(ng).connect(master);
      drift(ng.gain, 0.5, 0.16, 23, 0);       // the bed breathes
      noise.start();
      nodes.push(noise, lp, ng);

      // Two quiet tones, a fifth apart, low enough to feel rather than hear.
      for (const [hz, depth, secs, phase] of [[110, 0.035, 31, 0], [164.81, 0.024, 41, 7]]) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = hz;
        g.gain.value = 0;
        osc.connect(g).connect(master);
        drift(g.gain, depth, depth * 0.7, secs, phase);
        osc.start();
        nodes.push(osc, g);
      }

      master.gain.linearRampToValueAtTime(0.34, ctx.currentTime + 6);   // fade in slowly
    },

    async stop() {
      if (!ctx) return;
      const c = ctx, m = master, ns = nodes;
      ctx = null; master = null; nodes = [];
      try {
        m.gain.cancelScheduledValues(c.currentTime);
        m.gain.setValueAtTime(m.gain.value, c.currentTime);
        m.gain.linearRampToValueAtTime(0, c.currentTime + 2.5);
      } catch { /* already gone */ }
      setTimeout(() => {
        for (const n of ns) { try { n.stop && n.stop(); } catch { /* not a source */ } try { n.disconnect(); } catch { /* no-op */ } }
        try { c.close(); } catch { /* no-op */ }
      }, 2800);
    },

    get running() { return !!ctx; },
  };
}
