"use client";

import { asset } from "@/lib/asset";
import Reveal, { RevealItem, Parallax } from "./Reveal";
import { KolamDivider } from "./Motifs";

/**
 * "Our Roots" — a heritage story band framing Secret Sambar's own brand
 * illustration (temple towns, sari figures, lotus, deer) like artwork.
 */
export default function Roots() {
  return (
    <section className="relative overflow-hidden bg-sambar-cream-2 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="font-playfair text-lg italic text-sambar-brick">our roots</p>
          <h2 className="mt-1 font-playfair text-4xl font-bold text-sambar-green sm:text-5xl">
            From the temple towns of the South
          </h2>
          <KolamDivider className="mt-6" />
        </Reveal>

        <Reveal y={34} delay={0.1} className="mt-12">
          <Parallax speed={22}>
            <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-sambar-gold/40 bg-sambar-cream p-2 shadow-[0_40px_80px_-40px_rgba(26,77,58,0.5)]">
              <div className="overflow-hidden rounded-[1.5rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset("/sambar/heritage.jpg")}
                  alt="An illustration of South Indian temple gopurams, classical figures, lotus and deer"
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </Parallax>
        </Reveal>

        <Reveal stagger={0.12} className="mt-10">
          <RevealItem>
            <p className="mx-auto max-w-2xl font-nunito text-[17px] leading-relaxed text-sambar-ink-soft">
              Every recipe we serve carries a little of the South with it — the
              gopurams of Tamil Nadu, the ghee and podi of Karnataka, the coconut
              and curry leaf of Kerala. Secret Sambar is our way of bringing that
              devotion to the table, one fresh plate at a time.
            </p>
          </RevealItem>
        </Reveal>
      </div>
    </section>
  );
}
