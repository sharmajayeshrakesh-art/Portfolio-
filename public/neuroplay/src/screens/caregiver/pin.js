/** pin.js — simple 4-digit gate for the caregiver area. */

import { el, mount, announce } from "../../ui.js";
import { icon } from "../../icons.js";
import { topBar } from "../chrome.js";
import { speak } from "../../tts.js";

async function sha(text) {
  if (globalThis.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 0; for (const c of text) h = (h * 31 + c.charCodeAt(0)) | 0;
  return String(h);
}

export function renderPin(ctx, { next = "dashboard", params = {} } = {}) {
  const root = document.getElementById("app");
  const scr = el("main");
  scr.appendChild(topBar(ctx, { title: ctx.t("caregiver_title"), onBack: () => ctx.navigate("home") }));
  const body = el("div.screen.stack-lg.center");
  scr.appendChild(body);

  let stored = null;
  let mode = "enter";     // 'enter' | 'create' | 'confirm'
  let firstEntry = "";
  let buf = "";

  ctx.store.getSetting("caregiverPin", null).then((v) => {
    stored = v;
    mode = stored ? "enter" : "create";
    paint();
  });

  const title = el("h1.h2");
  const sub = el("p.lead");
  const dots = el("div.pin-dots");
  const err = el("p", { style: "color:var(--alert);font-weight:700;min-height:24px" });

  function paint() {
    body.innerHTML = "";
    title.textContent =
      mode === "enter" ? ctx.t("enter_pin") : mode === "create" ? ctx.t("set_pin") : ctx.t("confirm_pin");
    sub.textContent = mode === "create" ? ctx.t("set_pin_desc") : "";
    body.append(
      el("div.empty-ic", { html: icon("lock", "icon-lg"), style: "margin:0 auto" }),
      title, sub, renderDots(), err, keypad()
    );
    speak(title.textContent);
  }

  function renderDots() {
    dots.innerHTML = "";
    for (let i = 0; i < 4; i++) dots.appendChild(el("span.pin-dot" + (i < buf.length ? ".on" : "")));
    return dots;
  }

  function keypad() {
    const pad = el("div.keypad");
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];
    for (const k of keys) {
      if (k === "clear") { pad.appendChild(el("button.key.key-muted", { text: ctx.t("cancel"), onclick: () => { buf = ""; renderDots(); } })); continue; }
      if (k === "back") { pad.appendChild(el("button.key.key-muted", { html: icon("back"), "aria-label": ctx.t("back"), onclick: () => { buf = buf.slice(0, -1); renderDots(); } })); continue; }
      pad.appendChild(el("button.key", { text: k, onclick: () => press(k) }));
    }
    return pad;
  }

  async function press(d) {
    if (buf.length >= 4) return;
    buf += d; renderDots(); err.textContent = "";
    if (buf.length === 4) setTimeout(commit, 120);
  }

  async function commit() {
    const hash = await sha(buf);
    if (mode === "enter") {
      if (hash === stored) { unlock(); }
      else { err.textContent = ctx.t("pin_wrong"); announce(ctx.t("pin_wrong")); buf = ""; renderDots(); }
    } else if (mode === "create") {
      firstEntry = hash; buf = ""; mode = "confirm"; paint();
    } else {
      if (hash === firstEntry) { await ctx.store.setSetting("caregiverPin", hash); unlock(); }
      else { err.textContent = ctx.t("pin_mismatch"); announce(ctx.t("pin_mismatch")); buf = ""; mode = "create"; firstEntry = ""; paint(); }
    }
  }

  function unlock() {
    ctx.unlockCaregiver();
    ctx.setMode("caregiver");
    ctx.navigate(next, params);
  }

  return scr;
}
