"use client"

import Link from "next/link"
import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"
import { PORTALS } from "@/lib/portals"
import {
  HeartHandshake,
  Brain,
  GraduationCap,
  Building2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"

const PORTAL_ICONS: Record<string, LucideIcon> = {
  "1": HeartHandshake,
  "2": Brain,
  "4": GraduationCap,
  "5": Building2,
}

const SERVICE_DESCRIPTIONS: Record<string, { en: string; ar: string }> = {
  "anxiety-support": { en: "Professional guidance for anxiety management", ar: "إرشاد متخصص لإدارة القلق" },
  "autism-spectrum-disorder": { en: "Comprehensive evaluation and personalized support plan", ar: "تقييم شامل وخطط دعم مخصصة" },
  "curriculum-design": { en: "Build modern, effective learning curricula", ar: "بناء منهج تعليمي حديث وفعّال" },
  "strategic-planning": { en: "Organizational strategy and goal alignment", ar: "استراتيجية مؤسسية ومواءمة الأهداف" },
}

const POPULAR_SERVICES = [
  { portalId: "1", serviceId: "autism-spectrum-disorder" },
  { portalId: "2", serviceId: "anxiety-support" },
  { portalId: "4", serviceId: "curriculum-design" },
  { portalId: "5", serviceId: "strategic-planning" },
]

export function PortalDiscovery() {
  const { lang } = useLang()

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#edf7f1] opacity-50 blur-3xl" />
        <div className="absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[#edf3fb] opacity-50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1100px] px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#172b3e] md:text-4xl">
            {t({ en: "Explore Our Portals", ar: "استكشف بواباتنا" }, lang)}
          </h2>
          <p className="mt-3 text-base text-[#334252] md:text-lg">
            {t({ en: "Choose the area of support you need", ar: "اختر مجال الدعم الذي تحتاجه" }, lang)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PORTALS.map((portal) => {
            const Icon = PORTAL_ICONS[portal.id]
            if (!Icon) return null

            return (
              <Link
                key={portal.id}
                href={`/portal/${portal.id}`}
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8"
                style={{
                  background: `linear-gradient(135deg, ${portal.accent}12, ${portal.accent}06)`,
                  border: `1px solid ${portal.accent}18`,
                }}
              >
                <div
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${portal.accent}, ${portal.accent}cc)`,
                    boxShadow: `0 8px 24px ${portal.accent}30`,
                  }}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>

                <h3 className="mb-2 text-lg font-bold text-[#172b3e]">
                  {t(portal.title, lang)}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-[#4d5862]">
                  {t(portal.tagline, lang)}
                </p>

                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-300 group-hover:gap-2.5"
                  style={{ color: portal.accent }}
                >
                  {t({ en: "Explore", ar: "استكشف" }, lang)}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>

                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.07] transition-transform duration-500 group-hover:scale-150"
                  style={{ backgroundColor: portal.accent }}
                />
              </Link>
            )
          })}
        </div>

        <div className="mt-14">
          <h3 className="mb-5 text-xs font-extrabold uppercase tracking-wide text-[#263748]">
            {t({ en: "Popular Services", ar: "الخدمات الأكثر طلباً" }, lang)}
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {POPULAR_SERVICES.map((item) => {
              const portal = PORTALS.find((p) => p.id === item.portalId)
              const service = portal?.services.find((s) => s.id === item.serviceId)
              const desc = SERVICE_DESCRIPTIONS[item.serviceId]
              if (!portal || !service) return null

              return (
                <Link
                  key={item.serviceId}
                  href={`/portal/${portal.id}`}
                  className="group flex min-h-[160px] flex-col rounded-xl border border-[#e0e4e7] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg"
                  style={{
                    ["--portal-color" as string]: portal.accent,
                  }}
                >
                  <div
                    className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${portal.accent}14` }}
                  >
                    <span
                      className="text-xs font-bold uppercase"
                      style={{ color: portal.accent }}
                    >
                      {t(portal.title, lang).charAt(0)}
                    </span>
                  </div>
                  <h4 className="mb-1.5 text-sm font-bold text-[#253545] group-hover:text-[#172b3e]">
                    {t(service.name, lang)}
                  </h4>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-[#4d5862]">
                    {desc ? t(desc, lang) : ""}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold transition-all duration-300 group-hover:gap-2"
                    style={{ color: portal.accent }}
                  >
                    {t({ en: "Book Now", ar: "احجز الآن" }, lang)}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* <div className="mt-8 text-center">
          <Link
            href="/programmes"
            className="inline-block text-sm font-bold text-[#17639c] transition-colors hover:text-[#0a3d62]"
          >
            {t({ en: "View All Services", ar: "عرض جميع الخدمات" }, lang)}
            <span className="ml-1 text-base">→</span>
          </Link>
        </div> */}
      </div>
    </section>
  )
}
