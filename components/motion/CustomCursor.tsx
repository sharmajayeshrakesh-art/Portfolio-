"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Context-aware custom cursor.
 * Any element can declare intent with `data-cursor="View Project" | "Drag" |
 * "Explore" | "Open" | "Play" | "Scroll"`. The cursor reads the nearest
 * ancestor's label on pointer move and morphs (dot -> labeled ring).
 * Position is driven by GSAP quickTo (motion values), never React state.
 * Disabled entirely on touch / coarse pointers and under reduced motion.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reduce.matches) return;

    document.body.dataset.cursor = "on";
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;

    const xDot = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3" });

    let currentLabel = "";

    const setState = (labelText: string) => {
      if (labelText === currentLabel) return;
      currentLabel = labelText;
      const active = labelText.length > 0;
      label.textContent = labelText;
      gsap.to(ring, {
        width: active ? 76 : 34,
        height: active ? 76 : 34,
        backgroundColor: active
          ? "rgba(43,92,255,1)"
          : "rgba(43,92,255,0)",
        borderColor: active ? "rgba(43,92,255,0)" : "rgba(14,17,22,0.35)",
        duration: 0.35,
        ease: "power3.out",
      });
      gsap.to(label, { opacity: active ? 1 : 0, duration: 0.25 });
      gsap.to(dot, { opacity: active ? 0 : 1, duration: 0.2 });
    };

    const onMove = (e: PointerEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
      const el = (e.target as HTMLElement)?.closest?.(
        "[data-cursor]"
      ) as HTMLElement | null;
      setState(el?.dataset.cursor ?? "");
    };

    const onDown = () => gsap.to(ring, { scale: 0.82, duration: 0.18 });
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.3 });
    const onLeave = () => gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    const onEnter = () =>
      gsap.to([dot, ring], { opacity: currentLabel ? 0 : 1, duration: 0.2 });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      delete document.body.dataset.cursor;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      <div
        ref={ringRef}
        className="fixed left-0 top-0 flex items-center justify-center rounded-full border will-change-transform"
        style={{
          width: 34,
          height: 34,
          marginLeft: -17,
          marginTop: -17,
          borderColor: "rgba(14,17,22,0.35)",
          backdropFilter: "invert(0.04)",
        }}
      >
        <span
          ref={labelRef}
          className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white opacity-0"
          style={{ transform: "translateZ(0)" }}
        />
      </div>
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-ink will-change-transform"
        style={{ marginLeft: -3, marginTop: -3 }}
      />
    </div>
  );
}
