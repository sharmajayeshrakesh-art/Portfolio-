"use client";

import { AnimatePresence, motion } from "motion/react";
import { X, WhatsappLogo, Phone, InstagramLogo } from "@phosphor-icons/react";
import { asset } from "@/lib/asset";

/** The person behind these demo sites. */
export const jayesh = {
  name: "Jayesh Sharma",
  role: "Web Designer & Developer",
  blurb:
    "I design and build beautiful, high-converting websites for cafés, restaurants and local businesses in Pune. This demo is one of mine — like it? Let's build yours.",
  phoneDisplay: "+91 77448 42734",
  phoneTel: "+917744842734",
  whatsapp: "https://wa.me/917744842734",
  instagram: "https://instagram.com/webby.jayesh",
  instagramHandle: "@webby.jayesh",
  photo: "/jayesh.jpg",
};

export default function JayeshCard({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="About Jayesh"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/12 bg-[#141416] text-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
            >
              <X size={18} weight="bold" />
            </button>

            {/* Photo header */}
            <div className="relative h-44 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(jayesh.photo)} alt={jayesh.name} className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent" />
            </div>

            <div className="px-6 pb-6 pt-1 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                Made by
              </p>
              <h3 className="mt-1 text-2xl font-bold">{jayesh.name}</h3>
              <p className="mt-1 text-sm font-medium text-amber-400">{jayesh.role}</p>
              <p className="mt-4 text-sm leading-relaxed text-white/70">{jayesh.blurb}</p>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={jayesh.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#22c15e] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  <WhatsappLogo size={18} weight="fill" />
                  WhatsApp me — {jayesh.phoneDisplay}
                </a>
                <div className="flex gap-3">
                  <a
                    href={`tel:${jayesh.phoneTel}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm font-medium text-white/85 transition-colors hover:border-white/40"
                  >
                    <Phone size={16} weight="fill" />
                    Call
                  </a>
                  <a
                    href={jayesh.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm font-medium text-white/85 transition-colors hover:border-white/40"
                  >
                    <InstagramLogo size={16} weight="fill" />
                    Instagram
                  </a>
                </div>
                <p className="text-xs text-white/40">{jayesh.instagramHandle}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
