/**
 * Secret Sambar wordmark. A clean typeset lockup (the real logo file can drop
 * into this slot later). `tone` switches for light-on-dark vs dark-on-cream.
 */
export default function Logo({
  tone = "cream",
  size = "md",
}: {
  tone?: "cream" | "ink";
  size?: "sm" | "md" | "lg";
}) {
  const name =
    tone === "cream" ? "text-sambar-cream" : "text-sambar-green";
  const sub = tone === "cream" ? "text-sambar-gold-soft/80" : "text-sambar-brick/80";
  const scale =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  const subScale = size === "lg" ? "text-[11px]" : "text-[9px]";

  return (
    <span className="inline-flex flex-col leading-none">
      <span className={`font-playfair font-bold tracking-tight ${scale} ${name}`}>
        Secret Sambar
      </span>
      <span
        className={`mt-1 font-nunito font-semibold uppercase tracking-[0.32em] ${subScale} ${sub}`}
      >
        South Indian Cuisine
      </span>
    </span>
  );
}
