"use client"

import Link from "next/link"
import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"
import { PORTALS } from "@/lib/portals"

const PORTAL_CATEGORIES = [
  {
    id: "1",
    color: "#38a968",
    name: { en: "Special Needs", ar: "الاحتياجات الخاصة" },
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="9" r="3.5" />
        <path d="M10 26c0-5 2-8 6-8s6 3 6 8" />
        <circle cx="8" cy="14" r="3" />
        <path d="M3 26c0-4 2-6 5-6" />
        <circle cx="24" cy="14" r="3" />
        <path d="M29 26c0-4-2-6-5-6" />
      </svg>
    ),
  },
  {
    id: "2",
    color: "#347ed9",
    name: { en: "Mental Health", ar: "الصحة النفسية" },
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 27s-10-5.5-10-13a6 6 0 0 1 10-4 6 6 0 0 1 10 4c0 7.5-10 13-10 13z" />
        <path d="M11 15h3l1.5-3 2 6 1.5-3H22" />
      </svg>
    ),
  },
  {
    id: "3",
    color: "#7042ad",
    name: { en: "Innovation", ar: "الابتكار" },
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20c-2-2-3-4-3-7a8 8 0 0 1 16 0c0 3-1 5-3 7" />
        <path d="M12 24h8" />
        <path d="M13 27h6" />
        <path d="M16 4v3" />
        <path d="M5 13H2" />
        <path d="M30 13h-3" />
        <path d="M7 6l2 2" />
        <path d="M25 6l-2 2" />
        <circle cx="16" cy="13" r="3" />
      </svg>
    ),
  },
  {
    id: "4",
    color: "#e9a23b",
    name: { en: "Education", ar: "التعليم" },
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 9l11-5 11 5-11 5z" />
        <path d="M8 12v7c3 3 13 3 16 0v-7" />
        <path d="M27 10v9" />
        <path d="M5 20v-8" />
        <path d="M3 24h7" />
      </svg>
    ),
  },
  {
    id: "5",
    color: "#31a3a8",
    name: { en: "Institution", ar: "المؤسسات" },
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 27V10l11-5 11 5v17" />
        <path d="M10 27V14h12v13" />
        <path d="M13 17h2" />
        <path d="M19 17h2" />
        <path d="M13 21h2" />
        <path d="M19 21h2" />
        <path d="M14 27v-4h4v4" />
      </svg>
    ),
  },
]

const SERVICE_DESCRIPTIONS: Record<string, { en: string; ar: string }> = {
  "autism-spectrum-disorder": { en: "Comprehensive evaluation and personalized support plan", ar: "تقييم شامل وخطط دعم مخصصة" },
  "learning-disabilities": { en: "Assessment and intervention for learning challenges", ar: "تقييم وتدخل لتحديات التعلم" },
  "speech-language-disorders": { en: "Individual speech & language therapy sessions", ar: "جلسات علاج فردي للكلام واللغة" },
  "anxiety-support": { en: "Professional guidance for anxiety management", ar: "إرشاد متخصص لإدارة القلق" },
  "depression-care": { en: "Confidential care and recovery support", ar: "رعاية سرية ودعم التعافي" },
  "trauma-recovery": { en: "Specialized trauma therapy and healing", ar: "علاج متخصص للصدمات والشفاء" },
  "innovation-strategy": { en: "Turn ideas into actionable innovation plans", ar: "تحويل الأفكار إلى خطط ابتكار" },
  "prototype-validation": { en: "Test and validate your prototypes quickly", ar: "اختبار والتحقق من النماذج الأولية" },
  "design-sprints": { en: "Rapid prototyping and user testing cycles", ar: "دورات نمذجة سريعة واختبار المستخدم" },
  "curriculum-design": { en: "Build modern, effective learning curricula", ar: "بناء منهج تعليمي حديث وفعّال" },
  "teacher-training": { en: "Professional development for educators", ar: "تطوير مهني للمعلمين" },
  "learning-assessment": { en: "Data-driven student performance evaluation", ar: "تقييم أداء الطلاب بالبيانات" },
  "strategic-planning": { en: "Organizational strategy and goal alignment", ar: "استراتيجية مؤسسية ومواءمة الأهداف" },
  "policy-development": { en: "Create effective institutional policies", ar: "إنشاء سياسات مؤسسية فعّالة" },
  "operational-excellence": { en: "Streamline operations for better performance", ar: "تبسيط العمليات لأداء أفضل" },
}

const POPULAR_SERVICES = [
  { portalId: "1", serviceId: "autism-spectrum-disorder" },
  { portalId: "2", serviceId: "anxiety-support" },
  { portalId: "3", serviceId: "innovation-strategy" },
]

export function PortalDiscovery() {
  const { lang } = useLang()

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#edf7f1] opacity-50 blur-3xl" />
        <div className="absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[#edf3fb] opacity-50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1100px] px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="animate-fade-in-up text-3xl font-extrabold tracking-tight text-[#172b3e] md:text-4xl">
            {t({ en: "Explore Our Portals", ar: "استكشف بواباتنا" }, lang)}
          </h2>
          <p className="animate-fade-in-up delay-100 mt-2 text-base text-[#334252] md:text-lg">
            {t({ en: "Choose the area of support you need", ar: "اختر مجال الدعم الذي تحتاجه" }, lang)}
          </p>
        </div>

        {/* Category Icons */}
        <div className="animate-fade-in-up delay-200 mb-12 flex items-start justify-between gap-3 px-4">
          {PORTAL_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/portal/${cat.id}`}
              className="group flex flex-1 flex-col items-center text-center"
            >
              <div
                className="mb-3 flex h-[80px] w-[80px] items-center justify-center rounded-full transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg"
                style={{
                  backgroundColor: cat.color,
                  boxShadow: `0 4px 12px ${cat.color}30`,
                }}
              >
                <div className="h-10 w-10">
                  {cat.icon}
                </div>
              </div>
              <span className="text-sm font-bold leading-tight text-[#24313d]">
                {t(cat.name, lang)}
              </span>
            </Link>
          ))}
        </div>

        {/* Popular Services */}
        <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wide text-[#263748]">
          {t({ en: "Popular Services", ar: "الخدمات الأكثر طلباً" }, lang)}
        </h3>

        <div className="grid grid-cols-3 gap-4">
          {POPULAR_SERVICES.map((item) => {
            const portal = PORTALS.find((p) => p.id === item.portalId)
            const service = portal?.services.find((s) => s.id === item.serviceId)
            const desc = SERVICE_DESCRIPTIONS[item.serviceId]
            if (!portal || !service) return null

            return (
              <div
                key={item.serviceId}
                className="flex min-h-[160px] flex-col rounded-lg border border-[#e0e4e7] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md"
              >
                <h4 className="mb-1.5 text-sm font-bold text-[#253545]">
                  {t(service.name, lang)}
                </h4>
                <p className="mb-3 flex-1 text-sm leading-relaxed text-[#4d5862]">
                  {desc ? t(desc, lang) : ""}
                </p>
                <Link
                  href="/register"
                  className="inline-block w-fit rounded-md border border-[#c9dbe8] bg-[#f5f9fc] px-3 py-1.5 text-xs font-bold text-[#17609a] transition-colors hover:bg-[#e9f3f9]"
                >
                  {t({ en: "Book Now", ar: "احجز الآن" }, lang)}
                </Link>
              </div>
            )
          })}
        </div>

        {/* View All */}
        <div className="mt-6 text-center">
          <Link
            href="/programmes"
            className="inline-block text-sm font-bold text-[#17639c] transition-colors hover:text-[#0a3d62]"
          >
            {t({ en: "View All Services", ar: "عرض جميع الخدمات" }, lang)}
            <span className="ml-1 text-base">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
