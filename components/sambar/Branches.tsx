"use client";

import { MapPin, Phone, Clock, NavigationArrow } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";
import { branches } from "@/lib/sambar";
import Reveal, { RevealItem } from "./Reveal";
import { KolamDivider } from "./Motifs";

export default function Branches() {
  return (
    <section id="branches" className="relative overflow-hidden bg-sambar-green-deep py-24 sm:py-32">
      <div
        className="pointer-events-none absolute left-[-8%] top-[6%] h-[46vh] w-[46vh] rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, rgba(200,160,77,0.16), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-playfair text-lg italic text-sambar-gold-soft">find your table</p>
          <h2 className="mt-1 font-playfair text-4xl font-bold text-sambar-cream sm:text-5xl">
            Our Locations
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-nunito text-sambar-cream/70">
            Four branches across Pune, each pure vegetarian and made fresh to order.
          </p>
          <KolamDivider className="mt-6" />
        </Reveal>

        <Reveal className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.12}>
          {branches.map((b) => (
            <RevealItem key={b.name} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-sambar-gold/20 bg-sambar-green/40">
                <div className="relative h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(b.img)}
                    alt={`Secret Sambar ${b.name} branch`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sambar-green-deep/70 to-transparent" />
                  {b.tag && (
                    <span className="absolute right-3 top-3 rounded-full bg-sambar-brick px-3 py-1 font-nunito text-[10px] font-bold uppercase tracking-wider text-sambar-cream">
                      {b.tag}
                    </span>
                  )}
                  <h3 className="absolute bottom-3 left-4 font-playfair text-2xl font-bold text-sambar-cream">
                    {b.name}
                  </h3>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <ul className="space-y-2.5 font-nunito text-sm text-sambar-cream/80">
                    <li className="flex items-start gap-2.5">
                      <MapPin size={16} weight="fill" className="mt-0.5 shrink-0 text-sambar-gold" />
                      {b.address}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Phone size={16} weight="fill" className="shrink-0 text-sambar-gold" />
                      {b.phone}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Clock size={16} weight="fill" className="shrink-0 text-sambar-gold" />
                      {b.timings}
                    </li>
                  </ul>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.mapsQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-sambar-gold/40 py-2.5 font-nunito text-sm font-semibold text-sambar-gold-soft transition-all hover:-translate-y-0.5 hover:border-sambar-gold hover:bg-sambar-gold/10"
                  >
                    <NavigationArrow size={15} weight="fill" />
                    Get Directions
                  </a>
                </div>
              </article>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
