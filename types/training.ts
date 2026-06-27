export interface BilingualString {
  en: string
  ar: string
}

export type ProgramStatus =
  | "draft"
  | "published"
  | "in_progress"
  | "completed"
  | "cancelled"

export type ProgramType = "online" | "in_person" | "hybrid"

export type SessionType = "workshop" | "seminar" | "webinar"

export type RegistrationStatus =
  | "registered"
  | "attended"
  | "completed"
  | "cancelled"

export interface TrainerInfo {
  name: BilingualString
  role: BilingualString
}

export interface SessionSchedule {
  date: string
  timeFrom: string
  timeTo: string
  location: string
  topic?: BilingualString
}

export interface ProgramSchedule {
  startDate: string
  endDate: string
  sessions: SessionSchedule[]
}

export interface TrainingProgram {
  id: string
  title: BilingualString
  description: BilingualString
  category: BilingualString
  trainer: TrainerInfo
  coordinator: string
  type: ProgramType
  location: string
  duration: number
  goals?: BilingualString
  notes?: string
  schedule: ProgramSchedule
  maxParticipants?: number
  currentRegistrations: number
  thumbnail?: string
  status: ProgramStatus
  created: string
  updated: string
}

export interface AwarenessSession {
  id: string
  title: BilingualString
  description: BilingualString
  category: BilingualString
  targetAudience: BilingualString
  speaker: TrainerInfo
  coordinator: string
  type: SessionType
  location: string
  date: string
  timeFrom: string
  timeTo: string
  goals?: BilingualString
  notes?: string
  maxParticipants?: number
  currentRegistrations: number
  thumbnail?: string
  status: ProgramStatus
  created: string
  updated: string
}

export interface TrainingRegistration {
  id: string
  programId?: string
  sessionId?: string
  userId: string
  userName: string
  email: string
  phone?: string
  registeredAt: string
  status: RegistrationStatus
  certificateId?: string
}

export interface TrainingCertificate {
  id: string
  userId: string
  userName: string
  programId: string
  programName: BilingualString
  issueDate: string
  certificateNumber: string
  downloadUrl?: string
}

export interface TrainingStats {
  totalTrained: number
  programsCompleted: number
  certificatesIssued: number
  attendanceRate: number
}

export type CreateProgramInput = Omit<
  TrainingProgram,
  "id" | "created" | "updated" | "currentRegistrations" | "thumbnail"
> & { thumbnail?: string | File }

export type UpdateProgramInput = Partial<CreateProgramInput>

export type CreateSessionInput = Omit<
  AwarenessSession,
  "id" | "created" | "updated" | "currentRegistrations" | "thumbnail"
> & { thumbnail?: string | File }

export type UpdateSessionInput = Partial<CreateSessionInput>

export type CreateRegistrationInput = Omit<
  TrainingRegistration,
  "id" | "certificateId"
>

export type UpdateRegistrationInput = Partial<CreateRegistrationInput>
