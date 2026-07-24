import { asset } from "@/lib/asset";

/**
 * Aurum Beans circular brand badge. Real logo file lives at
 * public/aurum/logo.png (masked to a transparent circle) so it drops cleanly
 * onto both cream and forest-green surfaces.
 */
export default function Logo({
  size = 44,
  withWordmark = false,
  wordmarkClass = "",
}: {
  size?: number;
  withWordmark?: boolean;
  wordmarkClass?: string;
}) {
  return (
    <span className="inline-flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/aurum/logo.png")}
        alt="Aurum Beans"
        width={size}
        height={size}
        className="rounded-full"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span
          className={`font-fraunces text-lg font-semibold tracking-wide ${wordmarkClass}`}
        >
          Aurum Beans
        </span>
      )}
    </span>
  );
}
