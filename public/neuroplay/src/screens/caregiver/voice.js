/**
 * voice.js — the family voice studio.
 *
 * A caregiver records the phrases the app says most often in their own voice
 * (or a daughter's, or a son's). Recordings live on the device and take
 * precedence over every synthetic voice.
 *
 * Deliberately ordered by value, not alphabetically: the first two dozen
 * phrases are the greeting, all the encouragement, and the emergency prompts.
 * Someone who records for ten minutes and stops has still covered most of
 * what their parent hears in a day, and the screen says so as they go.
 */

import { el, announce } from "../../ui.js";
import { icon } from "../../icons.js";
import { topBar } from "../chrome.js";
import {
  CORE_KEYS, canRecord, recorderMime, saveFamilyClip, removeFamilyClip,
  previewFamilyClip, familyVoiceCount, familyVoiceOn, setFamilyVoiceOn,
  speakerName, setSpeakerName, loadFamilyVoice, hasFamilyClip,
} from "../../familyvoice.js";

const MAX_MS = 8000;   // no UI phrase needs longer; also caps storage

export function renderVoiceStudio(ctx) {
  const scr = el("main");
  scr.appendChild(
    topBar(ctx, {
      title: ctx.t("family_voice_title"),
      hint: ctx.t("family_voice_title"),
      onBack: () => ctx.navigate("dashboard"),
    })
  );
  const body = el("div.screen.stack-lg");
  scr.appendChild(body);

  const phrases = CORE_KEYS.map((k) => ({ key: k, text: ctx.t(k) }))
    .filter((p) => p.text && p.text !== p.key);

  loadFamilyVoice(ctx.lang).then(paint);

  let stream = null;
  let recorder = null;
  let recordingKey = null;
  let stopTimer = null;

  function paint() {
    body.innerHTML = "";

    body.appendChild(el("p.section-sub", { text: ctx.t("family_voice_intro") }));

    if (!canRecord()) {
      body.appendChild(
        el("div.card.stack", {}, [
          el("strong", { text: ctx.t("family_voice_unsupported") }),
          el("p.muted", { text: ctx.t("family_voice_unsupported_desc") }),
        ])
      );
      return;
    }

    // ---- who is speaking ------------------------------------------------
    const nameCard = el("div.card.stack");
    nameCard.appendChild(
      el("div.set-label", {}, [
        el("span.set-ic", { html: icon("user") }),
        el("span", { text: ctx.t("family_voice_who") }),
      ])
    );
    const nameInput = el("input.select", {
      type: "text",
      placeholder: ctx.t("family_voice_who_hint"),
      "aria-label": ctx.t("family_voice_who"),
    });
    speakerName().then((n) => { if (n) nameInput.value = n; });
    nameInput.addEventListener("change", () => setSpeakerName(nameInput.value.trim()));
    nameCard.appendChild(nameInput);
    body.appendChild(nameCard);

    // ---- progress -------------------------------------------------------
    const done = phrases.filter((p) => hasFamilyClip(p.text)).length;
    const prog = el("div.card.stack");
    prog.appendChild(
      el("div.row.between", {}, [
        el("strong", { text: ctx.t("family_voice_progress") }),
        el("strong", { text: `${done} / ${phrases.length}` }),
      ])
    );
    const bar = el("div.vb-bar");
    bar.appendChild(el("i", { style: `width:${phrases.length ? (done / phrases.length) * 100 : 0}%` }));
    prog.appendChild(bar);
    prog.appendChild(
      el("p.muted", {
        text: done === 0 ? ctx.t("family_voice_start_hint")
          : done < phrases.length ? ctx.t("family_voice_keep_going")
          : ctx.t("family_voice_complete"),
      })
    );
    if (familyVoiceCount() > 0) {
      const toggle = el("button.btn.btn-ghost.btn-block", {
        html: icon(familyVoiceOn() ? "volume" : "volumeOff") +
          `<span>${familyVoiceOn() ? ctx.t("family_voice_using") : ctx.t("family_voice_paused")}</span>`,
        onclick: async () => { await setFamilyVoiceOn(!familyVoiceOn()); paint(); },
      });
      prog.appendChild(toggle);
    }
    body.appendChild(prog);

    // ---- the phrases ----------------------------------------------------
    for (const p of phrases) body.appendChild(phraseRow(p));
  }

  function phraseRow(p) {
    const recorded = hasFamilyClip(p.text);
    const row = el("div.card.vb-row" + (recorded ? ".is-done" : ""));
    row.appendChild(
      el("div.vb-text", {}, [
        el("div.vb-phrase", { text: p.text }),
        el("div.vb-state", {
          text: recordingKey === p.key ? ctx.t("family_voice_recording")
            : recorded ? ctx.t("family_voice_recorded") : ctx.t("family_voice_not_yet"),
        }),
      ])
    );

    const actions = el("div.vb-actions");
    const recBtn = el("button.btn.btn-primary.vb-rec" + (recordingKey === p.key ? ".is-live" : ""), {
      "aria-label": (recorded ? ctx.t("family_voice_again") : ctx.t("family_voice_record")) + ": " + p.text,
      html: icon(recordingKey === p.key ? "x" : "volume") +
        `<span>${recordingKey === p.key ? ctx.t("family_voice_stop")
          : recorded ? ctx.t("family_voice_again") : ctx.t("family_voice_record")}</span>`,
      onclick: () => (recordingKey === p.key ? stopRecording() : startRecording(p)),
    });
    actions.appendChild(recBtn);

    if (recorded) {
      actions.appendChild(
        el("button.btn.btn-ghost", {
          "aria-label": ctx.t("family_voice_play") + ": " + p.text,
          html: icon("play"),
          onclick: () => previewFamilyClip(p.text),
        })
      );
      actions.appendChild(
        el("button.btn.btn-ghost", {
          "aria-label": ctx.t("family_voice_delete") + ": " + p.text,
          html: icon("x"),
          onclick: async () => { await removeFamilyClip(ctx.lang, p.text); paint(); },
        })
      );
    }
    row.appendChild(actions);
    return row;
  }

  async function startRecording(p) {
    if (recordingKey) stopRecording();
    try {
      if (!stream) stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      announce(ctx.t("family_voice_no_mic"));
      body.prepend(el("div.card.stack", {}, [el("strong", { text: ctx.t("family_voice_no_mic") })]));
      return;
    }
    const mime = recorderMime();
    const chunks = [];
    try {
      recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch {
      recorder = new MediaRecorder(stream);
    }
    recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.onstop = async () => {
      clearTimeout(stopTimer);
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      recordingKey = null;
      if (blob.size > 800) {
        await saveFamilyClip({ lang: ctx.lang, text: p.text, blob });
        announce(ctx.t("family_voice_recorded"));
      }
      paint();
    };
    recordingKey = p.key;
    recorder.start();
    // Hard stop: a phrase left recording by accident would otherwise fill the
    // phone, and an elder-facing app should never depend on someone noticing.
    stopTimer = setTimeout(stopRecording, MAX_MS);
    paint();
  }

  function stopRecording() {
    clearTimeout(stopTimer);
    try { recorder && recorder.state !== "inactive" && recorder.stop(); }
    catch { recordingKey = null; paint(); }
  }

  // Let go of the microphone as soon as the screen does.
  scr.addEventListener("np:teardown", () => {
    stopRecording();
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
  });

  return scr;
}
