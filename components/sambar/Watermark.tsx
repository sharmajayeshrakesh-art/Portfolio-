"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import JayeshCard from "@/components/JayeshCard";

/** Discreet demo attribution — gold-on-green glass chip. Opens an About card. */
export default function Watermark() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-4 right-4 z-40 select-none"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="sambar-watermark flex items-center gap-2 rounded-full px-3.5 py-1.5"
        >
          <span
            className="h-[5px] w-[5px] rounded-full"
            style={{ background: "var(--color-sambar-gold-2)", boxShadow: "0 0 8px rgba(216,185,104,0.8)" }}
          />
          <span className="font-nunito text-[10px] font-semibold uppercase tracking-[0.16em] text-sambar-cream/75">
            Demo site by
          </span>
          <span className="font-playfair text-sm font-bold italic sambar-gold-text">Jayesh</span>
        </button>
      </motion.div>
      <JayeshCard open={open} onClose={() => setOpen(false)} />
    </>
  );
}
