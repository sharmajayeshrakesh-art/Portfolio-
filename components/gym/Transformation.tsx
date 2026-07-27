"use client";

import { asset } from "@/lib/asset";
import { transformation, gym } from "@/lib/gym";
import Reveal, { RevealItem } from "./Reveal";
import { WhatsappLogo } from "@phosphor-icons/react";

export default function Transformation() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* background image + overlay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/gym/g-reception.jpg")}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-k2-black/85" />
      <div
        className="absolute inset-0 opacity-70"
        style={{ background: "radial-gradient(120% 90% at 80% 30%, rgba(224,30,38,0.3), transparent 55%)" }}
      />

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="font-anton text-sm uppercase tracking-[0.3em] text-k2-gold">Results 100% guaranteed</p>
          <h2 className="mt-3 font-anton text-4xl uppercase leading-[0.9] text-white sm:text-6xl">
            Your transformation
            <br />
            <span className="k2-fire-text">starts today</span>
          </h2>
        </Reveal>

        <Reveal className="mt-14 grid gap-8 sm:grid-cols-3" stagger={0.12}>
          {transformation.map((t) => (
            <RevealItem key={t.stat}>
              <p className="font-anton text-2xl uppercase text-k2-gold sm:text-3xl">{t.stat}</p>
              <p className="mt-2 font-nunito text-sm leading-relaxed text-k2-fog">{t.label}</p>
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
