"use client";

import { WhatsappLogo } from "@phosphor-icons/react";
import { gym } from "@/lib/gym";

/** Always-visible WhatsApp button — the conversion goal. */
export default function WhatsAppFab() {
  return (
    <a
      href={gym.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Enquire on WhatsApp"
      className="k2-whatsapp fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full px-4 py-3 font-anton text-sm uppercase tracking-wide text-white transition-transform hover:-translate-y-0.5"
    >
      <WhatsappLogo size={22} weight="fill" />
      <span className="hidden sm:inline">WhatsApp Us</span>
    </a>
  );
}
