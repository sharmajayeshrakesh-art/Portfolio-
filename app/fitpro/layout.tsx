import type { Metadata } from "next";
import Intro from "@/components/fitpro/Intro";
import Watermark from "@/components/fitpro/Watermark";

export const metadata: Metadata = {
  title: "FITPRO GYM · Hinjewadi Phase 1 / Marunji, Pune",
  description:
    "A precise, well-lit gym across two floors in Hinjewadi Phase 1, Pune. Imported machines, trainers who watch your form, Zumba, CrossFit & Yoga. Open 6 AM–10 PM, all week. 5.0 on Google.",
  openGraph: {
    title: "FITPRO GYM · Hinjewadi Phase 1, Pune",
    description: "Two floors, imported machines, trainers who watch your form. 5.0 from 159 Google reviews.",
    type: "website",
  },
};

export default function FitproLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fp-root min-h-screen">
      {children}
      <Intro />
      <Watermark />
    </div>
  );
}
