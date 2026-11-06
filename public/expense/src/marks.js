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
 * Catmull-Rom through the points, emitted as cubic beziers.
 *
 * The reference's curves are smooth, and straight segments between seven
 * weekly points would look like a different chart entirely. End tangents are
 * clamped to the end points so the curve does not overshoot past the data.
 */
function smoothPath(pts) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;

    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;

    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

const RIDGE = { x: 18, y: 148, w: 232, step: 13, skew: 7, amp: 54 };

/**
 * A ridgeline: one smooth curve per week, stacked back to front.
 *
 * This is the honest form of the reference's 3D surface. A true perspective
 * mesh hides rows behind taller ones and makes every height ambiguous, so the
 * one thing a reader wants from it — comparing a value to another value —
 * stops working. A ridgeline keeps the same stacked, receding look, and every
 * curve sits on its own baseline where it can still be read.
 *
 * Every week is drawn against one shared peak, so a tall ridge really is a
 * bigger week. Fills are solid page colour, which is what lets a nearer week
 * occlude the one behind it.
 *
 * @param {number[][]} weeks  Oldest first; each is seven daily totals, Mon-Sun.
 */
export function ridgeline(weeks) {
  const n = weeks.length;
  const peak = Math.max(1, ...weeks.flat());

  const svg = node("svg", {
    viewBox: `0 0 ${RIDGE.x + (n - 1) * RIDGE.skew + RIDGE.w + 18} 170`,
    class: "ridge",
    role: "img",
    "aria-label": `Spending by day over the last ${n} weeks, most recent in front.`,
  });

  // Back to front: a nearer week has to paint over the one behind it.
  for (let i = 0; i < n; i++) {
    const depth = n - 1 - i;          // 0 for the newest week
    const recency = n > 1 ? i / (n - 1) : 1;
    const bx = RIDGE.x + depth * RIDGE.skew;
    const by = RIDGE.y - depth * RIDGE.step;

    const pts = weeks[i].map((v, k) => [
      bx + (k / 6) * RIDGE.w,
      by - (v / peak) * RIDGE.amp,
    ]);

    const line = smoothPath(pts);

    svg.append(node("path", {
      d: `${line}L${(bx + RIDGE.w).toFixed(1)},${by.toFixed(1)}L${bx.toFixed(1)},${by.toFixed(1)}Z`,
      class: "ridge-fill",
    }));
    svg.append(node("path", {
      d: line,
      class: "ridge-line",
      // The newest week is the darkest; older ones recede rather than
      // competing with it.
      "stroke-opacity": (0.22 + 0.78 * recency).toFixed(2),
    }));
  }

  // Day labels sit on the front baseline, so the x axis is read off the week
  // that matters most rather than floating under the whole stack.
  const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
  DAYS.forEach((d, k) => {
    const t = node("text", {
      x: (RIDGE.x + (k / 6) * RIDGE.w).toFixed(1),
      y: RIDGE.y + 14,
      class: "ridge-day",
    });
    t.textContent = d;
    svg.append(t);
  });

  return svg;
}
