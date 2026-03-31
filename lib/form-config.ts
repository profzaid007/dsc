import type { FormStep } from "@/types/form";

export const FORM_STEPS: FormStep[] = [
  {
    id: "quick-start",
    title: { en: "Let's Get Started", ar: "لنبدأ" },
    description: {
      en: "Tell us a little about yourself to get started.",
      ar: "أخبرنا قليلاً عن نفسك للبدء.",
    },
    questions: [
      {
        id: "full_name",
        type: "text",
        label: { en: "Full Name", ar: "الاسم الكامل" },
        placeholder: { en: "e.g. Ahmed Al-Rashid", ar: "مثال: أحمد الراشد" },
        required: true,
        validation: [
          {
            type: "minLength",
            value: 2,
            message: {
              en: "Name must be at least 2 characters",
              ar: "يجب أن يكون الاسم حرفين على الأقل",
            },
          },
        ],
      },
      {
        id: "phone",
        type: "text",
        label: { en: "Phone Number", ar: "رقم الهاتف" },
        placeholder: { en: "e.g. +966 50 000 0000", ar: "مثال: 0050 966+" },
        required: true,
        validation: [
          {
            type: "pattern",
            value: "^[\\d\\s\\+\\-\\(\\)]{7,20}$",
            message: {
              en: "Please enter a valid phone number",
              ar: "يرجى إدخال رقم هاتف صحيح",
            },
          },
        ],
      },
      {
        id: "main_goal",
        type: "select",
        label: { en: "What is your main goal?", ar: "ما هو هدفك الرئيسي؟" },
        required: true,
        options: [
          {
            value: "start_business",
            label: { en: "Start a business", ar: "بدء مشروع تجاري" },
          },
          {
            value: "grow_business",
            label: {
              en: "Grow an existing business",
              ar: "تنمية مشروع قائم",
            },
          },
          {
            value: "career_transition",
            label: { en: "Career transition", ar: "تغيير المسار المهني" },
          },
          {
            value: "freelance",
            label: {
              en: "Start freelancing",
              ar: "بدء العمل الحر",
            },
          },
          {
            value: "skill_development",
            label: { en: "Skill development", ar: "تطوير المهارات" },
          },
          {
            value: "other",
            label: { en: "Other", ar: "أخرى" },
          },
        ],
      },
    ],
  },

  {
    id: "basic-info",
    title: { en: "Basic Information", ar: "المعلومات الأساسية" },
    description: {
      en: "Help us understand your background.",
      ar: "ساعدنا على فهم خلفيتك.",
    },
    questions: [
      {
        id: "nationality",
        type: "select",
        label: { en: "Nationality", ar: "الجنسية" },
        required: true,
        options: [
          { value: "sa", label: { en: "Saudi Arabia", ar: "المملكة العربية السعودية" } },
          { value: "ae", label: { en: "UAE", ar: "الإمارات العربية المتحدة" } },
          { value: "kw", label: { en: "Kuwait", ar: "الكويت" } },
          { value: "qa", label: { en: "Qatar", ar: "قطر" } },
          { value: "bh", label: { en: "Bahrain", ar: "البحرين" } },
          { value: "om", label: { en: "Oman", ar: "عُمان" } },
          { value: "eg", label: { en: "Egypt", ar: "مصر" } },
          { value: "jo", label: { en: "Jordan", ar: "الأردن" } },
          { value: "lb", label: { en: "Lebanon", ar: "لبنان" } },
          { value: "other", label: { en: "Other", ar: "أخرى" } },
        ],
      },
      {
        id: "age_range",
        type: "radio",
        label: { en: "Age Range", ar: "الفئة العمرية" },
        required: true,
        options: [
          { value: "18-24", label: { en: "18–24", ar: "18–24" } },
          { value: "25-34", label: { en: "25–34", ar: "25–34" } },
          { value: "35-44", label: { en: "35–44", ar: "35–44" } },
          { value: "45+", label: { en: "45+", ar: "45+" } },
        ],
      },
      {
        id: "city",
        type: "text",
        label: { en: "City", ar: "المدينة" },
        placeholder: { en: "e.g. Riyadh", ar: "مثال: الرياض" },
        required: true,
      },
      {
        id: "preferred_contact",
        type: "radio",
        label: { en: "Preferred Contact Method", ar: "طريقة التواصل المفضلة" },
        required: true,
        options: [
          { value: "whatsapp", label: { en: "WhatsApp", ar: "واتساب" } },
          { value: "email", label: { en: "Email", ar: "البريد الإلكتروني" } },
          { value: "phone", label: { en: "Phone Call", ar: "مكالمة هاتفية" } },
        ],
      },
    ],
  },

  {
    id: "education-work",
    title: { en: "Education & Work", ar: "التعليم والعمل" },
    description: {
      en: "Tell us about your academic and professional background.",
      ar: "أخبرنا عن خلفيتك الأكاديمية والمهنية.",
    },
    questions: [
      {
        id: "education_level",
        type: "select",
        label: { en: "Education Level", ar: "المستوى التعليمي" },
        required: true,
        options: [
          {
            value: "high_school",
            label: { en: "High School", ar: "الثانوية العامة" },
          },
          {
            value: "diploma",
            label: { en: "Diploma", ar: "دبلوم" },
          },
          {
            value: "bachelors",
            label: { en: "Bachelor's Degree", ar: "بكالوريوس" },
          },
          {
            value: "masters",
            label: { en: "Master's Degree", ar: "ماجستير" },
          },
          { value: "phd", label: { en: "PhD", ar: "دكتوراه" } },
          { value: "other", label: { en: "Other", ar: "أخرى" } },
        ],
      },
      {
        id: "field_of_study",
        type: "text",
        label: { en: "Field of Study / Specialization", ar: "مجال الدراسة / التخصص" },
        placeholder: {
          en: "e.g. Business Administration",
          ar: "مثال: إدارة الأعمال",
        },
      },
      {
        id: "employment_status",
        type: "radio",
        label: { en: "Current Employment Status", ar: "الوضع الوظيفي الحالي" },
        required: true,
        options: [
          { value: "employed", label: { en: "Employed", ar: "موظف" } },
          {
            value: "self_employed",
            label: { en: "Self-Employed", ar: "عمل حر" },
          },
          { value: "student", label: { en: "Student", ar: "طالب" } },
          { value: "unemployed", label: { en: "Unemployed", ar: "غير موظف" } },
        ],
      },
      {
        id: "years_experience",
        type: "number",
        label: {
          en: "Years of Professional Experience",
          ar: "سنوات الخبرة المهنية",
        },
        placeholder: { en: "e.g. 5", ar: "مثال: 5" },
        validation: [
          {
            type: "min",
            value: 0,
            message: {
              en: "Experience cannot be negative",
              ar: "لا يمكن أن تكون الخبرة سلبية",
            },
          },
          {
            type: "max",
            value: 60,
            message: {
              en: "Please enter a valid number of years",
              ar: "يرجى إدخال عدد سنوات صحيح",
            },
          },
        ],
      },
    ],
  },

  {
    id: "goals",
    title: { en: "Your Goals", ar: "أهدافك" },
    description: {
      en: "What are you looking to achieve?",
      ar: "ما الذي تسعى إلى تحقيقه؟",
    },
    questions: [
      {
        id: "primary_goal",
        type: "multi-select",
        label: {
          en: "Primary Goals (select all that apply)",
          ar: "الأهداف الرئيسية (اختر كل ما ينطبق)",
        },
        required: true,
        options: [
          {
            value: "launch_startup",
            label: { en: "Launch a startup", ar: "إطلاق شركة ناشئة" },
          },
          {
            value: "freelance",
            label: { en: "Start freelancing", ar: "بدء العمل الحر" },
          },
          {
            value: "consulting",
            label: {
              en: "Build a consulting practice",
              ar: "بناء ممارسة استشارية",
            },
          },
          {
            value: "digital_product",
            label: {
              en: "Create a digital product",
              ar: "إنشاء منتج رقمي",
            },
          },
          {
            value: "scale_business",
            label: {
              en: "Scale an existing business",
              ar: "توسيع عمل قائم",
            },
          },
          {
            value: "personal_brand",
            label: { en: "Build a personal brand", ar: "بناء علامة شخصية" },
          },
          {
            value: "investment",
            label: { en: "Learn to invest", ar: "تعلم الاستثمار" },
          },
        ],
      },
      {
        id: "timeline",
        type: "select",
        label: {
          en: "What is your timeline to achieve this goal?",
          ar: "ما هو الإطار الزمني لتحقيق هدفك؟",
        },
        required: true,
        options: [
          {
            value: "less_3m",
            label: { en: "Less than 3 months", ar: "أقل من 3 أشهر" },
          },
          { value: "3_6m", label: { en: "3–6 months", ar: "3–6 أشهر" } },
          { value: "6_12m", label: { en: "6–12 months", ar: "6–12 شهراً" } },
          { value: "1_2y", label: { en: "1–2 years", ar: "1–2 سنة" } },
          {
            value: "more_2y",
            label: { en: "More than 2 years", ar: "أكثر من سنتين" },
          },
        ],
      },
      {
        id: "biggest_challenge",
        type: "textarea",
        label: {
          en: "What is your biggest challenge right now?",
          ar: "ما هو أكبر تحدٍّ تواجهه الآن؟",
        },
        placeholder: {
          en: "Describe your main obstacle...",
          ar: "صف عقبتك الرئيسية...",
        },
        required: true,
      },
    ],
  },

  {
    id: "idea-project",
    title: { en: "Your Idea or Project", ar: "فكرتك أو مشروعك" },
    description: {
      en: "Tell us about what you're working on.",
      ar: "أخبرنا عما تعمل عليه.",
    },
    questions: [
      {
        id: "has_idea",
        type: "radio",
        label: {
          en: "Do you have a business idea or project in mind?",
          ar: "هل لديك فكرة تجارية أو مشروع في الذهن؟",
        },
        required: true,
        options: [
          { value: "yes", label: { en: "Yes", ar: "نعم" } },
          { value: "no", label: { en: "Not yet", ar: "ليس بعد" } },
        ],
      },
      {
        id: "idea_description",
        type: "textarea",
        label: {
          en: "Describe your idea or project",
          ar: "صف فكرتك أو مشروعك",
        },
        placeholder: {
          en: "What problem does it solve? Who is your target audience?",
          ar: "ما المشكلة التي تحلها؟ من هو جمهورك المستهدف؟",
        },
        required: true,
        conditional: { questionId: "has_idea", value: "yes" },
      },
      {
        id: "idea_stage",
        type: "select",
        label: { en: "Stage of your idea / project", ar: "مرحلة فكرتك / مشروعك" },
        conditional: { questionId: "has_idea", value: "yes" },
        options: [
          {
            value: "just_idea",
            label: { en: "Just an idea", ar: "مجرد فكرة" },
          },
          {
            value: "validated",
            label: { en: "Validated concept", ar: "مفهوم مُتحقق منه" },
          },
          {
            value: "mvp",
            label: { en: "MVP built", ar: "نموذج أولي مبني" },
          },
          {
            value: "revenue",
            label: { en: "Generating revenue", ar: "يحقق إيرادات" },
          },
        ],
      },
    ],
  },

  {
    id: "needs",
    title: { en: "Your Needs", ar: "احتياجاتك" },
    description: {
      en: "What kind of support are you looking for?",
      ar: "ما نوع الدعم الذي تبحث عنه؟",
    },
    questions: [
      {
        id: "needs",
        type: "multi-select",
        label: {
          en: "What do you need most? (select all that apply)",
          ar: "ما الذي تحتاجه أكثر؟ (اختر كل ما ينطبق)",
        },
        required: true,
        options: [
          { value: "mentorship", label: { en: "Mentorship", ar: "الإرشاد" } },
          {
            value: "strategy",
            label: { en: "Business strategy", ar: "استراتيجية الأعمال" },
          },
          {
            value: "technical",
            label: { en: "Technical help", ar: "المساعدة التقنية" },
          },
          {
            value: "marketing",
            label: { en: "Marketing & branding", ar: "التسويق والعلامة التجارية" },
          },
          {
            value: "funding",
            label: { en: "Funding & investors", ar: "التمويل والمستثمرون" },
          },
          {
            value: "networking",
            label: { en: "Networking", ar: "بناء الشبكات" },
          },
          {
            value: "accountability",
            label: { en: "Accountability", ar: "المحاسبة والمتابعة" },
          },
        ],
      },
      {
        id: "budget_range",
        type: "select",
        label: {
          en: "Monthly budget for coaching / consulting",
          ar: "الميزانية الشهرية للتدريب / الاستشارة",
        },
        required: true,
        options: [
          {
            value: "under_500",
            label: { en: "Under $500", ar: "أقل من $500" },
          },
          { value: "500_1000", label: { en: "$500–$1,000", ar: "$500–$1,000" } },
          {
            value: "1000_2500",
            label: { en: "$1,000–$2,500", ar: "$1,000–$2,500" },
          },
          {
            value: "2500_5000",
            label: { en: "$2,500–$5,000", ar: "$2,500–$5,000" },
          },
          {
            value: "over_5000",
            label: { en: "Over $5,000", ar: "أكثر من $5,000" },
          },
        ],
      },
    ],
  },

  {
    id: "commitment",
    title: { en: "Your Commitment", ar: "التزامك" },
    description: {
      en: "Understanding your availability helps us tailor the right program.",
      ar: "معرفة توفرك يساعدنا في تصميم البرنامج المناسب.",
    },
    questions: [
      {
        id: "hours_per_week",
        type: "radio",
        label: {
          en: "How many hours per week can you dedicate?",
          ar: "كم ساعة في الأسبوع يمكنك تخصيصها؟",
        },
        required: true,
        options: [
          { value: "less_5", label: { en: "Less than 5 hours", ar: "أقل من 5 ساعات" } },
          { value: "5_10", label: { en: "5–10 hours", ar: "5–10 ساعات" } },
          { value: "10_20", label: { en: "10–20 hours", ar: "10–20 ساعة" } },
          { value: "20_plus", label: { en: "20+ hours", ar: "أكثر من 20 ساعة" } },
        ],
      },
      {
        id: "can_invest",
        type: "radio",
        label: {
          en: "Are you ready to invest in your growth?",
          ar: "هل أنت مستعد للاستثمار في نموك؟",
        },
        required: true,
        options: [
          { value: "yes", label: { en: "Yes, I'm ready", ar: "نعم، أنا مستعد" } },
          { value: "maybe", label: { en: "Maybe, need more info", ar: "ربما، أحتاج مزيداً من المعلومات" } },
          { value: "no", label: { en: "Not right now", ar: "ليس الآن" } },
        ],
      },
    ],
  },

  {
    id: "learning-preference",
    title: { en: "Learning Preference", ar: "تفضيلات التعلم" },
    description: {
      en: "How do you learn best?",
      ar: "كيف تتعلم بأفضل طريقة؟",
    },
    questions: [
      {
        id: "learning_style",
        type: "multi-select",
        label: {
          en: "Preferred learning formats (select all that apply)",
          ar: "أساليب التعلم المفضلة (اختر كل ما ينطبق)",
        },
        required: true,
        options: [
          {
            value: "one_on_one",
            label: { en: "1-on-1 coaching", ar: "تدريب فردي" },
          },
          {
            value: "group_workshops",
            label: { en: "Group workshops", ar: "ورش عمل جماعية" },
          },
          {
            value: "self_paced",
            label: { en: "Self-paced courses", ar: "دورات ذاتية" },
          },
          {
            value: "live_sessions",
            label: { en: "Live online sessions", ar: "جلسات مباشرة عبر الإنترنت" },
          },
          {
            value: "community",
            label: { en: "Community & peer learning", ar: "مجتمع وتعلم من الأقران" },
          },
        ],
      },
      {
        id: "language_preference",
        type: "radio",
        label: {
          en: "Preferred language for sessions",
          ar: "اللغة المفضلة للجلسات",
        },
        required: true,
        options: [
          { value: "english", label: { en: "English", ar: "الإنجليزية" } },
          { value: "arabic", label: { en: "Arabic", ar: "العربية" } },
          { value: "both", label: { en: "Both", ar: "كلتاهما" } },
        ],
      },
    ],
  },

  {
    id: "self-assessment",
    title: { en: "Self Assessment", ar: "التقييم الذاتي" },
    description: {
      en: "Honest self-reflection helps us serve you better.",
      ar: "التأمل الصادق مع الذات يساعدنا على خدمتك بشكل أفضل.",
    },
    questions: [
      {
        id: "confidence_level",
        type: "rating",
        label: {
          en: "How confident are you in your ability to succeed?",
          ar: "ما مدى ثقتك بقدرتك على النجاح؟",
        },
        required: true,
      },
      {
        id: "readiness_score",
        type: "rating",
        label: {
          en: "How ready are you to take action today?",
          ar: "ما مدى استعدادك للتحرك اليوم؟",
        },
        required: true,
      },
      {
        id: "additional_notes",
        type: "textarea",
        label: {
          en: "Anything else you'd like us to know?",
          ar: "هل هناك أي شيء آخر تريد إخبارنا به؟",
        },
        placeholder: {
          en: "Share any additional context, questions, or concerns...",
          ar: "شارك أي سياق إضافي أو أسئلة أو مخاوف...",
        },
      },
    ],
  },
];
