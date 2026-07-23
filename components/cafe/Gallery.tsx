"use client";

import { asset } from "@/lib/asset";
import { gallery } from "@/lib/cafe";
import Reveal from "./Reveal";

export default function Gallery() {
  return (
    <section id="gallery" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mb-14 text-center">
          <p className="mb-4 font-mukta text-xs uppercase tracking-[0.28em] text-gold-2/80">
            Step inside
          </p>
          <h2 className="font-cormorant text-4xl font-semibold text-gold-2 sm:text-6xl">
            A room made for lingering
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-mukta text-[15px] text-cream/70">
            Hand-laid tiles, temple gold, and warm light. Every corner asks to
            be photographed.
          </p>
        </Reveal>

        <div className="columns-2 gap-4 md:columns-3 md:gap-5 [&>*]:mb-4 md:[&>*]:mb-5">
          {gallery.map((g, i) => (
            <Reveal key={g.src} delay={(i % 3) * 0.08} className="break-inside-avoid">
              <figure className="group relative overflow-hidden rounded-xl ring-1 ring-gold/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(g.src)}
                  alt={g.label}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                    g.tall ? "aspect-[3/4]" : "aspect-square"
                  }`}
                />
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-cafe-black/85 to-transparent p-4 font-mukta text-xs tracking-wide text-cream/85 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {g.label}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
