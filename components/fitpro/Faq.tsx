"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "@phosphor-icons/react";
import { faq } from "@/lib/fitpro";
import Reveal from "./Reveal";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-fp-black py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p className="font-mono-fp text-[11px] uppercase tracking-[0.24em] text-fp-blue">Good to know</p>
          <h2 className="mt-3 font-rajdhani text-3xl font-bold tracking-wide text-fp-warm sm:text-5xl">
            Questions, answered
          </h2>
        </Reveal>

        <Reveal className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-rajdhani text-lg font-medium tracking-wide text-fp-warm">{item.q}</span>
                  <Plus
                    size={20}
                    weight="bold"
                    className={`shrink-0 text-fp-blue transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 font-inter text-sm leading-relaxed text-fp-text/70">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
