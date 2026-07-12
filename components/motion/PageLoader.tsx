"use client";

import { useEffect, useRef, useState } from "react";

/**
 * First-load choreography — deliberately gsap-independent for reliability.
 * A rAF-driven counter on the jewel ground, then a CSS curtain lift that hands
 * off to the hero (dispatches `page:ready` + sets window.__pageReady). Instant
 * under reduced motion. finish() is idempotent (safe under StrictMode).
 */
export default function PageLoader() {
  const root = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"count" | "lift" | "done">("count");

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      (window as unknown as { __pageReady?: boolean }).__pageReady = true;
      document.body.style.removeProperty("overflow");
      setPhase("done");
      window.dispatchEvent(new Event("page:ready"));
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setCount(100);
      finish();
      return;
    }

    document.body.style.overflow = "hidden";
    const DURATION = 1300;
    let start: number | null = null;
    let raf = 0;

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("lift");
        // Curtain lift duration, then hand off.
        window.setTimeout(finish, 900);
      }
    };
    raf = requestAnimationFrame(tick);

    // Safety net against any stall.
    const failsafe = window.setTimeout(finish, 4000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      {/* Two curtain panels that lift on the "lift" phase */}
      <div
        className="absolute inset-0 bg-jewel transition-transform duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{
          transform: phase === "lift" ? "translateY(-100%)" : "translateY(0)",
          transitionDelay: "80ms",
        }}
      />
      <div
        className="absolute inset-0 bg-jewel-2 transition-transform duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{
          transform: phase === "lift" ? "translateY(-100%)" : "translateY(0)",
        }}
      />
      <div
        className="relative z-10 flex flex-col items-center gap-6 transition-opacity duration-300"
        style={{ opacity: phase === "lift" ? 0 : 1 }}
      >
        <span className="font-display text-sm uppercase tracking-[0.42em] text-white/70">
          Studio
        </span>
        <span className="font-mono text-6xl font-medium tabular-nums text-white md:text-7xl">
          {String(count).padStart(3, "0")}
        </span>
      </div>
    </div>
  );
}
