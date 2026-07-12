import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative">
        <Hero />
        {/* Sections land here: Statement, Work, Beyond Websites, Craft, Contact */}
        <div className="h-[60vh]" aria-hidden />
      </main>
    </>
  );
}
