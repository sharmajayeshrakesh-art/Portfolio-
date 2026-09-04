/**
 * calm.js (screen) — what the patient sees during sundowning.
 *
 * Everything on this screen is subtraction. One breathing shape to follow, one
 * line of orientation at a time, a familiar face, and one way to reach a
 * person. No scores, no timers, no choices to make — decision-making is the
 * first thing to go when someone is frightened, so we do not ask for any.
 *
 * The breathing pace is deliberate: in for 4, hold 2, out for 6. A longer out
 * than in is what actually engages the calming half of the nervous system, and
 * it is slow enough for an elderly chest to follow without straining.
 */

import { el } from "../ui.js";
import { icon } from "../icons.js";
import { speak, cancel } from "../tts.js";
import { store } from "../store.js";
import { createAmbience, calmSettings, setCalmSetting, noteCalmOpened, dismissToday } from "../calm.js";

const IN_MS = 4000, HOLD_MS = 2000, OUT_MS = 6000;
const LINE_MS = 14000;

export function renderCalm(ctx) {
  const scr = el("main.calm");
  const ambience = createAmbience();
  let lineTimer = null, breathTimer = null, stopped = false;

  noteCalmOpened();

  scr.appendChild(el("div.calm-sky"));

  const face = el("div.calm-face");
  scr.appendChild(face);

  const breath = el("div.calm-breath", {}, [el("span.calm-breath-word")]);
  scr.appendChild(breath);

  const line = el("p.calm-line", { "aria-live": "polite" });
  scr.appendChild(line);

  const actions = el("div.calm-actions");
  scr.appendChild(actions);

  const soundBtn = el("button.calm-btn", {
    onclick: async () => {
      const on = !ambience || !ambience.running;
      await setCalmSetting("calmSound", on);
      if (on) ambience && ambience.start(); else ambience && ambience.stop();
      paintSound(on);
    },
  });
  function paintSound(on) {
    soundBtn.innerHTML = icon(on ? "volume" : "volumeOff") +
      `<span>${ctx.t(on ? "calm_sound_on" : "calm_sound_off")}</span>`;
    soundBtn.setAttribute("aria-pressed", String(on));
  }

  actions.appendChild(soundBtn);
  actions.appendChild(
    el("button.calm-btn.calm-call", {
      html: icon("phone") + `<span>${ctx.t("calm_call")}</span>`,
      onclick: () => ctx.navigate("emergency"),
    })
  );
  actions.appendChild(
    el("button.calm-btn.calm-ok", {
      html: icon("check") + `<span>${ctx.t("calm_im_ok")}</span>`,
      onclick: async () => { await dismissToday(); ctx.navigate("home"); },
    })
  );

  // ---- content --------------------------------------------------------
  (async () => {
    const cfg = await calmSettings();
    if (cfg.sound && ambience) { await ambience.start(); }
    paintSound(!!(ambience && ambience.running));

    const patient = (await store.getAll("patient"))[0] || null;
    const faces = await store.contentByType("face").catch(() => []);
    const helper = faces && faces.length ? faces[0] : null;
    if (helper) {
      const url = await store.blobURL(helper.blobId);
      if (url) {
        face.appendChild(el("img", { src: url, alt: helper.name || "" }));
        face.appendChild(el("div.calm-face-name", {
          text: helper.relationship ? `${helper.name} · ${helper.relationship}` : helper.name || "",
        }));
      }
    }

    // Orientation, then reassurance, then something to do. Said slowly, one at
    // a time — a wall of text is noise to someone who is already overloaded.
    const who = patient && patient.name ? patient.name : null;
    const near = helper && helper.name ? helper.name : null;
    const lines = [
      who ? ctx.t("calm_you_are", { name: who }) : ctx.t("calm_you_are_home"),
      ctx.t("calm_it_is_evening"),
      near ? ctx.t("calm_someone_near", { name: near }) : ctx.t("calm_safe_here"),
      ctx.t("calm_breathe_with_me"),
      ctx.t("calm_nothing_to_do"),
    ].filter(Boolean);

    let i = 0;
    const showLine = () => {
      if (stopped) return;
      line.classList.remove("show");
      setTimeout(() => {
        if (stopped) return;
        line.textContent = lines[i % lines.length];
        line.classList.add("show");
        speak(lines[i % lines.length]);
        i++;
      }, 500);
      lineTimer = setTimeout(showLine, LINE_MS);
    };
    showLine();
  })();

  // ---- the breathing pacer --------------------------------------------
  const word = breath.querySelector(".calm-breath-word");
  const cycle = () => {
    if (stopped) return;
    breath.classList.add("inhale");
    breath.classList.remove("exhale");
    word.textContent = ctx.t("calm_breathe_in");
    breathTimer = setTimeout(() => {
      if (stopped) return;
      word.textContent = ctx.t("calm_hold");
      breathTimer = setTimeout(() => {
        if (stopped) return;
        breath.classList.remove("inhale");
        breath.classList.add("exhale");
        word.textContent = ctx.t("calm_breathe_out");
        breathTimer = setTimeout(cycle, OUT_MS);
      }, HOLD_MS);
    }, IN_MS);
  };
  breath.style.setProperty("--in", IN_MS + "ms");
  breath.style.setProperty("--out", OUT_MS + "ms");
  cycle();

  scr.addEventListener("np:teardown", () => {
    stopped = true;
    clearTimeout(lineTimer);
    clearTimeout(breathTimer);
    cancel();
    ambience && ambience.stop();
  });

  return scr;
}
