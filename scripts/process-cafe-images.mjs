/**
 * Clean the supplied Cafe Hari Rasa photos into web assets:
 * crop out Instagram UI (right icon rail, captions, username bars), trim
 * letterboxing on the branded posters, and extract the logo circle.
 * Run: node scripts/process-cafe-images.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC =
  "/root/.claude/uploads/d7eccfa1-df88-510e-8f27-926ed543df3e";
mkdirSync("public/cafe", { recursive: true });

// [source, output, {left,top,width,height}, maxWidth]
const jobs = [
  // Logo — crop to the black circle (component clips to a circle)
  ["694b9180-1000070715.jpg", "logo.png", { left: 120, top: 125, width: 665, height: 665 }, 520, true],
  // Hero storefront signage — drop the right icon rail
  ["62bd69d7-1000070760.jpg", "hero-signage.jpg", { left: 0, top: 0, width: 935, height: 1300 }, 1400],
  // About — Radha-Krishna relief wall + velvet seating (clean landscape)
  ["695d141f-1000070725.jpg", "about-interior.jpg", { left: 0, top: 0, width: 1080, height: 614 }, 1400],
  // Signature branded posters — trim thin letterbox borders
  ["9326ea6b-1000070763.jpg", "sig-benne-dosa.jpg", { left: 8, top: 8, width: 1063, height: 1079 }, 1000],
  ["87d14eff-1000070767.jpg", "sig-neer-idly.jpg", { left: 10, top: 6, width: 1060, height: 1289 }, 1000],
  ["7b0ddef9-1000070765.jpg", "sig-puliyogare.jpg", { left: 8, top: 8, width: 1064, height: 1283 }, 1000],
  ["6a0c5016-1000070769.jpg", "sig-made-with-love.jpg", { left: 10, top: 8, width: 1058, height: 1276 }, 1100],
  // Real food photos — crop icon rail + caption/username
  ["1a6d8815-1000070748.jpg", "food-masala-dosa.jpg", { left: 20, top: 44, width: 900, height: 1180 }, 900],
  ["6205ece9-1000070749.jpg", "food-idli.jpg", { left: 20, top: 20, width: 900, height: 1180 }, 900],
  ["b72b4db4-1000070758.jpg", "food-vada-coffee.jpg", { left: 20, top: 20, width: 900, height: 1580 }, 900],
  ["ccdddf46-1000070759.jpg", "food-podi-idli.jpg", { left: 20, top: 150, width: 900, height: 1120 }, 900],
  // Gallery interiors — crop icons / captions where present
  ["9c0620e8-1000070729.jpg", "gal-staircase.jpg", { left: 0, top: 0, width: 1000, height: 1760 }, 1000],
  ["ead7ea31-1000070727.jpg", "gal-ganesha.jpg", { left: 0, top: 0, width: 1000, height: 1770 }, 1000],
  ["b6dabe94-1000070757.jpg", "gal-relief.jpg", { left: 20, top: 285, width: 930, height: 1320 }, 950],
  ["75d53c4d-1000070761.jpg", "gal-lotus-sign.jpg", { left: 0, top: 0, width: 930, height: 1060 }, 950],
  ["dc11352f-1000070750.jpg", "gal-menu-board.jpg", { left: 18, top: 16, width: 946, height: 1180 }, 950],
];

for (const [src, out, region, maxW, isPng] of jobs) {
  let img = sharp(`${SRC}/${src}`).extract(region);
  if (maxW) img = img.resize({ width: maxW, withoutEnlargement: true });
  img = isPng ? img.png({ quality: 90 }) : img.jpeg({ quality: 82, mozjpeg: true });
  await img.toFile(`public/cafe/${out}`);
  console.log("wrote public/cafe/" + out);
}
console.log("done");
