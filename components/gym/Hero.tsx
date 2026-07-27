"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";
import { gym } from "@/lib/gym";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);

  const slam = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 40 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease: [0.2, 0.9, 0.2, 1] as const },
        };

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Parallax background */}
      <motion.div style={reduce ? undefined : { y: bgY, willChange: "transform" }} className="absolute inset-0 scale-110">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/gym/hero.jpg")}
          alt="The Key 2 Fitness training floor"
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
      </motion.div>

      {/* Heavy cinematic overlays */}
      <div className="absolute inset-0 bg-k2-black/72" />
      <div className="absolute inset-0 bg-gradient-to-t from-k2-black via-k2-black/50 to-k2-black/70" />
      <div
        className="absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(120% 90% at 20% 20%, rgba(224,30,38,0.28), transparent 55%)" }}
      />

      <motion.div
        style={reduce ? undefined : { y: contentY, willChange: "transform" }}
        className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-24 sm:px-8"
      >
        <motion.p
          {...slam(0.1)}
          className="mb-4 inline-flex items-center gap-2 rounded-sm border border-k2-red/50 bg-k2-red/10 px-3 py-1.5 font-anton text-xs uppercase tracking-[0.2em] text-k2-gold"
        >
          {gym.subtagline}
        </motion.p>

        <motion.h1
          {...slam(0.22)}
          className="font-anton text-[17vw] uppercase leading-[0.86] text-white sm:text-8xl md:text-[8.5rem]"
        >
          Rain Outside,
          <br />
          <span className="k2-fire-text">Beast Inside</span>
        </motion.h1>

        <motion.p {...slam(0.42)} className="mt-6 max-w-xl font-nunito text-lg text-white/85">
          {gym.heroSub}
        </motion.p>

        <motion.div {...slam(0.58)} className="mt-9 flex flex-col gap-4 sm:flex-row">
          <a
            href="#plans"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-sm bg-k2-red px-8 py-4 font-anton text-base uppercase tracking-wide text-white k2-glow transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            View Plans
            <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href={gym.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-white/25 bg-white/5 px-8 py-4 font-anton text-base uppercase tracking-wide text-white backdrop-blur-sm transition-colors hover:border-k2-gold hover:text-k2-gold sm:w-auto"
          >
            <WhatsappLogo size={18} weight="fill" />
            Enquire on WhatsApp
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
