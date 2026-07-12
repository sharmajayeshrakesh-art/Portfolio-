/**
 * Generates local, self-contained site-preview mockups (tall SVGs) for the
 * project cards. Not fake product UI — stylized, branded previews of a page
 * (hero + sections + footer) that read as a real site inside a browser frame.
 * Tall (1600x2400) so the card's hover pan reveals the "page" scrolling.
 * Run: node scripts/gen-mockups.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";

const W = 1600;
const H = 2400;

const themes = [
  {
    slug: "halcyon",
    name: "Halcyon",
    kicker: "Move money with confidence",
    bg: "#0b1f3a",
    bg2: "#0a1526",
    ink: "#eaf1ff",
    sub: "#9db4d8",
    accent: "#4d8bff",
    panel: "#122845",
  },
  {
    slug: "aperture",
    name: "Aperture",
    kicker: "The work, uninterrupted",
    bg: "#171514",
    bg2: "#0e0d0c",
    ink: "#f4efe9",
    sub: "#b6ada3",
    accent: "#d8a24a",
    panel: "#221f1c",
  },
  {
    slug: "northwind",
    name: "Northwind",
    kicker: "Ship the story, not the spec",
    bg: "#0e1a1c",
    bg2: "#0a1214",
    ink: "#e9f5f3",
    sub: "#8fb3ae",
    accent: "#2fd6b0",
    panel: "#12262a",
  },
  {
    slug: "sable",
    name: "Sable & Co.",
    kicker: "The boutique, online",
    bg: "#141414",
    bg2: "#0c0c0c",
    ink: "#f2ede6",
    sub: "#b0a79c",
    accent: "#c9a27a",
    panel: "#1d1c1a",
  },
];

const rect = (x, y, w, h, fill, r = 0, o = 1) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" opacity="${o}"/>`;

function svg(t) {
  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter, system-ui, sans-serif">`
  );
  parts.push(
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.bg}"/><stop offset="1" stop-color="${t.bg2}"/></linearGradient>` +
      `<radialGradient id="glow" cx="0.75" cy="0.2" r="0.6"><stop offset="0" stop-color="${t.accent}" stop-opacity="0.35"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient></defs>`
  );
  parts.push(rect(0, 0, W, H, "url(#g)"));
  parts.push(rect(0, 0, W, 900, "url(#glow)"));

  // nav
  parts.push(rect(90, 70, 150, 30, t.ink, 6, 0.92));
  [0, 1, 2].forEach((i) => parts.push(rect(W - 470 + i * 130, 74, 90, 22, t.sub, 6, 0.6)));
  parts.push(rect(W - 210, 66, 120, 40, t.accent, 20));

  // hero
  parts.push(
    `<text x="90" y="470" font-size="150" font-weight="700" letter-spacing="-4" fill="${t.ink}">${t.name}</text>`
  );
  parts.push(
    `<text x="94" y="560" font-size="42" fill="${t.sub}">${t.kicker}</text>`
  );
  parts.push(rect(90, 640, 260, 74, t.accent, 37));
  parts.push(rect(380, 640, 200, 74, "none", 37));
  parts.push(
    `<rect x="380" y="640" width="200" height="74" rx="37" fill="none" stroke="${t.sub}" stroke-opacity="0.5"/>`
  );

  // hero visual panel
  parts.push(rect(90, 800, W - 180, 620, t.panel, 24));
  parts.push(rect(90, 800, W - 180, 620, "url(#glow)", 24, 0.5));
  parts.push(rect(150, 870, 380, 26, t.sub, 6, 0.5));
  parts.push(rect(150, 920, 620, 26, t.sub, 6, 0.3));
  [0, 1, 2].forEach((i) =>
    parts.push(rect(150 + i * 420, 1050, 360, 300, t.bg2, 16, 0.85))
  );
  [0, 1, 2].forEach((i) =>
    parts.push(rect(180 + i * 420, 1090, 120, 120, t.accent, 60, 0.9))
  );

  // section 2 — three cards
  parts.push(
    `<text x="90" y="1600" font-size="72" font-weight="700" letter-spacing="-2" fill="${t.ink}">What we made</text>`
  );
  [0, 1, 2].forEach((i) => {
    const x = 90 + i * ((W - 180 - 2 * 40) / 3 + 40);
    const w = (W - 180 - 2 * 40) / 3;
    parts.push(rect(x, 1700, w, 460, t.panel, 20));
    parts.push(rect(x + 40, 1740, w - 80, 220, t.bg2, 12, 0.9));
    parts.push(rect(x + 40, 2000, w - 120, 24, t.ink, 6, 0.7));
    parts.push(rect(x + 40, 2044, w - 80, 20, t.sub, 6, 0.4));
  });

  // footer
  parts.push(rect(0, 2260, W, 140, t.bg2));
  parts.push(rect(90, 2320, 130, 26, t.ink, 6, 0.8));
  [0, 1, 2, 3].forEach((i) => parts.push(rect(W - 560 + i * 130, 2322, 90, 20, t.sub, 6, 0.5)));

  parts.push(`</svg>`);
  return parts.join("");
}

mkdirSync("public/mockups", { recursive: true });
for (const t of themes) {
  writeFileSync(`public/mockups/${t.slug}.svg`, svg(t));
  console.log("wrote", `public/mockups/${t.slug}.svg`);
}
