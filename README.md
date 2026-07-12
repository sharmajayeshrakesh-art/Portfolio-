# Meridian — Portfolio V2

A premium agency portfolio built to earn trust through craft: a 3D holographic
identity card, a horizontal-pan work gallery with living project cards, a
cursor-reactive "Beyond Websites" globe, and a full motion + premium-details
layer (custom cursor, magnetic buttons, grain, page loader, sound-ready).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · GSAP + ScrollTrigger ·
Lenis · Phosphor icons. All motion respects `prefers-reduced-motion`.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Make it yours (replace the placeholders)

1. **Your details** — edit `lib/site.ts` (studio name, your name, role, email,
   socials, primary CTA).
2. **Your portrait** — drop a transparent PNG at `public/portrait.png`. The
   identity card swaps the `RS` placeholder for your photo automatically.
   (See the photo prep guide shared during the build: ¾ turn, matte dark
   clothing, soft directional light, clean background, ideally a B&W cinematic
   grade.)
3. **Real projects** — replace the placeholder entries in `projects` in
   `lib/site.ts` with real case studies (title, category, live URL). Put real
   screenshots in `public/` and point each `image` at them. Until then the
   cards show generated `Sample` previews from `public/mockups/`.
   - Regenerate the sample previews with `node scripts/gen-mockups.mjs`.
4. **Sound** — off by default (no autoplay). Cues are synthesized in
   `lib/sound.ts`; swap `playCue` internals for real samples when ready.

## Structure

```
app/                 layout (fonts, chrome), page (section composition), tokens
components/
  identity-card/     3D holographic hero card
  beyond/            cursor-reactive canvas globe
  work/              living project card (tilt, sheen, live-preview pan)
  sections/          Nav, Hero, Statement, Work, Beyond, Craft, Contact, Footer
  motion/            Lenis, custom cursor, magnetic button, grain, loader, reveal
lib/                 gsap setup, site content, sound manager
```

## Notes

- Design language: light cold-luxury, one cobalt accent, one radius system.
- The single dark section (Beyond) is a deliberate "step into another space"
  moment, not a theme flip.
- External image hosts are blocked in the build sandbox, so project previews
  are self-contained local SVGs by design.
