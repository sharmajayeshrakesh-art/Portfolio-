/** content.js — caregiver adds family faces (feeds the Face-Name game). */

import { el } from "../../ui.js";
import { icon } from "../../icons.js";
import { topBar } from "../chrome.js";
import { store, cryptoId } from "../../store.js";

export function renderContent(ctx) {
  const scr = el("main");
  scr.appendChild(topBar(ctx, { title: ctx.t("content_title"), onBack: () => ctx.navigate("dashboard") }));
  const body = el("div.screen.stack-lg");
  scr.appendChild(body);

  body.appendChild(el("p.lead", { text: ctx.t("content_desc") }));

  // form
  const nameI = el("input", { placeholder: ctx.t("person_name"), style: inputStyle });
  const relI = el("input", { placeholder: ctx.t("relationship"), style: inputStyle });
  const fileI = el("input", { type: "file", accept: "image/*", style: "font-size:var(--fs-sm)" });

  const form = el("div.card.stack", {}, [
    el("div.section-title", { text: ctx.t("add_face") }),
    nameI, relI, fileI,
    el("button.btn.btn-primary", {
      html: icon("plus") + `<span>${ctx.t("save")}</span>`,
      onclick: async () => {
        const file = fileI.files && fileI.files[0];
        if (!nameI.value.trim() || !file) return;
        await store.saveContent(
          { id: cryptoId(), type: "face", name: nameI.value.trim(), relationship: relI.value.trim() },
          file
        );
        nameI.value = ""; relI.value = ""; fileI.value = "";
        list();
      },
    }),
  ]);
  body.appendChild(form);

  const listWrap = el("div.stack");
  body.appendChild(listWrap);
  list();

  async function list() {
    listWrap.innerHTML = "";
    const faces = await store.contentByType("face");
    listWrap.appendChild(el("div.section-title", { text: ctx.t("faces_title") }));
    if (!faces.length) { listWrap.appendChild(el("p.section-sub", { text: ctx.t("no_faces") })); return; }
    const grid = el("div.tiles");
    for (const f of faces) {
      const url = await store.blobURL(f.blobId);
      grid.appendChild(
        el("div.tile", {}, [
          url ? el("img", { src: url, alt: f.name, style: "width:72px;height:72px;border-radius:16px;object-fit:cover" }) : el("div.tile-ic", { html: icon("face", "icon-lg") }),
          el("div.tile-title", { text: f.name }),
          f.relationship ? el("div.tile-sub", { text: f.relationship }) : null,
        ])
      );
    }
    listWrap.appendChild(grid);
  }

  return scr;
}

const inputStyle =
  "min-height:56px;font-size:var(--fs-base);padding:0 16px;border:2px solid var(--line-strong);border-radius:12px;width:100%;background:var(--surface);color:var(--ink)";
