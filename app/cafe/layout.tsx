import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cafe Hari Rasa · Pure Veg South Indian · FC Road, Pune",
  description:
    "Authentic South Indian flavours served with soul. Crisp dosas, soft idlis, filter coffee and a beautiful, sacred space on Ferguson College Road, Pune. Pure vegetarian.",
  openGraph: {
    title: "Cafe Hari Rasa · Pure Veg South Indian, FC Road Pune",
    description: "Authentic South Indian flavours, served with soul.",
    type: "website",
  },
};

export default function CafeLayout({ children }: { children: React.ReactNode }) {
  return <div className="cafe-root cafe-grain min-h-screen">{children}</div>;
}
