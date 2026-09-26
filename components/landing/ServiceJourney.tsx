"use client"

import Image from "next/image"
import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"
import {
  Users,
  UserPlus,
  Rocket,
  UserCheck,
  UserCircle,
  ClipboardList,
  FolderOpen,
  Handshake,
  ListChecks,
  RefreshCw,
  RefreshCcw,
  CreditCard,
  HeartHandshake,
  FileBarChart,
  Briefcase,
  ShieldCheck,
  BadgeCheck,
  Building2,
  Stethoscope,
  ClipboardCheck,
} from "lucide-react"

const SERVICE_STEPS = [
  { icon: UserPlus, en: "Create Account", ar: "إنشاء حساب" },
  { icon: FolderOpen, en: "Case", ar: "الحالة" },
  { icon: ClipboardList, en: "Need", ar: "الاحتياج" },
  { icon: ClipboardCheck, en: "Assessment", ar: "التقييم" },
  { icon: ListChecks, en: "Individual Plan", ar: "الخطة الفردية" },
  { icon: HeartHandshake, en: "Intervention", ar: "التدخل" },
  { icon: RefreshCw, en: "Follow-up", ar: "المتابعة" },
  { icon: FileBarChart, en: "Outcomes", ar: "النتائج" },
]

const INSTIUTION_STEPS = [
  { icon: UserPlus, en: "Create Account", ar: "إنشاء حساب" },
  { icon: UserCircle, en: "Profile", ar: "الملف الشخصي" },
  { icon: ShieldCheck, en: "Verification", ar: "التحقق" },
  { icon: Handshake, en: "Partnership", ar: "الشراكة" },
  { icon: Users, en: "Collaboration", ar: "التعاون" },
  { icon: Rocket, en: "Implementation", ar: "التنفيذ" },
  { icon: ClipboardCheck, en: "Evaluation", ar: "التقييم" },
  { icon: RefreshCcw, en: "Continuity", ar: "الاستمرارية" },
]

const PROVIDER_STEPS = [
  { icon: UserPlus, en: "Create Account", ar: "إنشاء حساب" },
  { icon: UserCircle, en: "Profile", ar: "الملف الشخصي" },
  { icon: ShieldCheck, en: "Verification", ar: "التحقق" },
  { icon: BadgeCheck, en: "Approval", ar: "الموافقة" },
  { icon: Users, en: "Assignment", ar: "التكليف" },
  { icon: HeartHandshake, en: "Service", ar: "الخدمة" },
  { icon: RefreshCw, en: "Follow-up", ar: "المتابعة" },
  { icon: CreditCard, en: "Payment", ar: "الدفع" },
]

export function ServiceJourney() {
  const { lang } = useLang()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white py-20 md:py-28">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-[#edf7f1] opacity-60 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-64 w-64 rounded-full bg-[#edf3fb] opacity-60 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1100px] px-6">
        {/* Section heading */}
        <h2 className="animate-fade-in-up mb-14 text-center text-3xl font-bold tracking-tight text-[#0b2545] md:text-4xl">
          {t(
            { en: "Your Journey with DSC", ar: "رحلتك مع DSC" },
            lang
          )}
        </h2>

        {/* Cards + logo container */}
        <div className="relative flex flex-col items-center md:flex-row gap-4">
          {/* SERVICE RECIPIENT */}
          <div className="animate-fade-in-left delay-200 journey-card z-[1] w-full flex-1 rounded-2xl bg-[#edf7f1] p-6 pr-10 md:pr-12 md:pl-6">
            <h3 className="mb-5 text-sm font-bold tracking-widest text-[#557d6b]">
              {t(
                { en: "SERVICE RECIPIENT JOURNEY", ar: "مسار مقدم الخدمة" },
                lang
              )}
            </h3>
            <ul className="space-y-4">
              {SERVICE_STEPS.map((step, i) => (
                <li
                  key={i}
                  className="animate-fade-in-left flex items-center gap-3 text-base font-medium text-[#40505a]"
                  style={{ animationDelay: `${300 + i * 80}ms` }}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d4ede0] text-[#438b70]">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span>{t({ en: step.en, ar: step.ar }, lang)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-in-left delay-200 journey-card z-[1] w-full flex-1 rounded-2xl bg-[#fbf6ed] p-6 pr-10 md:pr-12 md:pl-6">
            <h3 className="mb-5 text-sm font-bold tracking-widest text-[#8a7530]">
              {t(
                { en: "PROVIDER / INSTITUTION JOURNEY", ar: "(الشركاء والداعمون) الشركاء والداعمون" },
                lang
              )}
            </h3>
            <ul className="space-y-4">
              {INSTIUTION_STEPS.map((step, i) => (
                <li
                  key={i}
                  className="animate-fade-in-left flex items-center gap-3 text-base font-medium text-[#40505a]"
                  style={{ animationDelay: `${300 + i * 80}ms` }}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f5e2b8] text-[#9f7d45]">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span>{t({ en: step.en, ar: step.ar }, lang)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* PROVIDER / PARTNER */}
          <div className="animate-fade-in-right delay-200 journey-card z-[1] w-full flex-1 rounded-2xl bg-[#edf3fb] p-6 md:pr-12 md:pl-6">
            <h3 className="mb-5 text-sm font-bold tracking-widest text-[#52719a]">
              {t(
                { en: "EXPERT / SPECIALIST JOURNEY", ar: "الخبراء ومقدمو الخدمات" },
                lang
              )}
            </h3>
            <ul className="space-y-4">
              {PROVIDER_STEPS.map((step, i) => (
                <li
                  key={i}
                  className="animate-fade-in-right flex items-center gap-3 text-base font-medium text-[#40505a]"
                  style={{ animationDelay: `${300 + i * 80}ms` }}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d0e2f5] text-[#456f9f]">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span>{t({ en: step.en, ar: step.ar }, lang)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
