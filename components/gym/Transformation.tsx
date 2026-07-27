"use client";

import { asset } from "@/lib/asset";
import { transformation, gym } from "@/lib/gym";
import Reveal, { RevealItem } from "./Reveal";
import { WhatsappLogo } from "@phosphor-icons/react";

export default function Transformation() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      {/* Cinematic battle-ropes backdrop (moody B&W) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/gym/x-ropes.jpg")}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-k2-black/82" />
      <div
        className="absolute inset-0 opacity-70"
        style={{ background: "radial-gradient(110% 90% at 50% 30%, rgba(224,30,38,0.32), transparent 55%)" }}
      />

      {/* Giant ghost word */}
      <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-anton text-[26vw] uppercase leading-none k2-ghost">
        Relentless
      </span>

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="font-anton text-sm uppercase tracking-[0.3em] text-k2-gold">Results 100% guaranteed</p>
          <h2 className="mt-3 font-anton text-4xl uppercase leading-[0.95] text-white sm:text-6xl">
            Experience fitness
            <br />
            <span className="k2-fire-text">like never before</span>
          </h2>
        </Reveal>

        <Reveal className="mt-14 grid gap-8 sm:grid-cols-3" stagger={0.12}>
          {transformation.map((t) => (
            <RevealItem key={t.stat}>
              <div className="rounded-xl border border-white/10 bg-k2-charcoal-2/70 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-k2-red/60">
                <p className="font-anton text-2xl uppercase text-k2-gold sm:text-3xl">{t.stat}</p>
                <p className="mt-2 font-nunito text-sm leading-relaxed text-k2-fog">{t.label}</p>
              </div>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal className="mt-12" from="up">
          <a
            href={gym.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-sm bg-k2-red px-8 py-4 font-anton text-base uppercase tracking-wide text-white k2-glow-pulse"
          >
            <WhatsappLogo size={20} weight="fill" />
            Start Your Transformation
          </a>
        </Reveal>
      </div>
    </section>
  );
}
