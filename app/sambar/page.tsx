import Nav from "@/components/sambar/Nav";
import Hero from "@/components/sambar/Hero";
import About from "@/components/sambar/About";
import Menu from "@/components/sambar/Menu";
import Gallery from "@/components/sambar/Gallery";
import Branches from "@/components/sambar/Branches";
import Visit from "@/components/sambar/Visit";
import Footer from "@/components/sambar/Footer";

export default function SecretSambar() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Menu />
        <Gallery />
        <Branches />
        <Visit />
      </main>
      <Footer />
    </>
  );
}
