"use client";

import { useEffect, useState } from "react";
import { NavigationArrow, WhatsappLogo, MapPin } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";
import { bistro } from "@/lib/bistrobrew";
import Reveal from "./Reveal";
import CaneLamps from "./CaneLamps";

function useOpenLabel() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    try {
      const h = new Date().getHours() + new Date().getMinutes() / 60;
      setLabel(h < 12 ? "Opens at 12 PM today" : "Open now · from 12 PM");
    } catch {
      setLabel(null);
    }
  }, []);
  return label;
}

export default function Hero() {
  const openLabel = useOpenLabel();
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bistro.mapsQuery)}`;
  return (
    <section id="top" className="relative overflow-hidden pt-44 pb-16 sm:pt-52 sm:pb-20">
      {/* The permanent cane lamps — the intro's lamps come to rest here */}
      <CaneLamps />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 font-karla text-xs font-semibold uppercase tracking-[0.18em] text-bb-sage">
              <MapPin size={13} weight="fill" />
              {bistro.landmark}
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-4 font-bricolage text-5xl font-extrabold leading-[1.02] text-bb-ink sm:text-6xl">
              Bistro Brew
            </h1>
            <p className="mt-1 font-mukta text-xl text-bb-muted">{bistro.nameDevanagari}</p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-md font-karla text-lg leading-relaxed text-bb-ink/80">
              A sunny little corner under a ceiling of woven cane lamps. Good coffee, easy food,
              and the kind of afternoon you don't want to end.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={directions} target="_blank" rel="noreferrer" className="bb-cta inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-karla text-base font-semibold">
              <NavigationArrow size={17} weight="fill" />
              Directions
            </a>
            <a href={bistro.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-bb-cane/50 px-7 py-3.5 font-karla text-base font-medium text-bb-ink transition-colors hover:border-bb-terracotta hover:text-bb-terracotta">
              <WhatsappLogo size={17} weight="fill" />
              WhatsApp
            </a>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="mt-6 inline-flex items-center gap-2 font-karla text-sm text-bb-muted">
              <span className="inline-block h-2 w-2 rounded-full bg-bb-sage" />
              {openLabel ?? bistro.hoursLabel}
            </p>
          </Reveal>
        </div>

        {/* Hero image in an arched mask */}
        <Reveal delay={0.1} y={30}>
          <div className="relative">
            <div className="bb-glow absolute -inset-6 -z-10" aria-hidden />
            <div className="overflow-hidden bb-arch-lg border border-bb-cane/30 shadow-[0_30px_60px_-30px_rgba(46,33,24,0.4)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset("/bistro/hero-outdoor.jpg")}
                alt="Bistro Brew's turf seating with palms and cane lamps"
                className="h-[360px] w-full object-cover sm:h-[460px]"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
