"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import JayeshCard from "@/components/JayeshCard";

/** Discreet, permanent demo attribution. Opens the About-Jayesh card. */
export default function Watermark() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-16 right-4 z-40 md:bottom-4"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-fp-lime/30 bg-fp-panel/95 px-3.5 py-1.5 backdrop-blur-sm transition-colors hover:border-fp-lime/60"
        >
          <span className="h-[5px] w-[5px] rounded-full bg-fp-lime" style={{ boxShadow: "0 0 8px rgba(216,255,46,0.9)" }} />
          <span className="font-mono-fp text-[10px] uppercase tracking-[0.16em] text-fp-text/70">Demo by</span>
          <span className="font-rajdhani text-sm font-bold tracking-wide text-fp-lime">Jayesh</span>
        </button>
      </motion.div>
      <JayeshCard open={open} onClose={() => setOpen(false)} />
    </>
  );
}
