/** money.js — Count the money (domain: reasoning).
 *  Mental arithmetic grounded in real rupees. Handling money is one of the
 *  first everyday skills dementia affects, so this is practice that matters
 *  outside the app, not an abstract sum. */

import { el } from "../../ui.js";
import { speak } from "../../tts.js";

const NOTES = [10, 20, 50, 100, 200, 500];
const COINS = [1, 2, 5, 10];

export function startMoney(g) {
  const { ctx, recorder, host } = g;
  const MAX = 6;
  let round = 0, level = 1;
  recorder.addGame("money");

  host.innerHTML = "";
  const stage = el("div.game-stage.stack-lg");
  const prompt = el("div.game-prompt", { text: ctx.t("game_money_desc") });
  const purse = el("div.purse");
  const opts = el("div.opt-grid");
  const feedback = el("div.feedback");
  stage.append(prompt, purse, opts, feedback);
  host.appendChild(stage);

  function newRound() {
    round += 1;
    if (round > MAX) return g.finish();
    feedback.textContent = "";

    // level 1-2: two items; 3-4: three; 5+: four
    const count = level <= 2 ? 2 : level <= 4 ? 3 : 4;
    const items = [];
    for (let i = 0; i < count; i++) {
      const useCoin = level <= 2 ? Math.random() < 0.4 : Math.random() < 0.25;
      const pool = useCoin ? COINS : NOTES.slice(0, Math.min(NOTES.length, 2 + level));
      items.push({ v: pool[Math.floor(Math.random() * pool.length)], coin: useCoin });
    }
    const total = items.reduce((s, x) => s + x.v, 0);

    purse.innerHTML = "";
    for (const it of items) {
      purse.appendChild(
        el(it.coin ? "span.coin" : "span.note", { text: "₹" + it.v })
      );
    }
    prompt.textContent = ctx.t("game_money_prompt");
    speak(ctx.t("game_money_prompt"));

    let first = false;
    recorder.startTrial({ gameId: "money", trialIndex: round - 1, difficulty: level, meta: { total } });

    opts.innerHTML = "";
    for (const v of options(total)) {
      const btn = el("button.opt", { text: "₹" + v });
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        if (!first) { recorder.markFirstTouch(); first = true; }
        const ok = v === total;
        btn.classList.add(ok ? "correct" : "wrong");
        [...opts.children].forEach((c) => (c.disabled = true));
        recorder.endTrial({ correct: ok, errorType: ok ? null : "wrong_option" });
        feedback.textContent = ctx.t(ok ? "well_done" : "good_try");
        feedback.className = "feedback " + (ok ? "good" : "warn");
        speak(ctx.t(ok ? "well_done" : "good_try"));
        level = ok ? Math.min(5, level + 1) : Math.max(1, level - 1);
        setTimeout(newRound, 1150);
      });
      opts.appendChild(btn);
    }
  }

  function options(total) {
    const set = new Set([total]);
    const steps = [5, 10, 20, 50];
    while (set.size < 4) {
      const d = total + (Math.random() < 0.5 ? -1 : 1) * steps[Math.floor(Math.random() * steps.length)];
      if (d > 0 && d !== total) set.add(d);
    }
    return shuffle([...set]);
  }
  newRound();
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
