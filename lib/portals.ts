import type { BilingualString } from "@/types/form";

export interface PortalService { 
  icon: string 
  name: BilingualString
} 

export interface Portal {
  id: string;
  portalName: BilingualString;
  tagline: BilingualString;
  heroTitle: BilingualString;
  heroText: BilingualString;
  ctaLabel: BilingualString;
  ctaHref: string;
  accent: string;
  image: string; 
  secondary: string;
  menu: BilingualString[];
  services: PortalService[];
}

export const PORTALS: Portal[] = [
  {
    id: "1",
    portalName: { en: "Special Needs Portal", ar: "بوابة الاحتياجات الخاصة" },
    image: "/portals/portal-1.jpg",
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
      { icon: "heartHandshake", name: { en: "Autism Spectrum Disorder", ar: "اضطراب طيف التوحد" } },
      { icon: "zap", name: { en: "ADHD", ar: "ADHD" } },
      { icon: "bookOpen", name: { en: "Learning Disabilities", ar: "صعوبات التعلم" } },
      { icon: "messageCircle", name: { en: "Speech & Language Disorders", ar: "اضطرابات الكلام واللغة" } },
      { icon: "brain", name: { en: "Intellectual Disability", ar: "الإعاقة الذهنية" } },
      { icon: "heart", name: { en: "Behavior Challenges", ar: "التحديات السلوكية" } },
      { icon: "eye", name: { en: "Sensory Processing Disorder", ar: "اضطراب المعالجة الحسية" } },
      { icon: "accessibility", name: { en: "Motor Skills Development", ar: "تطوير المهارات الحركية" } },
      { icon: "users", name: { en: "Family Support", ar: "دعم الأسرة" } },
      { icon: "clipboardCheck", name: { en: "Assessments & Evaluations", ar: "التقييمات والفحوصات" } },
    ],
  },
  {
    id: "2",
    portalName: { en: "Mental Health Portal", ar: "بوابة الصحة النفسية" },
    tagline: { en: "Better Balance, Better Living", ar: "توازن أفضل، حياة أفضل" },
    image: "/portals/portal-2.jpg",
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
      { icon: "Heart", name: { en: "Anxiety Support", ar: "دعم القلق" } },
      { icon: "CloudMoon", name: { en: "Depression Care", ar: "رعاية الاكتئاب" } },
      { icon: "Users", name: { en: "Family Counseling", ar: "الإرشاد الأسري" } },
      { icon: "Shield", name: { en: "Trauma Recovery", ar: "التعافي من الصدمات" } },
      { icon: "Flame", name: { en: "Burnout Prevention", ar: "الوقاية من الإرهاق" } },
      { icon: "Smile", name: { en: "Youth Mental Health", ar: "صحة الشباب النفسية" } },
      { icon: "Flower2", name: { en: "Mindfulness Programs", ar: "برامج الوعي الذاتي" } },
      { icon: "PhoneCall", name: { en: "Crisis Guidance", ar: "إرشاد الأزمات" } },
      { icon: "Building2", name: { en: "Workplace Wellbeing", ar: "رفاهية مكان العمل" } },
      { icon: "ClipboardCheck", name: { en: "Assessment Services", ar: "خدمات التقييم" } },
    ],
  },
  {
    id: "3",
    portalName: { en: "Innovation Portal", ar: "بوابة الابتكار" },
    tagline: { en: "From Ideas to Impact", ar: "من الأفكار إلى الأثر" },
    image: "/portals/portal-3.jpg",
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
      { icon: "Lightbulb", name: { en: "Innovation Strategy", ar: "استراتيجية الابتكار" } },
      { icon: "Beaker", name: { en: "Prototype Validation", ar: "التحقق من النماذج الأولية" } },
      { icon: "Timer", name: { en: "Design Sprints", ar: "سباقات التصميم" } },
      { icon: "Search", name: { en: "Research Support", ar: "دعم البحث" } },
      { icon: "Compass", name: { en: "Product Discovery", ar: "اكتشاف المنتج" } },
      { icon: "TrendingUp", name: { en: "Market Readiness", ar: "جاهزية السوق" } },
      { icon: "RefreshCw", name: { en: "Digital Transformation", ar: "التحول الرقمي" } },
      { icon: "Cpu", name: { en: "AI Use Cases", ar: "حالات استخدام الذكاء الاصطناعي" } },
      { icon: "Wallet", name: { en: "Funding Preparation", ar: "التحضير للتمويل" } },
      { icon: "GraduationCap", name: { en: "Implementation Coaching", ar: "تدريب التنفيذ" } },
    ],
  },
  {
    id: "4",
    portalName: { en: "Education Portal", ar: "بوابة التعليم" },
    image: "/portals/portal-4.jpg",
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
      { icon: "BookOpen", name: { en: "Curriculum Design", ar: "تصميم المناهج" } },
      { icon: "Presentation", name: { en: "Teacher Training", ar: "تدريب المعلمين" } },
      { icon: "ClipboardList", name: { en: "Learning Assessment", ar: "تقييم التعلم" } },
      { icon: "Accessibility", name: { en: "Inclusive Education", ar: "التعليم الشامل" } },
      { icon: "Monitor", name: { en: "Digital Learning", ar: "التعلم الرقمي" } },
      { icon: "UserCheck", name: { en: "Student Support", ar: "دعم الطلاب" } },
      { icon: "HeartHandshake", name: { en: "Parent Engagement", ar: "مشاركة أولياء الأمور" } },
      { icon: "Building", name: { en: "Institutional Planning", ar: "التخطيط المؤسسي" } },
      { icon: "FlaskConical", name: { en: "STEM Development", ar: "تطوير STEM" } },
      { icon: "Award", name: { en: "Accreditation Readiness", ar: "جاهزية الاعتماد" } },
    ],
  },
  {
    id: "5",
    portalName: { en: "Institutional Portal", ar: "بوابة المؤسسات" },
    image: "/portals/portal-5.jpg",
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
      { icon: "ChartLine", name: { en: "Strategic Planning", ar: "التخطيط الاستراتيجي" } },
      { icon: "FileText", name: { en: "Policy Development", ar: "تطوير السياسات" } },
      { icon: "Settings", name: { en: "Operational Excellence", ar: "التميز التشغيلي" } },
      { icon: "Crown", name: { en: "Leadership Programs", ar: "برامج القيادة" } },
      { icon: "ArrowLeftRight", name: { en: "Change Management", ar: "إدارة التغيير" } },
      { icon: "Scale", name: { en: "Governance Models", ar: "نماذج الحوكمة" } },
      { icon: "ShieldCheck", name: { en: "Quality Assurance", ar: "ضمان الجودة" } },
      { icon: "Gauge", name: { en: "KPI Frameworks", ar: "أطر مؤشرات الأداء" } },
      { icon: "Layers", name: { en: "Capacity Building", ar: "بناء القدرات" } },
      { icon: "Target", name: { en: "Impact Measurement", ar: "قياس الأثر" } },
    ],
  },
];

export function getPortalById(id: string): Portal | undefined {
  return PORTALS.find((p) => p.id === id);
}
