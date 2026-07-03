"use client"

import Link from "next/link"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { PORTALS } from "@/lib/portals"
import Image from "next/image"

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
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="DSC Logo" width={32} height={32} className="object-contain" />
              <div>
                <span className="text-lg font-bold text-white">DSC</span>
                <p className="text-xs" style={{ color: "#00a4e4" }}>
                  Development Secrets Consultancy
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <a
                href="https://wa.me/message/XGN76UVRTVL7C1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#00a4e4] transition-colors text-base"
              >
                <i className="fab fa-whatsapp" />
              </a>
              <a
                href="https://www.facebook.com/share/p/1JMnR99g2Z/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#00a4e4] transition-colors text-base"
              >
                <i className="fab fa-facebook-f" />
              </a>
              <a
                href="https://www.instagram.com/drgeniusdsc?igsh=MXI2eHl5djJ2N2phbA=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#00a4e4] transition-colors text-base"
              >
                <i className="fab fa-instagram" />
              </a>
              <a
                href="https://x.com/DrGeniusDSC"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#00a4e4] transition-colors text-base"
              >
                <i className="fab fa-twitter" />
              </a>
              <a
                href="https://www.linkedin.com/in/radwan-abusaif-ab5089323?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#00a4e4] transition-colors text-base"
              >
                <i className="fab fa-linkedin-in" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-center text-white">
              {t({ en: "Main Portals", ar: "البوابات الرئيسية" }, lang)}
            </h3>
            <nav className="grid grid-cols-2 gap-x-4 gap-y-0.5">
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

          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-center text-white">
              {t({ en: "Contact Us", ar: "تواصل معنا" }, lang)}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm text-white/60">
              <p className="flex items-center gap-2">
                <span className="w-4" />
                +962 7988 689123
              </p>
              <p className="flex items-center gap-2">
                <span className="w-4" />
                info@dsc.com
              </p>
              <p className="flex items-center gap-2">
                <span className="w-4" />
                www.dsc.com
              </p>
              <p className="flex items-center gap-2">
                <span className="w-4" />
                {t(
                  {
                     en: "Amman / Jordan",
                      ar: "عمان / الأردن",
                  },
                  lang
                )}
              </p>
            </div>

          </div>
        </div>

        <div className="mt-3 border-t border-white/10 pt-2 text-center text-xs text-white/40">
          © 2026 Development Secrets Consultancy.{" "}
          {t({ en: "All rights reserved.", ar: "جميع الحقوق محفوظة." }, lang)}
        </div>
      </div>
    </footer>
  )
}
