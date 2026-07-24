import { InstagramLogo, Phone, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { aurum } from "@/lib/aurum";
import Logo from "./Logo";
import Ornament from "./Ornament";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-aurum-green py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="flex justify-center">
          <Logo size={72} />
        </div>
        <p className="mt-5 font-fraunces text-2xl font-semibold text-aurum-cream">
          Aurum Beans
        </p>
        <p className="mt-2 font-parisienne text-3xl text-aurum-gold-soft">
          Where every bite feels special
        </p>

        <Ornament className="my-8" />

        <div className="flex items-center justify-center gap-5">
          <a
            href={aurum.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-aurum-gold/35 text-aurum-gold-soft transition-all hover:-translate-y-0.5 hover:border-aurum-gold hover:text-aurum-gold"
          >
            <InstagramLogo size={20} weight="fill" />
          </a>
          <a
            href={`tel:${aurum.phoneTel}`}
            aria-label="Call"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-aurum-gold/35 text-aurum-gold-soft transition-all hover:-translate-y-0.5 hover:border-aurum-gold hover:text-aurum-gold"
          >
            <Phone size={20} weight="fill" />
          </a>
          <a
            href={`mailto:${aurum.email}`}
            aria-label="Email"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-aurum-gold/35 text-aurum-gold-soft transition-all hover:-translate-y-0.5 hover:border-aurum-gold hover:text-aurum-gold"
          >
            <EnvelopeSimple size={20} weight="fill" />
          </a>
        </div>

        <p className="mt-8 font-nunito text-sm text-aurum-cream/70">
          Made with love in Pune 🤎
        </p>
        <p className="mt-2 font-nunito text-xs text-aurum-cream/45">
          © {2026} Aurum Beans · Premium & Valuable. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
