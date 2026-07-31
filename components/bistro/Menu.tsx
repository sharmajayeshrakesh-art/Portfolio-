"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { menu, menuNote, type MenuItem } from "@/lib/bistrobrew";
import Reveal from "./Reveal";

function VegDot({ veg }: { veg: boolean }) {
  const c = veg ? "#5E8A57" : "#9C4A21";
  return (
    <span
      className="mt-1.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border"
      style={{ borderColor: c }}
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
    </span>
  );
}

function Row({ it }: { it: MenuItem }) {
  return (
    <li className="flex items-baseline gap-2.5 py-1.5">
      <VegDot veg={it.veg} />
      <span className="font-karla text-[15px] text-bb-ink">{it.name}</span>
      <span className="mb-1 flex-1 border-b border-dotted border-bb-cane/40" />
      {it.price != null && (
        <span className="font-karla text-[15px] font-semibold text-bb-terracotta">₹{it.price}</span>
      )}
    </li>
  );
}

export default function Menu() {
  const [active, setActive] = useState(menu[0].id);
  const reduce = useReducedMotion();
  const tab = menu.find((t) => t.id === active) ?? menu[0];

  return (
    <section id="menu" className="py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-karla text-xs font-semibold uppercase tracking-[0.2em] text-bb-sage">On the menu</p>
          <h2 className="mt-3 font-bricolage text-3xl font-bold text-bb-ink sm:text-5xl">Everything, honestly priced</h2>
        </Reveal>

        {/* Tabs */}
        <Reveal className="mt-9 flex flex-wrap justify-center gap-2.5" delay={0.05}>
          {menu.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={`rounded-full px-4 py-2 font-karla text-sm font-semibold transition-colors ${
                active === t.id ? "bb-cta" : "border border-bb-cane/40 text-bb-ink/70 hover:border-bb-terracotta hover:text-bb-terracotta"
              }`}
            >
              {t.label}
            </button>
          ))}
        </Reveal>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id}
              initial={reduce ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-bb-cane/25 bg-bb-white p-6 shadow-[0_20px_50px_-34px_rgba(46,33,24,0.4)] sm:p-9"
            >
              {tab.groups.map((g) => (
                <div key={g.title} className="mb-7 last:mb-0">
                  <h3 className="mb-2 font-bricolage text-lg font-bold text-bb-sage">{g.title}</h3>
                  <ul className="sm:columns-2 sm:gap-x-10">
                    {g.items.map((it) => (
                      <div key={it.name} className="break-inside-avoid">
                        <Row it={it} />
                      </div>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-center gap-5 font-karla text-xs text-bb-muted">
          <span className="inline-flex items-center gap-1.5">
            <VegDot veg /> Veg
          </span>
          <span className="inline-flex items-center gap-1.5">
            <VegDot veg={false} /> Non-veg
          </span>
        </div>
        <p className="mt-3 text-center font-karla text-xs text-bb-muted">{menuNote}</p>
      </div>
    </section>
  );
}
