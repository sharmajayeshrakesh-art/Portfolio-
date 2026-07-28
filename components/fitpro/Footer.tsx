import { InstagramLogo, WhatsappLogo, Phone } from "@phosphor-icons/react/dist/ssr";
import { asset } from "@/lib/asset";
import { fitpro } from "@/lib/fitpro";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-fp-black py-14">
      <div className="fp-lightline absolute inset-x-0 top-0 opacity-60" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/fitpro/brand/logo-fitpro.png")} alt="FITPRO" className="h-12 w-12" />
            <span className="font-rajdhani text-2xl font-bold tracking-[0.14em] text-fp-warm">FITPRO GYM</span>
          </div>
          <p className="max-w-md font-inter text-sm text-fp-text/60">
            Precision over noise. Hinjewadi Phase 1 / Marunji, Pune.
          </p>
          <div className="flex items-center gap-4">
            <a href={fitpro.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-fp-text/80 transition-colors hover:border-fp-lime hover:text-fp-lime">
              <InstagramLogo size={20} weight="fill" />
            </a>
            <a href={fitpro.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-fp-text/80 transition-colors hover:border-fp-lime hover:text-fp-lime">
              <WhatsappLogo size={20} weight="fill" />
            </a>
            <a href={`tel:${fitpro.phoneTel}`} aria-label="Call" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-fp-text/80 transition-colors hover:border-fp-lime hover:text-fp-lime">
              <Phone size={20} weight="fill" />
            </a>
          </div>
          <p className="font-mono-fp text-[11px] uppercase tracking-[0.18em] text-fp-muted">{fitpro.hoursLabel}</p>
          <p className="font-inter text-xs text-fp-text/40">
            © {2026} FITPRO GYM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
