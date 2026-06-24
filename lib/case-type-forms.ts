import type { BilingualString } from "@/types/form"

export interface CaseTypeField {
  id: string
  type: "text" | "textarea" | "select"
  label: BilingualString
  placeholder?: BilingualString
  options?: { value: string; label: BilingualString }[]
  required?: boolean
}

export const CASE_TYPE_FORMS: Record<string, CaseTypeField[]> = {
  educational_assessment: [
    {
      id: "school_name",
      type: "text",
      label: { en: "School Name", ar: "اسم المدرسة" },
      placeholder: { en: "e.g. International School", ar: "مثال: المدرسة الدولية" },
      required: true,
    },
    {
      id: "grade_level",
      type: "select",
      label: { en: "Current Grade Level", ar: "المرحلة الدراسية الحالية" },
      required: true,
      options: [
        { value: "kg1", label: { en: "KG 1", ar: "روضة 1" } },
        { value: "kg2", label: { en: "KG 2", ar: "روضة 2" } },
        { value: "grade1", label: { en: "Grade 1", ar: "الصف الأول" } },
        { value: "grade2", label: { en: "Grade 2", ar: "الصف الثاني" } },
        { value: "grade3", label: { en: "Grade 3", ar: "الصف الثالث" } },
        { value: "grade4", label: { en: "Grade 4", ar: "الصف الرابع" } },
        { value: "grade5", label: { en: "Grade 5", ar: "الصف الخامس" } },
        { value: "grade6", label: { en: "Grade 6", ar: "الصف السادس" } },
        { value: "middle", label: { en: "Middle School", ar: "المرحلة المتوسطة" } },
        { value: "high", label: { en: "High School", ar: "المرحلة الثانوية" } },
      ],
    },
    {
      id: "previous_assessments",
      type: "textarea",
      label: { en: "Previous Assessments", ar: "التقييمات السابقة" },
      placeholder: {
        en: "Describe any previous evaluations or assessments...",
        ar: "صف أي تقييمات أو اختبارات سابقة...",
      },
    },
    {
      id: "learning_challenges",
      type: "textarea",
      label: { en: "Learning Challenges", ar: "التحديات التعليمية" },
      placeholder: {
        en: "Describe any learning difficulties observed...",
        ar: "صف أي صعوبات تعلم ملاحظة...",
      },
    },
  ],
  behavioral_therapy: [
    {
      id: "behaviors",
      type: "textarea",
      label: { en: "Behaviors of Concern", ar: "السلوكيات المقلقة" },
      placeholder: {
        en: "Describe the behaviors you'd like to address...",
        ar: "صف السلوكيات التي تريد معالجتها...",
      },
      required: true,
    },
    {
      id: "duration",
      type: "select",
      label: { en: "How long have these behaviors been present?", ar: "منذ متى ظهرت هذه السلوكيات؟" },
      required: true,
      options: [
        { value: "less_1m", label: { en: "Less than 1 month", ar: "أقل من شهر" } },
        { value: "1_3m", label: { en: "1–3 months", ar: "1–3 أشهر" } },
        { value: "3_6m", label: { en: "3–6 months", ar: "3–6 أشهر" } },
        { value: "6_12m", label: { en: "6–12 months", ar: "6–12 شهراً" } },
        { value: "more_1y", label: { en: "More than 1 year", ar: "أكثر من سنة" } },
      ],
    },
    {
      id: "triggers",
      type: "textarea",
      label: { en: "Known Triggers", ar: "المحفزات المعروفة" },
      placeholder: {
        en: "What situations trigger these behaviors?",
        ar: "ما هي المواقف التي تحفز هذه السلوكيات؟",
      },
    },
  ],
  speech_therapy: [
    {
      id: "speech_concerns",
      type: "textarea",
      label: { en: "Speech Concerns", ar: "مخاوف النطق" },
      placeholder: {
        en: "Describe speech or communication concerns...",
        ar: "صف مخاوف النطق أو التواصل...",
      },
      required: true,
    },
    {
      id: "first_words",
      type: "select",
      label: { en: "Age when first words were spoken", ar: "عمر النطق بالكلمات الأولى" },
      options: [
        { value: "normal", label: { en: "Normal (12–18 months)", ar: "طبيعي (12–18 شهراً)" } },
        { value: "delayed", label: { en: "Delayed (after 18 months)", ar: "متأخر (بعد 18 شهراً)" } },
        { value: "no_words", label: { en: "No words yet", ar: "لم ينطق بكلمات بعد" } },
      ],
    },
    {
      id: "other_therapies",
      type: "textarea",
      label: { en: "Other Therapies Received", ar: "العلاجات الأخرى المتلقاة" },
      placeholder: {
        en: "List any other therapies the child is receiving...",
        ar: "اذكر أي علاجات أخرى يتلقاها الطفل...",
      },
    },
  ],
  occupational_therapy: [
    {
      id: "motor_skills",
      type: "textarea",
      label: { en: "Motor Skills Concerns", ar: "مخاوف المهارات الحركية" },
      placeholder: {
        en: "Describe fine or gross motor skill concerns...",
        ar: "صف مخاوف المهارات الحركية الدقيقة أو الكبيرة...",
      },
      required: true,
    },
    {
      id: "sensory_issues",
      type: "textarea",
      label: { en: "Sensory Issues", ar: "المشاكل الحسية" },
      placeholder: {
        en: "Describe any sensory sensitivities or seeking behaviors...",
        ar: "صف أي حساسية ح sensorial أو سلوكيات البحث عن التحفيز...",
      },
    },
    {
      id: "daily_activities",
      type: "textarea",
      label: { en: "Daily Living Activities", ar: "أنشطة الحياة اليومية" },
      placeholder: {
        en: "Describe difficulties with dressing, eating, hygiene...",
        ar: "صف الصعوبات في اللباس، الأكل، النظافة الشخصية...",
      },
    },
  ],
  psychological_assessment: [
    {
      id: "mental_health_concerns",
      type: "textarea",
      label: { en: "Mental Health Concerns", ar: "مخاوف الصحة النفسية" },
      placeholder: {
        en: "Describe emotional or psychological concerns...",
        ar: "صف المخاوف العاطفية أو النفسية...",
      },
      required: true,
    },
    {
      id: "family_history",
      type: "textarea",
      label: { en: "Family Mental Health History", ar: "التاريخ العائلي للصحة النفسية" },
      placeholder: {
        en: "Any relevant family history...",
        ar: "أي تاريخ عائلي ذي صلة...",
      },
    },
    {
      id: "current_medications",
      type: "text",
      label: { en: "Current Medications", ar: "الأدوية الحالية" },
      placeholder: { en: "List any current medications", ar: "اذكر الأدوية الحالية" },
    },
  ],
}

export function getCaseTypeFormFields(caseTypeKey: string): CaseTypeField[] {
  return CASE_TYPE_FORMS[caseTypeKey] || []
}
