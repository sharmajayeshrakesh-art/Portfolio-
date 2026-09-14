/**
 * home.js — the screen you actually land on.
 *
 * The old Today screen led with "spent today", which is ₹0 every morning. That
 * is not an empty state to decorate, it is the NORMAL state — so the screen was
 * greeting you with a giant zero and three different ways of saying "nothing",
 * most times you opened it.
 *
 * This leads with the month instead, which is never zero after day one, and
 * spends the rest of the screen on the two questions actually worth asking:
 * where is the money going, and am I training. One chart answers both.
 *
 * Chart decisions, deliberately:
 *  - One hero figure per view, proportional figures (tabular-nums gives every
 *    digit a zero's width, which makes a big number look gappy).
 *  - Bars capped well under the band width, 4px rounded cap, square on the
 *    baseline, no gridlines — a direct label on today carries the value.
 *  - One accent for every bar. Recolouring by size would double-encode the
 *    height as hue and burn the only free channel on what the chart already shows.
 *  - Trained days are filled vs hollow, which is a shape difference, so the row
 *    never depends on colour alone.
 */

import * as store from "./store.js";
import { todayISO, toISODate } from "./store.js";
import { sessionDef } from "./plan.js";
import { summary } from "./gym.js";
import { $, el, add, clear, amount, rupees, friendlyDate } from "./ui.js";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const DOW_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let go = () => {};
let openScan = () => {};
let editExpense = () => {};

export function initHome(ctx) {
  go = ctx.go;
  openScan = ctx.openScan;
  editExpense = ctx.editExpense;
  return { renderHome };
}

/* ---------- data ---------- */

/** The rolling seven days ending today — spending and training per day. */
function weekData(now = new Date()) {
  const sessions = store.getSessions();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const iso = toISODate(d);
    days.push({
      iso,
      dow: d.getDay(),
      spend: store.total(store.onDate(iso)),
      session: sessions.find((s) => s.date === iso) || null,
      isToday: i === 0,
    });
  }
  return days;
}

function monthRange(now = new Date()) {
  return [
    toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
    toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  ];
}

/* ---------- screen ---------- */

export function renderHome() {
  const screen = clear($("#screen-home"));
  const now = new Date();
  const expenses = store.getExpenses();
  const sessions = store.getSessions();
  const coldStart = !expenses.length && !sessions.length;

  const [from, to] = monthRange(now);
  const monthSpend = store.total(store.inRange(from, to));
  const days = weekData(now);
  const gym = summary(sessions, now);

  add(screen,
    masthead(now),
    coldStart ? welcome() : [
      hero(monthSpend, days),
      backupNudge(),
      weekChart(days),
      trainingRow(gym, sessions),
      todayEntries(),
      topCategories(from, to, monthSpend),
    ],
    el("div", { class: "screen-actions" },
      el("button", { class: "btn btn-primary", type: "button", text: "Add a payment", onclick: () => go("add") }),
      el("button", { class: "btn btn-quiet", type: "button", text: "Scan a screenshot", onclick: () => openScan() }),
    ),
  );
}

/** Wordmark and the date — the screen should know what day it is. */
function masthead(now) {
  return el("header", { class: "masthead" },
    el("div", { class: "wordmark" }, columnsMark(), el("span", { text: "Tally" })),
    el("p", { class: "masthead-date", text: now.toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long",
    }) }),
  );
}

/** The same four columns as the app icon, so the mark and the launcher agree. */
function columnsMark() {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("class", "wordmark-mark");
  svg.setAttribute("aria-hidden", "true");
  // x, y, height — same proportions as scripts/gen-tally-icons.mjs
  for (const [x, y, h] of [[17, 50, 30], [35.5, 28, 52], [54, 40, 40], [72.5, 10, 70]]) {
    const rect = document.createElementNS(ns, "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", 10.5);
    rect.setAttribute("height", h);
    rect.setAttribute("rx", 3.5);
    svg.appendChild(rect);
  }
  return svg;
}

function hero(monthSpend, days) {
  const today = days[days.length - 1].spend;
  const week = days.reduce((n, d) => n + d.spend, 0);

  return el("section", { class: "hero" },
    el("p", { class: "eyebrow", text: "Spent this month" }),
    el("div", { class: "figure figure-hero" },
      el("span", { class: "figure-sym", text: "₹" }),
      el("span", { class: "figure-val", text: amount(Math.round(monthSpend)) }),
    ),
    // Summary figures round to whole rupees; the paise live in the lists, where
    // they are the actual record rather than a headline.
    el("p", { class: "hero-sub" },
      `${rupees(Math.round(today))} today`,
      el("span", { class: "dot-sep", text: "·" }),
      `${rupees(Math.round(week))} this week`,
    ),
  );
}

/**
 * Seven days: spending as columns, training as a row of dots beneath.
 *
 * Two marks over one shared day axis, not two y-scales — the dots are a binary
 * state, not a second measure, so this is not the dual-axis trap.
 */
function weekChart(days) {
  const peak = Math.max(...days.map((d) => d.spend), 0);
  const trained = days.filter((d) => d.session).length;

  const caption = el("p", { class: "chart-caption" });
  const resetCaption = () => {
    caption.textContent = trained
      ? `Trained ${trained} of the last 7 days`
      : "No sessions in the last 7 days";
    caption.classList.remove("is-active");
  };

  const describe = (d) => {
    const parts = [d.isToday ? "Today" : DOW_FULL[d.dow]];
    parts.push(d.spend ? rupees(d.spend) : "no spending");
    parts.push(d.session ? (sessionDef(d.session.slot)?.name || "trained") : "no session");
    caption.textContent = parts.join(" · ");
    caption.classList.add("is-active");
  };

  const columns = days.map((d) => {
    // Zero-height marks read as "a tiny amount"; absence is the honest encoding.
    // Capped at 86% so the direct label has room above the tallest column.
    const height = peak > 0 && d.spend > 0 ? Math.max(3, Math.round((d.spend / peak) * 86)) : 0;

    return el("button", {
      class: `col${d.isToday ? " is-today" : ""}`,
      type: "button",
      "aria-label": `${d.isToday ? "Today" : DOW_FULL[d.dow]}, ${d.spend ? rupees(d.spend) : "nothing spent"}, ${d.session ? "trained" : "no session"}`,
      onclick: () => describe(d),
    },
      el("span", { class: "col-plot" },
        height
          ? el("span", { class: "col-bar", style: `height:${height}%` },
              // Rides the cap, so it reads as this column's value rather than
              // floating free at the top of the plot.
              d.isToday && d.spend
                ? el("span", { class: "col-value", text: amount(Math.round(d.spend)) })
                : null)
          : null,
      ),
      el("span", { class: "col-day", text: DOW[d.dow] }),
      el("span", { class: `dot${d.session ? " is-on" : ""}` }),
    );
  });

  resetCaption();

  return el("section", { class: "chart" },
    el("p", { class: "list-head" }, "Last 7 days",
      el("span", { class: "list-head-sum", text: "tap a day" })),
    el("div", { class: "cols" }, columns),
    caption,
  );
}

function trainingRow(gym, sessions) {
  const todaySession = sessions.find((s) => s.date === todayISO());
  const loggedToday = Boolean(todaySession);
  const next = sessionDef(loggedToday ? todaySession.slot : gym.next);

  return el("button", { class: "panel", type: "button", onclick: () => go("gym") },
    el("div", { class: "panel-main" },
      el("p", { class: "eyebrow", text: loggedToday ? "Trained today" : "Next session" }),
      el("p", { class: "panel-title", text: next?.name || "Pull 1" }),
      el("p", { class: "panel-sub", text: loggedToday
        ? `Next up · ${sessionDef(gym.next)?.name}`
        : gym.lastSession
          ? `Last trained ${friendlyDate(gym.lastSession.date).toLowerCase()}`
          : "Nothing logged yet" }),
    ),
    el("div", { class: "panel-stat" },
      el("span", { class: "panel-stat-val", text: `${gym.last7}/${gym.target}` }),
      el("span", { class: "panel-stat-label", text: "this week" }),
    ),
  );
}

/**
 * What was spent today, itemised.
 *
 * Present only on days with spending, so it never becomes another way of saying
 * "nothing" — but present when it matters, because a misread amount from the
 * share sheet has to be fixable without going hunting for it.
 */
function todayEntries() {
  const entries = store.onDate(todayISO());
  if (!entries.length) return null;

  return el("section", { class: "list" },
    el("p", { class: "list-head" }, "Today",
      el("span", { class: "list-head-sum", text: rupees(store.total(entries)) })),
    entries.map((e) =>
      el("button", { class: "row row-entry", type: "button", onclick: () => editExpense(e.id) },
        el("span", { class: "row-main" },
          el("span", { class: "row-title", text: e.merchant || e.category }),
          el("span", { class: "row-sub" },
            e.category,
            e.note ? ` · ${e.note}` : "",
            e.source === "shared" ? el("span", { class: "tag", text: "scanned" }) : null,
          ),
        ),
        el("span", { class: "row-amount", text: rupees(e.amount) }),
      )),
  );
}

function topCategories(from, to, monthSpend) {
  const entries = store.inRange(from, to);
  if (!entries.length) return null;

  const byCategory = new Map();
  for (const e of entries) byCategory.set(e.category, (byCategory.get(e.category) || 0) + e.amount);
  const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return el("section", { class: "list" },
    el("p", { class: "list-head" }, "Where it went",
      el("span", { class: "list-head-sum", text: "this month" })),
    top.map(([category, value]) =>
      el("button", { class: "row row-cat", type: "button", onclick: () => go("history") },
        el("span", { class: "row-main" },
          el("span", { class: "row-title", text: category }),
          el("span", { class: "bar" },
            el("span", { class: "bar-fill", style: `width:${monthSpend ? (value / monthSpend) * 100 : 0}%` })),
        ),
        el("span", { class: "row-amount", text: rupees(value) }),
      )),
  );
}

/**
 * Quiet reminder when the only copy of this data has not been backed up.
 * Lives on the landing screen because that is the only place it will be seen.
 */
function backupNudge() {
  const { lastExportAt } = store.getSettings();
  const records = store.getExpenses().length + store.getSessions().length;
  // Nagging someone who has entered two things is noise, not care.
  if (records < 5) return null;
  const age = lastExportAt ? (Date.now() - lastExportAt) / 86400000 : Infinity;
  if (age < 30) return null;

  return el("button", { class: "nudge", type: "button", onclick: () => go("settings") },
    lastExportAt
      ? "It has been over a month since your last backup."
      : "This data lives only on this phone. Back it up.",
    el("span", { class: "nudge-go", text: "Back up" }),
  );
}

/** Day one: charts of nothing are worse than no charts. */
function welcome() {
  return el("section", { class: "welcome" },
    el("p", { class: "welcome-lead", text: "Everything stays on this phone." }),
    el("p", { class: "welcome-body", text:
      "Share a payment screenshot from Google Pay and it reads the amount for you. Log a gym session and the rotation keeps itself straight." }),
    el("button", { class: "welcome-go", type: "button", onclick: () => go("gym") },
      "Start the training rotation",
      el("span", { class: "row-chevron", text: "›" }),
    ),
  );
}
