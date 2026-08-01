"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The cane pendant lamps. Rendered in two places at identical positions:
 *  - inside the intro overlay with `animate` (they descend and settle), and
 *  - permanently at the top of the page at rest.
 * Because the coordinates match, the intro hands off seamlessly: the overlay
 * fades and the same lamps are already there, so they appear to simply stay.
 *
 * [leftPercent, restY(px), domeWidth(px), bulbDelay(s), showOnMobile]
 */
export const LAMPS: [number, number, number, number, boolean][] = [
  [20, 34, 70, 0.7, false],
  [36, 8, 86, 0.62, true],
  [52, 40, 64, 0.86, true],
  [68, 14, 82, 0.7, true],
  [84, 28, 72, 0.78, false],
];

function Lamp({
  left,
  restY,
  w,
  bulbDelay,
  onMobile,
  animate,
}: {
  left: number;
  restY: number;
  w: number;
  bulbDelay: number;
  onMobile: boolean;
  animate: boolean;
}) {
  const reduce = useReducedMotion();
  const doAnimate = animate && !reduce;
  const inner = (
    <>
      <span className="h-24 w-px bg-bb-cane/50" />
      <span className="bb-dome" style={{ width: w, height: w * 0.5 }} />
      <span className="bb-bulb mt-1.5 block" style={{ width: 9, height: 9 }} />
      <span
        className="mt-1 block h-16 w-16 rounded-full"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,217,160,0.45), transparent 68%)" }}
      />
    </>
  );

  const cls = `absolute top-0 flex flex-col items-center ${onMobile ? "flex" : "hidden sm:flex"}`;

  if (doAnimate) {
    return (
      <motion.div
        className={cls}
        style={{ left: `${left}%`, x: "-50%" }}
        initial={{ y: -280, opacity: 0 }}
        animate={{ y: restY, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 13, delay: 0.15 + bulbDelay * 0.2 }}
      >
        {inner}
      </motion.div>
    );
  }
  return (
    <div className={cls} style={{ left: `${left}%`, transform: `translate(-50%, ${restY}px)` }}>
      {inner}
    </div>
  );
}

/** The lamp cluster. `animate` makes them descend (used only in the intro). */
export default function CaneLamps({
  animate = false,
  className = "",
}: {
  animate?: boolean;
  className?: string;
}) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 top-0 h-56 ${className}`} aria-hidden>
      {LAMPS.map((l, i) => (
        <Lamp key={i} left={l[0]} restY={l[1]} w={l[2]} bulbDelay={l[3]} onMobile={l[4]} animate={animate} />
      ))}
    </div>
  );
}
