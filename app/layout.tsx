import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import GrainOverlay from "@/components/motion/GrainOverlay";
import PageLoader from "@/components/motion/PageLoader";
import SoundToggle from "@/components/motion/SoundToggle";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meridian · Websites worth paying for",
  description:
    "An independent studio designing and building premium websites. Craft you can feel in the first five seconds.",
  openGraph: {
    title: "Meridian · Websites worth paying for",
    description:
      "An independent studio designing and building premium websites.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fafafb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${geist.variable} ${geistMono.variable}`}
      >
        <PageLoader />
        <GrainOverlay />
        <CustomCursor />
        <LenisProvider>{children}</LenisProvider>
        <SoundToggle />
      </body>
    </html>
  );
}
