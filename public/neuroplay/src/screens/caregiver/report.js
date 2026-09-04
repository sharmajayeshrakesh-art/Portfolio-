/** report.js — printable doctor summary, generated on-device (print -> PDF). */

import { el } from "../../ui.js";
import { icon } from "../../icons.js";
import { topBar } from "../chrome.js";
import { buildAnalytics } from "../../analytics.js";
import { DOMAIN_ORDER } from "../../catalog.js";
import { currentLocale } from "../../i18n.js";
import { reactionLineSVG } from "../../charts.js";

export function renderReport(ctx) {
  const scr = el("main");
  scr.appendChild(
    topBar(ctx, {
      title: ctx.t("export_report"),
      onBack: () => ctx.navigate("dashboard"),
      right: el("button.topbar-btn", { html: icon("download") + `<span>${ctx.t("print_report")}</span>`, onclick: () => window.print() }),
    })
  );
  const body = el("div.screen");
  scr.appendChild(body);
  body.appendChild(el("p.muted", { text: ctx.t("loading") }));

  buildAnalytics().then((a) => {
    body.innerHTML = "";
    const dateStr = new Intl.DateTimeFormat(currentLocale(), { dateStyle: "long" }).format(new Date());
    const sheet = el("div.report", { id: "report-sheet" });

    sheet.appendChild(
      el("div.report-head", {}, [
        el("div", {}, [
          el("div.eyebrow", { text: ctx.t("app_name") }),
          el("h1.h2", { text: ctx.t("report_title") }),
          el("p.section-sub", { text: ctx.t("report_for_doctor") }),
        ]),
        el("div.report-meta", {}, [
          el("div", { text: ctx.t("generated_on", { date: dateStr }) }),
          el("div", { text: `${ctx.t("metric_sessions")}: ${a.sessionCount}` }),
          el("div", { text: `${ctx.t("metric_trials")}: ${a.totalTrials}` }),
        ]),
      ])
    );

    // decline verdict
    const d = a.decline;
    const verdict =
      d.status === "alert" ? ctx.t("decline_alert_title") :
      d.status === "stable" ? ctx.t("decline_stable") :
      ctx.t("decline_insufficient", { needed: d.needed, have: d.have });
    sheet.appendChild(el("div.report-verdict " + d.status, {}, [
      el("strong", { text: verdict }),
    ]));

    if (d.reasons && d.reasons.length) {
      const ul = el("ul.alert-reasons");
      for (const r of d.reasons) {
        let text;
        if (r.key === "reaction_slower") text = ctx.t("reason_reaction_slower", { value: r.value });
        else if (r.key === "accuracy_drop") text = ctx.t("reason_accuracy_drop", { value: r.value });
        else if (r.key === "domain_drop") text = ctx.t("reason_domain_drop", { domain: ctx.t("domain_" + r.domain), value: r.value });
        else if (r.key === "abandonment") text = ctx.t("reason_abandonment", { value: r.value });
        ul.appendChild(el("li", {}, [el("span", { text })]));
      }
      sheet.appendChild(ul);
    }

    // trend chart
    sheet.appendChild(el("h3.section-title", { text: ctx.t("reaction_trend_title"), style: "margin-top:18px" }));
    sheet.appendChild(el("div", { html: reactionLineSVG(a.reactionTrend.points) }));

    // domain table
    sheet.appendChild(el("h3.section-title", { text: ctx.t("domain_accuracy_title"), style: "margin-top:18px" }));
    const table = el("table.report-table");
    for (const dm of DOMAIN_ORDER) {
      const v = a.domainAccuracy[dm];
      if (!v || v.accuracy == null) continue;
      table.appendChild(el("tr", {}, [
        el("td", { text: ctx.t("domain_" + dm) }),
        el("td", { text: Math.round(v.accuracy * 100) + "%" }),
        el("td", { text: `${v.trials} ${ctx.t("metric_trials").toLowerCase()}` }),
      ]));
    }
    sheet.appendChild(table);

    sheet.appendChild(el("p.report-disclaimer", { text: ctx.t("report_disclaimer") }));
    body.appendChild(sheet);
  });

  return scr;
}
