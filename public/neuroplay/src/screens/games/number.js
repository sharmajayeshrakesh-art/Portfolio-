/** number.js — Number & Attention (domain: reasoning / processing speed). */

import { el } from "../../ui.js";
import { speak } from "../../tts.js";

export function startNumber(g) {
  const { ctx, recorder, host } = g;
  const MAX = 6;
  let round = 0, level = 1;
  recorder.addGame("number_attention");

  host.innerHTML = "";
  const stage = el("div.game-stage.stack-lg");
  const prompt = el("div.game-prompt");
  const opts = el("div.opt-grid");
  const feedback = el("div.feedback");
  stage.append(prompt, opts, feedback);
  host.appendChild(stage);

  function newRound() {
    round++;
    if (round > MAX) return g.finish();
    feedback.textContent = "";
    const max = 4 + level * 4;
    let a = 1 + Math.floor(Math.random() * max);
    let b = 1 + Math.floor(Math.random() * max);
    const minus = level > 2 && Math.random() < 0.4;
    let q, ans;
    if (minus) { const x = Math.max(a, b), y = Math.min(a, b); q = `${x} − ${y}`; ans = x - y; }
    else { q = `${a} + ${b}`; ans = a + b; }
    prompt.textContent = q + " = ?";
    speak(q);

    let first = false;
    recorder.startTrial({ gameId: "number_attention", trialIndex: round - 1, difficulty: level, meta: { q } });

    opts.innerHTML = "";
    for (const v of options(ans)) {
      const btn = el("button.opt", { text: String(v) });
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        if (!first) { recorder.markFirstTouch(); first = true; }
        const ok = v === ans;
        btn.classList.add(ok ? "correct" : "wrong");
        [...opts.children].forEach((c) => (c.disabled = true));
        recorder.endTrial({ correct: ok, errorType: ok ? null : "wrong_option" });
        feedback.textContent = ctx.t(ok ? "well_done" : "good_try");
        feedback.className = "feedback " + (ok ? "good" : "warn");
        speak(ctx.t(ok ? "well_done" : "good_try"));
        level = ok ? Math.min(4, level + 1) : Math.max(1, level - 1);
        setTimeout(newRound, 1100);
      });
      opts.appendChild(btn);
    }
  }

  function options(ans) {
    const set = new Set([ans]);
    while (set.size < 4) {
      const d = ans + (Math.floor(Math.random() * 7) - 3);
      if (d >= 0) set.add(d);
    }
    return shuffle([...set]);
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
