"use client";

import { useEffect, useState } from "react";
import { List, X, WhatsappLogo, Phone } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";
import { bistro } from "@/lib/bistrobrew";

const LINKS = [
  { label: "Menu", href: "#menu" },
  { label: "The space", href: "#space" },
  { label: "Find us", href: "#find-us" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled ? "bg-bb-cream/92 shadow-[0_6px_24px_-16px_rgba(46,33,24,0.4)] backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <a href="#top" aria-label="Bistro Brew home" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/bistro/brand/logo-bistrobrew.png")} alt="Bistro Brew" className="h-10 w-10" />
            <span className="font-bricolage text-lg font-bold text-bb-terracotta">Bistro Brew</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} className="font-karla text-sm font-medium text-bb-ink/70 transition-colors hover:text-bb-terracotta">
                {l.label}
              </a>
            ))}
            <a href={bistro.whatsapp} target="_blank" rel="noreferrer" className="bb-cta inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-karla text-sm font-semibold">
              <WhatsappLogo size={16} weight="fill" />
              WhatsApp
            </a>
          </div>

          <button type="button" onClick={() => setOpen((v) => !v)} className="text-bb-ink md:hidden" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X size={26} /> : <List size={26} />}
          </button>
        </nav>

        <div className={`overflow-hidden bg-bb-cream/98 backdrop-blur-md transition-[max-height] duration-500 md:hidden ${open ? "max-h-72" : "max-h-0"}`}>
          <div className="flex flex-col px-6 py-3">
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="border-b border-bb-cane/20 py-3 font-bricolage text-lg text-bb-ink">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile fixed bottom bar: Call + WhatsApp */}
      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 md:hidden">
        <a href={`tel:${bistro.phoneTel}`} className="flex items-center justify-center gap-2 bg-bb-white py-3.5 font-karla text-sm font-semibold text-bb-terracotta">
          <Phone size={17} weight="fill" />
          Call
        </a>
        <a href={bistro.whatsapp} target="_blank" rel="noreferrer" className="bb-wa flex items-center justify-center gap-2 py-3.5 font-karla text-sm font-semibold">
          <WhatsappLogo size={17} weight="fill" />
          WhatsApp
        </a>
      </div>
    </>
  );
}
