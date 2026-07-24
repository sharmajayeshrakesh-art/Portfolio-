"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { menu, menuNote, type MenuGroup } from "@/lib/aurum";
import Reveal from "./Reveal";
import Ornament from "./Ornament";

function LeafMark() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" className="text-aurum-gold" aria-hidden>
      <path d="M9 6 C6 1, 2 0.5, 0 1 C2 4, 5 5.5, 9 6 Z" fill="currentColor" opacity="0.9" />
      <path d="M9 6 C12 1, 16 0.5, 18 1 C16 4, 13 5.5, 9 6 Z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function Group({ group }: { group: MenuGroup }) {
  return (
    <div className="mb-8 break-inside-avoid">
      <div className="mb-3 flex items-center gap-3">
        <LeafMark />
        <h3 className="font-fraunces text-xl font-semibold text-aurum-green">{group.title}</h3>
      </div>
      <ul className="space-y-2.5">
        {group.items.map((it) => (
          <li key={it.name} className="flex items-baseline gap-2">
            <span className="font-nunito text-[15px] text-aurum-ink">{it.name}</span>
            <span className="mb-1 flex-1 border-b border-dotted border-aurum-ink/25" />
            {it.price && (
              <span className="font-fraunces text-[15px] font-semibold text-aurum-green">
                ₹{it.price}
              </span>
            )}
          </li>
        ))}
      </ul>
      {group.note && (
        <p className="mt-3 font-nunito text-xs italic text-aurum-ink-soft">{group.note}</p>
      )}
    </div>
  );
}

export default function Menu() {
  const [active, setActive] = useState(menu[0].id);
  const reduce = useReducedMotion();
  const tab = menu.find((t) => t.id === active) ?? menu[0];

  return (
    <section id="menu" className="relative overflow-hidden bg-aurum-green py-24 sm:py-32">
      {/* soft ambient glow */}
      <div
        className="pointer-events-none absolute right-[-10%] top-[-10%] h-[50vh] w-[50vh] rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, rgba(212,180,106,0.18), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-parisienne text-3xl text-aurum-gold-soft sm:text-4xl">taste the</p>
          <h2 className="mt-1 font-fraunces text-4xl font-semibold text-aurum-cream sm:text-5xl">
            <span className="aurum-gold-text">Menu</span>
          </h2>
          <Ornament className="mt-6" />
        </Reveal>

        {/* Tabs */}
        <Reveal className="mt-10 flex flex-wrap items-center justify-center gap-3" delay={0.1}>
          {menu.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={`rounded-full px-5 py-2.5 font-nunito text-sm font-semibold tracking-wide transition-all ${
                active === t.id
                  ? "bg-aurum-gold text-aurum-green-deep shadow-[0_10px_26px_-12px_rgba(200,160,77,0.9)]"
                  : "border border-aurum-gold-soft/30 text-aurum-cream/80 hover:border-aurum-gold-soft/70 hover:text-aurum-gold-soft"
              }`}
            >
              {t.label}
            </button>
          ))}
        </Reveal>

        {/* Menu card */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id}
              initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, filter: "blur(8px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="aurum-card mx-auto max-w-4xl rounded-[2rem] p-7 sm:p-10"
            >
              <p className="mb-6 text-center font-parisienne text-2xl text-aurum-green/80">
                {tab.blurb}
              </p>
              <div className="columns-1 gap-10 sm:columns-2">
                {tab.groups.map((g) => (
                  <Group key={g.title} group={g} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-8 text-center font-nunito text-xs uppercase tracking-[0.25em] text-aurum-cream/60">
          {menuNote}
        </p>
      </div>
    </section>
  );
}
