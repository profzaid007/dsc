import type { BilingualString } from "@/types/form";

export const SPECIALIZATION_LABELS: Record<string, BilingualString> = {
  assessment_and_diagnosis: {
    en: "Assessment & Diagnosis",
    ar: "التقييم والتشخيص",
  },
  consultation: { en: "Consultation", ar: "الاستشارات" },
  therapy_and_intervention: {
    en: "Therapy & Intervention",
    ar: "العلاج والتدخل",
  },
  educational_support: { en: "Educational Support", ar: "الدعم التعليمي" },
  research_and_statistics: {
    en: "Research & Statistics",
    ar: "البحث والإحصاء",
  },
  academic_supervision: {
    en: "Academic Supervision",
    ar: "الإشراف الأكاديمي",
  },
  training_and_workshops: {
    en: "Training & Workshops",
    ar: "التدريب وورش العمل",
  },
  curriculum_development: {
    en: "Curriculum Development",
    ar: "تطوير المناهج",
  },
  program_development: {
    en: "Program Development",
    ar: "تطوير البرامج",
  },
  psychological_services: {
    en: "Psychological Services",
    ar: "الخدمات النفسية",
  },
  special_education: { en: "Special Education", ar: "التربية الخاصة" },
  speech_and_language_services: {
    en: "Speech & Language",
    ar: "النطق والتخاطب",
  },
  occupational_therapy: {
    en: "Occupational Therapy",
    ar: "العلاج الوظيفي",
  },
  behavioral_services: {
    en: "Behavioral Services",
    ar: "الخدمات السلوكية",
  },
  career_and_vocational_guidance: {
    en: "Career & Vocational Guidance",
    ar: "الإرشاد المهني والوظيفي",
  },
  technology_and_digital_solutions: {
    en: "Technology & Digital Solutions",
    ar: "التقنية والحلول الرقمية",
  },
  translation_and_content_services: {
    en: "Translation & Content",
    ar: "الترجمة والمحتوى",
  },
  institutional_and_organizational_consulting: {
    en: "Institutional Consulting",
    ar: "الاستشارات المؤسسية",
  },
  other: { en: "Other", ar: "أخرى" },
};

export const DEGREE_LABELS: Record<string, BilingualString> = {
  high_school_secondary: { en: "High School", ar: "ثانوية" },
  diploma: { en: "Diploma", ar: "دبلوم" },
  associate_degree: { en: "Associate Degree", ar: "درجة دبلوم متوسط" },
  bachelors_degree: { en: "Bachelor's Degree", ar: "بكالوريوس" },
  masters_degree: { en: "Master's Degree", ar: "ماجستير" },
  doctorate_phd: { en: "Doctorate (PhD)", ar: "دكتوراه" },
  professional_degree: { en: "Professional Degree", ar: "درجة مهنية" },
  postdoctoral_fellowship: { en: "Postdoctoral", ar: "ما بعد الدكتوراه" },
  other: { en: "Other", ar: "أخرى" },
};

export function specializationLabel(key: string, lang: "en" | "ar"): string {
  return SPECIALIZATION_LABELS[key]?.[lang] || key.replace(/_/g, " ");
}

export function degreeLabel(key: string | null, lang: "en" | "ar"): string {
  if (!key) return "";
  return DEGREE_LABELS[key]?.[lang] || key.replace(/_/g, " ");
}