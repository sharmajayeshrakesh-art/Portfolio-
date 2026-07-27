"use client";

import { MapPin, Clock, Phone, InstagramLogo, WhatsappLogo } from "@phosphor-icons/react";
import { gym } from "@/lib/gym";
import Reveal, { RevealItem } from "./Reveal";

export default function Contact() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(gym.mapsQuery)}&output=embed`;

  const rows = [
    { icon: MapPin, label: "Location", value: gym.address },
    { icon: Clock, label: "Hours", value: `${gym.hoursWeek}\n${gym.hoursSun}` },
    { icon: Phone, label: "Phone / WhatsApp", value: gym.phone, href: gym.whatsapp },
    { icon: InstagramLogo, label: "Instagram", value: gym.instagramHandle, href: gym.instagram },
  ];

  return (
    <section id="contact" className="relative overflow-hidden bg-k2-black py-20 sm:py-28">
      <div
        className="pointer-events-none absolute right-[-6%] top-[10%] h-[46vh] w-[46vh] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(245,184,0,0.28), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-anton text-sm uppercase tracking-[0.3em] text-k2-red">Join The Beast</p>
          <h2 className="mt-3 font-anton text-4xl uppercase leading-none text-white sm:text-6xl">
            Start your <span className="k2-fire-text">transformation</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-stretch">
          <Reveal stagger={0.1} className="flex flex-col justify-center">
            <div className="space-y-5">
              {rows.map((r) => {
                const Icon = r.icon;
                const inner = (
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-k2-red/12 text-k2-red transition-colors group-hover:bg-k2-red group-hover:text-white">
                      <Icon size={20} weight="fill" />
                    </span>
                    <div>
                      <p className="font-anton text-xs uppercase tracking-[0.2em] text-k2-gold">{r.label}</p>
                      <p className="mt-1 whitespace-pre-line font-nunito text-[15px] text-k2-fog">{r.value}</p>
                    </div>
                  </div>
                );
                return (
                  <RevealItem key={r.label}>
                    {r.href ? (
                      <a href={r.href} target="_blank" rel="noreferrer" className="group block">
                        {inner}
                      </a>
                    ) : (
                      <div className="group">{inner}</div>
                    )}
                  </RevealItem>
                );
              })}
            </div>

            <RevealItem>
              <a
                href={gym.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-k2-red px-8 py-4 font-anton text-base uppercase tracking-wide text-white k2-glow-pulse sm:w-auto"
              >
                <WhatsappLogo size={20} weight="fill" />
                WhatsApp Us — {gym.phone}
              </a>
            </RevealItem>
          </Reveal>

          <Reveal from="right" delay={0.1} className="min-h-[340px]">
            <div className="h-full overflow-hidden rounded-xl border border-white/10 shadow-[0_40px_80px_-40px_#000]">
              <iframe
                title="Key 2 Fitness location map"
                src={mapSrc}
                className="h-full min-h-[340px] w-full"
                style={{ border: 0, filter: "invert(0.92) hue-rotate(180deg)" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
