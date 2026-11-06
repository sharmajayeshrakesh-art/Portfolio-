import type { Metadata, Viewport } from "next";
import "./globals.css";

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
      <head>
        {/* Don't let browsers hold on to a stale HTML document between deploys.
            (Hashed JS/CSS assets are already immutable-cached.) */}
        <meta httpEquiv="Cache-Control" content="no-cache, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        {/* Fonts are fetched by the browser at runtime, not by the build.

            They used to come through next/font/google, which downloads every
            face at build time and crashes the whole build — all nine sites —
            if Google returns one malformed response. That killed 4 of the last
            12 deploys. Vendoring the files would be better still (offline,
            no third-party request), but needs the .woff2 files checked in; do
            that when a machine with font access is to hand. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Cormorant+Garamond:wght@400;500;600;700&family=Mukta:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,500;1,600;1,700;1,900&family=Parisienne&family=Nunito+Sans:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&family=Anton&family=Rajdhani:wght@400;500;600;700&family=Inter:wght@100..900&family=JetBrains+Mono:wght@400;500;700&family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Karla:wght@400;500;600;700&display=swap" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
