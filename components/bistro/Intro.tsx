"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { asset } from "@/lib/asset";
import { bistro } from "@/lib/bistrobrew";
import CaneLamps from "./CaneLamps";

/**
 * Opening: cane dome lampshades descend from above on staggered springs and the
 * logo rises in the pool of light. The lamps sit at the same coordinates as the
 * page's permanent lamps, so the overlay fade hands off seamlessly into them.
 * Safe: renders over fully-rendered content, 3s hard timeout, tap/scroll to
 * skip, once per session, skips on reduced-motion and slow connections.
 */
const KEY = "bistro_intro_seen";

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
          {/* Lamp cluster hanging from the top — same coordinates as the page's
              permanent lamps, so the overlay fade hands off seamlessly. */}
          <CaneLamps animate />

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
