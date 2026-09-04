/** card-match.js — Matching Pairs (domain: memory).
 *  Fills a real gap: until now every memory game needed caregiver photos.
 *  No timer, no penalty for looking again — turning cards over is the point. */

import { el } from "../../ui.js";
import { speak } from "../../tts.js";

const FACES = ["🌻", "🍎", "🐘", "🪔", "🚲", "🫖", "🌙", "🐄", "🥭", "⭐"];

export function startCardMatch(g) {
  const { ctx, recorder, host } = g;
  const ROUNDS = 3;                 // three boards, growing
  const PAIRS = [3, 4, 5];          // 6, 8, 10 cards
  let round = 0, board = [], open = [], locked = false, matched = 0, firstFlip = false;
  recorder.addGame("card_match");

  host.innerHTML = "";
  const stage = el("div.game-stage.stack-lg");
  const prompt = el("div.game-prompt", { text: ctx.t("game_card_match_desc") });
  const grid = el("div.match-grid");
  const feedback = el("div.feedback");
  const dots = el("div.progress-dots");
  stage.append(prompt, grid, feedback, dots);
  host.appendChild(stage);

  function paintDots() {
    dots.innerHTML = "";
    for (let i = 0; i < ROUNDS; i++) dots.appendChild(el("i" + (i < round - 1 ? ".done" : "")));
  }

  function newRound() {
    round += 1;
    if (round > ROUNDS) return g.finish();
    paintDots();
    feedback.textContent = "";
    matched = 0; open = []; locked = false;

    const n = PAIRS[round - 1];
    const picks = shuffle([...FACES]).slice(0, n);
    board = shuffle([...picks, ...picks].map((f, i) => ({ f, i })));

    grid.style.setProperty("--cols", n >= 5 ? 4 : 3);
    grid.innerHTML = "";
    board.forEach((c, idx) => {
      const btn = el("button.match-card", { "aria-label": ctx.t("game_card_match") });
      btn.dataset.idx = String(idx);
      btn.addEventListener("click", () => flip(idx, btn));
      grid.appendChild(btn);
      c.btn = btn;
    });
    speak(ctx.t("game_card_match_desc"));
    beginTrial();
  }

  // one "trial" = one attempt at a pair
  function beginTrial() {
    firstFlip = false;
    recorder.startTrial({
      gameId: "card_match", trialIndex: matched, difficulty: round,
      meta: { pairs: PAIRS[round - 1] },
    });
  }

  function flip(idx, btn) {
    if (locked) return;
    const card = board[idx];
    if (card.done || open.includes(idx)) return;
    if (!firstFlip) { recorder.markFirstTouch(); firstFlip = true; }

    btn.classList.add("open");
    btn.textContent = card.f;
    open.push(idx);
    if (open.length < 2) return;

    locked = true;
    const [a, b] = open.map((i) => board[i]);
    const hit = a.f === b.f;
    recorder.endTrial({ correct: hit, errorType: hit ? null : "wrong_option" });

    if (hit) {
      a.done = b.done = true;
      a.btn.classList.add("done"); b.btn.classList.add("done");
      matched += 1;
      feedback.textContent = ctx.t("well_done");
      feedback.className = "feedback good";
      speak(ctx.t("well_done"));
      open = []; locked = false;
      if (matched === PAIRS[round - 1]) {
        setTimeout(newRound, 900);
      } else {
        beginTrial();
      }
    } else {
      feedback.textContent = ctx.t("lets_continue");
      feedback.className = "feedback warn";
      setTimeout(() => {
        open.forEach((i) => { board[i].btn.classList.remove("open"); board[i].btn.textContent = ""; });
        open = []; locked = false; feedback.textContent = "";
        beginTrial();
      }, 950);
    }
  }

  newRound();
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
