"use client";

import { useEffect, useState } from "react";
import { List, X, MapPin } from "@phosphor-icons/react";
import Logo from "./Logo";

const LINKS = [
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reviews", href: "#reviews" },
  { label: "Visit", href: "#visit" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-aurum-green-deep/95 shadow-[0_10px_30px_-18px_rgba(11,25,20,0.8)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#top" aria-label="Aurum Beans home" className="shrink-0">
          <Logo size={scrolled ? 40 : 46} withWordmark wordmarkClass="text-aurum-cream" />
        </a>

        <div className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative text-sm font-medium tracking-wide text-aurum-cream/85 transition-colors hover:text-aurum-gold-soft"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-aurum-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a
            href="#visit"
            className="inline-flex items-center gap-2 rounded-full bg-aurum-gold px-5 py-2.5 text-sm font-semibold text-aurum-green-deep shadow-[0_8px_24px_-10px_rgba(200,160,77,0.9)] transition-all hover:-translate-y-0.5 hover:bg-aurum-gold-2"
          >
            <MapPin size={15} weight="fill" />
            Visit Us
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-aurum-cream md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={26} /> : <List size={26} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden border-t border-aurum-gold/15 bg-aurum-green-deep/98 backdrop-blur-md transition-[max-height] duration-500 md:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-aurum-gold/10 py-3 font-fraunces text-lg text-aurum-cream/90"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#visit"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-aurum-gold px-5 py-3 text-sm font-semibold text-aurum-green-deep"
          >
            <MapPin size={15} weight="fill" />
            Visit Us
          </a>
        </div>
      </div>
    </header>
  );
}
