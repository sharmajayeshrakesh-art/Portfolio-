"use client";

import { InstagramLogo, WhatsappLogo, Phone } from "@phosphor-icons/react";
import { gym } from "@/lib/gym";
import Logo from "./Logo";
import { useOfferLive } from "./useOfferLive";

export default function Footer() {
  const live = useOfferLive();
  return (
    <footer className={`relative overflow-hidden bg-k2-black py-14 ${live ? "" : "border-t border-white/10"}`}>
      {live && <span className="k2-tiranga-bar absolute inset-x-0 top-0" />}
      <div className="mx-auto max-w-5xl px-6 text-center">
        <div className="flex justify-center">
          <Logo size={64} />
        </div>
        <p className="mt-4 font-anton text-3xl uppercase text-white">
          Key <span className="text-k2-red">2</span> Fitness
        </p>
        <p className="mt-1 font-anton text-sm uppercase tracking-[0.3em] text-k2-gold">
          {gym.tagline}
        </p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <a href={gym.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition-all hover:-translate-y-0.5 hover:border-k2-red hover:text-k2-red">
            <InstagramLogo size={20} weight="fill" />
          </a>
          <a href={gym.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition-all hover:-translate-y-0.5 hover:border-k2-red hover:text-k2-red">
            <WhatsappLogo size={20} weight="fill" />
          </a>
          <a href={`tel:${gym.phoneTel}`} aria-label="Call" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition-all hover:-translate-y-0.5 hover:border-k2-red hover:text-k2-red">
            <Phone size={20} weight="fill" />
          </a>
        </div>

        <div className="mt-6 space-y-1 font-nunito text-sm text-k2-smoke">
          <p>{gym.hoursWeek}</p>
          <p>{gym.hoursSun}</p>
        </div>

        {live && (
          <p className="mt-8 font-anton text-lg uppercase tracking-[0.2em]">
            <span className="k2-tiranga-text">Jai Hind</span>{" "}
            <span className="text-k2-fog">· Happy Independence Day</span>
          </p>
        )}
        <p className="mt-5 font-nunito text-sm text-k2-fog">Made with 💪 in Bhugaon, Pune</p>
        <p className="mt-2 font-nunito text-xs text-k2-smoke">
          © {2026} Key 2 Fitness. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
