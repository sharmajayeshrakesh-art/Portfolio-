/**
 * app.js — screens, routing and the share-to-save flow.
 *
 * Four tabs on a hash route, so Android's back button behaves, plus a sheet
 * that floats over whatever is open for reviewing a shared screenshot.
 */

import { APP_NAME, url, SHARE_CACHE, SHARE_KEY } from "./base.js";
import * as store from "./store.js";
import { todayISO, toISODate, money } from "./store.js";
import { CATEGORIES, guessCategory, normalizeMerchant } from "./categories.js";
import { parseReceipt } from "./parse.js";
import { recognize } from "./ocr.js";
import { toCSV, parseCSV, downloadCSV, downloadText } from "./csv.js";
import { initGym } from "./gymscreen.js";
import {
  $, $$, el, svg, clear, amount, rupees, friendlyDate, shortDate, fromISO,
  add, toast, openSheet, closeSheet, updateSheet, sheetIsOpen,
} from "./ui.js";

const TABS = ["today", "history", "add", "gym", "settings"];

const { renderGym } = initGym({ go: (tab) => go(tab), renderAll: () => renderAll() });
let historyPeriod = "month";

/* ---------- date ranges ---------- */

function startOfWeek(d = new Date()) {
  const offset = (d.getDay() + 6) % 7; // weeks run Monday to Sunday
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
}

function rangeFor(period, now = new Date()) {
  if (period === "week") {
    const start = startOfWeek(now);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return [toISODate(start), toISODate(end)];
  }
  if (period === "year") {
    return [toISODate(new Date(now.getFullYear(), 0, 1)), toISODate(new Date(now.getFullYear(), 11, 31))];
  }
  return [
    toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
    toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  ];
}

function sumFor(period) {
  const [from, to] = rangeFor(period);
  return store.total(store.inRange(from, to));
}

/* ---------- shared pieces ---------- */

/** A big amount, set light and large, with the symbol kept quiet beside it. */
function figure(value, { size = "xl" } = {}) {
  return el("div", { class: `figure figure-${size}` },
    el("span", { class: "figure-sym", text: "₹" }),
    el("span", { class: "figure-val", text: amount(value) }),
  );
}

function entryRow(expense) {
  let pressTimer = null;

  const row = el("button", {
    class: "row row-entry",
    type: "button",
    onclick: () => { if (!row.dataset.longpressed) editExpense(expense.id); delete row.dataset.longpressed; },
    onpointerdown: () => {
      pressTimer = setTimeout(() => {
        row.dataset.longpressed = "yes";
        if (navigator.vibrate) navigator.vibrate(12);
        removeExpense(expense.id);
      }, 550);
    },
    onpointerup: () => clearTimeout(pressTimer),
    onpointerleave: () => clearTimeout(pressTimer),
    onpointercancel: () => clearTimeout(pressTimer),
  },
    el("span", { class: "row-main" },
      el("span", { class: "row-title", text: expense.merchant || expense.category }),
      el("span", { class: "row-sub" },
        expense.category,
        expense.note ? ` · ${expense.note}` : "",
        expense.source === "shared" ? el("span", { class: "tag", text: "scanned" }) : null,
      ),
    ),
    el("span", { class: "row-amount", text: rupees(expense.amount) }),
  );
  return row;
}

function emptyState(text, hint) {
  return el("div", { class: "empty" },
    el("p", { class: "empty-title", text }),
    hint ? el("p", { class: "empty-hint", text: hint }) : null,
  );
}

/** Groups a flat expense list into day sections, newest first. */
function groupByDay(expenses) {
  const byDay = new Map();
  for (const e of expenses) {
    if (!byDay.has(e.date)) byDay.set(e.date, []);
    byDay.get(e.date).push(e);
  }
  return [...byDay.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

/* ---------- Today ---------- */

function renderToday() {
  const screen = clear($("#screen-today"));
  const today = todayISO();
  const entries = store.onDate(today);

  add(screen,
    el("header", { class: "screen-head" },
      el("p", { class: "eyebrow", text: "Spent today" }),
      figure(store.total(entries)),
      el("div", { class: "stat-pair" },
        el("div", { class: "stat" },
          el("span", { class: "stat-label", text: "This week" }),
          el("span", { class: "stat-value", text: rupees(sumFor("week")) }),
        ),
        el("div", { class: "stat" },
          el("span", { class: "stat-label", text: "This month" }),
          el("span", { class: "stat-value", text: rupees(sumFor("month")) }),
        ),
      ),
    ),
    backupNudge(),
    el("section", { class: "list" },
      entries.length
        ? entries.map(entryRow)
        : emptyState("Nothing yet today", "Share a payment screenshot here, or add a cash payment below."),
    ),
    el("div", { class: "screen-actions" },
      el("button", { class: "btn btn-primary", type: "button", text: "Add a payment", onclick: () => go("add") }),
      scanButton("Scan a screenshot"),
    ),
  );
}

/** Quiet reminder when the only copy of this data has not been backed up. */
function backupNudge() {
  const { lastExportAt } = store.getSettings();
  if (!store.getExpenses().length && !store.getSessions().length) return null;
  const age = lastExportAt ? (Date.now() - lastExportAt) / 86400000 : Infinity;
  if (age < 30) return null;

  return el("button", {
    class: "nudge", type: "button", onclick: () => go("settings"),
  },
    lastExportAt
      ? "It has been over a month since your last backup."
      : "This data lives only on this phone. Back it up.",
    el("span", { class: "nudge-go", text: "Back up" }),
  );
}

/* ---------- History ---------- */

function renderHistory() {
  const screen = clear($("#screen-history"));
  const [from, to] = rangeFor(historyPeriod);
  const entries = store.inRange(from, to);
  const sum = store.total(entries);

  const byCategory = new Map();
  for (const e of entries) byCategory.set(e.category, money((byCategory.get(e.category) || 0) + e.amount));
  const breakdown = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);

  add(screen,
    el("header", { class: "screen-head" },
      el("div", { class: "segmented", role: "tablist" },
        ["week", "month", "year"].map((p) =>
          el("button", {
            class: `seg${p === historyPeriod ? " is-active" : ""}`,
            type: "button",
            role: "tab",
            "aria-selected": p === historyPeriod,
            text: p[0].toUpperCase() + p.slice(1),
            onclick: () => { historyPeriod = p; renderHistory(); },
          })),
      ),
      el("p", { class: "eyebrow", text: periodLabel(from, to) }),
      figure(sum),
    ),

    breakdown.length
      ? el("section", { class: "list" },
          el("p", { class: "list-head", text: "By category" }),
          breakdown.map(([category, value]) =>
            el("div", { class: "row row-cat" },
              el("span", { class: "row-main" },
                el("span", { class: "row-title", text: category }),
                el("span", { class: "bar" },
                  el("span", { class: "bar-fill", style: `width:${sum ? (value / sum) * 100 : 0}%` })),
              ),
              el("span", { class: "row-amount" },
                rupees(value),
                el("span", { class: "row-share", text: `${sum ? Math.round((value / sum) * 100) : 0}%` }),
              ),
            )),
        )
      : null,

    entries.length
      ? el("section", { class: "list" },
          groupByDay(entries).map(([date, dayEntries]) => [
            el("p", { class: "list-head" },
              friendlyDate(date),
              el("span", { class: "list-head-sum", text: rupees(store.total(dayEntries)) }),
            ),
            dayEntries.map(entryRow),
          ]),
        )
      : emptyState("Nothing in this period"),
  );
}

function periodLabel(from, to) {
  const a = fromISO(from);
  const b = fromISO(to);
  if (historyPeriod === "year") return String(a.getFullYear());
  if (historyPeriod === "month") {
    return a.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  }
  return `${shortDate(from).replace(/ \d{4}$/, "")} – ${shortDate(to)}`;
}

/* ---------- Add ---------- */

const draft = { amount: "", category: "Other", merchant: "", note: "", date: todayISO() };

function renderAdd() {
  const screen = clear($("#screen-add"));

  const display = el("div", { class: "figure figure-xl keypad-display" },
    el("span", { class: "figure-sym", text: "₹" }),
    el("span", { class: "figure-val", text: draft.amount || "0" }),
  );

  const chips = el("div", { class: "chips" },
    CATEGORIES.map((c) =>
      el("button", {
        class: `chip${c === draft.category ? " is-active" : ""}`,
        type: "button",
        text: c,
        onclick: (ev) => {
          draft.category = c;
          $$(".chip", screen).forEach((n) => n.classList.toggle("is-active", n === ev.currentTarget));
        },
      })),
  );

  const merchant = el("input", {
    class: "field", type: "text", inputmode: "text", placeholder: "Where? (optional)",
    value: draft.merchant, oninput: (e) => { draft.merchant = e.target.value; },
  });
  const note = el("input", {
    class: "field", type: "text", placeholder: "Note (optional)",
    value: draft.note, oninput: (e) => { draft.note = e.target.value; },
  });
  const date = el("input", {
    class: "field", type: "date", value: draft.date, max: todayISO(),
    oninput: (e) => { draft.date = e.target.value || todayISO(); },
  });

  add(screen,
    el("header", { class: "screen-head screen-head-tight" },
      el("p", { class: "eyebrow", text: "Amount" }),
      display,
    ),
    keypad(display),
    el("section", { class: "stack" },
      el("p", { class: "list-head", text: "Category" }),
      chips,
      el("div", { class: "fields" }, merchant, note, date),
    ),
    el("div", { class: "screen-actions" },
      el("button", {
        class: "btn btn-primary", type: "button", text: "Save",
        onclick: () => {
          const value = Number(draft.amount);
          if (!Number.isFinite(value) || value <= 0) return toast("Enter an amount first");
          store.addExpense({ ...draft, amount: value, source: "manual" });
          if (draft.merchant.trim()) learnIfChanged(draft.merchant, draft.category);
          Object.assign(draft, { amount: "", merchant: "", note: "", category: "Other", date: todayISO() });
          toast("Saved");
          go("today");
        },
      }),
      scanButton("Scan a screenshot instead"),
    ),
  );
}

/**
 * A keypad rather than the OS keyboard: the amount is the only field always
 * known, and a numeric soft keyboard on Android takes half the screen and
 * reflows everything under it every time it opens.
 */
const BACKSPACE_ICON = () => svg(
  '<path d="M10 5h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9L3 12z"/><path d="M13.5 9.5l5 5m0-5l-5 5"/>',
  { cls: "key-icon" },
);

function keypad(display) {
  const paint = () => { display.querySelector(".figure-val").textContent = draft.amount || "0"; };

  const press = (key) => {
    if (key === "back") draft.amount = draft.amount.slice(0, -1);
    else if (key === ".") {
      if (!draft.amount.includes(".")) draft.amount = (draft.amount || "0") + ".";
    } else {
      const [, decimals = ""] = draft.amount.split(".");
      if (draft.amount.includes(".") && decimals.length >= 2) return;
      if (draft.amount.replace(".", "").length >= 9) return;
      draft.amount = draft.amount === "0" ? key : draft.amount + key;
    }
    paint();
  };

  return el("div", { class: "keypad" },
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"].map((key) =>
      el("button", {
        class: `key${key === "back" ? " key-back" : ""}`,
        type: "button",
        "aria-label": key === "back" ? "Delete" : key,
        onclick: () => press(key),
      }, key === "back" ? BACKSPACE_ICON() : key)),
  );
}

/* ---------- Settings ---------- */

function renderSettings() {
  const screen = clear($("#screen-settings"));
  const expenses = store.getExpenses();
  const sessions = store.getSessions();
  const learned = store.getLearned();
  const { lastExportAt } = store.getSettings();

  const restoreInput = el("input", {
    class: "visually-hidden", type: "file", accept: ".json,application/json",
    onchange: (e) => { const f = e.target.files?.[0]; if (f) doRestore(f); e.target.value = ""; },
  });

  const importInput = el("input", {
    class: "visually-hidden", type: "file", accept: ".csv,text/csv", id: "import-file",
    onchange: (e) => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = ""; },
  });

  add(screen,
    el("header", { class: "screen-head screen-head-tight" },
      el("p", { class: "eyebrow", text: "Settings" }),
      el("p", { class: "screen-title",
        text: `${expenses.length} ${expenses.length === 1 ? "entry" : "entries"} · ${sessions.length} session${sessions.length === 1 ? "" : "s"}` }),
      el("p", { class: "settings-sub",
        text: lastExportAt
          ? `Last backed up ${relativeWord(toISODate(new Date(lastExportAt)))}`
          : "Never backed up" }),
    ),

    el("section", { class: "list" },
      el("p", { class: "list-head", text: "Backup" }),
      actionRow("Back up everything",
        "Expenses, workouts and learned merchants",
        () => doBackup()),
      actionRow("Restore from a backup", "Replaces everything on this phone", () => restoreInput.click()),
      restoreInput,
    ),

    el("section", { class: "list" },
      el("p", { class: "list-head", text: "Spreadsheet" }),
      actionRow("Export expenses to CSV", "Opens in any spreadsheet", () => doExport()),
      actionRow("Import expenses from CSV", "Load a statement or an old export", () => importInput.click()),
      importInput,
    ),

    el("section", { class: "list" },
      el("p", { class: "list-head", text: "Categories" }),
      actionRow("Learned merchants",
        `${Object.keys(learned).length} remembered`,
        () => showMerchants()),
    ),

    el("section", { class: "list" },
      el("p", { class: "list-head", text: "Data" }),
      actionRow("Clear everything", "Cannot be undone", () => confirmClear(), true),
    ),

    el("p", { class: "footnote" },
      `${APP_NAME} keeps everything on this phone. No account, no server, no network after the first load.`),
  );
}

/** "today" / "yesterday" read better mid-sentence; "4 Aug" and "Friday" do not. */
function relativeWord(iso) {
  const label = friendlyDate(iso);
  return label === "Today" || label === "Yesterday" ? label.toLowerCase() : `on ${label}`;
}

function actionRow(title, sub, onclick, danger = false) {
  return el("button", { class: `row row-action${danger ? " is-danger" : ""}`, type: "button", onclick },
    el("span", { class: "row-main" },
      el("span", { class: "row-title", text: title }),
      el("span", { class: "row-sub", text: sub }),
    ),
    el("span", { class: "row-chevron", "aria-hidden": "true", text: "›" }),
  );
}

function doBackup() {
  const expenses = store.getExpenses().length;
  const sessions = store.getSessions().length;
  if (!expenses && !sessions) return toast("Nothing to back up yet");
  downloadText(`kharcha-backup-${todayISO()}.json`, store.exportAll(), "application/json");
  store.setSetting("lastExportAt", Date.now());
  renderSettings();
  toast(`Backed up ${expenses} entries · ${sessions} sessions`);
}

async function doRestore(file) {
  let text;
  try {
    text = await file.text();
    store.importAll(text);
  } catch {
    return toast("That is not a Kharcha backup");
  }
  renderAll();
  const counts = { e: store.getExpenses().length, s: store.getSessions().length };
  toast(`Restored ${counts.e} entries · ${counts.s} sessions`);
}

function doExport() {
  const expenses = store.getExpenses();
  if (!expenses.length) return toast("Nothing to export yet");
  downloadCSV(`kharcha-${todayISO()}.csv`, toCSV(expenses));
  store.setSetting("lastExportAt", Date.now());
  renderSettings();
  toast(`Exported ${expenses.length} entries`);
}

async function doImport(file) {
  try {
    const { rows, skipped } = parseCSV(await file.text());
    if (!rows.length) return toast("No usable rows found in that file");

    // A bank statement has a description but no category, and a file from
    // elsewhere may use names this app does not have. Sort those the same way a
    // shared receipt would be sorted, rather than dumping everything in Other.
    const learned = store.getLearned();
    const categorised = rows.map((row) => ({
      ...row,
      category: CATEGORIES.includes(row.category) ? row.category : guessCategory(row.merchant, learned),
    }));

    const added = store.importExpenses(categorised);
    renderAll();
    const parts = [`Imported ${added}`];
    if (rows.length - added > 0) parts.push(`${rows.length - added} already here`);
    if (skipped) parts.push(`${skipped} skipped`);
    toast(parts.join(" · "));
  } catch {
    toast("Could not read that file");
  }
}

function confirmClear() {
  openSheet((panel) => {
    add(panel,
      el("h2", { class: "sheet-title", text: "Clear everything?" }),
      el("p", { class: "sheet-body", text:
        "Every entry and every learned merchant will be deleted from this phone. If you have not exported a backup, this cannot be recovered." }),
      el("div", { class: "sheet-actions" },
        el("button", { class: "btn btn-danger", type: "button", text: "Delete everything", onclick: () => {
          store.clearAll();
          closeSheet();
          renderAll();
          toast("All data cleared");
        } }),
        el("button", { class: "btn btn-quiet", type: "button", text: "Keep it", onclick: closeSheet }),
      ),
    );
  });
}

function showMerchants() {
  const learned = store.getLearned();
  const keys = Object.keys(learned).sort();

  openSheet((panel) => {
    add(panel,
      el("h2", { class: "sheet-title", text: "Learned merchants" }),
      el("p", { class: "sheet-body", text:
        "Corrections you have made. These are checked before the built-in keywords." }),
      keys.length
        ? el("div", { class: "list list-flush" }, keys.map((key) =>
            el("div", { class: "row" },
              el("span", { class: "row-main" },
                el("span", { class: "row-title", text: key }),
                el("span", { class: "row-sub", text: learned[key] }),
              ),
              el("button", { class: "row-remove", type: "button", "aria-label": `Forget ${key}`, text: "Forget",
                onclick: () => { store.forget(key); showMerchants(); } }),
            )))
        : el("p", { class: "sheet-body sheet-body-muted", text:
            "Nothing yet. Change a category on any entry and that merchant is remembered from then on." }),
      el("div", { class: "sheet-actions" },
        el("button", { class: "btn btn-quiet", type: "button", text: "Done", onclick: () => { closeSheet(); renderSettings(); } }),
      ),
    );
  });
}

/* ---------- editing an entry ---------- */

function editExpense(id) {
  const expense = store.getExpense(id);
  if (!expense) return;

  const form = { ...expense };

  openSheet((panel) => {
    add(panel,
      el("h2", { class: "sheet-title", text: "Edit entry" }),
      fieldSet(form),
      el("div", { class: "sheet-actions" },
        el("button", { class: "btn btn-primary", type: "button", text: "Save changes", onclick: () => {
          const value = Number(form.amount);
          if (!Number.isFinite(value) || value <= 0) return toast("Enter an amount");
          if (form.category !== expense.category) learnIfChanged(form.merchant, form.category);
          store.updateExpense(id, { ...form, amount: value });
          closeSheet();
          renderAll();
          toast("Updated");
        } }),
        el("button", { class: "btn btn-quiet btn-danger-text", type: "button", text: "Delete", onclick: () => {
          closeSheet();
          removeExpense(id);
        } }),
      ),
    );
  });
}

function removeExpense(id) {
  const removed = store.deleteExpense(id);
  if (!removed) return;
  renderAll();
  toast(`Deleted ${rupees(removed.amount)}`, {
    actionLabel: "Undo",
    onAction: () => { store.restoreExpense(removed); renderAll(); },
  });
}

/**
 * Remember a correction. This is the part that makes the app get quieter over
 * time — the keyword table never grows, but this map does, and it is checked
 * first.
 */
function learnIfChanged(merchant, category) {
  const key = normalizeMerchant(merchant);
  if (!key) return;
  if (guessCategory(merchant, store.getLearned()) === category) return;
  store.learn(key, category);
}

/** The editable amount / category / merchant / note / date block, shared by the
 *  edit sheet and the review sheet so they cannot drift apart. */
function fieldSet(form) {
  const chips = el("div", { class: "chips" },
    CATEGORIES.map((c) =>
      el("button", {
        class: `chip${c === form.category ? " is-active" : ""}`,
        type: "button", text: c,
        onclick: (ev) => {
          form.category = c;
          [...chips.children].forEach((n) => n.classList.toggle("is-active", n === ev.currentTarget));
        },
      })),
  );

  return el("div", { class: "fields" },
    el("label", { class: "labelled" },
      el("span", { class: "label-text", text: "Amount" }),
      el("input", {
        class: "field field-amount", type: "number", inputmode: "decimal", step: "0.01", min: "0",
        value: form.amount ?? "", oninput: (e) => { form.amount = e.target.value; },
      }),
    ),
    el("label", { class: "labelled" },
      el("span", { class: "label-text", text: "Category" }),
      chips,
    ),
    el("label", { class: "labelled" },
      el("span", { class: "label-text", text: "Merchant" }),
      el("input", {
        class: "field", type: "text", value: form.merchant || "", placeholder: "Where?",
        oninput: (e) => { form.merchant = e.target.value; },
      }),
    ),
    el("label", { class: "labelled" },
      el("span", { class: "label-text", text: "Date" }),
      el("input", {
        class: "field", type: "date", value: form.date, max: todayISO(),
        oninput: (e) => { form.date = e.target.value || todayISO(); },
      }),
    ),
    el("label", { class: "labelled" },
      el("span", { class: "label-text", text: "Note" }),
      el("input", {
        class: "field", type: "text", value: form.note || "", placeholder: "Optional",
        oninput: (e) => { form.note = e.target.value; },
      }),
    ),
  );
}

/* ---------- share → OCR → review ---------- */

function scanButton(label) {
  const input = el("input", {
    class: "visually-hidden", type: "file", accept: "image/*",
    onchange: (e) => { const f = e.target.files?.[0]; if (f) reviewImage(f); e.target.value = ""; },
  });
  return el("span", { class: "scan-wrap" },
    el("button", { class: "btn btn-quiet", type: "button", text: label, onclick: () => input.click() }),
    input,
  );
}

/** Pick up an image the share sheet handed to the service worker. */
async function takeSharedImage() {
  if (!("caches" in globalThis)) return null;
  try {
    const cache = await caches.open(SHARE_CACHE);
    const key = url(SHARE_KEY);
    const res = await cache.match(key);
    if (!res) return null;
    const blob = await res.blob();
    await cache.delete(key);
    return blob;
  } catch {
    return null;
  }
}

async function reviewImage(blob) {
  let stage = "Preparing";
  let progress = 0;

  const paintProgress = () => updateSheet((panel) => {
    add(panel,
      el("h2", { class: "sheet-title", text: "Reading the receipt" }),
      el("div", { class: "progress" }, el("div", { class: "progress-fill", style: `width:${Math.round(progress * 100)}%` })),
      el("p", { class: "sheet-body sheet-body-muted", text:
        stage === "Preparing" && progress < 0.99
          ? "First time only: downloading the text engine. It works offline after this."
          : `${stage}…` }),
    );
  });

  openSheet(() => {}, { dismissible: false });
  paintProgress();

  let text;
  try {
    text = await recognize(blob, (s, p) => {
      stage = s;
      progress = p || 0;
      paintProgress();
    });
  } catch (err) {
    const offline = err?.message === "offline-first-run";
    return updateSheet((panel) => {
      add(panel,
        el("h2", { class: "sheet-title", text: offline ? "Needs one connection first" : "Could not read that image" }),
        el("p", { class: "sheet-body", text: offline
          ? "The text engine has not been downloaded yet. Connect once and try again — after that it works with no signal."
          : "Nothing readable came back. You can still enter it by hand." }),
        el("div", { class: "sheet-actions" },
          el("button", { class: "btn btn-primary", type: "button", text: "Enter it by hand", onclick: () => { closeSheet(); go("add"); } }),
          el("button", { class: "btn btn-quiet", type: "button", text: "Cancel", onclick: closeSheet }),
        ),
      );
    });
  }

  showReview(parseReceipt(text));
}

function showReview(parsed) {
  // Money coming in is refused outright — it is not spending, and storing it as
  // a negative would quietly corrupt every total from then on.
  if (parsed.reason === "incoming") {
    return updateSheet((panel) => {
      add(panel,
        el("h2", { class: "sheet-title", text: "That looks like money coming in" }),
        el("p", { class: "sheet-body", text:
          `${APP_NAME} only tracks spending, so refunds, cashback and payments received are not saved.` }),
        el("div", { class: "sheet-actions" },
          el("button", { class: "btn btn-primary", type: "button", text: "Discard", onclick: closeSheet }),
          // Escape hatch: a cashback strip on an ordinary payment receipt trips
          // the same words, and dead-ending a real expense would be worse.
          el("button", { class: "btn btn-quiet", type: "button", text: "It was a payment — enter it", onclick: () => { closeSheet(); go("add"); } }),
        ),
      );
    });
  }

  if (parsed.reason === "failed" || parsed.reason === "pending") {
    return updateSheet((panel) => {
      add(panel,
        el("h2", { class: "sheet-title", text: parsed.reason === "failed" ? "That payment failed" : "That payment is still pending" }),
        el("p", { class: "sheet-body", text: parsed.reason === "failed"
          ? "No money left your account, so there is nothing to record."
          : "Nothing has been debited yet. Share it again once it completes." }),
        el("div", { class: "sheet-actions" },
          el("button", { class: "btn btn-primary", type: "button", text: "Discard", onclick: closeSheet }),
        ),
      );
    });
  }

  const form = {
    amount: parsed.amount ?? "",
    merchant: parsed.merchant,
    category: guessCategory(parsed.merchant, store.getLearned()),
    date: parsed.date,
    note: "",
  };
  const guessedCategory = form.category;

  updateSheet((panel) => {
    add(panel,
      el("h2", { class: "sheet-title", text: parsed.ok ? "Check this before saving" : "Some of it was unreadable" }),
      parsed.uncertain.length
        ? el("p", { class: "sheet-warn", text:
            `Not sure about the ${listWords(parsed.uncertain)} — worth a look.` })
        : null,
      fieldSet(form),
      el("div", { class: "sheet-actions" },
        el("button", { class: "btn btn-primary", type: "button", text: "Save", onclick: () => {
          const value = Number(form.amount);
          if (!Number.isFinite(value) || value <= 0) return toast("Enter an amount");
          if (form.category !== guessedCategory) learnIfChanged(form.merchant, form.category);
          store.addExpense({ ...form, amount: value, source: "shared" });
          closeSheet();
          renderAll();
          go("today");
          toast(`Saved ${rupees(value)}`);
        } }),
        el("button", { class: "btn btn-quiet", type: "button", text: "Discard", onclick: closeSheet }),
      ),
    );
  });
}

function listWords(items) {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/* ---------- routing ---------- */

function go(tab) {
  if (location.hash.slice(1) === tab) render(tab);
  else location.hash = tab;
}

function currentTab() {
  const tab = location.hash.slice(1);
  return TABS.includes(tab) ? tab : "today";
}

function render(tab) {
  if (tab === "today") renderToday();
  else if (tab === "history") renderHistory();
  else if (tab === "add") renderAdd();
  else if (tab === "gym") renderGym();
  else renderSettings();

  $$(".screen").forEach((s) => { s.hidden = s.id !== `screen-${tab}`; });
  $$(".tab").forEach((t) => {
    const active = t.dataset.tab === tab;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-current", active ? "page" : "false");
  });
  document.scrollingElement.scrollTop = 0;
}

/** Re-render whichever screen is showing, after data changes underneath it. */
function renderAll() {
  render(currentTab());
}

/* ---------- boot ---------- */

function wireChrome() {
  $$(".tab").forEach((t) => t.addEventListener("click", () => go(t.dataset.tab)));

  addEventListener("hashchange", () => render(currentTab()));

  $("#sheet-scrim").addEventListener("click", () => {
    if ($("#sheet").dataset.dismissible !== "no") closeSheet();
  });

  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheetIsOpen() && $("#sheet").dataset.dismissible !== "no") closeSheet();
  });
}

async function boot() {
  wireChrome();
  render(currentTab());

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register(url("sw.js"), { scope: "./" }).catch(() => {});
  }

  // Arriving from the Android share sheet: the worker has already stashed the
  // image and redirected here.
  const params = new URLSearchParams(location.search);
  if (params.has("shared")) {
    history.replaceState(null, "", url("") + location.hash);
    const blob = await takeSharedImage();
    if (blob) reviewImage(blob);
    else toast("Nothing came through from the share sheet");
  }
}

boot();
