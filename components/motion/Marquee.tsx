"use client";

/**
 * Single kinetic capabilities strip. Pure CSS transform loop (duplicated track
 * for seamlessness). The global reduced-motion rule freezes the animation, so
 * it degrades to a static readable row. Exactly one marquee on the page.
 */
const WORDS = [
  "Design",
  "Motion",
  "Real-time 3D",
  "Performance",
  "Accessibility",
  "Brand systems",
  "Interaction",
  "Conversion",
];

export default function Marquee() {
  const track = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center gap-10">
          <span className="font-display text-2xl font-medium tracking-tight text-ink-2 md:text-3xl">
            {w}
          </span>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden border-y border-line bg-surface/60 py-6">
      <div
        className="flex w-max"
        style={{ animation: "marquee 28s linear infinite" }}
      >
        {track}
        <div aria-hidden className="flex">
          {track}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
