migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("roles_management")
    collection.fields.add(new TextField({ name: "role_group" }))
    collection.fields.add(
      new NumberField({ name: "role_order", onlyInt: true })
    )
    collection.fields.add(new BoolField({ name: "is_retired" }))
    app.save(collection)
    const catalog = [
      {
        role_name_en: "Special Educator",
        role_name_ar: "معلم التربية الخاصة",
        role_group: "special-needs",
        role_order: 1,
      },
      {
        role_name_en: "Learning Disabilities Specialist",
        role_name_ar: "أخصائي صعوبات التعلم",
        role_group: "special-needs",
        role_order: 2,
      },
      {
        role_name_en: "Autism Specialist",
        role_name_ar: "أخصائي التوحد",
        role_group: "special-needs",
        role_order: 3,
      },
      {
        role_name_en: "Intellectual Disability Specialist",
        role_name_ar: "أخصائي الإعاقة الذهنية",
        role_group: "special-needs",
        role_order: 4,
      },
      {
        role_name_en: "Early Intervention Specialist",
        role_name_ar: "أخصائي التدخل المبكر",
        role_group: "special-needs",
        role_order: 5,
      },
      {
        role_name_en: "Speech-Language Pathologist",
        role_name_ar: "أخصائي النطق واللغة",
        role_group: "special-needs",
        role_order: 6,
      },
      {
        role_name_en: "Occupational Therapist",
        role_name_ar: "أخصائي العلاج الوظيفي",
        role_group: "special-needs",
        role_order: 7,
      },
      {
        role_name_en: "Sensory Integration Therapist",
        role_name_ar: "أخصائي التكامل الحسي",
        role_group: "special-needs",
        role_order: 8,
      },
      {
        role_name_en: "Physiotherapist",
        role_name_ar: "أخصائي العلاج الطبيعي",
        role_group: "special-needs",
        role_order: 9,
      },
      {
        role_name_en: "BCBA (Behavior Analyst)",
        role_name_ar: "محلل سلوك معتمد (BCBA)",
        role_group: "special-needs",
        role_order: 10,
      },
      {
        role_name_en: "Behavior Technician (RBT)",
        role_name_ar: "فني سلوك مسجل (RBT)",
        role_group: "special-needs",
        role_order: 11,
      },
      {
        role_name_en: "Life & Vocational Skills Trainer",
        role_name_ar: "مدرب المهارات الحياتية والمهنية",
        role_group: "special-needs",
        role_order: 12,
      },
      {
        role_name_en: "Parent Coach",
        role_name_ar: "مدرب الوالدين",
        role_group: "special-needs",
        role_order: 13,
      },
      {
        role_name_en: "Clinical Psychologist",
        role_name_ar: "أخصائي علم النفس الإكلينيكي",
        role_group: "mental-health",
        role_order: 14,
      },
      {
        role_name_en: "Child & Adolescent Psychologist",
        role_name_ar: "أخصائي علم نفس الأطفال والمراهقين",
        role_group: "mental-health",
        role_order: 15,
      },
      {
        role_name_en: "Educational Psychologist",
        role_name_ar: "أخصائي علم النفس التربوي",
        role_group: "mental-health",
        role_order: 16,
      },
      {
        role_name_en: "Counseling Psychologist",
        role_name_ar: "أخصائي علم النفس الإرشادي",
        role_group: "mental-health",
        role_order: 17,
      },
      {
        role_name_en: "Psychometrician",
        role_name_ar: "أخصائي القياس النفسي",
        role_group: "mental-health",
        role_order: 18,
      },
      {
        role_name_en: "Trauma Therapist",
        role_name_ar: "معالج الصدمات النفسية",
        role_group: "mental-health",
        role_order: 19,
      },
      {
        role_name_en: "Grief Counselor",
        role_name_ar: "مرشد الحزن والفقد",
        role_group: "mental-health",
        role_order: 20,
      },
      {
        role_name_en: "Marriage & Family Therapist",
        role_name_ar: "معالج الزواج والأسرة",
        role_group: "mental-health",
        role_order: 21,
      },
      {
        role_name_en: "School Counselor",
        role_name_ar: "مرشد مدرسي",
        role_group: "mental-health",
        role_order: 22,
      },
      {
        role_name_en: "Addiction Counselor",
        role_name_ar: "مرشد علاج الإدمان",
        role_group: "mental-health",
        role_order: 23,
      },
      {
        role_name_en: "Crisis Intervention Specialist",
        role_name_ar: "أخصائي التدخل في الأزمات",
        role_group: "mental-health",
        role_order: 24,
      },
      {
        role_name_en: "Organizational Psychologist",
        role_name_ar: "أخصائي علم النفس التنظيمي",
        role_group: "mental-health",
        role_order: 25,
      },
      {
        role_name_en: "Child & Adolescent Psychiatrist",
        role_name_ar: "طبيب نفسي للأطفال والمراهقين",
        role_group: "medical",
        role_order: 26,
      },
      {
        role_name_en: "Adult Psychiatrist",
        role_name_ar: "طبيب نفسي للبالغين",
        role_group: "medical",
        role_order: 27,
      },
      {
        role_name_en: "Developmental-Behavioral Pediatrician",
        role_name_ar: "طبيب أطفال تخصص النمو والسلوك",
        role_group: "medical",
        role_order: 28,
      },
      {
        role_name_en: "General Pediatrician",
        role_name_ar: "طبيب أطفال عام",
        role_group: "medical",
        role_order: 29,
      },
      {
        role_name_en: "Pediatric Neurologist",
        role_name_ar: "طبيب أعصاب الأطفال",
        role_group: "medical",
        role_order: 30,
      },
      {
        role_name_en: "Neurologist (Adult)",
        role_name_ar: "طبيب أعصاب للبالغين",
        role_group: "medical",
        role_order: 31,
      },
      {
        role_name_en: "Clinical Geneticist",
        role_name_ar: "طبيب الوراثة الإكلينيكية",
        role_group: "medical",
        role_order: 32,
      },
      {
        role_name_en: "ENT Specialist",
        role_name_ar: "طبيب الأنف والأذن والحنجرة",
        role_group: "medical",
        role_order: 33,
      },
      {
        role_name_en: "Audiologist",
        role_name_ar: "أخصائي السمعيات",
        role_group: "medical",
        role_order: 34,
      },
      {
        role_name_en: "Pediatric Ophthalmologist",
        role_name_ar: "طبيب عيون الأطفال",
        role_group: "medical",
        role_order: 35,
      },
      {
        role_name_en: "Optometrist / Vision Therapist",
        role_name_ar: "أخصائي البصريات وعلاج الرؤية",
        role_group: "medical",
        role_order: 36,
      },
      {
        role_name_en: "Orthopedic Specialist",
        role_name_ar: "طبيب العظام",
        role_group: "medical",
        role_order: 37,
      },
      {
        role_name_en: "Rehabilitation Physician (PM&R)",
        role_name_ar: "طبيب التأهيل والطب الطبيعي",
        role_group: "medical",
        role_order: 38,
      },
      {
        role_name_en: "Endocrinologist",
        role_name_ar: "طبيب الغدد الصماء",
        role_group: "medical",
        role_order: 39,
      },
      {
        role_name_en: "Pediatric Gastroenterologist",
        role_name_ar: "طبيب الجهاز الهضمي للأطفال",
        role_group: "medical",
        role_order: 40,
      },
      {
        role_name_en: "Sleep Medicine Specialist",
        role_name_ar: "طبيب طب النوم",
        role_group: "medical",
        role_order: 41,
      },
      {
        role_name_en: "Special Needs Dentist",
        role_name_ar: "طبيب أسنان ذوي الاحتياجات الخاصة",
        role_group: "medical",
        role_order: 42,
      },
      {
        role_name_en: "Family Physician",
        role_name_ar: "طبيب الأسرة",
        role_group: "medical",
        role_order: 43,
      },
      {
        role_name_en: "Neuropsychologist",
        role_name_ar: "أخصائي علم النفس العصبي",
        role_group: "medical",
        role_order: 44,
      },
      {
        role_name_en: "Clinical Dietitian",
        role_name_ar: "أخصائي التغذية العلاجية",
        role_group: "medical",
        role_order: 45,
      },
      {
        role_name_en: "Registered Nurse",
        role_name_ar: "ممرض مسجل",
        role_group: "medical",
        role_order: 46,
      },
      {
        role_name_en: "Sports Medicine Physician",
        role_name_ar: "طبيب الطب الرياضي",
        role_group: "medical",
        role_order: 47,
      },
      {
        role_name_en: "Clinical Pharmacist",
        role_name_ar: "صيدلي إكلينيكي",
        role_group: "medical",
        role_order: 48,
      },
      {
        role_name_en: "Measurement & Evaluation Specialist",
        role_name_ar: "أخصائي القياس والتقويم",
        role_group: "education",
        role_order: 49,
      },
      {
        role_name_en: "Arabic Language Specialist",
        role_name_ar: "أخصائي اللغة العربية",
        role_group: "education",
        role_order: 50,
      },
      {
        role_name_en: "English / TESOL Specialist",
        role_name_ar: "أخصائي اللغة الإنجليزية وتعليمها لغير الناطقين بها",
        role_group: "education",
        role_order: 51,
      },
      {
        role_name_en: "Math Specialist",
        role_name_ar: "أخصائي الرياضيات",
        role_group: "education",
        role_order: 52,
      },
      {
        role_name_en: "Chemistry Specialist",
        role_name_ar: "أخصائي الكيمياء",
        role_group: "education",
        role_order: 53,
      },
      {
        role_name_en: "Physics Specialist",
        role_name_ar: "أخصائي الفيزياء",
        role_group: "education",
        role_order: 54,
      },
      {
        role_name_en: "Biology Specialist",
        role_name_ar: "أخصائي الأحياء",
        role_group: "education",
        role_order: 55,
      },
      {
        role_name_en: "Earth Sciences Specialist",
        role_name_ar: "أخصائي علوم الأرض",
        role_group: "education",
        role_order: 56,
      },
      {
        role_name_en: "Ed-Tech & AI Trainer",
        role_name_ar: "مدرب تقنيات التعليم والذكاء الاصطناعي",
        role_group: "education",
        role_order: 57,
      },
      {
        role_name_en: "Programming Instructor",
        role_name_ar: "مدرب البرمجة",
        role_group: "education",
        role_order: 58,
      },
      {
        role_name_en: "Research Methodologist",
        role_name_ar: "أخصائي منهجية البحث",
        role_group: "education",
        role_order: 59,
      },
      {
        role_name_en: "Statistician",
        role_name_ar: "أخصائي الإحصاء",
        role_group: "education",
        role_order: 60,
      },
      {
        role_name_en: "Academic Writing Coach",
        role_name_ar: "مدرب الكتابة الأكاديمية",
        role_group: "education",
        role_order: 61,
      },
      {
        role_name_en: "Economist",
        role_name_ar: "أخصائي الاقتصاد",
        role_group: "education",
        role_order: 62,
      },
      {
        role_name_en: "Accountant",
        role_name_ar: "محاسب",
        role_group: "education",
        role_order: 63,
      },
      {
        role_name_en: "Marketing Trainer",
        role_name_ar: "مدرب التسويق",
        role_group: "education",
        role_order: 64,
      },
      {
        role_name_en: "Sports & Exercise Trainer",
        role_name_ar: "مدرب الرياضة والتمارين",
        role_group: "education",
        role_order: 65,
      },
      {
        role_name_en: "Critical Thinking Trainer",
        role_name_ar: "مدرب التفكير الناقد",
        role_group: "education",
        role_order: 66,
      },
      {
        role_name_en: "Innovation Coach",
        role_name_ar: "مدرب الابتكار",
        role_group: "education",
        role_order: 67,
      },
      {
        role_name_en: "Entrepreneurship Mentor",
        role_name_ar: "مرشد ريادة الأعمال",
        role_group: "education",
        role_order: 68,
      },
      {
        role_name_en: "IP / Patent Advisor",
        role_name_ar: "مستشار الملكية الفكرية وبراءات الاختراع",
        role_group: "education",
        role_order: 69,
      },
      {
        role_name_en: "Executive / Leadership Coach",
        role_name_ar: "مدرب تنفيذي وقيادي",
        role_group: "leadership",
        role_order: 70,
      },
      {
        role_name_en: "Career Coach",
        role_name_ar: "مدرب التطوير المهني",
        role_group: "leadership",
        role_order: 71,
      },
      {
        role_name_en: "Business Setup Consultant",
        role_name_ar: "مستشار تأسيس الأعمال",
        role_group: "leadership",
        role_order: 72,
      },
      {
        role_name_en: "Legal Advisor",
        role_name_ar: "مستشار قانوني",
        role_group: "leadership",
        role_order: 73,
      },
      {
        role_name_en: "Financial Analyst",
        role_name_ar: "محلل مالي",
        role_group: "leadership",
        role_order: 74,
      },
      {
        role_name_en: "OD Consultant",
        role_name_ar: "مستشار التطوير التنظيمي",
        role_group: "leadership",
        role_order: 75,
      },
      {
        role_name_en: "Change Management Specialist",
        role_name_ar: "أخصائي إدارة التغيير",
        role_group: "leadership",
        role_order: 76,
      },
      {
        role_name_en: "Strategic Planning Consultant",
        role_name_ar: "مستشار التخطيط الاستراتيجي",
        role_group: "leadership",
        role_order: 77,
      },
      {
        role_name_en: "KPI / Performance Specialist",
        role_name_ar: "أخصائي مؤشرات الأداء وقياس الأداء",
        role_group: "leadership",
        role_order: 78,
      },
      {
        role_name_en: "Organizational Design Consultant",
        role_name_ar: "مستشار التصميم التنظيمي",
        role_group: "leadership",
        role_order: 79,
      },
      {
        role_name_en: "HR Consultant",
        role_name_ar: "مستشار الموارد البشرية",
        role_group: "leadership",
        role_order: 80,
      },
      {
        role_name_en: "Business Process Analyst",
        role_name_ar: "محلل العمليات التجارية",
        role_group: "leadership",
        role_order: 81,
      },
      {
        role_name_en: "Employee Wellbeing Specialist",
        role_name_ar: "أخصائي رفاه الموظفين",
        role_group: "leadership",
        role_order: 82,
      },
      {
        role_name_en: "Quality & Accreditation Specialist",
        role_name_ar: "أخصائي الجودة والاعتماد",
        role_group: "leadership",
        role_order: 83,
      },
      {
        role_name_en: "ISO Lead Auditor",
        role_name_ar: "مدقق رئيسي لنظم الأيزو",
        role_group: "leadership",
        role_order: 84,
      },
      {
        role_name_en: "Rankings Analyst",
        role_name_ar: "محلل التصنيفات",
        role_group: "leadership",
        role_order: 85,
      },
      {
        role_name_en: "Bibliometrics Specialist",
        role_name_ar: "أخصائي القياسات الببليومترية",
        role_group: "leadership",
        role_order: 86,
      },
      {
        role_name_en: "Excellence Model Assessor",
        role_name_ar: "مقيّم نماذج التميز",
        role_group: "leadership",
        role_order: 87,
      },
      {
        role_name_en: "Governance & Sustainability Consultant",
        role_name_ar: "مستشار الحوكمة والاستدامة",
        role_group: "leadership",
        role_order: 88,
      },
    ]
    const existing = app.findRecordsByFilter("roles_management", "", "", 0, 0)
    // Retain old roles and tool permissions so existing allocations remain valid.
    for (const record of existing) {
      if (
        !catalog.some(
          (role) => role.role_name_en === record.getString("role_name_en")
        )
      ) {
        record.set("is_retired", true)
        app.save(record)
      }
    }
    for (const role of catalog) {
      const record =
        existing.find(
          (r) => r.getString("role_name_en") === role.role_name_en
        ) || new Record(collection)
      record.set("role_name_en", role.role_name_en)
      record.set("role_name_ar", role.role_name_ar)
      record.set("role_group", role.role_group)
      record.set("role_order", role.role_order)
      record.set("is_retired", false)
      app.save(record)
    }
  },
  (app) => {
    // Do not delete role records: cases may already reference them.
    const collection = app.findCollectionByNameOrId("roles_management")
    collection.fields.removeByName("role_group")
    collection.fields.removeByName("role_order")
    collection.fields.removeByName("is_retired")
    app.save(collection)
  }
)
