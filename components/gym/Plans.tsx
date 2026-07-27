"use client";

import { Check, Gift, WhatsappLogo, Star } from "@phosphor-icons/react";
import { plans, freebies, planExtras, gym } from "@/lib/gym";
import Reveal, { RevealItem } from "./Reveal";
import TiltCard from "./TiltCard";

export default function Plans() {
  return (
    <section id="plans" className="relative overflow-hidden bg-k2-black py-20 sm:py-28">
      {/* diagonal top edge */}
      <div className="absolute inset-x-0 top-0 h-16 bg-k2-charcoal [clip-path:polygon(0_0,100%_0,100%_0,0_100%)]" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[50vh] w-[50vh] -translate-x-1/2 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(224,30,38,0.35), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-anton text-sm uppercase tracking-[0.3em] text-k2-red">Membership</p>
          <h2 className="mt-3 font-anton text-4xl uppercase leading-none text-white sm:text-6xl">
            Pick your <span className="k2-fire-text">plan</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-nunito text-k2-smoke">
            Every plan includes <span className="font-semibold text-k2-gold">₹4,999 of freebies</span>, free. No
            joining fee games — just results.
          </p>
        </Reveal>

        <Reveal className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-center" stagger={0.12}>
          {plans.map((p) => (
            <RevealItem key={p.months} className="h-full">
              <TiltCard
                className={`relative flex h-full flex-col rounded-xl border p-7 ${
                  p.popular
                    ? "border-k2-red bg-gradient-to-b from-k2-charcoal-2 to-k2-charcoal lg:scale-[1.05]"
                    : "border-white/10 bg-k2-charcoal-2"
                }`}
              >
                {p.tag && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-sm px-3 py-1 font-anton text-[11px] uppercase tracking-wider ${
                      p.popular ? "bg-k2-red text-white" : "bg-k2-gold text-k2-black"
                    }`}
                  >
                    {p.tag}
                  </span>
                )}
                <h3 className="font-anton text-2xl uppercase text-white">{p.months}</h3>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-anton text-5xl text-k2-gold">₹{p.price}</span>
                </div>
                <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-sm bg-k2-red/15 px-2.5 py-1 font-nunito text-xs font-bold text-k2-red-2">
                  Save ₹{p.save}
                </span>
                <a
                  href={gym.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-7 inline-flex items-center justify-center gap-2 rounded-sm py-3.5 font-anton text-sm uppercase tracking-wide transition-all hover:-translate-y-0.5 ${
                    p.popular ? "bg-k2-red text-white k2-glow" : "bg-white/10 text-white hover:bg-k2-red"
                  }`}
                >
                  <WhatsappLogo size={16} weight="fill" />
                  Join Now
                </a>
              </TiltCard>
            </RevealItem>
          ))}
        </Reveal>

        {/* Freebies */}
        <Reveal className="mt-12 rounded-xl border border-k2-gold/25 bg-k2-charcoal-2 p-7 sm:p-9" from="up">
          <div className="flex items-center gap-3">
            <Gift size={24} weight="fill" className="text-k2-gold" />
            <h3 className="font-anton text-xl uppercase text-white">
              Worth ₹4,999 — <span className="text-k2-gold">yours free</span>
            </h3>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {freebies.map((f) => (
              <div key={f} className="flex items-center gap-2.5 font-nunito text-sm text-k2-fog">
                <Check size={18} weight="bold" className="shrink-0 text-k2-red" />
                {f}
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {planExtras.map((f) => (
                <div key={f} className="flex items-center gap-2.5 font-nunito text-sm text-k2-smoke">
                  <Star size={16} weight="fill" className="shrink-0 text-k2-gold" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <p className="mt-6 text-center font-nunito text-xs uppercase tracking-[0.2em] text-k2-smoke">
          Prices subject to change · Contact for current offers
        </p>
      </div>
    </section>
  );
}
