"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { useRef, type ReactNode, type ElementType } from "react";

/**
 * Secret Sambar's reveal: a soft rise + settle (subtle scale), staggered so
 * items unfold as you scroll. Honors prefers-reduced-motion (renders static).
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 30,
  as = "div",
  stagger,
  amount = 0.25,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
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
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
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
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
    },
  };
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

/**
 * Scroll parallax wrapper — translates its children on the Y axis as the
 * element passes through the viewport. `speed` > 0 drifts up (foreground),
 * < 0 drifts down (background). Static under reduced-motion.
 */
export function Parallax({
  children,
  className,
  speed = 40,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y, willChange: "transform" }}>
        {children}
      </motion.div>
    </div>
  );
}
