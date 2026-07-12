"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/site";

/**
 * Premium digital identity card. CSS 3D (perspective + preserve-3d), driven by
 * GSAP quickTo motion values — never React state. Pointer tilts the card,
 * moves a specular sheen, and shifts an iridescent holographic foil for a
 * metal/glass feel. Idle float when the pointer is away. 60fps, transform/
 * opacity only. Collapses to a static card under reduced motion / touch.
 */
export default function IdentityCard() {
  const scene = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);
  const foil = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  // Start with the premium placeholder; swap in the real portrait only once
  // we've confirmed /portrait.png loads (no broken-image flash).
  const [hasPortrait, setHasPortrait] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasPortrait(true);
    img.src = site.person.portrait;
  }, []);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
      const el = card.current!;

      // Entrance — waits for the page loader hand-off.
      const enter = () => {
        gsap.fromTo(
          scene.current,
          { opacity: 0, y: 40, rotateX: -18, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 1.4,
            ease: "power3.out",
          }
        );
      };
      if (document.readyState === "complete") enter();
      window.addEventListener("page:ready", enter, { once: true });

      if (reduce || !fine.matches) return;

      // Idle float (overridden while the pointer is on the card).
      const idle = gsap.to(el, {
        rotateY: "+=6",
        rotateX: "-=3",
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      const rotX = gsap.quickTo(el, "rotationX", {
        duration: 0.6,
        ease: "power3",
      });
      const rotY = gsap.quickTo(el, "rotationY", {
        duration: 0.6,
        ease: "power3",
      });
      const sheenX = gsap.quickTo(sheen.current, "xPercent", {
        duration: 0.5,
        ease: "power3",
      });
      const sheenY = gsap.quickTo(sheen.current, "yPercent", {
        duration: 0.5,
        ease: "power3",
      });
      const foilX = gsap.quickTo(foil.current, "xPercent", {
        duration: 0.7,
        ease: "power2",
      });
      const glowX = gsap.quickTo(glow.current, "xPercent", {
        duration: 0.9,
        ease: "power2",
      });
      const glowY = gsap.quickTo(glow.current, "yPercent", {
        duration: 0.9,
        ease: "power2",
      });

      const onMove = (e: PointerEvent) => {
        const r = scene.current!.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
        const py = (e.clientY - r.top) / r.height - 0.5;
        idle.pause();
        rotY(px * 26);
        rotX(-py * 26);
        sheenX(px * 60);
        sheenY(py * 60);
        foilX(px * 40);
        glowX(px * 30);
        glowY(py * 30);
      };
      const onLeave = () => {
        rotX(0);
        rotY(0);
        sheenX(0);
        sheenY(0);
        foilX(0);
        idle.play();
      };

      const target = scene.current!;
      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerleave", onLeave);
      return () => {
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("page:ready", enter);
      };
    },
    { scope: scene }
  );

  return (
    <div
      ref={scene}
      className="relative"
      style={{ perspective: "1400px" }}
      data-cursor="Explore"
    >
      {/* Ambient mouse-reactive glow behind the card */}
      <div
        ref={glow}
        aria-hidden
        className="absolute -inset-24 -z-10 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(43,92,255,0.28), rgba(43,92,255,0) 70%)",
        }}
      />

      <div
        ref={card}
        className="relative aspect-[5/7] w-[264px] rounded-[26px] sm:w-[320px] md:w-[380px]"
        style={{
          transformStyle: "preserve-3d",
          background:
            "linear-gradient(155deg,#191d26 0%,#0d1016 46%,#0b0d12 100%)",
          boxShadow: "var(--shadow-jewel)",
        }}
      >
        {/* Chrome bevel frame */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[26px]"
          style={{
            padding: 1,
            background:
              "linear-gradient(150deg,rgba(255,255,255,0.5),rgba(255,255,255,0.04) 30%,rgba(255,255,255,0) 55%,rgba(255,255,255,0.14))",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        {/* Content */}
        <div
          className="relative flex h-full flex-col p-5"
          style={{ transform: "translateZ(40px)" }}
        >
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-display text-[13px] font-semibold uppercase tracking-[0.3em] text-white">
                {site.studio}
              </span>
              <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
                Digital Identity
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.18em] text-accent-soft">
              {site.person.idNo}
            </span>
          </div>

          {/* Portrait window */}
          <div className="relative mt-4 flex-1 overflow-hidden rounded-[16px] border border-white/10 bg-[#0f1219]">
            {hasPortrait ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={site.person.portrait}
                alt={`${site.person.name}, ${site.person.role}`}
                className="h-full w-full object-cover opacity-95 grayscale-[0.35] contrast-[1.05]"
              />
            ) : (
              <PortraitPlaceholder />
            )}

            {/* Scanline / holographic sheen inside the window */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "repeating-linear-gradient(0deg,rgba(255,255,255,0.04) 0 2px,transparent 2px 4px)",
                mixBlendMode: "overlay",
                opacity: 0.4,
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
              style={{
                background:
                  "linear-gradient(to top,rgba(11,13,18,0.85),transparent)",
              }}
            />
          </div>

          {/* Identity line */}
          <div className="mt-4" style={{ transform: "translateZ(30px)" }}>
            <div className="font-display text-xl font-semibold leading-tight text-white">
              {site.person.name}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
              {site.person.role}
            </div>
          </div>

          {/* Chip + seal */}
          <div
            className="mt-4 flex items-center justify-between"
            style={{ transform: "translateZ(30px)" }}
          >
            <div
              aria-hidden
              className="h-6 w-9 rounded-[5px]"
              style={{
                background:
                  "linear-gradient(135deg,#d9dee6,#8b93a1 45%,#eef1f5 60%,#9aa2b0)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6)",
              }}
            />
            <div
              aria-hidden
              className="h-8 w-8 rounded-full"
              style={{
                background:
                  "conic-gradient(from 120deg,#2b5cff,#6a8bff,#b8c6ff,#2b5cff)",
                filter: "saturate(1.1)",
                opacity: 0.85,
              }}
            />
          </div>
        </div>

        {/* Iridescent holographic foil (moves with pointer) */}
        <div
          ref={foil}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[26px]"
          style={{
            background:
              "linear-gradient(115deg,transparent 28%,rgba(150,185,255,0.10) 43%,rgba(255,255,255,0.22) 50%,rgba(130,165,255,0.10) 57%,transparent 72%)",
            mixBlendMode: "screen",
            transform: "translateZ(60px)",
          }}
        />

        {/* Specular sheen (moves with pointer) */}
        <div
          ref={sheen}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[26px]"
          style={{
            background:
              "radial-gradient(circle at 50% 40%,rgba(255,255,255,0.35),rgba(255,255,255,0) 55%)",
            mixBlendMode: "screen",
            transform: "translateZ(70px)",
          }}
        />
      </div>
    </div>
  );
}

function PortraitPlaceholder() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_30%,#1b2130,#0c0f16)]">
      <span className="font-display text-6xl font-semibold tracking-tight text-white/12">
        {site.person.initials}
      </span>
      <span className="absolute bottom-3 left-0 right-0 text-center font-mono text-[8px] uppercase tracking-[0.2em] text-white/30">
        Add /portrait.png
      </span>
    </div>
  );
}
