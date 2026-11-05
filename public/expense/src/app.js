/**
 * app.js — screens, routing and the share-to-save flow.
 *
 * Four tabs on a hash route, so Android's back button behaves, plus a sheet
 * that floats over whatever is open for reviewing a shared screenshot.
 */

import { APP_NAME, url, activeVersion, SHARE_CACHE, LEGACY_SHARE_CACHES, SHARE_KEY, SHARE_TEXT_KEY } from "./base.js";
import * as store from "./store.js";
import { todayISO, toISODate, money } from "./store.js";
import { CATEGORIES, guessCategory, normalizeMerchant, categoryColor } from "./categories.js";
import { parseReceipt } from "./parse.js";
import { recognize } from "./ocr.js";
import { toCSV, parseCSV, downloadCSV, downloadText } from "./csv.js";
import { initGym } from "./gymscreen.js";
import { initHome } from "./home.js";
import {
  $, $$, el, svg, clear, amount, rupees, friendlyDate, shortDate, fromISO,
  add, toast, openSheet, closeSheet, updateSheet, setSheetDismissible, sheetIsOpen, countUp,
} from "./ui.js";

const TABS = ["history", "add", "home", "gym", "settings"];

const { renderGym } = initGym({ go: (tab) => go(tab), renderAll: () => renderAll() });
const { renderHome } = initHome({
  go: (tab) => go(tab),
  openScan: () => pickScreenshot(),
  entryRow: (expense) => entryRow(expense),
  openCategory: (category) => openCategory(category),
});
let historyPeriod = "month";

// Which category History is narrowed to, or null for everything. Deliberately
// not persisted and cleared on leaving the screen: a filter you cannot see the
// origin of is indistinguishable from missing data.
let historyCategory = null;

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

/* ---------- shared pieces ---------- */

/** A big amount, set light and large, with the symbol kept quiet beside it. */
function figure(value, { size = "xl" } = {}) {
  return el("div", { class: `figure figure-${size}` },
    el("span", { class: "figure-sym", text: "₹" }),
    el("span", { class: "figure-val", text: amount(value), dataset: { count: value } }),
  );
}

/**
 * @param hideCategory  Suppress the category line. Set when the list is already
 *   filtered to one category, where repeating it on every row is pure noise and
 *   pushes the merchant — the thing being scanned for — around for no reason.
 */
function entryRow(expense, { hideCategory = false } = {}) {
  let pressTimer = null;
  const refunded = store.refundedTotal(expense);
  const sub = [
    hideCategory ? "" : expense.category,
    expense.note,
    refunded > 0 ? `${rupees(refunded)} returned` : "",
  ].filter(Boolean).join(" · ");

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
      sub || expense.source === "shared"
        ? el("span", { class: "row-sub" },
            sub,
            expense.source === "shared" ? el("span", { class: "tag", text: "scanned" }) : null,
          )
        : null,
    ),
    // The net is the figure that counts, so it is the one set large; the
    // original stays visible underneath so the row still matches the receipt.
    el("span", { class: "row-amount" },
      rupees(store.effectiveAmount(expense)),
      refunded > 0 ? el("span", { class: "row-was", text: rupees(expense.amount) }) : null,
    ),
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

/* ---------- History ---------- */

/** Narrow History to one category, from anywhere in the app. */
function openCategory(category) {
  historyCategory = category;
  go("history");
}

function renderHistory() {
  const screen = clear($("#screen-history"));
  const [from, to] = rangeFor(historyPeriod);
  const all = store.inRange(from, to);
  const sum = store.total(all);

  const byCategory = new Map();
  for (const e of all) {
    byCategory.set(e.category, money((byCategory.get(e.category) || 0) + store.effectiveAmount(e)));
  }
  const breakdown = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);

  // The filter survives a change of period, so "Groceries this week" and
  // "Groceries this year" are one tap apart. It can therefore outlive the
  // entries it selected, which is a real state and not an error.
  const filtering = historyCategory != null;
  const entries = filtering ? all.filter((e) => e.category === historyCategory) : all;
  const shown = filtering ? store.total(entries) : sum;
  const share = sum ? Math.round((shown / sum) * 100) : 0;

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
      figure(shown),
      // Without this line a filtered total looks like the whole period's
      // spending, which is the one reading that would be actively wrong.
      filtering
        ? el("p", {
            class: "eyebrow figure-note",
            style: `--dot:${categoryColor(historyCategory)}`,
            text: `${historyCategory} — ${share}% of ${rupees(sum)}`,
          })
        : null,
    ),

    filtering
      ? el("section", { class: "list list-flush" },
          el("button", {
            class: "row row-action row-back",
            type: "button",
            onclick: () => { historyCategory = null; renderHistory(); },
          },
            el("span", { class: "row-chevron row-chevron-back", text: "‹" }),
            el("span", { class: "row-main" },
              el("span", { class: "row-title", text: "All categories" })),
          ),
        )
      : breakdown.length
        ? el("section", { class: "list" },
            el("p", { class: "list-head", text: "By category" }),
            breakdown.map(([category, value]) =>
              el("button", {
                class: "row row-cat row-swatch row-action",
                type: "button",
                style: `--cat:${categoryColor(category)}`,
                "aria-label": `${category}, ${rupees(value)}. See these entries.`,
                onclick: () => { historyCategory = category; renderHistory(); },
              },
                el("span", { class: "row-main" },
                  el("span", { class: "row-title", text: category }),
                  el("span", { class: "bar" },
                    el("span", { class: "bar-fill", style: `width:${sum ? (value / sum) * 100 : 0}%` })),
                ),
                el("span", { class: "row-amount" },
                  rupees(value),
                  el("span", { class: "row-share", text: `${sum ? Math.round((value / sum) * 100) : 0}%` }),
                ),
                el("span", { class: "row-chevron", text: "›" }),
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
            dayEntries.map((e) => entryRow(e, { hideCategory: filtering })),
          ]),
        )
      : emptyState(
          filtering ? `Nothing in ${historyCategory} this ${historyPeriod}` : "Nothing in this period",
          filtering ? "Try a longer period, or go back to all categories." : null,
        ),
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
        style: `--cat:${categoryColor(c)}`,
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
          go("home");
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

    el("section", { class: "list" },
      el("p", { class: "list-head", text: "Version" }),
      versionRow(),
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

/**
 * Which build is actually serving, filled in once the worker answers.
 *
 * Here because "it still looks the same" is otherwise unanswerable — this turns
 * it into a value that can be read off the screen and quoted.
 */
function versionRow() {
  const sub = el("span", { class: "row-sub", text: "checking…" });

  activeVersion().then((v) => {
    sub.textContent = v
      ? `${v} · tap to check for an update`
      : "no offline copy yet · tap to check";
  });

  return el("button", { class: "row row-action", type: "button",
    onclick: async () => {
      const reg = await navigator.serviceWorker?.getRegistration?.();
      if (!reg) return toast("No service worker — open this over https");
      sub.textContent = "checking…";
      try {
        await reg.update();
        const v = await activeVersion();
        sub.textContent = v ? `${v} · up to date` : "no offline copy yet";
        toast(reg.installing || reg.waiting ? "Update downloading…" : "Already on the latest version");
      } catch {
        sub.textContent = "could not check — no connection";
        toast("Could not reach the server");
      }
    },
  },
    el("span", { class: "row-main" },
      el("span", { class: "row-title", text: "Running version" }),
      sub,
    ),
    el("span", { class: "row-chevron", "aria-hidden": "true", text: "›" }),
  );
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
  downloadText(`tally-backup-${todayISO()}.json`, store.exportAll(), "application/json");
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
    return toast("That is not a Tally backup");
  }
  renderAll();
  const counts = { e: store.getExpenses().length, s: store.getSessions().length };
  toast(`Restored ${counts.e} entries · ${counts.s} sessions`);
}

function doExport() {
  const expenses = store.getExpenses();
  if (!expenses.length) return toast("Nothing to export yet");
  downloadCSV(`tally-${todayISO()}.csv`, toCSV(expenses));
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
      refundSection(expense),
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

/**
 * Refunds already attached to an expense, and the way to add one.
 *
 * Lives inside the edit sheet because a refund belongs to a purchase — finding
 * the purchase and recording what came back are the same action.
 */
function refundSection(expense) {
  const refunds = store.refundsOf(expense);
  const back = store.refundedTotal(expense);
  const remaining = store.remainingOf(expense);

  return el("div", { class: "refunds" },
    el("p", { class: "list-head" }, "Returned",
      back > 0
        ? el("span", { class: "list-head-sum", text: `${rupees(back)} of ${rupees(expense.amount)}` })
        : el("span", { class: "list-head-sum", text: "nothing yet" })),

    refunds.map((r) =>
      el("div", { class: "row row-refund" },
        el("span", { class: "row-main" },
          el("span", { class: "row-title", text: rupees(r.amount) }),
          el("span", { class: "row-sub", text: r.note ? `${friendlyDate(r.date)} · ${r.note}` : friendlyDate(r.date) }),
        ),
        el("button", { class: "row-remove", type: "button", text: "Remove",
          onclick: () => {
            store.removeRefund(expense.id, r.id);
            closeSheet();
            renderAll();
            toast("Refund removed");
          } }),
      )),

    remaining > 0
      ? el("button", { class: "btn btn-quiet refund-add", type: "button",
          text: refunds.length ? "Record another return" : "Record a return",
          onclick: () => recordRefund(expense) })
      : el("p", { class: "note", text: "Fully refunded — this purchase now counts as nothing." }),
  );
}

/** Enter the amount that came back on a specific purchase. */
function recordRefund(expense, prefill = null) {
  const remaining = store.remainingOf(expense);
  const form = {
    amount: prefill != null ? String(Math.min(prefill, remaining)) : String(remaining),
    date: todayISO(),
    note: "",
  };

  openSheet((panel) => {
    add(panel,
      el("h2", { class: "sheet-title", text: "What came back?" }),
      el("p", { class: "sheet-body", text:
        `${expense.merchant || expense.category} · ${rupees(expense.amount)} spent, ${rupees(remaining)} still counted.` }),

      el("div", { class: "fields" },
        el("label", { class: "labelled" },
          el("span", { class: "label-text", text: "Amount returned" }),
          el("input", { class: "field field-amount", type: "number", inputmode: "decimal",
            step: "0.01", min: "0", max: String(remaining), value: form.amount,
            oninput: (e) => { form.amount = e.target.value; } }),
        ),
        el("label", { class: "labelled" },
          el("span", { class: "label-text", text: "Date" }),
          el("input", { class: "field", type: "date", value: form.date, max: todayISO(),
            oninput: (e) => { form.date = e.target.value || todayISO(); } }),
        ),
        el("label", { class: "labelled" },
          el("span", { class: "label-text", text: "Note" }),
          el("input", { class: "field", type: "text", placeholder: "Which items? (optional)",
            oninput: (e) => { form.note = e.target.value; } }),
        ),
      ),

      el("p", { class: "note", text:
        "This comes off the purchase rather than being logged as money in, so the category and the month both correct themselves." }),

      el("div", { class: "sheet-actions" },
        el("button", { class: "btn btn-primary", type: "button", text: "Record it", onclick: () => {
          const value = Number(form.amount);
          if (!Number.isFinite(value) || value <= 0) return toast("Enter an amount");
          const saved = store.addRefund(expense.id, { amount: value, date: form.date, note: form.note });
          if (!saved) return toast("That is more than is left on this purchase");
          closeSheet();
          renderAll();
          toast(`${rupees(saved.amount)} off ${expense.merchant || expense.category}`);
        } }),
        el("button", { class: "btn btn-quiet", type: "button", text: "Cancel", onclick: closeSheet }),
      ),
    );
  });
}

/**
 * Pick the purchase a refund belongs to.
 *
 * Offered straight from the share sheet's refusal screen: that is the moment
 * the app already has a refund in hand, and until now it was a dead end.
 * Same-merchant purchases are listed first, because that is nearly always the
 * answer.
 */
function attachRefund(parsed) {
  const key = normalizeMerchant(parsed.merchant || "");
  const candidates = store.refundable()
    .map((e) => ({ e, same: key && normalizeMerchant(e.merchant) === key }))
    .sort((a, b) => (b.same - a.same) || (a.e.date < b.e.date ? 1 : -1))
    .slice(0, 12);

  openSheet((panel) => {
    add(panel,
      el("h2", { class: "sheet-title", text: "Which purchase was this?" }),
      el("p", { class: "sheet-body", text: parsed.amount
        ? `${rupees(parsed.amount)} came back. Pick what it was refunded against — it comes off that purchase.`
        : "Pick the purchase this was refunded against." }),

      candidates.length
        ? el("div", { class: "list list-flush" }, candidates.map(({ e, same }) =>
            el("button", { class: "row row-action", type: "button",
              onclick: () => recordRefund(e, parsed.amount ?? null) },
              el("span", { class: "row-main" },
                el("span", { class: "row-title", text: e.merchant || e.category }),
                el("span", { class: "row-sub", text:
                  `${friendlyDate(e.date)} · ${e.category}${same ? " · same merchant" : ""}` }),
              ),
              el("span", { class: "row-amount", text: rupees(store.remainingOf(e)) }),
            )))
        : el("p", { class: "note", text:
            "No purchase here to refund against. If you bought it before using the app, add the purchase first and then record the return." }),

      el("div", { class: "sheet-actions" },
        el("button", { class: "btn btn-quiet", type: "button", text: "Cancel", onclick: closeSheet }),
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

/**
 * Open the gallery and review whatever comes back.
 *
 * The share sheet is the real path, but it only exists once the app is
 * installed — this is how the same OCR flow is reachable before that, and from
 * a desktop browser.
 */
let scanInput = null;
function pickScreenshot() {
  if (!scanInput) {
    scanInput = el("input", {
      class: "visually-hidden", type: "file", accept: "image/*",
      onchange: (e) => { const f = e.target.files?.[0]; if (f) reviewImage(f); e.target.value = ""; },
    });
    document.body.append(scanInput);
  }
  scanInput.click();
}

function scanButton(label) {
  return el("button", { class: "btn btn-quiet", type: "button", text: label, onclick: () => pickScreenshot() });
}

/**
 * Collect whatever the share sheet handed to the service worker.
 *
 * Returns the file if one came, the text if one came, and a note of what
 * arrived either way — so a share that brings nothing usable can be reported
 * precisely instead of as a shrug.
 */
async function takeShared() {
  const out = { blob: null, text: "", title: "", received: null };
  if (!("caches" in globalThis)) return out;

  const imageKey = url(SHARE_KEY);
  const textKey = url(SHARE_TEXT_KEY);

  for (const name of [SHARE_CACHE, ...LEGACY_SHARE_CACHES]) {
    try {
      const cache = await caches.open(name);

      if (!out.blob) {
        const res = await cache.match(imageKey);
        if (res) {
          out.blob = await res.blob();
          await cache.delete(imageKey);
        }
      }
      if (!out.received) {
        const res = await cache.match(textKey);
        if (res) {
          out.received = await res.json().catch(() => null);
          await cache.delete(textKey);
        }
      }
    } catch { /* try the next name */ }
  }

  out.text = out.received?.text || "";
  out.title = out.received?.title || "";
  return out;
}

/**
 * A share that carried no usable file.
 *
 * Payment apps frequently share a text summary rather than a picture of one,
 * and that text is better input than a screenshot — no OCR, no misread digits.
 * So try to read it; only if that fails does this become an error, and then it
 * says what actually turned up rather than "nothing".
 */
function handleSharedText({ text, title, received }) {
  const body = [title, text].filter(Boolean).join("\n").trim();

  if (body) {
    const parsed = parseReceipt(body);
    if (parsed.ok || parsed.reason === "incoming" || parsed.reason === "failed" || parsed.reason === "pending") {
      openSheet(() => {}, { dismissible: true });
      showReview(parsed, body);
      return;
    }
  }

  // Nothing readable. Say what arrived — a share that quietly fails is
  // impossible to report and impossible to fix.
  openSheet((panel) => {
    add(panel,
      el("h2", { class: "sheet-title", text: body ? "Could not read that share" : "The share sheet sent nothing" }),
      el("p", { class: "sheet-body", text: body
        ? "It came through as text, but there was no amount in it."
        : "No image and no text arrived. Some apps only share a link, which has nothing in it to read." }),
      body
        ? el("p", { class: "sheet-quote", text: body.length > 220 ? `${body.slice(0, 220)}…` : body })
        : null,
      el("p", { class: "sheet-body sheet-body-muted", text:
        "Take a screenshot of the receipt and share that instead — or enter it by hand." }),
      el("div", { class: "sheet-actions" },
        el("button", { class: "btn btn-primary", type: "button", text: "Enter it by hand",
          onclick: () => { closeSheet(); go("add"); } }),
        el("button", { class: "btn btn-quiet", type: "button", text: "Close", onclick: closeSheet }),
      ),
    );
  });
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
    setSheetDismissible(true);
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

  setSheetDismissible(true);
  showReview(parseReceipt(text), text);
}

function showReview(parsed, rawText = "") {
  // Money coming in is refused outright — it is not spending, and storing it as
  // a negative would quietly corrupt every total from then on.
  if (parsed.reason === "incoming") {
    return updateSheet((panel) => {
      add(panel,
        el("h2", { class: "sheet-title", text: "That looks like money coming in" }),
        el("p", { class: "sheet-body", text:
          `${APP_NAME} records no income. A refund is different — it is money off something you already bought, so it can come off that purchase instead.` }),
        el("div", { class: "sheet-actions" },
          // A refund IS money coming in, but it is not income — it is a
          // correction to something already bought. So the primary action is to
          // find that purchase rather than to throw this away.
          el("button", { class: "btn btn-primary", type: "button", text: "It was a refund — find the purchase",
            onclick: () => attachRefund(parsed) }),
          el("button", { class: "btn btn-quiet", type: "button", text: "It was a payment — enter it",
            onclick: () => { closeSheet(); go("add"); } }),
          el("button", { class: "btn btn-quiet", type: "button", text: "Discard", onclick: closeSheet }),
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
      // When a field could not be read, the text it was read FROM is the only
      // thing that explains why — and the only thing worth sending me when the
      // answer is wrong. Hidden by default; one tap when it matters.
      parsed.uncertain.length && rawText ? rawTextDisclosure(rawText) : null,
      fieldSet(form),
      el("div", { class: "sheet-actions" },
        el("button", { class: "btn btn-primary", type: "button", text: "Save", onclick: () => {
          const value = Number(form.amount);
          if (!Number.isFinite(value) || value <= 0) return toast("Enter an amount");
          if (form.category !== guessedCategory) learnIfChanged(form.merchant, form.category);
          store.addExpense({ ...form, amount: value, source: "shared" });
          closeSheet();
          renderAll();
          go("home");
          toast(`Saved ${rupees(value)}`);
        } }),
        el("button", { class: "btn btn-quiet", type: "button", text: "Discard", onclick: closeSheet }),
      ),
    );
  });
}

/** Reveals the text the parser actually worked from. */
function rawTextDisclosure(rawText) {
  const holder = el("div", { class: "raw-wrap" });
  const show = el("button", { class: "raw-toggle", type: "button", text: "Show what was read" });

  show.addEventListener("click", () => {
    clear(holder);
    add(holder, el("pre", { class: "sheet-quote raw-text", text: rawText.trim() }));
  });

  add(holder, show);
  return holder;
}

function listWords(items) {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/* ---------- staying current ---------- */

/**
 * Register the worker, force an update check, and offer a reload when a newer
 * version takes over.
 *
 * Needed because the shell is served cache-first. That makes a launch cost no
 * network, but it also means a deploy only arrives through the worker's own
 * install cycle — and even then the page you are looking at was already built
 * from the old cache, so the new version does not appear until the NEXT launch.
 * On Android a "launch" that resumes from recents is not a navigation at all,
 * so that next launch can quietly never happen, and the app sits on an old
 * version indefinitely looking perfectly fine.
 *
 * So: ask for an update explicitly rather than relying on the browser's own
 * schedule, and when one lands, say so and offer the reload instead of
 * expecting anyone to force-quit the app.
 */
function watchForUpdates() {
  // Read BEFORE registering. A worker already in control means anything that
  // activates from here is an update; no controller means this is a first
  // install, and a first install taking over is not news — announcing it would
  // nag every new user about an update they just got.
  const hadController = Boolean(navigator.serviceWorker.controller);
  let announced = false;

  const announce = () => {
    if (announced || !hadController) return;
    announced = true;
    offerReload();
  };

  // Backstop for the case this page never sees `updatefound`: the new worker
  // may have installed during an earlier launch and be taking over now.
  navigator.serviceWorker.addEventListener("controllerchange", announce);

  navigator.serviceWorker.register(url("sw.js"), { scope: "./" }).then((reg) => {
    reg.addEventListener("updatefound", () => {
      const incoming = reg.installing;
      if (!incoming) return;
      incoming.addEventListener("statechange", () => {
        if (incoming.state === "activated") announce();
      });
    });

    // Ask explicitly rather than waiting for the browser to decide it is time.
    reg.update().catch(() => {});
  }).catch(() => {});
}

function offerReload() {
  toast("A new version is ready", {
    actionLabel: "Reload",
    onAction: () => location.reload(),
    duration: 20000,
  });
}

/* ---------- routing ---------- */

function go(tab) {
  if (location.hash.slice(1) === tab) render(tab);
  else location.hash = tab;
}

function currentTab() {
  const tab = location.hash.slice(1);
  // "#today" was the old name for this screen; keep old links working.
  if (tab === "today") return "home";
  return TABS.includes(tab) ? tab : "home";
}

/** The tab the previous render drew, so a re-render in place can be told apart
 *  from a navigation. */
let lastRenderedTab = null;

function render(tab) {
  // Leaving History drops the filter. Coming back to a screen still narrowed
  // from minutes ago, with no memory of having narrowed it, reads as lost data.
  if (tab !== "history") historyCategory = null;

  if (tab === "home") renderHome();
  else if (tab === "history") renderHistory();
  else if (tab === "add") renderAdd();
  else if (tab === "gym") renderGym();
  else renderSettings();

  $$(".screen").forEach((s) => { s.hidden = s.id !== `screen-${tab}`; });

  // Play the entrance only on a real navigation. renderAll() re-renders a
  // screen in place after every data change — logging a set, editing an
  // amount — and animating those would turn each tap into a full-screen
  // shimmy. The class comes off once the cascade finishes, so it can run again
  // the next time the tab is genuinely entered.
  if (tab !== lastRenderedTab) {
    const screen = $(`#screen-${tab}`);
    if (screen) {
      countUp(screen);
      screen.classList.add("is-entering");
      screen.addEventListener(
        "animationend",
        () => screen.classList.toggle("is-entering", false),
        { once: true },
      );
    }
    lastRenderedTab = tab;
  }

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
  // A save that fails is worse than a save that errors loudly: the entry looks
  // stored until the next launch, when it is simply gone.
  store.onStorageError(() => {
    toast("Could not save — this phone's storage may be full", { duration: 9000 });
  });

  wireChrome();
  render(currentTab());

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    watchForUpdates();
  }

  // Unreadable data was set aside rather than overwritten. Say so, because the
  // app otherwise just looks empty and the copy is still there to recover.
  if (store.wasRescued()) {
    toast(`Saved data could not be read. It has been kept as ${store.rescuedKeys()[0]} — restore a backup.`,
      { duration: 12000, actionLabel: "Settings", onAction: () => go("settings") });
  }

  // Arriving from the Android share sheet: the worker has already stashed the
  // image and redirected here.
  const params = new URLSearchParams(location.search);
  if (params.has("shared")) {
    history.replaceState(null, "", url("") + location.hash);
    const shared = await takeShared();
    if (shared.blob) reviewImage(shared.blob);
    else handleSharedText(shared);
  }
}

boot();
