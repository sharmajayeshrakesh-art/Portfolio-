"use client";

import { asset } from "@/lib/asset";
import { gallery } from "@/lib/aurum";
import Reveal from "./Reveal";
import Ornament from "./Ornament";

/** Editorial asymmetric grid — varied spans, soft blur-to-focus reveals. */
export default function Gallery() {
  return (
    <section id="gallery" className="relative overflow-hidden bg-aurum-cream-2 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-parisienne text-3xl text-aurum-gold sm:text-4xl">step inside</p>
          <h2 className="mt-1 font-fraunces text-4xl font-semibold text-aurum-ink sm:text-5xl">
            A flower-lit little world
          </h2>
          <Ornament className="mt-6" />
        </Reveal>

        <div className="mt-14 grid auto-rows-[220px] grid-cols-2 gap-4 sm:auto-rows-[260px] lg:grid-cols-4">
          {gallery.map((g, i) => (
            <Reveal
              key={g.src}
              delay={(i % 3) * 0.08}
              blur={16}
              y={28}
              className={`group relative overflow-hidden rounded-[1.5rem] ${
                g.span === "wide" ? "col-span-2" : ""
              } ${g.span === "tall" ? "row-span-2" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(g.src)}
                alt={g.label}
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-aurum-green-deep/75 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
              <div className="absolute inset-x-0 bottom-0 translate-y-1 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="font-fraunces text-sm font-medium text-aurum-cream">{g.label}</p>
              </div>
              {/* delicate gold inner frame */}
              <span className="pointer-events-none absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-aurum-gold/0 transition-all duration-500 group-hover:ring-aurum-gold/40" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
