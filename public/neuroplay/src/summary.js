/**
 * summary.js — the daily line a family actually reads.
 *
 * Caregiver dashboards get abandoned. In a multi-generational Indian home the
 * people who need to know how Amma is doing are a son at work and a daughter
 * in another city, and neither will open a web app every evening. They will
 * read one WhatsApp message.
 *
 * So the app composes that message itself, from the same logged gameplay the
 * dashboard is built on — never a template with invented numbers. If nothing
 * was played, it says so; that is information too, and often the most
 * important kind.
 *
 * Sending is one tap, not zero: a page with no backend cannot send a message
 * on its own, and pretending otherwise would be a lie the family finds out
 * about on the day it matters. What it can do is have the message written,
 * addressed and waiting.
 */

import { store } from "./store.js";
import { buildAnalytics } from "./analytics.js";
import { calmLog } from "./calm.js";
import { buildProgress } from "./progress.js";
import { GAMES } from "./catalog.js";

const dayKey = (t) => new Date(t).toISOString().slice(0, 10);

/** Everything the message is built from — also handy for the dashboard. */
export async function buildDailySummary(t, { now = Date.now() } = {}) {
  const [sessions, events, a, progress, patient, calm] = await Promise.all([
    store.allSessions(),
    store.allEvents(),
    buildAnalytics(),
    buildProgress(),
    store.getAll("patient").then((r) => r[0] || null),
    calmLog(),
  ]);

  const today = dayKey(now);
  const todays = sessions.filter((s) => dayKey(s.startedAt) === today);
  const ids = new Set(todays.map((s) => s.id));
  const evs = events.filter((e) => ids.has(e.sessionId));

  const trials = evs.length;
  const correct = evs.filter((e) => e.correct).length;
  const minutes = Math.round(
    todays.reduce((sum, s) => sum + Math.max(0, (s.endedAt || s.startedAt) - s.startedAt), 0) / 60000
  );

  // Which game had the most rounds today, so the message is specific rather
  // than a vague "did some activities".
  const perGame = {};
  for (const e of evs) {
    const g = (perGame[e.gameId] = perGame[e.gameId] || { trials: 0, correct: 0 });
    g.trials += 1;
    if (e.correct) g.correct += 1;
  }
  const top = Object.entries(perGame).sort((x, y) => y[1].trials - x[1].trials)[0] || null;

  return {
    name: (patient && patient.name) || null,
    date: new Date(now),
    played: trials > 0,
    sessions: todays.length,
    trials,
    correct,
    minutes,
    accuracy: trials ? correct / trials : null,
    topGame: top ? { id: top[0], ...top[1] } : null,
    streak: progress.streak,
    calmOpens: calm[today] || 0,
    decline: a.decline,
    lastPlayed: a.lastPlayed,
  };
}

/** Where the app is being served from, for the quick-action links. */
export function appBaseUrl() {
  if (!location.protocol.startsWith("http")) return null;   // opened from a file
  return location.origin + location.pathname.replace(/[^/]*$/, "");
}

/**
 * Compose the message. Short on purpose — this is read on a phone, between
 * other things, by someone who wants to know one thing: is she alright.
 */
export function summaryMessage(t, s, { links = true } = {}) {
  const who = s.name || t("summary_your_parent");
  const day = s.date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const out = [`${t("app_name")} · ${who} · ${day}`, ""];

  if (!s.played) {
    out.push(t("summary_not_played"));
  } else {
    out.push(s.trials === 1
      ? t("summary_played_one", { minutes: Math.max(1, s.minutes) })
      : t("summary_played", { rounds: s.trials, minutes: Math.max(1, s.minutes) }));
    if (s.topGame) {
      const g = GAMES[s.topGame.id];
      out.push(t("summary_game", {
        game: g ? t(g.tKey) : s.topGame.id,
        correct: s.topGame.correct,
        total: s.topGame.trials,
      }));
    }
  }
  if (s.streak > 1) out.push(t("summary_streak", { n: s.streak }));
  if (s.calmOpens === 1) out.push(t("summary_calm_one"));
  else if (s.calmOpens > 1) out.push(t("summary_calm", { n: s.calmOpens }));
  if (s.decline && s.decline.status === "alert") out.push(t("summary_watch"));

  const base = links ? appBaseUrl() : null;
  if (base) {
    out.push("", t("summary_add_photo") + " " + base + "#/content");
    out.push(t("summary_open_dashboard") + " " + base + "#/dashboard");
  }
  return out.join("\n");
}

/** wa.me needs digits only, with a country code. Indian numbers are assumed
    to be +91 when someone types the bare ten digits. */
export function waNumber(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  if (!d) return null;
  if (d.length === 10) return "91" + d;
  return d.replace(/^0+/, "");
}

export function whatsappLink(number, text) {
  const n = waNumber(number);
  return `https://wa.me/${n || ""}?text=${encodeURIComponent(text)}`;
}

/** SMS works with no data connection at all, which is the point of having it
    here: the update still goes out from a village with no signal for apps. */
export function smsLink(number, text) {
  const n = String(number || "").replace(/[^\d+]/g, "");
  const sep = /iPhone|iPad|Macintosh/.test(navigator.userAgent) ? "&" : "?";
  return `sms:${n}${sep}body=${encodeURIComponent(text)}`;
}
