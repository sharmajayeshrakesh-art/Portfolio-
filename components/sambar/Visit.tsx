"use client";

import { Clock, Phone, EnvelopeSimple, InstagramLogo, Leaf, Globe } from "@phosphor-icons/react";
import { sambar } from "@/lib/sambar";
import Reveal, { RevealItem } from "./Reveal";
import { KolamDivider } from "./Motifs";

export default function Visit() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent("Secret Sambar Pune")}&output=embed`;

  const rows = [
    { icon: Clock, label: "Hours", value: sambar.timings },
    { icon: Phone, label: "Call", value: sambar.phoneDisplay, href: `tel:${sambar.phoneTel}` },
    { icon: EnvelopeSimple, label: "Email", value: sambar.email, href: `mailto:${sambar.email}` },
    { icon: Globe, label: "Website", value: sambar.websiteLabel, href: sambar.website },
    { icon: InstagramLogo, label: "Follow", value: sambar.instagramHandle, href: sambar.instagram },
  ];

  return (
    <section id="visit" className="relative overflow-hidden bg-sambar-brick py-24 sm:py-32">
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-playfair text-lg italic text-sambar-gold-soft">come say namaskāram</p>
          <h2 className="mt-1 font-playfair text-4xl font-bold text-sambar-cream sm:text-5xl">
            Visit Us
          </h2>
          <KolamDivider className="mt-6" />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-stretch">
          <Reveal stagger={0.1} className="flex flex-col justify-center">
            <RevealItem>
              <span className="inline-flex items-center gap-2 rounded-full bg-sambar-cream/15 px-4 py-2 font-nunito text-sm font-semibold text-sambar-cream">
                <Leaf size={16} weight="fill" className="text-sambar-gold-soft" />
                All four branches are 100% pure vegetarian
              </span>
            </RevealItem>
            <div className="mt-8 space-y-5">
              {rows.map((r) => {
                const Icon = r.icon;
                const inner = (
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sambar-cream/25 bg-sambar-brick-2/60 text-sambar-gold-soft transition-colors group-hover:border-sambar-gold">
                      <Icon size={18} weight="fill" />
                    </span>
                    <div>
                      <p className="font-nunito text-[11px] font-semibold uppercase tracking-[0.28em] text-sambar-gold-soft/90">
                        {r.label}
                      </p>
                      <p className="mt-1 font-nunito text-[15px] text-sambar-cream/90">{r.value}</p>
                    </div>
                  </div>
                );
                return (
                  <RevealItem key={r.label}>
                    {r.href ? (
                      <a href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group block">
                        {inner}
                      </a>
                    ) : (
                      <div className="group">{inner}</div>
                    )}
                  </RevealItem>
                );
              })}
            </div>
          </Reveal>

          <Reveal y={30} delay={0.1} className="min-h-[340px]">
            <div className="h-full overflow-hidden rounded-[2rem] border border-sambar-gold/25 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)]">
              <iframe
                title="Secret Sambar locations map"
                src={mapSrc}
                className="h-full min-h-[340px] w-full"
                style={{ border: 0 }}
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
