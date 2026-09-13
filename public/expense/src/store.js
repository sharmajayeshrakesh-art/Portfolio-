/**
 * store.js — everything the app remembers.
 *
 * localStorage holding one JSON blob. A few hundred entries a year is a few
 * tens of kilobytes, nowhere near the ~5MB budget, and it stays synchronous,
 * which keeps every render path free of await. IndexedDB would buy capacity
 * this app will never need at the cost of async plumbing throughout.
 *
 * The tradeoff is that a browser can clear it without warning and there is no
 * server copy — which is exactly why CSV export is a first-class feature and
 * why we nag when a backup gets stale.
 */

const KEY = "kharcha.v1";

const EMPTY = {
  expenses: [],
  sessions: [],
  learnedMerchants: {},
  settings: { lastExportAt: null },
};

let state = read();

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(EMPTY),
      ...parsed,
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      learnedMerchants: parsed.learnedMerchants && typeof parsed.learnedMerchants === "object"
        ? parsed.learnedMerchants
        : {},
      settings: { ...EMPTY.settings, ...(parsed.settings || {}) },
    };
  } catch {
    // Corrupt or unreadable (private mode, quota, hand-edited) — start clean
    // rather than leaving the app unusable.
    return structuredClone(EMPTY);
  }
}

function commit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Kharcha: could not save", err);
  }
}

/* ---------- dates ---------- */

/** Local calendar date as YYYY-MM-DD. Never uses toISOString, which is UTC and
 *  silently shifts the date backwards for anyone east of Greenwich. */
export function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function money(n) {
  return Math.round(Number(n) * 100) / 100;
}

/* ---------- reads ---------- */

export function getExpenses() {
  return state.expenses;
}

export function getLearned() {
  return state.learnedMerchants;
}

export function getSettings() {
  return state.settings;
}

export function getExpense(id) {
  return state.expenses.find((e) => e.id === id) || null;
}

/** Newest first: by date, then by insertion order within the day. */
function sort() {
  state.expenses.sort((a, b) =>
    a.date === b.date ? (b.createdAt || 0) - (a.createdAt || 0) : (a.date < b.date ? 1 : -1));
}

/** Total for a list of expenses, rounded once at the end. */
export function total(expenses) {
  return money(expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0));
}

export function inRange(from, to) {
  return state.expenses.filter((e) => e.date >= from && e.date <= to);
}

export function onDate(iso) {
  return state.expenses.filter((e) => e.date === iso);
}

/* ---------- writes ---------- */

function newId() {
  return globalThis.crypto?.randomUUID?.() || `x${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function addExpense({ amount, merchant = "", category = "Other", date, note = "", source = "manual" }) {
  const entry = {
    id: newId(),
    amount: money(amount),
    merchant: String(merchant).trim(),
    category,
    date: date || todayISO(),
    note: String(note).trim(),
    source,
    createdAt: Date.now(),
  };
  state.expenses.push(entry);
  sort();
  commit();
  return entry;
}

export function updateExpense(id, patch) {
  const e = getExpense(id);
  if (!e) return null;
  Object.assign(e, patch);
  if (patch.amount != null) e.amount = money(patch.amount);
  sort();
  commit();
  return e;
}

export function deleteExpense(id) {
  const i = state.expenses.findIndex((e) => e.id === id);
  if (i === -1) return null;
  const [removed] = state.expenses.splice(i, 1);
  commit();
  return removed;
}

/** Put a deleted entry back exactly where it was — the undo path. */
export function restoreExpense(entry) {
  if (!entry || getExpense(entry.id)) return;
  state.expenses.push(entry);
  sort();
  commit();
}

/* ---------- training sessions ---------- */

/** Newest first, same as expenses — every screen reads most-recent-first. */
function sortSessions() {
  state.sessions.sort((a, b) =>
    a.date === b.date ? (b.createdAt || 0) - (a.createdAt || 0) : (a.date < b.date ? 1 : -1));
}

export function getSessions() {
  return state.sessions;
}

export function getSession(id) {
  return state.sessions.find((s) => s.id === id) || null;
}

/** The session logged on a given day, if any. One session per day is the rule —
 *  logging again for the same day replaces it rather than double-counting. */
export function sessionOn(iso) {
  return state.sessions.find((s) => s.date === iso) || null;
}

export function saveSession({ id, date, slot, exercises, note = "" }) {
  const existing = id ? getSession(id) : sessionOn(date);
  if (existing) {
    Object.assign(existing, { date, slot, exercises, note });
    sortSessions();
    commit();
    return existing;
  }
  const entry = { id: newId(), date, slot, exercises, note, createdAt: Date.now() };
  state.sessions.push(entry);
  sortSessions();
  commit();
  return entry;
}

export function deleteSession(id) {
  const i = state.sessions.findIndex((s) => s.id === id);
  if (i === -1) return null;
  const [removed] = state.sessions.splice(i, 1);
  commit();
  return removed;
}

export function restoreSession(entry) {
  if (!entry || getSession(entry.id)) return;
  state.sessions.push(entry);
  sortSessions();
  commit();
}

/* ---------- learned merchants ---------- */

export function learn(merchantKey, category) {
  if (!merchantKey) return;
  state.learnedMerchants[merchantKey] = category;
  commit();
}

export function forget(merchantKey) {
  delete state.learnedMerchants[merchantKey];
  commit();
}

/* ---------- settings & bulk ---------- */

export function setSetting(key, value) {
  state.settings[key] = value;
  commit();
}

export function importExpenses(rows) {
  // Dedupe against what is already here: same day, same amount, same merchant
  // is almost certainly the same transaction being re-imported.
  const seen = new Set(state.expenses.map((e) => `${e.date}|${money(e.amount)}|${e.merchant.toUpperCase()}`));
  let added = 0;
  for (const row of rows) {
    const fingerprint = `${row.date}|${money(row.amount)}|${String(row.merchant || "").toUpperCase()}`;
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    state.expenses.push({
      id: row.id || newId(),
      amount: money(row.amount),
      merchant: String(row.merchant || "").trim(),
      category: row.category || "Other",
      date: row.date,
      note: String(row.note || "").trim(),
      source: "imported",
      createdAt: Date.now(),
    });
    added++;
  }
  sort();
  commit();
  return added;
}

/**
 * Everything, for a real backup. The expenses CSV is for reading in a
 * spreadsheet; this is what actually restores the app — sessions and learned
 * merchants have no CSV representation.
 */
export function exportAll() {
  return JSON.stringify({ kharcha: 1, exportedAt: new Date().toISOString(), ...state }, null, 2);
}

export function importAll(json) {
  const parsed = JSON.parse(json);
  if (!parsed || typeof parsed !== "object") throw new Error("not a backup");
  if (!Array.isArray(parsed.expenses) && !Array.isArray(parsed.sessions)) throw new Error("not a backup");

  state = {
    ...structuredClone(EMPTY),
    expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    learnedMerchants: parsed.learnedMerchants || {},
    settings: { ...EMPTY.settings, ...(parsed.settings || {}) },
  };
  sort();
  sortSessions();
  commit();
  return { expenses: state.expenses.length, sessions: state.sessions.length };
}

export function clearAll() {
  state = structuredClone(EMPTY);
  commit();
}
