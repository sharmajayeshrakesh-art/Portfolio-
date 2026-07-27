"use client";

import { motion, useReducedMotion } from "motion/react";

/** Discreet demo attribution — dark chip pinned bottom-right. */
export default function Watermark() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 1.2, ease: [0.2, 0.9, 0.2, 1] }}
      className="fixed bottom-5 right-4 z-40 select-none"
    >
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-k2-charcoal/95 px-3.5 py-1.5">
        <span className="h-[5px] w-[5px] rounded-full bg-k2-red" style={{ boxShadow: "0 0 8px rgba(224,30,38,0.9)" }} />
        <span className="font-nunito text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
          Demo site by
        </span>
        <span className="font-anton text-sm uppercase k2-fire-text">Jayesh</span>
      </div>
    </motion.div>
  );
}
