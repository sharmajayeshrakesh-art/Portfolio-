/**
 * Clean the supplied Secret Sambar photos into web assets:
 * heritage entrances, interiors, brass shrine, banana-leaf thali, four
 * storefronts (branches), gallery crops, and the glowing Kathakali mask emblem.
 * Run: node scripts/process-sambar-images.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "/root/.claude/uploads/d7eccfa1-df88-510e-8f27-926ed543df3e";
mkdirSync("public/sambar", { recursive: true });

// [source, output, {left,top,width,height} | null, maxWidth]
const jobs = [
  // Hero — marigold-garland heritage entrance (landscape) + portrait for mobile
  ["7eb08745-1000071242.jpg", "hero.jpg", null, 1600],
  ["25c16238-1000071244.jpg", "hero-portrait.jpg", { left: 40, top: 0, width: 1000, height: 1436 }, 1000],
  // About — pillared heritage hall with hanging garland
  ["6786fed5-1000071238.jpg", "about-hall.jpg", { left: 0, top: 240, width: 1079, height: 900 }, 1300],
  // Branch storefronts
  ["39642115-1000071216.jpg", "branch-bavdhan.jpg", null, 1000],
  ["a8025075-1000071214.jpg", "branch-pcmc.jpg", null, 1000],
  ["48b14f07-1000071250.jpg", "branch-sbroad.jpg", { left: 0, top: 60, width: 1079, height: 700 }, 1000],
  ["ae066461-1000071252.jpg", "branch-akurdi.jpg", { left: 0, top: 260, width: 1080, height: 760 }, 1000],
  // Gallery
  ["5b5c11c5-1000071240.jpg", "gal-shrine.jpg", { left: 30, top: 360, width: 1010, height: 1160 }, 1000],
  ["440247f3-1000071254.jpg", "gal-thali.jpg", null, 1100],
  ["70445af2-1000071234.jpg", "gal-elephant.jpg", null, 1100],
  ["c97a481f-1000071248.jpg", "gal-rangoli.jpg", { left: 90, top: 300, width: 900, height: 900 }, 950],
  ["34214749-1000071236.jpg", "gal-interior.jpg", { left: 0, top: 300, width: 1079, height: 820 }, 1100],
  ["46cb2a54-1000071260.jpg", "gal-hall.jpg", null, 1100],
  // Mask emblem — tight crop of the glowing Kathakali mask
  ["f17f05be-1000071256.jpg", "mask.jpg", { left: 280, top: 175, width: 520, height: 880 }, 720],
];

for (const [src, out, region, maxW] of jobs) {
  let img = sharp(`${SRC}/${src}`);
  if (region) img = img.extract(region);
  if (maxW) img = img.resize({ width: maxW, withoutEnlargement: true });
  await img.jpeg({ quality: 84, mozjpeg: true }).toFile(`public/sambar/${out}`);
  console.log("wrote public/sambar/" + out);
}
console.log("done");
