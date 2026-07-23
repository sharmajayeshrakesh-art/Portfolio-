"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import { cafe } from "@/lib/cafe";
import { List, X } from "@phosphor-icons/react";

const LINKS = [
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
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
          ? "border-b border-gold/15 bg-cafe-black/85 py-3 backdrop-blur-md"
          : "border-b border-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Logo slot */}
        <a href="#top" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/cafe/logo.png")}
            alt="Cafe Hari Rasa"
            className="h-11 w-11 rounded-full ring-1 ring-gold/30 sm:h-12 sm:w-12"
          />
          <span className="font-cormorant text-lg font-semibold tracking-[0.12em] text-gold-2 sm:text-xl">
            CAFE HARI RASA
          </span>
        </a>

        {/* Desktop links */}
        <nav className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm tracking-wide text-cream/80 transition-colors hover:text-gold-2"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#visit"
            className="rounded-full border border-gold/50 bg-gold/10 px-5 py-2 text-sm font-medium text-gold-2 transition-colors hover:bg-gold hover:text-cafe-black"
          >
            Order / Visit Us
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-gold-2 md:hidden"
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <List size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col gap-1 border-t border-gold/15 bg-cafe-black/95 px-5 py-4 backdrop-blur-md">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2.5 font-cormorant text-2xl text-cream/90"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#visit"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-gold px-5 py-3 text-center text-sm font-semibold text-cafe-black"
            >
              Order / Visit Us
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
