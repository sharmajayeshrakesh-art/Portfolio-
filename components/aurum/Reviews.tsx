"use client";

import { Star, GoogleLogo, ArrowUpRight, Quotes } from "@phosphor-icons/react";
import { reviews, reviewsSummary, moreReviewers, type Review } from "@/lib/aurum";
import Reveal, { RevealItem } from "./Reveal";
import Ornament from "./Ornament";

function Stars({ n = 5, size = 15 }: { n?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-aurum-gold" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={size} weight="fill" />
      ))}
    </span>
  );
}

function ScoreChips({ scores }: { scores: NonNullable<Review["scores"]> }) {
  const rows: [string, number][] = [
    ["Food", scores.food],
    ["Service", scores.service],
    ["Atmosphere", scores.atmosphere],
  ];
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {rows.map(([label, v]) => (
        <span
          key={label}
          className="inline-flex items-center gap-1 rounded-full border border-aurum-gold/30 bg-aurum-cream-2 px-3 py-1 font-nunito text-[11px] font-semibold text-aurum-green"
        >
          {label}
          <span className="text-aurum-gold">{v}.0</span>
        </span>
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <div className="aurum-card flex h-full flex-col rounded-[1.5rem] p-6 sm:p-7">
      <Quotes size={26} weight="fill" className="text-aurum-gold/50" />
      <p className="mt-3 flex-1 font-nunito text-[15px] leading-relaxed text-aurum-ink">
        {r.quote}
      </p>
      {r.scores && <ScoreChips scores={r.scores} />}
      <div className="mt-5 flex items-center gap-3 border-t border-aurum-ink/10 pt-4">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-fraunces text-lg font-semibold text-aurum-cream"
          style={{ background: r.tint }}
          aria-hidden
        >
          {r.initial}
        </span>
        <div className="min-w-0">
          <p className="truncate font-fraunces text-[15px] font-semibold text-aurum-ink">
            {r.name}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <Stars size={13} />
            <span className="font-nunito text-xs text-aurum-ink-soft">{r.when}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="relative overflow-hidden bg-aurum-green py-24 sm:py-32">
      {/* soft ambient glow */}
      <div
        className="pointer-events-none absolute left-[-8%] top-[-6%] h-[46vh] w-[46vh] rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, rgba(212,180,106,0.18), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-parisienne text-3xl text-aurum-gold-soft sm:text-4xl">kind words</p>
          <h2 className="mt-1 font-fraunces text-4xl font-semibold text-aurum-cream sm:text-5xl">
            Loved in Pimpri
          </h2>
          <Ornament className="mt-6" />
        </Reveal>

        {/* Rating summary band */}
        <Reveal
          className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-4 rounded-[1.75rem] aurum-glass px-8 py-7 text-center sm:flex-row sm:justify-between sm:text-left"
          delay={0.05}
        >
          <div className="flex items-center gap-4">
            <span className="font-fraunces text-5xl font-black leading-none aurum-gold-text">
              {reviewsSummary.score}
            </span>
            <div>
              <Stars size={18} />
              <p className="mt-1 font-nunito text-sm text-aurum-cream/80">
                from {reviewsSummary.count} Google reviews
              </p>
            </div>
          </div>
          <a
            href={reviewsSummary.url}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-aurum-gold px-5 py-3 font-nunito text-sm font-semibold text-aurum-green-deep transition-all hover:-translate-y-0.5 hover:bg-aurum-gold-2"
          >
            <GoogleLogo size={16} weight="bold" />
            Review us on Google
            <ArrowUpRight size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </Reveal>

        {/* Review cards */}
        <Reveal
          className="mt-12 grid gap-5 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.12}
        >
          {reviews.map((r) => (
            <RevealItem key={r.name} className="h-full">
              <ReviewCard r={r} />
            </RevealItem>
          ))}
        </Reveal>

        {/* Rating-only guests */}
        <Reveal className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-3" delay={0.1}>
          <span className="font-nunito text-sm text-aurum-cream/70">and more happy guests —</span>
          {moreReviewers.map((n) => (
            <span
              key={n}
              className="inline-flex items-center gap-1.5 rounded-full border border-aurum-gold-soft/25 px-3 py-1.5 font-nunito text-xs text-aurum-cream/85"
            >
              <Star size={11} weight="fill" className="text-aurum-gold" />
              {n}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
