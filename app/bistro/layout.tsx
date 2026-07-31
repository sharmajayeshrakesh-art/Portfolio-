import type { Metadata } from "next";
import Intro from "@/components/bistro/Intro";
import Watermark from "@/components/bistro/Watermark";

export const metadata: Metadata = {
  title: "Bistro Brew · Café & Bakery · SKYi Town Centre, Pune",
  description:
    "A bright, leafy café under a ceiling of woven cane lamps at SKYi Town Centre, Paud Road, Pune. Fresh coffee, easy food, mocktails and the kind of afternoon you don't want to end.",
  openGraph: {
    title: "Bistro Brew · SKYi Town Centre, Pune",
    description: "A sunny little corner under a ceiling of cane lamps. Good coffee, easy food, better afternoons.",
    type: "website",
  },
};

export default function BistroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bb-root min-h-screen">
      {children}
      <Intro />
      <Watermark />
    </div>
  );
}
