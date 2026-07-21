"use client"

import Link from "next/link"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { PORTALS } from "@/lib/portals"
import Image from "next/image"

export function FooterSection() {
  const { lang } = useLang()

  return (
    <footer id="contact" className="scroll-mt-16" style={{ backgroundColor: "#0b1a30" }}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-x-8 md:gap-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="DSC Logo" width={32} height={32} className="object-contain" />
              <div>
                <span className="text-lg font-bold text-white">DSC</span>
                <p className="text-xs" style={{ color: "#00a4e4" }}>
                  {t(
                          {
                            en: "Development Secrets Consultancy",
                            ar: "استشارية أسرار التطور",
                          },
                          lang
                        )}
                </p>
              </div>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/message/XGN76UVRTVL7C1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#00a4e4] transition-colors text-base"
              >
                <i className="fab fa-whatsapp" />
              </a>
              <a
                href="https://www.facebook.com/share/17cqyrgK7t/"
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

          <div className="hidden md:flex md:flex-col md:gap-0.5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-start md:text-center text-white">
              {t({ en: "Main Portals", ar: "البوابات الرئيسية" }, lang)}
            </h3>
            <nav className="grid grid-cols-1 gap-y-0.5 md:grid-cols-2 md:gap-x-4">
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
            <h3 className="text-sm font-semibold uppercase tracking-wider text-start text-white md:text-center">
              {t({ en: "Contact Us", ar: "تواصل معنا" }, lang)}
            </h3>
            <div className="grid grid-cols-1 gap-y-1 text-sm text-white/60 md:grid-cols-2 md:gap-x-4 md:gap-y-0.5">
              <p>
                {t(
                  {
                    en: "+962 78012 7435",
                    ar: "+962 78012 7435",
                  },
                  lang
                )}
              </p>
              <p>support@dsc.ac</p>
              <p>www.dsc.ac</p>
              <p>
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

        <div className="mt-6 border-t border-white/10 pt-3 text-center text-xs text-white/40 md:mt-3 md:pt-2">
          © 2026 Development Secrets Consultancy.{" "}
          {t({ en: "All rights reserved.", ar: "جميع الحقوق محفوظة." }, lang)}
        </div>
      </div>
    </footer>
  )
}
