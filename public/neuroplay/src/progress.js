/**
 * progress.js — the elder-facing encouragement layer.
 *
 * Inspired by streak/XP apps, with one deliberate difference: points come
 * from ROUNDS PLAYED, not from being right. Someone with dementia will get
 * slower and less accurate over time; a score that falls would punish them
 * for their illness. So this number only ever climbs, and the honest
 * cognitive trend lives privately in the caregiver dashboard instead.
 *
 * Nothing here is stored — it is recomputed from real sessions every time.
 */

import { store } from "./store.js";

const PER_ROUND = 2;       // simply taking part
const PER_CORRECT = 3;     // a little extra for a good answer
const LEVEL_SPAN = 150;    // points per level

/** Warm milestone names, reached and never lost. */
export const LEVEL_KEYS = [
  "level_1", "level_2", "level_3", "level_4",
  "level_5", "level_6", "level_7", "level_8",
];

export function levelTitleKey(level) {
  return LEVEL_KEYS[Math.min(level, LEVEL_KEYS.length) - 1];
}

export async function buildProgress() {
  const sessions = await store.allSessions();
  const events = await store.allEvents();

  const rounds = events.length;
  const correct = events.filter((e) => e.correct).length;
  const points = rounds * PER_ROUND + correct * PER_CORRECT;

  const level = Math.floor(points / LEVEL_SPAN) + 1;
  const intoLevel = points % LEVEL_SPAN;
  const pctToNext = Math.round((intoLevel / LEVEL_SPAN) * 100);

  // days
  const dayKeys = new Set(sessions.filter((s) => s.startedAt).map((s) => dayKey(s.startedAt)));
  const today = dayKey(Date.now());
  const playedToday = dayKeys.has(today);

  // streak: consecutive days back from today (yesterday still counts as alive)
  let streak = 0;
  let cursor = startOfDay(Date.now());
  if (!dayKeys.has(dayKey(cursor))) cursor -= 86400000; // grace: not played yet today
  while (dayKeys.has(dayKey(cursor))) {
    streak += 1;
    cursor -= 86400000;
  }

  // best streak ever
  const sorted = [...dayKeys].map(keyToTime).sort((a, b) => a - b);
  let best = 0, run = 0, prev = null;
  for (const t of sorted) {
    run = prev != null && t - prev === 86400000 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }

  // last 7 days strip
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const t = startOfDay(Date.now()) - i * 86400000;
    last7.push({ t, played: dayKeys.has(dayKey(t)) });
  }

  // per-game: rounds played and the highest difficulty reached
  const perGame = {};
  for (const e of events) {
    const g = (perGame[e.gameId] = perGame[e.gameId] || { rounds: 0, bestLevel: 1 });
    g.rounds += 1;
    if (e.difficulty && e.difficulty > g.bestLevel) g.bestLevel = e.difficulty;
  }

  return {
    points, level, intoLevel, levelSpan: LEVEL_SPAN, pctToNext,
    levelKey: levelTitleKey(level),
    rounds, correct,
    daysPlayed: dayKeys.size,
    streak, bestStreak: Math.max(best, streak),
    playedToday, last7, perGame,
    sessions: sessions.length,
  };
}

function startOfDay(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }
function dayKey(ts) { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function keyToTime(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m, d).getTime(); }
