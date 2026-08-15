import type { Metadata } from "next";
import OfferBar from "@/components/gym/OfferBar";
import Watermark from "@/components/gym/Watermark";
import WhatsAppFab from "@/components/gym/WhatsAppFab";

export const metadata: Metadata = {
  title: "Key 2 Fitness · Bhugaon, Bavdhan · Rain Outside, Beast Inside",
  description:
    "Bhugaon's most result-driven gym. Certified trainers, scientific workout + nutrition, weight loss, and visible results in 21 days. Plans from ₹3,999. Bavdhan, Pune.",
  openGraph: {
    title: "Key 2 Fitness · Rain Outside, Beast Inside",
    description: "Build your best self at Bhugaon's most result-driven gym.",
    type: "website",
  },
};

export default function GymLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="k2-root k2-grain min-h-screen">
      <OfferBar />
      {children}
      <WhatsAppFab />
      <Watermark />
    </div>
  );
}
