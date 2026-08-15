"use client";

import { Barbell, Lock, Drop, Car, Snowflake, CreditCard, Lightning } from "@phosphor-icons/react";
import { classes, specialties, facilities, type Facility } from "@/lib/gym";
import Reveal, { RevealItem } from "./Reveal";
import { Eyebrow } from "./Tiranga";

const FAC_ICONS: Record<Facility["icon"], typeof Barbell> = {
  barbell: Barbell,
  lock: Lock,
  drop: Drop,
  car: Car,
  snow: Snowflake,
  card: CreditCard,
};

export default function Classes() {
  return (
    <section id="classes" className="relative overflow-hidden bg-k2-charcoal py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <Eyebrow>Classes &amp; Services</Eyebrow>
          <h2 className="mt-3 font-anton text-4xl uppercase leading-none text-white sm:text-6xl">
            Train your <span className="k2-fire-text">way</span>
          </h2>
        </Reveal>

        {/* Classes */}
        <Reveal className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" stagger={0.08}>
          {classes.map((c) => (
            <RevealItem key={c}>
              <div className="group flex items-center gap-3 rounded-lg border border-white/10 bg-k2-charcoal-2 px-5 py-5 transition-all duration-300 hover:-translate-y-1 hover:border-k2-gold/60">
                <Lightning size={20} weight="fill" className="shrink-0 text-k2-gold" />
                <span className="font-anton text-base uppercase leading-tight text-white">{c}</span>
              </div>
            </RevealItem>
          ))}
        </Reveal>

        {/* Specialties */}
        <Reveal className="mt-10 rounded-xl border border-k2-red/25 bg-k2-charcoal-2 p-7" from="up">
          <p className="font-anton text-sm uppercase tracking-[0.2em] text-k2-gold">We specialise in</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {specialties.map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/15 bg-k2-red/10 px-4 py-2 font-nunito text-sm font-semibold text-k2-fog"
              >
                {s}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Facilities */}
        <Reveal className="mt-14 text-center">
          <h3 className="font-anton text-2xl uppercase text-white sm:text-3xl">The Facilities</h3>
        </Reveal>
        <Reveal className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6" stagger={0.08}>
          {facilities.map((f) => {
            const Icon = FAC_ICONS[f.icon];
            return (
              <RevealItem key={f.title} className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-k2-charcoal text-k2-gold">
                  <Icon size={24} weight="bold" />
                </span>
                <p className="mt-3 font-nunito text-xs font-semibold uppercase tracking-wide text-k2-fog">{f.title}</p>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
