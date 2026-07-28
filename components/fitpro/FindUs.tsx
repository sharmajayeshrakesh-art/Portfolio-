"use client";

import { MapPin, Phone, WhatsappLogo, InstagramLogo, Clock, Buildings } from "@phosphor-icons/react";
import { fitpro } from "@/lib/fitpro";
import Reveal from "./Reveal";

export default function FindUs() {
  return (
    <section id="find-us" className="bg-fp-panel py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="font-mono-fp text-[11px] uppercase tracking-[0.24em] text-fp-blue">Find us</p>
          <h2 className="mt-3 font-rajdhani text-3xl font-bold tracking-wide text-fp-warm sm:text-5xl">
            Come train with us
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <Reveal className="space-y-6">
            <div className="flex items-start gap-4">
              <Buildings size={20} weight="fill" className="mt-0.5 shrink-0 text-fp-lime" />
              <div>
                <p className="font-mono-fp text-[10px] uppercase tracking-[0.2em] text-fp-blue">{fitpro.floors}</p>
                <p className="mt-1 font-inter text-[15px] leading-relaxed text-fp-text/85">{fitpro.address}</p>
                <p className="mt-2 font-inter text-sm text-fp-text/60">{fitpro.nearby}.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock size={20} weight="fill" className="mt-0.5 shrink-0 text-fp-lime" />
              <div>
                <p className="font-mono-fp text-[10px] uppercase tracking-[0.2em] text-fp-blue">Hours</p>
                <p className="mt-1 font-mono-fp text-sm text-fp-text/85">{fitpro.hoursLabel}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a href={`tel:${fitpro.phoneTel}`} className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-5 py-3 font-rajdhani text-sm font-medium text-fp-text transition-colors hover:border-fp-lime hover:text-fp-lime">
                <Phone size={16} weight="fill" />
                {fitpro.phoneDisplay}
              </a>
              <a href={fitpro.whatsapp} target="_blank" rel="noreferrer" className="fp-cta inline-flex items-center gap-2 rounded-sm px-5 py-3 font-rajdhani text-sm font-semibold">
                <WhatsappLogo size={16} weight="fill" />
                WhatsApp
              </a>
              <a href={fitpro.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-5 py-3 font-rajdhani text-sm font-medium text-fp-text transition-colors hover:border-fp-blue hover:text-fp-blue">
                <InstagramLogo size={16} weight="fill" />
                {fitpro.instagramHandle}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {fitpro.mapUrl ? (
              <div className="h-full min-h-[300px] overflow-hidden rounded-xl border border-white/10">
                <iframe title="FITPRO location" src={fitpro.mapUrl} className="h-full min-h-[300px] w-full" style={{ border: 0 }} loading="lazy" />
              </div>
            ) : (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fitpro.name + " " + fitpro.locality)}`}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full min-h-[280px] flex-col items-center justify-center rounded-xl border border-white/10 bg-fp-black p-8 text-center transition-colors hover:border-fp-lime/50"
              >
                <MapPin size={34} weight="fill" className="text-fp-lime" />
                <p className="mt-4 font-rajdhani text-xl font-semibold tracking-wide text-fp-warm">Open in Google Maps</p>
                <p className="mt-2 font-inter text-sm text-fp-text/60">{fitpro.locality}</p>
              </a>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
