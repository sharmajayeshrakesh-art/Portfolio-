"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { asset } from "@/lib/asset";
import { fitpro } from "@/lib/fitpro";

/**
 * Full-viewport cover with the lock-screen depth effect: the FITPRO wordmark
 * sits behind the cut-out athlete, whose head & shoulders occlude the letters.
 * Releases on native scroll via sticky + scroll progress (no scroll hijack).
 * Static under prefers-reduced-motion. The real site is in the DOM below it.
 */
export default function CoverScreen() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const subjScale = useTransform(scrollYProgress, [0, 0.85], [1, 1.14]);
  const subjOpacity = useTransform(scrollYProgress, [0.35, 0.85], [1, 0]);
  const wordScale = useTransform(scrollYProgress, [0.25, 0.75], [1, 0.55]);
  const wordY = useTransform(scrollYProgress, [0.25, 0.75], ["0vh", "-32vh"]);
  const wordOpacity = useTransform(scrollYProgress, [0.6, 0.9], [1, 0]);
  const glowOpacity = useTransform(scrollYProgress, [0.35, 0.8], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  const S = reduce ? {} : { scale: subjScale, opacity: subjOpacity };
  const W = reduce ? {} : { scale: wordScale, y: wordY, opacity: wordOpacity };

  return (
    <div ref={ref} className="relative" style={{ height: "180dvh" }} aria-hidden={false}>
      <div className="pointer-events-none sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden bg-fp-black">
        {/* soft LED-blue light bleed */}
        <motion.div
          style={reduce ? undefined : { opacity: glowOpacity }}
          className="absolute left-1/2 top-[58%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2"
        >
          <div
            className="h-full w-full"
            style={{ background: "radial-gradient(circle, rgba(49,198,245,0.10), transparent 62%)" }}
          />
        </motion.div>

        {/* Wordmark (behind subject) */}
        <motion.div style={reduce ? undefined : W} className="absolute inset-x-0 top-[40%] z-10 text-center sm:top-[30%]">
          <h1 className="font-rajdhani text-[26vw] font-bold leading-none tracking-[0.06em] text-fp-warm sm:text-[20vw] lg:text-[16rem]">
            FITPRO
          </h1>
          <p className="mt-2 font-mono-fp text-[10px] uppercase tracking-[0.34em] text-fp-muted sm:text-xs">
            Hinjewadi Phase 1 · Pune
          </p>
        </motion.div>

        {/* Subject (in front of wordmark) */}
        <motion.div
          style={reduce ? undefined : S}
          className="absolute bottom-0 left-1/2 z-20 w-[168%] max-w-none -translate-x-1/2 sm:w-full sm:max-w-[1100px]"
        >
          <picture>
            <source srcSet={asset("/fitpro/splash/splash-subject.webp")} type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/fitpro/splash/splash-subject.png")}
              alt="Athlete with arms outstretched"
              className="h-auto w-full object-contain"
              fetchPriority="high"
            />
          </picture>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          style={reduce ? undefined : { opacity: cueOpacity }}
          className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 text-center"
        >
          <div className="fp-scrollcue mx-auto" />
          <p className="mt-2 font-mono-fp text-[10px] uppercase tracking-[0.3em] text-fp-muted">Scroll</p>
        </motion.div>
      </div>
    </div>
  );
}
