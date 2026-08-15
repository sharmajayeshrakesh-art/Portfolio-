"use client";

/* Shared Independence Day tricolor motifs for the Key 2 Fitness site.
   Kept subtle so they unify every section without overwhelming the brand. */

import { useOfferLive } from "./useOfferLive";

export function Chakra({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden focusable="false">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="50" cy="50" r="7" fill="currentColor" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={i} x1="50" y1="50" x2="50" y2="6" stroke="currentColor" strokeWidth="1.6" transform={`rotate(${i * 15} 50 50)`} />
      ))}
    </svg>
  );
}

/* Three little tricolor bars used to flank section eyebrows */
export function TriTicks({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[3px] ${className}`} aria-hidden>
      <span className="block h-3 w-[3px] rounded-full bg-in-saffron" />
      <span className="block h-3 w-[3px] rounded-full bg-white/90" />
      <span className="block h-3 w-[3px] rounded-full bg-in-green-2" />
    </span>
  );
}

const TONE: Record<string, string> = {
  red: "text-k2-red",
  gold: "text-k2-gold",
};

/* Festive replacement for the plain section eyebrow label */
export function Eyebrow({
  children,
  tone = "red",
}: {
  children: React.ReactNode;
  tone?: "red" | "gold";
}) {
  const live = useOfferLive();
  return (
    <p className={`inline-flex items-center gap-3 font-anton text-sm uppercase tracking-[0.3em] ${TONE[tone]}`}>
      {live && <TriTicks />}
      <span>{children}</span>
      {live && <TriTicks className="-scale-x-100" />}
    </p>
  );
}

/* Tricolor divider with a slow-spinning chakra — sits between sections */
export function TirangaDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-in-saffron sm:w-28" />
      <Chakra className="k2-chakra-spin h-5 w-5 text-white/60" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-in-green-2 sm:w-28" />
    </div>
  );
}
