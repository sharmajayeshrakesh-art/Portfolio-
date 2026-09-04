/** orientation.js — Daily Orientation Check (domain: orientation).
 *  Gentle, no shaming. Uses the real date via Intl so it is always current. */

import { el } from "../../ui.js";
import { currentLocale } from "../../i18n.js";
import { speak } from "../../tts.js";

export function startOrientation(g) {
  const { ctx, recorder, host } = g;
  const loc = currentLocale();
  const now = new Date();
  const MAX = 5;
  let round = 0;
  recorder.addGame("orientation");

  host.innerHTML = "";
  const stage = el("div.game-stage.stack-lg");
  const prompt = el("div.game-prompt");
  const opts = el("div.opt-grid");
  const feedback = el("div.feedback");
  stage.append(prompt, opts, feedback);
  host.appendChild(stage);

  const weekdayName = (d) => new Intl.DateTimeFormat(loc, { weekday: "long" }).format(d);
  const questions = [buildDay, buildPart, buildSeason, buildDay, buildPart];

  function buildDay() {
    const correct = weekdayName(now);
    const days = new Set([correct]);
    while (days.size < 4) days.add(weekdayName(new Date(now.getTime() + Math.floor(Math.random() * 7) * 86400000)));
    return { q: ctx.t("orient_q_day"), correct, options: shuffle([...days]) };
  }
  function buildPart() {
    const h = now.getHours();
    const key = h < 12 ? "part_morning" : h < 17 ? "part_afternoon" : h < 20 ? "part_evening" : "part_night";
    const all = ["part_morning", "part_afternoon", "part_evening", "part_night"];
    return { q: ctx.t("orient_q_part"), correct: ctx.t(key), options: shuffle(all.map((k) => ctx.t(k))) };
  }
  function buildSeason() {
    const m = now.getMonth();
    const key = m >= 2 && m <= 5 ? "season_summer" : m >= 6 && m <= 8 ? "season_monsoon" : m >= 9 && m <= 10 ? "season_spring" : "season_winter";
    const all = ["season_summer", "season_monsoon", "season_spring", "season_winter"];
    return { q: ctx.t("orient_q_season"), correct: ctx.t(key), options: shuffle(all.map((k) => ctx.t(k))) };
  }

  function newRound() {
    round++;
    if (round > MAX) return g.finish();
    feedback.textContent = "";
    const item = questions[(round - 1) % questions.length]();
    prompt.textContent = item.q;
    speak(item.q);

    let first = false;
    recorder.startTrial({ gameId: "orientation", trialIndex: round - 1, difficulty: 1, meta: {} });

    opts.innerHTML = "";
    for (const label of item.options) {
      const btn = el("button.opt", { text: label });
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        if (!first) { recorder.markFirstTouch(); first = true; }
        const ok = label === item.correct;
        btn.classList.add(ok ? "correct" : "wrong");
        [...opts.children].forEach((c) => (c.disabled = true));
        recorder.endTrial({ correct: ok, errorType: ok ? null : "wrong_option" });
        // gentle: never shame — show the right answer softly if wrong
        feedback.textContent = ctx.t(ok ? "well_done" : "lets_continue");
        feedback.className = "feedback " + (ok ? "good" : "warn");
        speak(ctx.t(ok ? "well_done" : "lets_continue"));
        setTimeout(newRound, 1150);
      });
      opts.appendChild(btn);
    }
  }
  newRound();
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
