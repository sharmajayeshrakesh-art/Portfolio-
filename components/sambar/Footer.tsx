import { InstagramLogo, Phone, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { sambar } from "@/lib/sambar";
import Logo from "./Logo";
import { KolamDivider } from "./Motifs";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-sambar-green-deep py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="flex justify-center">
          <Logo tone="cream" size="lg" />
        </div>

        <KolamDivider className="my-8" />

        <div className="flex items-center justify-center gap-5">
          <a
            href={sambar.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-sambar-gold/35 text-sambar-gold-soft transition-all hover:-translate-y-0.5 hover:border-sambar-gold hover:text-sambar-gold"
          >
            <InstagramLogo size={20} weight="fill" />
          </a>
          <a
            href={`tel:${sambar.phoneTel}`}
            aria-label="Call"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-sambar-gold/35 text-sambar-gold-soft transition-all hover:-translate-y-0.5 hover:border-sambar-gold hover:text-sambar-gold"
          >
            <Phone size={20} weight="fill" />
          </a>
          <a
            href={`mailto:${sambar.email}`}
            aria-label="Email"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-sambar-gold/35 text-sambar-gold-soft transition-all hover:-translate-y-0.5 hover:border-sambar-gold hover:text-sambar-gold"
          >
            <EnvelopeSimple size={20} weight="fill" />
          </a>
        </div>

        <p className="mt-8 font-nunito text-sm text-sambar-cream/70">Made with love in Pune 🪔</p>
        <p className="mt-2 font-nunito text-xs text-sambar-cream/45">
          © {2026} Secret Sambar® · South Indian Cuisine. Trademark registered. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
