import type { BilingualString, Lang } from "@/types/form";

export function t(text: BilingualString, lang: Lang): string {
  return text[lang];
}

export function dir(lang: Lang): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}

export const UI_STRINGS: Record<string, BilingualString> = {
  next: { en: "Next", ar: "التالي" },
  back: { en: "Back", ar: "السابق" },
  submit: { en: "Submit", ar: "إرسال" },
  submitting: { en: "Submitting...", ar: "جارٍ الإرسال..." },
  step: { en: "Step", ar: "الخطوة" },
  of: { en: "of", ar: "من" },
  required_error: {
    en: "This field is required",
    ar: "هذا الحقل مطلوب",
  },
  select_placeholder: {
    en: "Select an option",
    ar: "اختر خياراً",
  },
  language_label: {
    en: "العربية",
    ar: "English",
  },
  form_title: {
    en: "Client Intake Form",
    ar: "استمارة استقبال العملاء",
  },
};
