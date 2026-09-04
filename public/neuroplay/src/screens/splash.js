/** splash.js — a warm branded loading screen shown while the app boots. */

import { el } from "../ui.js";

export function showSplash({ name = "NeuroPlay", tagline = "", minMs = 1700 } = {}) {
  const badge = el("div.splash-badge");
  badge.innerHTML = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle class="ring" cx="12" cy="12" r="11" stroke="rgba(255,255,255,0.38)" stroke-width="1.4" stroke-dasharray="3 5" stroke-linecap="round"/>
    <g stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="rgba(255,255,255,0.06)">
      <path d="M10.4 5.2a2.4 2.4 0 0 0-2.4 2.4 2.4 2.4 0 0 0-.9 4.6v1a2.4 2.4 0 0 0 2.4 2.4v1.6a2.4 2.4 0 0 0 2.4 2.4V6a.9.9 0 0 0-.9-.8z"/>
      <path d="M13.6 5.2a2.4 2.4 0 0 1 2.4 2.4 2.4 2.4 0 0 1 .9 4.6v1a2.4 2.4 0 0 1-2.4 2.4v1.6a2.4 2.4 0 0 1-2.4 2.4V6a.9.9 0 0 1 .9-.8z"/>
    </g>
    <circle cx="12" cy="14" r="1.5" fill="#f0a04a"/>
  </svg>`;

  const inner = el("div.splash-inner", {}, [
    badge,
    el("div.splash-name", { text: name }),
    tagline ? el("div.splash-tag", { text: tagline }) : null,
    el("div.splash-dots", { html: "<i></i><i></i><i></i>" }),
  ]);
  const node = el("div.splash", { role: "status", "aria-label": name }, [inner]);
  document.body.appendChild(node);

  const start = performance.now();
  return {
    setText(nm, tg) {
      inner.querySelector(".splash-name").textContent = nm;
      const t = inner.querySelector(".splash-tag");
      if (t && tg) t.textContent = tg;
    },
    async done() {
      const wait = Math.max(0, minMs - (performance.now() - start));
      await new Promise((r) => setTimeout(r, wait));
      node.classList.add("hide");
      await new Promise((r) => setTimeout(r, 650));
      node.remove();
    },
  };
}
