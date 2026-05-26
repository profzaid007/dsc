"use client"

import Link from "next/link"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { PORTALS } from "@/lib/portals"

interface QuickLink {
  en: string
  ar: string
  href: string
}

const QUICK_LINKS: QuickLink[] = [
  { en: "About Us", ar: "من نحن", href: "/" },
  { en: "Why DSC", ar: "لماذا DSC", href: "/" },
  { en: "Services", ar: "الخدمات", href: "/" },
  { en: "Programs & Courses", ar: "البرامج والدورات", href: "/" },
  { en: "Blog", ar: "المدونة", href: "/" },
  { en: "Contact Us", ar: "تواصل معنا", href: "/#contact" },
]

export function FooterSection() {
  const { lang } = useLang()

  return (
    <footer id="contact" className="scroll-mt-16" style={{ backgroundColor: "#0b1a30" }}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="flex flex-col gap-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: "radial-gradient(circle, #d4af37 0%, #aa7c11 100%)" }}
              >
                DSC
              </div>
              <div>
                <span className="text-xl font-bold text-white">DSC</span>
                <p className="text-xs" style={{ color: "#00a4e4" }}>
                  Development Secrets Consultancy
                </p>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              {t(
                {
                  en: "Your Partner in Personal & Professional Growth. We help organizations unlock their potential and maximize impact through research-driven solutions.",
                  ar: "شريكك في النمو الشخصي والمهني. نحن نساعد المؤسسات على إطلاق إمكاناتها وتعظيم الأثر من خلال الحلول القائمة على البحث.",
                },
                lang
              )}
            </p>
            <div className="mt-2 flex gap-2">
              {(["facebook-f", "twitter", "linkedin-in", "instagram", "youtube"]).map(
                (icon) => (
                  <a
                    key={icon}
                    href="#"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#172d4a] text-white transition-colors hover:bg-[#00a4e4]"
                  >
                    <i className={`fab fa-${icon} text-xs`} />
                  </a>
                )
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t({ en: "Quick Links", ar: "روابط سريعة" }, lang)}
            </h3>
            <nav className="flex flex-col gap-2">
              {QUICK_LINKS.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {t({ en: link.en, ar: link.ar }, lang)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t({ en: "Main Portals", ar: "البوابات الرئيسية" }, lang)}
            </h3>
            <nav className="flex flex-col gap-2">
              {PORTALS.map((portal, i) => (
                <Link
                  key={i}
                  href={`/portal/${portal.id}`}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {t(portal.portalName, lang)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t({ en: "Contact Us", ar: "تواصل معنا" }, lang)}
            </h3>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <p className="flex items-center gap-2">
                <i className="fas fa-phone w-4 text-[#00a4e4]" />
                +966 50 123 4567
              </p>
              <p className="flex items-center gap-2">
                <i className="fas fa-envelope w-4 text-[#00a4e4]" />
                info@dsc.com
              </p>
              <p className="flex items-center gap-2">
                <i className="fas fa-globe w-4 text-[#00a4e4]" />
                www.dsc.com
              </p>
              <p className="flex items-center gap-2">
                <i className="fas fa-map-marker-alt w-4 text-[#00a4e4]" />
                {t(
                  {
                    en: "Riyadh, Kingdom of Saudi Arabia",
                    ar: "الرياض، المملكة العربية السعودية",
                  },
                  lang
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © 2025 Development Secrets Consultancy.{" "}
          {t({ en: "All rights reserved.", ar: "جميع الحقوق محفوظة." }, lang)}
        </div>
      </div>
    </footer>
  )
}