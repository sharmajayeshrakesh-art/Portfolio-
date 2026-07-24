"use client";

import { Coffee, ForkKnife, Armchair, Heart } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";
import { aurum, features, type Feature } from "@/lib/aurum";
import Reveal, { RevealItem } from "./Reveal";
import Ornament from "./Ornament";

const ICONS: Record<Feature["icon"], typeof Coffee> = {
  coffee: Coffee,
  food: ForkKnife,
  sofa: Armchair,
  hearts: Heart,
};

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-aurum-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <Ornament className="mb-10" />
        </Reveal>

        {/* Asymmetric split: offset image + overlapping copy card */}
        <div className="relative grid items-center gap-10 md:grid-cols-12">
          {/* Image, offset left */}
          <Reveal className="md:col-span-6" blur={16} y={30}>
            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] rounded-tr-[5rem] shadow-[0_40px_80px_-40px_rgba(30,61,52,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset("/aurum/about-foliage.jpg")}
                  alt="The living flower wall and woven lamps inside Aurum Beans"
                  className="h-[420px] w-full object-cover transition-transform duration-700 hover:scale-[1.04] sm:h-[520px]"
                />
              </div>
              {/* floating gold accent chip */}
              <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-aurum-green px-6 py-4 shadow-[0_24px_50px_-24px_rgba(30,61,52,0.7)] sm:block">
                <p className="font-parisienne text-2xl text-aurum-gold-soft">est. Pimpri</p>
              </div>
            </div>
          </Reveal>

          {/* Copy, offset right and overlapping */}
          <Reveal
            className="md:col-span-6 md:-ml-10 md:pl-4"
            delay={0.15}
            stagger={0.14}
          >
            <RevealItem>
              <p className="font-nunito text-xs font-semibold uppercase tracking-[0.3em] text-aurum-gold">
                Pune's cozy little secret
              </p>
            </RevealItem>
            <RevealItem>
              <h2 className="mt-4 font-fraunces text-4xl font-semibold leading-[1.05] text-aurum-ink sm:text-5xl">
                You found <span className="font-parisienne font-normal text-aurum-green">your</span>{" "}
                favourite café.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-6 max-w-lg font-nunito text-[17px] leading-relaxed text-aurum-ink-soft">
                Tucked away in Sant Tukaram Nagar, Aurum Beans is the kind of place
                you stumble into once and return to forever. A flower-filled little
                room strung with fairy lights, where the coffee is freshly brewed,
                the food is made to linger over, and the corners were built for long
                conversations.
              </p>
            </RevealItem>
            <RevealItem>
              <p className="mt-4 max-w-lg font-nunito text-[17px] leading-relaxed text-aurum-ink-soft">
                Come to work, come for a date, come to catch up with someone you
                miss. However you arrive, we'll save you a seat.
              </p>
            </RevealItem>
          </Reveal>
        </div>

        {/* Feature row */}
        <Reveal
          className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 sm:mt-24 lg:grid-cols-4"
          stagger={0.12}
        >
          {features.map((f) => {
            const Icon = ICONS[f.icon];
            return (
              <RevealItem key={f.title}>
                <div className="group flex flex-col items-start gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-aurum-gold/40 bg-aurum-cream-2 text-aurum-green transition-all duration-500 group-hover:-translate-y-1 group-hover:border-aurum-gold group-hover:shadow-[0_16px_30px_-16px_rgba(200,160,77,0.8)]">
                    <Icon size={26} weight="light" />
                  </span>
                  <h3 className="font-fraunces text-lg font-semibold text-aurum-ink">
                    {f.title}
                  </h3>
                  <p className="font-nunito text-sm leading-relaxed text-aurum-ink-soft">
                    {f.blurb}
                  </p>
                </div>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
