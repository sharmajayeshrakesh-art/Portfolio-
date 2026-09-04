/**
 * tour.js — the first-run guide.
 *
 * Teaching by doing: each step carries the real control, so turning voice on
 * speaks immediately and switching to Night repaints the screen underneath.
 * Re-openable any time from Settings.
 */

import { el, segmented } from "../ui.js";
import { icon } from "../icons.js";
import { setTTS, ttsEnabled, speak } from "../tts.js";
import { setTheme, themePref } from "../theme.js";

export function renderTour(ctx) {
  const scr = el("main");
  const body = el("div.screen");
  scr.appendChild(body);

  let step = 0;
  let themeNow = "auto";
  themePref().then((p) => { themeNow = p; });

  const steps = [
    {
      ic: "sparkle",
      title: () => ctx.t("guide_title"),
      body: () => ctx.t("guide_intro"),
      control: null,
    },
    {
      ic: "volume",
      title: () => ctx.t("guide_voice_title"),
      body: () => ctx.t("guide_voice_body"),
      control: () =>
        segmented(
          [
            { val: "on", label: ctx.t("voice_on") },
            { val: "off", label: ctx.t("voice_off") },
          ],
          ttsEnabled() ? "on" : "off",
          (v) => {
            setTTS(v === "on");
            if (v === "on") speak(ctx.t("guide_voice_sample"), { force: true });
          }
        ),
    },
    {
      ic: "moon",
      title: () => ctx.t("guide_theme_title"),
      body: () => ctx.t("guide_theme_body"),
      control: () =>
        segmented(
          [
            { val: "day", label: ctx.t("theme_day") },
            { val: "night", label: ctx.t("theme_night") },
            { val: "auto", label: ctx.t("theme_auto") },
          ],
          themeNow,
          async (v) => { themeNow = v; await setTheme(v); }
        ),
    },
    {
      ic: "textsize",
      title: () => ctx.t("guide_size_title"),
      body: () => ctx.t("guide_size_body"),
      control: () =>
        segmented(
          [
            { val: "balanced", label: ctx.t("size_balanced") },
            { val: "large", label: ctx.t("size_comfortable") },
          ],
          document.documentElement.dataset.size === "large" ? "large" : "balanced",
          async (v) => {
            if (v === "large") document.documentElement.dataset.size = "large";
            else delete document.documentElement.dataset.size;
            await ctx.store.setSetting("displaySize", v);
          }
        ),
    },
    {
      ic: "check",
      title: () => ctx.t("guide_done_title"),
      body: () => ctx.t("guide_done_body"),
      control: null,
    },
  ];

  async function finish() {
    await ctx.store.setSetting("tourDone", true);
    ctx.navigate("home");
  }

  function paint() {
    const s = steps[step];
    const last = step === steps.length - 1;
    body.innerHTML = "";

    const box = el("div.tour");
    box.appendChild(el("div.tour-ic", { html: icon(s.ic, "icon-lg") }));
    box.appendChild(el("h1.h1", { text: s.title() }));
    box.appendChild(el("p.tour-body", { text: s.body() }));
    if (s.control) box.appendChild(el("div.tour-try", {}, [s.control()]));

    const dots = el("div.tour-dots");
    steps.forEach((_, i) => dots.appendChild(el("i" + (i === step ? ".on" : ""))));
    box.appendChild(dots);

    const actions = el("div.tour-actions");
    actions.appendChild(
      el("button.btn.btn-primary.btn-block", {
        text: last ? ctx.t("guide_start") : ctx.t("next"),
        onclick: () => { if (last) finish(); else { step += 1; paint(); } },
      })
    );
    if (!last) {
      actions.appendChild(
        el("button.btn.btn-ghost", { text: ctx.t("guide_skip"), onclick: finish })
      );
    }
    box.appendChild(actions);
    body.appendChild(box);

    if (ttsEnabled()) speak(`${s.title()}. ${s.body()}`);
  }

  paint();
  return scr;
}
