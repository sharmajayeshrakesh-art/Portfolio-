"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, MapPin } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";
import { aurum } from "@/lib/aurum";

/** Fixed twinkle positions (avoid hydration drift from random). */
const TWINKLES = [
  { top: "18%", left: "12%", size: 5, dur: "3.2s", delay: "0s" },
  { top: "26%", left: "82%", size: 4, dur: "2.6s", delay: "0.6s" },
  { top: "40%", left: "24%", size: 3, dur: "3.8s", delay: "1.1s" },
  { top: "14%", left: "58%", size: 4, dur: "3s", delay: "0.3s" },
  { top: "52%", left: "72%", size: 5, dur: "4.2s", delay: "1.6s" },
  { top: "34%", left: "44%", size: 3, dur: "2.9s", delay: "0.9s" },
  { top: "22%", left: "36%", size: 4, dur: "3.5s", delay: "2s" },
  { top: "46%", left: "88%", size: 3, dur: "2.7s", delay: "0.2s" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  const blurRise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 26, filter: "blur(14px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 1.3, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div
        style={reduce ? undefined : { y: bgY, scale: bgScale }}
        className="absolute inset-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/aurum/hero-interior.jpg")}
          alt="The warm, flower-lit interior of Aurum Beans after dark"
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Warm legibility + mood overlays */}
      <div className="absolute inset-0 bg-aurum-green-deep/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-aurum-green-deep/70 via-aurum-green-deep/25 to-aurum-green-deep" />
      {/* Slow-pulsing golden glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 aurum-glow"
        style={{
          background:
            "radial-gradient(circle, rgba(212,180,106,0.28) 0%, rgba(200,160,77,0.10) 40%, transparent 70%)",
        }}
      />

      {/* Fairy-light twinkle */}
      {TWINKLES.map((t, i) => (
        <span
          key={i}
          className="fairy-twinkle pointer-events-none absolute"
          style={
            {
              top: t.top,
              left: t.left,
              width: t.size,
              height: t.size,
              ["--tw-dur"]: t.dur,
              ["--tw-delay"]: t.delay,
            } as React.CSSProperties
          }
        />
      ))}

      <motion.div
        style={reduce ? undefined : { y: contentY }}
        className="relative z-10 mx-auto max-w-3xl px-6 pt-24 text-center"
      >
        <motion.p
          {...blurRise(0.1)}
          className="mb-3 font-nunito text-[11px] font-semibold uppercase tracking-[0.34em] text-aurum-gold-soft/90 sm:text-xs"
        >
          {aurum.kicker}
        </motion.p>

        <motion.p
          {...blurRise(0.25)}
          className="font-parisienne text-3xl text-aurum-gold-soft sm:text-4xl"
        >
          {aurum.taglineScript}
        </motion.p>

        <motion.h1
          {...blurRise(0.4)}
          className="mt-1 font-fraunces text-[17vw] font-black leading-[0.9] text-aurum-cream sm:text-8xl md:text-[8.5rem]"
        >
          Aurum Beans
        </motion.h1>

        <motion.p
          {...blurRise(0.6)}
          className="mx-auto mt-5 max-w-md font-nunito text-base text-aurum-cream/85 sm:text-lg"
        >
          {aurum.tagline}
        </motion.p>

        <motion.div
          {...blurRise(0.78)}
          className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#menu"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-aurum-gold px-8 py-4 text-sm font-semibold tracking-wide text-aurum-green-deep shadow-[0_14px_34px_-14px_rgba(200,160,77,0.95)] transition-all hover:-translate-y-0.5 hover:bg-aurum-gold-2 sm:w-auto"
          >
            View Menu
            <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#visit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-aurum-gold-soft/50 px-8 py-4 text-sm font-medium text-aurum-cream backdrop-blur-sm transition-colors hover:bg-aurum-cream/10 sm:w-auto"
          >
            <MapPin size={16} weight="fill" />
            Find Us
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
