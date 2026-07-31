import { asset } from "@/lib/asset";
import { signature } from "@/lib/bistrobrew";
import Reveal, { RevealItem } from "./Reveal";

/** Signature — their own product photography. Large, generous, minimal text. */
export default function Signature() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-karla text-xs font-semibold uppercase tracking-[0.2em] text-bb-sage">Made with care</p>
          <h2 className="mt-3 font-bricolage text-3xl font-bold text-bb-ink sm:text-5xl">A few favourites</h2>
        </Reveal>

        <Reveal className="mt-12 grid gap-6 sm:grid-cols-3" stagger={0.1}>
          {signature.map((s) => (
            <RevealItem key={s.src}>
              <figure>
                <div className="overflow-hidden rounded-3xl border border-bb-cane/25 bg-bb-white shadow-[0_20px_44px_-30px_rgba(46,33,24,0.45)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(s.src)} alt={s.label} loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
                </div>
                <figcaption className="mt-3 text-center font-karla text-sm text-bb-muted">{s.label}</figcaption>
              </figure>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
