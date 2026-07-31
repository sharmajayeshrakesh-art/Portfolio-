import Reveal from "./Reveal";

/** One warm sentence across the full width. Nothing else. */
export default function WarmLine() {
  return (
    <section className="px-5 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-4xl text-center">
        <p className="font-bricolage text-2xl font-semibold leading-snug text-bb-ink sm:text-4xl">
          Part café, part garden, part the reason your afternoon plans keep getting longer.
        </p>
      </Reveal>
    </section>
  );
}
