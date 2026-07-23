"use client";

import { asset } from "@/lib/asset";
import { highlights, menu } from "@/lib/cafe";
import Reveal, { RevealItem } from "./Reveal";
import Ornament from "./Ornament";

export default function Menu() {
  return (
    <section id="menu" className="relative bg-cafe-ink py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Heading */}
        <Reveal className="text-center">
          <p className="mb-4 font-mukta text-xs uppercase tracking-[0.28em] text-gold-2/80">
            From our kitchen
          </p>
          <h2 className="font-cormorant text-4xl font-semibold text-gold-2 sm:text-6xl">
            Signature dishes
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-mukta text-[15px] text-cream/70">
            Crisp dosas off the griddle, idlis steamed to order, and filter
            coffee the way it was meant to be.
          </p>
        </Reveal>

        {/* Highlight cards */}
        <Reveal
          as="div"
          stagger={0.08}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {highlights.map((h) => (
            <RevealItem key={h.name}>
              <article className="group h-full overflow-hidden rounded-2xl border border-gold/15 bg-cafe-black/60 ring-1 ring-white/5">
                <div className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(h.img)}
                    alt={h.name}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cafe-black/60 to-transparent opacity-70" />
                </div>
                <div className="flex items-start justify-between gap-4 p-5">
                  <div>
                    <h3 className="font-cormorant text-2xl font-semibold text-cream">
                      {h.name}
                    </h3>
                    <p className="mt-2 font-mukta text-sm leading-relaxed text-cream/60">
                      {h.desc}
                    </p>
                  </div>
                  <span className="shrink-0 font-cormorant text-xl font-semibold text-gold-2">
                    {h.price}
                  </span>
                </div>
              </article>
            </RevealItem>
          ))}
        </Reveal>

        <Ornament className="my-20" />

        {/* Full menu */}
        <Reveal className="text-center">
          <h3 className="font-cormorant text-3xl font-semibold text-gold-2 sm:text-4xl">
            The full menu
          </h3>
          <p className="mt-3 font-mukta text-sm text-cream/60">
            Pure veg · prices in rupees
          </p>
        </Reveal>

        <Reveal as="div" stagger={0.06} className="mt-12 grid gap-x-14 gap-y-12 md:grid-cols-2">
          {menu.map((group) => (
            <RevealItem key={group.title}>
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <h4 className="font-cormorant text-2xl font-semibold tracking-wide text-gold-2">
                    {group.title}
                  </h4>
                  <span className="h-px flex-1 bg-gold/20" />
                </div>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item.name} className="flex items-baseline gap-3">
                      <span className="font-mukta text-[15px] text-cream/85">
                        {item.name}
                      </span>
                      <span className="mb-1 flex-1 border-b border-dotted border-gold/20" />
                      <span className="font-mukta text-[15px] tabular-nums text-gold-2">
                        ₹{item.price}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealItem>
          ))}
        </Reveal>

        <p className="mt-14 text-center font-mukta text-sm italic text-cream/50">
          Full menu available in-store. Seasonal specials on weekends.
        </p>
      </div>
    </section>
  );
}
