import type { Metadata, Viewport } from "next";
import {
  Space_Grotesk,
  Geist,
  Geist_Mono,
  Cormorant_Garamond,
  Mukta,
  Fraunces,
  Parisienne,
  Nunito_Sans,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

// Portfolio (Meridian) fonts
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// Cafe Hari Rasa fonts
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});
const mukta = Mukta({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mukta",
  display: "swap",
});

// Aurum Beans fonts (warm, editorial, romantic)
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});
const parisienne = Parisienne({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-parisienne",
  display: "swap",
});
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

// Secret Sambar font (heritage high-contrast serif)
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meridian · Websites worth paying for",
  description: "An independent studio designing and building premium websites.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${geist.variable} ${geistMono.variable} ${cormorant.variable} ${mukta.variable} ${fraunces.variable} ${parisienne.variable} ${nunitoSans.variable} ${playfair.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
