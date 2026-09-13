/**
 * gymscreen.js — the Gym tab and the daily check-in.
 *
 * Takes its navigation callbacks from app.js at init rather than importing
 * them, which keeps the module graph acyclic.
 *
 * The check-in is built around the assumption that the normal answer is "I did
 * the whole session". Every exercise starts at full sets, so a complete session
 * is one tap on Log. You only touch the exercises that went wrong — which is
 * the same bet the expense side makes, and the reason either one gets used at
 * all on a day when you are tired.
 */

import * as store from "./store.js";
import { todayISO } from "./store.js";
import { CYCLE, SESSIONS, sessionDef, plannedSets } from "./plan.js";
import { summary, grid, exerciseAdherence, setsDone, completeness } from "./gym.js";
import { $, el, add, clear, friendlyDate, toast, openSheet, closeSheet } from "./ui.js";

// Only alternate rows are labelled — seven stacked letters is noise, and this
// is the convention every contribution graph already taught people to read.
const WEEKDAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];
const GRID_WEEKS = 12;

let go = () => {};
let renderAll = () => {};

export function initGym(ctx) {
  go = ctx.go;
  renderAll = ctx.renderAll;
  return { renderGym, openCheckIn };
}

/* ---------- the screen ---------- */

export function renderGym() {
  const screen = clear($("#screen-gym"));
  const sessions = store.getSessions();
  const s = summary(sessions);
  const today = store.sessionOn(todayISO());

  add(screen,
    el("header", { class: "screen-head" },
      el("p", { class: "eyebrow", text: "Last 7 days" }),
      el("div", { class: "figure figure-xl" },
        el("span", { class: "figure-val", text: String(s.last7) }),
        el("span", { class: "figure-of", text: `of ${s.target}` }),
      ),
      el("div", { class: "stat-pair" },
        el("div", { class: "stat" },
          el("span", { class: "stat-label", text: "Streak" }),
          el("span", { class: "stat-value", text: s.streak ? `${s.streak} session${s.streak === 1 ? "" : "s"}` : "—" }),
        ),
        el("div", { class: "stat" },
          el("span", { class: "stat-label", text: "Last 30 days" }),
          el("span", { class: "stat-value", text: String(s.last30) }),
        ),
      ),
    ),

    nextUpCard(s, today),
    consistencyGrid(sessions),
    adherenceList(sessions),
    recentList(sessions),
  );
}

/** The one thing the screen is actually for: what to train, and logging it. */
function nextUpCard(s, todaySession) {
  const slot = todaySession ? todaySession.slot : s.next;
  const def = sessionDef(slot);

  const lastLine = todaySession
    ? `Logged today · ${setsDone(todaySession)} of ${plannedSets(slot)} sets`
    : s.lastSession
      ? `Last trained ${friendlyDate(s.lastSession.date).toLowerCase()} · ${sessionDef(s.lastSession.slot)?.name}`
      : "Nothing logged yet — this is session one";

  // Once today is logged the card shows what was done, so say what comes next
  // as well — otherwise the rotation becomes invisible exactly when you would
  // want to plan tomorrow.
  const nextLine = todaySession
    ? `Next up · ${sessionDef(s.next)?.name}`
    : null;

  return el("section", { class: `nextup${todaySession ? " is-done" : ""}` },
    el("p", { class: "eyebrow", text: todaySession ? "Today" : "Next session" }),
    el("h2", { class: "nextup-title", text: def.name }),
    el("p", { class: "nextup-focus" },
      def.focus,
      el("span", { class: "dot-sep", text: "·" }),
      `${def.exercises.length} exercises`,
      el("span", { class: "dot-sep", text: "·" }),
      `${plannedSets(slot)} sets`,
    ),
    el("p", { class: "nextup-meta", text: lastLine }),
    nextLine ? el("p", { class: "nextup-next", text: nextLine }) : null,
    el("div", { class: "nextup-actions" },
      el("button", {
        class: "btn btn-primary", type: "button",
        text: todaySession ? "Edit today's session" : "I trained today",
        onclick: () => openCheckIn({ slot, date: todayISO(), existing: todaySession }),
      }),
      el("button", {
        class: "btn btn-quiet", type: "button", text: "Log another day",
        onclick: () => openCheckIn({ slot, date: todayISO(), pickDate: true }),
      }),
    ),
  );
}

/**
 * Five weeks of days, Monday-aligned. Fill opacity tracks how complete the
 * session was, so a half-finished day reads differently from a full one without
 * needing a second colour.
 */
function consistencyGrid(sessions) {
  const cells = grid(sessions, GRID_WEEKS);

  return el("section", { class: "list" },
    el("p", { class: "list-head" }, "Consistency",
      el("span", { class: "list-head-sum", text: `${GRID_WEEKS} weeks` })),
    el("div", { class: "gridwrap" },
      el("div", { class: "griddays" },
        WEEKDAY_LABELS.map((d) => el("span", { class: "gridday", text: d }))),
      // Cells are chronological; the CSS flows them down each column, so one
      // column is one week and the newest week is on the right.
      el("div", { class: "grid" }, cells.map((c) => {
        if (c.future) return el("span", { class: "cell is-future" });
        if (!c.session) {
          return el("span", {
            class: `cell${c.isToday ? " is-today" : ""}`,
            title: friendlyDate(c.date),
          });
        }
        const pct = completeness(c.session);
        return el("button", {
          class: `cell is-on${c.isToday ? " is-today" : ""}`,
          type: "button",
          style: `--fill:${(0.35 + pct * 0.65).toFixed(2)}`,
          title: `${friendlyDate(c.date)} · ${sessionDef(c.session.slot)?.name} · ${Math.round(pct * 100)}%`,
          "aria-label": `${friendlyDate(c.date)}, ${sessionDef(c.session.slot)?.name}`,
          onclick: () => openCheckIn({ slot: c.session.slot, date: c.date, existing: c.session }),
        });
      })),
    ),
  );
}

/** Which lifts actually get dropped. Worst three, only once there is data. */
function adherenceList(sessions) {
  if (sessions.length < 2) return null;
  const rows = exerciseAdherence(sessions).filter((r) => r.rate < 1).slice(0, 4);
  if (!rows.length) {
    return el("section", { class: "list" },
      el("p", { class: "list-head", text: "By exercise" }),
      el("p", { class: "note", text: "Nothing skipped yet — every set of every session logged." }),
    );
  }

  return el("section", { class: "list" },
    el("p", { class: "list-head" }, "Most skipped", el("span", { class: "list-head-sum", text: "all time" })),
    rows.map((r) =>
      el("div", { class: "row row-cat" },
        el("span", { class: "row-main" },
          el("span", { class: "row-title", text: r.name }),
          el("span", { class: "bar" },
            el("span", { class: "bar-fill", style: `width:${Math.round(r.rate * 100)}%` })),
        ),
        el("span", { class: "row-amount" },
          `${Math.round(r.rate * 100)}%`,
          el("span", { class: "row-share", text: r.skips ? `skipped ${r.skips}×` : "partial" }),
        ),
      )),
  );
}

function recentList(sessions) {
  if (!sessions.length) {
    return el("div", { class: "empty" },
      el("p", { class: "empty-title", text: "No sessions yet" }),
      el("p", { class: "empty-hint", text: "Log your first one above and the rotation starts from Pull 1." }),
    );
  }

  return el("section", { class: "list" },
    el("p", { class: "list-head", text: "Recent sessions" }),
    sessions.slice(0, 10).map((session) => {
      const def = sessionDef(session.slot);
      const done = setsDone(session);
      const planned = plannedSets(session.slot);
      return el("button", {
        class: "row row-entry", type: "button",
        onclick: () => openCheckIn({ slot: session.slot, date: session.date, existing: session }),
      },
        el("span", { class: "row-main" },
          el("span", { class: "row-title", text: def?.name || session.slot }),
          el("span", { class: "row-sub", text: `${friendlyDate(session.date)} · ${def?.focus || ""}` }),
        ),
        el("span", { class: "row-amount" },
          `${done}/${planned}`,
          el("span", { class: "row-share", text: "sets" }),
        ),
      );
    }),
  );
}

/* ---------- the check-in ---------- */

/**
 * @param {{slot: string, date: string, existing?: object, pickDate?: boolean}} opts
 */
export function openCheckIn({ slot, date, existing = null, pickDate = false }) {
  const def = sessionDef(slot);
  if (!def) return;

  // Default to a full session. Editing an existing one restores what was saved,
  // treating a missing exercise as skipped rather than silently full.
  const form = {
    slot,
    date: existing?.date || date,
    exercises: Object.fromEntries(def.exercises.map((ex) => [
      ex.id,
      existing ? Number(existing.exercises?.[ex.id] ?? 0) : ex.sets,
    ])),
  };

  openSheet((panel) => buildCheckIn(panel, form, { existing, pickDate }));
}

function buildCheckIn(panel, form, { existing, pickDate }) {
  const def = sessionDef(form.slot);

  const totals = el("span", { class: "checkin-total" });
  const paintTotal = () => {
    const done = Object.values(form.exercises).reduce((n, v) => n + v, 0);
    const planned = plannedSets(form.slot);
    totals.textContent = `${done} of ${planned} sets`;
    totals.classList.toggle("is-full", done >= planned);
  };

  const body = el("div", { class: "checkin-list" },
    def.exercises.map((ex) => exerciseRow(ex, form, paintTotal)));

  add(panel,
    el("div", { class: "checkin-head" },
      el("div", null,
        el("h2", { class: "sheet-title", text: def.name }),
        el("p", { class: "sheet-body", text: def.focus }),
      ),
      totals,
    ),

    pickDate || existing
      ? el("label", { class: "labelled checkin-date" },
          el("span", { class: "label-text", text: "Date" }),
          el("input", {
            class: "field", type: "date", value: form.date, max: todayISO(),
            oninput: (e) => { form.date = e.target.value || todayISO(); },
          }),
        )
      : null,

    el("p", { class: "checkin-hint", text: "Everything starts done. Tap a dot to change the sets, or – to skip." }),
    body,

    el("button", {
      class: "checkin-swap", type: "button", text: "Trained a different session?",
      onclick: () => swapSlot(panel, form, { existing, pickDate }),
    }),

    el("div", { class: "sheet-actions" },
      el("button", {
        class: "btn btn-primary", type: "button",
        text: existing ? "Save changes" : "Log session",
        onclick: () => {
          store.saveSession({ id: existing?.id, date: form.date, slot: form.slot, exercises: form.exercises });
          closeSheet();
          renderAll();
          const done = Object.values(form.exercises).reduce((n, v) => n + v, 0);
          toast(done >= plannedSets(form.slot) ? "Full session logged" : `Logged · ${done} sets`);
        },
      }),
      existing
        ? el("button", {
            class: "btn btn-quiet btn-danger-text", type: "button", text: "Delete session",
            onclick: () => {
              const removed = store.deleteSession(existing.id);
              closeSheet();
              renderAll();
              if (removed) {
                toast("Session deleted", {
                  actionLabel: "Undo",
                  onAction: () => { store.restoreSession(removed); renderAll(); },
                });
              }
            },
          })
        : el("button", { class: "btn btn-quiet", type: "button", text: "Cancel", onclick: closeSheet }),
    ),
  );

  paintTotal();
}

/** Let the rotation be overridden — trained legs when push was due, etc. */
function swapSlot(panel, form, opts) {
  openSheet((p) => {
    add(p,
      el("h2", { class: "sheet-title", text: "Which session?" }),
      el("p", { class: "sheet-body", text: "The rotation picks up from whatever you log here." }),
      el("div", { class: "list list-flush" }, CYCLE.map((slot) =>
        el("button", {
          class: `row row-action${slot === form.slot ? " is-current" : ""}`, type: "button",
          onclick: () => {
            const def = sessionDef(slot);
            openSheet((panel2) => buildCheckIn(panel2, {
              slot,
              date: form.date,
              exercises: Object.fromEntries(def.exercises.map((ex) => [ex.id, ex.sets])),
            }, opts));
          },
        },
          el("span", { class: "row-main" },
            el("span", { class: "row-title", text: SESSIONS[slot].name }),
            el("span", { class: "row-sub", text: `${SESSIONS[slot].focus} · ${plannedSets(slot)} sets` }),
          ),
          slot === form.slot ? el("span", { class: "row-chevron", text: "✓" }) : null,
        ))),
      el("div", { class: "sheet-actions" },
        el("button", { class: "btn btn-quiet", type: "button", text: "Back",
          onclick: () => openSheet((panel2) => buildCheckIn(panel2, form, opts)) }),
      ),
    );
  });
}

/**
 * One exercise: name, prescription, and a row of dots for how many sets landed.
 * Dots rather than a stepper because the answer is nearly always "all of them"
 * or "none", and both are a single tap at either end of the row.
 */
function exerciseRow(ex, form, onChange) {
  const count = el("span", { class: "ex-count" });
  const pips = el("div", { class: "pips", role: "group", "aria-label": `${ex.name} sets` });

  const paint = () => {
    const value = form.exercises[ex.id];
    row.classList.toggle("is-skipped", value === 0);
    count.textContent = value === 0 ? "Skipped" : `${value}/${ex.sets}`;
    [...pips.children].forEach((node, i) => {
      if (i === 0) node.classList.toggle("is-active", value === 0);
      else node.classList.toggle("is-on", i <= value);
    });
    onChange();
  };

  const set = (v) => { form.exercises[ex.id] = v; paint(); };

  pips.append(el("button", {
    class: "pip pip-skip", type: "button", "aria-label": `Skip ${ex.name}`, text: "–",
    onclick: () => set(0),
  }));
  for (let i = 1; i <= ex.sets; i++) {
    pips.append(el("button", {
      class: "pip", type: "button", "aria-label": `${i} set${i === 1 ? "" : "s"}`,
      onclick: () => set(i),
    }));
  }

  const row = el("div", { class: "ex" },
    el("div", { class: "ex-head" },
      el("span", { class: "ex-name", text: ex.name }),
      count,
    ),
    el("span", { class: "ex-reps", text: ex.note ? `${ex.reps} · ${ex.note}` : ex.reps }),
    pips,
  );

  paint();
  return row;
}
