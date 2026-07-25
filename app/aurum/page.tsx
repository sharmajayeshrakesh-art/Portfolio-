import Nav from "@/components/aurum/Nav";
import Hero from "@/components/aurum/Hero";
import About from "@/components/aurum/About";
import Menu from "@/components/aurum/Menu";
import Gallery from "@/components/aurum/Gallery";
import Interlude from "@/components/aurum/Interlude";
import Reviews from "@/components/aurum/Reviews";
import Visit from "@/components/aurum/Visit";
import Footer from "@/components/aurum/Footer";

export default function AurumBeans() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Menu />
        <Gallery />
        <Interlude />
        <Reviews />
        <Visit />
      </main>
      <Footer />
    </>
  );
}
