"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { asset } from "@/lib/asset";
import Reveal, { RevealItem } from "./Reveal";

/**
 * Editorial breath between the menu and the gallery. A framed painterly
 * illustration paired with a script pull-quote, over a faint coffee-leaf
 * pattern, with the gold lotus flourish as a header emblem.
 */
export default function Interlude() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const artY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-aurum-cream py-24 sm:py-32">
      {/* faint coffee-leaf pattern texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url(${asset("/aurum/pattern.jpg")})`,
          backgroundSize: "360px",
          mixBlendMode: "multiply",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        {/* gold flourish emblem */}
        <Reveal className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/aurum/flourish.png")}
            alt=""
            aria-hidden
            className="h-20 w-auto opacity-90 sm:h-24"
          />
        </Reveal>

        <div className="mt-8 grid items-center gap-10 md:grid-cols-2 md:gap-14">
          {/* Framed illustration */}
          <Reveal blur={18} y={30} className="order-1 md:order-none">
            <motion.div
              style={reduce ? undefined : { y: artY }}
              className="group relative mx-auto max-w-sm"
            >
              <div className="overflow-hidden rounded-[1.75rem] border border-aurum-gold/40 p-2 shadow-[0_40px_80px_-40px_rgba(30,61,52,0.55)]">
                <div className="overflow-hidden rounded-[1.25rem]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset("/aurum/mood.jpg")}
                    alt="An illustration of a warm, candle-lit corner at Aurum Beans in the evening"
                    className="h-auto w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                  />
                </div>
              </div>
              {/* soft golden glow behind the frame */}
              <div
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] opacity-70 aurum-glow"
                style={{ background: "radial-gradient(circle, rgba(212,180,106,0.28), transparent 70%)" }}
              />
            </motion.div>
          </Reveal>

          {/* Pull quote */}
          <Reveal stagger={0.14} className="text-center md:text-left">
            <RevealItem>
              <p className="font-parisienne text-3xl text-aurum-gold sm:text-4xl">a quiet evening</p>
            </RevealItem>
            <RevealItem>
              <p className="mt-3 font-fraunces text-3xl font-semibold leading-[1.15] text-aurum-ink sm:text-[2.6rem]">
                Where every evening feels a little softer.
              </p>
            </RevealItem>
            <RevealItem>
              <p className="mx-auto mt-6 max-w-md font-nunito text-[16px] leading-relaxed text-aurum-ink-soft md:mx-0">
                Warm light, fresh flowers and the smell of filter coffee. Pull up
                a chair, stay a while, and let the evening slow down around you.
              </p>
            </RevealItem>
            <RevealItem>
              <a
                href="#menu"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-aurum-green/25 px-6 py-3 font-nunito text-sm font-semibold text-aurum-green transition-all hover:-translate-y-0.5 hover:border-aurum-gold hover:text-aurum-ink"
              >
                See what's brewing
              </a>
            </RevealItem>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
