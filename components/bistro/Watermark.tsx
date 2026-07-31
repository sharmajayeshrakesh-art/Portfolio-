"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import JayeshCard from "@/components/JayeshCard";

/** Discreet demo attribution. Sits above the mobile bottom bar. Opens About card. */
export default function Watermark() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-16 right-4 z-40 md:bottom-4"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-bb-cane/40 bg-bb-white/95 px-3.5 py-1.5 shadow-sm backdrop-blur-sm transition-colors hover:border-bb-terracotta/60"
        >
          <span className="h-[5px] w-[5px] rounded-full bg-bb-terracotta" />
          <span className="font-karla text-[10px] font-semibold uppercase tracking-[0.16em] text-bb-muted">Demo by</span>
          <span className="font-bricolage text-sm font-bold text-bb-terracotta">Jayesh</span>
        </button>
      </motion.div>
      <JayeshCard open={open} onClose={() => setOpen(false)} />
    </>
  );
}
