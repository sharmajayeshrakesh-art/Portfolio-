"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Positioning statement. A single sharp line where each word darkens from
 * mist to ink as it scrolls through — motivated motion: it paces the read and
 * lands the point. Distinct layout family from the hero (full-width editorial
 * type, no card, no split). Static under reduced motion.
 */
const LINE =
  "We build websites that earn trust in the first five seconds, then keep it on every scroll.";
const ACCENT = new Set(["trust", "first", "five", "seconds,"]);

export default function Statement() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const all = gsap.utils.toArray<HTMLElement>(".stmt-word", root.current);
    if (reduce) return; // words already render at their final colors via CSS
    gsap.set(all, { color: "var(--color-mist)" });
    // Each word darkens to its own destination (ink, or cobalt for accents)
    // as it scrolls through — paced left to right.
    const anim = gsap.to(all, {
      color: (i, el: HTMLElement) =>
        el.dataset.accent === "1"
          ? "var(--color-accent)"
          : "var(--color-ink)",
      ease: "none",
      stagger: 0.5,
    });
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top 72%",
      end: "bottom 62%",
      scrub: 0.6,
      animation: anim,
    });
    return () => {
      st.kill();
      anim.kill();
    };
  }, []);

  return (
    <section
      id="statement"
      ref={root}
      className="relative mx-auto max-w-[1400px] px-6 py-32 md:px-10 md:py-48 lg:px-16"
    >
      <h2 className="font-display text-3xl font-medium leading-[1.12] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.6rem] lg:leading-[1.08]">
        {LINE.split(" ").map((w, i) => {
          const isAccent = ACCENT.has(w.toLowerCase());
          return (
            <span
              key={i}
              data-accent={isAccent ? "1" : "0"}
              className={`stmt-word mr-[0.26em] inline-block ${
                isAccent ? "italic text-accent" : "text-ink"
              }`}
            >
              {w}
            </span>
          );
        })}
      </h2>
    </section>
  );
}
