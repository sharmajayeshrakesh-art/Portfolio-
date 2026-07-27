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
 * Key 2 Fitness reveal: a bold "slam" — slides in from a direction with a
 * quick, punchy ease. Honors prefers-reduced-motion (renders static).
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  from = "up",
  distance = 46,
  as = "div",
  stagger,
  amount = 0.25,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: "up" | "down" | "left" | "right";
  distance?: number;
  as?: ElementType;
  stagger?: number;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const tag = typeof as === "string" ? as : "div";
  const MotionTag = (motion as unknown as Record<string, ElementType>)[tag] as ElementType;
  const off = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  }[from];

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
      initial={reduce ? false : { opacity: 0, ...off }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.9, 0.2, 1] }}
      style={{ willChange: "transform" }}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({
  children,
  className,
  from = "up",
  distance = 36,
}: {
  children: ReactNode;
  className?: string;
  from?: "up" | "down" | "left" | "right";
  distance?: number;
}) {
  const reduce = useReducedMotion();
  const off = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  }[from];
  const item: Variants = {
    hidden: reduce ? {} : { opacity: 0, ...off },
    show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.6, ease: [0.2, 0.9, 0.2, 1] } },
  };
  return (
    <motion.div className={className} variants={item} style={{ willChange: "transform" }}>
      {children}
    </motion.div>
  );
}

/** Translate-only scroll parallax (perf-safe). */
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
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y, willChange: "transform" }}>{children}</motion.div>
    </div>
  );
}
