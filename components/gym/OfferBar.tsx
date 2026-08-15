"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { useReducedMotion } from "motion/react";
import { useOfferLive } from "./useOfferLive";

/* Small Ashoka Chakra used as a separator between marquee items */
function Chakra({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden focusable="false">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="50" cy="50" r="8" fill="currentColor" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={i} x1="50" y1="50" x2="50" y2="6" stroke="currentColor" strokeWidth="2" transform={`rotate(${i * 15} 50 50)`} />
      ))}
    </svg>
  );
}

const ITEMS = [
  { text: "Independence Day Offer", tone: "saffron" },
  { text: "1 Week Trial @ ₹499", tone: "white" },
  { text: "Memberships from ₹3,999", tone: "white" },
  { text: "Valid till 20th August only", tone: "green" },
  { text: "Tap to grab the offer", tone: "saffron" },
];

const toneClass: Record<string, string> = {
  saffron: "text-in-saffron",
  green: "text-in-green-2",
  white: "text-white",
};

function Sequence() {
  return (
    <span className="flex shrink-0 items-center gap-5 pr-5">
      {ITEMS.map((it, i) => (
        <span key={i} className="flex items-center gap-5">
          <span className={`font-anton text-[11px] uppercase tracking-[0.16em] sm:text-xs ${toneClass[it.tone]}`}>
            {it.text}
          </span>
          <Chakra className="k2-chakra-spin h-3.5 w-3.5 shrink-0 text-in-chakra sm:h-4 sm:w-4" />
        </span>
      ))}
    </span>
  );
}

export default function OfferBar() {
  const reduce = useReducedMotion();
  const live = useOfferLive();
  if (!live) return null;
  return (
    <a
      href="#plans"
      aria-label="Independence Day offer — 1 week trial at ₹499, valid till 20th August. Tap to view plans."
      className="k2-offerbar fixed inset-x-0 top-0 z-[60] flex h-9 items-center overflow-hidden sm:h-10"
    >
      {reduce ? (
        <div className="mx-auto flex items-center gap-3 px-4">
          <Chakra className="h-4 w-4 shrink-0 text-in-chakra" />
          <span className="font-anton text-[11px] uppercase tracking-[0.16em] text-white sm:text-xs">
            <span className="text-in-saffron">Independence Day Offer</span> · 1 Week Trial @ ₹499 ·{" "}
            <span className="text-in-green-2">till 20th Aug</span>
          </span>
          <ArrowRight size={13} weight="bold" className="shrink-0 text-in-saffron" />
        </div>
      ) : (
        <div className="k2-marquee flex whitespace-nowrap will-change-transform">
          <Sequence />
          <Sequence />
        </div>
      )}
      <span className="k2-tiranga-bar absolute inset-x-0 bottom-0 !h-[3px]" />
    </a>
  );
}
