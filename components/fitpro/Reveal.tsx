"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode, ElementType } from "react";

/**
 * FITPRO reveal: a "light switching on" — a quick brightness step, then settle.
 * Resilient by design: a fallback timer forces the content visible even if the
 * viewport observer never fires, so nothing is ever stuck at opacity 0.
 * Static under prefers-reduced-motion.
 */
function useShown() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 1500); // fallback: never stay hidden
    return () => clearTimeout(t);
  }, []);
  return [shown, () => setShown(true)] as const;
}

export default function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  stagger,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  stagger?: number;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const [shown, show] = useShown();
  const tag = typeof as === "string" ? as : "div";
  const MotionTag = (motion as unknown as Record<string, ElementType>)[tag] as ElementType;

  if (reduce) {
    const Tag = tag as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  if (stagger) {
    const parent: Variants = {
      hidden: {},
      show: { transition: { staggerChildren: stagger, delayChildren: delay } },
    };
    return (
      <MotionTag
        className={className}
        variants={parent}
        initial="hidden"
        animate={shown ? "show" : "hidden"}
        onViewportEnter={show}
        viewport={{ once: true, amount }}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={shown ? { opacity: [0, 0.4, 1], y: [10, 2, 0] } : { opacity: 0, y: 10 }}
      onViewportEnter={show}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.55, delay, times: [0, 0.55, 0.6], ease: "linear" }}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const item: Variants = {
    hidden: reduce ? {} : { opacity: 0, y: 10 },
    show: {
      opacity: reduce ? 1 : [0, 0.4, 1],
      y: reduce ? 0 : [10, 2, 0],
      transition: { duration: 0.5, times: [0, 0.55, 0.6], ease: "linear" },
    },
  };
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

/** The single travelling light line used as every section divider. */
export function LightLine({ className = "" }: { className?: string }) {
  return <div className={`fp-lightline ${className}`} aria-hidden />;
}
