import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import GrainOverlay from "@/components/motion/GrainOverlay";
import PageLoader from "@/components/motion/PageLoader";
import SoundToggle from "@/components/motion/SoundToggle";

/**
 * Portfolio (Meridian) shell — the premium-details chrome lives here so it
 * only applies to the portfolio, not the /cafe route.
 */
export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageLoader />
      <GrainOverlay />
      <CustomCursor />
      <LenisProvider>{children}</LenisProvider>
      <SoundToggle />
    </>
  );
}
