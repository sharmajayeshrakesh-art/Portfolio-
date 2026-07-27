import Nav from "@/components/gym/Nav";
import Hero from "@/components/gym/Hero";
import WhyUs from "@/components/gym/WhyUs";
import Plans from "@/components/gym/Plans";
import Transformation from "@/components/gym/Transformation";
import Classes from "@/components/gym/Classes";
import Gallery from "@/components/gym/Gallery";
import Reviews from "@/components/gym/Reviews";
import Contact from "@/components/gym/Contact";
import Footer from "@/components/gym/Footer";

export default function Key2Fitness() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <WhyUs />
        <Plans />
        <Transformation />
        <Classes />
        <Gallery />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
