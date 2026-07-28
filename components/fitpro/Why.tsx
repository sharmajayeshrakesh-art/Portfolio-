"use client";

import { Eye, Stack, Pulse, Clock } from "@phosphor-icons/react";
import { why, type Why as WhyT } from "@/lib/fitpro";
import Reveal, { RevealItem } from "./Reveal";

const ICONS: Record<WhyT["icon"], typeof Eye> = { eye: Eye, stack: Stack, pulse: Pulse, clock: Clock };

export default function Why() {
  return (
    <section className="bg-fp-black py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="font-mono-fp text-[11px] uppercase tracking-[0.24em] text-fp-blue">Why train here</p>
          <h2 className="mt-3 max-w-2xl font-rajdhani text-3xl font-bold leading-tight tracking-wide text-fp-warm sm:text-5xl">
            The stuff that actually keeps people coming back.
          </h2>
        </Reveal>

        <Reveal className="mt-12 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2" stagger={0.08}>
          {why.map((w) => {
            const Icon = ICONS[w.icon];
            return (
              <RevealItem key={w.title} className="bg-fp-panel">
                <div className="group h-full p-7 transition-colors hover:bg-fp-panel-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-md border border-fp-blue/40 text-fp-blue">
                      <Icon size={22} weight="light" />
                    </span>
                    <span className="fp-lightline h-px flex-1 opacity-60" />
                  </div>
                  <h3 className="mt-5 font-rajdhani text-xl font-semibold tracking-wide text-fp-warm">{w.title}</h3>
                  <p className="mt-2 font-inter text-sm leading-relaxed text-fp-text/70">{w.blurb}</p>
                </div>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
