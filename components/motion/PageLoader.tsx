"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * First-load choreography. A counter + brand mark on the jewel ground, then
 * a two-panel curtain lift that hands off to the hero. Fires `page:ready` on
 * complete so the hero can begin its entrance. Instant under reduced motion.
 */
export default function PageLoader() {
  const root = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const el = root.current!;

      const finish = () => {
        el.style.display = "none";
        document.body.style.removeProperty("overflow");
        (window as unknown as { __pageReady?: boolean }).__pageReady = true;
        window.dispatchEvent(new Event("page:ready"));
      };

      if (reduce) {
        setCount(100);
        finish();
        return;
      }

      document.body.style.overflow = "hidden";
      const counter = { v: 0 };
      const tl = gsap.timeline({ onComplete: finish });

      tl.to(counter, {
        v: 100,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => setCount(Math.round(counter.v)),
      })
        .to(".loader-mark", { opacity: 0, y: -12, duration: 0.4 }, "-=0.2")
        .to(
          ".loader-panel",
          {
            scaleY: 0,
            duration: 0.9,
            ease: "power4.inOut",
            stagger: 0.08,
            transformOrigin: "top",
          },
          "-=0.1"
        );
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-hidden
    >
      <div className="loader-panel absolute inset-0 bg-jewel" />
      <div className="loader-panel absolute inset-0 bg-jewel-2" />
      <div className="loader-mark relative z-10 flex flex-col items-center gap-6">
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
