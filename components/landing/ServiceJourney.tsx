"use client"

import Image from "next/image"
import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"
import {
  UserPlus,
  UserCheck,
  ClipboardList,
  Handshake,
  CreditCard,
  HeartHandshake,
  FileBarChart,
  Briefcase,
  ShieldCheck,
  BadgeCheck,
  Building2,
  Stethoscope,
} from "lucide-react"

const SERVICE_STEPS = [
  { icon: UserPlus, en: "Tell Us About Yourself", ar: "أخبرنا عن نفسك" },
  { icon: UserCheck, en: "Create Account", ar: "إنشاء حساب" },
  { icon: ClipboardList, en: "Case / Profile", ar: "الملف / الحالة" },
  { icon: Handshake, en: "Choose Service", ar: "اختر الخدمة" },
  { icon: CreditCard, en: "Book & Pay", ar: "احجز وادفع" },
  { icon: HeartHandshake, en: "Receive Service", ar: "تلقَّ الخدمة" },
  { icon: FileBarChart, en: "Reports & Follow-Up", ar: "التقارير والمتابعة" },
]

const PROVIDER_STEPS = [
  { icon: Briefcase, en: "Tell Us About Yourself", ar: "أخبرنا عن نفسك" },
  { icon: BadgeCheck, en: "Select Role", ar: "اختر الدور" },
  { icon: ClipboardList, en: "Create Profile", ar: "إنشاء ملف" },
  { icon: ShieldCheck, en: "Verification", ar: "التحقق" },
  { icon: Building2, en: "DSC Approval", ar: "موافقة DSC" },
  { icon: Stethoscope, en: "Provide / Collaborate", ar: "قدّم / تعاون" },
]

export function ServiceJourney() {
  const { lang } = useLang()
  const isAr = lang === "ar"

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white py-20 md:py-28">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-[#edf7f1] opacity-60 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-64 w-64 rounded-full bg-[#edf3fb] opacity-60 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[900px] px-6">
        {/* Section heading */}
        <h2
          className="animate-fade-in-up mb-16 text-center text-2xl font-bold tracking-tight text-[#0b2545] md:text-3xl"
        >
          {t(
            { en: "Your Journey with DSC", ar: "رحلتك مع DSC" },
            lang
          )}
        </h2>

        <div className="journey-container flex flex-col items-center gap-0 md:flex-row md:gap-14">
          {/* SERVICE RECIPIENT */}
          <div className="animate-fade-in-left delay-200 journey-card flex-1 rounded-2xl bg-[#edf7f1] p-6 md:p-7">
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
                  className="animate-fade-in-left flex items-center gap-3 text-sm font-medium text-[#40505a]"
                  style={{ animationDelay: `${300 + i * 80}ms` }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d4ede0] text-[#438b70]">
                    <step.icon className="h-4 w-4" />
                  </span>
                  <span>{t({ en: step.en, ar: step.ar }, lang)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CENTER DSC LOGO */}
          <div className="animate-fade-in-up delay-500 my-8 flex shrink-0 items-center justify-center md:my-0">
            <div className="relative flex h-[110px] w-[110px] items-center justify-center">
              {/* Glow rings */}
              <div className="animate-pulse-ring absolute left-1/2 top-1/2 h-[110px] w-[110px] rounded-full border-2 border-[#c9a227]/30" />
              <div className="animate-pulse-ring-delayed absolute left-1/2 top-1/2 h-[110px] w-[110px] rounded-full border border-[#c9a227]/20" />

              {/* Logo circle */}
              <div className="relative z-10 flex h-[100px] w-[100px] items-center justify-center rounded-full border-2 border-[#c9a227] bg-white shadow-lg">
                <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border border-[#e6d590]">
                  <Image
                    src="/logo.svg"
                    alt="DSC Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Orbit particles */}
              <div className="animate-orbit-1 absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5">
                <div className="h-3 w-3 rounded-full bg-[#438b70] opacity-80" />
              </div>
              <div className="animate-orbit-2 absolute left-1/2 top-1/2 -ml-1 -mt-1">
                <div className="h-2 w-2 rounded-full bg-[#c9a227] opacity-80" />
              </div>
              <div className="animate-orbit-3 absolute left-1/2 top-1/2 -ml-1 -mt-1">
                <div className="h-2 w-2 rounded-full bg-[#456f9f] opacity-80" />
              </div>
              <div className="animate-orbit-4 absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5">
                <div className="h-3 w-3 rounded-full bg-[#e6c200] opacity-70" />
              </div>
            </div>
          </div>

          {/* PROVIDER / PARTNER */}
          <div className="animate-fade-in-right delay-200 journey-card flex-1 rounded-2xl bg-[#edf3fb] p-6 md:p-7">
            <h3 className="mb-5 text-sm font-bold tracking-widest text-[#52719a]">
              {t(
                { en: "PROVIDER / PARTNER JOURNEY", ar: "مسار المزود / الشريك" },
                lang
              )}
            </h3>
            <ul className="space-y-4">
              {PROVIDER_STEPS.map((step, i) => (
                <li
                  key={i}
                  className="animate-fade-in-right flex items-center gap-3 text-sm font-medium text-[#40505a]"
                  style={{ animationDelay: `${300 + i * 80}ms` }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d0e2f5] text-[#456f9f]">
                    <step.icon className="h-4 w-4" />
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
