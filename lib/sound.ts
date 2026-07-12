"use client";

/**
 * Sound-ready architecture. MUTED by default, never autoplays.
 * Audio is only unlocked after an explicit user gesture (the sound toggle).
 * Cues are tiny WebAudio blips so no asset files are required yet; swap
 * `playCue` internals for sample playback later without touching call sites.
 */

type Cue = "tap" | "reveal" | "hover" | "open";

let ctx: AudioContext | null = null;
let enabled = false;

const listeners = new Set<(on: boolean) => void>();

export function isSoundEnabled() {
  return enabled;
}

export function onSoundChange(cb: (on: boolean) => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function enableSound() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AC();
  }
  ctx.resume();
  enabled = true;
  listeners.forEach((l) => l(true));
}

export function disableSound() {
  enabled = false;
  listeners.forEach((l) => l(false));
}

export function toggleSound() {
  if (enabled) disableSound();
  else enableSound();
}

const CUES: Record<Cue, { freq: number; dur: number; gain: number }> = {
  tap: { freq: 420, dur: 0.05, gain: 0.05 },
  hover: { freq: 660, dur: 0.03, gain: 0.025 },
  reveal: { freq: 300, dur: 0.09, gain: 0.035 },
  open: { freq: 520, dur: 0.12, gain: 0.05 },
};

export function playCue(cue: Cue) {
  if (!enabled || !ctx) return;
  const { freq, dur, gain } = CUES[cue];
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur + 0.02);
}
