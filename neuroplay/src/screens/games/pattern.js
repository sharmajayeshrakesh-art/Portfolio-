/** pattern.js — Pattern Sequence Memory (domain: attention/working memory). */

import { el } from "../../ui.js";
import { speak } from "../../tts.js";

export function startPattern(g) {
  const { ctx, recorder, host } = g;
  const N = 9, MAX = 6;
  let level = 3, round = 0, seq = [], input = [], accepting = false, firstTouch = false;
  recorder.addGame("pattern");

  host.innerHTML = "";
  const stage = el("div.game-stage.stack-lg");
  const prompt = el("div.game-prompt", { text: ctx.t("game_pattern_desc") });
  const grid = el("div.pattern-grid");
  const feedback = el("div.feedback");
  const dots = el("div.progress-dots");
  const cells = [];
  for (let i = 0; i < N; i++) {
    const c = el("button.cell", { disabled: true, "aria-label": String(i + 1) });
    c.addEventListener("click", () => onTap(i, c));
    cells.push(c); grid.appendChild(c);
  }
  stage.append(prompt, grid, feedback, dots);
  host.appendChild(stage);

  function setDots() {
    dots.innerHTML = "";
    for (let i = 0; i < MAX; i++) dots.appendChild(el("i" + (i < round - 1 ? ".done" : "")));
  }
  function disable(b) { cells.forEach((c) => (c.disabled = b)); }

  function newRound() {
    round++;
    if (round > MAX) return g.finish();
    setDots();
    input = []; firstTouch = false; feedback.textContent = "";
    seq = Array.from({ length: level }, () => Math.floor(Math.random() * N));
    speak(ctx.t("game_pattern_desc"));
    playback();
  }

  function playback() {
    accepting = false; disable(true);
    let i = 0;
    const step = () => {
      if (i > 0) cells[seq[i - 1]].classList.remove("lit");
      if (i >= seq.length) { return accept(); }
      cells[seq[i]].classList.add("lit"); i++;
      setTimeout(step, 680);
    };
    setTimeout(step, 500);
  }

  function accept() {
    accepting = true; disable(false);
    recorder.startTrial({ gameId: "pattern", trialIndex: round - 1, difficulty: level, meta: { length: seq.length } });
  }

  function onTap(i, cell) {
    if (!accepting) return;
    if (!firstTouch) { recorder.markFirstTouch(); firstTouch = true; }
    cell.classList.add("tapped");
    setTimeout(() => cell.classList.remove("tapped"), 240);
    const pos = input.length;
    input.push(i);
    if (i !== seq[pos]) {
      accepting = false;
      recorder.markRetry();
      recorder.endTrial({ correct: false, errorType: "sequence_error" });
      done(false);
      level = Math.max(3, level - 1);
    } else if (input.length === seq.length) {
      accepting = false;
      recorder.endTrial({ correct: true });
      done(true);
      level = Math.min(7, level + 1);
    }
  }

  function done(ok) {
    feedback.textContent = ctx.t(ok ? "well_done" : "good_try");
    feedback.className = "feedback " + (ok ? "good" : "warn");
    speak(ctx.t(ok ? "well_done" : "good_try"));
    disable(true);
    setTimeout(newRound, 1150);
  }

  newRound();
}
