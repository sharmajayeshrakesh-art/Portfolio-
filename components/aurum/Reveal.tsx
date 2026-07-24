"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode, ElementType } from "react";

/**
 * Aurum's signature reveal: blur-to-focus + a soft drift up, not a hard slide.
 * Optional staggered cascade so text and images enter at slightly different
 * times. Honors prefers-reduced-motion (renders static, no blur).
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  blur = 12,
  as = "div",
  stagger,
  amount = 0.3,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: number;
  as?: ElementType;
  stagger?: number;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const tag = typeof as === "string" ? as : "div";
  const MotionTag = (motion as unknown as Record<string, ElementType>)[tag] as ElementType;

  if (stagger) {
    const parent: Variants = {
      hidden: {},
      show: { transition: { staggerChildren: stagger, delayChildren: delay } },
    };
    return (
      <MotionTag
        className={className}
        variants={parent}
        initial={reduce ? undefined : "hidden"}
        whileInView={reduce ? undefined : "show"}
        viewport={{ once: true, amount }}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/** Child item for staggered Reveal parents (blur-to-focus). */
export function RevealItem({
  children,
  className,
  y = 20,
  blur = 10,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  blur?: number;
}) {
  const reduce = useReducedMotion();
  const item: Variants = {
    hidden: reduce ? {} : { opacity: 0, y, filter: `blur(${blur}px)` },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
    },
  };
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
