"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";
import { gallery } from "@/lib/fitpro";
import Reveal from "./Reveal";

export default function Space() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <section id="space" className="bg-fp-black py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="font-mono-fp text-[11px] uppercase tracking-[0.24em] text-fp-blue">The space</p>
          <h2 className="mt-3 font-rajdhani text-3xl font-bold tracking-wide text-fp-warm sm:text-5xl">
            Across both floors
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {gallery.map((g, i) => (
            <Reveal key={g.src} delay={(i % 3) * 0.05}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(g.src)}
                  alt={g.label}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-fp-blue/0 transition-all duration-300 group-hover:ring-fp-blue/60" />
                <span className="absolute bottom-2 left-3 font-mono-fp text-[10px] uppercase tracking-[0.14em] text-fp-warm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {g.label}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-fp-black/90 p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-fp-warm"
            >
              <X size={20} weight="bold" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(gallery[active].src)}
              alt={gallery[active].label}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
