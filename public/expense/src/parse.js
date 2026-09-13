/**
 * parse.js — turning OCR text from a payment receipt into fields.
 *
 * Written against what Google Pay, PhonePe and Paytm actually put on a success
 * screen. The layout differs between them but the vocabulary barely does: a
 * large amount, a "Paid to" line, a status word, a timestamp.
 *
 * Two rules shape everything here:
 *
 *  1. Money coming in is never an expense. Refunds and received payments are
 *     detected first and stop the parse dead, because a refund silently stored
 *     as spending is a number that will never be noticed and never be right.
 *
 *  2. Nothing is ever trusted enough to save on its own. Every field comes back
 *     with the confidence we actually have, and the UI puts it in front of a
 *     human before it is written. OCR will misread a 3 as an 8 eventually, and
 *     a wrong entry saved unseen is worse than no entry at all.
 */

import { todayISO, toISODate } from "./store.js";

/* ---------- money coming in ---------- */

const INCOMING = [
  /\brefund(?:ed|s)?\b/i,
  /\breceived\s+from\b/i,
  /\bmoney\s+received\b/i,
  /\byou\s+received\b/i,
  /\bcashback\b/i,
  /\bcredited\s+to\b/i,
  /\brequest(?:ed)?\s+money\b/i,
];

/* ---------- status ---------- */

const FAILED = /\b(failed|declined|unsuccessful|cancell?ed|expired)\b/i;
const PENDING = /\b(pending|processing|in\s+progress)\b/i;
const SUCCESS = /\b(completed|successful|success|paid|payment\s+done)\b/i;

/* ---------- amount ---------- */

// ₹ / Rs / Rs. / INR, then Indian-grouped digits. OCR frequently renders ₹ as
// the visually similar Unicode rupee or as "R", so both spellings are allowed.
const TAGGED_AMOUNT = /(?:₹|₨|\bRs\.?|\bINR)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi;

// Fallback when the currency mark is lost entirely: a number standing alone on
// its own line, which on every one of these receipts is the amount.
const BARE_AMOUNT = /^[\s]*([0-9][0-9,]*(?:\.[0-9]{1,2})?)[\s]*$/;

const MAX_PLAUSIBLE = 1000000;

function toNumber(s) {
  const n = Number(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function findAmount(text, lines) {
  const tagged = [];
  for (const m of text.matchAll(TAGGED_AMOUNT)) {
    const n = toNumber(m[1]);
    if (n != null && n > 0 && n <= MAX_PLAUSIBLE) tagged.push(n);
  }
  // The largest tagged figure is the transaction. Anything smaller on the
  // screen is a fee, a wallet balance or a cashback strip.
  if (tagged.length) return { amount: Math.max(...tagged), confident: true };

  const bare = [];
  for (const line of lines) {
    const m = line.match(BARE_AMOUNT);
    if (!m) continue;
    const raw = m[1].replace(/,/g, "");
    // A long run of digits with no decimal is a reference number, not rupees.
    if (raw.length >= 9 && !raw.includes(".")) continue;
    // A bare 2020-2035 on its own line is a year.
    const n = toNumber(raw);
    if (n == null || n <= 0 || n > MAX_PLAUSIBLE) continue;
    if (!raw.includes(".") && n >= 2020 && n <= 2035) continue;
    bare.push(n);
  }
  if (bare.length) return { amount: Math.max(...bare), confident: false };

  return { amount: null, confident: false };
}

/* ---------- date ---------- */

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

function monthFrom(word) {
  const key = String(word).toLowerCase().slice(0, 4);
  return MONTHS[key] ?? MONTHS[key.slice(0, 3)] ?? null;
}

/** Reject anything in the future or implausibly old — usually a misread year. */
function acceptable(d) {
  if (!d || Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const floor = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
  return d < tomorrow && d > floor;
}

function findDate(text) {
  if (/\btoday\b/i.test(text)) return { date: todayISO(), confident: true };
  if (/\byesterday\b/i.test(text)) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return { date: toISODate(d), confident: true };
  }

  // 12 Sept 2026  /  12 September 2026
  let m = text.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})\b/);
  if (m) {
    const mo = monthFrom(m[2]);
    if (mo != null) {
      const d = new Date(Number(m[3]), mo, Number(m[1]));
      if (acceptable(d)) return { date: toISODate(d), confident: true };
    }
  }

  // Sep 12, 2026
  m = text.match(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})\b/);
  if (m) {
    const mo = monthFrom(m[1]);
    if (mo != null) {
      const d = new Date(Number(m[3]), mo, Number(m[2]));
      if (acceptable(d)) return { date: toISODate(d), confident: true };
    }
  }

  // 12/09/2026, 12-09-26 — day first, as everything Indian is.
  m = text.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b/);
  if (m) {
    let year = Number(m[3]);
    if (year < 100) year += 2000;
    const d = new Date(year, Number(m[2]) - 1, Number(m[1]));
    if (acceptable(d)) return { date: toISODate(d), confident: true };
  }

  // 12 Sept — no year printed, so assume the most recent one that is not ahead
  // of today (a December receipt read in January belongs to last year).
  m = text.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\b/);
  if (m) {
    const mo = monthFrom(m[2]);
    if (mo != null) {
      const now = new Date();
      let d = new Date(now.getFullYear(), mo, Number(m[1]));
      if (d > now) d = new Date(now.getFullYear() - 1, mo, Number(m[1]));
      if (acceptable(d)) return { date: toISODate(d), confident: true };
    }
  }

  return { date: todayISO(), confident: false };
}

/* ---------- merchant ---------- */

// Lines that follow "To" but are plainly not a merchant name.
const NOT_A_MERCHANT = /^(bank|account|a\/c|upi|transaction|reference|ref|from|to|paid|debited|using|via|id\b)/i;

function cleanMerchant(raw) {
  let s = String(raw || "")
    .replace(/\b\S+@\S+\b/g, " ")             // UPI handle: name@okhdfcbank
    .replace(/[•·*]{2,}\s*\d+/g, " ")         // masked account tail: ••1234
    .replace(/\b(completed|successful|success|pending|failed)\b/gi, " ")
    .replace(/[₹₨]\s*[0-9][0-9,.]*/g, " ")     // an amount that ran onto the line
    .replace(/\s+/g, " ")
    .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9)]+$/g, "")
    .trim();
  if (s.length > 42) s = s.slice(0, 42).trim();
  return s;
}

function findMerchant(lines) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(?:paid\s+to|pay(?:ing)?\s+to|to|sent\s+to|banking\s+name)\s*[:\-–]?\s*(.*)$/i);
    if (!m) continue;

    const sameLine = cleanMerchant(m[1]);
    if (sameLine.length >= 2 && !NOT_A_MERCHANT.test(sameLine)) {
      return { merchant: sameLine, confident: true };
    }

    // "Paid to" sat alone on its line; the name is on the next usable one.
    for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
      const next = cleanMerchant(lines[j]);
      if (next.length >= 2 && !NOT_A_MERCHANT.test(next) && !/^[0-9₹₨.,\s]+$/.test(next)) {
        return { merchant: next, confident: true };
      }
    }
  }

  // No "to" anywhere. Take the longest mostly-alphabetic line as a guess and
  // flag it, so the review card shows it as unverified rather than as fact.
  const candidates = lines
    .map(cleanMerchant)
    .filter((s) => s.length >= 4 && /[A-Za-z]{3}/.test(s) && !NOT_A_MERCHANT.test(s))
    .filter((s) => (s.replace(/[^A-Za-z ]/g, "").length / s.length) > 0.6);

  if (candidates.length) {
    return { merchant: candidates.sort((a, b) => b.length - a.length)[0], confident: false };
  }

  return { merchant: "", confident: false };
}

/* ---------- entry point ---------- */

/**
 * @param {string} text raw OCR output
 * @returns {{
 *   ok: boolean, reason: string|null,
 *   amount: number|null, date: string, merchant: string,
 *   status: "success"|"failed"|"pending"|"unknown",
 *   uncertain: string[]
 * }}
 */
export function parseReceipt(text) {
  const clean = String(text || "").replace(/\r/g, "");
  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean);

  const incoming = INCOMING.find((re) => re.test(clean));
  if (incoming) {
    return {
      ok: false,
      reason: "incoming",
      amount: null, date: todayISO(), merchant: "",
      status: "unknown", uncertain: [],
    };
  }

  let status = "unknown";
  if (FAILED.test(clean)) status = "failed";
  else if (PENDING.test(clean)) status = "pending";
  else if (SUCCESS.test(clean)) status = "success";

  if (status === "failed" || status === "pending") {
    return {
      ok: false,
      reason: status,
      amount: null, date: todayISO(), merchant: "",
      status, uncertain: [],
    };
  }

  const amount = findAmount(clean, lines);
  const date = findDate(clean);
  const merchant = findMerchant(lines);

  // Anything the parser is guessing at gets named, so the review card can point
  // at the specific field rather than a vague "check this".
  const uncertain = [];
  if (!amount.confident) uncertain.push("amount");
  if (!date.confident) uncertain.push("date");
  if (!merchant.confident) uncertain.push("merchant");
  if (status === "unknown") uncertain.push("status");

  return {
    ok: amount.amount != null,
    reason: amount.amount == null ? "no-amount" : null,
    amount: amount.amount,
    date: date.date,
    merchant: merchant.merchant,
    status,
    uncertain,
  };
}
