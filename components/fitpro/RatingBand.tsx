import { Star } from "@phosphor-icons/react/dist/ssr";
import { fitpro } from "@/lib/fitpro";
import { LightLine } from "./Reveal";

/** Slim trust strip. Static text — no counting animation (their strongest asset). */
export default function RatingBand() {
  const items = [
    { v: fitpro.googleRating, l: "Google rating" },
    { v: `${fitpro.googleReviewCount}`, l: "reviews" },
    { v: "7 days", l: "open every week" },
    { v: "6–10", l: "AM to PM" },
  ];
  return (
    <section className="relative bg-fp-panel">
      <LightLine />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-5 py-8 sm:grid-cols-4 sm:px-8">
        {items.map((it, i) => (
          <div key={it.l} className="flex items-center justify-center gap-3 text-center sm:justify-start">
            {i === 0 && <Star size={22} weight="fill" className="text-fp-lime" />}
            <div>
              <p className="font-mono-fp text-2xl font-bold text-fp-warm">{it.v}</p>
              <p className="font-mono-fp text-[10px] uppercase tracking-[0.2em] text-fp-muted">{it.l}</p>
            </div>
          </div>
        ))}
      </div>
      <LightLine />
    </section>
  );
}
