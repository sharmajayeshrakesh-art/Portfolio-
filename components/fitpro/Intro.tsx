"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { asset } from "@/lib/asset";

/**
 * One-time opening: two LED lines draw across the centre, then the FITPRO logo
 * "powers on" (a quick brightness step, the light-switch motif) and hands off
 * to the cover screen below by fading out.
 *
 * Safety: the real site is always in the DOM beneath this fixed overlay. Skips
 * entirely on reduced-motion, slow connections, or if already seen this session.
 * Hard 3s timeout, tap-anywhere to dismiss, a Skip button after 400ms.
 */
const KEY = "fitpro_intro_seen";

export default function Intro() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reduce) return;
    if (sessionStorage.getItem(KEY)) return;
    const conn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
    if (conn && (conn.effectiveType === "2g" || conn.effectiveType === "slow-2g")) return;

    setShow(true);
    const skipT = setTimeout(() => setShowSkip(true), 400);
    const endT = setTimeout(() => dismiss(), 2200);
    const hardT = setTimeout(() => dismiss(), 3000); // hard cap
    return () => {
      clearTimeout(skipT);
      clearTimeout(endT);
      clearTimeout(hardT);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  function dismiss() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="fp-intro"
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-fp-black"
          onClick={dismiss}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* LED lines drawing across the centre */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
            <motion.div
              className="mx-auto h-[2px] w-[74%] origin-left"
              style={{ background: "var(--color-fp-blue)" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="mx-auto mt-2 h-[2px] w-[60%] origin-left"
              style={{ background: "var(--color-fp-warm)" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Logo powers on */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="fp-switch"
              animate={{ filter: ["brightness(1)", "brightness(1.6)", "brightness(1)"] }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset("/fitpro/brand/logo-fitpro.png")}
                alt="FITPRO"
                className="h-32 w-32 sm:h-40 sm:w-40"
              />
            </motion.div>
          </motion.div>

          {showSkip && (
            <button
              type="button"
              onClick={dismiss}
              className="absolute bottom-6 right-6 font-mono-fp text-[11px] uppercase tracking-[0.24em] text-fp-muted transition-colors hover:text-fp-text"
            >
              Skip
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
