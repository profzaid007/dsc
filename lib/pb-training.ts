import type {
  TrainingProgram,
  AwarenessSession,
  TrainingRegistration,
  TrainingCertificate,
  CreateProgramInput,
  UpdateProgramInput,
  CreateSessionInput,
  UpdateSessionInput,
  CreateRegistrationInput,
} from "@/types/training"

const PROGRAMS_COLLECTION = "training_programs"
const SESSIONS_COLLECTION = "awareness_sessions"
const REGISTRATIONS_COLLECTION = "training_registrations"
const CERTIFICATES_COLLECTION = "training_certificates"

// ---------------------------------------------------------------------------
// Mock data for development (replace with real PocketBase calls later)
// ---------------------------------------------------------------------------

const mockPrograms: TrainingProgram[] = [
  {
    id: "prog-1",
    title: { en: "Leadership Fundamentals", ar: "أساسيات القيادة" },
    description: {
      en: "A comprehensive program designed to develop essential leadership skills for emerging leaders. Learn effective communication, decision-making, and team management strategies.",
      ar: "برنامج شامل مصمم لتطوير مهارات القيادة الأساسية للقادة الناشئين. تعلم استراتيجيات التواصل الفعال واتخاذ القرار وإدارة الفريق.",
    },
    category: { en: "Leadership", ar: "القيادة" },
    trainer: {
      name: { en: "Dr. Sarah Johnson", ar: "د. سارة جونسون" },
      role: { en: "Leadership Coach", ar: "مدربة قيادة" },
    },
    coordinator: "Ahmed Al-Rashid",
    type: "in_person",
    location: "Training Room A",
    duration: 5,
    goals: {
      en: "Develop leadership skills, improve team management, enhance decision-making",
      ar: "تطوير مهارات القيادة، تحسين إدارة الفريق، تعزيز اتخاذ القرار",
    },
    schedule: {
      startDate: "2025-07-01",
      endDate: "2025-07-05",
      sessions: [
        { date: "2025-07-01", timeFrom: "09:00", timeTo: "16:00", location: "Training Room A" },
        { date: "2025-07-02", timeFrom: "09:00", timeTo: "16:00", location: "Training Room A" },
        { date: "2025-07-03", timeFrom: "09:00", timeTo: "16:00", location: "Training Room B" },
        { date: "2025-07-04", timeFrom: "09:00", timeTo: "16:00", location: "Training Room A" },
        { date: "2025-07-05", timeFrom: "09:00", timeTo: "14:00", location: "Conference Hall" },
      ],
    },
    maxParticipants: 25,
    currentRegistrations: 18,
    status: "published",
    created: "2025-01-15T10:00:00Z",
    updated: "2025-01-15T10:00:00Z",
  },
  {
    id: "prog-2",
    title: { en: "Data Analysis Workshop", ar: "ورشة تحليل البيانات" },
    description: {
      en: "Master the art of data analysis using modern tools and techniques. This hands-on workshop covers statistical analysis, data visualization, and reporting.",
      ar: "أتقن فن تحليل البيانات باستخدام الأدوات والتقنيات الحديثة. تغطي هذه الورشة العملية التحليل الإحصائي وتصور البيانات والتقارير.",
    },
    category: { en: "Technical", ar: "تقني" },
    trainer: {
      name: { en: "Mark Chen", ar: "مارك تشن" },
      role: { en: "Data Scientist", ar: "عالم بيانات" },
    },
    coordinator: "Fatima Hassan",
    type: "online",
    location: "Virtual",
    duration: 3,
    goals: {
      en: "Learn data analysis tools, statistical methods, data visualization",
      ar: "تعلم أدوات تحليل البيانات، الطرق الإحصائية، تصور البيانات",
    },
    schedule: {
      startDate: "2025-07-15",
      endDate: "2025-07-17",
      sessions: [
        { date: "2025-07-15", timeFrom: "10:00", timeTo: "13:00", location: "Virtual" },
        { date: "2025-07-16", timeFrom: "10:00", timeTo: "13:00", location: "Virtual" },
        { date: "2025-07-17", timeFrom: "10:00", timeTo: "13:00", location: "Virtual" },
      ],
    },
    maxParticipants: 30,
    currentRegistrations: 22,
    status: "published",
    created: "2025-01-20T10:00:00Z",
    updated: "2025-01-20T10:00:00Z",
  },
  {
    id: "prog-3",
    title: { en: "Effective Communication", ar: "التواصل الفعال" },
    description: {
      en: "Enhance your communication skills for better professional and personal relationships. Learn presentation skills, active listening, and persuasive communication.",
      ar: "طور مهاراتك في التواصل لعلاقات مهنية وشخصية أفضل. تعلم مهارات العرض والإصغاء النشط والتواصل المقنع.",
    },
    category: { en: "Soft Skills", ar: "مهارات شخصية" },
    trainer: {
      name: { en: "Lisa Moore", ar: "ليسا مور" },
      role: { en: "Communication Expert", ar: "خبيرة تواصل" },
    },
    coordinator: "Omar Khalil",
    type: "hybrid",
    location: "Conference Hall",
    duration: 2,
    goals: {
      en: "Improve presentation skills, active listening, persuasive communication",
      ar: "تحسين مهارات العرض، الإصغاء النشط، التواصل المقنع",
    },
    schedule: {
      startDate: "2025-08-01",
      endDate: "2025-08-02",
      sessions: [
        { date: "2025-08-01", timeFrom: "14:00", timeTo: "17:00", location: "Conference Hall" },
        { date: "2025-08-02", timeFrom: "14:00", timeTo: "17:00", location: "Conference Hall" },
      ],
    },
    maxParticipants: 20,
    currentRegistrations: 15,
    status: "published",
    created: "2025-02-01T10:00:00Z",
    updated: "2025-02-01T10:00:00Z",
  },
  {
    id: "prog-4",
    title: { en: "Safety Compliance Training", ar: "تدريب الامتثال للسلامة" },
    description: {
      en: "Essential safety training for all staff members. Learn workplace safety regulations, emergency procedures, and risk assessment.",
      ar: "تدريب سلامة أساسي لجميع أعضاء الموظفين. تعلم لوائح سلامة مكان العمل وإجراءات الطوارئ وتقييم المخاطر.",
    },
    category: { en: "Compliance", ar: "الامتثال" },
    trainer: {
      name: { en: "James Wilson", ar: "جيمس ويلسون" },
      role: { en: "Safety Officer", ar: "مسؤول السلامة" },
    },
    coordinator: "Sara Ahmed",
    type: "in_person",
    location: "Main Office",
    duration: 1,
    goals: {
      en: "Understand safety regulations, emergency procedures, risk assessment",
      ar: "فهم لوائح السلامة، إجراءات الطوارئ، تقييم المخاطر",
    },
    schedule: {
      startDate: "2025-06-15",
      endDate: "2025-06-15",
      sessions: [
        { date: "2025-06-15", timeFrom: "09:00", timeTo: "16:00", location: "Main Office" },
      ],
    },
    maxParticipants: 50,
    currentRegistrations: 35,
    status: "completed",
    created: "2025-01-10T10:00:00Z",
    updated: "2025-01-10T10:00:00Z",
  },
]

const mockSessions: AwarenessSession[] = [
  {
    id: "sess-1",
    title: { en: "New Employee Orientation", ar: "توجيه الموظفين الجدد" },
    description: {
      en: "Welcome session for all new employees to familiarize them with company policies, culture, and procedures.",
      ar: "جلسة ترحيبية لجميع الموظفين الجدد للتعرف على سياسات الشركة وثقافتها وإجراءاتها.",
    },
    category: { en: "Orientation", ar: "توجيه" },
    targetAudience: { en: "New Hires", ar: "موظفون جدد" },
    speaker: {
      name: { en: "HR Director", ar: "مدير الموارد البشرية" },
      role: { en: "HR Lead", ar: "رئيس الموارد البشرية" },
    },
    coordinator: "Maya Sami",
    type: "seminar",
    location: "Main Conference Room",
    date: "2025-07-10",
    timeFrom: "09:00",
    timeTo: "12:00",
    maxParticipants: 40,
    currentRegistrations: 28,
    status: "published",
    created: "2025-06-01T10:00:00Z",
    updated: "2025-06-01T10:00:00Z",
  },
  {
    id: "sess-2",
    title: { en: "Workplace Safety Awareness", ar: "التوعية بسلامة مكان العمل" },
    description: {
      en: "Interactive session on maintaining a safe work environment, identifying hazards, and emergency response protocols.",
      ar: "جلسة تفاعلية حول الحفاظ على بيئة عمل آمنة وتحديد المخاطر وبروتوكولات الاستجابة للطوارئ.",
    },
    category: { en: "Safety", ar: "السلامة" },
    targetAudience: { en: "All Staff", ar: "جميع الموظفين" },
    speaker: {
      name: { en: "Safety Officer", ar: "مسؤول السلامة" },
      role: { en: "Safety Expert", ar: "خبير سلامة" },
    },
    coordinator: "Khaled Mansour",
    type: "workshop",
    location: "Training Room A",
    date: "2025-07-20",
    timeFrom: "14:00",
    timeTo: "16:00",
    maxParticipants: 30,
    currentRegistrations: 22,
    status: "published",
    created: "2025-06-05T10:00:00Z",
    updated: "2025-06-05T10:00:00Z",
  },
  {
    id: "sess-3",
    title: { en: "Cybersecurity Best Practices", ar: "أفضل ممارسات الأمن السيبراني" },
    description: {
      en: "Learn essential cybersecurity practices to protect company data and systems from digital threats.",
      ar: "تعلم ممارسات الأمن السيبراني الأساسية لحماية بيانات وأنظمة الشركة من التهديدات الرقمية.",
    },
    category: { en: "Security", ar: "الأمن" },
    targetAudience: { en: "Managers", ar: "المديرين" },
    speaker: {
      name: { en: "IT Manager", ar: "مدير تكنولوجيا المعلومات" },
      role: { en: "IT Security Lead", ar: "رئيس أمن المعلومات" },
    },
    coordinator: "Rana Ali",
    type: "webinar",
    location: "Virtual",
    date: "2025-07-25",
    timeFrom: "10:00",
    timeTo: "11:30",
    maxParticipants: 50,
    currentRegistrations: 35,
    status: "published",
    created: "2025-06-10T10:00:00Z",
    updated: "2025-06-10T10:00:00Z",
  },
]

const mockRegistrations: TrainingRegistration[] = [
  {
    id: "reg-1",
    programId: "prog-1",
    userId: "user-1",
    userName: "Youssef Ahmed",
    email: "youssef@example.com",
    registeredAt: "2025-04-10T10:00:00Z",
    status: "completed",
    certificateId: "cert-1",
  },
  {
    id: "reg-2",
    programId: "prog-2",
    userId: "user-2",
    userName: "Leila Salem",
    email: "leila@example.com",
    registeredAt: "2025-04-12T10:00:00Z",
    status: "registered",
  },
]

const mockCertificates: TrainingCertificate[] = [
  {
    id: "cert-1",
    userId: "user-1",
    userName: "Youssef Ahmed",
    programId: "prog-1",
    programName: { en: "Leadership Fundamentals", ar: "أساسيات القيادة" },
    issueDate: "2025-07-05",
    certificateNumber: "CERT-TR-001234",
    downloadUrl: "#",
  },
  {
    id: "cert-2",
    userId: "user-1",
    userName: "Youssef Ahmed",
    programId: "prog-4",
    programName: { en: "Safety Compliance Training", ar: "تدريب الامتثال للسلامة" },
    issueDate: "2025-06-15",
    certificateNumber: "CERT-TR-001235",
    downloadUrl: "#",
  },
]

// ---------------------------------------------------------------------------
// Programs
// ---------------------------------------------------------------------------

export const trainingProgramsCollection = {
  async getAll(): Promise<TrainingProgram[]> {
    return mockPrograms
  },

  async getPublished(): Promise<TrainingProgram[]> {
    return mockPrograms.filter((p) => p.status === "published" || p.status === "in_progress")
  },

  async getById(id: string): Promise<TrainingProgram | undefined> {
    return mockPrograms.find((p) => p.id === id)
  },

  async create(_data: CreateProgramInput): Promise<TrainingProgram> {
    throw new Error("Not implemented - PocketBase collection not created yet")
  },

  async update(_id: string, _data: UpdateProgramInput): Promise<TrainingProgram> {
    throw new Error("Not implemented - PocketBase collection not created yet")
  },

  async delete(_id: string): Promise<void> {
    throw new Error("Not implemented - PocketBase collection not created yet")
  },
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export const trainingSessionsCollection = {
  async getAll(): Promise<AwarenessSession[]> {
    return mockSessions
  },

  async getPublished(): Promise<AwarenessSession[]> {
    return mockSessions.filter((s) => s.status === "published")
  },

  async getById(id: string): Promise<AwarenessSession | undefined> {
    return mockSessions.find((s) => s.id === id)
  },

  async create(_data: CreateSessionInput): Promise<AwarenessSession> {
    throw new Error("Not implemented - PocketBase collection not created yet")
  },

  async update(_id: string, _data: UpdateSessionInput): Promise<AwarenessSession> {
    throw new Error("Not implemented - PocketBase collection not created yet")
  },

  async delete(_id: string): Promise<void> {
    throw new Error("Not implemented - PocketBase collection not created yet")
  },
}

// ---------------------------------------------------------------------------
// Registrations
// ---------------------------------------------------------------------------

export const trainingRegistrationsCollection = {
  async getAll(): Promise<TrainingRegistration[]> {
    return mockRegistrations
  },

  async getByProgram(programId: string): Promise<TrainingRegistration[]> {
    return mockRegistrations.filter((r) => r.programId === programId)
  },

  async getBySession(sessionId: string): Promise<TrainingRegistration[]> {
    return mockRegistrations.filter((r) => r.sessionId === sessionId)
  },

  async getByUser(userId: string): Promise<TrainingRegistration[]> {
    return mockRegistrations.filter((r) => r.userId === userId)
  },

  async getUserRegistration(
    programId: string | undefined,
    sessionId: string | undefined,
    userId: string
  ): Promise<TrainingRegistration | undefined> {
    return mockRegistrations.find(
      (r) =>
        r.userId === userId &&
        (programId ? r.programId === programId : r.sessionId === sessionId)
    )
  },

  async create(_data: CreateRegistrationInput): Promise<TrainingRegistration> {
    throw new Error("Not implemented - PocketBase collection not created yet")
  },

  async update(
    _id: string,
    _data: Partial<TrainingRegistration>
  ): Promise<TrainingRegistration> {
    throw new Error("Not implemented - PocketBase collection not created yet")
  },

  async delete(_id: string): Promise<void> {
    throw new Error("Not implemented - PocketBase collection not created yet")
  },
}

// ---------------------------------------------------------------------------
// Certificates
// ---------------------------------------------------------------------------

export const trainingCertificatesCollection = {
  async getAll(): Promise<TrainingCertificate[]> {
    return mockCertificates
  },

  async getByUser(userId: string): Promise<TrainingCertificate[]> {
    return mockCertificates.filter((c) => c.userId === userId)
  },

  async getById(id: string): Promise<TrainingCertificate | undefined> {
    return mockCertificates.find((c) => c.id === id)
  },
}
