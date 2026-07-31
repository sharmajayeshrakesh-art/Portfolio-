"use client";

import { MapPin, Clock, Phone, WhatsappLogo, NavigationArrow } from "@phosphor-icons/react";
import { bistro } from "@/lib/bistrobrew";
import Reveal from "./Reveal";

export default function FindUs() {
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bistro.mapsQuery)}`;
  return (
    <section id="find-us" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-karla text-xs font-semibold uppercase tracking-[0.2em] text-bb-sage">Come say hi</p>
          <h2 className="mt-3 font-bricolage text-3xl font-bold text-bb-ink sm:text-5xl">Find us</h2>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <Reveal className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin size={20} weight="fill" className="mt-0.5 shrink-0 text-bb-terracotta" />
              <div>
                <p className="font-karla text-xs font-semibold uppercase tracking-[0.16em] text-bb-sage">Inside {bistro.landmark.split(",")[0]}</p>
                <p className="mt-1 font-karla text-[15px] leading-relaxed text-bb-ink/85">{bistro.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock size={20} weight="fill" className="mt-0.5 shrink-0 text-bb-terracotta" />
              <div>
                <p className="font-karla text-xs font-semibold uppercase tracking-[0.16em] text-bb-sage">Hours</p>
                <p className="mt-1 font-karla text-[15px] text-bb-ink/85">{bistro.hoursLabel}</p>
                <p className="mt-0.5 font-karla text-xs text-bb-muted">Full weekly hours on WhatsApp.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <a href={directions} target="_blank" rel="noreferrer" className="bb-cta inline-flex items-center gap-2 rounded-full px-5 py-3 font-karla text-sm font-semibold">
                <NavigationArrow size={16} weight="fill" />
                Directions
              </a>
              <a href={bistro.whatsapp} target="_blank" rel="noreferrer" className="bb-wa inline-flex items-center gap-2 rounded-full px-5 py-3 font-karla text-sm font-semibold">
                <WhatsappLogo size={16} weight="fill" />
                WhatsApp
              </a>
              <a href={`tel:${bistro.phoneTel}`} className="inline-flex items-center gap-2 rounded-full border border-bb-cane/50 px-5 py-3 font-karla text-sm font-medium text-bb-ink transition-colors hover:border-bb-terracotta hover:text-bb-terracotta">
                <Phone size={16} weight="fill" />
                {bistro.phoneDisplay}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            {bistro.mapUrl ? (
              <div className="h-full min-h-[280px] overflow-hidden rounded-3xl border border-bb-cane/25">
                <iframe title="Bistro Brew location" src={bistro.mapUrl} className="h-full min-h-[280px] w-full" style={{ border: 0 }} loading="lazy" />
              </div>
            ) : (
              <a href={directions} target="_blank" rel="noreferrer" className="group flex h-full min-h-[260px] flex-col items-center justify-center rounded-3xl border border-bb-cane/25 bg-bb-mint-soft/40 p-8 text-center transition-colors hover:border-bb-terracotta/50">
                <MapPin size={34} weight="fill" className="text-bb-terracotta" />
                <p className="mt-4 font-bricolage text-xl font-bold text-bb-ink">Open in Google Maps</p>
                <p className="mt-2 font-karla text-sm text-bb-muted">{bistro.landmark}</p>
              </a>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
