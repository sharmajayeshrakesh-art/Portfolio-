/**
 * Clean the supplied Aurum Beans photos into web assets:
 * crop Instagram UI (reel rails, captions), trim to editorial crops, and
 * mask the circular brand badge into a transparent-corner PNG.
 * Run: node scripts/process-aurum-images.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "/root/.claude/uploads/d7eccfa1-df88-510e-8f27-926ed543df3e";
mkdirSync("public/aurum", { recursive: true });

// [source, output, {left,top,width,height} | null, maxWidth]
const jobs = [
  // Hero — counter with glowing logo, flower ceiling, fairy lights (clean)
  ["50c14dda-1000070860.jpg", "hero-interior.jpg", null, 1600],
  // Gallery — tight glow of the illuminated logo badge
  ["50c14dda-1000070860.jpg", "gal-logo-glow.jpg", { left: 415, top: 300, width: 470, height: 470 }, 900],
  // Gallery — left corner: metal chairs + curtain of fairy lights
  ["50c14dda-1000070860.jpg", "gal-fairylights.jpg", { left: 0, top: 210, width: 430, height: 560 }, 900],
  // About — foliage wall + shelf (drop reel right-rail + bottom caption)
  ["8fc509e8-1000070871.jpg", "about-foliage.jpg", { left: 0, top: 700, width: 780, height: 1180 }, 1100],
  // Gallery — flower ceiling + woven rattan lamp (top of the reel frame)
  ["8fc509e8-1000070871.jpg", "gal-lamps.jpg", { left: 30, top: 360, width: 800, height: 720 }, 1100],
  // Gallery — grilled wrap food shot (clean)
  ["6a07765d-1000070862.jpg", "food-wrap.jpg", null, 1100],
  // Gallery — the branded "cozy little secret" poster + warm interior
  ["26d6bae1-1000070867.jpg", "gal-poster.jpg", { left: 0, top: 448, width: 1080, height: 1088 }, 1100],
];

for (const [src, out, region, maxW] of jobs) {
  let img = sharp(`${SRC}/${src}`);
  if (region) img = img.extract(region);
  if (maxW) img = img.resize({ width: maxW, withoutEnlargement: true });
  await img.jpeg({ quality: 84, mozjpeg: true }).toFile(`public/aurum/${out}`);
  console.log("wrote public/aurum/" + out);
}

// Logo — extract the circular badge, mask to a circle (transparent corners)
{
  const S = 670; // source extract size
  const OUT = 560; // final size (mask must match)
  const left = 212;
  const top = 883;
  const mask = Buffer.from(
    `<svg width="${OUT}" height="${OUT}"><circle cx="${OUT / 2}" cy="${OUT / 2}" r="${OUT / 2 - 6}" fill="#fff"/></svg>`
  );
  await sharp(
    `${SRC}/ea3889b4-Screenshot_2026072501265261_1c337646f29875672b5a61192b9010f9.jpg`
  )
    .extract({ left, top, width: S, height: S })
    .resize(OUT, OUT)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toFile("public/aurum/logo.png");
  console.log("wrote public/aurum/logo.png");
}

console.log("done");
