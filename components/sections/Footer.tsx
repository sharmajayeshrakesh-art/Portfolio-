"use client";

import { site } from "@/lib/site";
import { ArrowUp } from "@phosphor-icons/react";

export default function Footer() {
  const toTop = () => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number) => void } })
      .__lenis;
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-line bg-paper-2">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:px-10 lg:px-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-display text-3xl font-semibold uppercase tracking-[0.14em] text-ink">
              {site.studio}
            </div>
            <p className="mt-3 max-w-[34ch] text-sm text-ink-3">
              {site.studioFull}. Design and build for people who care how it
              feels.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                data-cursor="Open"
                className="text-sm text-ink-2 transition-colors hover:text-accent"
              >
                {s.label}
              </a>
            ))}
            <a
              href={`mailto:${site.email}`}
              data-cursor="Copy"
              className="text-sm text-ink-2 transition-colors hover:text-accent"
            >
              Email
            </a>
          </nav>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-line pt-6">
          <span className="font-mono text-xs text-ink-4">
            © 2026 {site.studioFull}
          </span>
          <button
            onClick={toTop}
            data-cursor="Top"
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-3 transition-colors hover:text-accent"
          >
            Back to top
            <ArrowUp size={14} weight="bold" />
          </button>
        </div>
      </div>
    </footer>
  );
}
