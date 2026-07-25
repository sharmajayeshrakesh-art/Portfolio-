import type { Metadata } from "next";
import Watermark from "@/components/sambar/Watermark";

export const metadata: Metadata = {
  title: "Secret Sambar · Authentic South Indian Cuisine · Pune",
  description:
    "Temple-town flavours made fresh in Pune. Ghee dosas, thatte idlis and filter coffee across four pure-vegetarian branches — Bavdhan, Pimpri-Chinchwad, SB Road and Akurdi.",
  openGraph: {
    title: "Secret Sambar · Authentic South Indian Cuisine",
    description: "Temple-town flavours, made fresh across four branches in Pune.",
    type: "website",
  },
};

export default function SambarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sambar-root sambar-grain min-h-screen">
      {children}
      <Watermark />
    </div>
  );
}
