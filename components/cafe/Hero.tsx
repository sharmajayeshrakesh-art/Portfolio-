"use client";

import { motion, useReducedMotion } from "motion/react";
import { asset } from "@/lib/asset";
import { cafe } from "@/lib/cafe";
import { ArrowRight, MapPin } from "@phosphor-icons/react";

export default function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      {/* Storefront signage background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/cafe/hero-signage.jpg")}
        alt="Cafe Hari Rasa storefront on FC Road, Pune"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Dark overlays for legibility + warmth */}
      <div className="absolute inset-0 bg-cafe-black/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-cafe-black/80 via-cafe-black/40 to-cafe-black" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 40%, rgba(200,160,77,0.14), transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-24 text-center">
        <motion.p
          {...rise(0.1)}
          className="mb-6 font-mukta text-[11px] uppercase tracking-[0.34em] text-gold-2/90 sm:text-xs"
        >
          {cafe.kicker}
        </motion.p>

        <motion.h1
          {...rise(0.25)}
          className="font-cormorant text-[15vw] font-semibold leading-[0.95] text-transparent sm:text-7xl md:text-8xl"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #f0dca8 0%, #d4af6a 45%, #c8a04d 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          Cafe Hari Rasa
        </motion.h1>

        <motion.p
          {...rise(0.45)}
          className="mx-auto mt-6 max-w-xl font-cormorant text-xl italic text-cream/85 sm:text-2xl"
        >
          {cafe.tagline}
        </motion.p>

        <motion.div
          {...rise(0.62)}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#menu"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold tracking-wide text-cafe-black transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            View Menu
            <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#visit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/50 px-8 py-4 text-sm font-medium text-gold-2 transition-colors hover:bg-gold/10 sm:w-auto"
          >
            <MapPin size={16} weight="fill" />
            Find Us on FC Road
          </a>
        </motion.div>
      </div>

      {/* bottom fade into page */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cafe-black to-transparent" />
    </section>
  );
}
