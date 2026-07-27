"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, WhatsappLogo, Medal, Timer, Star } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";
import { gym } from "@/lib/gym";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const figY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);

  const slam = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 40 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease: [0.2, 0.9, 0.2, 1] as const },
        };

  const chip = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.6, delay, ease: [0.2, 0.9, 0.2, 1] as const },
        };

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Dark gradient stage + red glow (no busy photo, so the figure pops) */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_20%,#201013_0%,#0b0b0d_55%)]" />
      <div
        className="absolute inset-0 opacity-70"
        style={{ background: "radial-gradient(90% 80% at 78% 55%, rgba(224,30,38,0.28), transparent 55%)" }}
      />
      {/* Giant ghost brand mark */}
      <span className="pointer-events-none absolute right-2 top-1/2 -z-0 hidden -translate-y-1/2 font-anton text-[36vw] leading-none k2-ghost lg:block">
        K2
      </span>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-6 px-5 pt-24 sm:px-8 lg:grid-cols-2">
        {/* Text */}
        <motion.div style={reduce ? undefined : { y: contentY, willChange: "transform" }}>
          <motion.p
            {...slam(0.1)}
            className="mb-4 inline-flex items-center gap-2 rounded-sm border border-k2-red/50 bg-k2-red/10 px-3 py-1.5 font-anton text-xs uppercase tracking-[0.2em] text-k2-gold"
          >
            {gym.subtagline}
          </motion.p>
          <motion.h1
            {...slam(0.22)}
            className="font-anton text-[15vw] uppercase leading-[0.98] text-white sm:text-7xl sm:leading-[0.92] md:text-8xl"
          >
            <span className="block">Rain Outside,</span>
            <span className="mt-1 block k2-fire-text sm:mt-2">Beast Inside</span>
          </motion.h1>
          <motion.p {...slam(0.42)} className="mt-6 max-w-md font-nunito text-lg text-white/85">
            {gym.heroSub}
          </motion.p>
          <motion.div {...slam(0.58)} className="mt-8 flex flex-col gap-4 sm:flex-row">
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-white/25 bg-white/5 px-8 py-4 font-anton text-base uppercase tracking-wide text-white transition-colors hover:border-k2-gold hover:text-k2-gold sm:w-auto"
            >
              <WhatsappLogo size={18} weight="fill" />
              Enquire on WhatsApp
            </a>
          </motion.div>
        </motion.div>

        {/* Athlete cut-out + floating chips */}
        <motion.div
          style={reduce ? undefined : { y: figY, willChange: "transform" }}
          className="relative mx-auto mt-4 w-full max-w-sm lg:mt-0 lg:max-w-none"
        >
          <motion.div {...slam(0.3)} className="relative flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/gym/athlete.png")}
              alt="A Key 2 Fitness athlete"
              className="h-auto w-[78%] max-w-[420px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] lg:w-full"
              fetchPriority="high"
            />

            {/* Floating badge chips */}
            <div
              className="k2-float absolute left-0 top-8 flex items-center gap-2 rounded-lg border border-white/10 bg-k2-charcoal-2/90 px-3 py-2 backdrop-blur-sm sm:left-2"
              style={{ "--float-dur": "5.5s" } as React.CSSProperties}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-k2-red/15 text-k2-red">
                <Medal size={18} weight="bold" />
              </span>
              <span className="font-anton text-xs uppercase leading-tight text-white">
                Certified<br />Trainers
              </span>
            </div>

            <div
              className="k2-float absolute right-0 top-1/3 flex items-center gap-2 rounded-lg border border-white/10 bg-k2-charcoal-2/90 px-3 py-2 backdrop-blur-sm"
              style={{ "--float-dur": "6.2s", "--float-delay": "0.8s" } as React.CSSProperties}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-k2-gold/15 text-k2-gold">
                <Timer size={18} weight="bold" />
              </span>
              <span className="font-anton text-xs uppercase leading-tight text-white">
                Results in<br />21 Days
              </span>
            </div>

            <div
              className="k2-float absolute bottom-6 left-2 flex items-center gap-2 rounded-lg border border-white/10 bg-k2-charcoal-2/90 px-3 py-2 backdrop-blur-sm"
              style={{ "--float-dur": "5s", "--float-delay": "0.4s" } as React.CSSProperties}
            >
              <Star size={18} weight="fill" className="text-k2-gold" />
              <span className="font-anton text-xs uppercase leading-tight text-white">
                Rated 5.0<span className="text-k2-gold">★</span> on Google
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
