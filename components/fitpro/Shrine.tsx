import { asset } from "@/lib/asset";
import Reveal from "./Reveal";

/** One quiet, respectful acknowledgement. Real photo, one line. */
export default function Shrine() {
  return (
    <section className="bg-fp-panel py-16 sm:py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-8 px-5 sm:px-8 md:grid-cols-[220px_1fr]">
        <Reveal className="mx-auto w-full max-w-[220px]">
          <div className="overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/fitpro/shrine.jpg")}
              alt="The Hanuman idol at the FITPRO reception"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="font-mono-fp text-[11px] uppercase tracking-[0.22em] text-fp-blue">A small tradition</p>
          <p className="mt-3 font-rajdhani text-2xl font-medium leading-snug tracking-wide text-fp-warm sm:text-3xl">
            Every session here starts past our little shrine at reception, a quiet nod to
            strength, before you go make some of your own.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
