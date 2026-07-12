"use client";

import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { playCue } from "@/lib/sound";

/**
 * Magnetic pull toward the cursor. Motion via GSAP quickTo (no React state).
 * Reduced-motion + coarse-pointer safe. Emits an optional sound cue on click
 * (muted unless the user has enabled sound).
 */
export default function MagneticButton({
  children,
  className = "",
  strength = 0.4,
  cursor = "Open",
  onClick,
  as = "button",
  href,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  cursor?: string;
  onClick?: () => void;
  as?: "button" | "a";
  href?: string;
}) {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - (r.left + r.width / 2);
      const relY = e.clientY - (r.top + r.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  const handleClick = () => {
    playCue("tap");
    onClick?.();
  };

  const shared = {
    ref,
    className: `inline-flex will-change-transform ${className}`,
    "data-cursor": cursor,
    onClick: handleClick,
  } as const;

  if (as === "a") {
    return (
      <a href={href} {...shared}>
        {children}
      </a>
    );
  }
  return <button {...shared}>{children}</button>;
}
