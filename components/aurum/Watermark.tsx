"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Discreet demo attribution — a warm glass chip pinned to the corner.
 * Gold hairline + gilded script signature to match the Aurum theme.
 */
export default function Watermark() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-4 right-4 z-40 select-none"
    >
      <div className="aurum-watermark flex items-center gap-2 rounded-full px-3.5 py-1.5">
        <span
          className="h-[5px] w-[5px] rounded-full"
          style={{ background: "var(--color-aurum-gold-2)", boxShadow: "0 0 8px rgba(212,180,106,0.8)" }}
        />
        <span className="font-nunito text-[10px] font-semibold uppercase tracking-[0.16em] text-aurum-cream/75">
          Demo site by
        </span>
        <span className="font-parisienne text-lg leading-none aurum-gold-text">Jayesh</span>
      </div>
    </motion.div>
  );
}
