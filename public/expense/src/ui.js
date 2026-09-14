/**
 * ui.js — DOM helpers, formatting, and the two pieces of chrome that float
 * above the screens: the review sheet and the undo toast.
 */

/* ---------- DOM ---------- */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  // An explicit null defeats a default parameter, and `el("div", null, ...)` is
  // a natural thing to write for a wrapper with no attributes.
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "dataset") Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  // flat(Infinity): callers nest maps inside maps (a day heading followed by
  // that day's rows), and a half-flattened array would stringify into
  // "[object HTMLParagraphElement]" rather than appending.
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

/**
 * Build an inline SVG node. createElement cannot produce namespaced elements,
 * and relying on a glyph like U+232B means trusting whatever the device has
 * installed — which on some Androids is an empty box.
 */
export function svg(markup, { cls = "" } = {}) {
  const doc = new DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${markup}</svg>`,
    "image/svg+xml",
  );
  return document.importNode(doc.documentElement, true);
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/**
 * Append children, skipping the empty ones.
 *
 * Native append() turns null into a literal "null" text node, which is exactly
 * the wrong thing to do with `condition ? node : null` — the pattern this file
 * uses constantly. Arrays are flattened so a `.map()` can be passed straight in.
 */
export function add(parent, ...children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false || child === "") continue;
    parent.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return parent;
}

/* ---------- formatting ---------- */

const GROUPER = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** "1,23,456.5" — no symbol; the ₹ is a separate element so it can be smaller. */
export function amount(n) {
  return GROUPER.format(Math.round(Number(n || 0) * 100) / 100);
}

export function rupees(n) {
  return `₹${amount(n)}`;
}

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fromISO(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "Today", "Yesterday", "Friday" within the week, else "12 Sep". */
export function friendlyDate(iso, today = new Date()) {
  const d = fromISO(iso);
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((t0 - d) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) return DAY[d.getDay()];
  const sameYear = d.getFullYear() === today.getFullYear();
  return `${d.getDate()} ${MON[d.getMonth()]}${sameYear ? "" : ` ${d.getFullYear()}`}`;
}

export function shortDate(iso) {
  const d = fromISO(iso);
  return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
}

/* ---------- toast with undo ---------- */

let toastTimer = null;

export function toast(message, { actionLabel, onAction, duration = 5000 } = {}) {
  const host = $("#toast");
  clearTimeout(toastTimer);
  clear(host);

  host.append(el("span", { class: "toast-msg", text: message }));
  if (actionLabel) {
    host.append(el("button", {
      class: "toast-action",
      type: "button",
      text: actionLabel,
      onclick: () => { hideToast(); onAction?.(); },
    }));
  }

  host.hidden = false;
  // Next frame, so the transition has a start state to animate from.
  requestAnimationFrame(() => host.classList.add("is-open"));
  toastTimer = setTimeout(hideToast, duration);
}

export function hideToast() {
  const host = $("#toast");
  clearTimeout(toastTimer);
  host.classList.remove("is-open");
  setTimeout(() => { if (!host.classList.contains("is-open")) host.hidden = true; }, 200);
}

/* ---------- bottom sheet ---------- */

let onSheetClose = null;

export function openSheet(build, { onClose, dismissible = true } = {}) {
  const host = $("#sheet");
  const panel = $("#sheet-panel");
  clear(panel);
  build(panel);

  onSheetClose = onClose || null;
  host.dataset.dismissible = dismissible ? "yes" : "no";
  host.hidden = false;
  requestAnimationFrame(() => host.classList.add("is-open"));

  // Focus the panel so screen readers land inside it and Escape is heard.
  panel.focus({ preventScroll: true });
}

export function closeSheet() {
  const host = $("#sheet");
  if (host.hidden) return;
  host.classList.remove("is-open");
  const done = onSheetClose;
  onSheetClose = null;
  setTimeout(() => {
    if (!host.classList.contains("is-open")) {
      host.hidden = true;
      clear($("#sheet-panel"));
    }
  }, 260);
  done?.();
}

/**
 * Re-allow scrim and Escape dismissal.
 *
 * A sheet is locked while something is running under it — OCR, mainly — so a
 * stray tap cannot cancel work in flight. Once that finishes, success or
 * failure, it has to unlock again, or the only way out is the one button the
 * new state happens to offer.
 */
export function setSheetDismissible(yes) {
  $("#sheet").dataset.dismissible = yes ? "yes" : "no";
}

export function sheetIsOpen() {
  return !$("#sheet").hidden;
}

/** Replace the sheet's contents without closing and reopening it. */
export function updateSheet(build) {
  const panel = $("#sheet-panel");
  clear(panel);
  build(panel);
}
