import type { CSSProperties } from "react";

/** Decorative South-Indian heritage motifs. All purely ornamental (aria-hidden). */

export function KolamDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-sambar-gold/60 sm:w-28" />
      <svg width="54" height="24" viewBox="0 0 54 24" fill="none" className="text-sambar-gold">
        {/* kolam-style lotus dot */}
        <circle cx="27" cy="12" r="3" fill="currentColor" />
        <path
          d="M27 3 C31 8, 31 16, 27 21 C23 16, 23 8, 27 3 Z"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.8"
        />
        <path
          d="M18 12 C23 8, 31 8, 36 12 C31 16, 23 16, 18 12 Z"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.8"
        />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" />
        <circle cx="42" cy="12" r="1.4" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-sambar-gold/60 sm:w-28" />
    </div>
  );
}

export function BananaLeaf({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 120 300" className={className} style={style} fill="none" aria-hidden>
      <path
        d="M60 6 C18 70, 8 190, 46 292 C50 296, 54 296, 56 290 C30 190, 40 84, 62 20 C64 12, 62 6, 60 6 Z"
        fill="currentColor"
      />
      <path d="M58 24 C40 100, 44 200, 52 286" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
      {[...Array(9)].map((_, i) => (
        <path
          key={i}
          d={`M55 ${60 + i * 24} C40 ${66 + i * 24}, 30 ${74 + i * 24}, 22 ${84 + i * 24}`}
          stroke="rgba(0,0,0,0.12)"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

export function Marigold({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const petals = 12;
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <g>
        {[...Array(petals)].map((_, i) => (
          <ellipse
            key={`o${i}`}
            cx="50"
            cy="18"
            rx="7"
            ry="15"
            fill="currentColor"
            opacity="0.9"
            transform={`rotate(${(360 / petals) * i} 50 50)`}
          />
        ))}
        {[...Array(petals)].map((_, i) => (
          <ellipse
            key={`i${i}`}
            cx="50"
            cy="28"
            rx="6"
            ry="11"
            fill="currentColor"
            opacity="0.65"
            transform={`rotate(${(360 / petals) * i + 15} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="9" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Line-art gopuram (temple tower) — used as a faint watermark behind the menu. */
export function Gopuram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 240" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.5">
        {[0, 1, 2, 3, 4].map((i) => {
          const w = 150 - i * 24;
          const x = (200 - w) / 2;
          const y = 190 - i * 34;
          return <rect key={i} x={x} y={y} width={w} height={26} rx="2" />;
        })}
        {[0, 1, 2, 3, 4].map((i) => {
          const w = 150 - i * 24;
          const x = (200 - w) / 2;
          const y = 190 - i * 34;
          return (
            <path key={`k${i}`} d={`M${x} ${y} L100 ${y - 12} L${x + w} ${y}`} />
          );
        })}
        <path d="M100 30 L88 54 L112 54 Z" />
        <line x1="100" y1="18" x2="100" y2="30" />
        <rect x="86" y="200" width="28" height="30" />
      </g>
    </svg>
  );
}
