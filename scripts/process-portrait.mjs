/**
 * One-off: turn the supplied snapshot into a premium B&W portrait for the
 * identity card. Tight head-and-shoulders crop (drops most of the busy
 * background), desaturated cinematic grade, sized for the card window.
 * Run: node scripts/process-portrait.mjs <source.jpg>
 */
import sharp from "sharp";

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/process-portrait.mjs <source.jpg>");
  process.exit(1);
}

await sharp(src)
  // crop to the subject (source is 2728x4096)
  .extract({ left: 980, top: 1650, width: 1300, height: 1650 })
  .grayscale()
  .linear(1.18, -16) // gentle contrast S
  .modulate({ brightness: 1.05 })
  .gamma(1.05)
  .resize(900, 1140, { fit: "cover", position: "top" })
  .png({ quality: 92 })
  .toFile("public/portrait.png");

console.log("wrote public/portrait.png");
