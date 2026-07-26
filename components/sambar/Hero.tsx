"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, MapPin } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";
import { sambar } from "@/lib/sambar";
import { Marigold, BananaLeaf } from "./Motifs";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const midY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      {/* Parallax background (landscape on >=sm, portrait door on mobile) */}
      <motion.div
        style={reduce ? undefined : { y: bgY, willChange: "transform" }}
        className="absolute inset-0 scale-110"
      >
        <picture>
          <source media="(min-width: 640px)" srcSet={asset("/sambar/hero.jpg")} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/sambar/hero-portrait.jpg")}
            alt="The marigold-garland heritage entrance of Secret Sambar"
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        </picture>
      </motion.div>

      {/* Warm legibility overlays */}
      <div className="absolute inset-0 bg-sambar-green-deep/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-sambar-green-deep/70 via-sambar-green-deep/25 to-sambar-green-deep" />

      {/* Drifting botanical motifs (foreground depth) */}
      <div className="pointer-events-none absolute inset-0">
        <BananaLeaf
          className="sambar-drift absolute -left-6 top-10 h-56 w-24 text-sambar-green-2/50 sm:h-72"
          style={{ "--drift-dur": "11s" } as React.CSSProperties}
        />
        <BananaLeaf
          className="sambar-drift absolute -right-8 top-16 h-56 w-24 -scale-x-100 text-sambar-green-2/50 sm:h-72"
          style={{ "--drift-dur": "13s", "--drift-delay": "1.5s" } as React.CSSProperties}
        />
        <Marigold
          className="sambar-drift absolute left-6 bottom-16 h-14 w-14 text-sambar-brick-2/70 sm:left-16"
          style={{ "--drift-dur": "8s" } as React.CSSProperties}
        />
        <Marigold
          className="sambar-drift absolute right-8 bottom-24 h-10 w-10 text-sambar-gold/70 sm:right-24"
          style={{ "--drift-dur": "9.5s", "--drift-delay": "1s" } as React.CSSProperties}
        />
      </div>

      {/* Foreground content */}
      <motion.div style={reduce ? undefined : { y: midY, willChange: "transform" }} className="relative z-10 mx-auto max-w-3xl px-6 pt-24 text-center">
        {/* Kathakali mask emblem framed like a temple niche */}
        <motion.div {...rise(0.05)} className="mx-auto mb-6 w-fit">
          <div className="relative mx-auto h-40 w-28 overflow-hidden rounded-t-full rounded-b-2xl border-2 border-sambar-gold/70 bg-sambar-green-deep shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] sm:h-48 sm:w-32">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/sambar/mask.jpg")}
              alt="Secret Sambar's glowing Kathakali mask emblem"
              className="h-full w-full object-cover"
            />
            <span className="pointer-events-none absolute inset-0 rounded-t-full rounded-b-2xl shadow-[inset_0_0_30px_rgba(18,53,40,0.7)]" />
          </div>
        </motion.div>

        <motion.p
          {...rise(0.2)}
          className="mb-3 font-nunito text-[10px] font-semibold uppercase tracking-[0.3em] text-sambar-gold-soft/90 sm:text-xs"
        >
          {sambar.kicker}
        </motion.p>

        <motion.h1
          {...rise(0.35)}
          className="font-playfair text-[16vw] font-black leading-[0.92] text-sambar-cream sm:text-7xl md:text-8xl"
        >
          Secret Sambar
        </motion.h1>

        <motion.p
          {...rise(0.55)}
          className="mx-auto mt-5 max-w-md font-playfair text-lg italic text-sambar-cream/85 sm:text-xl"
        >
          {sambar.heroTagline}
        </motion.p>

        <motion.div {...rise(0.72)} className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#menu"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-sambar-gold px-8 py-4 font-nunito text-sm font-semibold tracking-wide text-sambar-green-deep shadow-[0_14px_34px_-14px_rgba(200,160,77,0.95)] transition-all hover:-translate-y-0.5 hover:bg-sambar-gold-2 sm:w-auto"
          >
            Explore Menu
            <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#branches"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-sambar-gold-soft/50 px-8 py-4 font-nunito text-sm font-medium text-sambar-cream backdrop-blur-sm transition-colors hover:bg-sambar-cream/10 sm:w-auto"
          >
            <MapPin size={16} weight="fill" />
            Our Branches
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
