"use client";

import { asset } from "@/lib/asset";
import { classes } from "@/lib/fitpro";
import Reveal from "./Reveal";

export default function Classes() {
  return (
    <section id="classes" className="bg-fp-sand py-20 text-fp-ink sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="font-mono-fp text-[11px] uppercase tracking-[0.24em] text-fp-blue">What's on</p>
          <h2 className="mt-3 font-rajdhani text-3xl font-bold tracking-wide sm:text-5xl">
            Classes &amp; floors
          </h2>
        </Reveal>

        <Reveal className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5">
          {classes.map((c) => (
            <div
              key={c.name}
              className="group w-[78%] shrink-0 snap-start overflow-hidden rounded-lg bg-white shadow-[0_20px_40px_-28px_rgba(0,0,0,0.5)] sm:w-auto"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(c.img)}
                  alt={c.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-rajdhani text-lg font-bold tracking-wide">{c.name}</h3>
                <p className="mt-1 font-inter text-xs leading-relaxed text-fp-ink/60">{c.blurb}</p>
                <p className="mt-3 font-mono-fp text-[10px] uppercase tracking-[0.18em] text-fp-blue">
                  {c.schedule ?? "Timings on WhatsApp"}
                </p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
