import type { BilingualString } from "@/types/form";

export interface Portal {
  id: string;
  portalName: BilingualString;
  tagline: BilingualString;
  heroTitle: BilingualString;
  heroText: BilingualString;
  ctaLabel: BilingualString;
  ctaHref: string;
  accent: string;
  secondary: string;
  menu: BilingualString[];
  services: BilingualString[];
}

export const PORTALS: Portal[] = [
  {
    id: "1",
    portalName: { en: "Special Needs Portal", ar: "بوابة الاحتياجات الخاصة" },
    tagline: { en: "Supporting Abilities, Empowering Potential", ar: "دعم القدرات، تمكين الإمكانات" },
    heroTitle: {
      en: "We discover abilities, provide support, and build potential gaps",
      ar: "نكتشف القدرات ونقدم الدعم ونبني فجوات الإمكانات",
    },
    heroText: {
      en: "We offer early intervention programs and personalized support plans for every individual.",
      ar: "نقدم برامج التدخل المبكر وخطط الدعم المخصصة لكل فرد.",
    },
    ctaLabel: { en: "Get Started Now", ar: "ابدأ الآن" },
    ctaHref: "#",
    accent: "#008f53",
    secondary: "#0f3090",
    menu: [
      { en: "Home", ar: "الرئيسية" },
      { en: "About Us", ar: "من نحن" },
      { en: "Services", ar: "الخدمات" },
      { en: "Resources", ar: "الموارد" },
      { en: "Blog", ar: "المدونة" },
      { en: "For Families", ar: "للأسر" },
      { en: "For Professionals", ar: "للمتخصصين" },
      { en: "Contact Us", ar: "تواصل معنا" },
    ],
    services: [
      { en: "Autism Spectrum Disorder", ar: "اضطراب طيف التوحد" },
      { en: "ADHD", ar: "ADHD" },
      { en: "Learning Disabilities", ar: "صعوبات التعلم" },
      { en: "Speech & Language Disorders", ar: "اضطرابات الكلام واللغة" },
      { en: "Intellectual Disability", ar: "الإعاقة الذهنية" },
      { en: "Behavior Challenges", ar: "التحديات السلوكية" },
      { en: "Sensory Processing Disorder", ar: "اضطراب المعالجة الحسية" },
      { en: "Motor Skills Development", ar: "تطوير المهارات الحركية" },
      { en: "Family Support", ar: "دعم الأسرة" },
      { en: "Assessments & Evaluations", ar: "التقييمات والفحوصات" },
    ],
  },
  {
    id: "2",
    portalName: { en: "Mental Health Portal", ar: "بوابة الصحة النفسية" },
    tagline: { en: "Better Balance, Better Living", ar: "توازن أفضل، حياة أفضل" },
    heroTitle: {
      en: "Confidential care and practical tools for emotional wellbeing",
      ar: "رعاية سرية وأدوات عملية للصحة النفسية",
    },
    heroText: {
      en: "Access counseling tracks, stress-management plans, and guided support from qualified professionals.",
      ar: " الوصول إلى مسارات الإرشاد وخطط إدارة التوتر والدعم الموجه من متخصصين مؤهلين.",
    },
    ctaLabel: { en: "Start Your Wellness Plan", ar: "ابدأ خطة العافية" },
    ctaHref: "#",
    accent: "#631a7b",
    secondary: "#0f3090",
    menu: [
      { en: "Home", ar: "الرئيسية" },
      { en: "About", ar: "من نحن" },
      { en: "Care Programs", ar: "برامج الرعاية" },
      { en: "Self-Help Library", ar: "مكتبة المساعدة الذاتية" },
      { en: "Professionals", ar: "المتخصصون" },
      { en: "Community", ar: "المجتمع" },
      { en: "Blog", ar: "المدونة" },
      { en: "Contact", ar: "تواصل معنا" },
    ],
    services: [
      { en: "Anxiety Support", ar: "دعم القلق" },
      { en: "Depression Care", ar: "رعاية الاكتئاب" },
      { en: "Family Counseling", ar: "الإرشاد الأسري" },
      { en: "Trauma Recovery", ar: "التعافي من الصدمات" },
      { en: "Burnout Prevention", ar: "الوقاية من الإرهاق" },
      { en: "Youth Mental Health", ar: "صحة الشباب النفسية" },
      { en: "Mindfulness Programs", ar: "برامج الوعي الذاتي" },
      { en: "Crisis Guidance", ar: "إرشاد الأزمات" },
      { en: "Workplace Wellbeing", ar: "رفاهية مكان العمل" },
      { en: "Assessment Services", ar: "خدمات التقييم" },
    ],
  },
  {
    id: "4",
    portalName: { en: "Innovation Portal", ar: "بوابة الابتكار" },
    tagline: { en: "From Ideas to Impact", ar: "من الأفكار إلى الأثر" },
    heroTitle: {
      en: "Turn bold concepts into tested, scalable solutions",
      ar: "حول المفاهيم الجريئة إلى حلول مختبرة وقابلة للتوسع",
    },
    heroText: {
      en: "Discover innovation labs, prototyping resources, and advisory tracks that accelerate real outcomes.",
      ar: "اكتشف مختبرات الابتكار وموارد النمذجة الأولية ومسارات الاستشارات التي تسرع النتائج الحقيقية.",
    },
    ctaLabel: { en: "Explore Innovation Tracks", ar: "استكشف مسارات الابتكار" },
    ctaHref: "#",
    accent: "#df9b00",
    secondary: "#0f3090",
    menu: [
      { en: "Home", ar: "الرئيسية" },
      { en: "About", ar: "من نحن" },
      { en: "Labs", ar: "المختبرات" },
      { en: "Programs", ar: "البرامج" },
      { en: "Case Studies", ar: "دراسات الحالة" },
      { en: "Partners", ar: "الشركاء" },
      { en: "Events", ar: "الفعاليات" },
      { en: "Contact", ar: "تواصل معنا" },
    ],
    services: [
      { en: "Innovation Strategy", ar: "استراتيجية الابتكار" },
      { en: "Prototype Validation", ar: "التحقق من النماذج الأولية" },
      { en: "Design Sprints", ar: "سباقات التصميم" },
      { en: "Research Support", ar: "دعم البحث" },
      { en: "Product Discovery", ar: "اكتشاف المنتج" },
      { en: "Market Readiness", ar: "جاهزية السوق" },
      { en: "Digital Transformation", ar: "التحول الرقمي" },
      { en: "AI Use Cases", ar: "حالات استخدام الذكاء الاصطناعي" },
      { en: "Funding Preparation", ar: "التحضير للتمويل" },
      { en: "Implementation Coaching", ar: "تدريب التنفيذ" },
    ],
  },
  {
    id: "5",
    portalName: { en: "Education Portal", ar: "بوابة التعليم" },
    tagline: { en: "Learning That Moves Forward", ar: "تعلم يتقدم للأمام" },
    heroTitle: {
      en: "Build modern learning journeys for students and educators",
      ar: "بناء رحلات تعليمية حديثة للطلاب والمعلمين",
    },
    heroText: {
      en: "From curriculum support to digital classrooms, we help institutions deliver measurable learning growth.",
      ar: "من دعم المناهج إلى الفصول الرقمية، نساعد المؤسسات على تقديم نمو تعليمي قابل للقياس.",
    },
    ctaLabel: { en: "Browse Education Services", ar: "تصفح خدمات التعليم" },
    ctaHref: "#",
    accent: "#0f3090",
    secondary: "#008f53",
    menu: [
      { en: "Home", ar: "الرئيسية" },
      { en: "About", ar: "من نحن" },
      { en: "Programs", ar: "البرامج" },
      { en: "Schools", ar: "المدارس" },
      { en: "Teachers", ar: "المعلمون" },
      { en: "Resources", ar: "الموارد" },
      { en: "Events", ar: "الفعاليات" },
      { en: "Contact", ar: "تواصل معنا" },
    ],
    services: [
      { en: "Curriculum Design", ar: "تصميم المناهج" },
      { en: "Teacher Training", ar: "تدريب المعلمين" },
      { en: "Learning Assessment", ar: "تقييم التعلم" },
      { en: "Inclusive Education", ar: "التعليم الشامل" },
      { en: "Digital Learning", ar: "التعلم الرقمي" },
      { en: "Student Support", ar: "دعم الطلاب" },
      { en: "Parent Engagement", ar: "مشاركة أولياء الأمور" },
      { en: "Institutional Planning", ar: "التخطيط المؤسسي" },
      { en: "STEM Development", ar: "تطوير STEM" },
      { en: "Accreditation Readiness", ar: "جاهزية الاعتماد" },
    ],
  },
  {
    id: "6",
    portalName: { en: "Institutional Portal", ar: "بوابة المؤسسات" },
    tagline: { en: "Performance Through Strategy", ar: "الأداء من خلال الاستراتيجية" },
    heroTitle: {
      en: "Enable institutions to perform with clarity, systems, and evidence",
      ar: "تمكين المؤسسات من الأداء بالوضوح والأنظمة والأدلة",
    },
    heroText: {
      en: "Access consulting, diagnostics, and strategic implementation models tailored to organizational goals.",
      ar: "الوصول إلى الاستشارات والتشخيصات ونماذج التنفيذ الاستراتيجي المصممة لتحقيق الأهداف التنظيمية.",
    },
    ctaLabel: { en: "Request Institutional Plan", ar: "اطلب خطة مؤسسية" },
    ctaHref: "#",
    accent: "#121e31",
    secondary: "#00a4e4",
    menu: [
      { en: "Home", ar: "الرئيسية" },
      { en: "About", ar: "من نحن" },
      { en: "Consulting", ar: "الاستشارات" },
      { en: "Diagnostics", ar: "التشخيصات" },
      { en: "Resources", ar: "الموارد" },
      { en: "Partners", ar: "الشركاء" },
      { en: "Insights", ar: "الرؤى" },
      { en: "Contact", ar: "تواصل معنا" },
    ],
    services: [
      { en: "Strategic Planning", ar: "التخطيط الاستراتيجي" },
      { en: "Policy Development", ar: "تطوير السياسات" },
      { en: "Operational Excellence", ar: "التميز التشغيلي" },
      { en: "Leadership Programs", ar: "برامج القيادة" },
      { en: "Change Management", ar: "إدارة التغيير" },
      { en: "Governance Models", ar: "نماذج الحوكمة" },
      { en: "Quality Assurance", ar: "ضمان الجودة" },
      { en: "KPI Frameworks", ar: "أطر مؤشرات الأداء" },
      { en: "Capacity Building", ar: "بناء القدرات" },
      { en: "Impact Measurement", ar: "قياس الأثر" },
    ],
  },
];

export function getPortalById(id: string): Portal | undefined {
  return PORTALS.find((p) => p.id === id);
}