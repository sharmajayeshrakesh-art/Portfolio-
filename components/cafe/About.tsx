"use client";

import { asset } from "@/lib/asset";
import Reveal from "./Reveal";
import Ornament from "./Ornament";

export default function About() {
  return (
    <section id="about" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Ornament className="mb-16" />
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Story */}
          <Reveal className="order-2 md:order-1">
            <p className="mb-5 font-mukta text-xs uppercase tracking-[0.28em] text-gold-2/80">
              Our Story
            </p>
            <h2 className="font-cormorant text-4xl font-semibold leading-tight text-gold-2 sm:text-5xl">
              A little corner of the South, in the heart of Pune.
            </h2>
            <div className="mt-6 space-y-5 font-mukta text-[15px] leading-relaxed text-cream/75">
              <p>
                Cafe Hari Rasa was born from a simple devotion, to serve the food
                we grew up on, made the way our grandmothers made it. Batter
                ground fresh, coffee decoction pulled by hand, ghee that fills
                the room before the plate reaches the table.
              </p>
              <p>
                Step inside and the city falls away. A Radha-Krishna relief
                watches over warm velvet seating, a small Ganesha shrine glows
                beside the window, and hand-laid tiles climb a staircase lit like
                a little temple. It is, quite deliberately, one of the most
                photogenic rooms on FC Road.
              </p>
              <p className="text-cream/90">
                Pure vegetarian, always. Sacred in spirit, warm in welcome, and
                open to everyone who loves good South Indian food.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {["100% Pure Veg", "Freshly Ground Batter", "Aesthetic Ambience"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full border border-gold/25 bg-gold/5 px-4 py-1.5 font-mukta text-xs tracking-wide text-gold-2"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </Reveal>

          {/* Image */}
          <Reveal className="order-1 md:order-2" delay={0.15}>
            <figure className="group relative overflow-hidden rounded-2xl ring-1 ring-gold/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset("/cafe/about-interior.jpg")}
                alt="Radha-Krishna relief and warm velvet seating inside Cafe Hari Rasa"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cafe-black/80 to-transparent p-4 font-mukta text-xs tracking-wide text-cream/70">
                Inside the cafe · Radha-Krishna relief & velvet seating
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
