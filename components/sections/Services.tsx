"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { services } from "@/lib/site";
import { Check, Plus } from "@phosphor-icons/react";

/**
 * "What we build" — the types of sites we make together.
 * Desktop: a list on the left; hovering a row updates a sticky GLASS preview on
 * the right, with a cursor-tracked spotlight. Mobile: a dependency-free
 * accordion (grid-rows 0fr->1fr). Distinct layout family. Glass degrades to
 * solid under reduced-transparency; spotlight is fine-pointer only.
 */
export default function Services() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches || !previewRef.current) return;
    const el = previewRef.current;
    const x = gsap.quickTo(spotRef.current, "xPercent", { duration: 0.5, ease: "power3" });
    const y = gsap.quickTo(spotRef.current, "yPercent", { duration: 0.5, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x(((e.clientX - r.left) / r.width - 0.5) * 100);
      y(((e.clientY - r.top) / r.height - 0.5) * 100);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  const s = services[active];

  return (
    <section id="services" className="field-grey">
      <div className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40 lg:px-16">
        <div className="mb-14 max-w-[46ch]">
          <h2 className="font-display text-4xl font-semibold leading-[1.04] tracking-tight text-ink md:text-6xl">
            What we build
            <br />
            together.
          </h2>
          <p className="mt-6 text-lg text-ink-2">
            Tell us where you are and we will tell you the shortest path to a
            site worth paying for. A few of the shapes that path takes:
          </p>
        </div>

        {/* Desktop: list + sticky glass preview */}
        <div className="hidden gap-12 md:grid md:grid-cols-[1fr_1fr] lg:grid-cols-[0.9fr_1.1fr]">
          <ul className="flex flex-col">
            {services.map((svc, i) => (
              <li key={svc.key}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  data-cursor="Preview"
                  className={`group flex w-full items-center justify-between gap-4 border-t border-line py-6 text-left transition-colors ${
                    i === services.length - 1 ? "border-b" : ""
                  }`}
                >
                  <span className="flex items-baseline gap-4">
                    <span
                      className={`font-mono text-xs transition-colors ${
                        active === i ? "text-accent" : "text-ink-4"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-display text-2xl font-medium tracking-tight transition-colors lg:text-3xl ${
                        active === i ? "text-ink" : "text-ink-3"
                      }`}
                    >
                      {svc.title}
                    </span>
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full transition-all ${
                      active === i ? "scale-100 bg-accent" : "scale-0 bg-transparent"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>

          {/* Sticky glass preview */}
          <div className="relative">
            <div className="sticky top-28">
              <div
                ref={previewRef}
                className="glass relative overflow-hidden rounded-surface p-8 lg:p-10"
                style={{ borderRadius: "var(--radius-surface)" }}
              >
                <div
                  ref={spotRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(43,92,255,0.16), transparent 70%)",
                  }}
                />
                <div className="relative">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                    {String(active + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink lg:text-4xl">
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-[38ch] text-lg leading-relaxed text-ink-2">
                    {s.line}
                  </p>

                  {/* Abstract layout wireframe (diagram, not a fake screenshot) */}
                  <div className="mt-8 grid grid-cols-3 gap-3" aria-hidden>
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className="h-14 rounded-[10px] border border-white/50 bg-white/40"
                        style={{
                          gridColumn: n === 0 ? "span 3" : n === 1 ? "span 2" : "span 1",
                          opacity: 0.55 + (n % 3) * 0.12,
                        }}
                      />
                    ))}
                  </div>

                  <ul className="mt-8 flex flex-col gap-2.5">
                    {s.includes.map((inc) => (
                      <li key={inc} className="flex items-center gap-3 text-sm text-ink-2">
                        <Check size={15} weight="bold" className="text-accent" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: accordion */}
        <ul className="flex flex-col md:hidden">
          {services.map((svc, i) => {
            const isOpen = open === i;
            return (
              <li key={svc.key} className="border-t border-line last:border-b">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="flex items-baseline gap-3">
                    <span className={`font-mono text-xs ${isOpen ? "text-accent" : "text-ink-4"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-xl font-medium tracking-tight text-ink">
                      {svc.title}
                    </span>
                  </span>
                  <Plus
                    size={18}
                    className={`shrink-0 text-ink-3 transition-transform duration-300 ${
                      isOpen ? "rotate-45 text-accent" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-4 text-ink-2">{svc.line}</p>
                    <ul className="flex flex-col gap-2 pb-6">
                      {svc.includes.map((inc) => (
                        <li key={inc} className="flex items-center gap-3 text-sm text-ink-2">
                          <Check size={15} weight="bold" className="text-accent" />
                          {inc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
