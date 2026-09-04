/**
 * analytics.js — turns raw session/event data into the caregiver dashboard.
 *
 * Every number the dashboard shows is computed here from stored gameplay.
 * Nothing is hardcoded. The decline rule below is deliberately explicit and
 * conservative so it can be defended to a clinician: it screens, it does not
 * diagnose.
 */

import { store } from "./store.js";
import { summarise, median, mean } from "./session.js";
import { DOMAIN_ORDER } from "./catalog.js";

/** Load everything and build the full analytics model for the dashboard. */
export async function buildAnalytics() {
  const sessions = await store.allSessions();
  const events = await store.allEvents();
  const byId = new Map();
  for (const ev of events) {
    if (!byId.has(ev.sessionId)) byId.set(ev.sessionId, []);
    byId.get(ev.sessionId).push(ev);
  }

  // Recompute each session summary from its events (source of truth).
  const rows = sessions.map((s) => {
    const evs = byId.get(s.id) || [];
    const summary = evs.length ? summarise(evs) : s.summary || summarise([]);
    return { id: s.id, startedAt: s.startedAt, endedAt: s.endedAt, summary, count: evs.length };
  });

  const played = rows.filter((r) => r.count > 0);

  return {
    sessionCount: played.length,
    totalTrials: played.reduce((s, r) => s + r.summary.trials, 0),
    reactionTrend: reactionTrend(played),
    domainAccuracy: domainAccuracy(played),
    engagement: engagement(played),
    decline: declineRule(played),
    lastPlayed: played.length ? played[played.length - 1].startedAt : null,
    rows: played,
  };
}

/** Median correct-answer reaction time per session, in chronological order. */
export function reactionTrend(rows) {
  const points = rows
    .filter((r) => r.summary.medianReactionMs != null)
    .map((r) => ({ t: r.startedAt, rt: r.summary.medianReactionMs }));
  const reg = linreg(points.map((p, i) => [i, p.rt]));
  return { points, slopePerSession: reg ? Math.round(reg.slope) : 0 };
}

/** Accuracy per cognitive domain across a recent window. */
export function domainAccuracy(rows, window = 6) {
  const recent = rows.slice(-window);
  const acc = {};
  for (const d of DOMAIN_ORDER) acc[d] = { trials: 0, correct: 0 };
  for (const r of recent) {
    for (const [d, v] of Object.entries(r.summary.byDomain || {})) {
      if (!acc[d]) acc[d] = { trials: 0, correct: 0 };
      acc[d].trials += v.trials;
      acc[d].correct += Math.round(v.accuracy * v.trials);
    }
  }
  const out = {};
  for (const [d, v] of Object.entries(acc)) {
    out[d] = { trials: v.trials, accuracy: v.trials ? v.correct / v.trials : null };
  }
  return out;
}

/** Sessions per week + current streak of active days. */
export function engagement(rows) {
  if (!rows.length) return { perWeek: 0, activeDays: 0, streakDays: 0 };
  const days = new Set(rows.map((r) => dayKey(r.startedAt)));
  const spanDays = Math.max(1, Math.round((rows[rows.length - 1].startedAt - rows[0].startedAt) / 86400000) + 1);
  const perWeek = +((rows.length / spanDays) * 7).toFixed(1);

  // streak of consecutive days ending today/last active day
  let streak = 0;
  const oneDay = 86400000;
  let cursor = startOfDay(rows[rows.length - 1].startedAt);
  while (days.has(dayKeyFrom(cursor))) {
    streak += 1;
    cursor -= oneDay;
  }
  return { perWeek, activeDays: days.size, streakDays: streak };
}

/**
 * DECLINE RULE — screening, not diagnosis.
 *
 * Needs >= 6 played sessions. Compares a baseline (earliest 3 sessions) to a
 * recent window (latest 3 sessions) and flags "possible decline" when any of
 * these fire, and reports exactly which did:
 *   1. Reaction time slowed >= 25%  (processing speed)
 *   2. Overall accuracy dropped >= 12 percentage points
 *   3. Any single domain accuracy dropped >= 15 percentage points
 *   4. Abandonment rate in recent window >= 30%
 * The reaction-time regression slope is included as supporting evidence.
 */
export function declineRule(rows) {
  const MIN = 6;
  if (rows.length < MIN) {
    return { status: "insufficient", needed: MIN, have: rows.length, reasons: [] };
  }
  const base = rows.slice(0, 3);
  const recent = rows.slice(-3);

  const baseRT = median(base.map((r) => r.summary.medianReactionMs).filter((x) => x != null));
  const recentRT = median(recent.map((r) => r.summary.medianReactionMs).filter((x) => x != null));
  const baseAcc = mean(base.map((r) => Math.round(r.summary.accuracy * 100)));
  const recentAcc = mean(recent.map((r) => Math.round(r.summary.accuracy * 100)));
  const recentAband = mean(recent.map((r) => Math.round(r.summary.abandonmentRate * 100)));

  const reasons = [];
  const rtChangePct = baseRT ? Math.round(((recentRT - baseRT) / baseRT) * 100) : 0;
  if (baseRT && recentRT && rtChangePct >= 25) {
    reasons.push({ key: "reaction_slower", value: rtChangePct });
  }
  const accDrop = baseAcc != null && recentAcc != null ? baseAcc - recentAcc : 0;
  if (accDrop >= 12) reasons.push({ key: "accuracy_drop", value: accDrop });

  // per-domain drop
  const baseDom = domainAccuracy(base, 3);
  const recentDom = domainAccuracy(recent, 3);
  for (const d of DOMAIN_ORDER) {
    const b = baseDom[d]?.accuracy;
    const r = recentDom[d]?.accuracy;
    if (b != null && r != null) {
      const drop = Math.round((b - r) * 100);
      if (drop >= 15) reasons.push({ key: "domain_drop", domain: d, value: drop });
    }
  }
  if (recentAband >= 30) reasons.push({ key: "abandonment", value: recentAband });

  return {
    status: reasons.length ? "alert" : "stable",
    reasons,
    metrics: { baseRT, recentRT, rtChangePct, baseAcc, recentAcc, accDrop, recentAband },
  };
}

// ---- small stats helpers -------------------------------------------------
function linreg(pairs) {
  const n = pairs.length;
  if (n < 2) return null;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (const [x, y] of pairs) {
    sx += x; sy += y; sxy += x * y; sxx += x * x;
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return null;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return { slope, intercept };
}

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function dayKey(ts) {
  return dayKeyFrom(ts);
}
function dayKeyFrom(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
