"use client";

import { Leaf, Flame, Scroll, MapPin } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";
import { features, type Feature } from "@/lib/sambar";
import Reveal, { RevealItem, Parallax } from "./Reveal";
import { KolamDivider } from "./Motifs";

const ICONS: Record<Feature["icon"], typeof Leaf> = {
  leaf: Leaf,
  flame: Flame,
  scroll: Scroll,
  pin: MapPin,
};

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-sambar-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <KolamDivider className="mb-12" />
        </Reveal>

        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Image with parallax depth */}
          <Reveal className="order-1 md:order-none" y={36}>
            <Parallax speed={26} className="relative">
              <div className="overflow-hidden rounded-[2rem] rounded-br-[5rem] border border-sambar-gold/30 shadow-[0_40px_80px_-40px_rgba(26,77,58,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset("/sambar/about-hall.jpg")}
                  alt="The pillared, garland-draped heritage hall at Secret Sambar"
                  loading="lazy"
                  decoding="async"
                  className="h-[380px] w-full object-cover transition-transform duration-700 hover:scale-[1.04] sm:h-[480px]"
                />
              </div>
              <div className="absolute -bottom-5 -left-4 hidden rounded-2xl bg-sambar-brick px-6 py-4 shadow-[0_24px_50px_-24px_rgba(158,74,47,0.7)] sm:block">
                <p className="font-playfair text-xl font-bold text-sambar-cream">Since day one</p>
                <p className="font-nunito text-xs text-sambar-gold-soft">temple-town flavours</p>
              </div>
            </Parallax>
          </Reveal>

          {/* Story */}
          <Reveal stagger={0.14}>
            <RevealItem>
              <p className="font-nunito text-xs font-semibold uppercase tracking-[0.3em] text-sambar-brick">
                Our Story
              </p>
            </RevealItem>
            <RevealItem>
              <h2 className="mt-4 font-playfair text-4xl font-bold leading-[1.05] text-sambar-green sm:text-5xl">
                Temple-town flavours,
                <span className="italic text-sambar-brick"> made fresh</span> in Pune.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-6 max-w-lg font-nunito text-[17px] leading-relaxed text-sambar-ink-soft">
                Secret Sambar is an authentic South Indian kitchen bringing the
                comfort of ghee-rich dosas, pillowy thatte idlis and strong
                filter coffee to four corners of Pune. Every plate is cooked to
                order the traditional way — which is why we ask for a little
                patience, and reward it with food worth the wait.
              </p>
            </RevealItem>
            <RevealItem>
              <p className="mt-4 max-w-lg font-nunito text-[17px] leading-relaxed text-sambar-ink-soft">
                Pure vegetarian, rooted in recipes passed down through
                generations, and served in spaces dressed with marigolds, brass
                and banana leaves. A little bit of the temple town, close to home.
              </p>
            </RevealItem>
          </Reveal>
        </div>

        {/* Feature row */}
        <Reveal className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 sm:mt-24 lg:grid-cols-4" stagger={0.12}>
          {features.map((f) => {
            const Icon = ICONS[f.icon];
            return (
              <RevealItem key={f.title}>
                <div className="group flex flex-col items-center gap-3 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-sambar-gold/40 bg-sambar-cream-2 text-sambar-green transition-all duration-500 group-hover:-translate-y-1 group-hover:border-sambar-gold group-hover:shadow-[0_16px_30px_-16px_rgba(200,160,77,0.8)]">
                    <Icon size={28} weight="light" />
                  </span>
                  <h3 className="font-playfair text-lg font-bold text-sambar-ink">{f.title}</h3>
                </div>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
