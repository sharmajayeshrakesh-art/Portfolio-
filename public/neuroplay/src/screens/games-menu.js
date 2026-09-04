/** games-menu.js — pick a game. Large tiles, icon + label + one-line hint. */

import { el } from "../ui.js";
import { icon } from "../icons.js";
import { topBar } from "./chrome.js";
import { GAME_ORDER, GAMES, DOMAINS } from "../catalog.js";
import { speak } from "../tts.js";

export function renderGamesMenu(ctx) {
  const scr = el("main");
  scr.appendChild(topBar(ctx, { title: ctx.t("games_title"), hint: ctx.t("games_title"), onBack: () => ctx.navigate("home") }));
  const body = el("div.screen.stack");
  const tiles = el("div.tiles");
  for (const id of GAME_ORDER) {
    const g = GAMES[id];
    const color = DOMAINS[g.domain].color;
    tiles.appendChild(
      el("button.tile", { onclick: () => ctx.navigate("game", { id }) }, [
        el("div.tile-ic", { html: icon(g.icon, "icon-lg"), style: `background:color-mix(in srgb, ${color} 15%, transparent);color:${color}` }),
        el("div.tile-title", { text: ctx.t(g.tKey) }),
        el("div.tile-sub", { text: ctx.t(g.tKey + "_desc") }),
      ])
    );
  }
  body.appendChild(tiles);
  scr.appendChild(body);
  speak(ctx.t("games_title"));
  return scr;
}
