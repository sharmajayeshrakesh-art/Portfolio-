"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { asset } from "@/lib/asset";
import { bistro } from "@/lib/bistrobrew";

/**
 * Opening: cane dome lampshades descend from above on staggered springs, bulbs
 * warm on one at a time, and the logo rises in the pool of light. Pure CSS/SVG.
 * Safe: renders over fully-rendered content, 3s hard timeout, tap/scroll to
 * skip, once per session, skips on reduced-motion and slow connections.
 */
const KEY = "bistro_intro_seen";

// [leftPercent, restY(px), domeWidth(px), bulbDelay(s), mobile]
const LAMPS: [number, number, number, number, boolean][] = [
  [12, 34, 74, 0.75, false],
  [26, 8, 88, 0.62, true],
  [40, 44, 70, 0.9, false],
  [50, 18, 96, 0.68, true],
  [62, 40, 72, 0.84, false],
  [74, 6, 90, 0.6, true],
  [88, 30, 76, 0.78, true],
];

export default function Intro() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || reduce) return;
    if (sessionStorage.getItem(KEY)) return;
    const conn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
    if (conn && (conn.effectiveType === "2g" || conn.effectiveType === "slow-2g")) return;

    setShow(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onGesture = () => dismiss();
    window.addEventListener("wheel", onGesture, { passive: true });
    window.addEventListener("touchmove", onGesture, { passive: true });

    const skipT = setTimeout(() => setShowSkip(true), 400);
    const endT = setTimeout(() => dismiss(), 2000);
    const hardT = setTimeout(() => dismiss(), 3000);
    return () => {
      clearTimeout(skipT); clearTimeout(endT); clearTimeout(hardT);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("wheel", onGesture);
      window.removeEventListener("touchmove", onGesture);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  function dismiss() {
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    document.body.style.overflow = "";
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="bb-intro"
          className="fixed inset-0 z-[90] overflow-hidden bg-bb-cream"
          onClick={dismiss}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Lamp cluster hanging from the top */}
          <div className="absolute inset-x-0 top-0 h-[46%]">
            {LAMPS.map(([left, restY, w, bulbDelay, onMobile], i) => (
              <motion.div
                key={i}
                className={`absolute top-0 flex flex-col items-center ${onMobile ? "" : "hidden sm:flex"}`}
                style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                initial={{ y: -280, opacity: 0 }}
                animate={{ y: restY, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.2 + i * 0.08 }}
              >
                <span className="h-24 w-px bg-bb-cane/50" />
                <span className="bb-dome" style={{ width: w, height: w * 0.5 }} />
                <motion.span
                  className="bb-bulb mt-1.5 block"
                  style={{ width: 9, height: 9 }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: bulbDelay, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.span
                  className="mt-1 block h-16 w-16 rounded-full"
                  style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,217,160,0.5), transparent 68%)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: bulbDelay + 0.05 }}
                />
              </motion.div>
            ))}
          </div>

          {/* Logo in the pool of light */}
          <div className="absolute inset-x-0 top-[52%] flex flex-col items-center">
            <div className="bb-glow absolute -top-6 h-48 w-48" aria-hidden />
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/bistro/brand/logo-bistrobrew.png")} alt="Bistro Brew" className="h-24 w-24" />
              <span className="mt-1 font-mukta text-sm text-bb-muted">{bistro.nameDevanagari}</span>
            </motion.div>
          </div>

          {showSkip && (
            <button
              type="button"
              onClick={dismiss}
              className="absolute bottom-6 right-6 font-karla text-[11px] uppercase tracking-[0.22em] text-bb-muted transition-colors hover:text-bb-ink"
            >
              Skip
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
