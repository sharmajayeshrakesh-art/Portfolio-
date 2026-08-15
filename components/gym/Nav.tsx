"use client";

import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { gym } from "@/lib/gym";
import Logo from "./Logo";

const LINKS = [
  { label: "Plans", href: "#plans" },
  { label: "Why Us", href: "#why" },
  { label: "Classes", href: "#classes" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
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
      className={`fixed inset-x-0 top-9 z-50 transition-all duration-300 sm:top-10 ${
        scrolled ? "bg-k2-black shadow-[0_10px_30px_-18px_#000]" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <a href="#top" aria-label="Key 2 Fitness home" className="shrink-0">
          <Logo size={scrolled ? 40 : 46} withWordmark />
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative font-anton text-sm uppercase tracking-wide text-white/85 transition-colors hover:text-k2-gold"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-k2-red transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a
            href="#plans"
            className="inline-flex items-center rounded-sm bg-k2-red px-5 py-2.5 font-anton text-sm uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-k2-red-2"
          >
            Join Now
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={28} /> : <List size={28} />}
        </button>
      </nav>

      <div
        className={`overflow-hidden border-t border-white/10 bg-k2-black transition-[max-height] duration-500 lg:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-white/10 py-3 font-anton text-lg uppercase tracking-wide text-white/90"
            >
              {l.label}
            </a>
          ))}
          <a
            href={gym.whatsapp}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex items-center justify-center rounded-sm bg-k2-red px-5 py-3 font-anton text-sm uppercase tracking-wide text-white"
          >
            Join Now
          </a>
        </div>
      </div>
    </header>
  );
}
