"use client";

import { useEffect, useState } from "react";
import { WhatsappLogo, MapPin } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";
import { fitpro } from "@/lib/fitpro";
import Reveal from "./Reveal";

function useOpenNow() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    try {
      const now = new Date();
      const h = now.getHours() + now.getMinutes() / 60;
      const open = h >= 6 && h < 22;
      setLabel(open ? "Open now · until 10 PM" : "Closed now · opens 6 AM");
    } catch {
      setLabel(null);
    }
  }, []);
  return label;
}

export default function Hero() {
  const openLabel = useOpenNow();
  return (
    <section id="top" className="relative flex min-h-[92vh] items-end overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/fitpro/hero-ceiling.jpg")}
        alt="FITPRO's LED-line ceiling over the training floor"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-fp-black via-fp-black/55 to-fp-black/40" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8 sm:pb-24">
        <Reveal>
          <p className="mb-4 inline-flex items-center gap-2 font-mono-fp text-[11px] uppercase tracking-[0.22em] text-fp-blue">
            <MapPin size={13} weight="fill" />
            {fitpro.locality}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="max-w-3xl font-rajdhani text-4xl font-bold leading-[1.05] tracking-wide text-fp-warm sm:text-6xl">
            Train under the lights.
            <br />
            <span className="text-fp-lime">Precision over noise.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl font-inter text-base leading-relaxed text-fp-text/80 sm:text-lg">
            Two floors, imported machines, and trainers who actually watch your form, right in
            the heart of Hinjewadi Phase 1. Come find your rhythm.
          </p>
        </Reveal>

        <Reveal delay={0.16} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={fitpro.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="fp-cta inline-flex items-center justify-center gap-2 rounded-sm px-7 py-3.5 font-rajdhani text-base font-semibold"
          >
            <WhatsappLogo size={18} weight="fill" />
            Book a free trial
          </a>
          <a
            href="#plans"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/20 px-7 py-3.5 font-rajdhani text-base font-medium text-fp-text transition-colors hover:border-fp-blue hover:text-fp-blue"
          >
            See plans
          </a>
        </Reveal>

        <Reveal delay={0.22}>
          <p className="mt-6 flex items-center gap-2 font-mono-fp text-[11px] uppercase tracking-[0.2em] text-fp-muted">
            <span className="inline-block h-2 w-2 rounded-full bg-fp-lime" />
            {openLabel ?? fitpro.hoursLabel}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
