/** ui.js — tiny DOM helpers so screens read cleanly, plus a11y announcer. */

/** Create an element: el('div.card', { onclick }, [children|string]) */
export function el(spec, props = {}, children = []) {
  const [tag, ...classes] = spec.split(".");
  const node = document.createElement(tag || "div");
  if (classes.length) node.className = classes.join(" ");
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (k === "dataset") Object.assign(node.dataset, v);
    else if (k in node && k !== "list") node[k] = v;
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export function mount(root, node) {
  clear(root).appendChild(node);
  root.scrollTop = 0;
  return node;
}

/** Polite screen-reader / status announcer. */
let _live;
export function announce(msg) {
  if (!_live) {
    _live = el("div.sr-only", { "aria-live": "polite", role: "status" });
    document.body.appendChild(_live);
  }
  _live.textContent = "";
  setTimeout(() => (_live.textContent = msg), 30);
}

export function formatRelativeDay(ts, t) {
  if (!ts) return t("never");
  const d0 = new Date(); d0.setHours(0, 0, 0, 0);
  const d = new Date(ts); d.setHours(0, 0, 0, 0);
  const diff = Math.round((d0 - d) / 86400000);
  if (diff <= 0) return t("today");
  if (diff === 1) return t("yesterday");
  return t("days_ago", { n: diff });
}
