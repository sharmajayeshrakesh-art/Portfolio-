"use client";

import { Check, WhatsappLogo } from "@phosphor-icons/react";
import { plans, planIncludes, fitpro } from "@/lib/fitpro";
import Reveal, { RevealItem } from "./Reveal";

export default function Plans() {
  return (
    <section id="plans" className="bg-fp-black py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="font-mono-fp text-[11px] uppercase tracking-[0.24em] text-fp-blue">Membership</p>
          <h2 className="mt-3 font-rajdhani text-3xl font-bold tracking-wide text-fp-warm sm:text-5xl">
            Simple plans. One rate, honestly quoted.
          </h2>
          <p className="mt-3 max-w-xl font-inter text-sm text-fp-text/60">
            We keep pricing to WhatsApp so you always get the current offer, no stale numbers on a page.
          </p>
        </Reveal>

        <Reveal className="mt-12 grid gap-4 sm:grid-cols-3" stagger={0.1}>
          {plans.map((p, i) => (
            <RevealItem key={p.name} className="h-full">
              <div
                className={`flex h-full flex-col rounded-xl border p-7 ${
                  i === 1 ? "border-fp-lime bg-fp-panel-2" : "border-white/10 bg-fp-panel"
                }`}
              >
                <p className="font-rajdhani text-xl font-semibold tracking-wide text-fp-warm">{p.name}</p>
                <p className="font-mono-fp text-[10px] uppercase tracking-[0.2em] text-fp-muted">{p.period}</p>

                <div className="mt-6">
                  {p.price ? (
                    <span className="font-mono-fp text-4xl font-bold text-fp-lime">₹{p.price}</span>
                  ) : (
                    <span className="font-rajdhani text-2xl font-semibold text-fp-lime">Ask on WhatsApp</span>
                  )}
                </div>
                <p className="mt-3 font-inter text-sm leading-relaxed text-fp-text/70">{p.note}</p>

                <a
                  href={fitpro.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-7 inline-flex items-center justify-center gap-2 rounded-sm py-3 font-rajdhani text-sm font-semibold transition-colors ${
                    i === 1 ? "fp-cta" : "border border-white/20 text-fp-text hover:border-fp-lime hover:text-fp-lime"
                  }`}
                >
                  <WhatsappLogo size={16} weight="fill" />
                  Get this plan
                </a>
              </div>
            </RevealItem>
          ))}
        </Reveal>

        {/* What every plan includes */}
        <Reveal className="mt-8 rounded-xl border border-fp-blue/20 bg-fp-panel p-6 sm:p-8">
          <p className="font-mono-fp text-[10px] uppercase tracking-[0.2em] text-fp-blue">Every plan includes</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {planIncludes.map((f) => (
              <div key={f} className="flex items-center gap-2.5 font-inter text-sm text-fp-text/80">
                <Check size={17} weight="bold" className="shrink-0 text-fp-lime" />
                {f}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
