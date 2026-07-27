import { asset } from "@/lib/asset";

/** Key 2 Fitness circular badge (white disc, transparent corners). */
export default function Logo({
  size = 44,
  withWordmark = false,
}: {
  size?: number;
  withWordmark?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/gym/logo.png")}
        alt="Key 2 Fitness"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="rounded-full"
      />
      {withWordmark && (
        <span className="font-anton text-xl uppercase leading-none tracking-wide text-white">
          Key <span className="text-k2-red">2</span> Fitness
        </span>
      )}
    </span>
  );
}
