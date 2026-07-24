import type { Metadata } from "next";
import Watermark from "@/components/aurum/Watermark";

export const metadata: Metadata = {
  title: "Aurum Beans · Premium & Valuable Café · Pimpri, Pune",
  description:
    "Good coffee. Great food. Better vibes. Aurum Beans is Pune's cozy little secret — a flower-lit café in Sant Tukaram Nagar, Pimpri, perfect for work, dates and catch-ups.",
  openGraph: {
    title: "Aurum Beans · Pune's cozy little secret",
    description: "Good coffee. Great food. Better vibes.",
    type: "website",
  },
};

export default function AurumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="aurum-root aurum-grain min-h-screen">
      {children}
      <Watermark />
    </div>
  );
}
