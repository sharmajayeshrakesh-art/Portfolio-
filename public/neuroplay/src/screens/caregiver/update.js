/**
 * update.js — the daily family update, written by the app and sent in one tap.
 *
 * Two channels, chosen for what actually reaches people here:
 *   WhatsApp — where the family already talks, via a wa.me link, no Business
 *              API account and no server in the middle.
 *   SMS      — because it works with no data connection at all. A house with
 *              patchy signal still gets the update.
 *
 * Both open the phone's own app with the message written and addressed. The
 * caregiver presses send. A static, offline app cannot send on someone's
 * behalf — that needs a server holding a messaging credential, and the screen
 * says so rather than implying an automation that is not there.
 */

import { el, announce } from "../../ui.js";
import { icon } from "../../icons.js";
import { topBar } from "../chrome.js";
import { store } from "../../store.js";
import {
  buildDailySummary, summaryMessage, whatsappLink, smsLink, waNumber, appBaseUrl,
} from "../../summary.js";

export function renderUpdate(ctx) {
  const scr = el("main");
  scr.appendChild(
    topBar(ctx, {
      title: ctx.t("update_title"),
      hint: ctx.t("update_title"),
      onBack: () => ctx.navigate("dashboard"),
    })
  );
  const body = el("div.screen.stack-lg");
  scr.appendChild(body);
  body.appendChild(el("p.muted", { text: ctx.t("loading") }));

  let message = "";
  let number = "";

  (async () => {
    const summary = await buildDailySummary(ctx.t);
    number = (await store.getSetting("familyPhone", "")) || "";
    message = summaryMessage(ctx.t, summary);
    paint(summary);
  })();

  function paint(summary) {
    body.innerHTML = "";
    body.appendChild(el("p.section-sub", { text: ctx.t("update_intro") }));

    // ---- who it goes to -------------------------------------------------
    const who = el("div.card.stack");
    who.appendChild(
      el("div.set-label", {}, [
        el("span.set-ic", { html: icon("phone") }),
        el("span", { text: ctx.t("update_family_number") }),
      ])
    );
    const input = el("input.select", {
      type: "tel",
      inputmode: "tel",
      value: number,
      placeholder: ctx.t("update_number_hint"),
      "aria-label": ctx.t("update_family_number"),
    });
    input.addEventListener("change", async () => {
      number = input.value.trim();
      await store.setSetting("familyPhone", number);
      paintButtons();
    });
    who.appendChild(input);
    who.appendChild(el("p.muted", { text: ctx.t("update_number_note") }));
    body.appendChild(who);

    // ---- the message itself, editable -----------------------------------
    const card = el("div.card.stack");
    card.appendChild(
      el("div.row.between", {}, [
        el("strong", { text: ctx.t("update_preview") }),
        el("span.pill", { text: summary.played ? ctx.t("update_from_today") : ctx.t("update_no_play") }),
      ])
    );
    const box = el("textarea.update-box", {
      rows: 9,
      "aria-label": ctx.t("update_preview"),
    });
    box.value = message;
    box.addEventListener("input", () => { message = box.value; });
    card.appendChild(box);
    card.appendChild(el("p.muted", { text: ctx.t("update_editable") }));
    body.appendChild(card);

    // ---- send -----------------------------------------------------------
    const send = el("div.card.stack");
    send.appendChild(el("strong", { text: ctx.t("update_send") }));
    const btns = el("div.stack");
    send.appendChild(btns);
    body.appendChild(send);

    function paintButtons() {
      btns.innerHTML = "";
      const ready = !!waNumber(number);
      const wa = el("a.btn.btn-primary.btn-block" + (ready ? "" : ".is-disabled"), {
        html: icon("share") + `<span>${ctx.t("update_via_whatsapp")}</span>`,
        href: ready ? whatsappLink(number, message) : "#",
        target: "_blank",
        rel: "noopener",
      });
      const sms = el("a.btn.btn-ghost.btn-block" + (number ? "" : ".is-disabled"), {
        html: icon("chat") + `<span>${ctx.t("update_via_sms")}</span>`,
        href: number ? smsLink(number, message) : "#",
      });
      // Rebuild the href at click time so edits to the message are included.
      wa.addEventListener("click", (e) => {
        if (!ready) { e.preventDefault(); return; }
        wa.href = whatsappLink(number, message);
      });
      sms.addEventListener("click", (e) => {
        if (!number) { e.preventDefault(); return; }
        sms.href = smsLink(number, message);
      });
      btns.appendChild(wa);
      btns.appendChild(sms);
      btns.appendChild(
        el("button.btn.btn-ghost.btn-block", {
          html: icon("check") + `<span>${ctx.t("update_copy")}</span>`,
          onclick: async () => {
            try { await navigator.clipboard.writeText(message); announce(ctx.t("share_copied")); }
            catch { box.select(); }
          },
        })
      );
      if (!ready && number) btns.appendChild(el("p.muted", { text: ctx.t("update_number_invalid") }));
    }
    paintButtons();

    // ---- daily reminder -------------------------------------------------
    const rem = el("div.card.stack");
    rem.appendChild(
      el("div.set-label", {}, [
        el("span.set-ic", { html: icon("clock") }),
        el("span", { text: ctx.t("update_daily_reminder") }),
      ])
    );
    const time = el("input.select", { type: "time", "aria-label": ctx.t("update_daily_reminder") });
    store.getSetting("updateReminderAt", "19:00").then((v) => { time.value = v || "19:00"; });
    time.addEventListener("change", async () => {
      await store.setSetting("updateReminderAt", time.value || null);
      announce(ctx.t("saved_ok"));
    });
    rem.appendChild(time);
    rem.appendChild(el("p.muted", { text: ctx.t("update_reminder_note") }));
    body.appendChild(rem);

    if (!appBaseUrl()) {
      body.appendChild(el("p.muted", { text: ctx.t("update_offline_links") }));
    }
  }

  return scr;
}
