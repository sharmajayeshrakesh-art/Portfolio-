/**
 * Clean the supplied Bistro Brew photos into web assets:
 * bright outdoor seating, the cane-lamp cluster, mint counter, shopfronts and
 * styled product shots. Crop Instagram UI. Key the logo's white to transparent.
 * Run: node scripts/process-bistro-images.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "/root/.claude/uploads/d7eccfa1-df88-510e-8f27-926ed543df3e";
mkdirSync("public/bistro", { recursive: true });
mkdirSync("public/bistro/brand", { recursive: true });

// [source, output, region|null, maxWidth]
const jobs = [
  ["af498e3a-1000072675.jpg", "hero-outdoor.jpg", null, 1500],
  ["61e6bd56-1000072671.jpg", "lamps.jpg", { left: 0, top: 60, width: 1080, height: 1360 }, 1100],
  ["17586ae8-1000072670.jpg", "counter.jpg", { left: 0, top: 60, width: 1080, height: 1300 }, 1200],
  ["d048b457-1000072668.jpg", "shopfront-night.jpg", null, 1100],
  ["b371584e-1000072662.jpg", "seating.jpg", { left: 0, top: 40, width: 1080, height: 1360 }, 1100],
  ["c1fd8c1d-1000072674.jpg", "shopfront-day.jpg", { left: 0, top: 40, width: 1078, height: 1000 }, 1200],
  ["11a62f47-1000072664.jpg", "drink-latte.jpg", null, 1000],
  ["02d0b921-1000072691.jpg", "drink-mocktail.jpg", { left: 60, top: 300, width: 900, height: 1500 }, 900],
  ["d1933333-1000072666.jpg", "food-pizza.jpg", null, 1000],
  ["f525d9dc-1000072663.jpg", "food-bites.jpg", null, 1000],
];

const clean = (img) => img.modulate({ saturation: 1.03, brightness: 1.02 }).linear(1.03, -3);

for (const [src, out, region, maxW] of jobs) {
  let img = sharp(`${SRC}/${src}`);
  if (region) img = img.extract(region);
  if (maxW) img = img.resize({ width: maxW, withoutEnlargement: true });
  await clean(img).jpeg({ quality: 84, mozjpeg: true }).toFile(`public/bistro/${out}`);
  console.log("wrote public/bistro/" + out);
}

// Logo — key near-white to transparent so the brown mark sits on cream
{
  const { data, info } = await sharp(`${SRC}/f29bb74f-1000072698.jpg`)
    .resize({ width: 620 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mn = Math.min(r, g, b);
    if (mn >= 244) data[i + 3] = 0;
    else if (mn >= 220) data[i + 3] = Math.round(((244 - mn) / 24) * 255);
  }
  await sharp(data, { raw: { width, height, channels } }).png().toFile("public/bistro/brand/logo-bistrobrew.png");
  console.log("wrote logo-bistrobrew.png");
}
console.log("done");
