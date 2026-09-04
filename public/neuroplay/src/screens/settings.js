/** settings.js — elder-facing preferences: display size, voice, language. */

import { el } from "../ui.js";
import { icon } from "../icons.js";
import { topBar } from "./chrome.js";
import { LANGUAGES } from "../i18n.js";
import { ttsEnabled, setTTS, speak } from "../tts.js";

export function renderSettings(ctx) {
  const scr = el("main");
  scr.appendChild(
    topBar(ctx, {
      title: ctx.t("settings_title"),
      onBack: () => ctx.navigate(ctx.mode === "caregiver" ? "dashboard" : "home"),
    })
  );
  const body = el("div.screen.stack-lg");
  scr.appendChild(body);

  // ---- Display size --------------------------------------------------
  const sizeVal = () => document.documentElement.dataset.size || "comfortable";
  const sizeSeg = segmented(
    [
      { val: "balanced", label: ctx.t("size_balanced") },
      { val: "comfortable", label: ctx.t("size_comfortable") },
    ],
    sizeVal(),
    async (v) => {
      if (v === "comfortable") delete document.documentElement.dataset.size;
      else document.documentElement.dataset.size = v;
      await ctx.store.setSetting("displaySize", v);
    }
  );
  body.appendChild(settingCard(ctx, "setting_text_size", "gear", sizeSeg));

  // ---- Voice ---------------------------------------------------------
  const voiceSeg = segmented(
    [
      { val: "on", label: ctx.t("voice_on") },
      { val: "off", label: ctx.t("voice_off") },
    ],
    ttsEnabled() ? "on" : "off",
    (v) => {
      setTTS(v === "on");
      if (v === "on") speak(ctx.t("setting_voice"), { force: true });
    }
  );
  body.appendChild(settingCard(ctx, "setting_voice", "volume", voiceSeg));

  // ---- Language ------------------------------------------------------
  const langWrap = el("div.lang-grid");
  for (const l of LANGUAGES) {
    langWrap.appendChild(
      el("button.choice", {
        disabled: !l.ready,
        style: l.ready ? "" : "opacity:.55",
        "aria-pressed": String(l.code === ctx.lang),
        onclick: async () => { await ctx.setLang(l.code); },
      }, [
        el("span.native", { text: l.native, lang: l.code }),
        l.ready ? el("span.latin", { text: l.label }) : el("span.pill", { text: "soon" }),
      ])
    );
  }
  const langCard = el("div.card.stack", {}, [
    el("div.set-row", {}, [
      el("div.set-label", {}, [el("span.set-ic", { html: icon("globe") }), el("span", { text: ctx.t("setting_language") })]),
    ]),
    langWrap,
  ]);
  body.appendChild(langCard);

  return scr;
}

function settingCard(ctx, key, ic, control) {
  return el("div.card", {}, [
    el("div.set-row", {}, [
      el("div.set-label", {}, [el("span.set-ic", { html: icon(ic) }), el("span", { text: ctx.t(key) })]),
      control,
    ]),
  ]);
}

function segmented(options, current, onchange) {
  const seg = el("div.seg");
  const btns = [];
  for (const o of options) {
    const b = el("button", {
      text: o.label,
      "aria-pressed": String(o.val === current),
      onclick: () => {
        btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        onchange(o.val);
      },
    });
    btns.push(b);
    seg.appendChild(b);
  }
  return seg;
}
