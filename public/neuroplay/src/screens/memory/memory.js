/** memory.js — browse family faces and reminders (non-game assistance). */

import { el } from "../../ui.js";
import { icon } from "../../icons.js";
import { topBar } from "../chrome.js";
import { store } from "../../store.js";
import { speak } from "../../tts.js";

export function renderMemory(ctx, { tab = "faces" } = {}) {
  const scr = el("main");
  scr.appendChild(topBar(ctx, { title: ctx.t(tab === "reminders" ? "reminders_title" : "faces_title"), onBack: () => ctx.navigate("home") }));
  const body = el("div.screen.stack");
  scr.appendChild(body);

  (async () => {
    if (tab === "reminders") {
      const rem = await store.contentByType("reminder");
      if (!rem.length) return body.appendChild(empty(ctx, "bell", "no_reminders"));
      for (const r of rem) body.appendChild(el("div.card.row", {}, [el("span", { html: icon("bell", "icon-lg") }), el("div.grow", { text: r.name })]));
      return;
    }
    const faces = await store.contentByType("face");
    if (!faces.length) { body.appendChild(empty(ctx, "face", "no_faces")); return; }
    const grid = el("div.tiles");
    for (const f of faces) {
      const url = await store.blobURL(f.blobId);
      grid.appendChild(
        el("button.tile", { onclick: () => speak(`${f.name}${f.relationship ? ", " + f.relationship : ""}`) }, [
          url ? el("img", { src: url, alt: f.name, style: "width:100%;aspect-ratio:1;border-radius:14px;object-fit:cover" }) : el("div.tile-ic", { html: icon("face", "icon-lg") }),
          el("div.tile-title", { text: f.name }),
          f.relationship ? el("div.tile-sub", { text: f.relationship }) : null,
        ])
      );
    }
    body.appendChild(grid);
  })();

  return scr;
}

function empty(ctx, ic, key) {
  return el("div.empty.card", {}, [
    el("div.empty-ic", { html: icon(ic, "icon-lg") }),
    el("p.lead", { text: ctx.t(key) }),
  ]);
}
