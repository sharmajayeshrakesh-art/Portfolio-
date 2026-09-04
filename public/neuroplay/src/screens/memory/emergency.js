/** emergency.js — one big, calm button to call a family member. */

import { el } from "../../ui.js";
import { icon } from "../../icons.js";
import { topBar } from "../chrome.js";
import { store } from "../../store.js";
import { speak } from "../../tts.js";

export function renderEmergency(ctx) {
  const scr = el("main");
  scr.appendChild(topBar(ctx, { title: ctx.t("emergency_title"), onBack: () => ctx.navigate("home") }));
  const body = el("div.screen.stack-lg.center");
  scr.appendChild(body);

  (async () => {
    // Use a stored emergency contact, else the first family face on record.
    let contact = await store.getSetting("emergencyContact", null);
    if (!contact) {
      const faces = await store.contentByType("face");
      if (faces[0]) contact = { name: faces[0].name, relationship: faces[0].relationship, blobId: faces[0].blobId, phone: faces[0].phone };
    }

    if (!contact) {
      body.appendChild(el("div.empty-ic", { html: icon("phone", "icon-lg") }));
      body.appendChild(el("p.lead", { text: ctx.t("no_faces") }));
      return;
    }

    const url = await store.blobURL(contact.blobId);
    body.appendChild(
      url
        ? el("img", { src: url, alt: contact.name, style: "width:180px;height:180px;border-radius:50%;object-fit:cover;box-shadow:var(--shadow)" })
        : el("div.empty-ic", { html: icon("user", "icon-lg"), style: "width:180px;height:180px;border-radius:50%" })
    );
    body.appendChild(el("h1.h1", { text: contact.name }));
    if (contact.relationship) body.appendChild(el("p.lead", { text: contact.relationship }));

    const call = el("a.btn.btn-danger.btn-xl.btn-block", {
      html: icon("phone", "icon-lg") + `<span>${ctx.t("call_now")}</span>`,
      href: contact.phone ? `tel:${contact.phone}` : "#",
      onclick: () => speak(ctx.t("call_now")),
    });
    body.appendChild(call);
    speak(`${ctx.t("emergency_title")}. ${contact.name}.`);
  })();

  return scr;
}
