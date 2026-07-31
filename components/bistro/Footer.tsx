import { WhatsappLogo, Phone } from "@phosphor-icons/react/dist/ssr";
import { asset } from "@/lib/asset";
import { bistro } from "@/lib/bistrobrew";

export default function Footer() {
  return (
    <footer className="border-t border-bb-cane/25 bg-bb-cream py-14 pb-24 md:pb-14">
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/bistro/brand/logo-bistrobrew.png")} alt="Bistro Brew" className="h-14 w-14" />
          <p className="font-bricolage text-2xl font-bold text-bb-terracotta">Bistro Brew</p>
          <p className="font-mukta text-base text-bb-muted">{bistro.nameDevanagari}</p>
          <p className="max-w-md font-karla text-sm text-bb-muted">{bistro.landmark}. Open daily from 12 PM.</p>
          <div className="mt-3 flex items-center gap-4">
            <a href={bistro.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full border border-bb-cane/40 text-bb-terracotta transition-colors hover:border-bb-terracotta">
              <WhatsappLogo size={20} weight="fill" />
            </a>
            <a href={`tel:${bistro.phoneTel}`} aria-label="Call" className="flex h-11 w-11 items-center justify-center rounded-full border border-bb-cane/40 text-bb-terracotta transition-colors hover:border-bb-terracotta">
              <Phone size={20} weight="fill" />
            </a>
          </div>
          <p className="mt-6 font-karla text-xs text-bb-muted/80">© {2026} Bistro Brew. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
