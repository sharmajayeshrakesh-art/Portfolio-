"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";
import { gallery } from "@/lib/bistrobrew";
import Reveal, { RevealItem } from "./Reveal";

/** The space — the ambience is the product. Arched masks, descending reveals. */
export default function TheSpace() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <section id="space" className="bg-bb-mint-soft/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-karla text-xs font-semibold uppercase tracking-[0.2em] text-bb-sage">Come sit a while</p>
          <h2 className="mt-3 font-bricolage text-3xl font-bold text-bb-ink sm:text-5xl">The space</h2>
        </Reveal>

        <Reveal className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6" stagger={0.1}>
          {gallery.map((g, i) => (
            <RevealItem key={g.src} className={i % 3 === 1 ? "sm:mt-8" : ""}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className="group block w-full text-left"
              >
                <div className="overflow-hidden bb-arch border border-bb-cane/25 bg-bb-white shadow-[0_18px_40px_-28px_rgba(46,33,24,0.45)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(g.src)}
                    alt={g.label}
                    loading="lazy"
                    decoding="async"
                    className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-72"
                  />
                </div>
                <p className="mt-2.5 font-karla text-sm text-bb-muted">{g.label}</p>
              </button>
            </RevealItem>
          ))}
        </Reveal>
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-bb-ink/80 p-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <button type="button" aria-label="Close" className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
              <X size={20} weight="bold" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(gallery[active].src)} alt={gallery[active].label} className="max-h-[85vh] max-w-full rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
