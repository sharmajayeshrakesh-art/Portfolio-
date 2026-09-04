/** word-recall.js — "which one is different?" (domain: language / categories).
 *  Uses universal picture-emoji so it works in every language with minimal text. */

import { el } from "../../ui.js";
import { speak } from "../../tts.js";

// each group: 3 items of one category + 1 odd item from another
const SETS = [
  { in: ["🍎", "🍌", "🍇"], odd: "🚗" },
  { in: ["🐕", "🐈", "🐄"], odd: "🌻" },
  { in: ["🚗", "🚌", "🚲"], odd: "🍞" },
  { in: ["👕", "👖", "🧥"], odd: "🐟" },
  { in: ["☀️", "🌧️", "❄️"], odd: "📕" },
  { in: ["🌹", "🌻", "🌷"], odd: "🔑" },
  { in: ["🍚", "🍲", "🍞"], odd: "🪑" },
  { in: ["✋", "👣", "👁️"], odd: "🚪" },
];

export function startWordRecall(g) {
  const { ctx, recorder, host } = g;
  const MAX = 6;
  let round = 0;
  const order = shuffle([...SETS.keys()]);
  recorder.addGame("word_recall");

  host.innerHTML = "";
  const stage = el("div.game-stage.stack-lg");
  const prompt = el("div.game-prompt", { text: ctx.t("word_odd_prompt") });
  const opts = el("div.opt-grid");
  const feedback = el("div.feedback");
  stage.append(prompt, opts, feedback);
  host.appendChild(stage);

  function newRound() {
    round++;
    if (round > MAX) return g.finish();
    feedback.textContent = "";
    const set = SETS[order[(round - 1) % order.length]];
    const items = shuffle([...set.in, set.odd].map((e) => ({ e, odd: e === set.odd })));
    speak(ctx.t("word_odd_prompt"));

    let first = false;
    recorder.startTrial({ gameId: "word_recall", trialIndex: round - 1, difficulty: 1, meta: {} });

    opts.innerHTML = "";
    for (const it of items) {
      const btn = el("button.opt", { text: it.e, style: "font-size:52px" });
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        if (!first) { recorder.markFirstTouch(); first = true; }
        const ok = it.odd;
        btn.classList.add(ok ? "correct" : "wrong");
        [...opts.children].forEach((c) => (c.disabled = true));
        recorder.endTrial({ correct: ok, errorType: ok ? null : "wrong_option" });
        feedback.textContent = ctx.t(ok ? "well_done" : "good_try");
        feedback.className = "feedback " + (ok ? "good" : "warn");
        speak(ctx.t(ok ? "well_done" : "good_try"));
        setTimeout(newRound, 1100);
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
