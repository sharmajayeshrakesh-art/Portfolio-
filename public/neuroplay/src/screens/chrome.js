/** chrome.js — shared top bar used across screens. */

import { el } from "../ui.js";
import { icon } from "../icons.js";
import { speak, ttsEnabled, setTTS } from "../tts.js";

export function topBar(ctx, { title, onBack, hint, right } = {}) {
  const bar = el("header.topbar");
  if (onBack) {
    bar.appendChild(
      el("button.topbar-btn", {
        onclick: onBack,
        "aria-label": ctx.t("back"),
        html: icon("back") + `<span>${ctx.t("back")}</span>`,
      })
    );
  }
  bar.appendChild(el("div.title", { text: title || "" }));
  bar.appendChild(el("div.spacer"));

  if (right) bar.appendChild(right);

  // voice toggle — clearly reflects on/off state so it never reads as broken
  const voice = el("button.topbar-btn.voice-btn");
  const paint = () => {
    const on = ttsEnabled();
    voice.innerHTML = icon(on ? "volume" : "volumeOff");
    voice.setAttribute("aria-pressed", on ? "true" : "false");
    voice.setAttribute("aria-label", on ? ctx.t("setting_voice") + ": " + ctx.t("voice_on") : ctx.t("setting_voice") + ": " + ctx.t("voice_off"));
    voice.classList.toggle("is-off", !on);
  };
  paint();
  voice.addEventListener("click", () => {
    const on = !ttsEnabled();
    setTTS(on);
    paint();
    if (on) speak(hint || title || "", { force: true });
  });
  bar.appendChild(voice);
  return bar;
}

/** Speak a screen's primary instruction once, if voice is on. */
export function speakOnce(text) {
  if (ttsEnabled()) speak(text);
}
