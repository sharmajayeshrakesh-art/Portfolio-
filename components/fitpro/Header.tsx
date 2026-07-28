"use client";

import { useEffect, useState } from "react";
import { List, X, WhatsappLogo } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";
import { fitpro } from "@/lib/fitpro";

const LINKS = [
  { label: "Timings", href: "#find-us" },
  { label: "Classes", href: "#classes" },
  { label: "Plans", href: "#plans" },
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
          scrolled ? "bg-fp-black/92 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        {scrolled && <div className="fp-lightline absolute inset-x-0 bottom-0 opacity-70" />}
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <a href="#top" aria-label="FITPRO home" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/fitpro/brand/logo-fitpro.png")} alt="FITPRO" className="h-9 w-9" />
            <span className="font-rajdhani text-lg font-bold tracking-[0.14em] text-fp-warm">
              FITPRO
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="font-mono-fp text-[11px] uppercase tracking-[0.16em] text-fp-muted transition-colors hover:text-fp-lime"
              >
                {l.label}
              </a>
            ))}
            <a
              href={fitpro.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="fp-wa inline-flex items-center gap-2 rounded-full px-4 py-2 font-rajdhani text-sm font-semibold"
            >
              <WhatsappLogo size={16} weight="fill" />
              WhatsApp
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-fp-text md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={26} /> : <List size={26} />}
          </button>
        </nav>

        <div
          className={`overflow-hidden border-t border-white/10 bg-fp-black/97 backdrop-blur-md transition-[max-height] duration-500 md:hidden ${
            open ? "max-h-80" : "max-h-0"
          }`}
        >
          <div className="flex flex-col px-6 py-3">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/8 py-3 font-rajdhani text-base tracking-wide text-fp-text"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile fixed WhatsApp bar — always in thumb reach */}
      <a
        href={fitpro.whatsapp}
        target="_blank"
        rel="noreferrer"
        className="fp-wa fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 py-3.5 font-rajdhani text-sm font-semibold md:hidden"
      >
        <WhatsappLogo size={18} weight="fill" />
        Message FITPRO on WhatsApp
      </a>
    </>
  );
}
