"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Discreet demo attribution — a glass chip pinned to the corner.
 * Warm gold hairline + gilded serif signature to match the cafe theme.
 */
export default function Watermark() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden={false}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-4 right-4 z-40 select-none"
    >
      <div className="cafe-watermark flex items-center gap-2 rounded-full px-3.5 py-1.5">
        <span className="cafe-watermark-dot" />
        <span className="text-[11px] tracking-[0.14em] uppercase text-cream-dim/80">
          Demo site by
        </span>
        <span className="font-cormorant text-[15px] leading-none italic cafe-watermark-name">
          Jayesh
        </span>
      </div>
    </motion.div>
  );
}
