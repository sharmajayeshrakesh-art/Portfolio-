/** settings.js — elder-facing preferences: day/night, text size, voice, language. */

import { el, segmented } from "../ui.js";
import { icon } from "../icons.js";
import { topBar } from "./chrome.js";
import { LANGUAGES, REGIONS } from "../i18n.js";
import { ttsEnabled, setTTS, speak, listVoices, setVoice, currentVoiceURI, speechRate,
         setSpeechRate, voicebankSize, usingVoicebank, setUseVoicebank } from "../tts.js";
import { setTheme, themePref } from "../theme.js";

export function renderSettings(ctx) {
  const scr = el("main");
  scr.appendChild(
    topBar(ctx, {
      title: ctx.t("settings_title"),
      onBack: () => ctx.navigate(ctx.mode === "caregiver" ? "dashboard" : "home"),
    })
  );
  const body = el("div.screen.stack-lg");
  scr.appendChild(body);

  // ---- Day & night ----------------------------------------------------
  const themeSlot = el("div");
  themePref().then((pref) => {
    themeSlot.appendChild(
      segmented(
        [
          { val: "day", label: ctx.t("theme_day") },
          { val: "night", label: ctx.t("theme_night") },
          { val: "auto", label: ctx.t("theme_auto") },
        ],
        pref,
        (v) => setTheme(v)
      )
    );
  });
  body.appendChild(settingCard(ctx, "setting_theme", "moon", themeSlot));

  // ---- Text size ------------------------------------------------------
  const sizeNow = document.documentElement.dataset.size === "large" ? "large" : "balanced";
  body.appendChild(
    settingCard(ctx, "setting_text_size", "textsize",
      segmented(
        [
          { val: "balanced", label: ctx.t("size_balanced") },
          { val: "large", label: ctx.t("size_comfortable") },
        ],
        sizeNow,
        async (v) => {
          if (v === "large") document.documentElement.dataset.size = "large";
          else delete document.documentElement.dataset.size;
          await ctx.store.setSetting("displaySize", v);
        }
      )
    )
  );

  // ---- Voice ----------------------------------------------------------
  body.appendChild(
    settingCard(ctx, "setting_voice", "volume",
      segmented(
        [
          { val: "on", label: ctx.t("voice_on") },
          { val: "off", label: ctx.t("voice_off") },
        ],
        ttsEnabled() ? "on" : "off",
        (v) => {
          setTTS(v === "on");
          if (v === "on") speak(ctx.t("guide_voice_sample"), { force: true });
        }
      )
    )
  );

  // Which installed voice to use, and how fast. Device voices vary a lot in
  // quality, so letting the caregiver pick the best one matters more than
  // any tuning we can do in code.
  const voiceCard = el("div.card.stack");
  voiceCard.appendChild(
    el("div.set-row", {}, [
      el("div.set-label", {}, [el("span.set-ic", { html: icon("user") }), el("span", { text: ctx.t("setting_voice_choice") })]),
    ])
  );
  // The recordings are the top entry, not a hidden override. Picking a device
  // voice instead switches them off — so the choice actually changes what you
  // hear, which is the whole point of having the control.
  const hasBank = voicebankSize() > 0;
  const BANK = "__recorded__";
  const sel = el("select.select", { "aria-label": ctx.t("setting_voice_choice") });
  function fillVoices() {
    sel.innerHTML = "";
    if (hasBank) sel.appendChild(el("option", { value: BANK, text: ctx.t("voice_recorded") }));
    sel.appendChild(el("option", { value: "", text: ctx.t("voice_device_default") }));
    for (const v of listVoices()) {
      sel.appendChild(el("option", { value: v.voiceURI, text: `${v.name} (${v.lang})` }));
    }
    sel.value = hasBank && usingVoicebank() ? BANK : currentVoiceURI() || "";
  }
  fillVoices();
  // voice list often arrives asynchronously on first load
  if (typeof speechSynthesis !== "undefined") setTimeout(fillVoices, 400);
  sel.addEventListener("change", async () => {
    const recorded = sel.value === BANK;
    if (hasBank) await setUseVoicebank(recorded);
    if (!recorded) await setVoice(sel.value || null);
    note.hidden = !recorded;
    speak(ctx.t("guide_voice_sample"), { force: true });
  });
  voiceCard.appendChild(sel);
  // Say why the device voice below barely changes anything while recordings
  // are on, rather than leaving it to look broken.
  const note = el("p.section-sub", { text: ctx.t("voice_recorded_note") });
  note.hidden = !(hasBank && usingVoicebank());
  voiceCard.appendChild(note);
  voiceCard.appendChild(
    el("div.set-row", {}, [
      el("span", { text: ctx.t("voice_speed"), style: "font-weight:700" }),
      segmented(
        [
          { val: "0.85", label: ctx.t("speed_slow") },
          { val: "0.95", label: ctx.t("speed_normal") },
        ],
        String(speechRate()) === "0.85" ? "0.85" : "0.95",
        async (v) => { await setSpeechRate(Number(v)); speak(ctx.t("guide_voice_sample"), { force: true }); }
      ),
    ])
  );
  voiceCard.appendChild(
    el("button.btn.btn-ghost.btn-block", {
      html: icon("volume") + `<span>${ctx.t("test_voice")}</span>`,
      onclick: () => speak(ctx.t("guide_voice_sample"), { force: true }),
    })
  );
  voiceCard.appendChild(el("p.section-sub", { text: ctx.t("voice_tip") }));
  body.appendChild(voiceCard);

  // ---- Language -------------------------------------------------------
  const langCard = el("div.card.stack");
  langCard.appendChild(
    el("div.set-row", {}, [
      el("div.set-label", {}, [el("span.set-ic", { html: icon("globe") }), el("span", { text: ctx.t("setting_language") })]),
    ])
  );
  for (const r of REGIONS) {
    const langs = LANGUAGES.filter((l) => l.region === r.id);
    if (!langs.length) continue;
    langCard.appendChild(el("div.eyebrow", { text: ctx.t(r.tKey) }));
    const grid = el("div.lang-grid");
    for (const l of langs) {
      grid.appendChild(
        el("button.choice", {
          disabled: !l.ready,
          style: l.ready ? "" : "opacity:.55",
          "aria-pressed": String(l.code === ctx.lang),
          onclick: async () => { await ctx.setLang(l.code); },
        }, [
          el("span.native", { text: l.native, lang: l.code }),
          l.ready ? el("span.latin", { text: l.label })
                  : el("span.pill", { text: ctx.t("lang_not_ready") }),
        ])
      );
    }
    langCard.appendChild(grid);
  }
  body.appendChild(langCard);

  // ---- Replay the guide ------------------------------------------------
  body.appendChild(
    el("button.btn.btn-ghost.btn-block", {
      html: icon("sparkle") + `<span>${ctx.t("show_guide")}</span>`,
      onclick: () => ctx.navigate("tour"),
    })
  );

  return scr;
}

function settingCard(ctx, key, ic, control) {
  return el("div.card", {}, [
    el("div.set-row", {}, [
      el("div.set-label", {}, [el("span.set-ic", { html: icon(ic) }), el("span", { text: ctx.t(key) })]),
      control,
    ]),
  ]);
}
