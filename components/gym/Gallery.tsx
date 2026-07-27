"use client";

import { asset } from "@/lib/asset";
import { gallery } from "@/lib/gym";
import Reveal from "./Reveal";

export default function Gallery() {
  return (
    <section id="gallery" className="relative overflow-hidden bg-k2-black py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-anton text-sm uppercase tracking-[0.3em] text-k2-red">The Floor</p>
          <h2 className="mt-3 font-anton text-4xl uppercase leading-none text-white sm:text-6xl">
            Inside <span className="k2-fire-text">K2</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {gallery.map((g, i) => (
            <Reveal
              key={g.src}
              delay={(i % 3) * 0.06}
              from={i % 2 ? "right" : "left"}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(g.src)}
                alt={g.label}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-k2-black/85 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-anton text-sm uppercase tracking-wide text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {g.label}
                </p>
              </div>
              <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-inset ring-k2-red/0 transition-all duration-300 group-hover:ring-k2-red/70" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
