"use client";

import { asset } from "@/lib/asset";
import { cafe } from "@/lib/cafe";
import { InstagramLogo, MapPin, Phone } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer className="border-t border-gold/15 bg-cafe-black py-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Logo slot */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/cafe/logo.png")}
            alt="Cafe Hari Rasa"
            className="h-20 w-20 rounded-full ring-1 ring-gold/30"
          />
          <p className="max-w-md font-cormorant text-xl italic text-cream/70">
            {cafe.tagline}
          </p>

          <div className="flex items-center gap-5">
            <a
              href={cafe.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 text-gold-2 transition-colors hover:bg-gold hover:text-cafe-black"
            >
              <InstagramLogo size={20} weight="fill" />
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cafe.mapsQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Directions"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 text-gold-2 transition-colors hover:bg-gold hover:text-cafe-black"
            >
              <MapPin size={20} weight="fill" />
            </a>
            <a
              href={cafe.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Call or WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 text-gold-2 transition-colors hover:bg-gold hover:text-cafe-black"
            >
              <Phone size={20} weight="fill" />
            </a>
          </div>

          <p className="mt-2 font-mukta text-sm text-gold-2/90">
            Made with devotion in Pune 🪷
          </p>
          <p className="font-mukta text-xs text-cream/40">
            © {new Date().getFullYear()} {cafe.name}. Pure vegetarian. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
