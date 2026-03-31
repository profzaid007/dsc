"use client";

import Link from "next/link";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import { SITE_CONTENT } from "@/lib/site-content";

export function FooterSection() {
  const { lang } = useLang();
  const { nav, footer } = SITE_CONTENT;

  return (
    <footer
      id="contact"
      className="scroll-mt-16"
      style={{ backgroundColor: "var(--dsc-navy)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand column */}
          <div className="flex flex-col gap-3">
            <span className="text-2xl font-bold text-white">DSC</span>
            <p className="text-sm leading-relaxed" style={{ color: "var(--dsc-gold)" }}>
              {t(footer.tagline, lang)}
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              {t(footer.linksTitle, lang)}
            </h3>
            <nav className="flex flex-col gap-2">
              {[
                { label: nav.home, href: "/" },
                { label: nav.aboutUs, href: "/#about" },
                { label: nav.services, href: "/#services" },
                { label: nav.contactUs, href: "/#contact" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {t(label, lang)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              {t(footer.contactTitle, lang)}
            </h3>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <span>{t(footer.contact.email, lang)}</span>
              <span>{t(footer.contact.phone, lang)}</span>
              <span>{t(footer.contact.location, lang)}</span>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          {t(footer.copyright, lang)}
        </div>
      </div>
    </footer>
  );
}
