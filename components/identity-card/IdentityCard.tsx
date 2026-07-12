"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/site";
import { asset } from "@/lib/asset";

/**
 * Premium digital identity "capsule": a glassmorphism CASE with a B&W portrait
 * mounted in the middle. Pointer tilts the whole capsule (CSS 3D via GSAP
 * quickTo), a specular sheen tracks the cursor, and it floats at rest.
 *
 * The two layers are separable for the hero scroll transition: `.id-case`
 * (the glass shell + identity chrome) and `.id-photo` (the portrait tile).
 * The Hero parts them on scroll (case up, photo down) to reveal the site.
 * 60fps, transform/opacity only; static under reduced motion / touch.
 */
export default function IdentityCard() {
  const scene = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const [hasPortrait, setHasPortrait] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasPortrait(true);
    img.src = asset(site.person.portrait);
  }, []);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
      const el = card.current!;

      const enter = () => {
        gsap.fromTo(
          scene.current,
          { opacity: 0, y: 40, rotateX: -16, scale: 0.94 },
          { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.4, ease: "power3.out" }
        );
      };
      if (document.readyState === "complete") enter();
      window.addEventListener("page:ready", enter, { once: true });

      if (reduce) return;

      // Continuous float on the whole capsule.
      gsap.to(el, {
        y: "-=18",
        duration: 2.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      const idle = gsap.to(el, {
        rotateY: "+=6",
        rotateX: "-=3",
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      if (!fine.matches) return;

      const rotX = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" });
      const rotY = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });
      const sheenX = gsap.quickTo(sheen.current, "xPercent", { duration: 0.5, ease: "power3" });
      const sheenY = gsap.quickTo(sheen.current, "yPercent", { duration: 0.5, ease: "power3" });
      const glowX = gsap.quickTo(glow.current, "xPercent", { duration: 0.9, ease: "power2" });
      const glowY = gsap.quickTo(glow.current, "yPercent", { duration: 0.9, ease: "power2" });

      const onMove = (e: PointerEvent) => {
        const r = scene.current!.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        idle.pause();
        rotY(px * 24);
        rotX(-py * 24);
        sheenX(px * 60);
        sheenY(py * 60);
        glowX(px * 30);
        glowY(py * 30);
      };
      const onLeave = () => {
        rotX(0);
        rotY(0);
        sheenX(0);
        sheenY(0);
        idle.play();
      };
      const t = scene.current!;
      t.addEventListener("pointermove", onMove);
      t.addEventListener("pointerleave", onLeave);
      return () => {
        t.removeEventListener("pointermove", onMove);
        t.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("page:ready", enter);
      };
    },
    { scope: scene }
  );

  return (
    <div ref={scene} className="relative" style={{ perspective: "1400px" }} data-cursor="Explore">
      {/* Ambient glow behind — gives the glass something to refract */}
      <div
        ref={glow}
        aria-hidden
        className="absolute -inset-24 -z-10 opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(43,92,255,0.4), rgba(43,92,255,0) 70%), radial-gradient(closest-side at 70% 80%, rgba(120,150,255,0.28), transparent 70%)",
        }}
      />

      <div
        ref={card}
        className="relative aspect-[5/7] w-[230px] sm:w-[260px] md:w-[300px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* CASE — the glassmorphism shell (separable layer) */}
        <div
          className="id-case glass absolute inset-0 flex flex-col rounded-[26px] p-5"
          style={{ borderRadius: "26px" }}
        >
          {/* top identity row */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-display text-[13px] font-semibold uppercase tracking-[0.28em] text-ink">
                {site.studio}
              </span>
              <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3">
                Digital Identity
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.16em] text-accent">
              {site.person.idNo}
            </span>
          </div>

          {/* spacer where the photo sits */}
          <div className="flex-1" />

          {/* bottom identity row */}
          <div>
            <div className="font-display text-lg font-semibold leading-tight text-ink">
              {site.person.name}
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
              {site.person.role}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div
                aria-hidden
                className="h-5 w-8 rounded-[4px]"
                style={{
                  background:
                    "linear-gradient(135deg,#e6e9ef,#a7aebc 45%,#f2f4f7 60%,#b6bcc8)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.7)",
                }}
              />
              <div
                aria-hidden
                className="h-7 w-7 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 120deg,#2b5cff,#6a8bff,#b8c6ff,#2b5cff)",
                  opacity: 0.9,
                }}
              />
            </div>
          </div>

          {/* specular sheen on the glass */}
          <div
            ref={sheen}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[26px]"
            style={{
              background:
                "radial-gradient(circle at 50% 35%,rgba(255,255,255,0.6),rgba(255,255,255,0) 55%)",
              mixBlendMode: "overlay",
            }}
          />
        </div>

        {/* PHOTO — the portrait tile mounted in the middle (separable layer).
            Positioned by inset (no centering transform) so the scroll-split can
            animate it freely; depth comes from the inner translateZ layer. */}
        <div
          className="id-photo absolute left-[13%] right-[13%] top-[24%] h-[52%]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="relative h-full w-full overflow-hidden rounded-[16px] border border-white/70"
            style={{
              transform: "translateZ(38px)",
              boxShadow: "0 22px 44px -18px rgba(14,17,22,0.5)",
            }}
          >
            {hasPortrait ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={asset(site.person.portrait)}
                alt={`${site.person.name}, ${site.person.role}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-grey-2">
                <span className="font-display text-5xl font-semibold text-steel/40">
                  {site.person.initials}
                </span>
              </div>
            )}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[16px]"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
