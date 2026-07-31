import Header from "@/components/bistro/Header";
import Hero from "@/components/bistro/Hero";
import WarmLine from "@/components/bistro/WarmLine";
import TheSpace from "@/components/bistro/TheSpace";
import Menu from "@/components/bistro/Menu";
import Signature from "@/components/bistro/Signature";
import Reviews from "@/components/bistro/Reviews";
import FindUs from "@/components/bistro/FindUs";
import Footer from "@/components/bistro/Footer";

export default function BistroBrewPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WarmLine />
        <TheSpace />
        <Menu />
        <Signature />
        <Reviews />
        <FindUs />
      </main>
      <Footer />
    </>
  );
}
