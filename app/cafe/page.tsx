import Nav from "@/components/cafe/Nav";
import Hero from "@/components/cafe/Hero";
import About from "@/components/cafe/About";
import Menu from "@/components/cafe/Menu";
import Gallery from "@/components/cafe/Gallery";
import Visit from "@/components/cafe/Visit";
import Footer from "@/components/cafe/Footer";

export default function CafeHariRasa() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Menu />
        <Gallery />
        <Visit />
      </main>
      <Footer />
    </>
  );
}
