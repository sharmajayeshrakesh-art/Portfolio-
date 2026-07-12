"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import type { Project } from "@/lib/site";
import { ArrowUpRight } from "@phosphor-icons/react";

/**
 * Living project card. A realistic browser-frame mockup (not a div-drawn fake
 * UI — a real image inside a device chrome) that:
 *  - tilts in 3D toward the cursor (depth),
 *  - carries a specular glass sheen that tracks the pointer,
 *  - plays a live-preview pan of the site image on hover.
 * All motion is transform/opacity, quickTo-driven, and disabled on
 * touch / reduced-motion (card stays a clean static mockup).
 */
export default function ProjectCard({ project }: { project: Project }) {
  const root = useRef<HTMLAnchorElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    const el = root.current!;
    const rotX = gsap.quickTo(tilt.current, "rotationX", { duration: 0.6, ease: "power3" });
    const rotY = gsap.quickTo(tilt.current, "rotationY", { duration: 0.6, ease: "power3" });
    const shX = gsap.quickTo(sheen.current, "xPercent", { duration: 0.5, ease: "power3" });
    const shY = gsap.quickTo(sheen.current, "yPercent", { duration: 0.5, ease: "power3" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rotY(px * 12);
      rotX(-py * 12);
      shX(px * 70);
      shY(py * 70);
    };
    const onEnter = () => {
      gsap.to(tilt.current, { scale: 1.015, duration: 0.5, ease: "power3" });
      gsap.to(sheen.current, { opacity: 1, duration: 0.4 });
      // live preview: pan the site image as if scrolling it
      gsap.to(preview.current, {
        yPercent: -38,
        duration: 3.2,
        ease: "power1.inOut",
      });
    };
    const onLeave = () => {
      rotX(0);
      rotY(0);
      gsap.to(tilt.current, { scale: 1, duration: 0.6, ease: "power3" });
      gsap.to(sheen.current, { opacity: 0, duration: 0.5 });
      gsap.to(preview.current, { yPercent: 0, duration: 1.2, ease: "power2.out" });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <a
      ref={root}
      href={project.href}
      data-cursor="View Project"
      className="group block w-[78vw] max-w-[560px] shrink-0 sm:w-[62vw] md:w-[46vw] lg:w-[40vw]"
      style={{ perspective: "1200px" }}
    >
      <div
        ref={tilt}
        className="relative overflow-hidden rounded-surface border border-line bg-surface shadow-lux will-change-transform"
        style={{ transformStyle: "preserve-3d", boxShadow: "var(--shadow-lux)" }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="ml-3 flex-1 truncate rounded-pill bg-surface px-3 py-1 text-center font-mono text-[10px] text-ink-4">
            {project.slug}.com
          </span>
        </div>

        {/* Viewport with live-preview image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={preview}
            src={project.image}
            alt={`${project.title} — ${project.category}`}
            className="absolute inset-x-0 top-0 h-[150%] w-full object-cover"
          />
          {/* glass sheen (pointer-tracked, hidden until hover) */}
          <div
            ref={sheen}
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0"
            style={{
              background:
                "radial-gradient(circle at 50% 40%,rgba(255,255,255,0.5),rgba(255,255,255,0) 55%)",
              mixBlendMode: "overlay",
            }}
          />
          {project.placeholder && (
            <span className="absolute bottom-3 right-3 rounded-pill bg-jewel/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/70 backdrop-blur">
              Sample
            </span>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-ink-3">{project.category}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-pill border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 sm:inline-block">
            {project.tag}
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink text-ink transition-colors group-hover:bg-ink group-hover:text-paper">
            <ArrowUpRight size={18} weight="bold" />
          </span>
        </div>
      </div>
    </a>
  );
}
