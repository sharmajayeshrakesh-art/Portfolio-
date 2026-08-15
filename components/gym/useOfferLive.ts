"use client";

import { useEffect, useState } from "react";

/* The Independence Day promo runs through the end of 20 Aug 2026 (IST).
   2026-08-20 24:00 IST == 2026-08-20 18:30 UTC. */
const OFFER_END_MS = Date.UTC(2026, 7, 20, 18, 30, 0);

/**
 * Returns whether the 15 Aug offer is still live.
 * Starts `true` so the server-rendered / first-paint markup matches the
 * static export (no hydration mismatch), then re-checks the real date on
 * mount and hides the festive elements automatically once the promo ends.
 */
export function useOfferLive() {
  const [live, setLive] = useState(true);
  useEffect(() => {
    setLive(Date.now() <= OFFER_END_MS);
  }, []);
  return live;
}
