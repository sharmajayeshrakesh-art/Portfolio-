"use client";

import {
  MapPin,
  Clock,
  Phone,
  EnvelopeSimple,
  InstagramLogo,
  NavigationArrow,
} from "@phosphor-icons/react";
import { aurum } from "@/lib/aurum";
import Reveal, { RevealItem } from "./Reveal";
import Ornament from "./Ornament";

export default function Visit() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(aurum.mapsQuery)}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(aurum.mapsQuery)}`;

  const rows = [
    { icon: MapPin, label: "Find us", value: aurum.address },
    { icon: Clock, label: "Open", value: aurum.timings },
    { icon: Phone, label: "Call", value: aurum.phoneDisplay, href: `tel:${aurum.phoneTel}` },
    { icon: EnvelopeSimple, label: "Email", value: aurum.email, href: `mailto:${aurum.email}` },
    {
      icon: InstagramLogo,
      label: "Follow",
      value: aurum.instagramHandle,
      href: aurum.instagram,
    },
  ];

  return (
    <section id="visit" className="relative overflow-hidden bg-aurum-green-deep py-24 sm:py-32">
      <div
        className="pointer-events-none absolute left-[-8%] bottom-[-10%] h-[46vh] w-[46vh] rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, rgba(212,180,106,0.16), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-parisienne text-3xl text-aurum-gold-soft sm:text-4xl">come say hello</p>
          <h2 className="mt-1 font-fraunces text-4xl font-semibold text-aurum-cream sm:text-5xl">
            Visit Us
          </h2>
          <Ornament className="mt-6" />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-stretch">
          {/* Details */}
          <Reveal stagger={0.1} className="flex flex-col justify-center">
            <div className="space-y-6">
              {rows.map((r) => {
                const Icon = r.icon;
                const content = (
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-aurum-gold/35 bg-aurum-green text-aurum-gold-soft transition-colors group-hover:border-aurum-gold">
                      <Icon size={18} weight="fill" />
                    </span>
                    <div>
                      <p className="font-nunito text-[11px] font-semibold uppercase tracking-[0.28em] text-aurum-gold/80">
                        {r.label}
                      </p>
                      <p className="mt-1 font-nunito text-[15px] leading-relaxed text-aurum-cream/90">
                        {r.value}
                      </p>
                    </div>
                  </div>
                );
                return (
                  <RevealItem key={r.label}>
                    {r.href ? (
                      <a href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group block">
                        {content}
                      </a>
                    ) : (
                      <div className="group">{content}</div>
                    )}
                  </RevealItem>
                );
              })}
            </div>

            <RevealItem>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a
                  href={directions}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-aurum-gold px-7 py-4 text-sm font-semibold text-aurum-green-deep shadow-[0_14px_34px_-14px_rgba(200,160,77,0.95)] transition-all hover:-translate-y-0.5 hover:bg-aurum-gold-2 sm:w-auto"
                >
                  <NavigationArrow size={16} weight="fill" />
                  Get Directions
                </a>
                <a
                  href={`tel:${aurum.phoneTel}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-aurum-gold-soft/50 px-7 py-4 text-sm font-medium text-aurum-cream transition-colors hover:bg-aurum-cream/10 sm:w-auto"
                >
                  <Phone size={16} weight="fill" />
                  Call Us
                </a>
              </div>
            </RevealItem>
          </Reveal>

          {/* Map */}
          <Reveal blur={16} delay={0.1} className="min-h-[340px]">
            <div className="h-full overflow-hidden rounded-[2rem] border border-aurum-gold/25 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]">
              <iframe
                title="Aurum Beans location map"
                src={mapSrc}
                className="h-full min-h-[340px] w-full"
                style={{ border: 0, filter: "saturate(1.05)" }}
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
