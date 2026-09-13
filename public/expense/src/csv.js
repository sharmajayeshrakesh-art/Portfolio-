/**
 * csv.js — the escape hatch.
 *
 * localStorage is the only copy of this data. Browsers clear it to reclaim
 * space, on a schedule nobody is told about, and there is no server to restore
 * from. Export is therefore not a nice-to-have feature tucked into settings, it
 * is the backup strategy, and import is what makes it a real one rather than a
 * file nobody can do anything with.
 */

const COLUMNS = ["date", "amount", "merchant", "category", "note", "source", "id"];

function escapeCell(value) {
  const s = String(value ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(expenses) {
  const rows = [COLUMNS.join(",")];
  // Oldest first: a backup reads like a ledger, and spreadsheets open it that way.
  const ordered = [...expenses].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  for (const e of ordered) {
    rows.push(COLUMNS.map((c) => escapeCell(c === "amount" ? Number(e.amount).toFixed(2) : e[c])).join(","));
  }
  return rows.join("\n");
}

/** RFC-4180 enough: quoted fields, doubled quotes inside them, CRLF or LF. */
function splitRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else quoted = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Accept the formats a bank statement or a spreadsheet is likely to hand back. */
function normalizeDate(raw) {
  const s = String(raw || "").trim();
  if (DATE_ISO.test(s)) return s;

  const dmy = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (dmy) {
    let year = Number(dmy[3]);
    if (year < 100) year += 2000;
    const mm = String(Number(dmy[2])).padStart(2, "0");
    const dd = String(Number(dmy[1])).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
  }
  return null;
}

/**
 * Parse a CSV back into expense-shaped rows.
 *
 * Columns are matched by header name rather than position, so a file exported
 * from elsewhere — or one whose columns got rearranged in a spreadsheet — still
 * loads. Rows without a usable date and amount are counted and reported rather
 * than silently dropped.
 *
 * @returns {{ rows: object[], skipped: number }}
 */
export function parseCSV(text) {
  const table = splitRows(String(text));
  if (!table.length) return { rows: [], skipped: 0 };

  const header = table[0].map((h) => h.trim().toLowerCase());
  const at = (names) => {
    for (const n of names) {
      const i = header.indexOf(n);
      if (i !== -1) return i;
    }
    return -1;
  };

  const idx = {
    date: at(["date", "transaction date", "txn date", "value date"]),
    amount: at(["amount", "debit", "withdrawal", "amount (inr)", "spent"]),
    merchant: at(["merchant", "description", "narration", "particulars", "payee", "to"]),
    category: at(["category", "type"]),
    note: at(["note", "notes", "remark", "remarks"]),
    id: at(["id"]),
  };

  // No recognisable header — assume our own column order and treat row 0 as data.
  const headerless = idx.date === -1 && idx.amount === -1;
  const body = headerless ? table : table.slice(1);
  if (headerless) {
    idx.date = 0; idx.amount = 1; idx.merchant = 2; idx.category = 3; idx.note = 4; idx.id = 6;
  }

  const rows = [];
  let skipped = 0;

  for (const cells of body) {
    const get = (i) => (i >= 0 && i < cells.length ? cells[i].trim() : "");

    const date = normalizeDate(get(idx.date));
    const amount = Number(get(idx.amount).replace(/[₹₨,\s]/g, ""));

    // Expenses only — a statement's credit rows arrive as negatives, and they
    // are not this app's business.
    if (!date || !Number.isFinite(amount) || amount <= 0) { skipped++; continue; }

    rows.push({
      id: get(idx.id) || null,
      date,
      amount,
      merchant: get(idx.merchant),
      category: get(idx.category) || null,
      note: get(idx.note),
    });
  }

  return { rows, skipped };
}

/** Hand the file to the browser. Uses a blob URL so nothing touches a network. */
export function downloadCSV(filename, csv) {
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10000);
}
