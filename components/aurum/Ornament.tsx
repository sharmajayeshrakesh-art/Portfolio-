/**
 * Delicate gold botanical line divider — a leaf-and-stem motif that echoes the
 * lotus emblem. Purely decorative.
 */
export default function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-aurum-gold/60 sm:w-24" />
      <svg
        width="46"
        height="20"
        viewBox="0 0 46 20"
        fill="none"
        className="text-aurum-gold"
      >
        {/* central stem */}
        <path d="M4 10 H42" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        {/* leaves */}
        <path
          d="M23 10 C 20 4, 15 3, 12 4 C 15 7, 19 9, 23 10 Z"
          fill="currentColor"
          opacity="0.85"
        />
        <path
          d="M23 10 C 26 4, 31 3, 34 4 C 31 7, 27 9, 23 10 Z"
          fill="currentColor"
          opacity="0.85"
        />
        {/* seed dot */}
        <circle cx="23" cy="10" r="1.6" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-aurum-gold/60 sm:w-24" />
    </div>
  );
}
