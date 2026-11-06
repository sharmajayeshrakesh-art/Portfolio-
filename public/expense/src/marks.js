/**
 * marks.js — the two chart forms, both drawn as fields of dots.
 *
 * The look comes from a reference the app is being styled against: discrete
 * dots rather than continuous fills, arranged in concentric rows. The reference
 * is a glowing green on black; this is ink on paper, so the dots carry the form
 * and nothing glows.
 *
 * Both marks are inline SVG with no library. A chart that needs 40KB of
 * JavaScript to draw 54 circles has no business in an app that opens over a
 * 2 KB/s connection.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

const node = (name, attrs) => {
  const n = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
};

/* ---------- the arc meter ---------- */

const SWEEP_START = 210; // degrees, counter-clockwise from "east"
const SWEEP_TOTAL = 240;

// Three concentric rows, spaced so the inner one clears the centred figure.
// An earlier pass put them at 44/56/68 and the number sat straight on top of
// the inner ring.
const ROWS = [58, 70, 82];
const PER_ROW = 22;

const CX = 110;
const CY = 100;

/**
 * A ratio against a target, drawn as a field of dots around an arc.
 *
 * This is a meter — one value, one limit — which is the form that fits, and the
 * dots are the material the reference uses. Each row is evenly spaced across
 * the whole sweep, so the rings read as rings; grouping them into one cluster
 * per session was tried first and left the field sparse and lumpy.
 *
 * The lit fraction is exactly the fraction printed in the middle. Completeness
 * per session is deliberately NOT folded in here: it would make the arc say
 * something different from the number sitting inside it, and the consistency
 * grid below already shows how full each session was.
 */
export function arcMeter(done, target, { label = "", value = "" } = {}) {
  const fraction = target > 0 ? Math.min(1, done / target) : 0;

  const svg = node("svg", {
    viewBox: "0 0 220 150",
    class: "meter",
    role: "img",
    "aria-label": `${value || `${done} of ${target}`} ${label}`.trim(),
  });

  for (const r of ROWS) {
    const lit = Math.round(PER_ROW * fraction);
    for (let k = 0; k < PER_ROW; k++) {
      const deg = SWEEP_START - (k / (PER_ROW - 1)) * SWEEP_TOTAL;
      const rad = (deg * Math.PI) / 180;

      svg.append(node("circle", {
        cx: (CX + r * Math.cos(rad)).toFixed(2),
        cy: (CY - r * Math.sin(rad)).toFixed(2),
        r: 3,
        class: k < lit ? "meter-dot is-on" : "meter-dot",
        // Staggers the fill around the ring rather than lighting it at once.
        style: `--d:${k}`,
      }));
    }
  }

  if (label) {
    const t = node("text", { x: CX, y: 84, class: "meter-label" });
    t.textContent = label;
    svg.append(t);
  }
  if (value) {
    const t = node("text", { x: CX, y: 118, class: "meter-value" });
    t.textContent = value;
    svg.append(t);
  }

  return svg;
}

/* ---------- dotted columns ---------- */

const MAX_DOTS = 9;

/**
 * Magnitude over a handful of days, as stacked dots instead of a solid bar.
 *
 * Deliberately still a column chart on one flat baseline: the reader's job here
 * is comparing days to each other, and bending that into a ring would make the
 * one thing the chart is for harder. Only the material changes.
 *
 * Quantising to nine steps is the real trade. A bar reads to the pixel; this
 * reads to the dot. For "which days were heavy" that is enough, and a countable
 * column is easier to compare across a gap than two bar heights are.
 *
 * @param {number[]} values One per column, same order as the labels.
 * @param {number}   peak   The value that fills a column.
 */
export function dotColumn(value, peak) {
  const n = peak > 0 && value > 0
    // Any spending at all gets one dot: rounding a real purchase down to an
    // empty column would say "nothing was spent", which is a different claim.
    ? Math.max(1, Math.round((value / peak) * MAX_DOTS))
    : 0;

  const svg = node("svg", {
    viewBox: `0 0 14 ${MAX_DOTS * 10}`,
    class: "dotcol",
    "aria-hidden": "true",
    preserveAspectRatio: "xMidYMax meet",
  });

  for (let i = 0; i < MAX_DOTS; i++) {
    // Drawn from the baseline up, so a column grows the way a bar would.
    svg.append(node("circle", {
      cx: 7,
      cy: MAX_DOTS * 10 - 5 - i * 10,
      r: 3.4,
      class: i < n ? "dotcol-dot is-on" : "dotcol-dot",
    }));
  }

  return svg;
}

/* ---------- ridgeline ---------- */

/**
 * A monotone cubic through the points, emitted as beziers.
 *
 * Catmull-Rom was tried first and overshot: between a zero day and a big one
 * the curve dipped below the baseline, drawing spending that was negative,
 * which is a value this data cannot take. Steffen's tangents never cross a
 * data extremum, so the curve stays at or above zero wherever the data does
 * and a flat run of empty days is drawn flat.
 */
function smoothPath(pts) {
  const n = pts.length;
  if (n < 2) return "";

  const h = pts[1][0] - pts[0][0]; // columns are equally spaced
  const d = [];
  for (let i = 0; i < n - 1; i++) d.push((pts[i + 1][1] - pts[i][1]) / h);

  const m = new Array(n);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    const a = d[i - 1], b = d[i];
    if (a * b <= 0) { m[i] = 0; continue; }
    const p = (a + b) / 2;
    m[i] = (Math.sign(a) + Math.sign(b)) * Math.min(Math.abs(a), Math.abs(b), Math.abs(p) / 2);
  }

  let out = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    out += `C${(x0 + h / 3).toFixed(1)},${(y0 + (m[i] * h) / 3).toFixed(1)} `
         + `${(x1 - h / 3).toFixed(1)},${(y1 - (m[i + 1] * h) / 3).toFixed(1)} `
         + `${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return out;
}

/* ---------- the week by category ---------- */

const WA = { l: 38, r: 10, t: 14, b: 26, w: 340, h: 196 };
const DAY_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

/** A round ceiling for the y axis, with the step chosen so there are 3 or 4
 *  gridlines whatever the scale: ₹300 and ₹30,000 weeks both get sane ticks. */
function niceScale(max) {
  const raw = Math.max(1, max) / 3;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((v) => v >= raw);
  const top = Math.ceil(Math.max(1, max) / step) * step;
  const ticks = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
  return { top, ticks };
}

const compact = (v) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : String(Math.round(v)));

/**
 * Daily spending, Monday to Sunday, one translucent area per category.
 *
 * The areas overlap rather than stack, so every curve is read against the
 * same axis and a point's height is that category's spend that day — nothing
 * sits on top of anything else. The fills are what make four lines on one
 * axis readable at a glance; the lines are what make them exact.
 *
 * Interaction is driven from outside: `onSelect(i, meta)` fires with the day
 * index (or null) and everything the caller needs to draw a tooltip. Hover
 * previews a day; a tap pins it, because there is no hover on a phone and a
 * tooltip that vanishes when the finger lifts is a tooltip you cannot read.
 *
 * @param {{name:string,color:string,values:number[]}[]} series  Top first.
 * @param {number[]} totals  Seven daily totals across all categories.
 */
export function weekAreas(series, totals, { onSelect = () => {} } = {}) {
  const peak = Math.max(...series.flatMap((s) => s.values), 0);
  const { top, ticks } = niceScale(peak);

  const pw = WA.w - WA.l - WA.r;
  const ph = WA.h - WA.t - WA.b;
  const x = (i) => WA.l + (i / 6) * pw;
  const y = (v) => WA.t + ph - (v / top) * ph;

  const svg = node("svg", {
    viewBox: `0 0 ${WA.w} ${WA.h}`,
    class: "wa",
    role: "img",
    "aria-label": "Daily spending this week by category, Monday to Sunday",
  });

  // Gridlines and the axis, drawn first so everything else sits on top.
  for (const v of ticks) {
    svg.append(node("line", {
      x1: WA.l, x2: WA.w - WA.r, y1: y(v).toFixed(1), y2: y(v).toFixed(1),
      class: v === 0 ? "wa-axis" : "wa-grid",
    }));
    const t = node("text", { x: WA.l - 6, y: (y(v) + 3).toFixed(1), class: "wa-tick" });
    t.textContent = compact(v);
    svg.append(t);
  }

  // Areas back to front: the biggest category goes down first so smaller
  // ones are never buried under it.
  const markers = [];
  [...series].reverse().forEach((s) => {
    const pts = s.values.map((v, i) => [x(i), y(v)]);
    const line = smoothPath(pts);
    svg.append(node("path", {
      d: `${line}L${x(6).toFixed(1)},${y(0).toFixed(1)}L${x(0).toFixed(1)},${y(0).toFixed(1)}Z`,
      class: "wa-area", fill: s.color, "fill-opacity": s.fill ?? 0.16,
    }));
    svg.append(node("path", { d: line, class: "wa-line", stroke: s.color }));
  });

  const guide = node("line", { x1: 0, x2: 0, y1: WA.t, y2: WA.t + ph, class: "wa-guide" });
  svg.append(guide);

  // One marker per series, moved to the selected day. Ringed in page colour
  // so it reads on top of its own area.
  for (const s of series) {
    const m = node("circle", { r: 4, class: "wa-marker", fill: s.color });
    markers.push(m);
    svg.append(m);
  }

  DAY_SHORT.forEach((d, i) => {
    const t = node("text", { x: x(i).toFixed(1), y: WA.h - 8, class: "wa-day" });
    t.textContent = d;
    svg.append(t);
  });

  let pinned = null;

  const show = (i) => {
    if (i == null) {
      guide.classList.remove("is-on");
      markers.forEach((m) => m.classList.remove("is-on"));
      svg.querySelectorAll(".wa-day.is-on").forEach((n) => n.classList.remove("is-on"));
      onSelect(null, null);
      return;
    }
    const gx = x(i).toFixed(1);
    guide.setAttribute("x1", gx);
    guide.setAttribute("x2", gx);
    guide.classList.add("is-on");
    series.forEach((s, k) => {
      markers[k].setAttribute("cx", gx);
      markers[k].setAttribute("cy", y(s.values[i]).toFixed(1));
      markers[k].classList.toggle("is-on", s.values[i] > 0);
    });
    svg.querySelectorAll(".wa-day").forEach((n, k) => n.classList.toggle("is-on", k === i));
    onSelect(i, {
      xFrac: i / 6,
      total: totals[i],
      parts: series.map((s) => ({ name: s.name, color: s.color, value: s.values[i] })).filter((p) => p.value > 0),
    });
  };

  // Hit targets: a full-height column per day, each wider than a fingertip.
  const slot = pw / 6;
  DAY_SHORT.forEach((_, i) => {
    const hit = node("rect", {
      x: (x(i) - slot / 2).toFixed(1), y: 0, width: slot.toFixed(1), height: WA.h,
      class: "wa-hit", role: "button", tabindex: 0,
      "aria-label": `${["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][i]}, ${totals[i] ? "₹" + Math.round(totals[i]).toLocaleString("en-IN") : "nothing spent"}`,
    });
    hit.addEventListener("pointerenter", () => { if (pinned == null) show(i); });
    hit.addEventListener("click", () => { pinned = pinned === i ? null : i; show(pinned); });
    hit.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pinned = pinned === i ? null : i; show(pinned); }
    });
    hit.addEventListener("focus", () => { if (pinned == null) show(i); });
    svg.append(hit);
  });
  svg.addEventListener("pointerleave", () => { if (pinned == null) show(null); });

  return svg;
}

/* ---------- ridgeline ---------- */

const RIDGE = { x: 18, y: 150, w: 232, step: 13, skew: 7, amp: 58 };

/** Mixes two #rrggbb colours; t = 0 gives a, t = 1 gives b. */
function mix(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

const RIDGE_FAR = "#c9c0b6";  // oldest week: soft clay
const RIDGE_NEAR = "#2d2926"; // this week: charcoal

/**
 * One smooth curve per week, Monday to Sunday, stacked back to front.
 *
 * Every week takes its own shade from one brown family — clay at the back,
 * charcoal in front — so age reads as depth. Fills are translucent rather than
 * solid page colour, so where ridges cross the colours build up and you see
 * both, instead of the nearer week cutting the one behind it off.
 *
 * All weeks share one peak: a taller ridge really is a bigger week.
 *
 * @param {number[][]} weeks Oldest first; each is seven daily totals, Mon-Sun.
 */
export function ridgeline(weeks) {
  const n = weeks.length;
  const peak = Math.max(1, ...weeks.flat());

  const svg = node("svg", {
    viewBox: `0 0 ${RIDGE.x + (n - 1) * RIDGE.skew + RIDGE.w + 14} 172`,
    class: "ridge",
    role: "img",
    "aria-label": `Spending by day over the last ${n} weeks, most recent in front.`,
  });

  for (let i = 0; i < n; i++) {
    const depth = n - 1 - i;              // 0 for this week
    const t = n > 1 ? i / (n - 1) : 1;     // 0 oldest .. 1 newest
    const shade = mix(RIDGE_FAR, RIDGE_NEAR, t);
    const bx = RIDGE.x + depth * RIDGE.skew;
    const by = RIDGE.y - depth * RIDGE.step;

    const pts = weeks[i].map((v, k) => [bx + (k / 6) * RIDGE.w, by - (v / peak) * RIDGE.amp]);
    const line = smoothPath(pts);

    svg.append(node("path", {
      d: `${line}L${(bx + RIDGE.w).toFixed(1)},${by.toFixed(1)}L${bx.toFixed(1)},${by.toFixed(1)}Z`,
      class: "ridge-fill",
      fill: shade,
      // Nearer weeks a touch denser, so the front still reads first where
      // everything overlaps.
      "fill-opacity": (0.10 + 0.14 * t).toFixed(2),
    }));
    svg.append(node("path", {
      d: line,
      class: "ridge-line",
      stroke: shade,
      "stroke-width": (1.2 + 0.8 * t).toFixed(2),
    }));
  }

  ["M", "T", "W", "T", "F", "S", "S"].forEach((d, k) => {
    const lbl = node("text", { x: (RIDGE.x + (k / 6) * RIDGE.w).toFixed(1), y: RIDGE.y + 15, class: "ridge-day" });
    lbl.textContent = d;
    svg.append(lbl);
  });

  return svg;
}
