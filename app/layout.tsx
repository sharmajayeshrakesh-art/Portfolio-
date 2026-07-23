import type { Metadata, Viewport } from "next";
import {
  Space_Grotesk,
  Geist,
  Geist_Mono,
  Cormorant_Garamond,
  Mukta,
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
        className={`${spaceGrotesk.variable} ${geist.variable} ${geistMono.variable} ${cormorant.variable} ${mukta.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
