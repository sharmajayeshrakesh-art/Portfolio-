/** charts.js — dependency-free inline-SVG charts sized by viewBox (responsive). */

/**
 * Line chart of reaction time across sessions.
 * points: [{ t, rt }] chronological. Lower rt = better, so we annotate a
 * baseline band from the earliest sessions to make "drift up" obvious.
 */
export function reactionLineSVG(points, { baselineN = 3 } = {}) {
  const W = 640, H = 260, padL = 52, padR = 16, padT = 18, padB = 34;
  if (!points || points.length < 2) {
    return `<svg viewBox="0 0 ${W} ${H}" class="chart-svg" role="img"></svg>`;
  }
  const xs = points.map((_, i) => i);
  const ys = points.map((p) => p.rt);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const y0 = Math.max(0, Math.floor((minY - 150) / 100) * 100);
  const y1 = Math.ceil((maxY + 150) / 100) * 100;
  const px = (i) => padL + (i / (points.length - 1)) * (W - padL - padR);
  const py = (v) => padT + (1 - (v - y0) / (y1 - y0)) * (H - padT - padB);

  const line = points.map((p, i) => `${i ? "L" : "M"}${px(i).toFixed(1)},${py(p.rt).toFixed(1)}`).join(" ");
  const area = `${line} L${px(points.length - 1).toFixed(1)},${py(y0)} L${px(0).toFixed(1)},${py(y0)} Z`;

  // baseline band (median of first N)
  const base = points.slice(0, baselineN).map((p) => p.rt).sort((a, b) => a - b);
  const baseMed = base.length % 2 ? base[(base.length - 1) / 2] : (base[base.length / 2 - 1] + base[base.length / 2]) / 2;

  const grid = [];
  for (let g = 0; g <= 4; g++) {
    const v = y0 + ((y1 - y0) * g) / 4;
    const yy = py(v).toFixed(1);
    grid.push(`<line x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}" stroke="#e2dccf" stroke-width="1"/>`);
    grid.push(`<text x="${padL - 8}" y="${(+yy + 5).toFixed(1)}" text-anchor="end" font-size="13" fill="#4a534d">${Math.round(v)}</text>`);
  }
  const dots = points
    .map((p, i) => `<circle cx="${px(i).toFixed(1)}" cy="${py(p.rt).toFixed(1)}" r="5" fill="#0e7c6b" stroke="#fff" stroke-width="2"/>`)
    .join("");

  return `<svg viewBox="0 0 ${W} ${H}" class="chart-svg" role="img" aria-label="Reaction time trend chart">
    ${grid.join("")}
    <line x1="${padL}" y1="${py(baseMed).toFixed(1)}" x2="${W - padR}" y2="${py(baseMed).toFixed(1)}" stroke="#c9781a" stroke-width="1.5" stroke-dasharray="6 5"/>
    <text x="${W - padR}" y="${(py(baseMed) - 8).toFixed(1)}" text-anchor="end" font-size="12" font-weight="700" fill="#c9781a">baseline</text>
    <path d="${area}" fill="#0e7c6b" opacity="0.10"/>
    <path d="${line}" fill="none" stroke="#0e7c6b" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
  </svg>`;
}
