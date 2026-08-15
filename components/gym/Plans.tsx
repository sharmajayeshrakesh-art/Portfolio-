"use client";

import { WhatsappLogo, Check } from "@phosphor-icons/react";
import { plans, whyJoin, offer, gym } from "@/lib/gym";
import Reveal, { RevealItem } from "./Reveal";
import TiltCard from "./TiltCard";

/* Ashoka Chakra — 24 spokes, drawn inline so it stays crisp at any size */
function Chakra({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden focusable="false">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="50" cy="50" r="7" fill="currentColor" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="50"
          x2="50"
          y2="6"
          stroke="currentColor"
          strokeWidth="1.5"
          transform={`rotate(${i * 15} 50 50)`}
        />
      ))}
    </svg>
  );
}

export default function Plans() {
  return (
    <section id="plans" className="k2-inday relative overflow-hidden py-20 sm:py-28">
      <div className="k2-tiranga-bar absolute inset-x-0 top-0" />
      <div className="k2-tiranga-bar absolute inset-x-0 bottom-0" />
      {/* giant chakra watermark drifting behind the content */}
      <Chakra className="k2-chakra-spin pointer-events-none absolute -right-20 top-8 h-72 w-72 text-white opacity-[0.05] sm:h-96 sm:w-96" />
      <Chakra className="k2-chakra-spin pointer-events-none absolute -left-24 bottom-4 hidden h-72 w-72 text-white opacity-[0.04] lg:block" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* ---- Festive Independence Day banner ---- */}
        <Reveal className="text-center">
          <span className="k2-flag-badge k2-shimmer inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-anton text-xs uppercase tracking-[0.22em] text-k2-black shadow-lg">
            Limited Time Offer
          </span>

          <h2 className="mt-6 font-anton text-5xl uppercase leading-[0.92] text-white sm:text-7xl">
            <span className="k2-tiranga-text">15<sup className="text-3xl sm:text-5xl">th</sup> August</span>
          </h2>
          <p className="mt-3 font-anton text-2xl uppercase tracking-wide text-white sm:text-3xl">
            Freedom to <span className="text-in-saffron">transform</span>
          </p>
          <p className="mx-auto mt-4 max-w-xl font-nunito text-k2-fog">{offer.pledge}</p>

          {/* valid-till chip with a spinning chakra */}
          <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5">
            <Chakra className="k2-chakra-spin h-6 w-6 text-in-chakra" />
            <span className="font-anton text-sm uppercase tracking-[0.15em] text-white sm:text-base">
              {offer.validTill}
            </span>
          </div>
        </Reveal>

        {/* ---- Plan cards ---- */}
        <Reveal className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch" stagger={0.1}>
          {plans.map((p) => (
            <RevealItem key={p.months} className="h-full">
              <TiltCard
                className={`relative flex h-full flex-col rounded-xl border p-7 ${
                  p.trial
                    ? "border-in-saffron/60 bg-gradient-to-b from-k2-charcoal-2 to-k2-charcoal"
                    : p.popular
                      ? "border-k2-red bg-gradient-to-b from-k2-charcoal-2 to-k2-charcoal lg:scale-[1.04]"
                      : "border-white/10 bg-k2-charcoal-2"
                }`}
              >
                {p.tag && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm px-3 py-1 font-anton text-[11px] uppercase tracking-wider ${
                      p.popular ? "bg-k2-red text-white" : "bg-k2-gold text-k2-black"
                    }`}
                  >
                    {p.tag}
                  </span>
                )}
                <h3 className={`font-anton text-2xl uppercase ${p.trial ? "text-in-saffron" : "text-white"}`}>
                  {p.months}
                </h3>
                <p className="mt-1 font-nunito text-[11px] uppercase tracking-[0.18em] text-k2-smoke">
                  {p.trial ? "At just" : "For only"}
                </p>
                <div className="mt-3 flex items-end gap-1">
                  <span className={`font-anton text-5xl ${p.trial ? "text-white" : "text-k2-gold"}`}>
                    ₹{p.price}
                  </span>
                </div>
                <p className="mt-3 flex-1 font-nunito text-sm leading-snug text-k2-fog">{p.note}</p>
                <a
                  href={gym.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-7 inline-flex items-center justify-center gap-2 rounded-sm py-3.5 font-anton text-sm uppercase tracking-wide transition-all hover:-translate-y-0.5 ${
                    p.trial
                      ? "bg-in-saffron text-k2-black hover:brightness-110"
                      : p.popular
                        ? "bg-k2-red text-white k2-glow"
                        : "bg-white/10 text-white hover:bg-k2-red"
                  }`}
                >
                  <WhatsappLogo size={16} weight="fill" />
                  {p.trial ? "Start Trial" : "Join Now"}
                </a>
              </TiltCard>
            </RevealItem>
          ))}
        </Reveal>

        {/* ---- Why join + motto (from the flyer) ---- */}
        <Reveal className="mt-12 rounded-xl border border-white/10 bg-k2-charcoal-2/80 p-7 sm:p-9" from="up">
          <h3 className="font-anton text-xl uppercase text-white">
            Why join <span className="k2-fire-text">Key 2 Fitness</span>?
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {whyJoin.map((w) => (
              <div key={w} className="flex items-center gap-2.5 font-nunito text-sm text-k2-fog">
                <Check size={18} weight="bold" className="shrink-0 text-in-green-2" />
                {w}
              </div>
            ))}
          </div>
          <p className="mt-7 border-t border-white/10 pt-6 text-center font-anton text-lg uppercase tracking-wide sm:text-2xl">
            <span className="k2-tiranga-text">{offer.motto}</span>
          </p>
        </Reveal>

        <p className="mt-6 text-center font-nunito text-xs uppercase tracking-[0.2em] text-k2-smoke">
          Prices subject to change · Contact for current offers
        </p>
      </div>
    </section>
  );
}
