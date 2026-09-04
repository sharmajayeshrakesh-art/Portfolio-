/**
 * seed.js — optional demo data for the live pitch.
 *
 * It fabricates *gameplay* (backdated sessions and their per-trial events),
 * NOT dashboard numbers. The dashboard still computes every metric from these
 * events through analytics.js, so what judges see is the real pipeline running
 * on sample play. Designed so the decline rule legitimately fires: reaction
 * time drifts up and memory accuracy drifts down over ~6 weeks.
 */

import { store, cryptoId } from "./store.js";
import { summarise } from "./session.js";
import { GAME_ORDER, gameDomain } from "./catalog.js";

// tiny seeded RNG so the demo is stable across reloads
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export async function seedDemoData({ sessions = 12 } = {}) {
  await store.wipeGameData();
  const rand = rng(20260815);
  const now = Date.now();
  const dayMs = 86400000;

  for (let i = 0; i < sessions; i++) {
    // progress 0..1 across the timeline (older -> newer)
    const p = i / (sessions - 1);
    // ability declines gently and noisily
    const startedAt = now - (sessions - 1 - i) * 3.4 * dayMs - Math.round(rand() * dayMs);

    // targets that produce a defensible decline signal
    const baseRT = 1350 + p * 780; // ~1350ms -> ~2130ms  (>25% slower)
    const overallAcc = 0.92 - p * 0.2; // 0.92 -> 0.72
    const memoryAcc = 0.93 - p * 0.32; // 0.93 -> 0.61  (domain-specific drop)
    const abandonRate = p > 0.6 ? (p - 0.6) * 0.8 : 0; // rises late to ~0.32

    const events = [];
    // play 3-4 games this session
    const games = pick(GAME_ORDER, 3 + Math.round(rand()), rand);
    for (const gameId of games) {
      const domain = gameDomain(gameId);
      const trials = 6 + Math.round(rand() * 4);
      for (let k = 0; k < trials; k++) {
        const abandoned = rand() < abandonRate * 0.5;
        const targetAcc = domain === "memory" ? memoryAcc : overallAcc;
        const correct = !abandoned && rand() < targetAcc;
        // reaction time: domain and correctness modulate it; add noise
        let rt = baseRT * (domain === "attention" ? 0.85 : domain === "reasoning" ? 1.15 : 1);
        rt *= correct ? 1 : 1.25; // errors are slower
        rt += (rand() - 0.5) * 380;
        rt = Math.max(500, Math.round(rt));
        events.push({
          id: cryptoId(),
          sessionId: "seed",
          gameId,
          domain,
          trialIndex: k,
          difficulty: 1 + Math.floor(k / 3),
          reactionTimeMs: abandoned ? null : rt,
          hesitationMs: abandoned ? null : Math.round(rt * (0.35 + rand() * 0.4)),
          correct: abandoned ? false : correct,
          errorType: abandoned ? "omission" : correct ? null : "wrong_option",
          retries: correct ? 0 : rand() < 0.4 ? 1 : 0,
          abandoned,
          meta: {},
        });
      }
    }

    const sessionId = cryptoId();
    for (const ev of events) ev.sessionId = sessionId;
    const session = {
      id: sessionId,
      patientId: "primary",
      language: (await store.getSetting("language")) || "en",
      startedAt,
      endedAt: startedAt + events.length * 4200,
      games,
      summary: summarise(events),
    };
    for (const ev of events) await store.saveEvent(ev);
    await store.saveSession(session);
  }
  await store.setSetting("demoSeeded", true);
}

function pick(arr, n, rand) {
  const copy = [...arr];
  const out = [];
  n = Math.min(n, copy.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}
