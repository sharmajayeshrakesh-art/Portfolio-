"use client";

import { WhatsappLogo, Check } from "@phosphor-icons/react";
import { plans, whyJoin, offer, gym } from "@/lib/gym";
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
          <p className="inline-flex items-center gap-2 rounded-sm bg-k2-red/15 px-3 py-1 font-anton text-xs uppercase tracking-[0.25em] text-k2-red-2">
            {offer.title} · {offer.validTill}
          </p>
          <h2 className="mt-4 font-anton text-4xl uppercase leading-none text-white sm:text-6xl">
            Pick your <span className="k2-fire-text">plan</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-nunito text-k2-smoke">{offer.pledge}</p>
        </Reveal>

        <Reveal className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch" stagger={0.1}>
          {plans.map((p) => (
            <RevealItem key={p.months} className="h-full">
              <TiltCard
                className={`relative flex h-full flex-col rounded-xl border p-7 ${
                  p.trial
                    ? "border-k2-gold/60 bg-gradient-to-b from-k2-charcoal-2 to-k2-charcoal"
                    : p.popular
                      ? "border-k2-red bg-gradient-to-b from-k2-charcoal-2 to-k2-charcoal lg:scale-[1.04]"
                      : "border-white/10 bg-k2-charcoal-2"
                }`}
              >
                {p.tag && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm px-3 py-1 font-anton text-[11px] uppercase tracking-wider ${
                      p.popular ? "bg-k2-red text-white" : "bg-k2-gold text-k2-black"
                    }`}
                  >
                    {p.tag}
                  </span>
                )}
                <h3 className={`font-anton text-2xl uppercase ${p.trial ? "text-k2-gold" : "text-white"}`}>
                  {p.months}
                </h3>
                <p className="mt-1 font-nunito text-[11px] uppercase tracking-[0.18em] text-k2-smoke">
                  {p.trial ? "At just" : "For only"}
                </p>
                <div className="mt-3 flex items-end gap-1">
                  <span className={`font-anton text-5xl ${p.trial ? "text-white" : "text-k2-gold"}`}>
                    ₹{p.price}
                  </span>
                </div>
                <p className="mt-3 flex-1 font-nunito text-sm leading-snug text-k2-fog">{p.note}</p>
                <a
                  href={gym.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-7 inline-flex items-center justify-center gap-2 rounded-sm py-3.5 font-anton text-sm uppercase tracking-wide transition-all hover:-translate-y-0.5 ${
                    p.trial
                      ? "bg-k2-gold text-k2-black hover:brightness-110"
                      : p.popular
                        ? "bg-k2-red text-white k2-glow"
                        : "bg-white/10 text-white hover:bg-k2-red"
                  }`}
                >
                  <WhatsappLogo size={16} weight="fill" />
                  {p.trial ? "Start Trial" : "Join Now"}
                </a>
              </TiltCard>
            </RevealItem>
          ))}
        </Reveal>

        {/* Why join + motto (from the flyer) */}
        <Reveal className="mt-12 rounded-xl border border-k2-gold/25 bg-k2-charcoal-2 p-7 sm:p-9" from="up">
          <h3 className="font-anton text-xl uppercase text-white">
            Why join <span className="k2-fire-text">Key 2 Fitness</span>?
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {whyJoin.map((w) => (
              <div key={w} className="flex items-center gap-2.5 font-nunito text-sm text-k2-fog">
                <Check size={18} weight="bold" className="shrink-0 text-k2-red" />
                {w}
              </div>
            ))}
          </div>
          <p className="mt-7 border-t border-white/10 pt-6 text-center font-anton text-lg uppercase tracking-wide text-k2-gold sm:text-2xl">
            {offer.motto}
          </p>
        </Reveal>

        <p className="mt-6 text-center font-nunito text-xs uppercase tracking-[0.2em] text-k2-smoke">
          Prices subject to change · Contact for current offers
        </p>
      </div>
    </section>
  );
}
