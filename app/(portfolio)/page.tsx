import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Statement from "@/components/sections/Statement";
import Work from "@/components/sections/Work";
import Beyond from "@/components/sections/Beyond";
import Marquee from "@/components/motion/Marquee";
import Services from "@/components/sections/Services";
import Craft from "@/components/sections/Craft";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative">
        <Hero />
        <Statement />
        <Work />
        <Beyond />
        <Marquee />
        <Services />
        <Craft />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
