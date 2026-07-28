/**
 * Clean the supplied FITPRO GYM photos into web assets:
 * crop Instagram UI from the LED-ceiling / floor / reception shots, tidy the
 * shrine, prep the transparent cover athlete, and mask the logo disc.
 * Run: node scripts/process-fitpro-images.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "/root/.claude/uploads/d7eccfa1-df88-510e-8f27-926ed543df3e";
mkdirSync("public/fitpro", { recursive: true });
mkdirSync("public/fitpro/brand", { recursive: true });
mkdirSync("public/fitpro/splash", { recursive: true });

// [source, output, region|null, maxWidth]
const jobs = [
  ["d0e1aa31-1000071931.jpg", "hero-ceiling.jpg", { left: 0, top: 455, width: 1080, height: 560 }, 1500],
  ["32f54e1d-1000071947.jpg", "class-zumba.jpg", { left: 0, top: 120, width: 1080, height: 1000 }, 1200],
  ["825c34fc-1000071937.jpg", "floor-cardio.jpg", { left: 0, top: 520, width: 1080, height: 810 }, 1300],
  ["825c34fc-1000071937.jpg", "view-window.jpg", { left: 0, top: 120, width: 1080, height: 620 }, 1300],
  ["d656cf96-1000071936.jpg", "floor-strength.jpg", { left: 0, top: 170, width: 1080, height: 810 }, 1300],
  ["6abd33c5-1000071938.jpg", "floor-strength2.jpg", { left: 0, top: 170, width: 1080, height: 810 }, 1300],
  ["7e37b961-1000071940.jpg", "dumbbell-rack.jpg", null, 1200],
  ["a67b46b3-1000071934.jpg", "reception.jpg", { left: 0, top: 40, width: 1080, height: 1400 }, 1100],
  ["e9fbcb63-1000071946.jpg", "wall-come.jpg", { left: 30, top: 120, width: 900, height: 1440 }, 1000],
  ["dda09082-1000071939.jpg", "shrine.jpg", { left: 120, top: 120, width: 840, height: 1200 }, 1000],
];

const clean = (img) => img.modulate({ saturation: 0.96 }).linear(1.05, -6);

for (const [src, out, region, maxW] of jobs) {
  let img = sharp(`${SRC}/${src}`);
  if (region) img = img.extract(region);
  if (maxW) img = img.resize({ width: maxW, withoutEnlargement: true });
  await clean(img).jpeg({ quality: 82, mozjpeg: true }).toFile(`public/fitpro/${out}`);
  console.log("wrote public/fitpro/" + out);
}

// Cover subject — transparent athlete, trim margins, resize, PNG + WebP
{
  const trimmed = await sharp(`${SRC}/df67aad5-1000071990.png`).trim().toBuffer();
  await sharp(trimmed).resize({ width: 1700 }).png({ compressionLevel: 9 }).toFile("public/fitpro/splash/splash-subject.png");
  await sharp(trimmed).resize({ width: 1700 }).webp({ quality: 88 }).toFile("public/fitpro/splash/splash-subject.webp");
  const m = await sharp("public/fitpro/splash/splash-subject.png").metadata();
  console.log("wrote splash-subject", m.width + "x" + m.height);
}

// Logo — mask the black disc to a circle (transparent corners)
{
  const S = 760, OUT = 560, left = 52, top = 52;
  const mask = Buffer.from(
    `<svg width="${OUT}" height="${OUT}"><circle cx="${OUT / 2}" cy="${OUT / 2}" r="${OUT / 2}" fill="#fff"/></svg>`
  );
  await sharp(`${SRC}/6aa1fcb1-1000071951.jpg`)
    .extract({ left, top, width: S, height: S })
    .resize(OUT, OUT)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toFile("public/fitpro/brand/logo-fitpro.png");
  console.log("wrote logo-fitpro.png");
}
console.log("done");
