/** onboarding.js — first run: pick language, then choose mode. */

import { el, mount } from "../ui.js";
import { icon } from "../icons.js";
import { LANGUAGES } from "../i18n.js";
import { speak } from "../tts.js";

export function renderOnboarding(ctx) {
  const root = document.getElementById("app");
  const wrap = el("main.screen.stack-lg");

  function step1() {
    const s = el("div.stack-lg");
    s.appendChild(el("div.center.stack", {}, [
      el("div", { html: icon("globe", "icon-lg"), style: "color:var(--primary)" }),
      el("h1.h1", { text: ctx.t("welcome_title") }),
      el("p.lead", { text: ctx.t("choose_language") }),
    ]));
    const grid = el("div.lang-grid");
    for (const l of LANGUAGES) {
      grid.appendChild(
        el("button.choice", {
          disabled: !l.ready,
          style: l.ready ? "" : "opacity:.55",
          onclick: async () => {
            await ctx.setLang(l.code);
            speak(l.native, { locale: l.locale });
            mount(root, buildStep2());
          },
        }, [
          el("span.native", { text: l.native, lang: l.code }),
          l.ready ? el("span.latin", { text: l.label }) : el("span.pill", { text: "soon" }),
        ])
      );
    }
    s.appendChild(grid);
    return s;
  }

  function buildStep2() {
    const scr = el("main.screen.stack-lg");
    scr.appendChild(el("div.center.stack", {}, [
      el("h1.h1", { text: ctx.t("welcome_title") }),
      el("p.lead", { text: ctx.t("choose_mode") }),
    ]));
    scr.appendChild(
      el("button.tile.tile-wide.card-pad-lg", {
        style: "min-height:120px",
        onclick: async () => { await start("elder"); },
      }, [
        el("div.tile-ic", { html: icon("play", "icon-lg") }),
        el("div.grow", {}, [
          el("div.tile-title", { text: ctx.t("mode_elder") }),
          el("div.tile-sub", { text: ctx.t("mode_elder_desc") }),
        ]),
      ])
    );
    scr.appendChild(
      el("button.tile.tile-wide.card-pad-lg.tile-accent", {
        style: "min-height:120px",
        onclick: async () => { await start("caregiver"); ctx.navigate("pin"); },
      }, [
        el("div.tile-ic", { html: icon("user", "icon-lg") }),
        el("div.grow", {}, [
          el("div.tile-title", { text: ctx.t("mode_caregiver") }),
          el("div.tile-sub", { text: ctx.t("mode_caregiver_desc") }),
        ]),
      ])
    );
    speak(ctx.t("choose_mode"));
    return scr;
  }

  async function start(mode) {
    ctx.setMode(mode);
    await ctx.store.setSetting("onboarded", true);
    if (mode === "elder") ctx.navigate("tour");
  }

  wrap.appendChild(step1());
  speak(ctx.t("choose_language"));
  return wrap;
}
