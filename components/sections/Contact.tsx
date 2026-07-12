"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { site } from "@/lib/site";
import MagneticButton from "@/components/motion/MagneticButton";
import Reveal from "@/components/motion/Reveal";
import { ArrowUpRight } from "@phosphor-icons/react";

/**
 * Closing CTA. Centered manifesto layout (distinct family) with a pointer-
 * tracked ambient light behind the headline. Single CTA intent — the same
 * "Start a project" label used across the page — as a mailto.
 */
export default function Contact() {
  const root = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;
    const x = gsap.quickTo(glow.current, "xPercent", { duration: 0.8, ease: "power3" });
    const y = gsap.quickTo(glow.current, "yPercent", { duration: 0.8, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      const r = root.current!.getBoundingClientRect();
      x(((e.clientX - r.left) / r.width - 0.5) * 60);
      y(((e.clientY - r.top) / r.height - 0.5) * 60);
    };
    const el = root.current!;
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section
      id="contact"
      ref={root}
      className="relative flex min-h-[85vh] items-center overflow-hidden px-6 py-32 md:px-10 lg:px-16"
    >
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(43,92,255,0.18), rgba(43,92,255,0))",
        }}
      />

      <Reveal className="mx-auto flex max-w-[1000px] flex-col items-center text-center" stagger={0.12}>
        <span className="glass mb-8 inline-flex items-center rounded-pill px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-2">
          Currently taking projects
        </span>
        <h2 className="font-display text-[clamp(2.6rem,9vw,4.5rem)] font-semibold leading-[1.0] tracking-tight text-ink">
          Let&rsquo;s build something
          <br />
          worth remembering.
        </h2>
        <p className="mt-7 max-w-[46ch] text-lg text-ink-2">
          Tell us what you are making. We reply to every serious enquiry
          within a day.
        </p>

        <div className="mt-10">
          <MagneticButton
            as="a"
            href={`mailto:${site.email}`}
            cursor="Start"
            strength={0.5}
            className="group items-center gap-3 rounded-pill bg-ink px-8 py-4 text-base font-medium text-paper transition-colors hover:bg-accent"
          >
            <span>{site.primaryCta.label}</span>
            <ArrowUpRight
              size={18}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </MagneticButton>
        </div>

        <a
          href={`mailto:${site.email}`}
          data-cursor="Copy"
          className="mt-8 font-mono text-sm text-ink-3 underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          {site.email}
        </a>
      </Reveal>
    </section>
  );
}
