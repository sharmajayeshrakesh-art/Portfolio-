"use client";

import { cafe } from "@/lib/cafe";
import Reveal from "./Reveal";
import Ornament from "./Ornament";
import {
  MapPin,
  Clock,
  Phone,
  InstagramLogo,
  ArrowUpRight,
  NavigationArrow,
} from "@phosphor-icons/react";

export default function Visit() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    cafe.mapsQuery
  )}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    cafe.mapsQuery
  )}`;

  return (
    <section id="visit" className="relative bg-cafe-ink py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <Ornament className="mb-12" />
          <p className="mb-4 font-mukta text-xs uppercase tracking-[0.28em] text-gold-2/80">
            Come sit with us
          </p>
          <h2 className="font-cormorant text-4xl font-semibold text-gold-2 sm:text-6xl">
            Visit us on FC Road
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* Details */}
          <Reveal className="flex flex-col gap-6">
            <Detail icon={<MapPin size={20} weight="fill" />} title="Address">
              {cafe.address}
            </Detail>
            <Detail icon={<Clock size={20} weight="fill" />} title="Timings">
              {cafe.timings}
            </Detail>
            <Detail icon={<Phone size={20} weight="fill" />} title="Call / WhatsApp">
              {cafe.phone}
            </Detail>
            <Detail icon={<InstagramLogo size={20} weight="fill" />} title="Instagram">
              {cafe.instagramHandle}
            </Detail>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-sm font-semibold text-cafe-black transition-transform hover:-translate-y-0.5"
              >
                <NavigationArrow size={16} weight="fill" />
                Get Directions
              </a>
              <a
                href={cafe.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/50 px-6 py-4 text-sm font-medium text-gold-2 transition-colors hover:bg-gold/10"
              >
                <InstagramLogo size={16} weight="fill" />
                Message us on Instagram
                <ArrowUpRight size={14} weight="bold" />
              </a>
            </div>
          </Reveal>

          {/* Map */}
          <Reveal delay={0.15}>
            <div className="h-full min-h-[340px] overflow-hidden rounded-2xl ring-1 ring-gold/20">
              <iframe
                title="Cafe Hari Rasa location map"
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[340px] w-full"
                style={{ border: 0, filter: "grayscale(0.3) contrast(1.05)" }}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Detail({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 border-b border-gold/12 pb-6">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/5 text-gold-2">
        {icon}
      </span>
      <div>
        <div className="font-mukta text-xs uppercase tracking-[0.2em] text-gold-2/70">
          {title}
        </div>
        <div className="mt-1.5 font-mukta text-[15px] leading-relaxed text-cream/85">
          {children}
        </div>
      </div>
    </div>
  );
}
