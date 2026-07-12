"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { projects } from "@/lib/site";
import ProjectCard from "@/components/work/ProjectCard";

/**
 * Selected work. Desktop: a pinned horizontal scroll-pan (vertical scroll drives
 * horizontal travel) — a distinct layout family, canonical pin skeleton
 * (start "top top", scrub). Mobile: a bespoke vertical stack (no pin, natural
 * scroll). Reduced motion / touch fall back to the vertical layout too.
 */
export default function Work() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => track.current!.scrollWidth - window.innerWidth;
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
      });
      const st = ScrollTrigger.create({
        trigger: wrap.current,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        animation: tween,
      });
      return () => {
        st.kill();
        tween.kill();
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="work" ref={wrap} className="relative overflow-hidden bg-paper">
      <div
        ref={track}
        className="flex flex-col gap-16 px-6 py-24 md:h-[100dvh] md:flex-row md:items-center md:gap-10 md:px-10 md:py-0 lg:px-16"
      >
        {/* Intro panel */}
        <div className="flex shrink-0 flex-col justify-center md:mr-6 md:w-[34vw] md:pr-10">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
            Selected work
          </p>
          <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight text-ink md:text-6xl">
            Work that
            <br />
            does the
            <br />
            selling.
          </h2>
          <p className="mt-6 max-w-[38ch] text-ink-2">
            A few builds that show the range. Each one designed to make a
            visitor trust the people behind it.
          </p>
          <p className="mt-6 hidden font-mono text-[11px] uppercase tracking-[0.18em] text-ink-4 md:block">
            Scroll to pan across
          </p>
        </div>

        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}

        {/* Outro CTA panel */}
        <div className="flex shrink-0 flex-col justify-center md:w-[30vw] md:pl-6">
          <h3 className="font-display text-3xl font-medium tracking-tight text-ink md:text-4xl">
            Your project
            <br />
            could be next.
          </h3>
          <a
            href="#contact"
            data-cursor="Start"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-pill bg-ink px-6 py-3.5 text-[15px] font-medium text-paper transition-colors hover:bg-accent"
          >
            Start a project
          </a>
        </div>
      </div>
    </section>
  );
}
