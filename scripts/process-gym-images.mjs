/**
 * Clean the supplied Key 2 Fitness photos into web assets:
 * hero gym floor, gallery equipment shots, and the circular K2 logo badge.
 * Run: node scripts/process-gym-images.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "/root/.claude/uploads/d7eccfa1-df88-510e-8f27-926ed543df3e";
mkdirSync("public/gym", { recursive: true });

// [source, output, region|null, maxWidth]
const jobs = [
  ["935e8114-1000071480.jpg", "hero.jpg", null, 1600], // wide gym floor
  ["943534e2-1000071487.jpg", "g-turf.jpg", null, 1200], // turf wall + machines
  ["f91fe807-1000071482.jpg", "g-dumbbells.jpg", null, 1100],
  ["d99ffdfb-1000071470.jpg", "g-squat.jpg", { left: 0, top: 0, width: 1079, height: 748 }, 1100],
  ["79c8a4f1-1000071485.jpg", "g-cable.jpg", null, 1100],
  ["2ca67aaf-1000071478.jpg", "g-machines.jpg", null, 1100],
  ["65553fbb-1000071472.jpg", "g-reception.jpg", null, 1200], // glowing K2 logo wall
  ["744c0fed-1000071476.jpg", "g-bench.jpg", null, 1000], // portrait
];

for (const [src, out, region, maxW] of jobs) {
  let img = sharp(`${SRC}/${src}`);
  if (region) img = img.extract(region);
  if (maxW) img = img.resize({ width: maxW, withoutEnlargement: true });
  await img.jpeg({ quality: 82, mozjpeg: true }).toFile(`public/gym/${out}`);
  console.log("wrote public/gym/" + out);
}

// Logo — extract the white circular badge, mask to a circle (transparent corners)
{
  const S = 690; // source extract size
  const OUT = 560;
  const left = 177;
  const top = 873;
  const mask = Buffer.from(
    `<svg width="${OUT}" height="${OUT}"><circle cx="${OUT / 2}" cy="${OUT / 2}" r="${OUT / 2 - 4}" fill="#fff"/></svg>`
  );
  await sharp(
    `${SRC}/6a4fe609-Screenshot_2026072711381587_1c337646f29875672b5a61192b9010f9.jpg`
  )
    .extract({ left, top, width: S, height: S })
    .resize(OUT, OUT)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toFile("public/gym/logo.png");
  console.log("wrote public/gym/logo.png");
}
console.log("done");
