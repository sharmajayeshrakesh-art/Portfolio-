"use client";

import dynamic from "next/dynamic";
import Reveal from "@/components/motion/Reveal";

// Canvas is client-only and below the fold — load it lazily.
const HoloGlobe = dynamic(() => import("@/components/beyond/HoloGlobe"), {
  ssr: false,
});

/**
 * Beyond Websites — the memorability moment. The one deliberate dark block on a
 * light-locked page (a "step into another space" device, used once). A
 * cursor-reactive holographic globe with ambient lighting anchors it.
 */
export default function Beyond() {
  return (
    <section
      id="beyond"
      className="relative flex min-h-[100dvh] items-center overflow-hidden bg-jewel text-white"
    >
      {/* Globe fills the space; copy floats over it. Dimmed on mobile where
          copy overlaps it, full brightness on desktop where they sit apart. */}
      <div className="absolute inset-0 opacity-55 md:opacity-100">
        <HoloGlobe />
      </div>
      {/* Legibility scrim: darkens the copy side (left) + vignettes edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(11,13,18,0.9) 0%, rgba(11,13,18,0.55) 42%, rgba(11,13,18,0) 72%), radial-gradient(120% 90% at 50% 50%, transparent 45%, rgba(11,13,18,0.5) 100%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-10 px-6 md:px-10 lg:px-16">
        <Reveal className="max-w-[52ch]" stagger={0.12}>
          <h2 className="font-display text-[clamp(2.4rem,9vw,3rem)] font-semibold leading-[1.0] tracking-tight sm:text-5xl md:text-6xl lg:text-[3.9rem]">
            We build the experiences
            <br className="hidden sm:block" /> other studios call impossible.
          </h2>
          <p className="mt-8 max-w-[46ch] text-lg leading-relaxed text-white/65">
            Real-time 3D, motion systems, interactive product tours, spatial
            interfaces. When a site needs to feel like the future, this is the
            room where we build it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
