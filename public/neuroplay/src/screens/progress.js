/** progress.js (screen) — "My progress", written for the elder to feel good.
 *  Effort-based: everything here only ever grows. The clinical picture stays
 *  in the caregiver dashboard. */

import { el } from "../ui.js";
import { icon } from "../icons.js";
import { topBar } from "./chrome.js";
import { buildProgress } from "../progress.js";
import { GAMES, GAME_ORDER, DOMAINS } from "../catalog.js";
import { fmtWeekdayNarrow } from "../i18n.js";
import { speak } from "../tts.js";

export function renderProgress(ctx) {
  const scr = el("main");
  scr.appendChild(topBar(ctx, { title: ctx.t("progress_title"), onBack: () => ctx.navigate("home") }));
  const body = el("div.screen.stack-lg");
  scr.appendChild(body);
  body.appendChild(el("p.muted", { text: ctx.t("loading") }));

  buildProgress().then((p) => {
    body.innerHTML = "";

    // ---- Level card: lamps lit, ring of progress ----------------------
    const lamps = el("div.lamps");
    for (let i = 0; i < 8; i++) {
      lamps.appendChild(el("span.lamp" + (i < Math.min(p.level, 8) ? ".lit" : ""), { html: icon("lamp") }));
    }
    body.appendChild(
      el("section.level-card", {}, [
        el("div.level-top", {}, [
          el("div", {}, [
            el("div.level-eyebrow", { text: ctx.t("level_label", { n: p.level }) }),
            el("div.level-name", { text: ctx.t(p.levelKey) }),
          ]),
          el("div.level-points", {}, [
            el("strong", { text: String(p.points) }),
            el("span", { text: ctx.t("points") }),
          ]),
        ]),
        lamps,
        el("div.level-bar", {}, [el("div.level-fill", { style: `width:${p.pctToNext}%` })]),
        el("div.level-next", { text: ctx.t("points_to_next", { n: p.levelSpan - p.intoLevel }) }),
      ])
    );

    // ---- Streak + 7-day strip -----------------------------------------
    const strip = el("div.week");
    for (const d of p.last7) {
      strip.appendChild(
        el("div.week-day" + (d.played ? ".on" : ""), {}, [
          el("span.wd", { text: fmtWeekdayNarrow(new Date(d.t)) }),
          el("span.dot", { html: d.played ? icon("check") : "" }),
        ])
      );
    }
    body.appendChild(
      el("section.card.stack", {}, [
        el("div.row.between", {}, [
          el("div.set-label", {}, [
            el("span.set-ic", { html: icon("flame") }),
            el("span", { text: ctx.t("streak_title") }),
          ]),
          el("strong", { text: ctx.t("streak_days", { n: p.streak }), style: "font-size:var(--fs-lg)" }),
        ]),
        strip,
        el("p.section-sub", { text: p.playedToday ? ctx.t("played_today") : ctx.t("play_today_hint") }),
      ])
    );

    // ---- Totals --------------------------------------------------------
    const stats = el("div.stat-grid");
    stats.appendChild(stat(ctx.t("stat_days"), p.daysPlayed));
    stats.appendChild(stat(ctx.t("stat_rounds"), p.rounds));
    stats.appendChild(stat(ctx.t("stat_best_streak"), p.bestStreak));
    stats.appendChild(stat(ctx.t("stat_sessions"), p.sessions));
    body.appendChild(stats);

    // ---- Per-game levels ----------------------------------------------
    const list = el("div.stack");
    list.appendChild(el("div.section-title", { text: ctx.t("your_games") }));
    let any = false;
    for (const id of GAME_ORDER) {
      const g = p.perGame[id];
      if (!g) continue;
      any = true;
      const meta = GAMES[id];
      list.appendChild(
        el("div.game-row", {}, [
          el("span.game-row-ic", {
            html: icon(meta.icon),
            style: `background:color-mix(in srgb, ${DOMAINS[meta.domain].color} 15%, transparent);color:${DOMAINS[meta.domain].color}`,
          }),
          el("div.grow", {}, [
            el("div", { text: ctx.t(meta.tKey), style: "font-weight:800" }),
            el("div.section-sub", { text: ctx.t("rounds_played", { n: g.rounds }) }),
          ]),
          el("span.pill", { text: ctx.t("level_label", { n: g.bestLevel }) }),
        ])
      );
    }
    if (any) body.appendChild(list);

    // ---- Share with family ---------------------------------------------
    body.appendChild(
      el("button.btn.btn-primary.btn-block", {
        html: icon("share") + `<span>${ctx.t("share_family")}</span>`,
        onclick: () => shareSummary(ctx, p),
      })
    );

    if (p.streak > 0) speak(ctx.t("streak_days", { n: p.streak }));
  });

  return scr;
}

function stat(k, v) {
  return el("div.stat", {}, [el("div.k", { text: k }), el("div.v", { text: String(v) })]);
}

/** A warm, plain-language update the family can actually read. */
async function shareSummary(ctx, p) {
  const text = [
    ctx.t("share_heading"),
    "",
    ctx.t("share_level", { n: p.level, name: ctx.t(p.levelKey) }),
    ctx.t("share_streak", { n: p.streak }),
    ctx.t("share_days", { n: p.daysPlayed, r: p.rounds }),
    "",
    ctx.t("share_footer"),
  ].join("\n");

  try {
    if (navigator.share) {
      await navigator.share({ text });
      return;
    }
  } catch { /* user dismissed the sheet */ }
  try {
    await navigator.clipboard.writeText(text);
    alert(ctx.t("share_copied"));
  } catch {
    alert(text);
  }
}
