/**
 * gym.js — where you are in the rotation, and how consistent you have been.
 *
 * The one idea that makes the rest simple: the app tracks a POSITION IN THE
 * CYCLE, never a day of the week. Pull 1 → Push 1 → Legs 1 → Pull 2 → Push 2 →
 * Legs 2, and the cursor only moves when a session is actually logged.
 *
 * So a hectic Wednesday costs nothing. Thursday still owes Legs 1, and training
 * on Sunday just advances the cursor like any other day. There is no "missed
 * day" to fall behind on, because the plan is a loop rather than a timetable —
 * which is exactly how the plan is trained in practice.
 *
 * Consistency is therefore measured over a rolling seven days rather than a
 * calendar week: six sessions in any seven days is the plan being followed,
 * whichever days they land on.
 */

import { CYCLE, SESSIONS_PER_WEEK, plannedSets, sessionDef } from "./plan.js";
import { toISODate } from "./store.js";

const DAY_MS = 86400000;

/** A gap longer than this breaks a streak. Two allows for the rest day. */
const MAX_GAP_DAYS = 2;

function dateOf(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(aIso, bIso) {
  return Math.round((dateOf(aIso) - dateOf(bIso)) / DAY_MS);
}

/**
 * Which session is due next.
 *
 * Derived from the last session actually logged rather than from a stored
 * counter, so it stays correct after an edit, a deletion, or a session logged
 * out of order (trained legs when push was due — the cursor follows you).
 */
export function nextSlot(sessions) {
  if (!sessions.length) return CYCLE[0];
  const i = CYCLE.indexOf(sessions[0].slot);
  return CYCLE[(i + 1) % CYCLE.length];
}

/** Sessions logged in the last `days` days, inclusive of today. */
export function recentCount(sessions, days = 7, today = new Date()) {
  const from = toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1)));
  const to = toISODate(today);
  return sessions.filter((s) => s.date >= from && s.date <= to).length;
}

/**
 * Consecutive sessions with no gap longer than MAX_GAP_DAYS.
 *
 * Counted in sessions, not days, because rest days are part of the plan — a
 * day-based streak would break every single week by design.
 */
export function streak(sessions, today = new Date()) {
  if (!sessions.length) return 0;
  const todayIso = toISODate(today);

  // A streak you have already let lapse should not still be showing.
  if (daysBetween(todayIso, sessions[0].date) > MAX_GAP_DAYS) return 0;

  let count = 1;
  for (let i = 1; i < sessions.length; i++) {
    if (daysBetween(sessions[i - 1].date, sessions[i].date) > MAX_GAP_DAYS) break;
    count++;
  }
  return count;
}

/** Sets actually done in a session. */
export function setsDone(session) {
  return Object.values(session.exercises || {}).reduce((n, v) => n + (Number(v) || 0), 0);
}

/** How complete a session was, 0-1. */
export function completeness(session) {
  const planned = plannedSets(session.slot);
  return planned ? Math.min(1, setsDone(session) / planned) : 0;
}

/**
 * Per-movement adherence across all logged sessions.
 *
 * Answers "which exercise do I actually skip" — aggregated by movement, so a
 * lat pulldown skipped on Pull 1 and on Pull 2 counts against the same lift.
 * Returns worst-adhered first; movements never yet encountered are omitted.
 */
export function exerciseAdherence(sessions) {
  const tally = new Map();

  for (const session of sessions) {
    const def = sessionDef(session.slot);
    if (!def) continue;
    for (const ex of def.exercises) {
      if (!tally.has(ex.id)) tally.set(ex.id, { id: ex.id, name: ex.name, planned: 0, done: 0, skips: 0, seen: 0 });
      const row = tally.get(ex.id);
      const done = Number(session.exercises?.[ex.id] ?? 0);
      row.planned += ex.sets;
      row.done += Math.min(done, ex.sets);
      row.seen += 1;
      if (done === 0) row.skips += 1;
    }
  }

  return [...tally.values()]
    .map((r) => ({ ...r, rate: r.planned ? r.done / r.planned : 1 }))
    .sort((a, b) => a.rate - b.rate || b.skips - a.skips);
}

/**
 * One entry per day for the last `weeks` weeks, Monday-aligned, oldest first —
 * the consistency grid. `null` marks days before the first log or after today,
 * so the grid can leave them blank instead of implying a missed session.
 */
export function grid(sessions, weeks = 5, today = new Date()) {
  const byDate = new Map(sessions.map((s) => [s.date, s]));

  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const offsetToMonday = (end.getDay() + 6) % 7;
  const lastMonday = new Date(end.getFullYear(), end.getMonth(), end.getDate() - offsetToMonday);
  const start = new Date(lastMonday.getFullYear(), lastMonday.getMonth(), lastMonday.getDate() - (weeks - 1) * 7);

  const todayIso = toISODate(end);
  const cells = [];

  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const iso = toISODate(d);
    const session = byDate.get(iso) || null;
    cells.push({
      date: iso,
      future: iso > todayIso,
      isToday: iso === todayIso,
      session,
      slot: session?.slot || null,
    });
  }
  return cells;
}

/** Everything the Gym screen needs, computed once. */
export function summary(sessions, today = new Date()) {
  const last7 = recentCount(sessions, 7, today);
  return {
    next: nextSlot(sessions),
    last7,
    target: SESSIONS_PER_WEEK,
    onPlan: last7 >= SESSIONS_PER_WEEK,
    streak: streak(sessions, today),
    last30: recentCount(sessions, 30, today),
    lastSession: sessions[0] || null,
    daysSince: sessions.length ? daysBetween(toISODate(today), sessions[0].date) : null,
  };
}
