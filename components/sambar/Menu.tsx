"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { menu, sambar } from "@/lib/sambar";
import Reveal from "./Reveal";
import { KolamDivider, Gopuram, BananaLeaf } from "./Motifs";

export default function Menu() {
  const [active, setActive] = useState(menu[0].id);
  const reduce = useReducedMotion();
  const tab = menu.find((t) => t.id === active) ?? menu[0];

  const list = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  };
  const item = {
    hidden: reduce ? {} : { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <section id="menu" className="relative overflow-hidden bg-sambar-green py-24 sm:py-32">
      <div
        className="pointer-events-none absolute right-[-8%] top-[8%] h-[46vh] w-[46vh] rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, rgba(200,160,77,0.18), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-playfair text-lg italic text-sambar-gold-soft">served with tradition</p>
          <h2 className="mt-1 font-playfair text-4xl font-bold sm:text-5xl">
            <span className="sambar-gold-text">The Menu</span>
          </h2>
          <KolamDivider className="mt-6" />
        </Reveal>

        {/* Tabs */}
        <Reveal className="mt-9 flex flex-wrap items-center justify-center gap-2.5" delay={0.1}>
          {menu.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={`rounded-full px-4 py-2 font-nunito text-sm font-semibold tracking-wide transition-all ${
                active === t.id
                  ? "bg-sambar-gold text-sambar-green-deep shadow-[0_10px_26px_-12px_rgba(200,160,77,0.9)]"
                  : "border border-sambar-gold-soft/30 text-sambar-cream/80 hover:border-sambar-gold-soft/70 hover:text-sambar-gold-soft"
              }`}
            >
              {t.label}
            </button>
          ))}
        </Reveal>

        {/* Parchment menu card */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="sambar-card relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] p-7 sm:p-12"
            >
              {/* faint gopuram watermark */}
              <Gopuram className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-auto -translate-x-1/2 -translate-y-1/2 text-sambar-green/[0.06]" />
              {/* banana-leaf corner accents */}
              <BananaLeaf className="pointer-events-none absolute -left-3 bottom-2 h-28 w-12 text-sambar-green-2/20" />
              <BananaLeaf className="pointer-events-none absolute -right-3 bottom-2 h-28 w-12 -scale-x-100 text-sambar-green-2/20" />

              <div className="relative text-center">
                <h3 className="font-playfair text-2xl font-bold text-sambar-green sm:text-3xl">{tab.label}</h3>
                <p className="mt-1 font-playfair text-base italic text-sambar-ink-soft">{tab.blurb}</p>
              </div>

              <motion.ul
                variants={list}
                initial={reduce ? undefined : "hidden"}
                animate="show"
                className="relative mt-8 columns-1 gap-x-12 sm:columns-2"
              >
                {tab.items.map((it) => (
                  <motion.li
                    key={it.name}
                    variants={item}
                    className="mb-3.5 flex items-baseline gap-2 break-inside-avoid"
                  >
                    <span className="font-nunito text-[15px] text-sambar-ink">{it.name}</span>
                    <span className="mb-1 flex-1 border-b border-dotted border-sambar-ink/25" />
                    <span className="font-playfair text-[15px] font-bold text-sambar-brick">₹{it.price}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <p className="relative mt-8 text-center font-nunito text-xs italic text-sambar-ink-soft">
                {sambar.prepNote}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-8 text-center font-nunito text-xs uppercase tracking-[0.22em] text-sambar-cream/60">
          {sambar.gstNote}
        </p>
      </div>
    </section>
  );
}
