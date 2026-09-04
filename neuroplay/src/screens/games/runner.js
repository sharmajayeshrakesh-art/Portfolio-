/** runner.js — hosts a game, owns the SessionRecorder, shows results. */

import { el } from "../../ui.js";
import { icon } from "../../icons.js";
import { topBar } from "../chrome.js";
import { SessionRecorder } from "../../session.js";
import { GAMES } from "../../catalog.js";
import { currentLang } from "../../i18n.js";
import { speak } from "../../tts.js";

import { startPattern } from "./pattern.js";
import { startNumber } from "./number.js";
import { startWordRecall } from "./word-recall.js";
import { startOrientation } from "./orientation.js";

const IMPL = {
  pattern: startPattern,
  number_attention: startNumber,
  word_recall: startWordRecall,
  orientation: startOrientation,
};

export function renderGame(ctx, { id }) {
  const game = GAMES[id];
  const scr = el("main");
  const recorder = new SessionRecorder({ patientId: "primary", language: currentLang() });

  const exit = async () => { await recorder.finish(); ctx.navigate("games"); };
  scr.appendChild(topBar(ctx, { title: game ? ctx.t(game.tKey) : "", onBack: exit }));

  const host = el("div.screen");
  scr.appendChild(host);

  const impl = IMPL[id];
  if (!impl) {
    host.appendChild(
      el("div.empty.card", {}, [
        el("div.empty-ic", { html: icon(game ? game.icon : "sparkle", "icon-lg") }),
        el("h2.h2", { text: game ? ctx.t(game.tKey) : "" }),
        el("p.lead", { text: ctx.t("game_" + "orientation_desc") }),
        el("button.btn.btn-primary", { text: ctx.t("go_home"), onclick: () => ctx.navigate("games"), style: "margin-top:12px" }),
      ])
    );
    return scr;
  }

  const gameCtx = {
    ctx,
    recorder,
    host,
    gameId: id,
    finish: async () => {
      const session = await recorder.finish();
      showResults(session);
    },
  };
  impl(gameCtx);

  function showResults(session) {
    host.innerHTML = "";
    const rounds = session.summary ? session.summary.trials : 0;
    const box = el("div.game-stage.stack-lg");
    box.appendChild(el("div.empty-ic", { html: icon("check", "icon-lg"), style: "background:var(--good-tint);color:var(--good)" }));
    box.appendChild(el("h1.h1", { text: ctx.t("game_complete") }));
    box.appendChild(el("p.lead", { text: ctx.t("you_played", { count: rounds }) }));
    box.appendChild(
      el("div.row.wrap", { style: "gap:12px;justify-content:center" }, [
        el("button.btn.btn-primary", { html: icon("play") + `<span>${ctx.t("play_again")}</span>`, onclick: () => ctx.navigate("game", { id }) }),
        el("button.btn.btn-ghost", { html: icon("home") + `<span>${ctx.t("go_home")}</span>`, onclick: () => ctx.navigate("home") }),
      ])
    );
    host.appendChild(box);
    speak(ctx.t("game_complete") + ". " + ctx.t("well_done"));
  }

  return scr;
}
