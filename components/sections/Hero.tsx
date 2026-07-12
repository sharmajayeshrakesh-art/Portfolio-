"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { site } from "@/lib/site";
import IdentityCard from "@/components/identity-card/IdentityCard";
import MagneticButton from "@/components/motion/MagneticButton";
import { ArrowUpRight } from "@phosphor-icons/react";

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const words = gsap.utils.toArray<HTMLElement>(".hero-word", root.current);
    const rest = gsap.utils.toArray<HTMLElement>(".hero-fade", root.current);

    if (reduce) {
      gsap.set(words, { yPercent: 0 });
      gsap.set(rest, { autoAlpha: 1, y: 0 });
      return;
    }

    // Hidden start (safe: the loader curtain covers this frame). The reveal is
    // played directly on the loader hand-off, with a fallback timer so a
    // missed event can never strand the copy. Not wrapped in a reverting
    // context — the reveal must persist for the life of the page.
    gsap.set(words, { yPercent: 110 });
    gsap.set(rest, { autoAlpha: 0, y: 18 });

    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      gsap
        .timeline()
        .to(words, {
          yPercent: 0,
          duration: 1,
          ease: "power4.out",
          stagger: 0.08,
        })
        .to(
          rest,
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 },
          "-=0.6"
        );
    };
    if ((window as unknown as { __pageReady?: boolean }).__pageReady) play();
    else window.addEventListener("page:ready", play, { once: true });
    const fallback = window.setTimeout(play, 3200);

    // Card -> page resolve: hero lifts and settles as the journey begins.
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      animation: gsap.to(".hero-stage", {
        yPercent: -14,
        rotateX: 8,
        opacity: 0.6,
        ease: "none",
      }),
    });

    return () => {
      window.removeEventListener("page:ready", play);
      window.clearTimeout(fallback);
      st.kill();
    };
  }, []);

  const headlineWords = site.tagline.replace(/\.$/, "").split(" ");

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-[100dvh] items-center px-6 pb-16 pt-28 md:px-10 lg:px-16"
    >
      <div className="hero-stage mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div className="order-2 lg:order-1">
          <p className="hero-fade mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-ink-3 opacity-0">
            <span className="inline-block h-px w-8 bg-accent" />
            {site.studioFull}
          </p>

          <h1 className="font-display text-[clamp(2.6rem,10.5vw,3.4rem)] font-semibold leading-[0.95] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-[5.4rem]">
            {headlineWords.map((w, i) => (
              <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em]">
                <span className="hero-word inline-block">
                  {w}
                </span>
              </span>
            ))}
          </h1>

          <p className="hero-fade mt-7 max-w-[42ch] text-lg leading-relaxed text-ink-2 opacity-0">
            {site.subline}
          </p>

          <div className="hero-fade mt-9 opacity-0">
            <MagneticButton
              as="a"
              href={site.primaryCta.href}
              cursor="Start"
              strength={0.5}
              className="group items-center gap-3 rounded-pill bg-ink px-7 py-4 text-[15px] font-medium text-paper transition-colors hover:bg-accent"
            >
              <span>{site.primaryCta.label}</span>
              <ArrowUpRight
                size={18}
                weight="bold"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </MagneticButton>
          </div>
        </div>

        {/* Identity card */}
        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <IdentityCard />
        </div>
      </div>
    </section>
  );
}
