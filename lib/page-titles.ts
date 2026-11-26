import type { Lang } from "@/types/form"

export const PAGE_TITLE_MAP: Record<string, { ar: string; en: string }> = {
  "/": { ar: "استشارية أسرار التطور", en: "Development Secrets Consultancy" },
  "/contact-us": { ar: "اتصل بنا", en: "Contact Us" },
  "/about-us": { ar: "من نحن", en: "About Us" },
  "/blog": { ar: "مقالات الصحة النفسية والتربية والتطور", en: "Psychology, Education and Development Articles" },
  "/consultation": { ar: "حجز استشارة مجانية", en: "Book a Free Consultation" },
  "/programmes": { ar: "الفعاليات والبرامج", en: "Events and Programmes" },
  "/programmes/public_lectures": { ar: "المحاضرات العامة", en: "Public Lectures" },
  "/programmes/training_programmes": { ar: "الدورات التدريبية", en: "Training Programmes" },
  "/privacy-policy": { ar: "سياسة الخصوصية", en: "Privacy Policy" },
  "/terms": { ar: "شروط الخدمة", en: "Terms of Service" },
}

export function formatPageTitle(value: string): string {
  const title = value.replace(/\s+/g, " ").trim().replace(/(?:\s*\|\s*DSC)+$/i, "").trim()
  return `${title} | DSC`
}

export function recordPageTitle(record: Record<string, unknown>, lang: Lang): string {
  const localized = record[`title_${lang}`]
  if (typeof localized === "string" && localized.trim()) return localized
  for (const value of [record.name, record.title]) {
    if (value && typeof value === "object") {
      const localized = value as Record<string, unknown>
      const text = localized[lang] || localized.en
      if (typeof text === "string" && text.trim()) return text
    }
  }
  return typeof record.title === "string" ? record.title : typeof record.title_en === "string" ? record.title_en : ""
}
