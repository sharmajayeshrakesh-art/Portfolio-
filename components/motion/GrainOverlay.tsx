"use client";

/**
 * Fixed, pointer-events-none grain. Lives on ONE fixed layer so it never
 * repaints scrolling containers (mobile-FPS safe). SVG turbulence, no image.
 */
const GRAIN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.42'/></svg>`
  );

export default function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] mix-blend-multiply"
      style={{
        backgroundImage: `url("${GRAIN}")`,
        backgroundSize: "140px 140px",
        opacity: 0.06,
      }}
    />
  );
}
