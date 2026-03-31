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
      en: "Unlock Your Development Secrets",
      ar: "اكتشف أسرار تطورك",
    },
    subheadline: {
      en: "Expert consultancy to help individuals and institutions achieve breakthrough growth — through strategy, mentorship, and execution.",
      ar: "استشارات متخصصة تساعد الأفراد والمؤسسات على تحقيق نمو استثنائي — من خلال الاستراتيجية والإرشاد والتنفيذ.",
    },
    cta: { en: "Book a Free Consultation", ar: "احجز استشارة مجانية" },
  },

  about: {
    sectionTitle: { en: "About DSC", ar: "عن DSC" },
    paragraph1: {
      en: "Development Secrets Consultancy (DSC) is a premier consultancy firm dedicated to unlocking the full potential of ambitious individuals and forward-thinking institutions. We combine deep expertise with a human-first approach to deliver lasting, measurable results.",
      ar: "Development Secrets Consultancy (DSC) هي شركة استشارية رائدة مكرّسة للكشف عن الإمكانات الكاملة للأفراد الطموحين والمؤسسات ذات التفكير المستقبلي. نجمع بين الخبرة العميقة والنهج الإنساني أولاً لتقديم نتائج دائمة وقابلة للقياس.",
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
