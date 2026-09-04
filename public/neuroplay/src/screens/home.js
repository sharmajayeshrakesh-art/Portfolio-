/** home.js — the calm elder home: orientation + one-tap actions. */

import { el } from "../ui.js";
import { icon } from "../icons.js";
import { fmtWeekday, fmtDayMonth } from "../i18n.js";
import { speak } from "../tts.js";
import { calmSettings, inWindow } from "../calm.js";

function greetingKey(h) {
  if (h < 12) return "greeting_morning";
  if (h < 17) return "greeting_afternoon";
  return "greeting_evening";
}
function partKey(h) {
  if (h < 12) return "part_morning";
  if (h < 17) return "part_afternoon";
  if (h < 20) return "part_evening";
  return "part_night";
}
function seasonKey(m) {
  if (m >= 2 && m <= 5) return "season_summer";
  if (m >= 6 && m <= 8) return "season_monsoon";
  if (m >= 9 && m <= 10) return "season_spring";
  return "season_winter";
}

export function renderHome(ctx) {
  const now = new Date();
  const weekday = fmtWeekday(now);
  const dateStr = fmtDayMonth(now);

  const scr = el("main.screen.stack-lg");

  // top row: app name + discreet caregiver button
  scr.appendChild(
    el("div.row.between", {}, [
      el("div.row", {}, [
        el("span", { html: icon("sparkle", "icon-lg"), style: "color:var(--primary)" }),
        el("strong", { text: ctx.t("app_name"), style: "font-size:var(--fs-lg)" }),
      ]),
      el("div.row", { style: "gap:10px" }, [
        el("button.topbar-btn", {
          onclick: () => ctx.navigate("settings"),
          "aria-label": ctx.t("settings_title"),
          html: icon("gear"),
        }),
        el("button.topbar-btn", {
          onclick: () => ctx.navigate("pin"),
          "aria-label": ctx.t("caregiver_title"),
          html: icon("lock"),
        }),
      ]),
    ])
  );

  // orientation card
  const orient = el("section.orient");
  orient.appendChild(el("div", { text: ctx.t(greetingKey(now.getHours())), style: "font-size:var(--fs-lg);opacity:.9" }));
  orient.appendChild(el("div.day", { text: weekday }));
  orient.appendChild(el("div.sub", { text: dateStr }));
  orient.appendChild(
    el("div.chips", {}, [
      el("span.chip", { text: ctx.t(partKey(now.getHours())) }),
      el("span.chip", { text: ctx.t(seasonKey(now.getMonth())) }),
    ])
  );
  scr.appendChild(orient);

  // During the sundowning window the calm room is offered before anything
  // else on the screen — by then a game is the wrong suggestion.
  const calmSlot = el("div");
  scr.appendChild(calmSlot);
  calmSettings().then((cfg) => {
    if (!inWindow(cfg)) return;
    calmSlot.appendChild(
      el("button.calm-card", {
        onclick: () => ctx.navigate("calm"),
        html:
          `<span class="calm-card-ic">${icon("leaf", "icon-lg")}</span>` +
          `<span class="calm-card-text"><strong>${ctx.t("calm_card_title")}</strong>` +
          `<span>${ctx.t("calm_card_sub")}</span></span>`,
      })
    );
  });

  // primary action
  scr.appendChild(
    el("button.btn.btn-primary.btn-xl.btn-block", {
      onclick: () => ctx.navigate("games"),
      html: icon("play", "icon-lg") + `<span>${ctx.t("start_playing")}</span>`,
    })
  );

  // secondary tiles
  const tiles = el("div.tiles");
  tiles.appendChild(actionTile(ctx, "progress_title", "trophy", () => ctx.navigate("progress")));
  tiles.appendChild(actionTile(ctx, "memory_help", "face", () => ctx.navigate("memory")));
  const rem = actionTile(ctx, "reminders", "bell", () => ctx.navigate("memory", { tab: "reminders" }));
  rem.classList.add("tile-wide");
  tiles.appendChild(rem);
  const emg = actionTile(ctx, "emergency", "phone", () => ctx.navigate("emergency"));
  emg.classList.add("tile-alert");
  emg.classList.add("tile-wide");
  tiles.appendChild(emg);
  scr.appendChild(tiles);

  speak(`${ctx.t(greetingKey(now.getHours()))}. ${ctx.t("home_today_is", { day: weekday })}.`);
  return scr;
}

function actionTile(ctx, key, ic, onclick) {
  return el("button.tile", { onclick }, [
    el("div.tile-ic", { html: icon(ic, "icon-lg") }),
    el("div.tile-title", { text: ctx.t(key) }),
  ]);
}
