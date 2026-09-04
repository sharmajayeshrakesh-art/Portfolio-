/**
 * Builds a single self-contained NeuroPlay.html — no server, no internet.
 * Everything (CSS, all JS modules, every language file, any voice clips and
 * the icon) is inlined,
 * so it can be opened by double-clicking from a laptop or a USB stick.
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const app = resolve(root, "public/neuroplay");
const outDir = resolve(root, "dist");
mkdirSync(outDir, { recursive: true });

const langs = ["en", "hi", "as", "ne"];
const dict = {};
for (const l of langs) dict[l] = JSON.parse(readFileSync(resolve(app, `i18n/${l}.json`), "utf8"));

/* Voicebank: any clips under public/neuroplay/audio/<lang>/ are inlined as
   data URIs, so the single file speaks with the same human voice as the web
   app. Absent clips simply fall back to the device's speech engine. */
const audio = {};
let clipBytes = 0;
for (const l of langs) {
  const dir = resolve(app, `audio/${l}`);
  if (!existsSync(dir)) continue;
  const bank = {};
  for (const f of readdirSync(dir)) {
    const m = /^([0-9a-f]{8})\.(mp3|m4a|ogg|wav)$/.exec(f);
    if (!m) continue;
    const buf = readFileSync(resolve(dir, f));
    clipBytes += buf.length;
    const mime = { mp3: "audio/mpeg", m4a: "audio/mp4", ogg: "audio/ogg", wav: "audio/wav" }[m[2]];
    bank[m[1]] = `data:${mime};base64,` + buf.toString("base64");
  }
  if (Object.keys(bank).length) audio[l] = bank;
}

const css = readFileSync(resolve(app, "styles/app.css"), "utf8");
const icon = readFileSync(resolve(app, "assets/icon.svg"), "utf8");

const bundled = await build({
  entryPoints: [resolve(app, "src/app.js")],
  bundle: true,
  format: "iife",
  target: ["es2020"],
  minify: true,
  write: false,
  logLevel: "silent",
});
const js = bundled.outputFiles[0].text;

const iconDataUri = "data:image/svg+xml;base64," + Buffer.from(icon).toString("base64");

const html = `<!doctype html>
<html lang="en" data-mode="elder">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" />
<meta name="theme-color" content="#4f2b9c" />
<title>NeuroPlay</title>
<link rel="icon" href="${iconDataUri}" />
<style>${css}</style>
</head>
<body>
<div id="app">
  <main class="screen center" style="display:flex;align-items:center;justify-content:center;min-height:70dvh">
    <strong style="font-size:24px">NeuroPlay</strong>
  </main>
</div>
<script>window.__NP_I18N__ = ${JSON.stringify(dict)};</script>
<script>window.__NP_AUDIO__ = ${JSON.stringify(audio)};</script>
<script>${js}</script>
</body>
</html>
`;

const out = resolve(outDir, "NeuroPlay.html");
writeFileSync(out, html, "utf8");
const clips = Object.values(audio).reduce((n, b) => n + Object.keys(b).length, 0);
console.log("wrote", out, (html.length / 1024).toFixed(0) + " KB",
  clips ? `(${clips} voice clips, ${(clipBytes / 1024).toFixed(0)} KB audio)` : "(no voicebank — using device speech)");
