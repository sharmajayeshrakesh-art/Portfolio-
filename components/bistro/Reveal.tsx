"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode, ElementType } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Bistro Brew reveal: elements descend gently from above and settle, the way
 * something hanging comes to rest. Never slides in from the sides, never fades
 * in place. One easing curve throughout. Resilient (fallback timer so content
 * is never stuck hidden); static under prefers-reduced-motion.
 */
function useShown() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 1500);
    return () => clearTimeout(t);
  }, []);
  return [shown, () => setShown(true)] as const;
}

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
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
      initial={{ opacity: 0, y: -y }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: -y }}
      onViewportEnter={show}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({ children, className, y = 20 }: { children: ReactNode; className?: string; y?: number }) {
  const reduce = useReducedMotion();
  const item: Variants = {
    hidden: reduce ? {} : { opacity: 0, y: -y },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
  };
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
