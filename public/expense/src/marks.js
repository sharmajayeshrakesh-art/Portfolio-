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

/* ---------- curves ---------- */

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

/* ---------- weekly waves ---------- */

const WV = { l: 14, r: 14, top: 22, base: 170, w: 340, h: 204 };
const WAVE_FAR = "#c8ccb0";   // oldest week: pale sage
const WAVE_NEAR = "#3c4a2c";  // this week: deep olive

/** Mixes two #rrggbb colours; t = 0 gives a, t = 1 gives b. */
function mix(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

let waveId = 0;

/**
 * Every week as a soft wave on one shared baseline, Monday to Sunday.
 *
 * Oldest at the back in pale sage, this week in front in deep olive. Each
 * fill fades from its colour at the crest to nothing at the baseline, so
 * where waves cross the colours build up and every week stays visible. A
 * light edge along each crest is what gives the stack its lit, layered look.
 *
 * One shared peak: a taller wave is a bigger week. Tapping a day spotlights
 * it — guide line, a dot on this week's curve, the day in a pill — and
 * reports to `onSelect`, which draws the readout.
 *
 * @param {number[][]} weeks Oldest first; each is seven daily totals, Mon-Sun.
 */
export function ridgeline(weeks, { selected = null, onSelect = () => {} } = {}) {
  const n = weeks.length;
  const peak = Math.max(1, ...weeks.flat());
  const uid = `wv${++waveId}`;

  const pw = WV.w - WV.l - WV.r;
  const x = (k) => WV.l + (k / 6) * pw;
  const y = (v) => WV.base - (v / peak) * (WV.base - WV.top);

  const svg = node("svg", {
    viewBox: `0 0 ${WV.w} ${WV.h}`,
    class: "waves",
    role: "img",
    "aria-label": `Spending by day over the last ${n} weeks, most recent in front.`,
  });
  const defs = node("defs", {});
  svg.append(defs);

  // Dashed gridlines at thirds of the height.
  for (const f of [1 / 3, 2 / 3, 1]) {
    const gy = (WV.base - f * (WV.base - WV.top)).toFixed(1);
    svg.append(node("line", { x1: WV.l, x2: WV.w - WV.r, y1: gy, y2: gy, class: "wv-grid" }));
  }

  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 1;
    const shade = mix(WAVE_FAR, WAVE_NEAR, t);
    const gid = `${uid}g${i}`;
    const grad = node("linearGradient", { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
    grad.append(node("stop", { offset: "0%", "stop-color": shade, "stop-opacity": (0.32 + 0.38 * t).toFixed(2) }));
    grad.append(node("stop", { offset: "100%", "stop-color": shade, "stop-opacity": 0.04 }));
    defs.append(grad);

    const line = smoothPath(weeks[i].map((v, k) => [x(k), y(v)]));
    svg.append(node("path", {
      d: `${line}L${x(6).toFixed(1)},${WV.base}L${x(0).toFixed(1)},${WV.base}Z`,
      class: "wv-fill", fill: `url(#${gid})`,
    }));
    // A lit edge along the crest, then a fine dark line inside it.
    svg.append(node("path", { d: line, class: "wv-glow" }));
    svg.append(node("path", { d: line, class: "wv-line", stroke: mix(shade, "#1f2618", 0.35) }));
  }

  // Baseline with a tick per day.
  svg.append(node("line", { x1: WV.l, x2: WV.w - WV.r, y1: WV.base, y2: WV.base, class: "wv-axis" }));
  for (let k = 0; k < 7; k++) {
    svg.append(node("line", { x1: x(k).toFixed(1), x2: x(k).toFixed(1), y1: WV.base - 3, y2: WV.base + 3, class: "wv-tick" }));
  }

  const guide = node("line", { y1: WV.top - 4, y2: WV.base, class: "wv-guide" });
  const dot = node("circle", { r: 4.5, class: "wv-dot" });
  svg.append(guide, dot);

  const pills = [];
  ["M", "T", "W", "T", "F", "S", "S"].forEach((d, k) => {
    const g = node("g", { class: "wv-day" });
    g.append(node("rect", { x: (x(k) - 12).toFixed(1), y: WV.base + 10, width: 24, height: 18, rx: 9, class: "wv-pill" }));
    const lbl = node("text", { x: x(k).toFixed(1), y: WV.base + 23, class: "wv-label" });
    lbl.textContent = d;
    g.append(lbl);
    svg.append(g);
    pills.push(g);
  });

  const front = weeks[n - 1];
  let current = null;
  const show = (k) => {
    current = k;
    svg.classList.toggle("has-spot", k != null);
    pills.forEach((p, j) => p.classList.toggle("is-on", j === k));
    if (k == null) { onSelect(null, null); return; }
    const gx = x(k).toFixed(1);
    const gy = y(front[k]);
    guide.setAttribute("x1", gx); guide.setAttribute("x2", gx);
    guide.setAttribute("y1", gy.toFixed(1));
    dot.setAttribute("cx", gx); dot.setAttribute("cy", gy.toFixed(1));
    onSelect(k, {
      xFrac: x(k) / WV.w,
      yFrac: gy / WV.h,
      value: front[k],
      lastWeek: n > 1 ? weeks[n - 2][k] : 0,
    });
  };

  // One hit column per day, edge to edge, no overlap.
  const slot = pw / 6;
  ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].forEach((name, k) => {
    const hit = node("rect", {
      x: Math.max(0, x(k) - slot / 2).toFixed(1), y: 0,
      width: (k === 0 || k === 6 ? slot / 2 + WV.l : slot).toFixed(1), height: WV.h,
      class: "wv-hit", role: "button", tabindex: 0, "aria-label": `Show ${name}`,
    });
    hit.addEventListener("click", () => show(k));
    hit.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(k); } });
    svg.append(hit);
  });

  // The spotlight is on at rest, like the reference — a chart that waits for
  // a tap before saying anything is a chart most people never read.
  queueMicrotask(() => show(selected));
  return svg;
}
