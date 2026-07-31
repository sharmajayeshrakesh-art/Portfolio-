import { Quotes } from "@phosphor-icons/react/dist/ssr";
import { reviews } from "@/lib/bistrobrew";
import Reveal, { RevealItem } from "./Reveal";

/** Real Google reviews only. Renders nothing if the array is empty. */
export default function Reviews() {
  if (!reviews.length) return null;
  return (
    <section className="bg-bb-mint-soft/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-karla text-xs font-semibold uppercase tracking-[0.2em] text-bb-sage">Kind words</p>
          <h2 className="mt-3 font-bricolage text-3xl font-bold text-bb-ink sm:text-5xl">What people say</h2>
        </Reveal>

        <Reveal className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-2" stagger={0.08}>
          {reviews.map((r) => (
            <RevealItem key={r.name} className="mb-6 break-inside-avoid">
              <figure className="rounded-3xl border border-bb-cane/25 bg-bb-white p-6 shadow-[0_18px_40px_-30px_rgba(46,33,24,0.4)]">
                <Quotes size={26} weight="fill" className="text-bb-mint" />
                <blockquote className="mt-3 font-karla text-[17px] leading-relaxed text-bb-ink/85">{r.text}</blockquote>
                <figcaption className="mt-4 font-bricolage text-sm font-semibold text-bb-sage">{r.name}</figcaption>
              </figure>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
