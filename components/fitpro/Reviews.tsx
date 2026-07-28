"use client";

import { Star, GoogleLogo } from "@phosphor-icons/react";
import { reviews, fitpro } from "@/lib/fitpro";
import Reveal, { RevealItem } from "./Reveal";

/** Real Google reviews only. Renders nothing if the array is empty. */
export default function Reviews() {
  if (!reviews.length) return null;
  return (
    <section className="bg-fp-black py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="font-mono-fp text-[11px] uppercase tracking-[0.24em] text-fp-blue">In their words</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-rajdhani text-3xl font-bold tracking-wide text-fp-warm sm:text-5xl">
              {fitpro.googleRating} from {fitpro.googleReviewCount} reviews
            </h2>
            <span className="inline-flex items-center gap-2 font-mono-fp text-[11px] uppercase tracking-[0.16em] text-fp-muted">
              <GoogleLogo size={16} weight="bold" className="text-fp-text" />
              on Google
            </span>
          </div>
        </Reveal>

        <Reveal className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3" stagger={0.08}>
          {reviews.map((r) => (
            <RevealItem key={r.name} className="mb-4 break-inside-avoid">
              <figure className="rounded-lg border border-white/10 bg-fp-panel p-6">
                <div className="flex gap-0.5 text-fp-lime">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} weight="fill" />
                  ))}
                </div>
                <blockquote className="mt-3 font-inter text-[15px] leading-relaxed text-fp-text/85">
                  {r.text}
                </blockquote>
                <figcaption className="mt-4 font-mono-fp text-[11px] uppercase tracking-[0.16em] text-fp-muted">
                  {r.name}
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
