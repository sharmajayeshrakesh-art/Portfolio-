/**
 * Gold lotus ornament used as a section divider — echoes the logo's lotus.
 */
export default function Ornament({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-4 text-gold ${className}`}
      aria-hidden
    >
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60 sm:w-24" />
      <svg width="34" height="20" viewBox="0 0 60 34" fill="none" className="shrink-0">
        <path
          d="M30 4c2.5 5 2.5 12 0 18-2.5-6-2.5-13 0-18Z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M30 8c5 3 8 9 8 14-5-2-9-7-8-14ZM30 8c-5 3-8 9-8 14 5-2 9-7 8-14Z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path d="M8 22c8 4 36 4 44 0" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60 sm:w-24" />
    </div>
  );
}
