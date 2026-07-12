"use client";

import Reveal from "@/components/motion/Reveal";

/**
 * The studio / how we work — the trust builder. Pinned-side editorial layout
 * (sticky heading + revealed principles): a distinct layout family from the
 * hero, statement, work, and beyond sections. Light theme resumes here.
 */
const PRINCIPLES = [
  {
    n: "01",
    title: "Clarity before decoration",
    body: "We find the one thing a visitor must feel, then build everything around it. Nothing on the page is there by accident.",
  },
  {
    n: "02",
    title: "Design and engineering, one hand",
    body: "No handoff gaps. The people designing it are the people building it, so the live site matches the vision pixel for pixel.",
  },
  {
    n: "03",
    title: "Motion with meaning",
    body: "Every animation earns its place by guiding attention or telling a story. If it only decorates, it does not ship.",
  },
  {
    n: "04",
    title: "Beautiful that also performs",
    body: "Fast, accessible, and stable on a mid-range phone. Craft you can feel and a Lighthouse score you can show a client.",
  },
];

export default function Craft() {
  return (
    <section
      id="craft"
      className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40 lg:px-16"
    >
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        {/* Sticky heading */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight text-ink md:text-5xl">
            How we
            <br />
            keep the bar
            <br />
            this high.
          </h2>
          <p className="mt-6 max-w-[40ch] text-ink-2">
            A small, senior team. No juniors learning on your budget, no
            account managers between you and the work.
          </p>
        </div>

        {/* Principles */}
        <Reveal className="flex flex-col" stagger={0.12} y={32}>
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.n}
              data-cursor="Read"
              className={`group flex gap-6 py-8 md:gap-10 md:py-10 ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <span className="font-mono text-sm text-ink-4 transition-colors group-hover:text-accent">
                {p.n}
              </span>
              <div>
                <h3 className="font-display text-2xl font-medium tracking-tight text-ink md:text-3xl">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-[52ch] leading-relaxed text-ink-2">
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
