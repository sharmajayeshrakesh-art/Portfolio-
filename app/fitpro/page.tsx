import Header from "@/components/fitpro/Header";
import CoverScreen from "@/components/fitpro/CoverScreen";
import Hero from "@/components/fitpro/Hero";
import RatingBand from "@/components/fitpro/RatingBand";
import Why from "@/components/fitpro/Why";
import Classes from "@/components/fitpro/Classes";
import Space from "@/components/fitpro/Space";
import Plans from "@/components/fitpro/Plans";
import Shrine from "@/components/fitpro/Shrine";
import Reviews from "@/components/fitpro/Reviews";
import Faq from "@/components/fitpro/Faq";
import FindUs from "@/components/fitpro/FindUs";
import Footer from "@/components/fitpro/Footer";

export default function FitproPage() {
  return (
    <>
      <Header />
      <CoverScreen />
      <main>
        <Hero />
        <RatingBand />
        <Why />
        <Classes />
        <Space />
        <Plans />
        <Shrine />
        <Reviews />
        <Faq />
        <FindUs />
      </main>
      <Footer />
    </>
  );
}
