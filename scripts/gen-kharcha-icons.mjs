/**
 * gen-kharcha-icons.mjs — renders the Kharcha PWA icons as real PNGs.
 *
 * Android only reliably offers "Add to home screen" (and, in turn, the share
 * sheet entry) when the manifest points at PNG icons, so SVG is not an option
 * here the way it is for NeuroPlay. There is no image library in this repo, so
 * this writes the PNGs directly: zlib is in Node, and a PNG is little more than
 * a header, a deflated block of scanlines, and a CRC per chunk.
 *
 * The mark is a geometric rupee — two bars, a stem, a leg — rasterised from
 * line segments by distance field, which gives rounded caps for free and stays
 * legible down to the 48px the launcher actually draws.
 *
 * Run: node scripts/gen-kharcha-icons.mjs
 */

import zlib from "node:zlib";
import fs from "node:fs";

const OUT_DIR = new URL("../public/expense/icons/", import.meta.url);

const BG = [0x10, 0x14, 0x18];     // --bg
const ACCENT = [0x4a, 0xde, 0x80]; // --accent
const SS = 4;                       // supersampling factor, for clean edges

/* ---------- PNG container ---------- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // colour type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- geometry ---------- */

/** Signed distance to a rounded rectangle; <= 0 is inside. */
function sdRoundRect(px, py, w, h, r) {
  const dx = Math.abs(px - w / 2) - (w / 2 - r);
  const dy = Math.abs(py - h / 2) - (h / 2 - r);
  const ax = Math.max(dx, 0);
  const ay = Math.max(dy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(dx, dy), 0) - r;
}

/** Distance from a point to a line segment. */
function sdSegment(px, py, x1, y1, x2, y2) {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const wx = px - x1;
  const wy = py - y1;
  const len2 = vx * vx + vy * vy;
  const t = len2 ? Math.max(0, Math.min(1, (wx * vx + wy * vy) / len2)) : 0;
  return Math.hypot(wx - t * vx, wy - t * vy);
}

// A rupee sign reduced to four strokes, in the unit square of the mark box.
const STROKES = [
  [0.08, 0.13, 0.92, 0.13], // upper bar
  [0.08, 0.39, 0.92, 0.39], // lower bar
  [0.31, 0.13, 0.31, 0.39], // stem joining them
  [0.31, 0.39, 0.86, 0.95], // leg
];
const STROKE_W = 0.125;

/**
 * @param {number} size      output edge length in px
 * @param {boolean} fullBleed  maskable icons fill the square; the launcher
 *                             crops them, so the mark shrinks into the safe area
 */
function render(size, fullBleed) {
  const S = size * SS;
  const radius = fullBleed ? 0 : S * 0.22;
  const markSize = S * (fullBleed ? 0.54 : 0.62);
  const markX = (S - markSize) / 2;
  const markY = (S - markSize) / 2;
  const half = (STROKE_W * markSize) / 2;

  const out = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x * SS + sx + 0.5;
          const py = y * SS + sy + 0.5;

          if (!fullBleed && sdRoundRect(px, py, S, S, radius) > 0) continue;

          // Inside the tile: background unless a stroke covers this subpixel.
          let onMark = false;
          const ux = (px - markX) / markSize;
          const uy = (py - markY) / markSize;
          for (const [x1, y1, x2, y2] of STROKES) {
            if (sdSegment(ux * markSize, uy * markSize,
                          x1 * markSize, y1 * markSize,
                          x2 * markSize, y2 * markSize) <= half) {
              onMark = true;
              break;
            }
          }

          const c = onMark ? ACCENT : BG;
          r += c[0];
          g += c[1];
          b += c[2];
          a += 255;
        }
      }

      const n = SS * SS;
      const i = (y * size + x) * 4;
      // Un-premultiply so the rounded corners stay the tile colour, not black.
      out[i] = a ? Math.round(r / (a / 255)) : 0;
      out[i + 1] = a ? Math.round(g / (a / 255)) : 0;
      out[i + 2] = a ? Math.round(b / (a / 255)) : 0;
      out[i + 3] = Math.round(a / n);
    }
  }

  return encodePNG(size, size, out);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const jobs = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["maskable-512.png", 512, true],
];

for (const [name, size, fullBleed] of jobs) {
  const png = render(size, fullBleed);
  fs.writeFileSync(new URL(name, OUT_DIR), png);
  console.log(`${name.padEnd(18)} ${size}×${size}  ${(png.length / 1024).toFixed(1)} KB`);
}
