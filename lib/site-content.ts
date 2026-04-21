import type { BilingualString } from "@/types/form";

interface ServiceItem {
  title: BilingualString;
  description: BilingualString;
  bullets: BilingualString[];
}

interface SiteContent {
  nav: {
    home: BilingualString;
    aboutUs: BilingualString;
    services: BilingualString;
    individualServices: BilingualString;
    institutionalServices: BilingualString;
    contactUs: BilingualString;
    bookConsultation: BilingualString;
  };
  hero: {
    headline: BilingualString;
    subheadline: BilingualString;
    cta: BilingualString;
  };
  about: {
    sectionTitle: BilingualString;
    paragraph1: BilingualString;
    paragraph2: BilingualString;
  };
  services: {
    sectionTitle: BilingualString;
    individual: ServiceItem;
    institutional: ServiceItem;
  };
  cta: {
    heading: BilingualString;
    subtext: BilingualString;
    button: BilingualString;
  };
  footer: {
    tagline: BilingualString;
    linksTitle: BilingualString;
    contactTitle: BilingualString;
    contact: {
      email: BilingualString;
      phone: BilingualString;
      location: BilingualString;
    };
    copyright: BilingualString;
  };
}

export const SITE_CONTENT: SiteContent = {
  nav: {
    home: { en: "Home", ar: "الرئيسية" },
    aboutUs: { en: "About Us", ar: "من نحن" },
    services: { en: "Services", ar: "الخدمات" },
    individualServices: { en: "Individual Services", ar: "الخدمات الفردية" },
    institutionalServices: {
      en: "Institutional Services",
      ar: "الخدمات المؤسسية",
    },
    contactUs: { en: "Contact Us", ar: "تواصل معنا" },
    bookConsultation: { en: "Book Consultation", ar: "احجز استشارة" },
  },

  hero: {
    headline: {
      en: "Development Secrets Consultancy (DSC)",
      ar: "(DSC) استشارية أسرار التطور",
    },
    subheadline: {
      en: "From Comprehensive Scientific Diagnosis to Innovation and  Global Leadership in the Age of Artificial Intelligence",
      ar: "من التشخيص العلمي الشامل إلى الابتكار والريادة العالمية في عصر الذكاء  الاصطناعي",
    },
    cta: { en: "Book a Free Consultation", ar: "احجز استشارة مجانية" },
  },

  about: {
    sectionTitle: { en: "About DSC", ar: "عن DSC" },
    paragraph1: {
      en: "An integrated scientific platform that begins with precise multidimensional diagnosis of human and institutional potential,  followed by professional reporting, customized treatment and  development plans, continuous follow-up, and measurable  transformation toward excellence, employability, innovation,  and global leadership.",
      ar: "منظومة علمية متكاملة تبدأ بالتشخيص الدقيق متعدد الأبعاد للإمكانات الفردية  والمؤسسية، ثم إعداد تقارير احترافية، وبناء خطط علاجية وتطويرية مخصصة، مع  متابعة التنفيذ وقياس الأثر؛ للوصول إلى التميز، والتوظيف، والابتكار، والريادة  العالمية.",
    },
    paragraph2: {
      en: "Whether you are launching your first venture, scaling an existing business, or developing your organisation's leadership, DSC provides the guidance, frameworks, and support to get you there.",
      ar: "سواء كنت تطلق مشروعك الأول، أو تُوسّع عملاً قائماً، أو تطوّر قيادة مؤسستك، تقدم DSC التوجيه والأطر الداعمة التي تحتاجها لتصل إلى هدفك.",
    },
  },

  services: {
    sectionTitle: { en: "Our Services", ar: "خدماتنا" },
    individual: {
      title: { en: "Individual Services", ar: "الخدمات الفردية" },
      description: {
        en: "Tailored programmes for professionals, entrepreneurs, and career changers ready to make their next big move.",
        ar: "برامج مصمَّمة خصيصاً للمهنيين وأصحاب الأعمال والراغبين في تغيير مساراتهم المهنية.",
      },
      bullets: [
        { en: "Startup strategy & validation", ar: "استراتيجية الشركات الناشئة والتحقق منها" },
        { en: "1-on-1 executive mentorship", ar: "إرشاد تنفيذي فردي" },
        { en: "Personal brand development", ar: "تطوير العلامة الشخصية" },
        { en: "Career transition coaching", ar: "تدريب تغيير المسار المهني" },
      ],
    },
    institutional: {
      title: { en: "Institutional Services", ar: "الخدمات المؤسسية" },
      description: {
        en: "Strategic programmes designed to transform teams, culture, and organisational performance at scale.",
        ar: "برامج استراتيجية مصمَّمة لتحويل الفرق والثقافة والأداء المؤسسي على نطاق واسع.",
      },
      bullets: [
        { en: "Corporate training & upskilling", ar: "التدريب المؤسسي وتطوير المهارات" },
        { en: "Team development workshops", ar: "ورش عمل تطوير الفرق" },
        { en: "Organisational strategy design", ar: "تصميم الاستراتيجية المؤسسية" },
        { en: "Leadership development programs", ar: "برامج تطوير القيادة" },
      ],
    },
  },

  cta: {
    heading: {
      en: "Ready to Start Your Journey?",
      ar: "هل أنت مستعد لبدء رحلتك؟",
    },
    subtext: {
      en: "Take the first step. Complete our intake form and one of our consultants will reach out within 48 hours.",
      ar: "اخطُ الخطوة الأولى. أكمل نموذج الاستقبال وسيتواصل معك أحد مستشارينا خلال 48 ساعة.",
    },
    button: { en: "Book Now", ar: "احجز الآن" },
  },

  footer: {
    tagline: {
      en: "Empowering growth through strategy, mentorship, and execution.",
      ar: "تمكين النمو من خلال الاستراتيجية والإرشاد والتنفيذ.",
    },
    linksTitle: { en: "Quick Links", ar: "روابط سريعة" },
    contactTitle: { en: "Contact", ar: "تواصل معنا" },
    contact: {
      email: { en: "hello@dsc.consulting", ar: "hello@dsc.consulting" },
      phone: { en: "+966 50 000 0000", ar: "+966 50 000 0000" },
      location: { en: "Riyadh, Saudi Arabia", ar: "الرياض، المملكة العربية السعودية" },
    },
    copyright: {
      en: "© 2025 Development Secrets Consultancy. All rights reserved.",
      ar: "© 2025 Development Secrets Consultancy. جميع الحقوق محفوظة.",
    },
  },
};
