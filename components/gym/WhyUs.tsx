"use client";

import { Medal, Brain, ChartLineUp, UsersThree, Sparkle, Timer } from "@phosphor-icons/react";
import { why, stats, type Why } from "@/lib/gym";
import Reveal, { RevealItem } from "./Reveal";
import CountUp from "./CountUp";

const ICONS: Record<Why["icon"], typeof Medal> = {
  medal: Medal,
  brain: Brain,
  chart: ChartLineUp,
  community: UsersThree,
  sparkle: Sparkle,
  timer: Timer,
};

export default function WhyUs() {
  return (
    <section id="why" className="relative overflow-hidden bg-k2-charcoal py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Count-up stats band */}
        <Reveal className="grid grid-cols-2 gap-6 border-y border-white/10 py-8 sm:grid-cols-4" stagger={0.1}>
          {stats.map((s) => (
            <RevealItem key={s.label} className="text-center">
              <CountUp
                value={s.value}
                suffix={s.suffix}
                className="font-anton text-4xl text-k2-gold sm:text-5xl"
              />
              <p className="mt-1 font-nunito text-xs uppercase tracking-wider text-k2-smoke">{s.label}</p>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal className="mt-16 text-center" from="up">
          <p className="font-anton text-sm uppercase tracking-[0.3em] text-k2-red">Why choose K2</p>
          <h2 className="mt-3 font-anton text-4xl uppercase leading-none text-white sm:text-6xl">
            Built to get you <span className="k2-fire-text">results</span>
          </h2>
        </Reveal>

        <Reveal className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {why.map((w) => {
            const Icon = ICONS[w.icon];
            return (
              <RevealItem key={w.title}>
                <div className="group h-full rounded-lg border border-white/10 bg-k2-charcoal-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-k2-red/60">
                  <span className="flex h-14 w-14 items-center justify-center rounded-md bg-k2-red/12 text-k2-red transition-colors group-hover:bg-k2-red group-hover:text-white">
                    <Icon size={28} weight="bold" />
                  </span>
                  <h3 className="mt-5 font-anton text-xl uppercase leading-tight text-white">{w.title}</h3>
                  <p className="mt-2 font-nunito text-sm leading-relaxed text-k2-smoke">{w.blurb}</p>
                </div>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
