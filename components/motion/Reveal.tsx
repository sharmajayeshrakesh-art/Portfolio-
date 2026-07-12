"use client";

import { useRef, ReactNode, ElementType } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Section reveal choreography. Fades + lifts children into place on scroll,
 * with optional stagger across direct children. Static under reduced motion.
 */
export default function Reveal({
  children,
  className = "",
  as = "div",
  y = 28,
  stagger = 0,
  delay = 0,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  y?: number;
  stagger?: number;
  delay?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as as ElementType;

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const el = ref.current!;
      const targets = stagger > 0 ? Array.from(el.children) : [el];

      if (reduce) {
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(targets, { opacity: 0, y });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay,
        stagger,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 82%",
          toggleActions: once
            ? "play none none none"
            : "play none none reverse",
        },
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
