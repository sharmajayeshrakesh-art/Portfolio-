/**
 * gen-tally-icons.mjs — renders the Tally PWA icons as real PNGs.
 *
 * Android only reliably offers "Add to home screen" (and, in turn, the share
 * sheet entry) when the manifest points at PNG icons, so SVG is not an option
 * here the way it is for NeuroPlay. There is no image library in this repo, so
 * this writes the PNGs directly: zlib is in Node, and a PNG is little more than
 * a header, a deflated block of scanlines, and a CRC per chunk.
 *
 * The mark is four columns of uneven height — the home screen's own chart,
 * reduced until it still reads at the 48px a launcher actually draws. Uneven on
 * purpose: a clean ascending ramp would read as a signal-strength meter.
 *
 * Run: node scripts/gen-tally-icons.mjs
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

/** Signed distance to a rounded rectangle at (x, y); <= 0 is inside. */
function sdRoundRect(px, py, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  const dx = Math.abs(px - (x + w / 2)) - (w / 2 - rr);
  const dy = Math.abs(py - (y + h / 2)) - (h / 2 - rr);
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - rr;
}

// Column heights as fractions of the tile, at the reference box width below.
const COLUMNS = [0.30, 0.52, 0.40, 0.70];
const REF_BOX = 0.66;

/** True where a column covers this point. `box` scales the whole group. */
function onColumns(u, v, box) {
  const w = box * 0.159;
  const origin = (1 - box) / 2;
  const step = (box - w) / (COLUMNS.length - 1);
  const base = 0.5 + box * 0.455;
  const scale = box / REF_BOX;

  for (let i = 0; i < COLUMNS.length; i++) {
    const top = base - COLUMNS[i] * scale;
    // Rounded cap, square on the baseline — the same mark spec the in-app
    // chart uses, so the icon and the screen agree.
    if (sdRoundRect(u, v, origin + i * step, top, w, base - top, w * 0.34) <= 0) return true;
  }
  return false;
}

/**
 * @param {number} size      output edge length in px
 * @param {boolean} fullBleed  maskable icons fill the square; the launcher
 *                             crops them, so the mark shrinks into the safe area
 */
function render(size, fullBleed) {
  const S = size * SS;
  const radius = fullBleed ? 0 : S * 0.22;
  // Maskable icons get cropped by the launcher, so the mark pulls into the
  // safe area rather than sitting at the edges.
  const box = fullBleed ? 0.54 : 0.66;

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

          if (!fullBleed && sdRoundRect(px, py, 0, 0, S, S, radius) > 0) continue;

          // Inside the tile: background unless a column covers this subpixel.
          const c = onColumns(px / S, py / S, box) ? ACCENT : BG;
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
