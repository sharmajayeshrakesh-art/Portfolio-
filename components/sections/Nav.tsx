"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import MagneticButton from "@/components/motion/MagneticButton";

const LINKS = [
  { label: "Work", href: "#work" },
  { label: "Beyond", href: "#beyond" },
  { label: "Studio", href: "#craft" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href: string) => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: string) => void } })
      .__lenis;
    if (lenis) lenis.scrollTo(href);
    else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[80] transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 md:px-10 lg:px-16">
        <button
          onClick={() => go("#top")}
          data-cursor="Top"
          className="font-display text-base font-semibold uppercase tracking-[0.2em] text-ink"
        >
          {site.studio}
        </button>

        <nav
          className={`hidden items-center gap-1 rounded-pill px-2 py-1.5 transition-all duration-500 md:flex ${
            scrolled ? "glass" : "border border-transparent bg-transparent"
          }`}
        >
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              data-cursor="Go"
              className="rounded-pill px-4 py-2 text-sm text-ink-2 transition-colors hover:bg-ink hover:text-paper"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <MagneticButton
          as="a"
          href="#contact"
          cursor="Start"
          className="items-center rounded-pill border border-ink px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          {site.primaryCta.label}
        </MagneticButton>
      </div>
    </header>
  );
}
