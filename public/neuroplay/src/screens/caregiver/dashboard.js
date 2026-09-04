/** dashboard.js — the caregiver centrepiece. Every value is computed live. */

import { el, mount, formatRelativeDay } from "../../ui.js";
import { icon } from "../../icons.js";
import { topBar } from "../chrome.js";
import { buildAnalytics } from "../../analytics.js";
import { DOMAIN_ORDER, DOMAINS } from "../../catalog.js";
import { reactionLineSVG } from "../../charts.js";
import { seedDemoData } from "../../seed.js";
import { buildProgress } from "../../progress.js";
import { speak } from "../../tts.js";

export function renderDashboard(ctx) {
  const scr = el("main");
  scr.appendChild(
    topBar(ctx, {
      title: ctx.t("dashboard_title"),
      hint: ctx.t("dashboard_title"),
      onBack: () => { ctx.setMode("elder"); ctx.navigate("home"); },
    })
  );
  const body = el("div.screen.stack-lg");
  scr.appendChild(body);
  body.appendChild(el("p.muted", { text: ctx.t("loading") }));

  refresh();

  async function refresh() {
    const a = await buildAnalytics();
    body.innerHTML = "";

    if (a.sessionCount === 0) {
      body.appendChild(emptyState());
      return;
    }

    // ---- stat row -------------------------------------------------------
    const stats = el("div.stat-grid");
    stats.appendChild(stat(ctx.t("metric_sessions"), a.sessionCount));
    stats.appendChild(stat(ctx.t("metric_trials"), a.totalTrials));
    stats.appendChild(stat(ctx.t("metric_last_played"), formatRelativeDay(a.lastPlayed, ctx.t), true));
    stats.appendChild(stat(ctx.t("metric_engagement"), ctx.t("per_week", { n: a.engagement.perWeek }), true, ctx.t("day_streak", { n: a.engagement.streakDays })));
    body.appendChild(stats);

    // ---- decline screening card (most important) ------------------------
    body.appendChild(declineCard(ctx, a.decline));

    // ---- what the family sees: effort, not score ------------------------
    const engage = el("div.card.stack");
    engage.appendChild(el("div.section-title", { text: ctx.t("engagement_title") }));
    engage.appendChild(el("p.section-sub", { text: ctx.t("engagement_sub") }));
    const eg = el("div.stat-grid");
    engage.appendChild(eg);
    body.appendChild(engage);
    buildProgress().then((pr) => {
      eg.appendChild(stat(ctx.t("cg_level"), `${pr.level} · ${ctx.t(pr.levelKey)}`, true));
      eg.appendChild(stat(ctx.t("cg_streak"), ctx.t("streak_days", { n: pr.streak }), true));
      eg.appendChild(stat(ctx.t("cg_days"), pr.daysPlayed));
      eg.appendChild(stat(ctx.t("cg_points"), pr.points));
    });

    // ---- reaction time trend --------------------------------------------
    body.appendChild(trendCard(ctx, a.reactionTrend));

    // ---- domain accuracy ------------------------------------------------
    body.appendChild(domainCard(ctx, a.domainAccuracy));

    // ---- when in the day it is hardest ----------------------------------
    body.appendChild(timeOfDayCard(ctx, a.timeOfDay));

    // ---- caregiver actions ---------------------------------------------
    const actions = el("div.tiles");
    actions.appendChild(smallTile(ctx, "content_title", "photo", () => ctx.navigate("content")));
    actions.appendChild(smallTile(ctx, "export_report", "download", () => ctx.navigate("report")));
    actions.appendChild(smallTile(ctx, "family_voice_title", "user", () => ctx.navigate("voicestudio")));
    actions.appendChild(smallTile(ctx, "update_title", "share", () => ctx.navigate("update")));
    body.appendChild(actions);

    // ---- demo / data tools ---------------------------------------------
    body.appendChild(dataTools());

    if (a.decline.status === "alert") speak(ctx.t("decline_alert_title"));
  }

  /**
   * Accuracy split across the day. This is the evidence for sundowning in THIS
   * patient rather than a claim from the literature — and if the evening bar
   * is the short one, the calm window is pointed at the right hours.
   */
  function timeOfDayCard(ctx2, tod) {
    const c = el("div.card.stack");
    c.appendChild(el("div.section-title", { text: ctx2.t("timeofday_title") }));
    c.appendChild(el("p.section-sub", { text: ctx2.t("timeofday_sub") }));
    const withData = tod.parts.filter((p2) => p2.trials > 0);
    if (!withData.length) {
      c.appendChild(el("p.muted", { text: ctx2.t("no_domain_data") }));
      return c;
    }
    const rows = el("div.stack");
    for (const p2 of tod.parts) {
      const pct = p2.accuracy == null ? null : Math.round(p2.accuracy * 100);
      const row = el("div.tod-row" + (tod.hardest === p2.id ? ".is-low" : ""));
      row.appendChild(el("div.tod-label", { text: ctx2.t("daypart_" + p2.id) }));
      const track = el("div.tod-track");
      track.appendChild(el("i", { style: `width:${pct == null ? 0 : pct}%` }));
      row.appendChild(track);
      row.appendChild(el("div.tod-val", { text: pct == null ? "—" : pct + "%" }));
      rows.appendChild(row);
    }
    c.appendChild(rows);
    if (tod.hardest) {
      c.appendChild(el("p.section-sub", { text: ctx2.t("timeofday_hardest", { part: ctx2.t("daypart_" + tod.hardest) }) }));
      if (tod.hardest === "evening") {
        c.appendChild(
          el("button.btn.btn-ghost.btn-block", {
            html: icon("leaf") + `<span>${ctx2.t("timeofday_calm_link")}</span>`,
            onclick: () => ctx2.navigate("calm"),
          })
        );
      }
    }
    return c;
  }

  function emptyState() {
    const box = el("div.stack-lg");
    box.appendChild(
      el("div.empty.card", {}, [
        el("div.empty-ic", { html: icon("chart", "icon-lg") }),
        el("h2.h2", { text: ctx.t("no_data_yet") }),
        el("p.lead", { text: ctx.t("no_data_desc") }),
      ])
    );
    box.appendChild(dataTools());
    return box;
  }

  function dataTools() {
    const c = el("div.card.stack");
    c.appendChild(el("div.section-title", { text: ctx.t("demo_seed") }));
    c.appendChild(el("p.section-sub", { text: ctx.t("demo_seed_desc") }));
    c.appendChild(
      el("div.row.wrap", { style: "gap:12px" }, [
        el("button.btn.btn-accent", {
          html: icon("sparkle") + `<span>${ctx.t("load_demo")}</span>`,
          onclick: async (e) => { e.target.disabled = true; await seedDemoData(); refresh(); },
        }),
        el("button.btn.btn-ghost", {
          html: icon("x") + `<span>${ctx.t("clear_data")}</span>`,
          onclick: async () => {
            if (confirm(ctx.t("clear_confirm"))) { await ctx.store.wipeGameData(); refresh(); }
          },
        }),
      ])
    );
    return c;
  }

  return scr;
}

function stat(k, v, small, extra) {
  return el("div.stat", {}, [
    el("div.k", { text: k }),
    el("div.v", { text: String(v), style: small ? "font-size:var(--fs-lg)" : "" }),
    extra ? el("div.u", { text: extra }) : null,
  ]);
}

function declineCard(ctx, d) {
  if (d.status === "insufficient") {
    return el("div.alert-card.insufficient", {}, [
      el("div.a-title", { html: icon("clock") + `<span>${ctx.t("decline_title")}</span>` }),
      el("p", { style: "margin-top:8px", text: ctx.t("decline_insufficient", { needed: d.needed, have: d.have }) }),
    ]);
  }
  if (d.status === "stable") {
    return el("div.alert-card.stable", {}, [
      el("div.a-title", { html: icon("shield") + `<span>${ctx.t("decline_stable")}</span>` }),
      el("p", { style: "margin-top:8px", text: ctx.t("decline_stable_desc") }),
    ]);
  }
  const reasons = el("ul.alert-reasons");
  for (const r of d.reasons) {
    let text;
    if (r.key === "reaction_slower") text = ctx.t("reason_reaction_slower", { value: r.value });
    else if (r.key === "accuracy_drop") text = ctx.t("reason_accuracy_drop", { value: r.value });
    else if (r.key === "domain_drop") text = ctx.t("reason_domain_drop", { domain: ctx.t("domain_" + r.domain), value: r.value });
    else if (r.key === "abandonment") text = ctx.t("reason_abandonment", { value: r.value });
    reasons.appendChild(el("li", {}, [el("span", { text })]));
  }
  return el("div.alert-card.alert", {}, [
    el("div.a-title", { html: icon("alert") + `<span>${ctx.t("decline_alert_title")}</span>` }),
    el("p", { style: "margin-top:8px", text: ctx.t("decline_alert_desc") }),
    reasons,
  ]);
}

function trendCard(ctx, trend) {
  const slope = trend.slopePerSession;
  const cls = slope > 40 ? "up" : slope < -40 ? "down" : "flat";
  const label = slope > 40 ? ctx.t("trend_slower") : slope < -40 ? ctx.t("trend_faster") : ctx.t("trend_steady");
  const card = el("div.chart-card.stack");
  card.appendChild(
    el("div.row.between", {}, [
      el("div", {}, [
        el("div.section-title", { text: ctx.t("reaction_trend_title") }),
        el("div.section-sub", { text: ctx.t("reaction_trend_sub") }),
      ]),
      el("span.trend-flag." + cls, { html: `<span>${label}</span>` }),
    ])
  );
  card.appendChild(el("div", { html: reactionLineSVG(trend.points), style: "width:100%" }));
  card.appendChild(el("div.section-sub", { text: `${ctx.t("unit_ms")} · ${slope >= 0 ? "+" : ""}${slope} ${ctx.t("unit_ms")}/session` }));
  return card;
}

function domainCard(ctx, dom) {
  const card = el("div.chart-card.stack");
  card.appendChild(el("div.section-title", { text: ctx.t("domain_accuracy_title") }));
  const bars = el("div.dbars");
  let any = false;
  for (const d of DOMAIN_ORDER) {
    const v = dom[d];
    if (!v || v.accuracy == null) continue;
    any = true;
    const pct = Math.round(v.accuracy * 100);
    const color = DOMAINS[d].color;
    bars.appendChild(
      el("div.dbar-row", {}, [
        el("div.dbar-label", {}, [el("span.dbar-swatch", { style: `background:${color}` }), el("span", { text: ctx.t("domain_" + d) })]),
        el("div.dbar-track", {}, [el("div.dbar-fill", { style: `width:${pct}%;background:${color}` })]),
        el("div.dbar-val", { text: pct + "%" }),
      ])
    );
  }
  card.appendChild(any ? bars : el("p.section-sub", { text: ctx.t("no_domain_data") }));
  return card;
}

function smallTile(ctx, key, ic, onclick) {
  return el("button.tile", { onclick }, [
    el("div.tile-ic", { html: icon(ic, "icon-lg") }),
    el("div.tile-title", { text: ctx.t(key) }),
  ]);
}
