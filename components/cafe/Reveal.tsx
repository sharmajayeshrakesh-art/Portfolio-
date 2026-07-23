"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode, ElementType } from "react";

/**
 * Gentle scroll reveal for the cafe (Framer Motion). Soft fade + rise, with
 * optional stagger. Honors prefers-reduced-motion (renders static).
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  as = "div",
  stagger,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: ElementType;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  const tag = typeof as === "string" ? as : "div";
  const MotionTag = (
    motion as unknown as Record<string, ElementType>
  )[tag] as ElementType;

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
        viewport={{ once: true, amount: 0.2 }}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/** Child item for staggered Reveal parents. */
export function RevealItem({
  children,
  className,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  const item: Variants = {
    hidden: reduce ? {} : { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
    },
  };
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
