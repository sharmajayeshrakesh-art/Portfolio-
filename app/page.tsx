import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Statement from "@/components/sections/Statement";
import Work from "@/components/sections/Work";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative">
        <Hero />
        <Statement />
        <Work />
        {/* Sections land here: Beyond Websites, Craft, Contact */}
        <div className="h-[50vh]" aria-hidden />
      </main>
    </>
  );
}
