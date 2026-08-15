"use client";

import { Star, GoogleLogo, Quotes } from "@phosphor-icons/react";
import { reviews, reviewsSummary } from "@/lib/gym";
import Reveal, { RevealItem } from "./Reveal";
import { Eyebrow } from "./Tiranga";

function Stars({ size = 14 }: { size?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-k2-gold" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} weight="fill" />
      ))}
    </span>
  );
}

export default function Reviews() {
  return (
    <section className="relative overflow-hidden bg-k2-charcoal py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <Eyebrow>The Verdict</Eyebrow>
          <h2 className="mt-3 font-anton text-4xl uppercase leading-none text-white sm:text-6xl">
            Rated <span className="k2-fire-text">5★</span> by 13+ members
          </h2>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-k2-charcoal-2 px-4 py-2">
            <GoogleLogo size={16} weight="bold" className="text-white" />
            <Stars size={15} />
            <span className="font-nunito text-sm text-k2-smoke">{reviewsSummary.score} on Google</span>
          </div>
        </Reveal>

        <Reveal className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {reviews.map((r) => (
            <RevealItem key={r.name} className="h-full">
              <div className="flex h-full flex-col rounded-lg border border-white/10 bg-k2-charcoal-2 p-6">
                <Quotes size={26} weight="fill" className="text-k2-red/50" />
                <p className="mt-3 flex-1 font-nunito text-[15px] leading-relaxed text-k2-fog">{r.quote}</p>
                <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full font-anton text-lg text-white"
                    style={{ background: r.tint }}
                    aria-hidden
                  >
                    {r.initial}
                  </span>
                  <div>
                    <p className="font-anton text-sm uppercase tracking-wide text-white">{r.name}</p>
                    <Stars size={12} />
                  </div>
                </div>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
