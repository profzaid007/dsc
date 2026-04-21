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
    items: ServiceItem[];
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
    items: [
      {
        title: { en: "Scientific Multi-dimensional Diagnosis", ar: "التشخيص العلمي الدقيق متعدد الأبعاد" },
        description: { en: "A precise multi-dimensional assessment of cognitive, psychological, behavioral, sensory, academic, and developmental abilities using scientifically validated tools, leading to a clear understanding of strengths, weaknesses, and true potential.", ar: "تشخيص علمي دقيق متعدد الأبعاد يشمل القدرات المعرفية والنفسية والسلوكية والحسية والأكاديمية والنمائية باستخدام أدوات علمية معتمدة، بهدف كشف نقاط القوة والضعف والإمكانات الحقيقية." },
        bullets: [
          { en: "Cognitive abilities assessment", ar: "تقييم القدرات المعرفية" },
          { en: "Psychological & behavioral evaluation", ar: "التقييم النفسي والسلوكي" },
          { en: "Sensory & developmental screening", ar: "الفحص الحسي والنمائي" },
          { en: "Academic performance analysis", ar: "تحليل الأداء الأكاديمي" },
        ],
      },
      {
        title: { en: "Professional Diagnostic Reports", ar: "التقارير التشخيصية الاحترافية" },
        description: { en: "Comprehensive, evidence-based reports providing deep analysis, clear interpretation of results, and actionable insights for individuals, families, and professionals.", ar: "تقارير تحليلية احترافية مدعومة بالأدلة العلمية، تقدم تفسيرًا دقيقاً للنتائج مع توصيات عملية قابلة للتطبيق للأفراد والأسر والمتخصصين." },
        bullets: [
          { en: "Evidence-based analysis", ar: "تحليل مبني على الأدلة" },
          { en: "Clear interpretation of results", ar: "تفسير واضح للنتائج" },
          { en: "Actionable recommendations", ar: "توصيات عملية قابلة للتطبيق" },
        ],
      },
      {
        title: { en: "Customized Treatment & Development Plans", ar: "الخطط العلاجية والتطويرية المخصصة" },
        description: { en: "Customized intervention and development plans designed to treat weaknesses, enhance strengths, and guide individuals toward measurable growth and high performance.", ar: "خطط علاجية وتطويرية مخصصةaimed at addressing weaknesses and enhancing strengths." },
        bullets: [
          { en: "Personalized intervention strategies", ar: "استراتيجيات تدخل مخصصة" },
          { en: "Strength enhancement programs", ar: "برامج تعزيز نقاط القوة" },
          { en: "Measurable growth tracking", ar: "تتبع النمو القابل للقياس" },
        ],
      },
      {
        title: { en: "Follow-Up & Performance Optimization", ar: "المتابعة وتطوير الأداء" },
        description: { en: "Continuous monitoring, evaluation, and adjustment of plans to ensure real progress, sustainable development, and measurable outcomes.", ar: "متابعة مستمرة لتنفيذ الخطط، وتقييم التقدم، وتعديل المسار لضمان تحقيق نتائج حقيقية ومستدامة." },
        bullets: [
          { en: "Continuous monitoring", ar: "المتابعة المستمرة" },
          { en: "Progress evaluation", ar: "تقييم التقدم" },
          { en: "Plan adjustment & optimization", ar: "تعديل وتحسين الخطط" },
        ],
      },
      {
        title: { en: "Creative & Reflective Thinking Development", ar: "تنمية التفكير الإبداعي والتأملي" },
        description: { en: "A structured program focused on developing internal thinking processes, including reflective thinking, critical thinking, metacognition, imagination, and cognitive flexibility.", ar: "برنامج علمي يركز على تطوير عمليات التفكير الداخلية، مثل التفكير التأملي، النقدي، ما وراء المعرفة، الخيال، والمرونة العقلية." },
        bullets: [
          { en: "Reflective thinking skills", ar: "مهارات التفكير التأملي" },
          { en: "Critical thinking development", ar: "تطوير التفكير النقدي" },
          { en: "Metacognition & imagination", ar: "ما وراء المعرفة والخيال" },
        ],
      },
      {
        title: { en: "Invention & Product Development", ar: "تطوير الاختراع وإنتاج الحلول" },
        description: { en: "A practical program that transforms creative ideas into tangible inventions or solutions by applying scientific thinking, design processes, and structured problem-solving.", ar: "برنامج تطبيقي لتحويل الأفكار الإبداعية إلى اختراعات أو حلول عملية من خلال التفكير العلمي والتصميم وحل المشكلات بشكل منهجي." },
        bullets: [
          { en: "Idea to invention transformation", ar: "تحويل الأفكار إلى اختراعات" },
          { en: "Scientific thinking & design", ar: "التفكير العلمي والتصميم" },
          { en: "Structured problem-solving", ar: "حل المشكلات بشكل منهجي" },
        ],
      },
      {
        title: { en: "Innovation & Applied Solutions Development", ar: "تطوير الابتكار والتطبيقات العملية" },
        description: { en: "Focuses on transforming inventions into usable, scalable, and impactful applications across real-life domains, including education, business, and technology.", ar: "التركيز على تحويل الاختراعات إلى تطبيقات عملية قابلة للاستخدام والتوسع والتأثير في مجالات متعددة." },
        bullets: [
          { en: "Scalable application development", ar: "تطوير التطبيقات القابلة للتوسع" },
          { en: "Impact measurement", ar: "قياس الأثر" },
          { en: "Cross-sector implementation", ar: "التنفيذ عبر القطاعات" },
        ],
      },
      {
        title: { en: "Entrepreneurship & Global Rankings", ar: "ريادة الأعمال والاعتمادات العالمية" },
        description: { en: "An advanced program that aims to build the capacity to develop pioneering projects capable of achieving leadership and accreditation by specialized scientific bodies.", ar: "برنامج متقدم يهدف إلى بناء القدرة على تطوير المشاريع الرائدة والقادرة على تحقيق Leadership والاعتماد." },
        bullets: [
          { en: "Project accreditation support", ar: "دعم اعتماد المشاريع" },
          { en: "Global ranking optimization", ar: "تحسين الترتيبات العالمية" },
          { en: "Leadership development", ar: "تطوير القيادة" },
        ],
      },
      {
        title: { en: "Academic Development & Global Opportunities", ar: "التطوير الأكاديمي والفرص العالمية" },
        description: { en: "A comprehensive, lifelong academic support system that guides individuals from early education through postgraduate studies, research, publication, and global career opportunities.", ar: "منظومة متكاملة لمرافقة الفرد أكاديمياً من مرحلة الطفولة مرورًا بالتعليم المدرسي والجامعي والدراسات العليا، وصولاً إلى البحث العلمي والنشر والفرص العالمية." },
        bullets: [
          { en: "Academic pathway planning", ar: "التخطيط للمسار الأكاديمي" },
          { en: "Research & publication support", ar: "دعم البحث والنشر" },
          { en: "Global career opportunities", ar: "فرص careers عالمية" },
        ],
      },
      {
        title: { en: "Academic Performance & Learning Skills", ar: "دعم الأداء الدراسي ومهارات التعلم" },
        description: { en: "A comprehensive service designed to enhance academic performance by developing effective learning strategies, cognitive skills, and study habits.", ar: "خدمة متكاملة تهدف إلى تحسين الأداء الدراسي من خلال تنمية مهارات التعلم الفعّال والاستراتيجيات الدراسية والقدرات المعرفية." },
        bullets: [
          { en: "Learning strategies development", ar: "تطوير استراتيجيات التعلم" },
          { en: "Cognitive skills enhancement", ar: "تعزيز القدرات المعرفية" },
          { en: "Study efficiency optimization", ar: "تحسين كفاءة الدراسة" },
        ],
      },
      {
        title: { en: "University Admissions Preparation", ar: "الإعداد للقبولات الجامعية" },
        description: { en: "A specialized service to guide students in selecting the most suitable academic major based on their abilities and future goals, while preparing strong application files.", ar: "خدمة متخصصة لمساعدة الطالب في اختيار التخصص المناسب وفق قدراته وأهدافه المستقبلية، مع إعداد ملفات تقديم احترافية." },
        bullets: [
          { en: "Major selection guidance", ar: "توجيه اختيار التخصص" },
          { en: "Application file preparation", ar: "إعداد ملف التقديم" },
          { en: "Admission strategy", ar: "استراتيجية القبول" },
        ],
      },
      {
        title: { en: "Scholarships & Study Abroad", ar: "المنح والبعثات الدراسية" },
        description: { en: "Professional support in identifying, preparing, and applying for global scholarships and study opportunities.", ar: "دعم احترافي في البحث عن المنح والبعثات العالمية والتقديم لها." },
        bullets: [
          { en: "Scholarship research", ar: "البحث عن المنح" },
          { en: "Application optimization", ar: "تحسين ملفات التقديم" },
          { en: "Strategic positioning", ar: "الوضع الاستراتيجي" },
        ],
      },
      {
        title: { en: "Scientific Research & Statistical Analysis", ar: "البحث العلمي والتحليل الإحصائي" },
        description: { en: "Comprehensive support in conducting scientific research, including research design, data collection, and advanced statistical analysis.", ar: "خدمة متكاملة لدعم إعداد البحوث العلمية، تشمل تصميم الدراسات وجمع البيانات وتحليلها." },
        bullets: [
          { en: "Research design", ar: "تصميم البحث" },
          { en: "Data collection & analysis", ar: "جمع البيانات والتحليل" },
          { en: "Advanced statistical tools (SPSS, R, AI)", ar: "أدوات إحصائية متقدمة" },
        ],
      },
      {
        title: { en: "Academic Writing & Scientific Publication", ar: "الكتابة الأكاديمية والنشر العلمي" },
        description: { en: "Professional academic writing and editing services aimed at producing high-quality research papers and publishing them in reputable international journals.", ar: "خدمات احترافية في الكتابة الأكاديمية وإعداد الأبحاث للنشر في مجلات علمية عالمية." },
        bullets: [
          { en: "Paper writing & editing", ar: "كتابة وتدقيق الأوراق" },
          { en: "Journal submission (Scopus/ISI)", ar: "التقديم للمجلات" },
          { en: "Quality assurance", ar: "ضمان الجودة" },
        ],
      },
      {
        title: { en: "Certified Translation Services", ar: "الترجمة الأكاديمية والقانونية المعتمدة" },
        description: { en: "Certified and accurate academic and legal translation services with professional scientific proofreading.", ar: "خدمات ترجمة أكاديمية وقانونية معتمدة ودقيقة وتدقيق علمي احترافي." },
        bullets: [
          { en: "Certified translation", ar: "ترجمة معتمدة" },
          { en: "Scientific proofreading", ar: "التدقيق العلمي" },
          { en: "Plagiarism verification", ar: "التحقق من الأصالة" },
        ],
      },
      {
        title: { en: "Career Readiness & Professional Skills", ar: "التأهيل المهني لسوق العمل" },
        description: { en: "A structured program designed to equip individuals with essential professional skills required in the modern workforce.", ar: "برنامج متكامل لتأهيل الأفراد بمهارات سوق العمل الحديثة." },
        bullets: [
          { en: "Communication skills", ar: "مهارات التواصل" },
          { en: "Problem-solving abilities", ar: "قدرات حل المشكلات" },
          { en: "AI-era competencies", ar: "كفاءات عصر الذكاء الاصطناعي" },
        ],
      },
      {
        title: { en: "Career Planning & Path Development", ar: "التخطيط الوظيفي وبناء المسار المهني" },
        description: { en: "Guidance service to help individuals identify their career direction, align their skills with market demands, and build a clear professional pathway.", ar: "خدمة توجيه مهني تساعد الأفراد على تحديد مسارهم الوظيفي، ومواءمة مهاراتهم مع متطلبات السوق." },
        bullets: [
          { en: "Career assessment", ar: "تقييم المسار المهني" },
          { en: "Skills-market alignment", ar: "مواءمة المهارات مع السوق" },
          { en: "Long-term career planning", ar: "التخطيط الوظيفي طويل الأمد" },
        ],
      },
      {
        title: { en: "Future Skills & Digital Transformation", ar: "مهارات المستقبل والتحول الرقمي" },
        description: { en: "Training programs focused on developing future-ready skills such as AI literacy, data analysis, digital tools, and innovation capabilities.", ar: "برامج تدريبية لتنمية مهارات المستقبل مثل الذكاء الاصطناعي، تحليل البيانات، الأدوات الرقمية، والابتكار." },
        bullets: [
          { en: "AI literacy", ar: "محو أمية الذكاء الاصطناعي" },
          { en: "Data analysis skills", ar: "مهارات تحليل البيانات" },
          { en: "Digital tools proficiency", ar: "إتقان الأدوات الرقمية" },
        ],
      },
      {
        title: { en: "Feasibility Studies", ar: "دراسات الجدوى للمشاريع" },
        description: { en: "Professional feasibility studies to evaluate the viability of new projects, including market analysis, financial projections, and strategic planning.", ar: "إعداد دراسات جدوى احترافية لتقييم فرص نجاح المشاريع الجديدة." },
        bullets: [
          { en: "Market analysis", ar: "تحليل السوق" },
          { en: "Financial projections", ar: "التوقعات المالية" },
          { en: "Strategic planning", ar: "التخطيط الاستراتيجي" },
        ],
      },
      {
        title: { en: "Startup Development", ar: "تأسيس المشاريع الناشئة" },
        description: { en: "End-to-end support for building startups from idea to execution, including business modelling, strategy development, and operational setup.", ar: "دعم متكامل لتأسيس المشاريع الناشئة من الفكرة إلى التنفيذ." },
        bullets: [
          { en: "Business modelling", ar: "نمذجة الأعمال" },
          { en: "Strategy development", ar: "تطوير الاستراتيجية" },
          { en: "Operational setup", ar: "إعداد التشغيل" },
        ],
      },
      {
        title: { en: "Institutional Performance Assessment", ar: "تشخيص الأداء المؤسسي" },
        description: { en: "Comprehensive analysis of organizational performance to identify strengths, weaknesses, opportunities, and risks using scientific methodologies.", ar: "تحليل شامل للأداء المؤسسي لتحديد نقاط القوة والضعف والفرص والتحديات." },
        bullets: [
          { en: "SWOT analysis", ar: "تحليل SWOT" },
          { en: "Performance metrics", ar: "مقاييس الأداء" },
          { en: "Data-driven insights", ar: "رؤى مبنية على البيانات" },
        ],
      },
      {
        title: { en: "Organizational Development Plans", ar: "خطط التطوير المؤسسي" },
        description: { en: "Designing strategic development plans aimed at improving efficiency, quality, productivity, and overall institutional performance.", ar: "إعداد خطط تطوير استراتيجيةaimed at enhancing institutional effectiveness." },
        bullets: [
          { en: "Strategic planning", ar: "التخطيط الاستراتيجي" },
          { en: "Quality improvement", ar: "تحسين الجودة" },
          { en: "Productivity enhancement", ar: "تعزيز الإنتاجية" },
        ],
      },
      {
        title: { en: "Institutional Excellence & Accreditation", ar: "التميز المؤسسي والاعتمادات الدولية" },
        description: { en: "Supporting organizations in achieving international standards and accreditations (ISO, IAO, etc.), enhancing quality systems and global competitiveness.", ar: "دعم المؤسسات في تحقيق الاعتمادات الدولية (ISO, IAO, وغيرها) وتطبيق معايير الجودة العالمية." },
        bullets: [
          { en: "ISO certification support", ar: "دعم اعتماد ISO" },
          { en: "Quality system development", ar: "تطوير أنظمة الجودة" },
          { en: "Global competitiveness", ar: "التنافسية العالمية" },
        ],
      },
      {
        title: { en: "Global Rankings & Institutional Branding", ar: "التصنيفات العالمية والعلامة المؤسسية" },
        description: { en: "Enhancing institutional visibility, reputation, and positioning through strategic branding and alignment with global ranking systems.", ar: "بناء وتعزيز الهوية المؤسسية ورفع مستوى الحضور العالمي من خلال التوافق مع معايير التصنيفات العالمية." },
        bullets: [
          { en: "Brand development", ar: "تطوير العلامة" },
          { en: "Ranking optimization", ar: "تحسين الترتيب" },
          { en: "Global visibility", ar: "الظهور العالمي" },
        ],
      },
      {
        title: { en: "International Tenders & Grants", ar: "التقديم على العطاءات والمنح الدولية" },
        description: { en: "Professional support in identifying and applying for international tenders, grants, and funding opportunities.", ar: "دعم احترافي في التقديم على العطاءات والمنح الدولية للحصول على التمويل." },
        bullets: [
          { en: "Tender identification", ar: "تحديد العطاءات" },
          { en: "Grant applications", ar: "تقديم المنح" },
          { en: "Funding opportunities", ar: "فرص التمويل" },
        ],
      },
      {
        title: { en: "Quality Assurance & Academic Accreditation", ar: "خدمات الجودة والاعتماد الأكاديمي" },
        description: { en: "Comprehensive service to support educational institutions in achieving high standards of quality and obtaining local and international academic accreditations.", ar: "خدمة متكاملة لدعم المؤسسات التعليمية في تحقيق أعلى معايير الجودة والحصول على الاعتمادات الأكاديمية." },
        bullets: [
          { en: "Performance diagnosis", ar: "تشخيص الأداء" },
          { en: "Quality system development", ar: "تطوير نظام الجودة" },
          { en: "Accreditation preparation", ar: "التحضير للاعتماد" },
        ],
      },
      {
        title: { en: "Employment & Career Development", ar: "خدمات التوظيف والتأهيل لسوق العمل" },
        description: { en: "Strategic service designed to prepare individuals for employment in the modern global labor market while supporting institutions in recruitment.", ar: "خدمة استراتيجية تهدف إلى تأهيل الأفراد لسوق العمل الحديث مع دعم المؤسسات في استقطاب الكفاءات." },
        bullets: [
          { en: "Career assessment", ar: "تقييم المسار المهني" },
          { en: "CV optimization (AI-supported)", ar: "تحسين السيرة الذاتية" },
          { en: "Interview preparation", ar: "التحضير للمقابلات" },
        ],
      },
      {
        title: { en: "Talent-Institution Integration", ar: "خدمات الربط بين الأفراد والمؤسسات" },
        description: { en: "Strategic integration service to connect high-potential individuals with high-performing institutions, enabling elite talent pipelines.", ar: "خدمة استراتيجيةaimed at connecting talented individuals with excellent institutions." },
        bullets: [
          { en: "Talent identification", ar: "تحديد المواهب" },
          { en: "Smart matching", ar: "المطابقة الذكية" },
          { en: "Strategic clustering", ar: "التكتلات الاستراتيجية" },
        ],
      },
    ],
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
